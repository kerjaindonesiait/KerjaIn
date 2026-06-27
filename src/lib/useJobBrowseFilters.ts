import { useMemo, useState } from "react";
import {
  filterAndSortJobs,
  DEFAULT_PRICE_RANGE,
  JOB_CATEGORY_FILTERS,
  type PriceRange,
  type SortOption,
  type JobCategoryFilter,
} from "./jobFilters";
import type { Job } from "../types";

export type FilterMenuId = "area" | "price" | "more" | "sort";

export function useJobBrowseFilters(jobs: Job[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("Semua area");
  const [priceRange, setPriceRange] = useState<PriceRange>(DEFAULT_PRICE_RANGE);
  const [categoryFilter, setCategoryFilter] = useState<JobCategoryFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [openMenu, setOpenMenu] = useState<FilterMenuId | null>(null);
  const [draftArea, setDraftArea] = useState("Semua area");
  const [draftPriceRange, setDraftPriceRange] = useState<PriceRange>(DEFAULT_PRICE_RANGE);
  const [draftCategory, setDraftCategory] = useState<JobCategoryFilter>("all");
  const [categorySearch, setCategorySearch] = useState("");

  const openFilter = (id: FilterMenuId) => {
    if (id === "area") setDraftArea(areaFilter);
    if (id === "price") setDraftPriceRange(priceRange);
    if (id === "more") {
      setDraftCategory(categoryFilter);
      setCategorySearch("");
    }
    setOpenMenu(id);
  };

  const closeFilter = () => setOpenMenu(null);

  const filtered = useMemo(
    () =>
      filterAndSortJobs(jobs, {
        search: searchQuery,
        area: areaFilter,
        priceRange,
        sort: sortOption,
        category: categoryFilter,
      }),
    [jobs, searchQuery, areaFilter, priceRange, sortOption, categoryFilter],
  );

  const categoryLabel =
    JOB_CATEGORY_FILTERS.find((c) => c.id === categoryFilter)?.label ?? "Filter Lainnya";
  const moreFilterActive = categoryFilter !== "all";

  const filteredCategories = useMemo(
    () =>
      JOB_CATEGORY_FILTERS.filter((c) =>
        c.label.toLowerCase().includes(categorySearch.trim().toLowerCase()),
      ),
    [categorySearch],
  );

  return {
    searchQuery,
    setSearchQuery,
    areaFilter,
    setAreaFilter,
    priceRange,
    setPriceRange,
    categoryFilter,
    setCategoryFilter,
    sortOption,
    setSortOption,
    openMenu,
    openFilter,
    closeFilter,
    draftArea,
    setDraftArea,
    draftPriceRange,
    setDraftPriceRange,
    draftCategory,
    setDraftCategory,
    categorySearch,
    setCategorySearch,
    filtered,
    categoryLabel,
    moreFilterActive,
    filteredCategories,
  };
}
