import { Cloudinary } from 'cloudinary-core';

// Initialize Cloudinary instance
const cloudinary = new Cloudinary({
  cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  secure: true
});

/**
 * Get optimized image URL from Cloudinary
 * @param {string} publicId - The public ID of the image
 * @param {Object} options - Transformation options
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, options = {}) => {
  if (!publicId) return '';
  
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto',
    ...options
  };
  
  return cloudinary.url(publicId, defaultOptions);
};

/**
 * Get thumbnail image URL
 * @param {string} publicId - The public ID of the image
 * @param {number} width - Width of the thumbnail
 * @param {number} height - Height of the thumbnail
 * @returns {string} - Thumbnail image URL
 */
export const getThumbnailUrl = (publicId, width = 150, height = 150) => {
  if (!publicId) return '';
  
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    fetch_format: 'auto'
  });
};

/**
 * Get avatar image URL with circular crop
 * @param {string} publicId - The public ID of the image
 * @param {number} size - Size of the avatar
 * @returns {string} - Avatar image URL
 */
export const getAvatarUrl = (publicId, size = 100) => {
  if (!publicId) return '';
  
  return cloudinary.url(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    gravity: 'face',
    radius: 'max',
    quality: 'auto',
    fetch_format: 'auto'
  });
};

/**
 * Get responsive image URLs for different screen sizes
 * @param {string} publicId - The public ID of the image
 * @returns {Object} - Object containing URLs for different screen sizes
 */
export const getResponsiveImageUrls = (publicId) => {
  if (!publicId) return {};
  
  return {
    small: cloudinary.url(publicId, { width: 400, quality: 'auto', fetch_format: 'auto' }),
    medium: cloudinary.url(publicId, { width: 800, quality: 'auto', fetch_format: 'auto' }),
    large: cloudinary.url(publicId, { width: 1200, quality: 'auto', fetch_format: 'auto' }),
    original: cloudinary.url(publicId, { quality: 'auto', fetch_format: 'auto' })
  };
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Full Cloudinary URL
 * @returns {string} - Public ID
 */
export const extractPublicId = (url) => {
  if (!url || !url.includes('cloudinary.com')) return '';
  
  // Extract public ID from URL
  const parts = url.split('/');
  const uploadIndex = parts.findIndex(part => part === 'upload');
  if (uploadIndex === -1) return '';
  
  // Get everything after the version (if present) or after upload
  let publicIdParts = parts.slice(uploadIndex + 1);
  
  // Remove version if present (starts with 'v' followed by numbers)
  if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
    publicIdParts = publicIdParts.slice(1);
  }
  
  // Join the parts and remove file extension
  const publicId = publicIdParts.join('/');
  return publicId.replace(/\.[^/.]+$/, '');
};

/**
 * Check if URL is a Cloudinary URL
 * @param {string} url - URL to check
 * @returns {boolean} - True if it's a Cloudinary URL
 */
export const isCloudinaryUrl = (url) => {
  return url && url.includes('cloudinary.com');
};

export default cloudinary;