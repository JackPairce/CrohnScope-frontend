"use client";

import ConfirmDialog, { DialogAction } from "@/components/ConfirmDialog";
import Toast, { ToastContainer, ToastType } from "@/components/Toast";
import { useAnnotationContext } from "@/contexts/AnnotationContext";
import { ApiImage } from "@/lib/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useState } from "react";
import EmptyState from "./EmptyState";
import ImageItem from "./ImageItem";
import LoadingState from "./LoadingState";
import LoadMore from "./LoadMore";
import SectionHeader from "./SectionHeader";
import "./styles.scss";
import { useImages } from "./useImages";

type ImageSwitchChoice = "stay" | "continue-without-save" | "save-and-continue";

interface DialogConfig {
  isOpen: boolean;
  title?: string;
  message?: string;
  dialogType?: "warning" | "danger" | "info";
  actions?: DialogAction<ImageSwitchChoice>[];
  onClose?: (value: ImageSwitchChoice) => void;
}

interface ImagesNavProps {
  setImage: (image: ApiImage) => void;
  saveCurrent?: () => Promise<void>;
}

const queryClient = new QueryClient();

export default function ImagesNav() {
  const { setCurrentImage, saveCurrent } = useAnnotationContext();
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
          setImage={setCurrentImage}
          saveCurrent={saveCurrent}
        />
        <ImagesSection
          hide={!hide}
          setHide={setHide}
          done
          addToast={addToast}
          setImage={setCurrentImage}
          saveCurrent={saveCurrent}
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
  setImage: (image: ApiImage) => void;
  saveCurrent?: () => Promise<void>;
}

function ImagesSection({
  done,
  hide,
  setHide,
  addToast,
  setImage,
  saveCurrent,
}: ImagesSectionProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Image switching is now entirely handled by the AnnotationContext
  // with its own dialog and state management

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
          dialogType="danger"
          actions={[
            {
              label: "Cancel",
              value: false,
              type: "default",
              autoFocus: true,
            },
            {
              label: "Delete",
              value: true,
              type: "danger",
            },
          ]}
          onClose={(confirmed: boolean) => {
            if (confirmed) {
              handleConfirmDelete();
            } else {
              handleCancelDelete();
            }
          }}
        />
      )}

      <SectionHeader
        isDone={!!done}
        isCollapsed={hide}
        count={Number.isNaN(pageLength) ? 0 : pageLength}
        onToggle={() => setHide(!hide)}
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
