"use client";

import { useImages } from "@/components/AnnotationCanvas/ImagesNav/useImages";
import ImageElement from "@/components/ImageViewer/ImageElement";
import ImageViewer from "@/components/ImageViewer/ImageViewer";
import Loader from "@/components/loader";
import Toast, { ToastContainer, ToastType } from "@/components/Toast";
import UploadBtn from "@/components/UploadBtn";
import { ApiImage } from "@/lib/api";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ImagesContent() {
  const [selectedImage, setSelectedImage] = useState<ApiImage | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadingState, setUploadingState] = useState(false);
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: ToastType }>
  >([]);
  const [error, setError] = useState<Error | null>(null);

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const {
    images,
    pageLength,
    isLoading,
    isError,
    loadNextPage,
    handleUploadImage: uploadImage,
    handleDeleteImage: deleteImage,
  } = useImages(addToast);

  // Calculate if there are more images to load
  const hasMoreImages = images.length < pageLength;

  // Handle any errors from the useImages hook
  useEffect(() => {
    if (isError) {
      setError(new Error(isError));
    }
  }, [isError]);

  // Throw any errors to be caught by the error boundary
  if (error) {
    throw error;
  }

  const filteredImages = images.filter((image) =>
    image.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            Histology Library
          </h1>
          <p className="mt-1" style={{ color: "var(--text-muted)" }}>
            Browse and manage your histology images. Upload new images to expand
            our database.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <UploadBtn
            label="Upload Image"
            showIcon={true}
            onSuccess={(image) => {
              addToast(
                `Image ${image.filename} uploaded successfully`,
                "success"
              );
            }}
            onError={(err) => {
              console.error("Error uploading image:", err);
              addToast("Failed to upload image", "error");
            }}
            onUploadStart={() => setUploadingState(true)}
            onUploadEnd={() => setUploadingState(false)}
            uploadImage={async (file) => {
              try {
                await uploadImage(file);
                return true;
              } catch (error) {
                console.error("Upload failed:", error);
                return false;
              }
            }}
          />

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search images..."
              style={{
                background: "var(--input-bg)",
                color: "var(--foreground)",
                borderColor: "var(--card-border)",
              }}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5"
              style={{ color: "var(--text-muted)" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>

          <div
            className="flex items-center space-x-2 rounded-lg p-1"
            style={{ background: "var(--input-bg)" }}
          >
            <button
              onClick={() => setViewMode("grid")}
              style={{
                background:
                  viewMode === "grid" ? "var(--card-bg)" : "transparent",
                color:
                  viewMode === "grid"
                    ? "var(--foreground)"
                    : "var(--text-muted)",
              }}
              className={`p-2 rounded-md ${
                viewMode === "grid" ? "shadow" : "hover:text-gray-700"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              style={{
                background:
                  viewMode === "list" ? "var(--card-bg)" : "transparent",
                color:
                  viewMode === "list"
                    ? "var(--foreground)"
                    : "var(--text-muted)",
              }}
              className={`p-2 rounded-md ${
                viewMode === "list" ? "shadow" : "hover:text-gray-700"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        style={{ background: "var(--card-bg)" }}
        className="rounded-lg shadow-md"
      >
        {isLoading && images.length === 0 ? (
          <div className="h-64">
            <Loader message="Loading images library..." />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 px-4 text-center">
            {searchQuery ? (
              <>
                <svg
                  className="w-16 h-16 mb-4"
                  style={{ color: "var(--text-muted)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  ></path>
                </svg>
                <h3
                  className="text-xl font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  No images found
                </h3>
                <p style={{ color: "var(--text-muted)" }} className="mt-1">
                  No images match your search query. Try another search term.
                </p>
              </>
            ) : (
              <>
                <svg
                  className="w-16 h-16 mb-4"
                  style={{ color: "var(--text-muted)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  ></path>
                </svg>
                <h3
                  className="text-xl font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  No images available
                </h3>
                <p style={{ color: "var(--text-muted)" }} className="mt-1">
                  Upload new images to start building your library.
                </p>
              </>
            )}
          </div>
        ) : (
          <div
            className={`p-6 ${viewMode === "grid" ? "grid-view" : "list-view"}`}
          >
            <div
              className="flex justify-between items-center px-4 m-3 pb-4"
              style={{ borderBottom: "1px solid var(--card-border)" }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center justify-center text-sm font-medium px-2.5 py-1 rounded-md"
                  style={{
                    background: "var(--button-secondary)",
                    color: "var(--foreground)",
                  }}
                >
                  {filteredImages.length}
                </span>
                <span
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  of {pageLength} images
                </span>
              </div>
            </div>

            {viewMode === "grid" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 p-4">
                  {filteredImages.map((image) => (
                    <ImageElement
                      key={image.id}
                      image={image}
                      setSelectedImage={setSelectedImage}
                    />
                  ))}
                </div>
                {isLoading && images.length > 0 && (
                  <div className="flex justify-center py-8">
                    <div
                      className="flex items-center justify-center gap-3 text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <div
                        className="w-5 h-5 border-2 border-t-blue-600 rounded-full animate-spin"
                        style={{
                          borderColor: "var(--accent)",
                          borderTopColor: "var(--button-primary)",
                        }}
                      ></div>
                      <span>Loading more images...</span>
                    </div>
                  </div>
                )}
                {hasMoreImages && !isLoading && (
                  <div className="flex justify-center mt-8 mb-2">
                    <button
                      onClick={loadNextPage}
                      style={{
                        background: "var(--button-primary)",
                        color: "white",
                      }}
                      className="group inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg shadow-sm transition-all duration-200 ease-in-out gap-2 hover:shadow-md disabled:opacity-50"
                    >
                      <span>Load More</span>
                      <span
                        className="inline-flex items-center justify-center text-white text-xs font-medium px-2 py-0.5 rounded-md"
                        style={{ background: "var(--button-secondary)" }}
                      >
                        {pageLength - filteredImages.length}
                      </span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Preview
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredImages.map((image) => (
                      <tr
                        key={image.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => setSelectedImage(image)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-12 w-12 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                            <Image
                              src={image.src}
                              alt={image.filename}
                              className="h-full w-full object-cover"
                              width={48}
                              height={48}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {image.filename.split(".")[0]}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {image.is_done ? "Processed" : "Pending"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <button
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImage(image);
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {isLoading && images.length > 0 && (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                      <span>Loading more images...</span>
                    </div>
                  </div>
                )}
                {hasMoreImages && !isLoading && (
                  <div className="flex justify-center mt-8 mb-2">
                    <button
                      onClick={loadNextPage}
                      disabled={isLoading}
                      className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 rounded-lg shadow-sm transition-all duration-200 ease-in-out gap-2 hover:shadow-md disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <span>Load More</span>
                          <span className="inline-flex items-center justify-center bg-blue-500/20 text-white text-xs font-medium px-2 py-0.5 rounded-md">
                            {pageLength - filteredImages.length}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedImage && (
        <ImageViewer
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onDelete={async (id: number, filename: string) => {
            const success = await deleteImage(id, filename);
            if (success) {
              setSelectedImage(null);
            }
            return success;
          }}
        />
      )}

      {uploadingState && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
            <Loader message="Uploading image..." />
          </div>
        </div>
      )}

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

      <style jsx>{`
        .grid-view {
          padding: 2px;
        }

        .list-view {
          overflow-y: visible;
        }

        /* Override LoadingState styles for this component */
        :global(.loading-state-container) {
          height: 100%;
          background-color: transparent;
        }

        :global(.h-64 .loading-state-container) {
          height: 16rem;
        }
      `}</style>
    </div>
  );
}
