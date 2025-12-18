import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../ui/button';
import { Upload, X, Image, Loader2, AlertCircle } from 'lucide-react';
import { HOST } from '../../utils/constant';

const ImageUpload = ({ onImageUpload, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      validateAndPreviewFile(file);
    }
  };

  const validateAndPreviewFile = (file) => {
    setError(null);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, GIF, WebP)');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview({
        url: e.target.result,
        file: file,
        name: file.name,
        size: file.size
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview?.file) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('image', preview.file);

      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded * 100) / e.total);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            if (result.success) {
              onImageUpload({
                url: result.data.url,
                fileName: result.data.fileName,
                fileSize: result.data.fileSize,
                contentType: result.data.contentType
              });
              clearPreview();
              resolve(result);
            } else {
              reject(new Error('Upload failed'));
            }
          } else {
            reject(new Error(`HTTP Error: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', `${HOST}/api/upload/upload-image`);
        xhr.withCredentials = true;
        xhr.send(formData);
      });

    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndPreviewFile(files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {!preview ? (
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center 
            transition-all duration-300 ease-in-out cursor-pointer
            ${dragActive 
              ? 'border-[#8417ff] bg-[#8417ff]/5 scale-105' 
              : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/30'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className={`
              p-4 rounded-full transition-all duration-300
              ${dragActive ? 'bg-[#8417ff] text-white' : 'bg-gray-700 text-gray-400'}
            `}>
              <Image className="h-8 w-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {dragActive ? 'Drop your image here!' : 'Upload an image'}
              </h3>
              <p className="text-sm text-gray-400">
                Drag and drop your image here, or{' '}
                <span className="text-[#8417ff] font-medium">browse</span>
              </p>
              <p className="text-xs text-gray-500">
                Supports PNG, JPG, GIF, WebP • Max 10MB
              </p>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative bg-gray-800 rounded-xl p-4 border border-gray-700">
            <button
              onClick={clearPreview}
              className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10 shadow-lg"
              disabled={uploading}
            >
              <X size={14} />
            </button>
            
            <div className="flex items-start space-x-4">
              <div className="relative flex-shrink-0">
                <img
                  src={preview.url}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border border-gray-600"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center">
                    <div className="text-white text-center">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-1" />
                      <span className="text-xs">{uploadProgress}%</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <p className="text-sm font-medium text-white truncate">
                    {preview.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatFileSize(preview.size)}
                  </p>
                </div>
                
                {uploading && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div 
                        className="bg-[#8417ff] h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleUpload}
              disabled={uploading || disabled}
              className="flex-1 bg-[#8417ff] hover:bg-[#741bda] text-white font-medium py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Send Image
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={clearPreview}
              disabled={uploading}
              className="px-6 py-2.5 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

ImageUpload.propTypes = {
  onImageUpload: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default ImageUpload;