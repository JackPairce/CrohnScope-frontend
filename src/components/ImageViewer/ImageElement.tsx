import { ApiImage } from "@/lib/api";
import Image from "next/image";
import React from "react";

export default function ImageElement({
  image,
  setSelectedImage,
}: {
  image: ApiImage;
  setSelectedImage: React.Dispatch<React.SetStateAction<ApiImage | null>>;
}) {
  return (
    <div
      key={image.id}
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }}
      className="group relative overflow-hidden rounded-lg shadow-sm border cursor-pointer transition-all duration-200 hover:shadow-md"
      onClick={() => setSelectedImage(image)}
    >
      <div
        className="relative pt-[100%]"
        style={{ background: "var(--input-bg)" }}
      >
        <Image
          src={image.src}
          alt={image.filename}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          width={400}
          height={400}
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <p
          className="text-sm font-medium text-white truncate"
          title={image.filename}
        >
          {image.filename.split(".")[0]}
        </p>
      </div>
    </div>
  );
}
