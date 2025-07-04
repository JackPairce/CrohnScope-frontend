//
/**
 * Error type categorization utility
 * Helps identify what kind of error occurred based on error properties and message
 */

export enum ErrorType {
  NETWORK = "network",
  BACKEND = "backend",
  INTERNAL = "internal",
  AUTHENTICATION = "authentication",
  PERMISSION = "permission",
  NOT_FOUND = "notFound",
  VALIDATION = "validation",
  TIMEOUT = "timeout",
  UNKNOWN = "unknown",
}

export interface ErrorTypeInfo {
  type: ErrorType;
  title: string;
  description: string;
  suggestedAction: string;
  logLevel: "info" | "warning" | "error";
}

/**
 * Result of a detailed internet connectivity check
 */
export interface ConnectivityCheckResult {
  internetAvailable: boolean;
  cloudServicesAvailable: boolean;
  providerSpecificInfo?: {
    serviceProvider?: string;
    commonIssues?: string[];
    isKnownOutage?: boolean;
  };
  checkTimestamp: number;
  timeToCheck: number;
}

/**
 * Services used to check internet connectivity, in order of preference
 */
const CONNECTIVITY_CHECK_SERVICES = [
  {
    name: "Google 204 Response",
    url: "https://www.google.com/generate_204",
    method: "HEAD",
    isImage: false,
    category: "essential",
  },
  {
    name: "Cloudflare DNS",
    url: "https://1.1.1.1/cdn-cgi/trace",
    method: "HEAD",
    isImage: false,
    category: "essential",
  },
  {
    name: "Google DNS Favicon",
    url: "https://dns.google/favicon.ico",
    method: "GET",
    isImage: true,
    category: "essential",
  },
  {
    name: "Microsoft Favicon",
    url: "https://www.microsoft.com/favicon.ico",
    method: "GET",
    isImage: true,
    category: "alternative",
  },
  {
    name: "Apple Favicon",
    url: "https://www.apple.com/favicon.ico",
    method: "GET",
    isImage: true,
    category: "alternative",
  },
];

/**
 * Check if internet connectivity is available by pinging multiple reliable external services
 * This helps differentiate between complete network outage vs backend-specific issues
 */
export async function checkInternetConnectivity(): Promise<ConnectivityCheckResult> {
  const startTime = performance.now();
  let internetAvailable = false;
  let cloudServicesAvailable = false;
  let providerSpecificInfo = {};

  // First check navigator.onLine as a fast initial check
  const navigatorOnline = navigator.onLine;

  // Even if navigator reports offline, we still do actual checks
  // because navigator.onLine can be unreliable

  // Try each service in order until we find one that works
  for (const service of CONNECTIVITY_CHECK_SERVICES.filter(
    (s) => s.category === "essential"
  )) {
    try {
      if (service.isImage) {
        // Try image loading which works even with CORS restrictions
        internetAvailable = await checkWithImage(service.url);
        if (internetAvailable) break;
      } else {
        // Try fetch API with abort controller for timeout
        internetAvailable = await checkWithFetch(service.url, service.method);
        if (internetAvailable) break;
      }
    } catch (e) {
      // Continue to next service
      continue;
    }
  }

  // If basic internet check failed but navigator says we're online,
  // try the alternative services as well
  if (!internetAvailable && navigatorOnline) {
    for (const service of CONNECTIVITY_CHECK_SERVICES.filter(
      (s) => s.category === "alternative"
    )) {
      try {
        if (service.isImage) {
          internetAvailable = await checkWithImage(service.url);
          if (internetAvailable) break;
        } else {
          internetAvailable = await checkWithFetch(service.url, service.method);
          if (internetAvailable) break;
        }
      } catch (e) {
        continue;
      }
    }
  }

  // Only check cloud services if internet appears to be working
  if (internetAvailable) {
    // Quick check for major cloud providers to see if cloud services are working
    // This helps identify if it's just our backend having issues
    try {
      const awsCheck = await checkWithFetch(
        "https://status.aws.amazon.com/favicon.ico",
        "HEAD"
      );
      const azureCheck = await checkWithFetch(
        "https://status.azure.com/favicon.ico",
        "HEAD"
      );
      cloudServicesAvailable = awsCheck || azureCheck;
    } catch (e) {
      // If this fails, assume cloud services might be having issues but internet works
      cloudServicesAvailable = false;
    }
  }

  const endTime = performance.now();

  return {
    internetAvailable,
    cloudServicesAvailable,
    checkTimestamp: Date.now(),
    timeToCheck: endTime - startTime,
  };
}

/**
 * Check connectivity using fetch API with timeout
 */
async function checkWithFetch(
  url: string,
  method: string = "HEAD"
): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5 second timeout

  try {
    const response = await fetch(`${url}?_=${Date.now()}`, {
      method,
      mode: "no-cors",
      signal: controller.signal,
      cache: "no-cache",
      credentials: "omit",
    });

    clearTimeout(timeoutId);
    return true; // If we get here without exception, internet is working
  } catch (e) {
    clearTimeout(timeoutId);
    return false;
  }
}

/**
 * Check connectivity by loading an image
 * This typically works even with CORS restrictions
 */
async function checkWithImage(url: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const img = new Image();
    const timeoutId = setTimeout(() => resolve(false), 2500); // 2.5 second timeout

    img.onload = () => {
      clearTimeout(timeoutId);
      resolve(true);
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve(false);
    };

    img.src = `${url}?_=${Date.now()}`;
  });
}

/**
 * Determine the type of error based on the error object and message
 * with enhanced connectivity checking
 */
