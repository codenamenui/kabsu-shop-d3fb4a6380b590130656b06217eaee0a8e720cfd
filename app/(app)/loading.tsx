import { Card } from "@/components/ui/card";

type LoadingSkeletonProps = {
  className?: string;
  height?: string;
  width?: string;
};

// Reusable skeleton component
const LoadingSkeleton = ({
  className = "",
  height = "h-4",
  width = "w-full",
}: LoadingSkeletonProps) => (
  <div
    className={`animate-pulse rounded bg-gray-200 ${height} ${width} ${className}`}
  />
);

// Reusable card skeleton
const CardSkeleton = () => (
  <Card className="p-4">
    <LoadingSkeleton height="h-6" width="w-2/3" className="mb-4" />
    <LoadingSkeleton className="mb-2" />
    <LoadingSkeleton width="w-4/5" className="mb-2" />
    <LoadingSkeleton width="w-3/4" />
  </Card>
);

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto space-y-6 p-6">
        {/* Page Header */}
        <div className="mb-8 space-y-4">
          <LoadingSkeleton height="h-8" width="w-1/3" />
          <LoadingSkeleton height="h-4" width="w-1/2" />
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Secondary Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <LoadingSkeleton height="h-6" width="w-1/4" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <LoadingSkeleton
                  height="h-12"
                  width="w-12"
                  className="rounded-full"
                />
                <div className="flex-1 space-y-2">
                  <LoadingSkeleton height="h-4" />
                  <LoadingSkeleton height="h-3" width="w-2/3" />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <LoadingSkeleton height="h-6" width="w-1/4" />
            <Card className="p-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="mb-4 flex items-center justify-between last:mb-0"
                >
                  <LoadingSkeleton height="h-4" width="w-1/3" />
                  <LoadingSkeleton height="h-4" width="w-20" />
                </div>
              ))}
            </Card>
          </div>
        </div>

        {/* List/Table Area */}
        <Card className="p-4">
          <LoadingSkeleton height="h-6" width="w-1/4" className="mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex-1 space-y-2">
                  <LoadingSkeleton height="h-4" width="w-1/3" />
                  <LoadingSkeleton height="h-3" width="w-1/4" />
                </div>
                <LoadingSkeleton
                  height="h-8"
                  width="w-24"
                  className="rounded-md"
                />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
