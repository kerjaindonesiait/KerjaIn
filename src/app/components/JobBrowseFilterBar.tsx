import { useState, type ReactNode } from "react";
import {
  Search,
  MapPin,
  ChevronDown,
  ChevronUp,
  Clock,
  SlidersHorizontal,
  History,
  Banknote,
  TrendingDown,
  TrendingUp,
  Star,
} from "lucide-react";
import {
  JAKARTA_AREAS,
  SORT_LABELS,
  areaFilterLabel,
  PRICE_SLIDER_MIN,
  PRICE_SLIDER_MAX,
  PRICE_SLIDER_STEP,
  formatPriceRangeLabel,
  isFullPriceRange,
  type PriceRange,
  type SortOption,
  type JobCategoryFilter,
} from "../../lib/jobFilters";
import type { FilterMenuId } from "../../lib/useJobBrowseFilters";
import { appShellClass } from "../../lib/layout";
import { HorizontalScrollRow } from "./HorizontalScrollRow";
import { FilterPopover } from "./FilterPopover";

const SORT_ICONS: Record<SortOption, ReactNode> = {
  newest: <Clock size={18} strokeWidth={2} />,
  oldest: <History size={18} strokeWidth={2} />,
  price_asc: <TrendingDown size={18} strokeWidth={2} />,
  price_desc: <TrendingUp size={18} strokeWidth={2} />,
  offers: <Star size={18} strokeWidth={2} />,
};

function FilterPillTrigger({
  active,
  open,
  icon,
  label,
}: {
  active: boolean;
  open: boolean;
  icon?: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`flex items-center gap-1.5 text-[13px] font-semibold rounded-full px-4 py-2 transition-all whitespace-nowrap border-2 ${
        active || open
          ? "text-[#1D4196] border-[#1D4196] bg-white"
          : "text-[#294566] border-[#D8E2F0] bg-white hover:border-[#1D4196] hover:text-[#1D4196]"
      }`}
    >
      {icon}
      {label}
      {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
    </button>
  );
}

function FilterTextTrigger({
  active,
  open,
  label,
}: {
  active: boolean;
  open: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`flex items-center gap-1.5 text-[13px] font-semibold px-3 py-2 rounded-full transition-all whitespace-nowrap ${
        open
          ? "text-[#1D4196] bg-[#EEF3FB]"
          : active
            ? "text-[#1D4196]"
            : "text-[#294566] hover:text-[#1D4196]"
      }`}
    >
      {label}
      {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
    </button>
  );
}

function FilterPanelSection({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children: ReactNode;
}) {
  return (
    <div className="p-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#7890AA] mb-2">{label}</p>
      {value && <p className="text-[15px] font-bold text-[#172E4D] mb-3">{value}</p>}
      {children}
    </div>
  );
}

function FilterPanelFooter({ onCancel, onApply }: { onCancel: () => void; onApply: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[#EEF3FB] bg-[#FAFBFD]">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 text-[13px] font-bold text-[#1D4196] bg-[#EEF3FB] hover:bg-[#E3EBF8] rounded-full py-2.5 transition-colors"
      >
        Batal
      </button>
      <button
        type="button"
        onClick={onApply}
        className="flex-1 text-[13px] font-bold text-white bg-[#1D4196] hover:bg-[#173577] rounded-full py-2.5 transition-colors"
      >
        Terapkan
      </button>
    </div>
  );
}

function FilterRadioOption({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-[13px] transition-colors ${
        active ? "bg-[#EEF3FB] text-[#1D4196] font-semibold" : "text-[#294566] hover:bg-[#F7F9FC] font-medium"
      }`}
    >
      <span
        className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
          active ? "border-[#1D4196]" : "border-[#C5D3E8]"
        }`}
      >
        {active && <span className="w-2 h-2 rounded-full bg-[#1D4196]" />}
      </span>
      <span className="flex-1">{children}</span>
    </button>
  );
}

