import {
  createEffect,
  createMemo,
  createSignal,
  For,
  JSXElement,
  Setter,
  Show,
} from "solid-js";

import { setConfig } from "../../config/setters";
import { restartTestEvent } from "../../events/test";
import { setCustomTextIndicator } from "../../states/core";
import { hideModal, showModal } from "../../states/modals";
import * as CustomText from "../../test/custom-text";
import { cn } from "../../utils/cn";
import { AnimatedModal } from "../common/AnimatedModal";
import { Button } from "../common/Button";
import { Fa } from "../common/Fa";
import { Separator } from "../common/Separator";

type CustomTextIncomingData =
  | ({ set?: boolean; long?: boolean } & (
      | { text: string; splitText?: never }
      | { text?: never; splitText: string[] }
    ))
  | null;

export type PracticeTextEntry = {
  id: string;
  title: string;
  category: string;
  unit?: string;
  stage?: number;
  difficulty: "easy" | "medium" | "hard" | "expert";
  wordCount: number;
  charCount: number;
  avgWordLength: number;
  author: string;
  source: string;
  text: string;
};

const categories = [
  { id: "all", label: "All Topics", icon: "fa-layer-group" as const },
  {
    id: "training",
    label: "Training & Drills",
    icon: "fa-graduation-cap" as const,
  },
  { id: "science", label: "Science", icon: "fa-atom" as const },
  { id: "philosophy", label: "Philosophy", icon: "fa-brain" as const },
  { id: "engineering", label: "Engineering", icon: "fa-cogs" as const },
  { id: "technology", label: "Technology", icon: "fa-microchip" as const },
  { id: "literature", label: "Literature", icon: "fa-book" as const },
  { id: "history", label: "History", icon: "fa-landmark" as const },
  { id: "medicine", label: "Medicine", icon: "fa-heartbeat" as const },
  { id: "law", label: "Law & Civics", icon: "fa-balance-scale" as const },
  { id: "nature", label: "Nature & Earth", icon: "fa-leaf" as const },
  { id: "art", label: "Art & Culture", icon: "fa-palette" as const },
];

const trainingUnits = [
  {
    id: "all",
    label: "All Units",
    shortLabel: "All Units",
    icon: "fa-list" as const,
  },
  {
    id: "Unit 1: Beginner",
    label: "Unit 1: Beginner",
    shortLabel: "U1: Beginner",
    icon: "fa-seedling" as const,
  },
  {
    id: "Unit 2: Intermediate",
    label: "Unit 2: Intermediate",
    shortLabel: "U2: Intermediate",
    icon: "fa-layer-group" as const,
  },
  {
    id: "Unit 3: Advanced",
    label: "Unit 3: Advanced",
    shortLabel: "U3: Advanced",
    icon: "fa-bolt" as const,
  },
  {
    id: "Unit 4: Developer",
    label: "Unit 4: Developer",
    shortLabel: "U4: Code",
    icon: "fa-code" as const,
  },
  {
    id: "Unit 5: Speed & Endurance",
    label: "Unit 5: Speed & Endurance",
    shortLabel: "U5: Speed",
    icon: "fa-stopwatch" as const,
  },
];

const difficulties = [
  { id: "all", label: "All Difficulties" },
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
  { id: "expert", label: "Expert" },
];

const PAGE_SIZE = 30;

