"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { UseDriveList, useDriveUpload } from "./api";
import DrawPreview from "./DrawPreview";
import { drawMaskToCanvas, matrix2File } from "./MaskUtils";
import { Mask, Mode, Tab } from "./types";

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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <main>
        <header>
          <h1>Segmentation Canvas</h1>
          <p>
            This is a segmentation canvas. You can draw on the canvas and save
            the mask.
          </p>
        </header>
        <ImagesNavigate setSelectedImage={setSelectedImage} />
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
}: {
  setSelectedImage: (image: File | null) => void;
}) {
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files === null) return;
    setImages((prev) => [...prev, ...Array.from(files)]);
  };
  const driveList = new UseDriveList();
  const { mutateAsync: listFiles } = driveList.listWithData();
  //   const { mutateAsync: listFilesRaw } = driveList.listAsRawFiles();
  const { mutateAsync: listFilesDrive } = driveList.listDriveFiles();

  useEffect(() => {
    // get all images from the folder
    setLoading(true);
    listFilesDrive(FolderID).then((res) => {
      const id = res?.find((file) => file.name === imagesFolder)?.id;
      if (!id) return;
      listFiles(id).then((res) => {
        if (!res) return;
        // convert to file
        setImages(res);
        setLoading(false);
      });
    });
  }, []);

  return (
    <aside>
      <h2>Images</h2>
      <label htmlFor="image-upload">Upload Images</label>
      <input
        type="file"
        id="image-upload"
        accept="image/*"
        onChange={handleImageUpload}
      />
      {loading ? (
        <p>Loading images...</p>
      ) : (
        <>
          {images.length === 0 ? (
            <p>No images found</p>
          ) : (
            <>
              <ul>
                {images.map((image, index) => (
                  <li key={index}>
                    <img
                      src={URL.createObjectURL(image)}
                      alt={image.name}
                      onClick={() => {
                        setSelectedImage(image);
                      }}
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

function SegmentationCanvas({ image }: { image: File }) {
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
    img.src = URL.createObjectURL(image);
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
        <button
          onClick={() =>
            setMode((prev) => (prev === "draw" ? "erase" : "draw"))
          }
        >
          {mode === "draw" ? "🧼 Erase" : "🖌️ Draw"}
        </button>
        <label>
          Brush Size:
          <input
            type="range"
            min={10}
            max={100}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
          />
        </label>
        <button
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
        {tabs.map((tab, index) => (
          <button
            key={index}
            style={{
              backgroundColor: selectedTab === index ? "blue" : "gray",
              color: "white",
              margin: "0.5rem",
              padding: "0.5rem",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
              transition: "background-color 0.3s",
            }}
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
          style={{
            backgroundColor: "green",
            color: "white",
            margin: "0.5rem",
            padding: "0.5rem",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "bold",
            transition: "background-color 0.3s",
          }}
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
        >
          +
        </button>
      </nav>
      <div className="canvas-container">
        <img
          src={URL.createObjectURL(image)}
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
