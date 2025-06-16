import Image from "next/image";
import React from "react";

type TableUI = {
  [key: string]: React.JSX.Element;
}[];

interface TableProps {
  name: string;
  contents: TableUI;
  onSelect?: (index: number) => void;
  NoData?: () => React.JSX.Element;
  customSvg?: string;
}

export default function Table({
  name,
  contents,
  onSelect,
  NoData,
  customSvg,
}: TableProps) {
  const [selectedItem, setSelectedItem] = React.useState<number>(NaN);

  if (contents.length == 0) {
    return NoData ? (
      <NoData />
    ) : (
      <div
        className="rounded-xl border-2 border-dashed p-12 flex flex-col items-center justify-center text-center"
        style={{
          borderColor: "var(--color-border-muted)",
          background: "var(--color-canvas-subtle)",
          minHeight: "320px",
        }}
      >
        <div
          className="w-16 h-16 mb-4 flex items-center justify-center rounded-full"
          style={{ background: "var(--color-accent-subtle)" }}
        >
          {customSvg ? (
            <Image
              src={customSvg}
              alt="No data"
              width={32}
              height={32}
              style={{ color: "var(--color-accent-fg)" }}
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z" />
              <circle cx="17" cy="17" r="5" stroke="gray" />
              <line x1="27" y1="27" x2="22" y2="22" stroke="gray" />
            </svg>
          )}
        </div>
        <h3
          className="text-xl font-semibold mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          No {name}s found
        </h3>
        <p
          className="text-sm max-w-md mx-auto mb-8"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Get started by creating a new {name} using the "Add {name}" button.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-md">
      <table
        className="min-w-full"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
        }}
      >
        <thead style={{ background: "var(--card-border)" }}>
          <tr>
            {Object.keys(contents[0]).map((value, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                {value}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{ background: "var(--card-bg)" }}>
          {contents.map((item, index) => (
            <tr
              key={index}
              style={{
                borderBottom: "1px solid var(--card-border)",
                background:
                  selectedItem === index
                    ? "rgba(59, 130, 246, 0.3)"
                    : undefined,
              }}
              className={`hover:brightness-95 cursor-pointer`}
              onClick={() => {
                setSelectedItem(index);
                if (onSelect) {
                  onSelect(index);
                }
              }}
            >
              {Object.entries(item).map(([key, value], idx, itemArray) => (
                <td
                  key={idx}
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ${
                    idx === itemArray.length - 1 ? "w-full" : ""
                  }`}
                  style={{
                    color: `var(${
                      key.toLocaleLowerCase() == "id"
                        ? "--text-muted"
                        : "--foreground"
                    })`,
                  }}
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
