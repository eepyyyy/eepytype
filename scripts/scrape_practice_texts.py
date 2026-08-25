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
"""

import argparse
import json
import os
import re
import urllib.request
import urllib.parse
from typing import Dict, List, Any

PRACTICE_FILE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "frontend",
    "static",
    "practice",
    "practice_texts.json"
)

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
    # Easy: avg length < 5.0
    # Medium: avg length 5.0 - 5.7
    # Hard: avg length 5.7 - 6.2
    # Expert: avg length >= 6.2 or heavy punctuation
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
    # Philosophy
    ("Utilitarianism", "philosophy"),
    ("Epistemology", "philosophy"),
    ("Existentialism", "philosophy"),
    ("Determinism", "philosophy"),
    ("Categorical imperative", "philosophy"),
    # Technology
    ("Public-key cryptography", "technology"),
    ("Distributed computing", "technology"),
    ("Reinforcement learning", "technology"),
    ("Operating system kernel", "technology"),
    # Literature & History
    ("Renaissance", "history"),
    ("Industrial Revolution", "history"),
    ("Romanticism", "literature"),
]

def run_bulk_wiki_scraper() -> None:
    print("Running bulk Wikipedia practice text scraper...")
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

def main():
    parser = argparse.ArgumentParser(description="Scrape and ingest practice texts for eepytype")
    parser.add_argument("--wiki", type=str, help="Wikipedia article title to fetch")
    parser.add_argument("--category", type=str, default="general", help="Category (science, philosophy, engineering, technology, literature, history, medicine)")
    parser.add_argument("--file", type=str, help="Path to local text file to ingest")
    parser.add_argument("--title", type=str, help="Title for local file ingestion")
    parser.add_argument("--author", type=str, default="", help="Author name")
    parser.add_argument("--source", type=str, default="", help="Source citation")
    parser.add_argument("--bulk-wiki-preset", action="store_true", help="Scrape curated Wikipedia topics across science, philosophy, tech, history")

    args = parser.parse_args()

    if args.bulk_wiki_preset:
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
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
