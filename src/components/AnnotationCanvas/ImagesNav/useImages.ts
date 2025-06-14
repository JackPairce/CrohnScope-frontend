// Generated by Copilot
import { ToastType } from "@/components/Toast";
import {
  ApiImage,
  deleteImage,
  getAllImages,
  getImages,
  process_type,
  uploadImage,
} from "@/lib/api";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  formatImageForDisplay,
  parseApiError,
  validateImageFile,
} from "./imageUtils";
import { useAnnotationContext } from "@/contexts/AnnotationContext";

interface UseImagesResult {
  images: ApiImage[];
  isLoading: boolean;
  isError: string;
  pageLength: number;
  page: number;
  loadNextPage: () => void;
  selectImage: (image: ApiImage) => Promise<boolean>;
  handleUploadImage: (file: File) => Promise<void>;
  handleDeleteImage: (imageId: number, imageName: string) => Promise<boolean>;
}

export function useImages(
  which: process_type | "all",
  done: boolean = false,
  addToast: (message: string, type: ToastType) => void,
  refreshCounter: number = 0
): UseImagesResult {
  const { setCurrentImage } = useAnnotationContext();
  const [isError, setIsError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState<ApiImage[]>([]);
  const [page, setPage] = useState(1);
  const [pageLength, setPageLength] = useState(NaN);
  const selectImage = useCallback(
    async (imgData: ApiImage): Promise<boolean> => {
      try {
        return await setCurrentImage(imgData);
      } catch (error) {
        console.error("Error selecting image:", error);
        return false;
      }
    },
    [setCurrentImage, addToast]
  );

  const loadNextPage = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setPage((prev) => prev + 1);
    }, 200);
  }, []);
  // Load images on component mount, when page changes, and when refreshCounter changes
  useEffect(() => {
    setIsLoading(true);
    (which == "all" ? getAllImages(page) : getImages(page, which, done))
      .then((res) => {
        if (res.total !== pageLength) setPageLength(res.total);
        setImages((prev) => [
          // For page 1, replace existing images, for others append
          ...(page === 1 ? [] : prev),
          ...res.images.map((item) => formatImageForDisplay(item)),
        ]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsError(error.message || "Failed to load images");
        setIsLoading(false);
      });
  }, [page, done, pageLength, refreshCounter]);

  const handleUploadImage = useCallback(
    async (file: File) => {
      // Validate the file
      const validationError = validateImageFile(file);
      if (validationError) {
        addToast(validationError, "error");
        return;
      }

      try {
        setIsLoading(true);

        // Display initial upload toast
        addToast(`Uploading ${file.name}...`, "info");

        // convert the image to a base64 string
        const FR = new FileReader();
        FR.readAsDataURL(file);
        FR.onload = async () => {
          const base64Image = FR.result as string;

          // Upload the image using the API
          const Image = await uploadImage({
            base64_data: base64Image,
          });

          // Add the new image to the beginning of the list
          setImages((prev) => [Image, ...prev]);
          setPageLength((prev) => prev + 1);

          // Show a success toast
          addToast(
            `Image "${Image.filename.split(".")[0]}" uploaded successfully`,
            "success"
          );
        };
      } catch (error) {
        console.error("Error uploading image:", error);
        addToast(parseApiError(error), "error");
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, setImages, setPageLength, setIsLoading]
  );

  const handleDeleteImage = useCallback(
    async (imageId: number, imageName: string) => {
      try {
        // Call the deleteImage API
        await deleteImage(imageId);

        // After successful deletion
        setImages((prevImages) =>
          prevImages.filter((img) => img.id !== imageId)
        );
        setPageLength((prev) => prev - 1);

        // Show success notification
        addToast(`Image "${imageName}" deleted successfully`, "success");
        return true;
      } catch (error) {
        console.error("Error deleting image:", error);
        addToast(parseApiError(error), "error");
        return false;
      }
    },
    [addToast]
  );

  // This should be removed - the confirmImageSwitch function is now provided as a prop

  return {
    images,
    isLoading,
    isError,
    pageLength,
    page,
    loadNextPage,
    selectImage,
    handleUploadImage,
    handleDeleteImage,
  };
}
