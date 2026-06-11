export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

const MAX_VISIBLE_PAGE_BLOCKS = 7;

export const getTotalPages = (totalItems: number, pageSize: number): number =>
  Math.max(1, Math.ceil(totalItems / pageSize));

export const getVisiblePageNumbers = (
  currentPage: number,
  totalPages: number,
  maxVisible = MAX_VISIBLE_PAGE_BLOCKS,
): number[] => {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  const end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

export const getPageSlice = <T>(
  items: T[],
  page: number,
  pageSize: number,
): T[] => {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
};

export type PageListItem = number | "ellipsis";

/** Page numbers with ellipsis gaps, e.g. 1 2 3 4 5 … 99 */
export const getPageListItems = (
  currentPage: number,
  totalPages: number,
): PageListItem[] => {
  if (totalPages <= 0) {
    return [];
  }

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
};

export const getShowingCount = (
  currentPage: number,
  pageSize: number,
  totalItems: number,
): number => {
  if (totalItems === 0) {
    return 0;
  }
  const start = (currentPage - 1) * pageSize;
  return Math.min(pageSize, totalItems - start);
};

export const getShowingRange = (
  currentPage: number,
  pageSize: number,
  totalItems: number,
): { start: number; end: number } => {
  if (totalItems === 0) {
    return { start: 0, end: 0 };
  }

  const maxPage = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), maxPage);
  const indexOfFirstRecord = (safePage - 1) * pageSize;
  const indexOfLastRecord = indexOfFirstRecord + pageSize;
  const currentStart = indexOfFirstRecord + 1;
  const currentEnd = Math.min(indexOfLastRecord, totalItems);

  return { start: currentStart, end: currentEnd };
};
