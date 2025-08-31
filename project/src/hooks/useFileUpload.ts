import { useState, useRef } from 'react';

interface FileUploadOptions {
  maxSize?: number; // in MB
  allowedTypes?: string[];
  multiple?: boolean;
}

interface UploadResult {
  url: string;
  publicId?: string;
}

export const useFileUpload = (options: FileUploadOptions = {}) => {
  const {
    maxSize = 5, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    multiple = false
  } = options;

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    return null;
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    setError(null);
    const fileArray = Array.from(selectedFiles);
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }

      validFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        validPreviews.push(e.target?.result as string);
        setPreviews([...validPreviews]);
      };
      reader.readAsDataURL(file);
    }

    if (multiple) {
      setFiles(prev => [...prev, ...validFiles]);
    } else {
      setFiles(validFiles);
      setPreviews(validPreviews);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
    setPreviews([]);
    setError(null);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return {
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
  };
}; 