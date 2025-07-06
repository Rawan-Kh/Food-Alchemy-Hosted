import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RecipeImageUploadProps {
  currentImage?: string;
  onImageChange: (imageDataUrl: string | null) => void;
}

export const RecipeImageUpload: React.FC<RecipeImageUploadProps> = ({
  currentImage,
  onImageChange
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      const compressedImage = await compressImage(file);
      onImageChange(compressedImage);
      toast({
        title: "Image uploaded",
        description: "Recipe image has been optimized and added",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to process the image",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeImage = () => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>Recipe Image</Label>
      
      {currentImage ? (
        <div className="relative">
          <img
            src={currentImage}
            alt="Recipe"
            className="w-full h-48 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={removeImage}
            className="absolute top-2 right-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
        >
          <Image className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Drop an image here or click to upload
          </p>
          <p className="text-xs text-gray-500">
            Images will be automatically optimized (max 5MB)
          </p>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};
