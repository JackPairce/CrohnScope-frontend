"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { UseDriveList, useDriveUpload } from "./api";
import DrawPreview from "./DrawPreview";
import { matrix2File } from "./MaskUtils";
import { Mask, Mode, modes, Tab } from "./types";

import type { DriveFile } from "@/app/_lib/googledrive";
import { drive_v3 } from "googleapis";
import "./styles.scss";

// TODO: Use env variable
const FolderID = "1AA8UCcJfSOo4h7wagO24ShEwJEVop43s";

enum CellsNames {
  "Cryptes",
  "Granulom",
}

type DatasetSchema = {
  image_id: string;
  cell_id: string;
  cell_state: "healthy" | "unhealthy";
  cell_name: CellsNames;
  mask_path: string;
};

const imagesFolder = "images";
const masksFolder = "masks";
const datasetSchemaFile = "dataset.json";
const datasetMetadataFile = "metadata.csv";

const queryClient = new QueryClient();

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<DriveFile | null>(null);
  const [loadedMasks, setLoadedMasks] = useState<drive_v3.Schema$File[]>([]);

  return (
    <QueryClientProvider client={queryClient}>
      <main>
        <header>
          <h1>Segmentation Canvas</h1>
        </header>
        <ImagesNavigate
          setSelectedImage={setSelectedImage}
          setLoadedMasks={setLoadedMasks}
        />
        {selectedImage ? (
          <SegmentationCanvas image={selectedImage} />
        ) : (
          <div className="empty-state">
            <h2>Select an image</h2>
            <p>Please select an image to start segmentation.</p>
          </div>
        )}
      </main>
    </QueryClientProvider>
  );
}

function ImagesNavigate({
  setSelectedImage,
  setLoadedMasks,
}: {
  setSelectedImage: (image: DriveFile | null) => void;
  setLoadedMasks: (masks: drive_v3.Schema$File[]) => void;
}) {
  const [selectImage, setSelectImage] = useState<number>(NaN);
  const [images, setImages] = useState<DriveFile[]>([]);
  const [loadedMasksFolders, setLoadedMasksFolders] = useState<
    drive_v3.Schema$File[]
  >([]);
  const [loading, setLoading] = useState(true);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files === null) return;
    setImages((prev) => [
      ...prev,
      ...Array.from(files).map((file) => ({
        id: file.name, // Assign a unique ID, e.g., file name
        mimeType: file.type,
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
      })),
    ]);
  };
  const driveList = new UseDriveList();
  const { mutateAsync: listFiles } = driveList.listWithData();
  const { mutateAsync: listFilesDrive } = driveList.listDriveFiles();

  useEffect(() => {
    // get all images from the folder
    listFilesDrive(FolderID).then((fileListResponse) => {
      const imagesFolderId = fileListResponse?.find(
        (file) => file.name === imagesFolder
      )?.id;
      const masksFolderId = fileListResponse?.find(
        (file) => file.name === masksFolder
      )?.id;
      //   const datasetSchemaFileId = fileListResponse?.find(
      //     (file) => file.name === datasetSchemaFile
      //   )?.id;
      //   const datasetMetadataFileId = fileListResponse?.find(
      //     (file) => file.name === datasetMetadataFile
      //   )?.id;
      console.log("Downloading images from folder", imagesFolderId);
      if (!imagesFolderId || !masksFolderId) {
        console.error("Images or masks folder not found");
        setLoading(false);
        return;
      }

      listFiles(imagesFolderId).then((fetchedImages) => {
        if (!fetchedImages) return;
        setImages(fetchedImages);
        setLoading(false);
        fetchedImages.forEach((image) => {
          console.log("image", image.name);
        });
      });
      listFilesDrive(masksFolderId).then((fetchedMasks) => {
        if (!fetchedMasks) return;
        setLoadedMasksFolders(fetchedMasks);
      });
    });
  }, []);

  const handleImageSelection = (image: DriveFile, index: number) => {
    // get image index

    setSelectedImage(image);
    setSelectImage(index);
  };
  return (
    <aside>
      <label htmlFor="image-upload">Upload Images</label>
      <input
        type="file"
        id="image-upload"
        accept="image/*"
        onChange={handleImageUpload}
      />
      {loading ? (
        <div>
          <div className="loader"></div>
        </div>
      ) : (
        <>
          {images.length === 0 ? (
            <p>No images found</p>
          ) : (
            <>
              <ul>
                {images.map((image, index) => (
                  <li
                    key={index}
                    className={selectImage === index ? "active" : ""}
                  >
                    <img
                      src={image.data ? URL.createObjectURL(image.data) : ""}
                      alt={image.name}
                      onClick={() => handleImageSelection(image, index)}
                    />
                    <p>{image.name}</p>
                  </li>
                ))}
              </ul>
              {/* TODO: images that has been done */}
              {/* <ul>
        {images.map((image, index) => (
          <li key={index}>
            <img src={URL.createObjectURL(image)} alt={image.name} />
            <p>{image.name}</p>
          </li>
        ))}
      </ul> */}
            </>
          )}
        </>
      )}
    </aside>
  );
}

