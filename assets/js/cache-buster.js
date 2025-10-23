/**
 * Cache Buster Utility for Client-Side
 * Handles cache busting for images and assets
 */

class CacheBuster {
    constructor() {
        this.version = this.getVersion();
        this.cache = new Map();
    }

    /**
     * Get current version for cache busting
     * Uses timestamp or version from server
     */
    getVersion() {
        // Try to get version from server first
        if (window.CACHE_VERSION) {
            return window.CACHE_VERSION;
        }

        // Fallback to current timestamp
        return Date.now();
    }

    /**
     * Generate cache-busted URL
     * @param {string} url - Original URL
     * @param {boolean} force - Force cache bust even if cached
     * @returns {string} Cache-busted URL
     */
    bust(url, force = false) {
        if (!force && this.cache.has(url)) {
            return this.cache.get(url);
        }

        const separator = url.includes('?') ? '&' : '?';
        const bustedUrl = `${url}${separator}v=${this.version}&t=${Date.now()}`;

        this.cache.set(url, bustedUrl);
        return bustedUrl;
    }

    /**
     * Load image with cache busting
     * @param {string} src - Image source URL
     * @param {Function} onLoad - Success callback
     * @param {Function} onError - Error callback
     * @returns {HTMLImageElement} Image element
     */
    loadImage(src, onLoad = null, onError = null) {
        const img = new Image();
        const bustedSrc = this.bust(src);

        img.onload = () => {
            if (onLoad) onLoad(img, bustedSrc);
        };

        img.onerror = () => {
            if (onError) onError(img, bustedSrc);
        };

        img.src = bustedSrc;
        return img;
    }

    /**
     * Update all images on the page with cache busting
     * @param {string} selector - CSS selector for images (default: 'img')
     */
    updateImages(selector = 'img') {
        const images = document.querySelectorAll(selector);
        images.forEach(img => {
            if (img.src && !img.src.includes('v=')) {
                img.src = this.bust(img.src);
            }
        });
    }

    /**
     * Update background images with cache busting
     * @param {string} selector - CSS selector for elements with background images
     */
    updateBackgroundImages(selector = '[style*="background-image"]') {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            const style = el.style.backgroundImage;
            if (style && style.includes('url(') && !style.includes('v=')) {
                const urlMatch = style.match(/url\(['"]?([^'"]+)['"]?\)/);
                if (urlMatch) {
                    const originalUrl = urlMatch[1];
                    const bustedUrl = this.bust(originalUrl);
                    el.style.backgroundImage = style.replace(originalUrl, bustedUrl);
                }
            }
        });
    }

    /**
     * Force refresh all assets
     */
    forceRefresh() {
        this.version = Date.now();
        this.cache.clear();
        this.updateImages();
        this.updateBackgroundImages();
    }

    /**
     * Get cache busted URL for any asset
     * @param {string} url - Original URL
     * @returns {string} Cache-busted URL
     */
    getBustedUrl(url) {
        return this.bust(url);
    }
}

// Create global instance
window.cacheBuster = new CacheBuster();

// Auto-update images on page load
document.addEventListener('DOMContentLoaded', function () {
    // Update all images
    window.cacheBuster.updateImages();

    // Update background images
    window.cacheBuster.updateBackgroundImages();

    // Add cache busting to dynamically loaded content
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType === 1) { // Element node
                        // Update images in new content
                        const images = node.querySelectorAll ? node.querySelectorAll('img') : [];
                        images.forEach(img => {
                            if (img.src && !img.src.includes('v=')) {
                                img.src = window.cacheBuster.bust(img.src);
                            }
                        });

                        // Update background images in new content
                        const bgElements = node.querySelectorAll ? node.querySelectorAll('[style*="background-image"]') : [];
                        bgElements.forEach(el => {
                            const style = el.style.backgroundImage;
                            if (style && style.includes('url(') && !style.includes('v=')) {
                                const urlMatch = style.match(/url\(['"]?([^'"]+)['"]?\)/);
                                if (urlMatch) {
                                    const originalUrl = urlMatch[1];
                                    const bustedUrl = window.cacheBuster.bust(originalUrl);
                                    el.style.backgroundImage = style.replace(originalUrl, bustedUrl);
                                }
                            }
                        });
                    }
                });
            }
        });
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CacheBuster;
}
