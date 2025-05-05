"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  useDriveDelete,
  UseDriveList,
  useDriveUpload,
  useFolderCreate,
} from "./api";
import DrawPreview from "./DrawPreview";
import { matrix2File } from "./MaskUtils";
import { Mask, Mode, modes, Tab } from "./types";

import { drive_v3 } from "googleapis";
import "./styles.scss";
import { DriveFileData } from "@/app/_lib/googledrive";

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
  const [selectedImage, setSelectedImage] = useState<DriveFileData | null>(
    null,
  );
  const [loadedMasks, setLoadedMasks] = useState<drive_v3.Schema$File[]>([]);
  const [subMasksFolderId, setSubMasksFolderId] = useState<string | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <main>
        <header>
          <h1>Segmentation Canvas</h1>
        </header>
        <ImagesNavigate
          setSelectedImage={setSelectedImage}
          setLoadedMasks={setLoadedMasks}
          setSubMasksFolderId={setSubMasksFolderId}
        />
        {selectedImage ? (
          <SegmentationCanvas
            image={selectedImage}
            maskFolderId={subMasksFolderId}
          />
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
  setSubMasksFolderId,
}: {
  setSelectedImage: (image: DriveFileData | null) => void;
  setLoadedMasks: (masks: drive_v3.Schema$File[]) => void;
  setSubMasksFolderId: (folderId: string | null) => void;
}) {
  const [selectImage, setSelectImage] = useState<number>(NaN);
  const [images, setImages] = useState<DriveFileData[]>([]);
  const [loadedMasksFolders, setLoadedMasksFolders] = useState<
    drive_v3.Schema$File[]
  >([]);
  const [masksFolderId, setMasksFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files === null) return;
    setImages((prev) => [
      ...prev,
      ...Array.from(files).map(
        (file) =>
          ({
            id: file.name, // Assign a unique ID, e.g., file name
            mimeType: file.type,
            name: file.name,
            src: URL.createObjectURL(file),
          }) as DriveFileData,
      ),
    ]);
  };
  const driveList = new UseDriveList();
  const { mutateAsync: listFiles } = driveList.listWithData();
  const { mutateAsync: listFilesDrive } = driveList.listDriveFiles();

  const { mutateAsync: createFolderAsync } = useFolderCreate();
  useEffect(() => {
    // get all images from the folder
    listFilesDrive(FolderID).then((fileListResponse) => {
      const imagesFolderId = fileListResponse?.find(
        (file) => file.name === imagesFolder,
      )?.id;
      const masksFolderId = fileListResponse?.find(
        (file) => file.name === masksFolder,
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
      setMasksFolderId(masksFolderId);

      listFiles(imagesFolderId).then((fetchedImages) => {
        if (!fetchedImages) return;
        setImages(fetchedImages);
        setLoading(false);
      });
      listFilesDrive(masksFolderId).then((fetchedMasks) => {
        if (!fetchedMasks) return;
        setLoadedMasksFolders(fetchedMasks);
      });
    });
  }, []);

  const handleImageSelection = (image: DriveFileData, index: number) => {
    if (!masksFolderId) {
      console.error("Masks folder not found");
      return;
    }
    // create sub mask folder as image name
    listFilesDrive(masksFolderId).then((fileListResponse) => {
      const foldername = image.name.split(".")[0];
      const imagesFolderId = fileListResponse?.find(
        (file) => file.name === foldername,
      )?.id;
      if (imagesFolderId) return;
      createFolderAsync({
        name: foldername,
        ParentDirectoryId: masksFolderId,
      }).then((folderId) => {
        if (!folderId) return;
        setSubMasksFolderId(folderId);
      });
    });

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
                      src={image.src}
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

function SegmentationCanvas({
  image,
  maskFolderId,
}: {
  image: DriveFileData;
  maskFolderId: string | null;
}) {
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [mode, setMode] = useState<Mode>("draw");
  const [brushSize, setBrushSize] = useState(15);
  const [isSaving, setIsSaving] = useState(false);

  const [toggleupdate, setToggleUpdate] = useState(false);
  const [selectedTab, setSelectedTab] = useState(-1);
  const driveList = new UseDriveList();
  const { mutateAsync: listFilesDrive } = driveList.listDriveFiles();
  const { mutateAsync: uploadFile } = useDriveUpload();
  const { mutateAsync: deleteFile } = useDriveDelete();

  useEffect(() => {
    const img = new Image();
    img.src = image.src;
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
                Array.from({ length: data.width }, () => 0),
              ),
            })),
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
            Array.from({ length: width }, () => 0),
          ),
        })),
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
            if (selectedTab === -1 || !maskFolderId) return;
            setIsSaving(true);
            // get file in the folder
            const filestodelete = await listFilesDrive(maskFolderId);
            // delete all files in the folder
            await Promise.all(
              filestodelete.map(async (file) => {
                await deleteFile(file.id!);
              }),
            );
            await Promise.all(
              tabs.map(async (tab) => {
                await uploadFile({
                  file: await matrix2File(tab.mask, tab.name),
                  inFolderId: maskFolderId,
                });
              }),
            );
            setIsSaving(false);
          }}
        >
          {isSaving ? "Saving..." : "Save Masks"}
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
          src={image.src}
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
