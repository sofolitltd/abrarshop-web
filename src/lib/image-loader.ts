export default function cloudinaryLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // 1. Return SVGs as-is (already vector)
  if (src.endsWith('.svg')) return src;

  // 2. If it's a Cloudinary URL, apply transformations
  if (src.includes('res.cloudinary.com')) {
    const params = [
      `f_auto`,      // Automatically select best format (WebP/AVIF)
      `c_limit`,     // Scale down only
      `w_${width}`,  // Specific width
      `q_${quality || 'auto'}` // Dynamic quality
    ];
    
    // Insert transformations after '/upload/' in the URL
    if (src.includes('/upload/')) {
        return src.replace('/upload/', `/upload/${params.join(',')}/`);
    }
  }
  
  // 3. Fallback for placeholder or local images
  return src;
}
