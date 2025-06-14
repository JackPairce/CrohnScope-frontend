import Image from "next/image";
import React, { useState } from "react";
import "./styles.scss";

interface UploadButtonProps {
  label?: string;
  uploadImage?: (file: File) => Promise<boolean>;
  showIcon?: boolean;
  onSuccess?: (image: any) => void;
  onError?: (error: any) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
}

const UploadBtn: React.FC<UploadButtonProps> = ({
  label = "Upload Image",
  uploadImage,
  showIcon = true,
  onSuccess,
  onError,
  onUploadStart,
  onUploadEnd,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadImage) return;

    try {
      setIsUploading(true);
      onUploadStart?.();

      const success = await uploadImage(file);

      if (success) {
        onSuccess?.(file);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      onError?.(error);
    } finally {
      setIsUploading(false);
      onUploadEnd?.();
    }
  };

  return (
    <button
      className={`upload-btn ${isUploading ? "uploading" : ""}`}
      type="button"
      disabled={isUploading}
    >
      <label className="upload-label">
        {showIcon && (
          <Image
            src="/svgs/upload.svg"
            alt="Upload"
            width={20}
            height={20}
            className="svg-icon upload-icon"
          />
        )}
        <span>{isUploading ? "Uploading..." : label}</span>
        <input
          className="upload-input"
          type="file"
          onChange={handleChange}
          accept="image/*"
          disabled={isUploading}
        />
      </label>
    </button>
  );
};

export default UploadBtn;
