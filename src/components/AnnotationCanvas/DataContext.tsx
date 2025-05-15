"use client";
import { createContext, ReactNode, useContext, useState } from "react";
import { ApiImage } from "./api";

type DataContextType = {
  img: ApiImage | null;
  setImg: (val: ApiImage | null) => void;
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
  const [img, setImg] = useState<ApiImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  return (
    <DataContext.Provider value={{ img, setImg, isLoading, setIsLoading }}>
      {children}
    </DataContext.Provider>
  );
}