export function PracticeSectionsModal(props: {
  setChainedData?: Setter<CustomTextIncomingData>;
}): JSXElement {
  const [texts, setTexts] = createSignal<PracticeTextEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = createSignal<string>("all");
  const [selectedUnit, setSelectedUnit] = createSignal<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] =
    createSignal<string>("all");
  const [searchQuery, setSearchQuery] = createSignal<string>("");
  const [loading, setLoading] = createSignal<boolean>(true);
  const [displayLimit, setDisplayLimit] = createSignal<number>(PAGE_SIZE);

  let scrollContainerRef: HTMLDivElement | undefined = undefined;

  const handleCategoryChange = (catId: string): void => {
    setSelectedCategory(catId);
    if (catId !== "training") {
      setSelectedUnit("all");
    }
    setDisplayLimit(PAGE_SIZE);
    if (scrollContainerRef) scrollContainerRef.scrollTop = 0;
  };

  const handleUnitChange = (unitId: string): void => {
    setSelectedUnit(unitId);
    setDisplayLimit(PAGE_SIZE);
    if (scrollContainerRef) scrollContainerRef.scrollTop = 0;
  };

  const handleDifficultyChange = (diffId: string): void => {
    setSelectedDifficulty(diffId);
    setDisplayLimit(PAGE_SIZE);
    if (scrollContainerRef) scrollContainerRef.scrollTop = 0;
  };

  const handleSearchChange = (query: string): void => {
    setSearchQuery(query);
    setDisplayLimit(PAGE_SIZE);
    if (scrollContainerRef) scrollContainerRef.scrollTop = 0;
  };

  createEffect(() => {
    void (async () => {
      // 1. Instant 0ms load from localStorage cache if available
      let cachedEtag: string | null = null;
      try {
        const cached = localStorage.getItem("eepytype_practice_cache");
        cachedEtag = localStorage.getItem("eepytype_practice_etag");
        if (typeof cached === "string" && cached !== "") {
          const parsed = JSON.parse(cached) as PracticeTextEntry[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTexts(parsed);
            setLoading(false);
          }
        }
      } catch {
        // Ignore localStorage error
      }

      // 2. Check for updates with ETag (304 Not Modified check)
      try {
        const headers: Record<string, string> = {};
        if (typeof cachedEtag === "string" && cachedEtag !== "") {
          headers["If-None-Match"] = cachedEtag;
        }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        const apiRes = await fetch("/api/practice-texts", {
          headers,
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (apiRes.status === 304) {
          // Already up to date! Nothing changed in DB.
          return;
        }

        if (apiRes.ok) {
          const newEtag = apiRes.headers.get("ETag");
          const apiData = (await apiRes.json()) as PracticeTextEntry[];
          if (Array.isArray(apiData) && apiData.length > 0) {
            setTexts(apiData);
            try {
              localStorage.setItem(
                "eepytype_practice_cache",
                JSON.stringify(apiData),
              );
              if (typeof newEtag === "string" && newEtag !== "") {
                localStorage.setItem("eepytype_practice_etag", newEtag);
              }
            } catch {
              // Ignore quota error
            }
            setLoading(false);
            return;
          }
        }
      } catch {
        // Ignore network / worker error
      }

      // 3. Fallback to static practice_texts.json if no cache
      if (texts().length === 0) {
        try {
          const res = await fetch("/practice/practice_texts.json");
          if (res.ok) {
            const data = (await res.json()) as PracticeTextEntry[];
            setTexts(data);
          }
        } catch (e) {
          console.error("Failed to load practice texts", e);
        } finally {
          setLoading(false);
        }
      }
    })();
  });

  const reversedTexts = createMemo<PracticeTextEntry[]>(() =>
    texts().slice().reverse(),
  );

  const filteredTexts = createMemo<PracticeTextEntry[]>(() => {
    const query = searchQuery().toLowerCase().trim();
    const cat = selectedCategory();
    const unit = selectedUnit();
    const diff = selectedDifficulty();
    const list = reversedTexts();

    if (query === "" && cat === "all" && diff === "all" && unit === "all") {
      return list;
    }

    return list.filter((item) => {
      if (cat !== "all" && item.category !== cat) {
        return false;
      }
      if (cat === "training" && unit !== "all" && item.unit !== unit) {
        return false;
      }
      if (diff !== "all" && item.difficulty !== diff) {
        return false;
      }
      if (query === "") {
        return true;
      }

      const inTitle = item.title.toLowerCase().includes(query);
      const inAuthor = item.author.toLowerCase().includes(query);
      const inSource = item.source.toLowerCase().includes(query);
      const inText = item.text.toLowerCase().includes(query);
      const inUnit = item.unit?.toLowerCase().includes(query) ?? false;

      return inTitle || inAuthor || inSource || inText || inUnit;
    });
  });

  const visibleTexts = createMemo(() =>
    filteredTexts().slice(0, displayLimit()),
  );

  const hasMore = createMemo(() => displayLimit() < filteredTexts().length);

  const loadMore = (): void => {
    if (hasMore()) {
      setDisplayLimit((prev) => prev + PAGE_SIZE);
    }
  };

  const handleScroll = (e: Event): void => {
    const el = e.currentTarget as HTMLDivElement;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 300) {
      loadMore();
    }
  };

  const selectPracticeText = (item: PracticeTextEntry): void => {
    hideModal("PracticeSections");

    let clean = item.text.normalize();
    clean = clean.replace(/[\u2000-\u200A\u202F\u205F\u00A0]/g, " ");
    clean = clean.replace(/ +/gm, " ");
    clean = clean.replace(/( *(\r\n|\r|\n) *)/g, "\n ");

    const words = clean.split(" ").filter((word) => word !== "");

    CustomText.setCustomText(item.title, item.text, true);
    CustomText.setMode("repeat");
    CustomText.setPipeDelimiter(false);
    CustomText.setText(words);
    CustomText.setLimitMode("word");
    CustomText.setLimitValue(words.length);
    setCustomTextIndicator({
      name: item.title,
      isLong: true,
    });
    setConfig("mode", "custom");
    restartTestEvent.dispatch();
  };

  const handleLoadAndEdit = (item: PracticeTextEntry): void => {
    CustomText.setCustomText(item.title, item.text, true);
    setCustomTextIndicator({
      name: item.title,
      isLong: true,
    });
    if (props.setChainedData) {
      props.setChainedData({ text: item.text, long: true });
      hideModal("PracticeSections");
    } else {
      showModal("CustomText");
    }
  };

  const getDifficultyBadge = (
    diff: PracticeTextEntry["difficulty"],
  ): JSXElement => {
    switch (diff) {
      case "easy":
        return (
          <span class="border-emerald-400/30 bg-emerald-500/10 text-emerald-400 rounded-md border px-2 py-0.5 text-xs font-semibold">
            Easy
          </span>
        );
      case "medium":
        return (
          <span class="border-amber-400/30 bg-amber-500/10 text-amber-400 rounded-md border px-2 py-0.5 text-xs font-semibold">
            Medium
          </span>
        );
      case "hard":
        return (
          <span class="border-rose-400/30 bg-rose-500/10 text-rose-400 rounded-md border px-2 py-0.5 text-xs font-semibold">
            Hard
          </span>
        );
      case "expert":
        return (
          <span class="border-purple-400/30 bg-purple-500/10 text-purple-400 rounded-md border px-2 py-0.5 text-xs font-semibold">
            Expert
          </span>
        );
    }
  };

  return (
    <AnimatedModal
      id="PracticeSections"
      title="Practice & Training Sections"
      modalClass="max-w-4xl"
    >
      <div class="flex flex-col gap-4">
        {/* Top Info Header */}
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-sub-alt pb-3">
          <p class="text-xs text-sub">
            Explore curated practice sections and structured touch typing
            training drills.
          </p>
          <span class="rounded-full bg-sub-alt px-3 py-1 text-xs font-medium text-sub">
            {filteredTexts().length} texts
          </span>
        </div>

        {/* Category Selector Pills */}
        <div class="flex flex-wrap gap-1.5">
          <For each={categories}>
            {(cat) => (
              <button
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                class={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  selectedCategory() === cat.id
                    ? "bg-main text-bg shadow-sm"
                    : "bg-sub-alt text-sub hover:bg-sub-alt/80 hover:text-text",
                )}
              >
                <Fa icon={cat.icon} />
                {cat.label}
              </button>
            )}
          </For>
        </div>

        {/* Horizontal Timeline Track */}
        <div class="flex flex-col gap-2 rounded-xl border border-sub-alt/80 bg-sub-alt/25 p-3">
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-1.5 text-xs font-semibold text-main">
              <Fa icon="fa-stream" />
              Progressive Touch Typing Timeline
            </span>
            <span class="text-[11px] text-sub">Step-by-step master path</span>
          </div>

          <div class="custom-scroll relative flex items-center gap-2 overflow-x-auto pt-1 pb-1">
            <For each={trainingUnits}>
              {(unitItem, index) => {
                const isSelected = () =>
                  selectedCategory() === "training" &&
                  selectedUnit() === unitItem.id;

                return (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedCategory() !== "training") {
                        setSelectedCategory("training");
                      }
                      handleUnitChange(unitItem.id);
                    }}
                    class={cn(
                      "flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                      isSelected()
                        ? "border-main bg-main font-semibold text-bg shadow-sm"
                        : "border-sub-alt/60 bg-bg text-sub hover:border-main/50 hover:text-text",
                    )}
                  >
                    <span
                      class={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold",
                        isSelected()
                          ? "bg-bg text-main"
                          : "bg-sub-alt text-sub",
                      )}
                    >
                      {index() === 0 ? "★" : index()}
                    </span>
                    <Fa icon={unitItem.icon} class="text-[11px]" />
                    <span class="whitespace-nowrap">{unitItem.shortLabel}</span>
                  </button>
                );
              }}
            </For>
          </div>
        </div>

        {/* Search & Difficulty Filter Bar */}
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
          <div class="relative flex items-center">
            <Fa icon="fa-search" class="absolute left-3.5 text-sub" />
            <input
              type="text"
              placeholder="Search by topic, unit, author, content or keyword..."
              value={searchQuery()}
              onInput={(e) => handleSearchChange(e.currentTarget.value)}
              class="w-full rounded-xl border border-sub-alt bg-bg py-2.5 pr-4 pl-10 text-sm text-text placeholder-sub/60 focus:border-main focus:outline-none"
            />
            <Show when={searchQuery().length > 0}>
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                class="absolute right-3 text-xs text-sub hover:text-text"
              >
                <Fa icon="fa-times" />
              </button>
            </Show>
          </div>

          {/* Difficulty selector */}
          <div class="flex items-center gap-1.5 rounded-xl border border-sub-alt bg-bg p-1">
            <For each={difficulties}>
              {(diff) => (
                <button
                  type="button"
                  onClick={() => handleDifficultyChange(diff.id)}
                  class={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
                    selectedDifficulty() === diff.id
                      ? "bg-main text-bg"
                      : "text-sub hover:text-text",
                  )}
                >
                  {diff.label}
                </button>
              )}
            </For>
          </div>
        </div>

        <Separator />

        {/* Article Cards Grid */}
        <div
          ref={(el) => {
            scrollContainerRef = el;
          }}
          onScroll={handleScroll}
          class="custom-scroll max-h-[50vh] overflow-y-auto pr-1"
        >
          <Show
            when={!loading()}
            fallback={
              <div class="flex flex-col items-center justify-center py-16 text-sub">
                <Fa icon="fa-circle-notch" class="fa-spin text-2xl" />
                <span class="mt-2 text-sm">Loading practice library...</span>
              </div>
            }
          >
            <Show
              when={filteredTexts().length > 0}
              fallback={
                <div class="flex flex-col items-center justify-center py-16 text-center text-sub">
                  <Fa icon="fa-folder-open" class="mb-3 text-3xl" />
                  <p class="text-base font-semibold text-text">
                    No practice sections found
                  </p>
                  <p class="text-xs">
                    Try adjusting your topic or difficulty filter.
                  </p>
                </div>
              }
            >
              <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <For each={visibleTexts()}>
                  {(item) => (
                    <div class="flex flex-col justify-between rounded-xl border border-sub-alt bg-sub-alt/40 p-4 transition-all hover:border-main/50 hover:bg-sub-alt/70">
                      <div>
                        {/* Card Header: Title & Badges */}
                        <div class="flex items-start justify-between gap-2">
                          <h3 class="line-clamp-1 text-sm font-bold text-text">
                            {item.title}
                          </h3>
                          {getDifficultyBadge(item.difficulty)}
                        </div>

                        {/* Subtitle / Source / Unit */}
                        <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-sub">
                          <span class="font-medium text-main/90 capitalize">
                            {item.category}
                          </span>
                          <Show when={item.unit}>
                            <span>•</span>
                            <span class="rounded bg-main/15 px-1.5 py-0.5 text-[10px] font-semibold text-main">
                              {item.unit}
                            </span>
                          </Show>
                          <span>•</span>
                          <span class="truncate">
                            {item.author !== "" ? item.author : item.source}
                          </span>
                        </div>

                        {/* Preview Snippet */}
                        <p class="mt-2.5 line-clamp-3 text-xs leading-relaxed text-sub/90">
                          {item.text}
                        </p>
                      </div>

                      {/* Card Footer: Metadata & Action */}
                      <div class="mt-4 flex items-center justify-between border-t border-sub-alt/60 pt-3 text-xs">
                        <div class="flex items-center gap-3 text-sub">
                          <span class="flex items-center gap-1">
                            <Fa icon="fa-font" class="text-[10px]" />
                            {item.wordCount} words
                          </span>
                          <span class="flex items-center gap-1">
                            <Fa icon="fa-keyboard" class="text-[10px]" />
                            {item.charCount} chars
                          </span>
                        </div>

                        <div class="flex items-center gap-2">
                          <Button
                            variant="text"
                            class="rounded-lg px-2.5 py-1 text-xs hover:bg-sub-alt"
                            text="edit & shuffle"
                            fa={{ icon: "fa-sliders-h" }}
                            onClick={() => handleLoadAndEdit(item)}
                          />
                          <Button
                            variant="button"
                            class="rounded-lg px-3 py-1 text-xs font-semibold"
                            text="practice"
                            fa={{ icon: "fa-play" }}
                            onClick={() => selectPracticeText(item)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>

              <Show when={hasMore()}>
                <div class="flex justify-center pt-4 pb-2">
                  <Button
                    variant="text"
                    class="rounded-lg px-4 py-1.5 text-xs text-sub hover:bg-sub-alt hover:text-text"
                    text={`Load more (${filteredTexts().length - displayLimit()} remaining)`}
                    fa={{ icon: "fa-chevron-down" }}
                    onClick={loadMore}
                  />
                </div>
              </Show>
            </Show>
          </Show>
        </div>
      </div>
    </AnimatedModal>
  );
}
