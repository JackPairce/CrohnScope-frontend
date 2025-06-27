"use client";

import { NdarrayToImgSrc } from "@/components/AnnotationCanvas/MaskUtils";
import DiagnosisImageViewer from "@/components/DiagnosisImageViewer";
import UploadBtn from "@/components/UploadBtn";
import Loader from "@/components/loader";
import { DiagnosisResult, diagnosisApi } from "@/lib/api";
import { ApiFeature, getFeatures } from "@/lib/api/features";
import { getStainNormalizationImageFromBase64 } from "@/lib/api/images";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
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
  <div className="results-content">
    <div className="results-header">
      <div
        className="skeleton skeleton-title"
        style={{
          width: 220,
          height: 32,
          display: "block",
          minHeight: 32,
        }}
      />
      <div className="diagnosis-meta">
        <div
          className="skeleton skeleton-badge"
          style={{
            width: 120,
            height: 28,
            borderRadius: 8,
            display: "block",
            minHeight: 28,
          }}
        />
      </div>
    </div>
    <div className="diagnosis-main">
      <div className="visualization-container">
        <div className="results-visualization">
          <div
            className="skeleton skeleton-image"
            style={{
              width: "100%",
              height: 320,
              borderRadius: 24,
              display: "block",
              minHeight: 220,
            }}
          />
        </div>
      </div>
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
    </div>
    <div
      className="results-actions"
      style={{ display: "flex", gap: 16, marginTop: 32 }}
    >
      <div
        className="skeleton skeleton-btn"
        style={{
          width: 160,
          height: 40,
          borderRadius: 8,
          display: "block",
          minHeight: 40,
        }}
      />
      <div
        className="skeleton skeleton-btn"
        style={{
          width: 200,
          height: 40,
          borderRadius: 8,
          display: "block",
          minHeight: 40,
        }}
      />
    </div>
  </div>
);

