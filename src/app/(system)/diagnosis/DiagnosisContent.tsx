"use client";

import ImageViewer from "@/components/ImageViewer";
import ImageElement from "@/components/ImageViewer/ImageElement";
import UploadBtn from "@/components/UploadBtn";
import Loader from "@/components/loader";
import {
  ApiFeature,
  ApiImage,
  DiagnosisResult,
  getDiseases,
  getFeatures,
  submitDiagnosis,
} from "@/lib/api";
import NextImage from "next/image";
import React, { useEffect, useRef, useState } from "react";

// Types
type Step = 1 | 2 | 3;

interface StepProps {
  currentStep: Step;
}

// Step indicator component (bigger UI)
const StepIndicator = ({ currentStep }: StepProps) => {
  //
  const steps = ["Upload", "Process", "Results"];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        margin: "32px 0",
      }}
    >
      {steps.map((label, idx) => (
        <React.Fragment key={label}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: idx + 1 === currentStep ? "#6366f1" : "#e5e7eb",
              color: idx + 1 === currentStep ? "#fff" : "#374151",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 28,
              border:
                idx + 1 < currentStep
                  ? "3px solid #22c55e"
                  : "3px solid transparent",
              transition: "all 0.2s",
              boxShadow:
                idx + 1 === currentStep ? "0 0 0 6px #6366f133" : undefined,
            }}
          >
            {idx + 1}
          </div>
          {idx < steps.length - 1 && (
            <div
              style={{
                width: 48,
                height: 4,
                background: "#d1d5db",
                borderRadius: 2,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Skeleton loader for results (shared layout)
const ResultsSkeleton = () => (
  <div className="results-side">
    <div className="severity-container">
      <div
        className="skeleton skeleton-label"
        style={{
          width: 120,
          height: 18,
          marginBottom: 8,
          display: "block",
          minHeight: 18,
        }}
      />
      <div
        className="skeleton skeleton-value"
        style={{
          width: 80,
          height: 28,
          marginBottom: 8,
          display: "block",
          minHeight: 28,
        }}
      />
      <div
        className="skeleton skeleton-meter"
        style={{
          width: "100%",
          height: 12,
          borderRadius: 6,
          display: "block",
          minHeight: 12,
        }}
      />
    </div>
    <div className="diagnosis-summary">
      <div
        className="skeleton skeleton-label"
        style={{
          width: 100,
          height: 18,
          marginBottom: 8,
          display: "block",
          minHeight: 18,
        }}
      />
      <div
        className="skeleton skeleton-text"
        style={{
          width: "100%",
          height: 32,
          display: "block",
          minHeight: 32,
        }}
      />
    </div>
  </div>
);

async function ImageSrc2Array(imageSrc: string): Promise<number[][][]> {
  // Convert base64 image to array
  const img = new Image();
  img.src = imageSrc;

  // Create a canvas to draw the image
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  return new Promise((resolve) => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Get pixel data
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;

      // Convert to array format
      const result: number[][][] = [];
      for (let y = 0; y < img.height; y++) {
        const row: number[][] = [];
        for (let x = 0; x < img.width; x++) {
          const idx = (y * img.width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          row.push([r, g, b]);
        }
        result.push(row);
      }
      resolve(result);
    };
  });
}

export default function DiagnosisContent() {
  // State management
  const [step, setStep] = useState<Step>(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [diagnosisResult, setDiagnosisResult] =
    useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<
    (Omit<ApiImage, "is_done"> & { is_done?: boolean }) | null
  >(null);
  const [diseases, setDiseases] = useState<{
    [key: number]: string;
  }>({});
  const [features, setFeatures] = useState<ApiFeature[]>();

  // Refs and router
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getDiseases().then((data) => {
      setDiseases({
        0: "Healthy",
        ...data.reduce((acc, D) => {
          acc[D.id] = D.name;
          return acc;
        }, {} as { [key: number]: string }),
      });
    });
    getFeatures().then((data) => {
      setFeatures(data);
    });
  }, []);

  // Handle image upload
  const handleImageUpload = async (file: File): Promise<boolean> => {
    if (!file) return false;

    try {
      setIsUploading(true);

      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);

      // Move to the next step after a short delay
      setTimeout(() => {
        setStep(2);
        setIsUploading(false);
      }, 1000);

      return true;
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to upload image. Please try again.");
      setIsUploading(false);
      return false;
    }
  };

  // Reset the diagnosis process
  const resetDiagnosis = () => {
    setStep(1);
    setPreviewUrl(null);
    setDiagnosisResult(null);
    setError(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const submitForDiagnosis = async () => {
    if (!previewUrl) {
      setError("No image selected for diagnosis.");
      return;
    }
    const ImageArray = await ImageSrc2Array(previewUrl);
    setCurrentImage({
      id: NaN,
      filename: "Diagnosis Result",
      src: previewUrl,
    });
    submitDiagnosis(ImageArray).then((results) => {
      setDiagnosisResult({
        confidence: results.confidence,
        diagnosis: {
          disease: diseases[results.disease_class] || "Unknown",
          // Add a precontent for report if features exist, else no report
          report: features
            ? `Detected features: ` +
              features
                .map((feature) => {
                  // Flatten the heatmap to a 1D array
                  const flatHeatmap = results.HeatMap.flat().filter(
                    (value) => value > 0
                  );
                  // Count how many times this feature appears
                  const count = flatHeatmap.filter(
                    (value) => value === feature.id
                  ).length;
                  // Calculate percentage
                  const percent =
                    flatHeatmap.length > 0
                      ? Math.round((count / flatHeatmap.length) * 100)
                      : 0;
                  return `${feature.name || feature}: ${percent}%`;
                })
                .join(", ")
            : "",
        },
        heatmap: results.HeatMap.map((row) => Uint8Array.from(row)),
      });
    });
    setStep(3);
  };

  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="diagnosis-container">
      <StepIndicator currentStep={step} />
      {error && (
        <div className="error-message">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      <div className="diagnosis-wrapper">
        {/* Upload step */}
        {step === 1 && (
          <div className="upload-section">
            <div className="upload-card">
              <div className="upload-icon">
                <NextImage
                  src="/svgs/upload.svg"
                  alt="Upload"
                  width={64}
                  height={64}
                  className="svg-icon"
                />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Upload Diagnostic Image
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Select or drag and drop a medical image for analysis
              </p>
              <UploadBtn
                label="Select Image"
                uploadImage={handleImageUpload}
                showIcon={true}
                onUploadStart={() => setIsUploading(true)}
                onUploadEnd={() => setIsUploading(false)}
                onError={(err) => setError(err.message)}
              />
              {isUploading && <Loader className="mt-4" />}
              {error && (
                <div className="error-message mt-4">
                  <p>{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview step */}
        {step === 2 && previewUrl && (
          <div className="preview-section">
            <div className="preview-card">
              <h2 className="text-xl font-semibold mb-4">Confirm Image</h2>
              <div className="preview-image-container" ref={imageRef}>
                <img src={previewUrl} alt="Preview" className="preview-image" />
              </div>
              <div className="preview-actions mt-6">
                <button
                  className="btn-secondary"
                  onClick={resetDiagnosis}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={submitForDiagnosis}
                  disabled={isUploading}
                >
                  {isUploading ? "Processing..." : "Analyze Image"}
                </button>
              </div>
              {error && (
                <div className="error-message mt-4">
                  <p>{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results step */}
        {step === 3 && (
          <div className="results-content">
            <div className="relative diagnosis-main">
              <div className="visualization-container">
                <ImageElement
                  /* @ts-ignore */
                  image={{
                    id: NaN,
                    filename: "diagnosis_image",
                    src: previewUrl || "",
                  }}
                  /* @ts-ignore */
                  setSelectedImage={setCurrentImage}
                />
                {currentImage && (
                  <ImageViewer
                    image={{
                      ...currentImage,
                      mask: diagnosisResult?.heatmap.map((row) =>
                        Array.from(row)
                      ),
                    }}
                    onClose={() => setCurrentImage(null)}
                    onDelete={async () => {
                      return true;
                    }}
                    features={features}
                    sidePanel={
                      diagnosisResult ? (
                        <DiagnosisReport diagnosisResult={diagnosisResult} />
                      ) : (
                        <ResultsSkeleton />
                      )
                    }
                  />
                )}
              </div>
              {diagnosisResult ? (
                <DiagnosisReport diagnosisResult={diagnosisResult} />
              ) : (
                <ResultsSkeleton />
              )}
            </div>
            <div className="results-actions">
              <button className="btn-secondary" onClick={resetDiagnosis}>
                New Diagnosis
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  // Save to patient record functionality would go here
                  // For now, just show an alert
                  alert("Diagnosis saved to patient record!");
                }}
              >
                Save to Patient Record
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
function DiagnosisReport({
  diagnosisResult,
}: {
  diagnosisResult: DiagnosisResult;
}): React.ReactNode {
  return (
    <>
      {/* Generated by Copilot */}
      <div className="results-side bg-card-bg rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-accent">
          Diagnosis Results
        </h2>
        {/* Generated by Copilot */}
        {/* Generated by Copilot */}
        <div
          style={{
            background: "var(--card-bg)",
            color: "var(--foreground)",
            borderRadius: "0.75rem",
            padding: "0.5rem 1.25rem",
            fontWeight: 600,
            fontSize: "1rem",
            boxShadow: "0 1px 4px 0 #0001",
            border: "1px solid var(--card-border)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          Confidence:{" "}
          <span style={{ color: "var(--accent)" }}>
            {Math.round(diagnosisResult.confidence * 100)}%
          </span>
        </div>
        <div className="diagnosis-summary mb-4 bg-card-bg rounded-lg p-4 shadow-sm">
          <div className="font-medium text-text-muted mb-1">AI Assessment:</div>
          <p className="text-foreground text-[15px]">
            {diagnosisResult.diagnosis.report}
          </p>
        </div>
        <div className="diagnosis-summary bg-card-bg rounded-lg p-4 shadow-sm">
          <div className="font-medium text-text-muted mb-1">Disease:</div>
          {/* Generated by Copilot */}
          {diagnosisResult.diagnosis.disease !== "Healthy" ? (
            <input
              type="text"
              value={diagnosisResult.diagnosis.disease}
              readOnly
              className="text-red-600 font-semibold text-lg bg-transparent border-none outline-none cursor-not-allowed"
            />
          ) : (
            <p className="text-green-600 font-semibold text-lg">
              {diagnosisResult.diagnosis.disease}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
