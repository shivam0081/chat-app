import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getAvatarUrl, isCloudinaryUrl, extractPublicId } from '@/utils/cloudinary';
import { cn } from '@/lib/utils';
import PropTypes from 'prop-types';

const OptimizedAvatar = ({ 
  src, 
  alt = "avatar", 
  size = 40, 
  className, 
  fallbackContent,
  ...props 
}) => {
  // Generate optimized URL if it's a Cloudinary image
  const getOptimizedSrc = () => {
    if (!src) return '';
    
    if (isCloudinaryUrl(src)) {
      const publicId = extractPublicId(src);
      return getAvatarUrl(publicId, size);
    }
    
    return src;
  };

  const optimizedSrc = getOptimizedSrc();

  return (
    <Avatar 
      className={cn(`w-[${size}px] h-[${size}px]`, className)} 
      {...props}
    >
      {optimizedSrc && (
        <AvatarImage
          src={optimizedSrc}
          alt={alt}
          className="object-cover w-full h-full rounded-full bg-black"
          loading="lazy"
        />
      )}
      {fallbackContent && (
        <AvatarFallback>
          {fallbackContent}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

OptimizedAvatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.number,
  className: PropTypes.string,
  fallbackContent: PropTypes.node,
};

export default OptimizedAvatar;