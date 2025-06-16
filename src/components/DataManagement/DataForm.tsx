"use client";
import { ApiDisease, ApiFeature } from "@/lib/api";
import { useEffect, useState } from "react";
import { DataItem, DataType, TextMap, ViewType } from "./types";

interface DataFormProps<T extends DataType> {
  type: T;
  item: DataItem<T> | null;
  onSave: (data: DataItem<T>) => void;
  onCancel: () => void;
  editMode: ViewType;
  isSubmitting: boolean;

  tags?: ApiDisease[];
  isNameExists: boolean;
}

export default function DataForm<T extends DataType>({
  type,
  item,
  onSave,
  onCancel,
  editMode,
  isNameExists,
  tags,
  isSubmitting,
}: DataFormProps<T>) {
  const [formData, setFormData] = useState<DataItem<T>>({} as DataItem<T>);

  function initializeFormData(): DataItem<T> {
    if (type === "feature") {
      return {
        id: 0,
        name: "",
        description: "",
        img: "",
        diseases: [],
      } as DataItem<T>;
    } else if (type === "disease") {
      return {
        id: 0,
        name: "",
        description: "",
      } as DataItem<T>;
    } else {
      throw new Error("Invalid type");
    }
  }
  useEffect(() => {
    setFormData(item ? { ...item } : initializeFormData());
  }, [item, editMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div
      className="rounded-lg shadow-md p-6"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
      }}
    >
      {item === null && editMode === "view" ? (
        <div
          className="flex justify-center items-center h-32 text-lg font-medium"
          style={{
            color: "var(--text-muted)",
            background: "var(--input-bg)",
            borderRadius: "0.5rem",
            border: "1px dashed var(--card-border)",
          }}
        >
          No item selected
        </div>
      ) : (
        <>
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: "var(--foreground)" }}
          >
            {TextMap[type].data[editMode].title}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-6 flex flex-col items-center ">
              {"img" in formData && (
                <>
                  <div className="w-full mt-1 flex items-center justify-center p-2">
                    {formData.img ? (
                      <img
                        src={`data:image/jpeg;base64,${formData.img}`}
                        alt="Feature preview"
                        className="w-full aspect-[1/1] object-cover rounded-md"
                        style={{ border: "1px solid var(--card-border)" }}
                      />
                    ) : (
                      <div
                        className="w-full aspect-square rounded-md flex items-center justify-center"
                        style={{
                          background: "var(--input-bg)",
                          border: "1px solid var(--card-border)",
                        }}
                      >
                        <svg
                          className="h-12 w-12"
                          style={{ color: "var(--text-muted)" }}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  {editMode !== "view" && (
                    <div className="w-fit">
                      <label
                        className="cursor-pointer py-2 px-3 rounded-md shadow-sm text-sm leading-4 font-medium hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        style={{
                          background: "var(--input-bg)",
                          color: "var(--foreground)",
                          border: "1px solid var(--card-border)",
                        }}
                      >
                        <span>Change Image</span>
                        <input
                          id="featureImage"
                          name="featureImage"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          // onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-bold mb-1"
                style={{ color: "var(--foreground)" }}
              >
                Name
              </label>
              {editMode != "view" ? (
                <input
                  type="text"
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  style={{
                    background: "var(--input-bg)",
                    color: "var(--foreground)",
                    border: isNameExists
                      ? "1px solid #ef4444"
                      : "1px solid var(--card-border)",
                  }}
                  required
                />
              ) : (
                <h2>{formData.name || ""}</h2>
              )}
              {isNameExists && formData.name && (
                <p style={{ color: "#ef4444" }} className="text-xs mt-1">
                  A feature with this name already exists.
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-sm font-bold mb-1"
                style={{ color: "var(--foreground)" }}
              >
                Description
              </label>
              {editMode !== "view" ? (
                <textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 h-24"
                  style={{
                    background: "var(--input-bg)",
                    color: "var(--foreground)",
                    border: "1px solid var(--card-border)",
                  }}
                />
              ) : (
                <p className="text-sm" style={{ color: "var(--foreground)" }}>
                  {formData.description || "No description provided."}
                </p>
              )}
            </div>

            {/* disease */}
            {type == "feature" && "diseases" in formData && (
              <div className="mb-4">
                <label
                  htmlFor="disease"
                  className="block text-sm font-bold mb-1"
                  style={{ color: "var(--foreground)" }}
                >
                  Diseases
                </label>
                {editMode !== "view" ? (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags?.map((tag) => {
                        const isSelected = !!(
                          formData as ApiFeature
                        ).diseases?.some(
                          (disease) => disease.name === tag.name
                        );
                        return (
                          <label
                            key={tag.id}
                            className={`flex items-center px-2 py-1 rounded-md border cursor-pointer select-none ${
                              isSelected
                                ? "bg-[var(--highlight-bg)] border-[var(--highlight-border)]"
                                : "bg-[var(--input-bg)] border-[var(--card-border)]"
                            }`}
                            style={{
                              color: "var(--foreground)",
                              fontWeight: isSelected ? "bold" : "normal",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                const prev =
                                  (formData as ApiFeature).diseases || [];
                                let next: ApiDisease[];
                                if (isSelected) {
                                  next = prev.filter(
                                    (d) => d.name !== tag.name
                                  );
                                } else {
                                  next = [...prev, { ...tag }];
                                }
                                setFormData({
                                  ...formData,
                                  diseases: next,
                                });
                              }}
                              className="mr-2 accent-indigo-500"
                            />
                            {tag.name}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <>
                    {(formData as ApiFeature).diseases?.length !== 0 ? (
                      <ul className="list-disc pl-5">
                        {(formData as ApiFeature).diseases.map(
                          ({ name: disease }, index) => (
                            <li
                              key={index}
                              className="text-sm"
                              style={{ color: "var(--foreground)" }}
                            >
                              {disease}
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p
                        className="text-sm"
                        style={{ color: "var(--foreground)" }}
                      >
                        No diseases listed. This feature represents a{" "}
                        <strong style={{ color: "#22c55e" }}>healthy</strong>{" "}
                        state.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {editMode !== "view" && (
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(initializeFormData());
                    onCancel();
                  }}
                  className="px-4 py-2 border rounded-md shadow-sm text-sm font-medium hover:brightness-95"
                  style={{
                    color: "var(--foreground)",
                    background: "var(--button-secondary)",
                    border: "1px solid var(--card-border)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium"
                  style={{
                    background: "var(--button-primary)",
                    color: "var(--card-bg)",
                  }}
                  disabled={isSubmitting || !!isNameExists}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    TextMap[type].data[editMode].title
                  )}
                </button>
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
}
