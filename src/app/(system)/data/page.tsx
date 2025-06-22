//
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";
import { pipelineSteps } from "@/config/navigation";
import Image from "next/image";
import Link from "next/link";
import "./styles.scss";

export const metadata = {
  title: {
    default: "Data Pipeline",
    template: "%s | Data Pipeline",
  },
  description: "Data processing pipeline for HistoScope",
};

export default function DataProcessingPage() {
  return (
    <ErrorBoundaryWrapper
      appName="HistoScope Data Processing"
      showHelpLink={true}
    >
      <div className="data-page">
        <div className="page-header">
          <h1>Data Processing</h1>
          <p>
            Data Processing: Manage and streamline your data operations
            efficiently.
          </p>
        </div>

        <div className="pipeline-container">
          <div className="section-title">Processing Steps</div>

          {pipelineSteps.map((step, index) => (
            <Link href={step.href} className="pipeline-card" key={step.href}>
              <div className="card-icon">
                {step.iconType === "image" ? (
                  <Image
                    src={step.icon}
                    alt={step.alt}
                    width={20}
                    height={20}
                  />
                ) : (
                  // diagnostics SVG icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 14l2 2l4-4"></path>
                    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                    <path d="M3 10h18"></path>
                  </svg>
                )}
              </div>
              <div className="card-content">
                <div className="step-badge">STEP {index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              <div className="card-action">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </ErrorBoundaryWrapper>
  );
}