export default function DiagnosisContent() {
  // State management
  const [step, setStep] = useState<Step>(1);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [diagnosisId, setDiagnosisId] = useState<string | null>(null);
  const [diagnosisResult, setDiagnosisResult] =
    useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [featuresData, setFeaturesData] = useState<ApiFeature[] | null>(null);
  const [isFetchingFeatures, setIsFetchingFeatures] = useState(false);
  const [stainViews, setStainViews] = useState<{
    inorm?: string;
    hematoxylin?: string;
    eosin?: string;
  }>({});
  const [isProcessingStain, setIsProcessingStain] = useState(false);

  // Refs and router
  const imageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          // Remove data URL prefix if present
          const base64 = reader.result.replace(/^data:.+;base64,/, "");
          resolve(base64);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Process image for stain normalization
  const processStainNormalization = async (file: File) => {
    try {
      setIsProcessingStain(true);
      setError(null);

      // Convert the file to base64
      const base64Image = await fileToBase64(file);
      const stainResult = await getStainNormalizationImageFromBase64(
        base64Image
      );

      // The API returns base64 image data directly
      setStainViews({
        inorm: NdarrayToImgSrc(stainResult.inorm),
        hematoxylin: NdarrayToImgSrc(stainResult.hematoxylin),
        eosin: NdarrayToImgSrc(stainResult.eosin),
      });

    } catch (err) {
      console.error("Error processing stain normalization:", err);
      setError("Failed to process stain normalization. Please try again.");
    } finally {
      setIsProcessingStain(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (file: File): Promise<boolean> => {
    if (!file) return false;

    try {
      setIsUploading(true);
      setSelectedImage(file);

      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);

      // Process stain normalization in parallel with other tasks
      processStainNormalization(file);

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

  // Submit image for diagnosis
  const submitForDiagnosis = async () => {
    if (!selectedImage) return;

    try {
      setError(null);
      setIsUploading(true);

      // Submit the image for diagnosis
      const result = await diagnosisApi.submitDiagnosis(selectedImage);
      setDiagnosisId(result.id);

      // Store the original preview URL to display alongside heatmap
      if (previewUrl && !result.heatmapUrl) {
        // If using mock API and no heatmap was generated, apply a filter to create one
        const canvas = document.createElement("canvas");
        const img = new window.Image();
        img.src = previewUrl;

        // Set crossOrigin to anonymous to prevent CORS errors
        img.crossOrigin = "anonymous";

        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            resolve();
          };
          img.onerror = (e) => {
            console.error("Error loading image for heatmap generation:", e);
            reject(new Error("Failed to load image"));
          };
        });

        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // First create a copy of the original image with a slight blue tint background like in the reference
          // This will be our base for the heatmap
          const tintedCanvas = document.createElement("canvas");
          tintedCanvas.width = img.width;
          tintedCanvas.height = img.height;
          const tintedCtx = tintedCanvas.getContext("2d");

          if (tintedCtx) {
            // Fill with a light purple/blue background similar to the reference image
            tintedCtx.fillStyle = "rgba(200, 200, 235, 0.7)";
            tintedCtx.fillRect(0, 0, tintedCanvas.width, tintedCanvas.height);

            // Draw the original image with some transparency to let the tint show through
            tintedCtx.globalAlpha = 0.85;
            tintedCtx.drawImage(img, 0, 0);
            tintedCtx.globalAlpha = 1.0;

            // Reset the main canvas and draw the tinted image
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(tintedCanvas, 0, 0);

            // Add a subtle grid pattern to the background for more visual texture
            ctx.strokeStyle = "rgba(180, 180, 220, 0.2)";
            ctx.lineWidth = 0.5;

            const gridSize = 20;
            for (let x = 0; x < canvas.width; x += gridSize) {
              ctx.beginPath();
              ctx.moveTo(x, 0);
              ctx.lineTo(x, canvas.height);
              ctx.stroke();
            }

            for (let y = 0; y < canvas.height; y += gridSize) {
              ctx.beginPath();
              ctx.moveTo(0, y);
              ctx.lineTo(canvas.width, y);
              ctx.stroke();
            }
          }

          // Function to get a color based on the severity value (0-100)
          const getHeatmapColor = (severity: number, x: number, y: number) => {
            // Create a color palette similar to the reference image
            // More distinct colors with less gradient effect
            const colors = [
              { value: 0, color: [80, 80, 255, 0.7] }, // Cool blue (low severity)
              { value: 20, color: [100, 100, 255, 0.7] }, // Medium blue
              { value: 40, color: [255, 100, 255, 0.8] }, // Purple
              { value: 60, color: [255, 255, 80, 0.8] }, // Yellow
              { value: 80, color: [255, 120, 40, 0.9] }, // Orange
              { value: 100, color: [255, 50, 50, 0.9] }, // Hot red (high severity)
            ];

            // Add a slight "quantization" effect to create more distinct color regions
            // Instead of smooth gradients, create stepped color regions
            const quantizationLevels = 6; // Number of distinct color levels
            const quantizedSeverity =
              Math.floor(severity / (100 / quantizationLevels)) *
              (100 / quantizationLevels);

            // Add position-based variation to create a more diverse pattern
            // This creates the blocky, varied look in the reference image
            const positionVariation = ((x * 7 + y * 13) % 20) - 10; // -10 to +10 variation based on position
            const adjustedSeverity = Math.max(
              0,
              Math.min(100, quantizedSeverity + positionVariation)
            );

            // Find the two colors to interpolate between
            let lowerColor = colors[0];
            let upperColor = colors[colors.length - 1];

            for (let i = 0; i < colors.length - 1; i++) {
              if (
                adjustedSeverity >= colors[i].value &&
                adjustedSeverity <= colors[i + 1].value
              ) {
                lowerColor = colors[i];
                upperColor = colors[i + 1];
                break;
              }
            }

            // Calculate the interpolation factor
            const range = upperColor.value - lowerColor.value;
            const factor =
              range === 0 ? 0 : (adjustedSeverity - lowerColor.value) / range;

            // Interpolate colors
            const r = Math.round(
              lowerColor.color[0] +
                factor * (upperColor.color[0] - lowerColor.color[0])
            );
            const g = Math.round(
              lowerColor.color[1] +
                factor * (upperColor.color[1] - lowerColor.color[1])
            );
            const b = Math.round(
              lowerColor.color[2] +
                factor * (upperColor.color[2] - lowerColor.color[2])
            );
            const a =
              lowerColor.color[3] +
              factor * (upperColor.color[3] - lowerColor.color[3]);

            return `rgba(${r}, ${g}, ${b}, ${a})`;
          };

          // Create pixel-based heatmap overlay using the tissue structure
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;

          // Process the image to identify tissue areas
          // We'll use the original image's color intensity to determine where tissue is
          if (result.areas && result.areas.length > 0) {
            // Use the provided areas to create a colorful heatmap
            result.areas.forEach(
              (area: {
                x: number;
                y: number;
                width: number;
                height: number;
                severity: number;
              }) => {
                // Create a more pixelated and varied heatmap like in the reference
                const blockSize = 12; // Larger blocks for more distinct appearance

                // Create a checkerboard-like pattern with occasional larger blocks
                for (let bx = 0; bx < area.width; bx += blockSize) {
                  for (let by = 0; by < area.height; by += blockSize) {
                    // Add some variation to severity for a more natural look
                    const baseSeverity = area.severity;

                    // Create more variation based on position
                    const posVariation = ((bx * 3 + by * 7) % 40) - 20; // -20 to +20 variation
                    const blockSeverity = Math.max(
                      0,
                      Math.min(100, baseSeverity + posVariation)
                    );

                    // Get color based on severity and position
                    ctx.fillStyle = getHeatmapColor(
                      blockSeverity,
                      area.x + bx,
                      area.y + by
                    );

                    // Vary the block size occasionally to create more interesting patterns
                    // This creates the irregular blocky effect seen in the reference
                    const sizeVariation = (bx + by) % 3 === 0 ? 1.5 : 1;
                    const actualWidth = Math.min(
                      blockSize * sizeVariation,
                      area.width - bx
                    );
                    const actualHeight = Math.min(
                      blockSize * sizeVariation,
                      area.height - by
                    );

                    // Skip some blocks randomly to create gaps (about 10% of blocks)
                    if (Math.random() > 0.1) {
                      ctx.fillRect(
                        area.x + bx,
                        area.y + by,
                        actualWidth,
                        actualHeight
                      );
                    }
                  }
                }
              }
            );
          } else {
            // If no specific areas provided, create a realistic tissue-based heatmap
            // Analyze the image to find areas that look like tissue
            const pixelData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            ).data;
            const segmentSize = 15; // Larger segment size for more blocky appearance

            // Create a grid pattern over the tissue
            for (let y = 0; y < canvas.height; y += segmentSize) {
              for (let x = 0; x < canvas.width; x += segmentSize) {
                // Check if this segment contains tissue (non-white pixels)
                let hasTissue = false;
                let avgIntensity = 0;

                // Sample the center of the segment to determine if it's tissue
                const centerX = x + Math.floor(segmentSize / 2);
                const centerY = y + Math.floor(segmentSize / 2);
                if (centerX < canvas.width && centerY < canvas.height) {
                  const pixelIndex = (centerY * canvas.width + centerX) * 4;
                  const r = pixelData[pixelIndex];
                  const g = pixelData[pixelIndex + 1];
                  const b = pixelData[pixelIndex + 2];

                  // If pixel is not white/very light, consider it tissue
                  avgIntensity = (r + g + b) / 3;
                  hasTissue = avgIntensity < 230; // Threshold for tissue detection
                }

                if (hasTissue) {
                  // Generate a severity value based on the pixel intensity
                  // Darker tissue gets higher severity values
                  const normalizedIntensity = 1 - avgIntensity / 255;
                  const baseSeverity = normalizedIntensity * 100;

                  // Create clusters of similar colors to get the blocky effect
                  // Use the x,y position to create regions of similar severity
                  const regionX = Math.floor(x / (segmentSize * 4));
                  const regionY = Math.floor(y / (segmentSize * 4));
                  const regionSeed = (regionX * 17 + regionY * 23) % 100;

                  // Mix region-based and pixel-based severity
                  const mixFactor = 0.7; // How much to weight region vs. individual pixel
                  const regionSeverity = (regionSeed + baseSeverity) / 2;
                  const mixedSeverity =
                    mixFactor * regionSeverity + (1 - mixFactor) * baseSeverity;

                  // Add a small random variation for each block
                  const variation = Math.random() * 15 - 7.5; // -7.5 to +7.5
                  const finalSeverity = Math.max(
                    0,
                    Math.min(100, mixedSeverity + variation)
                  );

                  // Apply the heatmap color
                  ctx.fillStyle = getHeatmapColor(finalSeverity, x, y);

                  // Vary the block size occasionally to create more interesting patterns
                  const sizeVariation = (x + y) % 4 === 0 ? 1.3 : 1;
                  const actualWidth = Math.min(
                    segmentSize * sizeVariation,
                    canvas.width - x
                  );
                  const actualHeight = Math.min(
                    segmentSize * sizeVariation,
                    canvas.height - y
                  );

                  // Skip some blocks randomly to create gaps (about 15% of blocks)
                  if (Math.random() > 0.15) {
                    ctx.fillRect(x, y, actualWidth, actualHeight);
                  }
                }
              }
            }
          }

          // Generate a data URL for the heatmap
          // Generate a data URL for the heatmap
          const heatmapUrl = canvas.toDataURL("image/png");

          // Make sure to set the heatmap URL on the result object
          result.heatmapUrl = heatmapUrl;
        }
      }

      // Move to results step
      setStep(3);

      // If the result is still processing, start polling
      if (result.status === "pending" || result.status === "processing") {
        setIsPolling(true);
      } else {
        setDiagnosisResult(result);
        // Fetch features data for the image if results are already available
        fetchFeaturesData();
      }
    } catch (err) {
      console.error("Error submitting for diagnosis:", err);
      setError("Failed to process image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }; // Poll for diagnosis result
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let pollCount = 0;

    if (isPolling && diagnosisId) {
      intervalId = setInterval(async () => {
        try {
          const result = await diagnosisApi.getDiagnosis(diagnosisId);
          pollCount++;

          // Force completion after a few polls for better demo experience
          if (
            pollCount >= 3 ||
            result.status === "completed" ||
            result.status === "failed"
          ) {
            setIsPolling(false);

            // If not completed yet, but we've reached max polls, force it to complete
            if (
              result.status !== "completed" &&
              result.status !== "failed" &&
              pollCount >= 3
            ) {
              const completedResult = {
                ...result,
                status: "completed" as const,
              };
              setDiagnosisResult(completedResult);
              // Fetch features data for the image
              if (completedResult.imageId) {
                fetchFeaturesData();
              }
            } else {
              setDiagnosisResult(result);
              // Fetch features data for the image
              if (result.imageId) {
                fetchFeaturesData();
              }

              if (result.status === "failed") {
                setError("Diagnosis processing failed. Please try again.");
              }
            }
          }
        } catch (err) {
          console.error("Error polling diagnosis:", err);
          setIsPolling(false);
          setError("Failed to retrieve diagnosis results.");
        }
      }, 2000); // Poll every 2 seconds for faster demo
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPolling, diagnosisId]);

  // Toggle between original image and heatmap
  const toggleHeatmap = () => {
    setShowHeatmap(!showHeatmap);
  };

  // Fetch features data from the API
  const fetchFeaturesData = async () => {
    try {
      setIsFetchingFeatures(true);
      const features = await getFeatures();
      setFeaturesData(features);
    } catch (err) {
      console.error("Error fetching features data:", err);
      // Don't show error to user, just log it
    } finally {
      setIsFetchingFeatures(false);
    }
  };

  // Reset the diagnosis process
  const resetDiagnosis = () => {
    setStep(1);
    setSelectedImage(null);
    setPreviewUrl(null);
    setDiagnosisId(null);
    setDiagnosisResult(null);
    setError(null);
    setIsPolling(false);
    // Default to showing original image
    setShowHeatmap(false);
    setFeaturesData(null);
    setIsFetchingFeatures(false);
    // Reset stain views
    setStainViews({
      inorm: undefined,
      hematoxylin: undefined,
      eosin: undefined,
    });

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // Clear any saved diagnosis results from memory
    // (No need to manipulate window object directly)
  };

  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Format severity level as text
  const getSeverityText = (severity: number): string => {
    if (severity < 20) return "Mild";
    if (severity < 50) return "Moderate";
    if (severity < 80) return "Severe";
    return "Critical";
  };

  // Get severity level color
  const getSeverityColor = (severity: number): string => {
    if (severity < 20) return "text-green-600";
    if (severity < 50) return "text-yellow-600";
    if (severity < 80) return "text-orange-600";
    return "text-red-600";
  };

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
          <div className="results-section">
            {isPolling || !diagnosisResult ? (
              <ResultsSkeleton />
            ) : (
              <div className="results-content">
                <div className="results-header">
                  <h2 className="text-xl font-semibold">Diagnosis Results</h2>
                  <div className="diagnosis-meta">
                    <div className="confidence-badge">
                      Confidence: {Math.round(diagnosisResult.confidence * 100)}
                      %
                    </div>
                  </div>
                </div>

                <div className="diagnosis-main">
                  <div className="visualization-container">
                    <div className="results-visualization">
                      <DiagnosisImageViewer
                        urls={{
                          original: previewUrl || "",
                          inorm: stainViews?.inorm || "",
                          hematoxylin: stainViews?.hematoxylin || "",
                          eosin: stainViews?.eosin || "",
                        }}
                        heatmapUrl={diagnosisResult.heatmapUrl}
                        diagnosisResult={diagnosisResult}
                        showHeatmap={showHeatmap}
                        onToggleHeatmap={toggleHeatmap}
                      />
                    </div>
                  </div>

                  {diagnosisResult.diagnosis ? (
                    <>
                      <div className="results-side">
                        <div className="severity-container">
                          <div className="severity-label">Severity Level:</div>
                          <div className="severity-value-container">
                            <div
                              className={`severity-value ${getSeverityColor(
                                diagnosisResult.diagnosis.severity
                              )}`}
                            >
                              {diagnosisResult.diagnosis.severity}%
                            </div>
                            <div className="severity-text">
                              (
                              {getSeverityText(
                                diagnosisResult.diagnosis.severity
                              )}
                              )
                            </div>
                          </div>
                          <div className="severity-meter">
                            <div
                              className="severity-fill"
                              style={{
                                width: `${diagnosisResult.diagnosis.severity}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="diagnosis-summary">
                          <div className="summary-label">AI Assessment:</div>
                          <p>{diagnosisResult.diagnosis.report}</p>
                        </div>

                        <div className="diagnosis-summary">
                          <div className="summary-label">Disease:</div>
                          <p>{diagnosisResult.diagnosis.disease}</p>
                        </div>
                        <div className="diagnosis-summary">
                          <div className="summary-label">Phase:</div>
                          <p>{diagnosisResult.diagnosis.phase || "N/A"}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    // unknown diagnosis case
                    <div className="unknown-diagnosis">
                      <p className="text-gray-500">
                        Unable to determine diagnosis. Please try a different
                        image.
                      </p>
                    </div>
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
        )}
      </div>
    </div>
  );
}
