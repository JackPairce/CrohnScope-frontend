import { CreateFolder, listWithData } from "@/app/api/drive/useServer";
import { FileLister } from "@/app/api/drive/utils";
import DrawCanvas from "@/components/DrawCanvas";
import EmptyState from "../../empty";

export const metadata = {
  title: "Segmentation Canvas",
  description: "Segmentation Canvas for CrohnScope",
};

const SegmentationCanvas = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) => {
  const { Mid, img: foldername } = await searchParams;
  return (
    <>
      <header>{metadata.title}</header>
      {Mid ? <>{InitializeCanvas(Mid, foldername)}</> : <EmptyState />}
    </>
  );
};

export default SegmentationCanvas;

const InitializeCanvas = async (MaskFolderID: string, foldername: string) => {
  console.log("MaskFolderID", MaskFolderID);

  const driveList = new FileLister();
  await driveList.init();

  if (!MaskFolderID) {
    console.error("Masks folder not found");
    return;
  }

  const fetchedMasks = await driveList.listDriveFiles(MaskFolderID);
  if (!fetchedMasks) return;

  // create sub mask folder as image name
  let imagesFolderId = fetchedMasks.find(
    (file) => file.name === foldername
  )?.id;

  if (!imagesFolderId) {
    imagesFolderId = await CreateFolder({
      name: foldername,
      ParentDirectoryId: MaskFolderID,
    });
  }
  if (!imagesFolderId) throw new Error("Images folder not found");

  const Masks = await listWithData(imagesFolderId).then((masks) =>
    Promise.all(
      masks.map(async (mask) => ({
        name: mask.name,
        mask: mask.src,
      }))
    )
  );
  return (
    <DrawCanvas
      subMasksFolderId={imagesFolderId}
      loadedMasks={Masks.reduce((acc, imageMatrix) => {
        acc[imageMatrix.name] = imageMatrix.mask;
        return acc;
      }, {} as { [label: string]: string })}
    />
  );
};
