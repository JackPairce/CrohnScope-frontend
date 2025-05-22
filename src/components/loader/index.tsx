import Image from "next/image";
import "./styles.scss";

export default function Loader({
  className = "",
  message = "Processing",
}: {
  className?: string;
  message?: string;
}) {
  return (
    <div
      className={`loader flex flex-col h-full items-center justify-center gap-4 ${className}`}
    >
      <div className="relative">
        {/* Info Icon */}
        <div className="relative z-10">
          <Image
            src="/svgs/info.svg"
            alt="Loading"
            width={48}
            height={48}
            className="text-blue-500"
          />
        </div>

        {/* Loading Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/0 via-blue-500/20 to-blue-500/0 animate-pulse" />

        {/* Progress Dots */}
        <div className="absolute -inset-8 flex items-center justify-center">
          <div className="cell-grid">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className={`h-4 w-4 rounded-full bg-blue-500/20 animate-pulse`}
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        {" "}
        <p className="text-gray-600 dark:text-gray-300 font-medium">
          {message}
        </p>
        <div className="flex gap-1">
          <div
            className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </div>
  );
}