function SegmentationCanvas({ image }: { image: DriveFile }) {
  //   const baseRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [mode, setMode] = useState<Mode>("draw");
  const [brushSize, setBrushSize] = useState(15);

  const [toggleupdate, setToggleUpdate] = useState(false);
  const [selectedTab, setSelectedTab] = useState(-1);
  const { mutate: uploadFile } = useDriveUpload();

  useEffect(() => {
    const img = new Image();
    img.src = image.data ? URL.createObjectURL(image.data) : "";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setImageData(data);
        // set mask
        setTabs(
          Object.values(CellsNames)
            .filter((v) => typeof v === "string")
            .map((name) => ({
              name,
              isRename: false,
              mask: Array.from({ length: data.height }, () =>
                Array.from({ length: data.width }, () => 0)
              ),
            }))
        );
        setSelectedTab(0);
      }
    };
  }, [image]);

  useEffect(() => {
    if (!overlayRef.current) return;
    const height = overlayRef.current.clientHeight;
    const width = overlayRef.current.clientWidth;
    console.log("height", height, "width", width);

    setTabs(
      Object.values(CellsNames)
        .filter((v) => typeof v === "string")
        .map((name) => ({
          name,
          isRename: false,
          mask: Array.from({ length: height }, () =>
            Array.from({ length: width }, () => 0)
          ),
        }))
    );
  }, [overlayRef.current]);

  const setCurrentMask = (mask: Mask) => {
    if (selectedTab === -1) return;
    setTabs((prev) => {
      prev[selectedTab].mask = mask;
      return prev;
    });
  };

  //  TODO: set loading state
  if (tabs.length === 0 || selectedTab == -1 || !image) return null;

  return (
    <>
      <nav className="tools">
        <div className="tools-buttons">
          <div className="modes">
            {modes.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={mode === m ? "active" : ""}
              >
                {m === "draw" ? "🖌️" : "🧼"}
              </button>
            ))}
          </div>
          <label className="brush-size">
            Brush Size:
            <input
              type="range"
              min={10}
              max={100}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
            />
            <span>{brushSize}</span>
          </label>
        </div>
        <button
          className="save"
          onClick={async () => {
            if (selectedTab === -1) return;
            // TODO: replace with mask folder id
            uploadFile({
              file: await matrix2File(tabs[selectedTab].mask, image.name),
              inFolderId: FolderID,
            });
          }}
        >
          Save Mask
        </button>
      </nav>
      <nav className="tabs">
        <div>
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={selectedTab === index ? "active" : ""}
              onClick={() => {
                setToggleUpdate(true);
                setSelectedTab(index);
                setToggleUpdate(false);
              }}
              onDoubleClick={() => {
                setTabs((prev) => {
                  prev[index].isRename = true;
                  return [...prev];
                });
              }}
            >
              {tab.isRename ? (
                <input
                  type="text"
                  value={tab.name}
                  onChange={(e) => {
                    setTabs((prev) => {
                      prev[index].name = e.target.value;
                      return [...prev];
                    });
                  }}
                  onBlur={() => {
                    setTabs((prev) => {
                      prev[index].isRename = false;
                      return [...prev];
                    });
                  }}
                />
              ) : (
                <span>{tab.name}</span>
              )}
            </button>
          ))}
          {/* add button */}
          <button
            className="add-tab"
            onClick={() => {
              setTabs((prev) => [
                ...prev,
                {
                  name: `New Tab ${prev.length + 1}`,
                  mask: [],
                  isRename: true,
                },
              ]);
            }}
          ></button>
        </div>
      </nav>
      <div className="canvas-container">
        <img
          src={image.data ? URL.createObjectURL(image.data) : ""}
          alt={image.name}
          //   ref={baseRef}
          //   width={512}
          //   height={512}
          style={{ position: "absolute", zIndex: 1 }}
        />
        <DrawPreview
          ref={overlayRef}
          brushSize={brushSize}
          mode={mode}
          mask={tabs[selectedTab].mask}
          setMask={setCurrentMask}
          toggleupdate={toggleupdate}
          setToggleUpdate={setToggleUpdate}
        />
      </div>
    </>
  );
}
