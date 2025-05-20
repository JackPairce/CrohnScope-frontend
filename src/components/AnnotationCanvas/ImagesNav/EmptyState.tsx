import UploadButton from "@/components/UploadBtn";

interface EmptyStateProps {
  isDone: boolean;
  onUpload?: (file: File) => Promise<void>;
}

export default function EmptyState({ isDone, onUpload }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
          stroke="#4A5568"
          strokeWidth="1.5"
        />
        <circle cx="8.5" cy="8.5" r="1.5" fill="#4A5568" />
        <path
          d="M6 16L10 12L18 20"
          stroke="#4A5568"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M14 12L18 8"
          stroke="#4A5568"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <p>No {isDone ? "completed" : "pending"} images found</p>
      {!isDone && (
        <>
          <p className="empty-state-hint">Upload images to get started</p>
          <div className="empty-state-upload">
            <UploadButton label="Upload Images" onUpload={onUpload} />
          </div>
        </>
      )}
    </div>
  );
}
