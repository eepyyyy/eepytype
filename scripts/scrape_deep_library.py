#!/usr/bin/env python3
"""
Deep Library Scraper & Generator for eepytype.
Uses Wikipedia Search API + Summary REST API to build a rich 1,500 - 2,000 text library
across 10 core genres: Science, Philosophy, Engineering, Technology, Literature,
History, Medicine, Law, Nature, Art.
"""

import concurrent.futures
import json
import os
import re
import time
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional, Set, Tuple

ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
PRACTICE_FILE_PATH = os.path.join(
    ROOT_DIR, "frontend", "static", "practice", "practice_texts.json"
)
CATALOG_FILE_PATH = os.path.join(ROOT_DIR, "PRACTICE_CATALOG.md")

USER_AGENT = "EepytypeDeepScraper/2.0 (https://github.com/eepyyyy/eepytype; library-expansion)"

SEARCH_SEEDS: Dict[str, List[str]] = {
    "science": [
        "quantum physics", "astrophysics", "cosmology", "particle physics",
        "organic chemistry", "biochemistry", "molecular biology", "genetics",
        "evolutionary biology", "cell biology", "neuroscience", "geology",
        "oceanography", "meteorology", "climatology", "thermodynamics",
        "electromagnetism", "optics", "crystallography", "spectroscopy",
        "astronomy", "planetary science", "paleontology", "ecology"
    ],
    "philosophy": [
        "ancient philosophy", "stoicism", "epistemology", "metaphysics",
        "ethics", "moral philosophy", "existentialism", "phenomenology",
        "political philosophy", "philosophy of mind", "philosophy of language", "logic",
        "rationalism", "empiricism", "utilitarianism", "deontology",
        "pragmatism", "eastern philosophy", "buddhist philosophy", "taoism",
        "critical theory", "aesthetics philosophy", "analytic philosophy", "continental philosophy"
    ],
    "engineering": [
        "aerospace engineering", "mechanical engineering", "electrical engineering", "civil engineering",
        "chemical engineering", "materials science", "structural engineering", "robotics engineering",
        "biomedical engineering", "nuclear engineering", "control theory", "fluid mechanics",
        "heat transfer", "thermodynamics engineering", "renewable energy engineering", "avionics",
        "mechatronics", "nanotechnology", "telecommunications engineering", "hydraulic engineering",
        "automotive engineering", "marine engineering", "industrial engineering", "acoustical engineering"
    ],
    "technology": [
        "computer science", "artificial intelligence", "machine learning", "deep learning",
        "neural network", "cryptography", "distributed systems", "operating system",
        "database engine", "computer architecture", "quantum computing", "computer networking",
        "cybersecurity", "software engineering", "compiler construction", "cloud computing",
        "algorithms", "data structures", "computer graphics", "virtual reality",
        "augmented reality", "autonomous systems", "web technology", "blockchain technology"
    ],
    "literature": [
        "classical literature", "epic poetry", "world literature", "literary movement",
        "renaissance literature", "romantic literature", "victorian literature", "modernist literature",
        "postmodern literature", "gothic novel", "dystopian literature", "science fiction novel",
        "greek drama", "shakespearean tragedy", "literary realism", "magical realism",
        "russian novel", "french literature", "narrative technique", "poetic forms",
        "mythology literature", "existentialist literature", "satire literature", "literary theory"
    ],
    "history": [
        "ancient history", "roman empire", "ancient greece", "ancient egypt",
        "middle ages", "byzantine empire", "renaissance history", "scientific revolution",
        "age of enlightenment", "industrial revolution", "french revolution", "american revolution",
        "world war 1", "world war 2", "cold war", "space race",
        "maritime exploration", "silk road history", "islamic golden age", "east asian history",
        "african history", "pre-columbian civilizations", "archaeology", "history of science"
    ],
    "medicine": [
        "human anatomy", "human physiology", "pathology", "immunology",
        "pharmacology", "cardiology", "neurology", "oncology",
        "epidemiology", "virology", "microbiology", "endocrinology",
        "pulmonology", "gastroenterology", "medical genetics", "clinical medicine",
        "surgery", "anesthesiology", "radiology", "psychiatry",
        "public health", "hematology", "orthopedics", "biomedical research"
    ],
    "law": [
        "constitutional law", "international law", "jurisprudence", "human rights law",
        "criminal law", "civil law system", "common law", "administrative law",
        "property law", "contract law", "tort law", "intellectual property law",
        "environmental law", "maritime law", "corporate law", "legal philosophy",
        "judicial system", "due process", "international court", "treaties",
        "cyberlaw", "space law", "comparative law", "legal history"
    ],
    "nature": [
        "marine ecosystems", "tropical rainforest", "coral reef ecology", "deep sea biology",
        "alpine ecosystem", "desert ecology", "polar ecology", "biodiversity conservation",
        "wildlife biology", "animal behavior", "plant physiology", "fungal ecology",
        "geological landforms", "volcanism", "ocean currents", "atmospheric phenomena",
        "glaciology", "hydrology nature", "evolutionary adaptation", "symbiosis biology",
        "endangered species", "biomes", "wetlands ecology", "estuary ecology"
    ],
    "art": [
        "art history", "renaissance art", "baroque art", "impressionism art",
        "modern art", "contemporary art", "sculpture history", "architecture history",
        "classical music", "music theory", "opera history", "cinematography",
        "photography history", "graphic design", "typography", "aesthetic theory",
        "gothic architecture", "bauhaus", "color theory art", "fresco painting",
        "printmaking", "performing arts", "choreography", "visual arts"
    ]
}

