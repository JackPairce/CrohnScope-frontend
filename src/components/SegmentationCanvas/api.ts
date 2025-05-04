import {
  listAsRawFiles,
  listDriveFiles,
  listWithData,
  UploadFile,
} from "@/app/api/drive";
import { useMutation, UseMutationResult } from "@tanstack/react-query";

export const useDriveUpload = () =>
  useMutation({
    mutationFn: UploadFile,
  });

function mutate<Variables, Result>(
  fn: (variables: Variables) => Promise<Result>
): UseMutationResult<Result, unknown, Variables> {
  return useMutation({
    mutationFn: fn,
  });
}
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
