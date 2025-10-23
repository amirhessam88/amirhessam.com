<?php
/**
 * Version API endpoint
 * Returns current version information for cache busting
 */

header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Get version based on file modification times
$versionFiles = [
    __DIR__ . '/../img/profile-img.jpg',
    __DIR__ . '/../img/profile-img2.jpg',
    __DIR__ . '/../img/logo_color_clear.png',
    __DIR__ . '/../img/logo_black_clear.png',
    __DIR__ . '/../css/style.css',
    __DIR__ . '/../js/main.js'
];

$version = md5(implode('|', array_map(function($file) {
    return file_exists($file) ? filemtime($file) : 0;
}, $versionFiles)));

echo json_encode([
    'version' => $version,
    'timestamp' => date('Y-m-d H:i:s'),
    'files_checked' => count($versionFiles)
]);
?>
