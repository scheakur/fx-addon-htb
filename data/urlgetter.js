let canonical = document.querySelector('link[rel="canonical"]');
let url = (canonical) ? canonical.href : window.location.href;
self.postMessage(url);
