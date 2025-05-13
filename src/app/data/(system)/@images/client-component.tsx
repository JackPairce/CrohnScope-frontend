"use client";

import { DriveFile, DriveFileData } from "@/app/_lib/googledrive";
import { DownloadFiles } from "@/app/api/drive/useServer";
import { UseDriveList, useFolderCreate } from "@/components/DrawCanvas/api";
import { useData } from "@/components/DrawCanvas/DataContext";
import Loader from "@/components/loader";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { drive_v3 } from "googleapis";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

export default function ImagesNav(props: {
  FileImages: drive_v3.Schema$File[];
  MaskFolderID: string;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <Imagesnav {...props} />
    </QueryClientProvider>
  );
}

function Imagesnav({
  FileImages,
  MaskFolderID,
}: {
  FileImages: drive_v3.Schema$File[];
  MaskFolderID: string;
}) {
  const { setImg, setIsLoading } = useData();
  const [selectedImage, setSelectedImage] = useState(NaN);
  const [images, setImages] = useState<
    (DriveFile & {
      src: string;
    })[]
  >([]);
  const [page, setPage] = useState(0);

  const NextPage = () => {
    setImages((prev) => [...prev, ...DowloadedImages]);
    setPage((prev) => prev + 1);
  };

  const driveList = new UseDriveList();
  const { mutateAsync: getFileListData } = driveList.listWithData();
  const { mutateAsync: retrieveDriveFileList } = driveList.listDriveFiles();
  const { mutateAsync: createFolderAsync } = useFolderCreate();

  const SelectImage = async (imgData: DriveFileData, index: number) => {
    setIsLoading(true);
    setSelectedImage(index);
    setImg(imgData);

    setIsLoading(false);
    redirect(
      `${window.location.pathname}?Mid=${MaskFolderID}&img=${
        imgData.name.split(".")[0]
      }`
    );
  };

  const {
    data: DowloadedImages = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["images", page],
    queryFn: () =>
      DownloadFiles(
        FileImages.slice(page * 10, page * 10 + 10).map((file) => ({
          id: file.id || "",
          name: file.name || "",
          modifiedTime: file.modifiedTime || "",
        }))
      ),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!MaskFolderID) return;
    // get all masks from the folder
  }, [MaskFolderID]);

  if (isLoading && images.length === 0) return <Loader />;
  if (FileImages.length === 0) {
    return <p>No images found</p>;
  }
  if (isError) {
    return <p>Error loading images</p>;
  }

  return (
    <aside>
      <ul>
        {[...images, ...DowloadedImages].map((image, index) => (
          <li
            key={index}
            className={selectedImage == index ? "active" : ""}
            onClick={() =>
              SelectImage(
                {
                  id: image.id,
                  name: image.name,
                  mimeType: image.mimeType,
                  src: image.src,
                },
                index
              )
            }
          >
            <img src={image.src} alt={image.name} />
            <p>{image.name}</p>
          </li>
        ))}
        {FileImages.slice(page * 10, page * 10 + 10).length > 0 && (
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
    </aside>
  );
}
