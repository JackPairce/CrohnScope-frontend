"use client";

import Toast, { ToastContainer, ToastType } from "@/components/Toast";
import { useAnnotationContext } from "@/contexts/AnnotationContext";
import { ApiImage } from "@/lib/api";
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

export default function ImagesNav() {
  const [hide, setHide] = useState(false);
  const addToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: ToastType }>
  >([]);
  const {
    states: { forceImagesRefresh },
    actions: { setCurrentImage },
  } = useAnnotationContext();
  const [oldStateRefresh, setOldStateRefresh] = useState(forceImagesRefresh);

  useEffect(() => {
    // Show a toast notification
    if (forceImagesRefresh > oldStateRefresh) {
      addToast(`Image marked as completed!`, "success");
      // Reset the current image when a new image is marked as completed
      setCurrentImage(null);
    } else if (forceImagesRefresh < oldStateRefresh) {
      addToast(`Mask is saved!`, "info");
    }
    setOldStateRefresh(forceImagesRefresh);
  }, [forceImagesRefresh]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <QueryClientProvider client={queryClient}>
      {" "}
      <section className="images-nav">
        <ImagesSection
          hide={hide}
          setHide={setHide}
          addToast={addToast}
          refreshCounter={forceImagesRefresh}
        />
        <ImagesSection
          hide={!hide}
          setHide={setHide}
          done
          addToast={addToast}
          refreshCounter={forceImagesRefresh}
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
  done?: boolean;
  hide: boolean;
  setHide: Dispatch<SetStateAction<boolean>>;
  addToast: (message: string, type: ToastType) => void;
  refreshCounter: number; // Counter to force refresh of images
}

function ImagesSection({
  done,
  hide,
  setHide,
  addToast,
  refreshCounter,
}: ImagesSectionProps) {
  const {
    images,
    isLoading,
    isError,
    pageLength,
    selectedImage,
    loadNextPage,
    selectImage,
    setSelectedImage,
  } = useImages(!!done, addToast, refreshCounter);

  // Create a wrapper for the selectImage function to avoid re-selecting current image
  const handleSelectImage = async (image: ApiImage, id: number) => {
    // If this image is already selected, do nothing
    if (selectedImage === id) {
      return;
    }
    // Otherwise, select the image
    selectImage(image)
      .then((selected) => {
        if (selected) setSelectedImage(id);
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
        onToggle={() => setHide((prev) => !prev)}
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
                    isSelected={selectedImage === image.id}
                    onSelect={() => handleSelectImage(image, image.id)}
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