def calculate_difficulty(text: str) -> Dict[str, Any]:
    words = re.findall(r"\b\w+\b", text)
    word_count = len(words)
    char_count = len(text)

    if word_count == 0:
        return {
            "wordCount": 0,
            "charCount": char_count,
            "avgWordLength": 0.0,
            "difficulty": "easy"
        }

    avg_len = sum(len(w) for w in words) / word_count

    if avg_len < 5.0:
        difficulty = "easy"
    elif avg_len < 5.7:
        difficulty = "medium"
    elif avg_len < 6.3:
        difficulty = "hard"
    else:
        difficulty = "expert"

    return {
        "wordCount": word_count,
        "charCount": char_count,
        "avgWordLength": round(avg_len, 1),
        "difficulty": difficulty
    }

def clean_text(text: str) -> str:
    cleaned = re.sub(r"\[\d+\]|\[citation needed\]|\[edit\]", "", text)
    cleaned = re.sub(r"\(/[^)]+/\)", "", cleaned)
    cleaned = cleaned.replace("“", '"').replace("”", '"').replace("’", "'").replace("‘", "'")
    cleaned = cleaned.replace("—", " - ").replace("–", "-")
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned

def search_wikipedia_titles(query: str, limit: int = 25) -> List[str]:
    encoded = urllib.parse.quote(query)
    url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={encoded}&srlimit={limit}&format=json"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            items = data.get("query", {}).get("search", [])
            titles = [item["title"] for item in items if not item["title"].startswith("List of")]
            return titles
    except Exception:
        return []

def fetch_wikipedia_entry(title: str, category: str) -> Optional[Dict[str, Any]]:
    encoded_title = urllib.parse.quote(title.replace(" ", "_"))
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{encoded_title}"

    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=12) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    if data.get("type") == "disambiguation":
                        return None

                    extract = data.get("extract", "")
                    cleaned = clean_text(extract)
                    # Filter out very short or non-prose texts
                    if len(cleaned) < 100 or cleaned.endswith("refer to:") or "may refer to" in cleaned:
                        return None

                    page_title = data.get("title", title)
                    metrics = calculate_difficulty(cleaned)
                    slug_id = re.sub(r"[^a-z0-9]+", "-", f"{category}-{page_title}".lower()).strip("-")

                    return {
                        "id": slug_id,
                        "title": page_title,
                        "category": category,
                        "difficulty": metrics["difficulty"],
                        "wordCount": metrics["wordCount"],
                        "charCount": metrics["charCount"],
                        "avgWordLength": metrics["avgWordLength"],
                        "author": "Wikipedia",
                        "source": f"Wikipedia ({page_title})",
                        "text": cleaned
                    }
        except Exception:
            time.sleep(0.4 * (attempt + 1))

    return None

