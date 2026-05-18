// utils/imageUtils.js
export const getResponsiveSizes = (breakpoints = { sm: 400, md: 800, lg: 1200, xl: 1600 }) => {
  return Object.entries(breakpoints)
    .map(([bp, size]) => `(max-width: ${bp}px) ${size}px`)
    .join(', ');
};

export const generateImagePath = (baseName, size, format = 'webp') => {
  return `/images/optimized/${baseName}-${size}w.${format}`;
};

export const getOptimalImageSize = (containerWidth) => {
  if (containerWidth >= 1600) return 1600;
  if (containerWidth >= 1200) return 1200;
  if (containerWidth >= 800) return 800;
  return 400;
};

// Preconnect to important origins
export const addPreconnects = () => {
  const origins = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];
  
  origins.forEach(origin => {
    if (!document.querySelector(`link[href="${origin}"]`)) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      if (origin.includes('gstatic')) {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    }
  });
};