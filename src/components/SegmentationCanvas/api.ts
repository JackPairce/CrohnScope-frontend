import {
  CreateFolder,
  listAsRawFiles,
  listDriveFiles,
  listWithData,
  UploadFile,
} from "@/app/api/drive";
import { useMutation } from "@tanstack/react-query";

export const useFolderCreate = () =>
  useMutation({
    mutationFn: CreateFolder,
  });

export const useDriveUpload = () =>
  useMutation({
    mutationFn: UploadFile,
  });

export class UseDriveList {
  listDriveFiles() {
    return useMutation({
      mutationFn: listDriveFiles,
    });
  }

  listWithData() {
    return useMutation({
      mutationFn: listWithData,
    });
  }

  listAsRawFiles() {
    return useMutation({
      mutationFn: listAsRawFiles,
    });
  }
}