function FilterSortItem({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-[13px] transition-colors ${
        active ? "bg-[#EEF3FB] text-[#1D4196] font-semibold" : "text-[#172E4D] hover:bg-[#F7F9FC] font-medium"
      }`}
    >
      <span className="text-[#1D4196] shrink-0">{icon}</span>
      {label}
    </button>
  );
}

const RANGE_THUMB =
  "pointer-events-none absolute w-full appearance-none bg-transparent h-6 top-1/2 -translate-y-1/2 " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none " +
  "[&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full " +
  "[&::-webkit-slider-thumb]:bg-[#1D4196] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white " +
  "[&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(23,65,150,0.35)] [&::-webkit-slider-thumb]:cursor-grab " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none " +
  "[&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:rounded-full " +
  "[&::-moz-range-thumb]:bg-[#1D4196] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white " +
  "[&::-moz-range-thumb]:shadow-[0_2px_6px_rgba(23,65,150,0.35)] [&::-moz-range-thumb]:cursor-grab " +
  "[&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent";

function PriceRangeSlider({
  value,
  onChange,
}: {
  value: PriceRange;
  onChange: (v: PriceRange) => void;
}) {
  const span = PRICE_SLIDER_MAX - PRICE_SLIDER_MIN;
  const minPct = ((value.min - PRICE_SLIDER_MIN) / span) * 100;
  const maxPct = ((value.max - PRICE_SLIDER_MIN) / span) * 100;

  return (
    <div className="relative h-8 mx-0.5 mt-1">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-[#E3EBF5] rounded-full" />
      <div
        className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-[#1D4196] rounded-full"
        style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
      />
      <input
        type="range"
        min={PRICE_SLIDER_MIN}
        max={PRICE_SLIDER_MAX}
        step={PRICE_SLIDER_STEP}
        value={value.min}
        onChange={(e) => {
          const next = Math.min(Number(e.target.value), value.max - PRICE_SLIDER_STEP);
          onChange({ ...value, min: next });
        }}
        className={`${RANGE_THUMB} z-[3]`}
        aria-label="Harga minimum"
      />
      <input
        type="range"
        min={PRICE_SLIDER_MIN}
        max={PRICE_SLIDER_MAX}
        step={PRICE_SLIDER_STEP}
        value={value.max}
        onChange={(e) => {
          const next = Math.max(Number(e.target.value), value.min + PRICE_SLIDER_STEP);
          onChange({ ...value, max: next });
        }}
        className={`${RANGE_THUMB} z-[4]`}
        aria-label="Harga maksimum"
      />
    </div>
  );
}

export type JobBrowseFilterBarProps = {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  areaFilter: string;
  setAreaFilter: (v: string) => void;
  priceRange: PriceRange;
  setPriceRange: (v: PriceRange) => void;
  categoryFilter: JobCategoryFilter;
  setCategoryFilter: (v: JobCategoryFilter) => void;
  sortOption: SortOption;
  setSortOption: (v: SortOption) => void;
  openMenu: FilterMenuId | null;
  openFilter: (id: FilterMenuId) => void;
  closeFilter: () => void;
  draftArea: string;
  setDraftArea: (v: string) => void;
  draftPriceRange: PriceRange;
  setDraftPriceRange: (v: PriceRange) => void;
  draftCategory: JobCategoryFilter;
  setDraftCategory: (v: JobCategoryFilter) => void;
  categorySearch: string;
  setCategorySearch: (v: string) => void;
  categoryLabel: string;
  moreFilterActive: boolean;
  filteredCategories: readonly { id: JobCategoryFilter; label: string }[];
};

export function JobBrowseFilterBar(props: JobBrowseFilterBarProps) {
  const {
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
    categoryLabel,
    moreFilterActive,
    filteredCategories,
  } = props;

  return (
    <div className="bg-white border-b border-[#f5eded] shrink-0 shadow-sm">
      <div className={`${appShellClass} py-3`}>
        <HorizontalScrollRow fadeEdge="light" innerClassName="-mx-1 px-1 pb-1">
          <div className="flex items-center gap-2 flex-nowrap min-w-max pr-2">
            <div className="flex items-center gap-2 bg-[#F7F9FC] rounded-lg px-3 py-[9px] min-w-[220px] max-w-[280px] shrink-0 border border-transparent focus-within:border-[#1D4196] focus-within:bg-white transition-all">
              <Search size={15} className="text-[#7890AA] shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pekerjaan, cth. pipa bocor…"
                className="bg-transparent text-[13px] text-[#294566] placeholder-[#7890AA] outline-none w-full min-w-0"
              />
            </div>
            <div className="w-px h-6 bg-[#f5eded] shrink-0" />
            <FilterPopover
              open={openMenu === "area"}
              onOpenChange={(open) => (open ? openFilter("area") : closeFilter())}
              width={288}
              trigger={
                <FilterPillTrigger
                  active={areaFilter !== "Semua area"}
                  open={openMenu === "area"}
                  icon={<MapPin size={14} className="text-[#1D4196]" />}
                  label={areaFilterLabel(areaFilter)}
                />
              }
            >
              <FilterPanelSection label="Area" value={areaFilterLabel(draftArea)}>
                <div className="max-h-[220px] overflow-y-auto flex flex-col gap-0.5 -mx-1">
                  {JAKARTA_AREAS.map((area) => (
                    <FilterRadioOption
                      key={area}
                      active={draftArea === area}
                      onClick={() => setDraftArea(area)}
                    >
                      {areaFilterLabel(area)}
                    </FilterRadioOption>
                  ))}
                </div>
              </FilterPanelSection>
              <FilterPanelFooter
                onCancel={closeFilter}
                onApply={() => {
                  setAreaFilter(draftArea);
                  closeFilter();
                }}
              />
            </FilterPopover>
            <FilterPopover
              open={openMenu === "price"}
              onOpenChange={(open) => (open ? openFilter("price") : closeFilter())}
              width={300}
              trigger={
                <FilterPillTrigger
                  active={!isFullPriceRange(priceRange)}
                  open={openMenu === "price"}
                  icon={<Banknote size={14} className="text-[#1D4196]" />}
                  label={formatPriceRangeLabel(priceRange)}
                />
              }
            >
              <FilterPanelSection label="Harga pekerjaan" value={formatPriceRangeLabel(draftPriceRange)}>
                <PriceRangeSlider value={draftPriceRange} onChange={setDraftPriceRange} />
              </FilterPanelSection>
              <FilterPanelFooter
                onCancel={closeFilter}
                onApply={() => {
                  setPriceRange(draftPriceRange);
                  closeFilter();
                }}
              />
            </FilterPopover>
            <FilterPopover
              open={openMenu === "more"}
              onOpenChange={(open) => (open ? openFilter("more") : closeFilter())}
              width={320}
              trigger={
                <FilterPillTrigger
                  active={moreFilterActive}
                  open={openMenu === "more"}
                  icon={<SlidersHorizontal size={14} className="text-[#1D4196]" />}
                  label={moreFilterActive ? categoryLabel : "Filter Lainnya"}
                />
              }
            >
              <FilterPanelSection
                label="Kategori"
                value={
                  draftCategory === "all"
                    ? "Semua kategori"
                    : filteredCategories.find((c) => c.id === draftCategory)?.label
                }
              >
                <div className="flex items-center gap-2 bg-[#F7F9FC] rounded-xl px-3 py-2 mb-3 border border-[#E8EDF5]">
                  <Search size={14} className="text-[#7890AA] shrink-0" />
                  <input
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Cari kategori…"
                    className="bg-transparent text-[13px] text-[#294566] placeholder-[#7890AA] outline-none w-full"
                  />
                </div>
                {draftCategory !== "all" && (
                  <button
                    type="button"
                    onClick={() => setDraftCategory("all")}
                    className="text-[12px] font-semibold text-[#1D4196] mb-2 hover:underline"
                  >
                    Hapus semua
                  </button>
                )}
                <div className="max-h-[200px] overflow-y-auto flex flex-col gap-0.5 -mx-1">
                  {filteredCategories.map((cat) => (
                    <FilterRadioOption
                      key={cat.id}
                      active={draftCategory === cat.id}
                      onClick={() => setDraftCategory(cat.id)}
                    >
                      {cat.label}
                    </FilterRadioOption>
                  ))}
                </div>
              </FilterPanelSection>
              <FilterPanelFooter
                onCancel={closeFilter}
                onApply={() => {
                  setCategoryFilter(draftCategory);
                  closeFilter();
                }}
              />
            </FilterPopover>
            <FilterPopover
              open={openMenu === "sort"}
              onOpenChange={(open) => (open ? openFilter("sort") : closeFilter())}
              align="right"
              width="auto"
              trigger={
                <FilterTextTrigger
                  active={sortOption !== "newest"}
                  open={openMenu === "sort"}
                  label={sortOption === "newest" ? "Urutkan" : SORT_LABELS[sortOption]}
                />
              }
            >
              <div className="p-2 w-full min-w-0">
                {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                  <FilterSortItem
                    key={key}
                    active={sortOption === key}
                    icon={SORT_ICONS[key]}
                    label={SORT_LABELS[key]}
                    onClick={() => {
                      setSortOption(key);
                      closeFilter();
                    }}
                  />
                ))}
              </div>
            </FilterPopover>
          </div>
        </HorizontalScrollRow>
      </div>
    </div>
  );
}
