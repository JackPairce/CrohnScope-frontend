import Image from "next/image";
import React from "react";
import "./styles.scss";

interface UploadButtonProps {
  label: string;
  onUpload: (file: File) => void;
  showIcon?: boolean;
}

const UploadButton: React.FC<UploadButtonProps> = ({
  label,
  onUpload,
  showIcon = true,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        onUpload(files[i]);
      }
    }
  };

  return (
    <label className="upload-label">
      {showIcon && (
        <Image
          src="/svgs/upload.svg"
          alt="Upload"
          width={20}
          height={20}
          className="upload-icon"
        />
      )}
      {label && <span>{label}</span>}
      <input
        className="upload-input"
        type="file"
        onChange={handleChange}
        accept="image/*"
      />
    </label>
  );
};

export default UploadButton;
