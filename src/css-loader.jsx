// ===== css-loader.js =====

(function() {
  // Load non-critical CSS after page load
  function loadNonCriticalCSS() {
    const cssFiles = [
      'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap',
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css',
      'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
      'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css',
      '/css/theme.css'  // Your main CSS file
    ];
    
    cssFiles.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.media = 'print';
      link.onload = () => { link.media = 'all'; };
      document.head.appendChild(link);
    });
  }

  // Load after page is interactive
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNonCriticalCSS);
  } else {
    loadNonCriticalCSS();
  }

  // Load critical CSS inline
  fetch('/css/critical.css')
    .then(response => response.text())
    .then(css => {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.insertBefore(style, document.head.firstChild);
    });
})();