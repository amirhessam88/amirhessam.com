<?php
header('Content-Type: application/json');

// Prevent caching
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Function to fetch a page with cURL
function fetchPage($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $html = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return ['html' => $html, 'http_code' => $http_code];
}

// Google Scholar profile URL
$scholar_url = 'https://scholar.google.com/citations?user=CnHZjFAAAAAJ&hl=en';

// Fetch the first page
$result = fetchPage($scholar_url);
$html = $result['html'];
$http_code = $result['http_code'];

if ($http_code !== 200 || !$html) {
    // If we can't fetch from Google Scholar, try to load from stats.json as fallback
    $stats_file = 'assets/data/stats.json';
    
    if (file_exists($stats_file)) {
        $stats_data = json_decode(file_get_contents($stats_file), true);
        if ($stats_data) {
            echo json_encode([
                'citations' => $stats_data['citations'] ?? 1457,
                'papers' => $stats_data['papers'] ?? 93,
                'hindex' => $stats_data['hindex'] ?? 18,
                'cached' => true,
                'error' => 'Google Scholar fetch failed, using cached data'
            ]);
            exit;
        }
    }
    
    // Final fallback to default values
    echo json_encode([
        'citations' => 1457,
        'papers' => 93,
        'hindex' => 18,
        'cached' => true,
        'error' => 'All data sources failed, using default values'
    ]);
    exit;
}

// Parse the HTML to extract citation count and research papers count
// Look for the citation count in the HTML
$pattern = '/<td class="gsc_rsb_std">(\d+(?:,\d+)*)<\/td>/';
preg_match_all($pattern, $html, $matches);

$citations = 0;
$papers = 0;
$hindex = 0;

if (!empty($matches[1])) {
    // The first match is usually the total citations
    $citations = intval(str_replace(',', '', $matches[1][0]));
    // The third match is usually the H-Index (based on debug output)
    if (count($matches[1]) > 2) {
        $hindex = intval(str_replace(',', '', $matches[1][2]));
    }
}

// Alternative patterns for citations if the first one doesn't work
if ($citations === 0) {
    $pattern2 = '/Citations\s*(\d+(?:,\d+)*)/i';
    preg_match($pattern2, $html, $matches2);
    if (!empty($matches2[1])) {
        $citations = intval(str_replace(',', '', $matches2[1]));
    }
}

// H-Index should already be set from the main pattern above
// Only try alternative patterns if H-Index is still 0
if ($hindex === 0) {
    // Look for H-Index specifically in the statistics table
    if (preg_match('/<div[^>]*class="gsc_rsb_st"[^>]*>(.*?)<\/div>/s', $html, $stats_match)) {
        $stats_html = $stats_match[1];
        
        // Look for H-index in the stats section
        if (preg_match('/H-index.*?(\d+(?:,\d+)*)/i', $stats_html, $hindex_matches)) {
            $hindex = intval(str_replace(',', '', $hindex_matches[1]));
        }
    }
}

// Count papers across all pages with pagination
$papers = 0;
$current_start = 0;
$page_size = 20;
$all_html = $html; // Store all HTML content

// Count papers on the first page
$papers += preg_match_all('/<tr[^>]*class="gsc_a_tr"[^>]*>/', $html, $paper_matches);

// Try to paginate through all pages
$max_pages = 10; // Safety limit
$page = 0;

while ($page < $max_pages) {
    $page++;
    $next_start = $page * $page_size;
    
    // Construct URL for next page
    $next_url = $scholar_url . '&cstart=' . $next_start . '&pagesize=' . $page_size;
    
    // Fetch next page
    $next_result = fetchPage($next_url);
    
    if ($next_result['http_code'] === 200 && $next_result['html']) {
        $next_html = $next_result['html'];
        
        // Count papers on this page
        $page_papers = preg_match_all('/<tr[^>]*class="gsc_a_tr"[^>]*>/', $next_html, $page_matches);
        $papers += $page_papers;
        
        // If we got less than 20 papers, we've reached the last page
        if ($page_papers < $page_size) {
            break;
        }
        
        // Also check if the page is empty or contains no publication data
        if ($page_papers === 0) {
            // Check if there's any indication of more content
            if (strpos($next_html, 'gsc_a_tr') === false) {
                break;
            }
        }
    } else {
        break;
    }
}

// If no papers found with the main pattern, try alternative patterns
if ($papers === 0) {
    $papers = preg_match_all('/<tr[^>]*class="gsc_a_tr"[^>]*>.*?<\/tr>/s', $all_html, $paper_matches);
}

if ($papers === 0) {
    $papers = preg_match_all('/<div[^>]*class="gsc_a_t"[^>]*>/', $all_html, $paper_matches);
}

if ($papers === 0) {
    $papers = preg_match_all('/<a[^>]*class="gsc_a_at"[^>]*>/', $all_html, $paper_matches);
}

// Update the citations file with the new count
$citations_file = 'assets/data/citations.txt';
file_put_contents($citations_file, $citations);

// Update the papers file with the new count
$papers_file = 'assets/data/papers.txt';
file_put_contents($papers_file, $papers);

// Update the hindex file with the new count
$hindex_file = 'assets/data/hindex.txt';
file_put_contents($hindex_file, $hindex);

// Return all counts
echo json_encode(['citations' => $citations, 'papers' => $papers, 'hindex' => $hindex, 'cached' => false]);
?>
