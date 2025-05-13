import {
  CreateFolder,
  DeleteFile,
  listAsRawFiles,
  listDriveFiles,
  listWithData,
  UploadFile,
} from "@/app/api/drive/useServer";
import { useMutation } from "@tanstack/react-query";

export const useFolderCreate = () =>
  useMutation({
    mutationFn: CreateFolder,
  });

export const useDriveUpload = () =>
  useMutation({
    mutationFn: UploadFile,
  });

export const useDriveDelete = () =>
  useMutation({
    mutationFn: DeleteFile,
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
