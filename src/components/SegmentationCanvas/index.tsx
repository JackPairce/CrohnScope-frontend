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
import { ExtractRealMask, Mask2File, NewMask } from "./MaskUtils";
import {
  CellsNames,
  labelMaskPairs,
  LoadedMask,
  Mode,
  modes,
  Tab,
} from "./types";

import { DriveFileData } from "@/app/_lib/googledrive";
import { drive_v3 } from "googleapis";
import Loader from "../loader";
import "./styles.scss";

// TODO: Use env variable
const FolderID = "1AA8UCcJfSOo4h7wagO24ShEwJEVop43s";

const imagesFolder = "images";
const masksFolder = "masks";
const datasetSchemaFile = "dataset.json";
const datasetMetadataFile = "metadata.csv";

const queryClient = new QueryClient();

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<DriveFileData | null>(
    null
  );
  const [loadedMasks, setLoadedMasks] = useState<labelMaskPairs | null>(null);
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
          loadedMasks ? (
            <SegmentationCanvas
              image={selectedImage}
              maskFolderId={subMasksFolderId}
              loadedMasks={loadedMasks}
            />
          ) : (
            <Loader />
          )
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
  setLoadedMasks: (masks: labelMaskPairs | null) => void;
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
          } as DriveFileData)
      ),
    ]);
  };

  const driveList = new UseDriveList();
  const { mutateAsync: getFileListData } = driveList.listWithData();
  const { mutateAsync: retrieveDriveFileList } = driveList.listDriveFiles();
  const { mutateAsync: createFolderAsync } = useFolderCreate();

  useEffect(() => {
    // get all images from the folder
    retrieveDriveFileList(FolderID).then((fileListResponse) => {
      const imagesFolderId = fileListResponse?.find(
        (file) => file.name === imagesFolder
      )?.id;
      const masksDirectoryId = fileListResponse?.find(
        (file) => file.name === masksFolder
      )?.id;
      if (!imagesFolderId || !masksDirectoryId) {
        console.error("Images or masks folder not found");
        setLoading(false);
        return;
      }
      setMasksFolderId(masksDirectoryId);

      // get all images from the folder
      getFileListData(imagesFolderId).then((fetchedImages) => {
        if (!fetchedImages) return;
        setImages(fetchedImages);
        setLoading(false);
      });
    });
  }, []);

  useEffect(() => {
    if (!masksFolderId) return;
    // get all masks from the folder
    retrieveDriveFileList(masksFolderId).then((fetchedMasks) => {
      if (!fetchedMasks) return;
      setLoadedMasksFolders(fetchedMasks);
    });
  }, [masksFolderId]);

  const handleImageSelection = async (image: DriveFileData, index: number) => {
    if (!masksFolderId) {
      console.error("Masks folder not found");
      return;
    }
    setLoadedMasks(null);
    // create sub mask folder as image name
    const foldername = image.name.split(".")[0];
    let imagesFolderId = loadedMasksFolders?.find(
      (file) => file.name === foldername
    )?.id;

    if (!imagesFolderId) {
      imagesFolderId = await createFolderAsync({
        name: foldername,
        ParentDirectoryId: masksFolderId,
      });
    }
    if (!imagesFolderId) throw new Error("Images folder not found");

    // get all files in the folder
    getFileListData(imagesFolderId).then(async (fetchedMasks) =>
      Promise.all(
        fetchedMasks.map(async (mask) => {
          const img = new Image();
          img.src = mask.src;
          return await new Promise((resolve: (value: LoadedMask) => void) => {
            img.onload = () => {
              resolve({
                name: mask.name,
                mask: img,
              });
            };
          });
        })
      ).then((resolvedMasks) =>
        setLoadedMasks(
          resolvedMasks.reduce((acc, imageMatrix) => {
            acc[imageMatrix.name] = imageMatrix.mask;
            return acc;
          }, {} as labelMaskPairs)
        )
      )
    );
    setSubMasksFolderId(imagesFolderId);
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
        <Loader />
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
  loadedMasks,
}: {
  image: DriveFileData;
  maskFolderId: string | null;
  loadedMasks: labelMaskPairs;
}) {
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [mode, setMode] = useState<Mode>("draw");
  const [brushSize, setBrushSize] = useState(15);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedTab, setSelectedTab] = useState(-1);
  const driveList = new UseDriveList();
  const { mutateAsync: listFilesDrive } = driveList.listDriveFiles();
  const { mutateAsync: uploadFile } = useDriveUpload();
  const { mutateAsync: deleteFile } = useDriveDelete();

  useEffect(() => {
    const img = new Image();
    img.src = image.src;
    img.onload = () => {
      // set mask
      setTabs(
        Object.values(CellsNames)
          .filter((v) => typeof v === "string")
          .map((name) => ({
            name,
            isRename: false,
            mask:
              loadedMasks[name] ?? NewMask(img.naturalWidth, img.naturalHeight),
          }))
      );
      setSelectedTab(0);
    };
  }, []);

  const setCurrentMask = (mask: HTMLImageElement) => {
    if (selectedTab === -1) return;
    setTabs((prev) => {
      prev[selectedTab].mask = mask;
      return [...prev];
    });
  };

  const saveMasks = async () => {
    if (selectedTab === -1 || !maskFolderId) return;
    setIsSaving(true);
    // TODO: Move the job to the backend
    // get file in the folder
    const filestodelete = await listFilesDrive(maskFolderId);
    // delete all files in the folder
    await Promise.all(
      filestodelete.map(async (file) => {
        await deleteFile(file.id!);
      })
    );
    await Promise.all(
      tabs.map(async (tab) => {
        await uploadFile({
          file: await Mask2File(await ExtractRealMask(tab.mask), tab.name),
          inFolderId: maskFolderId,
        });
      })
    );
    setIsSaving(false);
  };

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
        <button className="save" onClick={saveMasks}>
          {isSaving ? "Saving..." : "Save Masks"}
        </button>
      </nav>
      <nav className="tabs">
        <div>
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={selectedTab === index ? "active" : ""}
              onClick={() => setSelectedTab(index)}
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
            onClick={async () => {
              const newmask = await NewMask(
                overlayRef.current?.width!,
                overlayRef.current?.height!
              );
              setTabs((prev) => [
                ...prev,
                {
                  name: `New Tab ${prev.length + 1}`,
                  mask: newmask,
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
          style={{ position: "absolute", zIndex: 1 }}
        />
        <DrawPreview
          ref={overlayRef}
          brushSize={brushSize}
          mode={mode}
          mask={tabs[selectedTab].mask}
          setMask={setCurrentMask}
        />
      </div>
    </>
  );
}
