import { createEffect, createSignal, For, JSXElement, Show } from "solid-js";

import { setConfig } from "../../config/setters";
import { restartTestEvent } from "../../events/test";
import { setCustomTextIndicator } from "../../states/core";
import { hideModal } from "../../states/modals";
import * as CustomText from "../../test/custom-text";
import { cn } from "../../utils/cn";
import { AnimatedModal } from "../common/AnimatedModal";
import { Button } from "../common/Button";
import { Fa } from "../common/Fa";
import { Separator } from "../common/Separator";

export type PracticeTextEntry = {
  id: string;
  title: string;
  category: string;
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
  { id: "science", label: "Science", icon: "fa-atom" as const },
  { id: "philosophy", label: "Philosophy", icon: "fa-brain" as const },
  { id: "engineering", label: "Engineering", icon: "fa-cogs" as const },
  { id: "technology", label: "Technology", icon: "fa-microchip" as const },
  { id: "literature", label: "Literature", icon: "fa-book" as const },
  { id: "history", label: "History", icon: "fa-landmark" as const },
  { id: "medicine", label: "Medicine", icon: "fa-heartbeat" as const },
];

const difficulties = [
  { id: "all", label: "All Difficulties" },
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
  { id: "expert", label: "Expert" },
];

export function PracticeSectionsModal(): JSXElement {
  const [texts, setTexts] = createSignal<PracticeTextEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = createSignal<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] =
    createSignal<string>("all");
  const [searchQuery, setSearchQuery] = createSignal<string>("");
  const [loading, setLoading] = createSignal<boolean>(true);

  createEffect(() => {
    void (async () => {
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
    })();
  });

  const filteredTexts = () => {
    const query = searchQuery().toLowerCase().trim();
    const cat = selectedCategory();
    const diff = selectedDifficulty();

    return texts().filter((item) => {
      const matchCat = cat === "all" || item.category === cat;
      const matchDiff = diff === "all" || item.difficulty === diff;
      const matchQuery =
        query === "" ||
        item.title.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query) ||
        item.text.toLowerCase().includes(query);

      return matchCat && matchDiff && matchQuery;
    });
  };

  const selectPracticeText = (item: PracticeTextEntry): void => {
    CustomText.setCustomText(item.title, item.text, true);
    CustomText.setText([item.text]);
    setCustomTextIndicator({
      name: item.title,
      isLong: true,
    });
    setConfig("mode", "custom");
    restartTestEvent.dispatch();
    hideModal("PracticeSections");
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
      title="Practice Sections"
      modalClass="max-w-4xl"
    >
      <div class="flex flex-col gap-4">
        {/* Top Info Header */}
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-sub-alt pb-3">
          <p class="text-xs text-sub">
            Explore curated practice sections across Science, Philosophy,
            Engineering, Literature, and History with difficulty ratings and
            word counts.
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
                onClick={() => setSelectedCategory(cat.id)}
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

        {/* Search & Difficulty Filter Bar */}
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
          <div class="relative flex items-center">
            <Fa icon="fa-search" class="absolute left-3.5 text-sub" />
            <input
              type="text"
              placeholder="Search by topic, author, content or keyword..."
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              class="w-full rounded-xl border border-sub-alt bg-bg py-2.5 pr-4 pl-10 text-sm text-text placeholder-sub/60 focus:border-main focus:outline-none"
            />
            <Show when={searchQuery().length > 0}>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
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
                  onClick={() => setSelectedDifficulty(diff.id)}
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
        <div class="custom-scroll max-h-[50vh] overflow-y-auto pr-1">
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
                <For each={filteredTexts()}>
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

                        {/* Subtitle / Source */}
                        <div class="mt-1 flex items-center gap-2 text-xs text-sub">
                          <span class="font-medium text-main/90 capitalize">
                            {item.category}
                          </span>
                          <span>•</span>
                          <span class="truncate">
                            {item.author || item.source}
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

                        <Button
                          variant="button"
                          class="rounded-lg px-3 py-1 text-xs font-semibold"
                          text="Practice"
                          fa={{ icon: "fa-play" }}
                          onClick={() => selectPracticeText(item)}
                        />
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </Show>
        </div>
      </div>
    </AnimatedModal>
  );
}
