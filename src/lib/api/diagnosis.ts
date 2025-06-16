import apiClient from "./client";

/**
 * Interface for diagnosis result
 */
export interface DiagnosisArea {
  x: number;
  y: number;
  width: number;
  height: number;
  severity: number;
  label: string;
}

export interface Diagnosis {
  disease: string;
  phase: number;
  severity: number; // 0-100% severity score
  report: string; // Textual report of the diagnosis
}

export interface DiagnosisResult {
  id: string;
  patientId?: string;
  imageId: string;
  heatmapUrl: string;
  diagnosis: Diagnosis | null;
  confidence: number;
  createdAt: string;
  status: "pending" | "processing" | "completed" | "failed";
  areas: DiagnosisArea[];
  metadata?: Record<string, any>;
}

/**
 * Submit image for diagnosis
 * @param imageFile - The image file to diagnose
 * @param patientId - Optional patient ID to associate with diagnosis
 * @returns Promise with diagnosis result
 */
export const submitDiagnosis = async (
  imageFile: File,
  patientId?: string
): Promise<DiagnosisResult> => {
  const formData = new FormData();
  formData.append("image", imageFile);

  if (patientId) {
    formData.append("patientId", patientId);
  }

  const response = await apiClient.post<DiagnosisResult>(
    "/diagnosis/submit",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

/**
 * Get diagnosis by ID
 * @param diagnosisId - The ID of the diagnosis to retrieve
 * @returns Promise with diagnosis result
 */
export const getDiagnosis = async (
  diagnosisId: string
): Promise<DiagnosisResult> => {
  const response = await apiClient.get<DiagnosisResult>(
    `/diagnosis/${diagnosisId}`
  );
  return response.data;
};

/**
 * Get diagnoses for a patient
 * @param patientId - The ID of the patient
 * @returns Promise with array of diagnosis results
 */
export const getPatientDiagnoses = async (
  patientId: string
): Promise<DiagnosisResult[]> => {
  const response = await apiClient.get<DiagnosisResult[]>(
    `/diagnosis/patient/${patientId}`
  );
  return response.data;
};

/**
 * Get recent diagnoses
 * @param limit - Maximum number of results to return
 * @returns Promise with array of diagnosis results
 */
export const getRecentDiagnoses = async (
  limit: number = 10
): Promise<DiagnosisResult[]> => {
  const response = await apiClient.get<DiagnosisResult[]>(
    `/diagnosis/recent?limit=${limit}`
  );
  return response.data;
};

/**
 * Generate a mock diagnosis result with random values
 * @param imageFile - The image file to create a mock diagnosis for
 * @param status - Optional status to set (defaults to "pending")
 * @returns A mock diagnosis result
 */
const generateMockDiagnosis = (
  imageFile: File,
  status: "pending" | "processing" | "completed" | "failed" = "pending"
): DiagnosisResult => {
  // Generate a random ID
  const id = Math.random().toString(36).substring(2, 15);
  const imageId = Math.random().toString(36).substring(2, 10);

  // Create object URL for the image
  const imageUrl = URL.createObjectURL(imageFile);

  // Generate random severity (0-100)
  const severity = Math.floor(Math.random() * 101);

  // Generate random confidence (0-1)
  const confidence = parseFloat((0.7 + Math.random() * 0.3).toFixed(2));

  // Generate random areas
  const areaCount = Math.floor(Math.random() * 3) + 1; // 1-3 areas
  const areas = [];

  for (let i = 0; i < areaCount; i++) {
    areas.push({
      x: Math.floor(Math.random() * 500),
      y: Math.floor(Math.random() * 500),
      width: Math.floor(Math.random() * 100) + 50,
      height: Math.floor(Math.random() * 100) + 50,
      severity: Math.floor(Math.random() * 101),
      label: ["Inflammation", "Ulceration", "Stricture", "Lesion"][
        Math.floor(Math.random() * 4)
      ],
    });
  }

  // Generate diagnosis text based on severity
  let diagnosis: Diagnosis | null = null;
  const isDiseaseDetected = severity > 10; // Arbitrary threshold for disease detection
  if (isDiseaseDetected) {
    diagnosis = {
      disease: ["Crohn's disease", "Ulcerative colitis"][
        Math.floor(Math.random() * 2)
      ],
      phase: Math.floor(Math.random() * 4) + 1, // Random phase 1-4
      report: [
        "Mild indications of Histo's disease. Recommend follow-up in 6 months.",
        "Moderate Histo's disease activity detected. Consider anti-inflammatory treatment.",
        "Severe Histo's disease with significant inflammation. Immediate treatment recommended.",
        "Critical condition detected. Extensive inflammation and tissue damage. Urgent intervention required.",
      ][(severity % 10) % 4], // Random report based on severity
      severity: severity, // Use the generated severity
    };
  }

  return {
    id,
    imageId,
    heatmapUrl: imageUrl, // In a real scenario, this would be a heatmap version
    diagnosis,
    confidence,
    createdAt: new Date().toISOString(),
    status,
    areas,
  };
};

/**
 * Mock submit diagnosis function
 * @param imageFile - The image file to diagnose
 * @returns Promise with mock diagnosis result
 */
export const mockSubmitDiagnosis = async (
  imageFile: File
): Promise<DiagnosisResult> => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockResult = generateMockDiagnosis(imageFile, "pending");
      resolve(mockResult);
    }, 1500); // 1.5 second delay
  });
};

