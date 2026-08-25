#!/usr/bin/env python3
"""
Practice Text Scraper & Sourcing Pipeline for eepytype.
Fetches, cleans, and categorizes high-quality practice texts from Wikipedia, Project Gutenberg,
or local text files and appends them to frontend/static/practice/practice_texts.json with
computed difficulty metrics.

Usage:
  python scripts/scrape_practice_texts.py --wiki "Quantum mechanics" --category science
  python scripts/scrape_practice_texts.py --wiki "Stoicism" --category philosophy
  python scripts/scrape_practice_texts.py --file path/to/document.txt --title "My Custom Text" --category engineering
  python scripts/scrape_practice_texts.py --bulk-wiki-preset
  python scripts/scrape_practice_texts.py --catalog
"""

import argparse
import json
import os
import re
import urllib.request
import urllib.parse
from typing import Dict, List, Any

ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
PRACTICE_FILE_PATH = os.path.join(
    ROOT_DIR,
    "frontend",
    "static",
    "practice",
    "practice_texts.json"
)
CATALOG_FILE_PATH = os.path.join(ROOT_DIR, "PRACTICE_CATALOG.md")

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
    
    # Difficulty scoring based on avg word length and complex terminology
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
    # Remove citation brackets like [1], [2], [citation needed]
    cleaned = re.sub(r"\[\d+\]|\[citation needed\]|\[edit\]", "", text)
    # Normalize whitespace
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned

