export default function Loader({ className = "" }: { className?: string }) {
  return (
    <div
      className={`loader flex h-full items-center justify-center ${className}`}
    >
      <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-300"></div>
    </div>
  );
}
