"use client";

import { ApiImage, getImages } from "@/components/AnnotationCanvas/api";
import { useData } from "@/components/AnnotationCanvas/DataContext";
import Loader from "@/components/loader";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import "./styles.scss";

const queryClient = new QueryClient();

export default function ImagesNav() {
  const [hide, setHide] = useState(false);
  return (
    <QueryClientProvider client={queryClient}>
      <aside>
        <Imagesnav hide={hide} setHide={setHide} />
        <Imagesnav hide={!hide} setHide={setHide} done />
      </aside>
    </QueryClientProvider>
  );
}

function Imagesnav({
  done,
  hide,
  setHide,
}: {
  hide: boolean;
  setHide: Dispatch<SetStateAction<boolean>>;
  done?: true;
}) {
  const { setImg } = useData();
  const [isError, setIsError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(NaN);
  const [images, setImages] = useState<(ApiImage & { mimetype: string })[]>([]);
  const [page, setPage] = useState(1);
  const [pageLength, setPageLength] = useState(NaN);

  const NextPage = () => {
    setPage((prev) => prev + 1);
  };

  const SelectImage = async (imgData: ApiImage, index: number) => {
    setSelectedImage(index);
    setImg(imgData);
  };

  useEffect(() => {
    setIsLoading(true);
    getImages(page, done)
      .then((res) => {
        if (res.total !== pageLength) setPageLength(res.total);
        setImages((prev) => [
          // For page 1, replace existing images, for others append
          ...(page === 1 ? [] : prev),
          ...res.images.map((item) => ({
            id: item.id,
            filename: item.filename.split(".")[0],
            mimetype: item.src.split(":")[1].split(";")[0],
            src: item.src,
            is_done: item.is_done,
          })),
        ]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsError(error.message || "Failed to load images");
        setIsLoading(false);
      });
  }, [page, done, pageLength]); // Added done and pageLength to dependency array

  if (isLoading && images.length === 0) return <Loader className="h-0.5" />;

  if (isError) {
    return <p>Error loading images: {isError}</p>;
  }

  return (
    <>
      <div
        className="flex justify-between p-1 px-2 border-amber-50 border-1 cursor-pointer"
        onClick={() => setHide((prev) => !prev)}
      >
        <h4>
          {done
            ? `${pageLength} Finished Images`
            : `${pageLength} Not Finished`}
        </h4>
        <span
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            transform: hide ? "rotate(-90deg)" : "rotate(90deg)",
            transition: "transform 0.3s ease",
            display: "inline-block",
            marginLeft: "10px",
          }}
        >
          {">"}
        </span>
      </div>
      <ul style={{ display: hide ? "none" : "block" }}>
        {images.map((image, index) => (
          <li
            key={index}
            className={selectedImage == index ? "active" : ""}
            onClick={() => SelectImage(image, index)}
          >
            <img src={image.src} alt={image.filename} />
            <p>{image.filename}</p>
          </li>
        ))}
        {pageLength > images.length && (
          <button
            className={
              "px-4 py-2 mt-4 text-white bg-blue-500 rounded w-full " +
              (isLoading
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-blue-600")
            }
            onClick={() => NextPage()}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Load More"
            )}{" "}
          </button>
        )}
      </ul>
    </>
  );
}