def fetch_wikipedia_extract(title: str) -> Dict[str, str]:
    """Fetches clean introductory and main paragraphs from Wikipedia REST API."""
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(title)}"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "EepytypePracticeScraper/1.0 (https://github.com/eepyyyy/eepytype)"}
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        
    page_title = data.get("title", title)
    extract = data.get("extract", "")
    return {
        "title": page_title,
        "text": clean_text(extract),
        "source": f"Wikipedia ({page_title})",
        "author": "Wikipedia Contributors"
    }

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

def add_practice_entry(title: str, text: str, category: str, author: str = "", source: str = "") -> None:
    text = clean_text(text)
    if len(text) < 50:
        print(f"Skipping '{title}': text too short ({len(text)} chars)")
        return
        
    metrics = calculate_difficulty(text)
    slug_id = re.sub(r"[^a-z0-9]+", "-", f"{category}-{title}".lower()).strip("-")
    
    entries = load_existing_texts()
    # Check if id already exists
    entries = [e for e in entries if e.get("id") != slug_id]
    
    new_entry = {
        "id": slug_id,
        "title": title,
        "category": category,
        "difficulty": metrics["difficulty"],
        "wordCount": metrics["wordCount"],
        "charCount": metrics["charCount"],
        "avgWordLength": metrics["avgWordLength"],
        "author": author or "Curated",
        "source": source or category.capitalize(),
        "text": text
    }
    entries.append(new_entry)
    save_texts(entries)
    print(f"Added: [{category.upper()} | {metrics['difficulty'].upper()} | {metrics['wordCount']}w] {title}")

BULK_PRESETS = [
    # Science
    ("General relativity", "science"),
    ("Dark matter", "science"),
    ("Photosynthesis", "science"),
    ("CRISPR gene editing", "science"),
    ("Black hole", "science"),
    ("Quantum electrodynamics", "science"),
    ("Cosmic microwave background", "science"),
    ("Mitochondrion", "science"),
    ("Higgs boson", "science"),
    ("Superconductivity", "science"),
    ("Plate tectonics", "science"),
    ("Quantum chromodynamics", "science"),
    ("Neuroscience", "science"),
    ("Biochemistry", "science"),
    ("Hubble Space Telescope", "science"),
    # Philosophy
    ("Stoicism", "philosophy"),
    ("Utilitarianism", "philosophy"),
    ("Epistemology", "philosophy"),
    ("Existentialism", "philosophy"),
    ("Determinism", "philosophy"),
    ("Categorical imperative", "philosophy"),
    ("Absurdism", "philosophy"),
    ("Nihilism", "philosophy"),
    ("Pragmatism", "philosophy"),
    ("Social contract", "philosophy"),
    ("Phenomenology (philosophy)", "philosophy"),
    ("Mind–body dualism", "philosophy"),
    ("Virtue ethics", "philosophy"),
    ("Deontology", "philosophy"),
    ("Rationalism", "philosophy"),
    ("Empiricism", "philosophy"),
    # Engineering
    ("Gas turbine", "engineering"),
    ("Aerodynamics", "engineering"),
    ("Turbojet", "engineering"),
    ("Finite element method", "engineering"),
    ("Control theory", "engineering"),
    ("Fluid dynamics", "engineering"),
    ("Heat transfer", "engineering"),
    ("Turbopump", "engineering"),
    ("Robotics", "engineering"),
    ("Materials science", "engineering"),
    ("Chemical engineering", "engineering"),
    ("Civil engineering", "engineering"),
    ("Electric motor", "engineering"),
    # Technology
    ("Public-key cryptography", "technology"),
    ("Distributed computing", "technology"),
    ("Reinforcement learning", "technology"),
    ("Operating system kernel", "technology"),
    ("Large language model", "technology"),
    ("Compiler", "technology"),
    ("Computer network", "technology"),
    ("Cryptographic hash function", "technology"),
    ("Turing machine", "technology"),
    ("Relational database", "technology"),
    ("Quantum computing", "technology"),
    ("Cloud computing", "technology"),
    ("Cybersecurity", "technology"),
    ("Computer graphics", "technology"),
    ("Blockchain", "technology"),
    # History
    ("Renaissance", "history"),
    ("Industrial Revolution", "history"),
    ("Scientific Revolution", "history"),
    ("Age of Enlightenment", "history"),
    ("Space Race", "history"),
    ("Silk Road", "history"),
    ("Ancient Egypt", "history"),
    ("Ancient Greece", "history"),
    ("Roman Empire", "history"),
    ("Byzantine Empire", "history"),
    ("Middle Ages", "history"),
    # Literature
    ("Romanticism", "literature"),
    ("Modernist literature", "literature"),
    ("Magical realism", "literature"),
    ("Greek tragedy", "literature"),
    ("Gothic fiction", "literature"),
    ("Epic poetry", "literature"),
    ("Satire", "literature"),
    # Medicine
    ("Neuroplasticity", "medicine"),
    ("Immune system", "medicine"),
    ("Cardiovascular system", "medicine"),
    ("Pharmacology", "medicine"),
    ("Action potential", "medicine"),
    ("Genetics", "medicine"),
    ("Virology", "medicine"),
    ("Pathology", "medicine"),
    ("Human anatomy", "medicine"),
    ("Epidemiology", "medicine"),
    # Law & Civics
    ("Rule of law", "law"),
    ("Constitutional law", "law"),
    ("Separation of powers", "law"),
    ("Universal Declaration of Human Rights", "law"),
    ("Common law", "law"),
    ("Jurisprudence", "law"),
    # Nature & Earth
    ("Marine biology", "nature"),
    ("Ecosystem", "nature"),
    ("Biodiversity", "nature"),
    ("Climate change", "nature"),
    ("Astronomy", "nature"),
    ("Coral reef", "nature"),
    # Art & Culture
    ("Art history", "art"),
    ("Music theory", "art"),
    ("Impressionism", "art"),
    ("Architecture", "art"),
    ("Aesthetics", "art"),
]

def generate_catalog_markdown() -> None:
    texts = load_existing_texts()
    if not texts:
        print("No texts found to catalog.")
        return

    # Group by category
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

def run_bulk_wiki_scraper() -> None:
    print("Running bulk Wikipedia practice text scraper across all genres...")
    for title, cat in BULK_PRESETS:
        try:
            res = fetch_wikipedia_extract(title)
            if res["text"]:
                add_practice_entry(
                    title=res["title"],
                    text=res["text"],
                    category=cat,
                    author="Wikipedia",
                    source=res["source"]
                )
        except Exception as e:
            print(f"Error fetching '{title}': {e}")
    generate_catalog_markdown()

def main():
    parser = argparse.ArgumentParser(description="Scrape and ingest practice texts for eepytype")
    parser.add_argument("--wiki", type=str, help="Wikipedia article title to fetch")
    parser.add_argument("--category", type=str, default="general", help="Category (science, philosophy, engineering, technology, literature, history, medicine, law, nature, art)")
    parser.add_argument("--file", type=str, help="Path to local text file to ingest")
    parser.add_argument("--title", type=str, help="Title for local file ingestion")
    parser.add_argument("--author", type=str, default="", help="Author name")
    parser.add_argument("--source", type=str, default="", help="Source citation")
    parser.add_argument("--bulk-wiki-preset", action="store_true", help="Scrape curated Wikipedia topics across all genres")
    parser.add_argument("--catalog", action="store_true", help="Generate PRACTICE_CATALOG.md from current library")

    args = parser.parse_args()

    if args.catalog:
        generate_catalog_markdown()
    elif args.bulk_wiki_preset:
        run_bulk_wiki_scraper()
    elif args.wiki:
        try:
            res = fetch_wikipedia_extract(args.wiki)
            add_practice_entry(
                title=res["title"],
                text=res["text"],
                category=args.category,
                author=args.author or res["author"],
                source=args.source or res["source"]
            )
            generate_catalog_markdown()
        except Exception as e:
            print(f"Failed to fetch Wikipedia article '{args.wiki}': {e}")
    elif args.file:
        if not os.path.exists(args.file):
            print(f"File not found: {args.file}")
            return
        with open(args.file, "r", encoding="utf-8") as f:
            content = f.read()
        title = args.title or os.path.splitext(os.path.basename(args.file))[0].replace("_", " ").title()
        add_practice_entry(
            title=title,
            text=content,
            category=args.category,
            author=args.author,
            source=args.source or os.path.basename(args.file)
        )
        generate_catalog_markdown()
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
