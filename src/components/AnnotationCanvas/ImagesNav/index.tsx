"use client";

import ConfirmDialog from "@/components/ConfirmDialog";
import Toast, { ToastContainer, ToastType } from "@/components/Toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useState } from "react";
import EmptyState from "./EmptyState";
import ImageItem from "./ImageItem";
import LoadingState from "./LoadingState";
import LoadMore from "./LoadMore";
import SectionHeader from "./SectionHeader";
import "./styles.scss";
import { useImages } from "./useImages";
import { ApiImage } from "../api";

const queryClient = new QueryClient();

export default function ImagesNav({
  setImage,
}: {
  setImage: Dispatch<SetStateAction<ApiImage | null>>;
}) {
  const [hide, setHide] = useState(false);
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: ToastType }>
  >([]);

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <section className="images-nav">
        <ImagesSection
          hide={hide}
          setHide={setHide}
          addToast={addToast}
          setImage={setImage}
        />
        <ImagesSection
          hide={!hide}
          setHide={setHide}
          done
          addToast={addToast}
          setImage={setImage}
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

function ImagesSection({
  done,
  hide,
  setHide,
  addToast,
  setImage,
}: {
  hide: boolean;
  setHide: Dispatch<SetStateAction<boolean>>;
  done?: true;
  addToast: (message: string, type: ToastType) => void;
  setImage: Dispatch<SetStateAction<ApiImage | null>>;
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Use our custom hook for image operations
  const {
    images,
    isLoading,
    isError,
    pageLength,
    selectedImage,
    loadNextPage,
    selectImage,
    handleUploadImage,
    handleDeleteImage,
  } = useImages(!!done, addToast, setImage);

  const handleDeleteClick = (
    e: React.MouseEvent,
    imageId: number,
    imageName: string
  ) => {
    e.stopPropagation();
    setImageToDelete({ id: imageId, name: imageName });
    setDeleteDialogOpen(true);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setImageToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!imageToDelete) return;

    setDeleteDialogOpen(false);

    try {
      // Find the image element by ID
      const imageElement = document.querySelector(
        `li[data-image-id="${imageToDelete.id}"]`
      );
      if (imageElement) {
        imageElement.classList.add("deleting");
      }

      // Delete the image
      const success = await handleDeleteImage(
        imageToDelete.id,
        imageToDelete.name
      );

      // If deletion failed, remove the deleting class
      if (!success) {
        const imageElement = document.querySelector(
          `li[data-image-id="${imageToDelete.id}"]`
        );
        if (imageElement) {
          imageElement.classList.remove("deleting");
        }
      }
    } finally {
      setImageToDelete(null);
    }
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
      {deleteDialogOpen && imageToDelete && (
        <ConfirmDialog
          isOpen={deleteDialogOpen}
          title="Delete Image"
          message={`Are you sure you want to delete "${imageToDelete.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          type="danger"
        />
      )}

      <SectionHeader
        isDone={!!done}
        isCollapsed={hide}
        count={Number.isNaN(pageLength) ? 0 : pageLength}
        onToggle={() => setHide((prev) => !prev)}
        onUpload={!done ? handleUploadImage : undefined}
      />

      {!hide && (
        <>
          {images.length > 0 ? (
            <div className="images-container">
              <ul className="images-grid">
                {images.map((image, index) => (
                  <ImageItem
                    key={index}
                    image={image}
                    isSelected={selectedImage === index}
                    onSelect={() => selectImage(image, index)}
                    onDeleteClick={(e) =>
                      handleDeleteClick(
                        e,
                        image.id,
                        image.filename.split(".")[0]
                      )
                    }
                  />
                ))}
              </ul>
            </div>
          ) : (
            <EmptyState
              isDone={!!done}
              onUpload={!done ? handleUploadImage : undefined}
            />
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
