<?php
// Script to update statistics and generate static JSON file
// This can be run via cron job or manually

// Include the fetch_citations.php logic
$scholar_url = 'https://scholar.google.com/citations?user=CnHZjFAAAAAJ&hl=en';

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

// Fetch the first page
$result = fetchPage($scholar_url);
$html = $result['html'];
$http_code = $result['http_code'];

$citations = 0;
$papers = 0;
$hindex = 0;

if ($http_code === 200 && $html) {
    // Parse the HTML to extract citation count and research papers count
    $pattern = '/<td class="gsc_rsb_std">(\d+(?:,\d+)*)<\/td>/';
    preg_match_all($pattern, $html, $matches);

    if (!empty($matches[1])) {
        // The first match is usually the total citations
        $citations = intval(str_replace(',', '', $matches[1][0]));
        // The third match is usually the H-Index
        if (count($matches[1]) > 2) {
            $hindex = intval(str_replace(',', '', $matches[1][2]));
        }
    }

    // Count papers across all pages with pagination
    $current_start = 0;
    $page_size = 20;
    $all_html = $html;

    // Count papers on the first page
    $papers += preg_match_all('/<tr[^>]*class="gsc_a_tr"[^>]*>/', $html, $paper_matches);

    // Try to paginate through all pages
    $max_pages = 10;
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
        } else {
            break;
        }
    }
}

// Create the data directory if it doesn't exist
if (!is_dir('assets/data')) {
    mkdir('assets/data', 0755, true);
}

// Note: Individual .txt files are no longer needed since we use stats.json

// Create a JSON file with all the data
$stats_data = [
    'citations' => $citations,
    'papers' => $papers,
    'hindex' => $hindex,
    'last_updated' => date('Y-m-d H:i:s'),
    'cached' => false
];

file_put_contents('assets/data/stats.json', json_encode($stats_data, JSON_PRETTY_PRINT));

echo "Statistics updated successfully:\n";
echo "Citations: $citations\n";
echo "Papers: $papers\n";
echo "H-Index: $hindex\n";
echo "Last updated: " . date('Y-m-d H:i:s') . "\n";
?>
