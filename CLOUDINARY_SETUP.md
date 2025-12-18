# Cloudinary Setup Guide

This chat application has been configured to use Cloudinary as the media storage and optimization service. Cloudinary provides automatic image optimization, transformation, and delivery through a global CDN.

## Prerequisites

1. Create a free Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your Cloudinary credentials from the Dashboard

## Environment Variables Setup

### Backend (.env)

Copy the `.env.example` file to `.env` and fill in your Cloudinary credentials:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend (.env)

Copy the `.env.example` file to `.env` and add your Cloudinary cloud name:

```env
# Cloudinary Configuration for Frontend
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```

## Cloudinary Credentials

You can find your credentials in your Cloudinary Dashboard:

1. Go to [console.cloudinary.com](https://console.cloudinary.com)
2. In the Dashboard, you'll see:
   - **Cloud Name**: This is your unique cloud identifier
   - **API Key**: Your public API key
   - **API Secret**: Your private API secret (keep this secure!)

## Features

### Backend Features
- **Automatic Upload**: Files are automatically uploaded to Cloudinary
- **Folder Organization**: Files are organized in folders (`chat/profiles`, `chat/images`, `chat/files`, `chat/messages`)
- **Format Optimization**: Automatic format selection for optimal file size
- **Quality Optimization**: Automatic quality adjustment
- **File Type Support**: Images, documents, and other file types

### Frontend Features
- **Optimized Avatars**: Automatic avatar optimization with face detection and circular cropping
- **Responsive Images**: Automatic generation of multiple image sizes for different screen sizes
- **Thumbnail Generation**: Automatic thumbnail creation for quick loading
- **Progressive Loading**: Lazy loading and progressive image enhancement

## File Organization in Cloudinary

The application organizes files in the following folder structure:

```
your-cloud-name/
├── chat/
│   ├── profiles/          # User profile images
│   ├── images/            # Chat images from image upload component
│   ├── files/             # Document files and attachments
│   └── messages/          # Message attachment files
```

## Image Transformations

The application automatically applies various transformations:

### Profile Images
- Circular crop with face detection
- Automatic format optimization (WebP when supported)
- Quality optimization
- Multiple sizes for different use cases

### Chat Images
- Automatic format conversion
- Quality optimization
- Responsive image generation
- Progressive loading

### File Attachments
- Automatic format detection
- Optimized delivery
- Secure URLs

## Security Features

- **Secure URLs**: All uploads use HTTPS
- **Access Control**: Only authenticated users can upload
- **File Type Validation**: Server-side validation of file types
- **Size Limits**: Configurable file size limits
- **Auto-cleanup**: Cloudinary handles file cleanup and optimization

## Monitoring and Analytics

Cloudinary provides detailed analytics in your dashboard:
- Usage statistics
- Bandwidth monitoring
- Transformation statistics
- Error monitoring

## Backup and Migration

If you need to migrate from AWS S3 or another service:
1. Export your existing files
2. Use Cloudinary's bulk upload tools
3. Update your database URLs to point to Cloudinary
4. Test the migration thoroughly

## Cost Optimization

Cloudinary offers a generous free tier and efficient pricing:
- Free tier: 25GB storage, 25GB bandwidth
- Automatic optimization reduces costs
- CDN delivery improves performance
- Pay-as-you-grow pricing model

## Support

For issues related to Cloudinary:
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Support](https://support.cloudinary.com)
- [Community Forums](https://community.cloudinary.com)

## Migration Notes

This application has been migrated from AWS S3 to Cloudinary. Key changes:

1. **Upload Endpoint**: Now uses Cloudinary's upload API
2. **URL Structure**: URLs now follow Cloudinary's format
3. **Optimization**: Automatic image optimization is now enabled
4. **Transformations**: Real-time image transformations available
5. **CDN**: Global CDN delivery included

All existing functionality remains the same, but with improved performance and automatic optimization.