import Loader from "@/components/loader";
import { useData } from "../DataContext";
import "./styles.scss";
export default function EmptyStatePage() {
  const { isLoading } = useData();
  if (isLoading) return <Loader className="h-screen" />;
  return (
    <div className="empty-state">
      <svg
        className="svg-icon"
        width="150"
        height="150"
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
        <circle cx="8.5" cy="8.5" r="1.5" fill="#3498db" />
        <path
          d="M6 16L10 12L18 20"
          stroke="#3498db"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M14 12L18 8"
          stroke="#2ecc71"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <h2>No Image Selected</h2>
      <p>Please select an image from the sidebar to begin segmentation</p>
      <div className="empty-state-help">
        <div className="help-step">
          <span className="step-number">1</span>
          <span>Choose an image from the image gallery</span>
        </div>
        <div className="help-step">
          <span className="step-number">2</span>
          <span>Use the segmentation tools to annotate</span>
        </div>
        <div className="help-step">
          <span className="step-number">3</span>
          <span>Save your work when finished</span>
        </div>
      </div>
    </div>
  );
}
