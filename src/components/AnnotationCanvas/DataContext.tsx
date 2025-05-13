"use client";

import { DriveFileData } from "@/app/_lib/googledrive";
import { createContext, ReactNode, useContext, useState } from "react";

type DataContextType = {
  img: DriveFileData | null;
  setImg: (val: DriveFileData | null) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
};

const DataContext = createContext<DataContextType | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [img, setImg] = useState<DriveFileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  return (
    <DataContext.Provider value={{ img, setImg, isLoading, setIsLoading }}>
      {children}
    </DataContext.Provider>
  );
}
