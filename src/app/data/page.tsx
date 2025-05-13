import Link from "next/link";

export default function CardNavigationMenu() {
  return (
    <div className="grid place-items-center h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md scale-200">
        <Link href="/data/segmentation">
          <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border-t-4 border-indigo-500">
            <h3 className="font-semibold text-lg text-gray-800">
              Cell Segmentation
            </h3>
            <p className="text-gray-600 mt-1 text-sm">
              Analyze and segment cell images
            </p>
          </div>
        </Link>

        <Link href="/data/cell-labeling">
          <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border-t-4 border-emerald-500">
            <h3 className="font-semibold text-lg text-gray-800">
              Cell Labeling
            </h3>
            <p className="text-gray-600 mt-1 text-sm">
              Label and categorize cell types
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
