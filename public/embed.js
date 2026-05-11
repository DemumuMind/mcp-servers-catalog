(function() {
  'use strict';

  function initEmbeds() {
    const scripts = document.querySelectorAll('script[data-server-id]');
    
    scripts.forEach(function(script) {
      const serverId = script.getAttribute('data-server-id');
      const width = script.getAttribute('data-width') || '100%';
      const height = script.getAttribute('data-height') || '160';
      
      if (!serverId) return;
      
      const iframe = document.createElement('iframe');
      iframe.src = (script.src.split('/embed.js')[0] || '') + '/api/embed?id=' + serverId;
      iframe.width = width;
      iframe.height = height;
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';
      iframe.style.overflow = 'hidden';
      
      script.parentNode.insertBefore(iframe, script.nextSibling);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmbeds);
  } else {
    initEmbeds();
  }
})();