export async function categorizeErrorWithConnectivityCheck(
  error: Error
): Promise<ErrorTypeInfo> {
  const message = error.message.toLowerCase();

  // Network or connection related errors need enhanced checking
  const isConnectionRelatedError =
    message.includes("network") ||
    message.includes("offline") ||
    message.includes("internet") ||
    message.includes("failed to fetch") ||
    message.includes("econnrefused") ||
    message.includes("cannot connect") ||
    message.includes("connection refused") ||
    message.includes("timeout") ||
    message.includes("socket") ||
    !navigator.onLine; // Also check device reported offline state

  if (isConnectionRelatedError) {
    // Perform detailed connectivity check
    const connectivityResult = await checkInternetConnectivity();
    console.log("Connectivity check result:", connectivityResult);

    if (!connectivityResult.internetAvailable) {
      // True network issue - completely offline
      return {
        type: ErrorType.NETWORK,
        title: "Network Connection Lost",
        description:
          "We can't reach the internet. Your device appears to be offline or experiencing connectivity issues.",
        suggestedAction: "Please check your internet connection and try again.",
        logLevel: "warning",
      };
    } else if (!connectivityResult.cloudServicesAvailable) {
      // Internet works but cloud services might be down
      return {
        type: ErrorType.BACKEND,
        title: "Cloud Service Disruption",
        description:
          "Your internet connection is working, but we're detecting issues with cloud services that power our application.",
        suggestedAction:
          "This might be a temporary cloud provider issue. Please try again in a few minutes.",
        logLevel: "error",
      };
    } else {
      // Internet and cloud services work, but our specific backend doesn't
      return {
        type: ErrorType.BACKEND,
        title: "Server Connection Error",
        description:
          "We can't reach our application servers, though your internet connection appears to be working normally.",
        suggestedAction:
          "Our servers may be experiencing issues. Please try again later or contact support.",
        logLevel: "error",
      };
    }
  }

  // For timeout errors that weren't caught by the connectivity check
  if (
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("too long") ||
    message.includes("408")
  ) {
    return {
      type: ErrorType.TIMEOUT,
      title: "Request Timeout",
      description:
        "The server took too long to respond to your request. This could be due to high server load or network congestion.",
      suggestedAction:
        "Please try again later or contact support if the issue persists.",
      logLevel: "warning",
    };
  }

  // For non-connection errors, use the original categorization
  return categorizeError(error);
}

/**
 * Original sync error categorization (still used as fallback)
 * Determine the type of error based on the error object and message
 */
export function categorizeError(error: Error): ErrorTypeInfo {
  const message = error.message.toLowerCase();

  // Network connectivity issues
  if (
    !navigator.onLine ||
    message.includes("network") ||
    message.includes("offline") ||
    message.includes("internet")
  ) {
    return {
      type: ErrorType.NETWORK,
      title: "Network Connection Lost",
      description:
        "We can't reach the internet. Please check your connection and try again.",
      suggestedAction: "Check your internet connection and try again.",
      logLevel: "warning",
    };
  }

  // Backend connectivity issues
  if (
    message.includes("failed to fetch") ||
    message.includes("econnrefused") ||
    message.includes("cannot connect") ||
    message.includes("connection refused")
  ) {
    return {
      type: ErrorType.BACKEND,
      title: "Server Connection Error",
      description:
        "We can't reach the application servers. This could be due to maintenance or server issues.",
      suggestedAction:
        "Please try again later or contact support if the issue persists.",
      logLevel: "error",
    };
  }

  // Authentication issues
  if (
    message.includes("unauthorized") ||
    message.includes("auth") ||
    message.includes("401") ||
    message.includes("login") ||
    message.includes("token") ||
    message.includes("session")
  ) {
    return {
      type: ErrorType.AUTHENTICATION,
      title: "Authentication Error",
      description:
        "Your session may have expired or you're not authorized to access this resource.",
      suggestedAction: "Please log in again to continue.",
      logLevel: "warning",
    };
  }

  // Permission issues
  if (
    message.includes("forbidden") ||
    message.includes("permission") ||
    message.includes("403") ||
    message.includes("access denied")
  ) {
    return {
      type: ErrorType.PERMISSION,
      title: "Access Denied",
      description:
        "You don't have permission to access this resource or perform this action.",
      suggestedAction: "Contact your administrator if you need access.",
      logLevel: "warning",
    };
  }

  // Resource not found
  if (
    message.includes("not found") ||
    message.includes("404") ||
    message.includes("missing")
  ) {
    return {
      type: ErrorType.NOT_FOUND,
      title: "Resource Not Found",
      description: "The requested resource could not be found on the server.",
      suggestedAction: "Check the URL or resource identifier and try again.",
      logLevel: "warning",
    };
  }

  // Validation errors
  if (
    message.includes("validation") ||
    message.includes("invalid") ||
    message.includes("422")
  ) {
    return {
      type: ErrorType.VALIDATION,
      title: "Validation Error",
      description: "The data you provided is invalid or incomplete.",
      suggestedAction: "Please check your input and try again.",
      logLevel: "info",
    };
  }

  // Timeout errors
  if (
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("too long") ||
    message.includes("408")
  ) {
    return {
      type: ErrorType.TIMEOUT,
      title: "Request Timeout",
      description: "The server took too long to respond to your request.",
      suggestedAction:
        "Please try again later or contact support if the issue persists.",
      logLevel: "warning",
    };
  }

  // Default - internal server error
  return {
    type: ErrorType.INTERNAL,
    title: "Application Error",
    description: "Something went wrong while processing your request.",
    suggestedAction:
      "Please try again or contact support if the issue persists.",
    logLevel: "error",
  };
}

/**
 * Get troubleshooting steps based on error type
 * @deprecated This function is maintained for backward compatibility
 * but is no longer used in the updated error UI
 */
export function getTroubleshootingSteps(errorType: ErrorType): string[] {
  return [];
}
