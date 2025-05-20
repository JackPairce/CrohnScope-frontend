interface LoadMoreProps {
  isLoading: boolean;
  currentCount: number;
  totalCount: number;
  onLoadMore: () => void;
}

export default function LoadMore({
  isLoading,
  currentCount,
  totalCount,
  onLoadMore,
}: LoadMoreProps) {
  return (
    <div className="load-more-container">
      <button
        className="load-more-btn"
        onClick={onLoadMore}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner"></span>
            <span>Loading Images...</span>
          </>
        ) : (
          <>
            <span>Load More Images</span>
            <span className="load-more-count">
              ({currentCount} of {totalCount})
            </span>
          </>
        )}
      </button>
    </div>
  );
}
