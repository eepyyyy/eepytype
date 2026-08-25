import os
import json
from pathlib import Path
from mistralai import Mistral

api_key = "93Xip0fM5kC49TvOATiPJXhBy2Bxgaqo"
client = Mistral(api_key=api_key)

pdf_path = Path("touchtypinginten00ruth_1.pdf")
print(f"Reading {pdf_path.name} ({pdf_path.stat().st_size} bytes)...")

print("1/3 Uploading PDF to Mistral...")
with open(pdf_path, "rb") as f:
    uploaded_pdf = client.files.upload(
        file={
            "file_name": pdf_path.name,
            "content": f.read(),
        },
        purpose="ocr"
    )

print(f"Uploaded! File ID: {uploaded_pdf.id}")

print("2/3 Getting signed URL...")
signed_url = client.files.get_signed_url(file_id=uploaded_pdf.id)

print("3/3 Processing document with Mistral OCR API (mistral-ocr-latest)...")
ocr_response = client.ocr.process(
    model="mistral-ocr-latest",
    document={
        "type": "document_url",
        "document_url": signed_url.url
    },
    include_image_base64=False
)

print(f"Success! Processed {len(ocr_response.pages)} pages.")

# Save Markdown
md_pages = []
for i, page in enumerate(ocr_response.pages, 1):
    header = f"<!-- PAGE {i} -->\n"
    md_pages.append(header + page.markdown)

full_markdown = "\n\n---\n\n".join(md_pages)

output_md = Path("d:/eepytype/touch_typing_full_ocr.md")
output_md.write_text(full_markdown, encoding="utf-8")
print(f"Saved complete OCR Markdown: {output_md} ({len(full_markdown)} chars)")

# Save JSON structure
output_json = Path("d:/eepytype/touch_typing_ocr_raw.json")
with open(output_json, "w", encoding="utf-8") as f:
    json.dump([p.model_dump() if hasattr(p, 'model_dump') else p.dict() for p in ocr_response.pages], f, indent=2, ensure_ascii=False)
print(f"Saved OCR JSON cache: {output_json}")
