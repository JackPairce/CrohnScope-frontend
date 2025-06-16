"use client";

import Loader from "@/components/loader";
import { useEffect, useState } from "react";
import DiagnosisContent from "./DiagnosisContent";
import "./styles.scss";

type stats = {
  accuracy: number;
  speed: number; // in seconds
};

export default function DiagnosisPage() {
  const [modelStats, setModelStats] = useState<stats | null>(null);

  useEffect(() => {
    // get models stats
    const fetchModelStats = async () => {
      // simulate API call
      const data: stats = {
        accuracy: 56.8,
        speed: 30, // seconds
      };
      setModelStats(data);
    };

    fetchModelStats();
  }, []);

  if (!modelStats) {
    return <Loader message="Loading model statistics..." />;
  }

  return (
    <div className="diagnosis-page">
      <div className="page-header">
        <h1>AI-Powered Diagnosis</h1>
        <p>
          Upload histology images for automated diagnosis and stain analysis
        </p>
      </div>
      <DiagnosisContent />
      <div className="info-bar">
        <div className="info-item">
          <svg
            className="info-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
          <span>{modelStats.accuracy}% Accuracy</span>
        </div>
        <div className="info-item">
          <svg
            className="info-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Results in &lt;{modelStats.speed}s</span>
        </div>
        <div className="info-item">
          <svg
            className="info-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>Detailed Reports</span>
        </div>
      </div>
    </div>
  );
}
