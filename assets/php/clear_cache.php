<?php
/**
 * Cache Clearing Utility
 * This script helps clear browser cache for the website
 */

// Set no-cache headers
header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
header('ETag: "' . md5(time()) . '"');

// If accessed via GET, redirect to main page with cache busting
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $version = time();
    header("Location: index.html?v=$version");
    exit;
}

// If accessed via POST, return JSON response
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    
    $response = [
        'status' => 'success',
        'message' => 'Cache cleared successfully',
        'timestamp' => date('Y-m-d H:i:s'),
        'version' => time(),
        'files_updated' => []
    ];
    
    // Update version files if they exist
    $versionFile = __DIR__ . '/assets/php/version.php';
    if (file_exists($versionFile)) {
        touch($versionFile);
        $response['files_updated'][] = 'version.php';
    }
    
    echo json_encode($response);
    exit;
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Cache Clear - Amir Hessam</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .success { color: #28a745; }
        .info { color: #17a2b8; }
        button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 10px 5px; }
        button:hover { background: #0056b3; }
        .version { font-family: monospace; background: #f8f9fa; padding: 5px 10px; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="success">✅ Cache Cleared Successfully!</h1>
        <p class="info">Your browser cache has been cleared and you should now see the latest version of the website.</p>
        
        <h3>Cache Information:</h3>
        <ul>
            <li><strong>Timestamp:</strong> <span class="version"><?php echo date('Y-m-d H:i:s'); ?></span></li>
            <li><strong>Version:</strong> <span class="version"><?php echo time(); ?></span></li>
            <li><strong>Status:</strong> <span class="success">Cache Cleared</span></li>
        </ul>
        
        <h3>Next Steps:</h3>
        <ol>
            <li>Close all browser tabs for this website</li>
            <li>Clear your browser cache manually (Ctrl+Shift+Delete)</li>
            <li>Return to the main website</li>
        </ol>
        
        <button onclick="window.location.href='index.html?v=<?php echo time(); ?>'">
            🏠 Go to Main Website
        </button>
        
        <button onclick="location.reload(true)">
            🔄 Force Refresh This Page
        </button>
        
        <h3>Manual Cache Clearing:</h3>
        <p><strong>Chrome/Edge:</strong> Ctrl+Shift+Delete → Clear browsing data</p>
        <p><strong>Firefox:</strong> Ctrl+Shift+Delete → Clear recent history</p>
        <p><strong>Safari:</strong> Cmd+Option+E → Empty caches</p>
    </div>
</body>
</html>