def load_existing_texts() -> List[Dict[str, Any]]:
    if os.path.exists(PRACTICE_FILE_PATH):
        try:
            with open(PRACTICE_FILE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_texts(texts: List[Dict[str, Any]]) -> None:
    os.makedirs(os.path.dirname(PRACTICE_FILE_PATH), exist_ok=True)
    with open(PRACTICE_FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(texts, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(texts)} practice texts to {PRACTICE_FILE_PATH}")

def generate_catalog(texts: List[Dict[str, Any]]) -> None:
    by_cat: Dict[str, List[Dict[str, Any]]] = {}
    for t in texts:
        cat = t.get("category", "general")
        by_cat.setdefault(cat, []).append(t)

    lines = [
        "# Eepytype Practice Library Catalog",
        "",
        f"Total Curated Practice Sections: **{len(texts)}**",
        "",
        "| Category | Total Texts | Topics Preview |",
        "| :--- | :---: | :--- |"
    ]

    for cat, items in sorted(by_cat.items()):
        titles = ", ".join(i["title"] for i in items[:4])
        if len(items) > 4:
            titles += f", +{len(items)-4} more"
        lines.append(f"| **{cat.capitalize()}** | {len(items)} | {titles} |")

    lines.append("")
    lines.append("---")
    lines.append("")

    for cat, items in sorted(by_cat.items()):
        lines.append(f"## {cat.capitalize()} ({len(items)} entries)")
        lines.append("")
        lines.append("| Title | Difficulty | Words | Chars | Author / Source | Preview Excerpt |")
        lines.append("| :--- | :---: | :---: | :---: | :--- | :--- |")
        for item in sorted(items, key=lambda x: x["title"]):
            title = item.get("title", "Untitled")
            diff = item.get("difficulty", "medium").upper()
            diff_badge = {"EASY": "🟢 Easy", "MEDIUM": "🟡 Medium", "HARD": "🔴 Hard", "EXPERT": "🟣 Expert"}.get(diff, diff)
            wc = item.get("wordCount", 0)
            cc = item.get("charCount", 0)
            src = item.get("author") or item.get("source") or "Curated"
            preview = (item.get("text", "")[:100] + "...").replace("|", "-")
            lines.append(f"| **{title}** | {diff_badge} | {wc}w | {cc}c | {src} | {preview} |")
        lines.append("")

    with open(CATALOG_FILE_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Generated comprehensive practice catalog: {CATALOG_FILE_PATH} ({len(texts)} sections)")

def run_deep_scraper(target_total: int = 1600) -> None:
    existing = load_existing_texts()
    existing_map = {e["id"]: e for e in existing}
    print(f"Starting with {len(existing)} existing sections. Target: {target_total}+ sections.")

    # 1. Discover article titles across all genres
    print("\nPhase 1: Discovering high-quality topics across 10 genres...")
    all_tasks: List[Tuple[str, str]] = []
    seen_titles: Set[str] = set()

    for e in existing:
        seen_titles.add(e.get("title", "").lower())

    for cat, seeds in SEARCH_SEEDS.items():
        print(f"  Searching topics for category: {cat}...")
        for seed in seeds:
            found_titles = search_wikipedia_titles(seed, limit=15)
            for title in found_titles:
                normalized = title.lower().strip()
                if normalized not in seen_titles:
                    seen_titles.add(normalized)
                    all_tasks.append((title, cat))

    print(f"Total newly discovered topics across all genres: {len(all_tasks)}")

    # 2. Concurrently fetch and clean extracts
    print(f"\nPhase 2: Concurrently fetching extracts (25 workers)...")
    new_entries: List[Dict[str, Any]] = []
    success_count = 0

    with concurrent.futures.ThreadPoolExecutor(max_workers=25) as executor:
        future_to_task = {
            executor.submit(fetch_wikipedia_entry, title, cat): (title, cat)
            for title, cat in all_tasks
        }

        for future in concurrent.futures.as_completed(future_to_task):
            try:
                result = future.result()
                if result:
                    entry_id = result["id"]
                    if entry_id not in existing_map:
                        existing_map[entry_id] = result
                        new_entries.append(result)
                        success_count += 1
                        if success_count % 100 == 0:
                            print(f"  [Progress] Fetched {success_count} new practice texts (Total: {len(existing) + success_count})...")
            except Exception:
                pass

    final_list = existing + new_entries
    save_texts(final_list)
    generate_catalog(final_list)
    print(f"\nDeep scraping complete! Added {len(new_entries)} new texts. Library total: {len(final_list)} sections.")

if __name__ == "__main__":
    run_deep_scraper(target_total=1600)
