import React from 'react';
import { Upload, X, Image, FileText, AlertCircle } from 'lucide-react';
import { useFileUpload } from '../hooks/useFileUpload';

interface FileUploadProps {
  onFilesSelected?: (files: File[]) => void;
  onUploadComplete?: (urls: string[]) => void;
  maxSize?: number;
  allowedTypes?: string[];
  multiple?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  onUploadComplete,
  maxSize = 5,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  multiple = false,
  label = 'Upload Files',
  placeholder = 'Drag and drop files here, or click to select',
  className = '',
  disabled = false
}) => {
  const {
    files,
    previews,
    uploading,
    error,
    fileInputRef,
    handleFileSelect,
    removeFile,
    clearFiles,
    triggerFileSelect,
    setUploading,
    setError
  } = useFileUpload({ maxSize, allowedTypes, multiple });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
    if (onFilesSelected) {
      onFilesSelected(Array.from(droppedFiles));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    if (onFilesSelected && e.target.files) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={allowedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
          ${disabled 
            ? 'border-slate-200 bg-slate-50 cursor-not-allowed' 
            : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
          }
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={disabled ? undefined : triggerFileSelect}
      >
        <Upload className={`w-8 h-8 mx-auto mb-2 ${disabled ? 'text-slate-400' : 'text-slate-500'}`} />
        <p className={`text-sm ${disabled ? 'text-slate-400' : 'text-slate-600'}`}>
          {placeholder}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Max size: {maxSize}MB | Allowed: {allowedTypes.map(t => t.split('/')[1]).join(', ')}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-700">
              Selected Files ({files.length})
            </h4>
            <button
              type="button"
              onClick={clearFiles}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="relative group border border-slate-200 rounded-lg p-3 bg-white"
              >
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* File Preview */}
                <div className="space-y-2">
                  {file.type.startsWith('image/') && previews[index] ? (
                    <div className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                      <img
                        src={previews[index]}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg bg-slate-100 flex items-center justify-center">
                      {getFileIcon(file)}
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-700 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-sm text-blue-700">Uploading files...</span>
          </div>
        </div>
      )}
    </div>
  );
}; 