/**
 * Mock get diagnosis function
 * @param diagnosisId - The ID of the diagnosis to retrieve
 * @param mockImage - The original image file (needed for consistent URLs)
 * @returns Promise with mock diagnosis result
 */
export const mockGetDiagnosis = async (
  diagnosisId: string,
  mockDiagnosis: DiagnosisResult
): Promise<DiagnosisResult> => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // 50% chance that the status is now "completed"
      if (Math.random() > 0.5) {
        resolve({
          ...mockDiagnosis,
          status: "completed",
        });
      } else {
        // Otherwise keep it as "processing"
        resolve({
          ...mockDiagnosis,
          status: "processing",
        });
      }
    }, 2000); // 2 second delay
  });
};

// Store mock diagnosis in a more reliable way, using window object when available
let lastMockDiagnosis: DiagnosisResult | null = null;
let mockPollCount = 0;

// Export as a named object for consistency with other API modules
export const diagnosisApi = {
  // Always use mock implementation for now
  submitDiagnosis: async (imageFile: File): Promise<DiagnosisResult> => {
    try {
      // Reset poll count for new diagnosis
      mockPollCount = 0;

      // Generate mock result
      const mockResult = generateMockDiagnosis(imageFile, "pending");
      lastMockDiagnosis = mockResult;

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return mockResult;
    } catch (error) {
      console.error("Error in mock submitDiagnosis:", error);
      throw error;
    }
  },

  getDiagnosis: async (diagnosisId: string): Promise<DiagnosisResult> => {
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Increment poll count
      mockPollCount++;

      // If we have a stored diagnosis, use it as base
      if (lastMockDiagnosis) {
        // After 2 polls, complete the diagnosis
        if (mockPollCount >= 2) {
          return {
            ...lastMockDiagnosis,
            status: "completed",
          };
        }

        // Otherwise return the diagnosis as processing
        return {
          ...lastMockDiagnosis,
          status: "processing",
        };
      }

      // Fallback if no diagnosis is stored
      return generateMockDiagnosis(
        new File([""], "mock.jpg"),
        mockPollCount >= 2 ? "completed" : "processing"
      );
    } catch (error) {
      console.error("Error in mock getDiagnosis:", error);
      throw error;
    }
  },

  getPatientDiagnoses,
  getRecentDiagnoses,
};
