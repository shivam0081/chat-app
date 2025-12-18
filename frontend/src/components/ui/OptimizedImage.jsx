import { getOptimizedImageUrl, getResponsiveImageUrls, isCloudinaryUrl, extractPublicId } from '@/utils/cloudinary';
import { cn } from '@/lib/utils';
import PropTypes from 'prop-types';

const OptimizedImage = ({ 
  src, 
  alt = "image", 
  width, 
  height, 
  className, 
  responsive = false,
  quality = 'auto',
  ...props 
}) => {
  // Generate optimized URL if it's a Cloudinary image
  const getOptimizedSrc = () => {
    if (!src) return '';
    
    if (isCloudinaryUrl(src)) {
      const publicId = extractPublicId(src);
      
      const options = {
        quality,
        fetch_format: 'auto'
      };
      
      if (width) options.width = width;
      if (height) options.height = height;
      
      return getOptimizedImageUrl(publicId, options);
    }
    
    return src;
  };

  // Generate responsive srcSet for Cloudinary images
  const getResponsiveSrcSet = () => {
    if (!src || !responsive || !isCloudinaryUrl(src)) return undefined;
    
    const publicId = extractPublicId(src);
    const responsiveUrls = getResponsiveImageUrls(publicId);
    
    return `
      ${responsiveUrls.small} 400w,
      ${responsiveUrls.medium} 800w,
      ${responsiveUrls.large} 1200w,
      ${responsiveUrls.original} 1600w
    `.replace(/\s+/g, ' ').trim();
  };

  const optimizedSrc = getOptimizedSrc();
  const srcSet = getResponsiveSrcSet();

  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={responsive ? "(max-width: 400px) 400px, (max-width: 800px) 800px, (max-width: 1200px) 1200px, 1600px" : undefined}
      alt={alt}
      width={width}
      height={height}
      className={cn("object-cover", className)}
      loading="lazy"
      {...props}
    />
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  responsive: PropTypes.bool,
  quality: PropTypes.string,
};

export default OptimizedImage;