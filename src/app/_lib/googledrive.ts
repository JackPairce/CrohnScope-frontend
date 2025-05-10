import { Buffer } from "buffer";
import { drive_v3, google } from "googleapis";
import path from "path";

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
};

export type DriveFileData = DriveFile & {
  src: string;
};

import fs from "fs";

export function writeServiceKeyTempFile() {
  const keyPath =
    process.env.NODE_ENV === "production"
      ? path.join("/tmp", "service-key.json")
      : path.join(process.cwd(), "secure", "service-key.json");
  if (!fs.existsSync(keyPath)) {
    const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64!;
    const json = Buffer.from(base64, "base64").toString("utf-8");
    fs.writeFileSync(keyPath, json);
  }
  return keyPath;
}

export async function getDriveClient() {
  const keyPath = writeServiceKeyTempFile();
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  return google.drive({ version: "v3", auth });
}

export async function DownloadFileFromDrive(
  drive: drive_v3.Drive,
  fileId: string,
  name: string
): Promise<DriveFileData> {
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
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
    res.headers["last-modified"] || Date.now()
  ).getTime();

  return {
    id: fileId,
    name,
    mimeType,
    src: `data:image/png;base64,${base64}`,
  };
}
