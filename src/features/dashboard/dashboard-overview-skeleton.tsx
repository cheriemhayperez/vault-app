const SkeletonBlock = ({
  className = "",
}: {
  className?: string;
}) => (
  <div
    className={`animate-pulse rounded-md bg-slate-100 ${className}`}
    aria-hidden
  />
);

const HeroMetricCardSkeleton = () => (
  <div className="flex h-[120px] flex-col justify-between rounded-xl border border-slate-100 bg-white p-3 shadow-sm sm:min-h-[132px] sm:p-4">
    <div className="flex w-full items-center justify-between">
      <SkeletonBlock className="size-8 rounded-lg bg-slate-200" />
      <SkeletonBlock className="h-3 w-10" />
    </div>
    <SkeletonBlock className="h-7 w-14 bg-slate-200" />
    <div className="space-y-1.5">
      <SkeletonBlock className="h-4 w-24 bg-slate-200" />
      <SkeletonBlock className="h-3 w-32" />
    </div>
  </div>
);

const DistributionCardSkeleton = () => (
  <div className="flex h-full flex-col justify-between rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-2">
      <div className="space-y-1.5">
        <SkeletonBlock className="h-4 w-28 bg-slate-200" />
        <SkeletonBlock className="h-3 w-36" />
      </div>
      <SkeletonBlock className="size-8 rounded-lg bg-slate-200" />
    </div>
    <div className="flex flex-1 items-center justify-center">
      <SkeletonBlock className="h-3 w-28" />
    </div>
  </div>
);

export const DashboardOverviewSkeleton = () => (
  <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <HeroMetricCardSkeleton key={index} />
      ))}
    </div>

    <div className="mb-6 grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-3">
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-2">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="space-y-1.5">
            <SkeletonBlock className="h-5 w-40 bg-slate-200" />
            <SkeletonBlock className="h-3 w-52" />
          </div>
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-3 w-14" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 border-b border-slate-200 px-6 py-5 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-7 w-16 bg-slate-200" />
            </div>
          ))}
        </div>

        <div className="mx-4 my-5 h-[300px] overflow-hidden rounded-lg bg-slate-50 animate-pulse sm:mx-6">
          <div className="flex h-full flex-col justify-end gap-3 px-4 pb-6 pt-8">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock
                key={index}
                className={`h-px w-full ${index % 2 === 0 ? "opacity-60" : "opacity-30"}`}
              />
            ))}
            <div className="mt-2 flex justify-between">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-2.5 w-6" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-full flex-col gap-6 lg:col-span-1">
        <div className="flex flex-1 flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="space-y-1.5">
            <SkeletonBlock className="h-4 w-24 bg-slate-200" />
            <SkeletonBlock className="h-3 w-44" />
          </div>
          <div className="mt-5 flex flex-1 flex-col">
            <div className="flex justify-center py-1">
              <SkeletonBlock className="size-[108px] shrink-0 rounded-full bg-slate-100" />
            </div>
            <div className="mt-4 space-y-3">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-full" />
            </div>
            <div className="mt-auto border-t border-slate-100 pt-4">
              <div className="flex justify-between">
                <SkeletonBlock className="h-3 w-14" />
                <SkeletonBlock className="h-3 w-14" />
              </div>
              <SkeletonBlock className="mt-2 h-2 w-full rounded-full bg-slate-100" />
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1.5">
              <SkeletonBlock className="h-4 w-36 bg-slate-200" />
              <SkeletonBlock className="h-3 w-44" />
            </div>
            <SkeletonBlock className="size-8 rounded-lg bg-slate-200" />
          </div>
          <SkeletonBlock className="mt-4 h-7 w-20 bg-slate-200" />
          <SkeletonBlock className="mt-1 h-3 w-32" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <SkeletonBlock className="h-3 w-28" />
                  <SkeletonBlock className="h-3 w-14 bg-slate-200" />
                </div>
                <SkeletonBlock className="h-1.5 w-full rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-3 w-32" />
              <SkeletonBlock className="h-3 w-14 bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="mb-6 grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-3">
      <DistributionCardSkeleton />
      <DistributionCardSkeleton />
      <DistributionCardSkeleton />
    </div>

    <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="size-10 rounded-lg bg-slate-200" />
          <div className="space-y-1.5">
            <SkeletonBlock className="h-4 w-36 bg-slate-200" />
            <SkeletonBlock className="h-3 w-28" />
          </div>
        </div>
        <SkeletonBlock className="h-4 w-20 bg-slate-200" />
      </div>
      <div className="flex flex-col items-center px-6 py-16">
        <SkeletonBlock className="size-16 rounded-2xl bg-slate-200" />
        <SkeletonBlock className="mt-4 h-5 w-32 bg-slate-200" />
        <SkeletonBlock className="mt-2 h-4 w-56" />
        <SkeletonBlock className="mt-4 h-9 w-28 rounded-lg bg-slate-200" />
      </div>
    </div>
  </div>
);
