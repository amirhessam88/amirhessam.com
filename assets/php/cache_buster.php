<?php
/**
 * Cache Buster Utility
 * Generates cache-busted URLs for static assets
 */

class CacheBuster {
    private static $version = null;
    
    /**
     * Get the current version for cache busting
     * Uses file modification time as version
     */
    public static function getVersion() {
        if (self::$version === null) {
            // Use the modification time of this file as version
            self::$version = filemtime(__FILE__);
        }
        return self::$version;
    }
    
    /**
     * Generate a cache-busted URL for an asset
     * @param string $path The asset path
     * @return string Cache-busted URL
     */
    public static function url($path) {
        $version = self::getVersion();
        $separator = strpos($path, '?') !== false ? '&' : '?';
        return $path . $separator . 'v=' . $version;
    }
    
    /**
     * Generate cache-busted URLs for multiple assets
     * @param array $paths Array of asset paths
     * @return array Array of cache-busted URLs
     */
    public static function urls($paths) {
        return array_map([self::class, 'url'], $paths);
    }
    
    /**
     * Set cache control headers to prevent caching
     */
    public static function setNoCacheHeaders() {
        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');
        header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
        header('ETag: "' . self::getVersion() . '"');
    }
    
    /**
     * Generate a unique version based on multiple files
     * @param array $files Array of file paths to check
     * @return string Combined version hash
     */
    public static function getFileVersion($files) {
        $times = [];
        foreach ($files as $file) {
            if (file_exists($file)) {
                $times[] = filemtime($file);
            }
        }
        return md5(implode('|', $times));
    }
}

// If this file is accessed directly, set no-cache headers
if (basename($_SERVER['PHP_SELF']) === 'cache_buster.php') {
    CacheBuster::setNoCacheHeaders();
    echo json_encode([
        'version' => CacheBuster::getVersion(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>
