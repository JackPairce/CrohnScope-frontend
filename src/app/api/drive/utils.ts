import { DownloadFileFromDrive, getDriveClient } from "@/app/_lib/googledrive";
import { drive_v3 } from "googleapis";

export class FileLister {
  private driveClient!: drive_v3.Drive;

  constructor() {
    // Lazy-load or inject the client
  }

  async init() {
    this.driveClient = await getDriveClient();
  }

  async listDriveFiles(folderId: string): Promise<drive_v3.Schema$File[]> {
    const res = await this.driveClient.files.list({
      q: `'${folderId}' in parents`,
      fields: "files(id, name, mimeType, modifiedTime)",
      orderBy: "modifiedTime desc",
    });
    return res.data.files || [];
  }

  async listAsRawFiles(folderId: string): Promise<File[]> {
    const driveFiles = await this.listDriveFiles(folderId);
    return driveFiles.map(
      (file) =>
        new File([], file.name!, {
          type: file.mimeType || "application/octet-stream",
          lastModified: parseInt(file.modifiedTime || "0"),
        })
    );
  }

  async listWithData(folderId: string) {
    const driveFiles = await this.listDriveFiles(folderId);
    return Promise.all(
      driveFiles.map(
        async (file) =>
          await DownloadFileFromDrive(this.driveClient, file.id!, file.name!)
      )
    );
  }

  async DownloadFiles(
    files: {
      id: string;
      name: string;
      modifiedTime: string;
    }[]
  ) {
    return Promise.all(
      files
        .flat()
        .map((file) =>
          DownloadFileFromDrive(this.driveClient, file.id, file.name)
        )
    );
  }
}
