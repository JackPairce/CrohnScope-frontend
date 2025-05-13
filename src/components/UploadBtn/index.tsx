import React from "react";
import "styles.scss";

interface UploadButtonProps {
  label: string;
  onUpload: (file: File) => void;
}

const UploadButton: React.FC<UploadButtonProps> = ({ label, onUpload }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <label className="upload-label">
      {label}
      <input
        className="upload-input"
        type="file"
        onChange={handleChange}
        accept="*/*"
      />
    </label>
  );
};

export default UploadButton;
