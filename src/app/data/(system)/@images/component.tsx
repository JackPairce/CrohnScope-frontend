import { listDriveFiles } from "@/app/api/drive/useServer";
import { headers } from "next/headers";
import ImagesNav from "./client-component";

// TODO: Use env variable
const FolderID = "1AA8UCcJfSOo4h7wagO24ShEwJEVop43s";

export default async function ImagesAside() {
  const pathname = (await headers()).get("x-current-path");
  if (!pathname) throw new Error("No pathname found");
  const imagesFolder = "images";
  const masksFolder = "masks";

  const RootFiles = await listDriveFiles(FolderID);
  const imagesFolderId = RootFiles.find(
    (file) => file.name === imagesFolder
  )?.id;
  const masksDirectoryId = RootFiles.find(
    (file) => file.name === masksFolder
  )?.id;

  if (!imagesFolderId || !masksDirectoryId) {
    console.error("Images or masks folder not found");
    return <p>Images or masks folder not found</p>;
  }

  const FileImages = await listDriveFiles(imagesFolderId);

  return <ImagesNav FileImages={FileImages} MaskFolderID={masksDirectoryId} />;
}
