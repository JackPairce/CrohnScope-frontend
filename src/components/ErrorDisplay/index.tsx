//
import {
  categorizeError,
  categorizeErrorWithConnectivityCheck,
  ErrorType as ErrorTypeEnum,
  ErrorTypeInfo,
} from "@/utils/errorUtils";
import { useEffect, useState } from "react";
import "./styles.css";

type ErrorType = "networkConnection" | "backendConnection" | "internal";

interface ErrorDisplayProps {
  error: Error;
  onRetry?: () => void;
  showHelpLink?: boolean;
  helpLinkUrl?: string;
  appName?: string;
}

export default function ErrorDisplay({
  error,
  onRetry = () => window.location.reload(),
  showHelpLink = true,
  helpLinkUrl = "https://support.crohnscope.com",
  appName = "HistoScope",
}: ErrorDisplayProps) {
  // State for handling async error categorization
  const [errorInfo, setErrorInfo] = useState<ErrorTypeInfo | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>("internal");
  const [isChecking, setIsChecking] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  // Use effect to perform connectivity check and determine error type
  useEffect(() => {
    async function checkConnectivityAndCategorizeError() {
      try {
        // Perform advanced error categorization with connectivity check
        const detailedErrorInfo = await categorizeErrorWithConnectivityCheck(
          error
        );
        setErrorInfo(detailedErrorInfo);

        // Map the utility error type to our component's error type
        let mappedErrorType: ErrorType = "internal";
        if (detailedErrorInfo.type === ErrorTypeEnum.NETWORK) {
          mappedErrorType = "networkConnection";
        } else if (
          detailedErrorInfo.type === ErrorTypeEnum.BACKEND ||
          detailedErrorInfo.type === ErrorTypeEnum.TIMEOUT
        ) {
          mappedErrorType = "backendConnection";
        }

        setErrorType(mappedErrorType);
      } catch (e) {
        // Fallback to synchronous categorization if async categorization fails
        const fallbackInfo = categorizeError(error);
        setErrorInfo(fallbackInfo);

        // Map error type
        if (fallbackInfo.type === ErrorTypeEnum.NETWORK) {
          setErrorType("networkConnection");
        } else if (
          fallbackInfo.type === ErrorTypeEnum.BACKEND ||
          fallbackInfo.type === ErrorTypeEnum.TIMEOUT
        ) {
          setErrorType("backendConnection");
        } else {
          setErrorType("internal");
        }
      } finally {
        setIsChecking(false);
      }
    }

    checkConnectivityAndCategorizeError();
  }, [error]);

  // For legacy support
  const isNetworkConnectionLost = errorType === "networkConnection";
  const isBackendConnectionLost = errorType === "backendConnection";
  const isInternalError = errorType === "internal";

  // Error type specific data with enhanced visuals and descriptions
  const errorData = {
    networkConnection: {
      title: "Network Connection Lost",
      description:
        "We can't reach the internet. Please check your connection and try again.",
      icon: (
        <svg
          className="w-full h-full"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="11" strokeWidth="1" strokeOpacity="0.2" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
          >
            <animate
              attributeName="stroke-opacity"
              values="1;0.5;1"
              dur="3s"
              repeatCount="indefinite"
            />
          </path>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 12 12"
            to="360 12 12"
            dur="60s"
            repeatCount="indefinite"
          />
        </svg>
      ),
      color: "red",
      action: "Check Connection",
    },
    backendConnection: {
      title: "Server Connection Issue",
      description:
        "We can't reach the HistoScope servers, but your internet connection appears to be working.",
      icon: (
        <svg
          className="w-full h-full"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="2"
            strokeWidth="1"
            strokeOpacity="0.2"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M15 8h.01M3 8h.01M15 16h.01M3 16h.01"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M7 8h8M5 12h14M7 16h8"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M3 12h18"
            strokeDasharray="1,3"
            strokeDashoffset="0"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;4"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </path>

          {/* Added mini-devices to represent internet is working */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1"
            d="M4 21a1 1 0 01-1-1v-1a1 1 0 011-1h4a1 1 0 011 1v1a1 1 0 01-1 1H4z"
            fill="rgba(245, 158, 11, 0.2)"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1"
            d="M16 21a1 1 0 01-1-1v-1a1 1 0 011-1h4a1 1 0 011 1v1a1 1 0 01-1 1h-4z"
            fill="rgba(245, 158, 11, 0.2)"
          />
        </svg>
      ),
      color: "amber",
      action: "Retry Connection",
    },
    internal: {
      title: "Application Error",
      description: "Something went wrong while processing your request.",
      icon: (
        <svg
          className="w-full h-full"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" strokeWidth="1" strokeOpacity="0.2" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9.9 16.2L12 14.1l2.1 2.1M9.9 7.8L12 9.9l2.1-2.1"
            strokeOpacity="0.7"
          >
            <animate
              attributeName="stroke-opacity"
              values="0.7;0.2;0.7"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>

          {/* Code symbols to represent an internal code issue */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="0.75"
            d="M8 6l-2 6 2 6M16 6l2 6-2 6"
            strokeOpacity="0.5"
          />
        </svg>
      ),
      color: "purple",
      action: "Show Details",
    },
  };

  // Fix the duplicate variable declaration issue by using the state variable
  // instead of redeclaring the variable
  let updatedErrorType = errorType;
  if (isNetworkConnectionLost) updatedErrorType = "networkConnection";
  else if (isBackendConnectionLost) updatedErrorType = "backendConnection";
  else updatedErrorType = "internal";

  // Update the state if needed
  if (updatedErrorType !== errorType) {
    setErrorType(updatedErrorType);
  }

  const currentError = errorData[updatedErrorType];

  // Map error type to CSS class name
  const errorClassMapping = {
    networkConnection: "network",
    backendConnection: "backend",
    internal: "internal",
  };

  const errorClass = errorClassMapping[errorType];

  const errorId = Date.now().toString(36);

  // Display a loading state while we check connectivity
  if (isChecking) {
    return (
      <div className="error-container">
        <div className={`error-card analyzing`}>
          <div className={`error-icon analyzing`}>
            <svg
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 6v6l4 2"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
          </div>
          <div className="error-title analyzing">Analyzing Connection...</div>
          <p className="error-description">
            We're diagnosing what went wrong with your connection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="error-container">
      <div className={`error-card ${errorClass}`}>
        <div className={`error-icon ${errorClass}`}>{currentError.icon}</div>

        <div className={`error-title ${errorClass}`}>
          {errorInfo?.title || currentError.title}
        </div>

        <p className="error-description">
          {errorInfo?.description || currentError.description}
        </p>

        {isInternalError && showDetails && (
          <div className="error-details">
            <p className="error-details-text">{error.message}</p>
            <p className="error-details-text">{error.stack}</p>
          </div>
        )}

        <div className="error-buttons">
          <button
            onClick={
              isInternalError ? () => setShowDetails(!showDetails) : onRetry
            }
            className={`error-action-button ${errorClass}`}
          >
            {isInternalError
              ? showDetails
                ? "Hide Details"
                : "Show Details"
              : currentError.action}
          </button>

          {isInternalError && (
            <button onClick={onRetry} className="error-retry-button">
              Retry
            </button>
          )}

          {showHelpLink && (
            <a
              href={helpLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="error-help-link"
            >
              Get Help
            </a>
          )}
        </div>

        {/*  */}
        <div className="error-footer">
          {appName} • Error ID: {errorId}
        </div>
      </div>
    </div>
  );
}
