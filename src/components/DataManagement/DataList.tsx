"use client";
import { useEffect, useState } from "react";
import Table from "../Table";
import { DataItem, DataType, ViewType } from "./types";

interface DataListProps<T extends DataType> {
  type: T;
  items: DataItem<T>[];
  setSelectedItem: (item: DataItem<T> | null) => void;
  onEdit: (item: DataItem<T>) => void;
  onDelete: (item: DataItem<T>) => void;
  editMode: ViewType;
}

export default function DataList<T extends DataType>({
  type,
  items,
  setSelectedItem,
  onEdit,
  onDelete,
  editMode,
}: DataListProps<T>) {
  function createTableContents(
    items: DataItem<T>[]
  ): Record<ViewType, Array<Record<string, React.JSX.Element>>> {
    return {
      view: items.map((item) => ({
        id: <span>{item.id}</span>,
        ...("img" in item
          ? {
              image: (
                <>
                  {item.img ? (
                    <img
                      src={`data:image/jpeg;base64,${item.img}`}
                      alt={item.name}
                      className="h-10 w-10 rounded-md object-cover"
                      style={{ border: "1px solid var(--card-border)" }}
                    />
                  ) : (
                    <div
                      className="h-10 w-10 rounded-md flex items-center justify-center"
                      style={{
                        background: "var(--input-bg)",
                        border: "1px solid var(--card-border)",
                      }}
                    >
                      <svg
                        className="h-6 w-6"
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
                </>
              ),
            }
          : {}),
        name: <span>{item.name}</span>,
        ...("diseases" in item
          ? {
              diseases: (
                <span className="flex flex-wrap gap-2">
                  {item.diseases.length > 0 ? (
                    item.diseases.map((disease) => (
                      <span
                        key={disease.id}
                        className="inline-block text-blue-100 bg-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                        style={{ border: "1px solid #3b82f6" }}
                      >
                        {disease.name}
                      </span>
                    ))
                  ) : (
                    <span
                      className="inline-block text-green-100 bg-green-800 text-xs font-medium px-2.5 py-0.5 rounded"
                      style={{ border: "1px solid #22c55e" }}
                    >
                      Healthy
                    </span>
                  )}
                </span>
              ),
            }
          : {}),
        "": (
          <div className="flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              style={{ color: "var(--accent)" }}
              className="hover:underline mr-4"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              style={{ color: "#ef4444" }}
              className="hover:underline"
            >
              Delete
            </button>
          </div>
        ),
      })),
      edit: items.map((item) => ({
        name: <span>{item.name}</span>,
      })),
      add: items.map((item) => ({
        name: <span>{item.name}</span>,
      })),
    };
  }

  const [tableContents, setTableContents] = useState<
    Record<ViewType, Array<Record<string, React.JSX.Element>>>
  >(createTableContents(items));

  useEffect(() => {
    setTableContents(createTableContents(items));
  }, [items]);

  return (
    <Table
      name={type}
      contents={tableContents[editMode]}
      onSelect={(index) => {
        setSelectedItem(items[index]);
      }}
    />
  );
}
