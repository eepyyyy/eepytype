#!/usr/bin/env python3
"""
MongoDB Atlas Sync & Storage Pipeline for eepytype practice texts.
Loads credentials from atlas-credentials.env or environment variables,
connects to MongoDB Atlas cluster, and synchronizes practice texts with indexes.

Usage:
  python scripts/mongo_sync.py --upload-all
  python scripts/mongo_sync.py --download-all
  python scripts/mongo_sync.py --status
"""

import os
import json
import argparse
from typing import Optional, Dict, Any, List
import pymongo
from pymongo import MongoClient, UpdateOne

ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
CREDENTIALS_PATH = os.path.join(ROOT_DIR, "atlas-credentials.env")
PRACTICE_FILE_PATH = os.path.join(ROOT_DIR, "frontend", "static", "practice", "practice_texts.json")

def get_mongodb_uri() -> str:
    # First check env var
    uri = os.environ.get("MONGODB_URI")
    if uri:
        return uri
    
    # Check atlas-credentials.env
    if os.path.exists(CREDENTIALS_PATH):
        with open(CREDENTIALS_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("MONGODB_URI="):
                    val = line.split("=", 1)[1].strip().strip('"').strip("'")
                    return val
    
    raise ValueError("MONGODB_URI not found in environment or atlas-credentials.env")

import certifi

def get_client() -> MongoClient:
    uri = get_mongodb_uri()
    if "appName=" not in uri:
        if "?" in uri:
            uri += "&appName=eepytype"
        else:
            uri += "?retryWrites=true&w=majority&appName=eepytype"
    return MongoClient(uri, tlsCAFile=certifi.where())

def sync_to_mongodb(db_name: str = "eepytype", collection_name: str = "practice_texts") -> None:
    if not os.path.exists(PRACTICE_FILE_PATH):
        print(f"File not found: {PRACTICE_FILE_PATH}")
        return

    with open(PRACTICE_FILE_PATH, "r", encoding="utf-8") as f:
        texts = json.load(f)

    if not texts:
        print("No texts to sync.")
        return

    print(f"Connecting to MongoDB Atlas...")
    client = get_client()
    db = client[db_name]
    coll = db[collection_name]

    # Create indexes
    coll.create_index([("id", pymongo.ASCENDING)], unique=True)
    coll.create_index([("category", pymongo.ASCENDING)])
    coll.create_index([("difficulty", pymongo.ASCENDING)])
    coll.create_index([("title", "text"), ("text", "text")])

    operations = []
    for item in texts:
        doc_id = item.get("id")
        if not doc_id:
            continue
        operations.append(
            UpdateOne(
                {"id": doc_id},
                {"$set": item},
                upsert=True
            )
        )

    if operations:
        res = coll.bulk_write(operations)
        print(f"Successfully synced to MongoDB Atlas [{db_name}.{collection_name}]:")
        print(f"  Upserted: {res.upserted_count}")
        print(f"  Matched:  {res.matched_count}")
        print(f"  Modified: {res.modified_count}")
        print(f"  Total in collection: {coll.count_documents({})}")

def export_from_mongodb(db_name: str = "eepytype", collection_name: str = "practice_texts") -> None:
    print("Exporting practice texts from MongoDB Atlas...")
    client = get_client()
    db = client[db_name]
    coll = db[collection_name]

    cursor = coll.find({}, {"_id": 0}).sort("category", 1)
    docs = list(cursor)
    
    os.makedirs(os.path.dirname(PRACTICE_FILE_PATH), exist_ok=True)
    with open(PRACTICE_FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(docs, f, indent=2, ensure_ascii=False)
    print(f"Exported {len(docs)} texts from MongoDB Atlas to {PRACTICE_FILE_PATH}")

def check_status(db_name: str = "eepytype", collection_name: str = "practice_texts") -> None:
    client = get_client()
    db = client[db_name]
    coll = db[collection_name]
    count = coll.count_documents({})
    print(f"Connected to MongoDB Atlas: database='{db_name}', collection='{collection_name}', total_documents={count}")
    
    # Summary by category
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    cats = list(coll.aggregate(pipeline))
    print("\nDocuments by Category:")
    for c in cats:
        print(f"  - {c['_id']}: {c['count']}")

def main():
    parser = argparse.ArgumentParser(description="MongoDB Atlas synchronization tool for eepytype")
    parser.add_argument("--upload-all", action="store_true", help="Upload local practice_texts.json to MongoDB Atlas")
    parser.add_argument("--download-all", action="store_true", help="Download all texts from MongoDB Atlas into local static json")
    parser.add_argument("--status", action="store_true", help="Check connection and collection stats")

    args = parser.parse_args()

    if args.download_all:
        export_from_mongodb()
    elif args.status:
        check_status()
    else:
        sync_to_mongodb()

if __name__ == "__main__":
    main()
