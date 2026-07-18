export default function imageLoader({ src, width, quality }) {
  // 1. Cloudinary Optimization
  if (src.includes('res.cloudinary.com')) {
    const parts = src.split('/image/upload/');
    if (parts.length === 2) {
      const cloudNameUrl = parts[0];
      const rest = parts[1];
      
      // Prevent duplicates if already transformed
      if (rest.startsWith('f_auto') || rest.includes('q_auto')) {
        return src;
      }
      
      const qStr = quality ? `q_${quality}` : 'q_auto';
      const transform = `f_auto,${qStr},w_${width},c_limit`;
      return `${cloudNameUrl}/image/upload/${transform}/${rest}`;
    }
  }

  // 2. Unsplash Optimization
  if (src.includes('images.unsplash.com')) {
    try {
      const url = new URL(src);
      url.searchParams.set('w', width.toString());
      url.searchParams.set('q', (quality || 80).toString());
      url.searchParams.set('auto', 'format');
      return url.toString();
    } catch (e) {
      return src;
    }
  }

  // 3. Local / Fallback / External Server Images
  return src;
}
