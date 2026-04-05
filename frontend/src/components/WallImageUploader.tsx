import React, { useState } from 'react';
import { apiClient } from '../services/api';
import type { UploadResponse } from '../types/api';

interface WallImageUploaderProps {
  onUploadComplete: (image: UploadResponse) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

export const WallImageUploader: React.FC<WallImageUploaderProps> = ({
  onUploadComplete,
}) => {
  const [operationStatus, setOperationStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [isUploading, setIsUploading] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<UploadResponse | null>(
    null
  );

  const setUploadFailure = (detail: string) => {
    setOperationStatus('error');
    setErrorDetail(detail);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setOperationStatus('loading');
    setErrorDetail(null);
    setUploadedImage(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadFailure('Invalid file type. Use JPG, PNG, or GIF.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadFailure('File size too large. Maximum 10MB.');
      return;
    }

    setIsUploading(true);

    try {
      const result = await apiClient.uploadImage(file);

      if (result.success) {
        setUploadedImage(result.data);
        setOperationStatus('success');
        setErrorDetail(null);
        onUploadComplete(result.data);
      } else {
        setUploadFailure(result.error.detail || 'Upload failed');
      }
    } catch {
      setUploadFailure('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="wall-image-uploader">
      <label className="wall-image-label" htmlFor="wall-image-upload">
        Upload wall image
      </label>
      <input
        className="wall-image-input"
        id="wall-image-upload"
        type="file"
        accept=".jpg,.jpeg,.png,.gif"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {operationStatus === 'loading' && <p>Uploading image...</p>}
      {operationStatus === 'error' && (
        <>
          <p>Upload failed. Choose a supported image and try again.</p>
          {errorDetail && <p role="alert">{errorDetail}</p>}
        </>
      )}
      {operationStatus === 'success' && uploadedImage && (
        <p>Image uploaded successfully. You can now position the overlay.</p>
      )}
    </div>
  );
};
