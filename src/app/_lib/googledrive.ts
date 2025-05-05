import { Buffer } from "buffer";
import { drive_v3, google } from "googleapis";
import path from "path";
import { encode } from "querystring";

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
};

export type DriveFileData = DriveFile & {
  src: string;
};

export async function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(process.cwd(), "secure/crohnscope-f769ed5b75f3.json"),
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  const drive = google.drive({ version: "v3", auth });
  return drive;
}

export async function DownloadFileFromDrive(
  drive: drive_v3.Drive,
  fileId: string,
  name: string,
): Promise<DriveFileData> {
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" },
  );

  const chunks: Buffer[] = [];
  const stream = res.data;

  for await (const chunk of stream) {
    chunks.push(chunk as Buffer);
  }

  const buffer = Buffer.concat(chunks);
  const base64 = buffer.toString("base64");
  const mimeType = res.headers["content-type"] || "application/octet-stream";
  const lastModified = new Date(
    res.headers["last-modified"] || Date.now(),
  ).getTime();

  return {
    id: fileId,
    name,
    mimeType,
    src: `data:image/png;base64,${base64}`,
  };
}
