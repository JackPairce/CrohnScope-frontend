"use client";

import { DialogAction } from "@/components/ConfirmDialog";
import Toast, { ToastContainer, ToastType } from "@/components/Toast";
import { useAnnotationContext } from "@/contexts/AnnotationContext";
import { ApiImage, process_type } from "@/lib/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import EmptyState from "./EmptyState";
import ImageItem from "./ImageItem";
import LoadingState from "./LoadingState";
import LoadMore from "./LoadMore";
import SectionHeader from "./SectionHeader";
import "./styles.scss";
import { useImages } from "./useImages";

const queryClient = new QueryClient();

export default function ImagesNav({ which }: { which: process_type }) {
  const [hide, setHide] = useState(false);
  const addToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: ToastType }>
  >([]);
  const [forceRefresh, setForceRefresh] = useState(0); // Counter to force refresh of images
  // Listen for imageCompleted events to move images between lists
  useEffect(() => {
    // Define the type for our custom event
    type ImageCompletedEvent = CustomEvent<{
      imageId: number;
      image: ApiImage;
    }>;

    const handleImageCompleted = (event: ImageCompletedEvent) => {
      // Force a refresh of both image lists
      setForceRefresh((prev) => prev + 1);

      // Show a toast notification
      addToast(
        `Image ${event.detail.image.filename} marked as completed!`,
        "success"
      );
    };

    // Add event listener
    window.addEventListener(
      "imageCompleted",
      handleImageCompleted as EventListener
    );

    // Clean up
    return () => {
      window.removeEventListener(
        "imageCompleted",
        handleImageCompleted as EventListener
      );
    };
  }, [addToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <QueryClientProvider client={queryClient}>
      {" "}
      <section className="images-nav">
        <ImagesSection
          which={which}
          hide={hide}
          setHide={setHide}
          addToast={addToast}
          refreshCounter={forceRefresh}
        />
        <ImagesSection
          which={which}
          hide={!hide}
          setHide={setHide}
          done
          addToast={addToast}
          refreshCounter={forceRefresh}
        />
      </section>
      <ToastContainer>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </ToastContainer>
    </QueryClientProvider>
  );
}

interface ImagesSectionProps {
  which: process_type;
  done?: boolean;
  hide: boolean;
  setHide: Dispatch<SetStateAction<boolean>>;
  addToast: (message: string, type: ToastType) => void;
  refreshCounter: number; // Counter to force refresh of images
}

function ImagesSection({
  which,
  done,
  hide,
  setHide,
  addToast,
  refreshCounter,
}: ImagesSectionProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const { images, isLoading, isError, pageLength, loadNextPage, selectImage } =
    useImages(which, !!done, addToast, refreshCounter);

  // Create a wrapper for the selectImage function to avoid re-selecting current image
  const handleSelectImage = async (image: ApiImage, index: number) => {
    // If this image is already selected, do nothing
    if (selectedImage === index) {
      return;
    }
    // Otherwise, select the image
    selectImage(image)
      .then((selected) => {
        if (selected) setSelectedImage(index);
      })
      .catch((error) => {
        console.error("Error selecting image:", error);
      });
  };

  // Display loading state for initial load
  if (isLoading && images.length === 0) {
    return !done && <LoadingState />;
  }

  if (isError) {
    return <p>Error loading images: {isError}</p>;
  }

  return (
    <>
      <SectionHeader
        isDone={!!done}
        isCollapsed={hide}
        count={Number.isNaN(pageLength) ? 0 : pageLength}
        onToggle={() => setHide(!hide)}
      />

      {!hide && (
        <>
          {images.length > 0 ? (
            <div className="images-container">
              <ul className="images-grid">
                {" "}
                {images.map((image, index) => (
                  <ImageItem
                    key={index}
                    image={image}
                    isSelected={selectedImage === index}
                    onSelect={() => handleSelectImage(image, index)}
                  />
                ))}
              </ul>
            </div>
          ) : (
            <EmptyState isDone={!!done} />
          )}

          {pageLength > images.length && (
            <LoadMore
              isLoading={isLoading}
              currentCount={images.length}
              totalCount={pageLength}
              onLoadMore={loadNextPage}
            />
          )}
        </>
      )}
    </>
  );
}
