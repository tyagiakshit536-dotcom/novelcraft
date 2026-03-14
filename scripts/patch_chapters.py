import os
import re
import requests
import json
import time
from dotenv import load_dotenv

load_dotenv('../.env')
url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY")

HEADERS = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

TITLES_TO_PATCH = [
    "The Expedition of Humphry Clinker",
    "The Adventures of Ferdinand Count Fathom",
    "Beowulf",
    "The Adventures of Roderick Random",
    "History of Tom Jones, a Foundling",
    "A Modest Proposal",
    "A Doll's House",
    "Dracula",
    "The Importance of Being Earnest",
    "Adventures of Huckleberry Finn",
    "A Tale of Two Cities",
    "The King in Yellow",
    "The Brothers Karamazov",
    "The Adventures of Sherlock Holmes",
    "The Count of Monte Cristo",
    "The Yellow Wallpaper",
    "Spoon River Anthology",
    "The Prince",
    "Leviathan",
    "Great Expectations",
    "Metamorphosis",
    "Embers",
    "The Scarlet Letter",
    "Grimms' Fairy Tales",
    "White Nights, and Other Stories",
    "Walden, and On The Duty Of Civil Disobedience",
    "Ulysses",
    "The Adventures of Tom Sawyer",
    "Thus Spake Zarathustra",
    "The Souls of Black Folk"
]

def normalize_title(title):
    return re.sub(r"[^a-z0-9]+", " ", (title or "").lower()).strip()

def clean_gutenberg_text(text):
    start_markers = ["*** START OF THE PROJECT GUTENBERG EBOOK", "*** START OF THIS PROJECT GUTENBERG EBOOK"]
    end_markers = ["*** END OF THE PROJECT GUTENBERG EBOOK", "*** END OF THIS PROJECT GUTENBERG EBOOK"]
    
    start_idx = 0
    end_idx = len(text)
    
    for marker in start_markers:
        idx = text.find(marker)
        if idx != -1:
            start_idx = text.find('\n', idx) + 1
            break
            
    for marker in end_markers:
        idx = text.find(marker)
        if idx != -1:
            end_idx = idx
            break
            
    return text[start_idx:end_idx].strip()

def parse_volumes_and_chapters(text):
    lines = text.split("\n")
    volumes = []

    current_volume = {"title": "Volume I", "chapters": []}
    current_chapter = None
    chapter_content = []

    def save_chapter():
        nonlocal current_chapter, chapter_content, current_volume
        if current_chapter:
            current_chapter["content"] = "\n".join(chapter_content).strip()
            if len(current_chapter["content"]) > 10:
                current_volume["chapters"].append(current_chapter)
        current_chapter = None
        chapter_content = []

    def save_volume():
        nonlocal current_volume, volumes
        if current_volume["chapters"]:
            volumes.append(current_volume)

    volume_pattern = re.compile(
        r"^\s*(?i:VOLUME|BOOK|PART)\s+(?:[IVXLCDMivxlcdm]+|\d+|[A-Z][A-Z0-9\-\.]*)"
        r"(?:[\s\-:.,;]+[A-Za-z0-9][A-Za-z0-9 ,;:'\"()\-]*)?\s*$"
    )
    chapter_pattern = re.compile(
        r"^\s*(?i:CHAPTER|STAVE|LETTER|ACT|SCENE)\s+(?:[IVXLCDMivxlcdm]+|\d+|[A-Z][A-Z0-9\-\.]*)"
        r"(?:[\s\-:.,;]+[A-Za-z0-9][A-Za-z0-9 ,;:'\"()\-]*)?\s*$"
    )

    for line in lines:
        stripped = line.strip()

        if volume_pattern.match(stripped) and len(stripped) < 80:
            save_chapter()
            save_volume()
            current_volume = {"title": stripped, "chapters": []}
            continue

        if chapter_pattern.match(stripped) and len(stripped) < 80:
            save_chapter()
            current_chapter = {"title": stripped, "content": ""}
            continue

        if current_chapter:
            chapter_content.append(line)
        else:
            if not current_chapter and len(chapter_content) == 0:
                current_chapter = {"title": "Prologue / Introduction", "content": ""}
            chapter_content.append(line)

    save_chapter()
    save_volume()

    if not volumes:
        volumes = [{"title": "Volume I", "chapters": [{"title": "Chapter 1", "content": text}]}]

    final_volumes = []
    import textwrap
    for vol in volumes:
        new_vol = {"title": vol["title"], "chapters": []}
        for ch in vol["chapters"]:
            if len(ch["content"]) > 150000:
                chunks = textwrap.wrap(ch["content"], 150000)
                for i, chunk in enumerate(chunks):
                    new_vol["chapters"].append({"title": f"{ch['title']} (Part {i+1})", "content": chunk})
            else:
                new_vol["chapters"].append(ch)
        final_volumes.append(new_vol)

    return final_volumes

def fetch_book_text_from_gutendex(title, target_norm):
    search_url = f"https://gutendex.com/books/?search={requests.utils.quote(title)}"
    res = requests.get(search_url)
    if res.status_code == 200:
        data = res.json()
        if data["results"]:
            def rank(item):
                name = normalize_title(item.get("title", ""))
                if name == target_norm:
                    return 0
                if target_norm in name:
                    return 1
                if name in target_norm:
                    return 2
                return 9

            ordered = sorted(data["results"], key=rank)
            bk = ordered[0]
            print(f"  Matched Gutendex title: {bk.get('title', '')}")
            for fmt, link in bk["formats"].items():
                if ("text/plain" in fmt.lower()) and "zip" not in fmt:
                    print(f"  Downloading from: {link}")
                    try:
                        time.sleep(3) # Avoid Gutenberg rate limits!
                        headers = {"User-Agent": "Mozilla/5.0"}
                        return requests.get(link, headers=headers, timeout=20).text
                    except Exception as e:
                        print(f"  Fetch error: {e}")
                        return None
    return None

def process_novels():
    res = requests.get(f"{url}/rest/v1/novels?select=id,title", headers=HEADERS)
    if res.status_code >= 300:
        print("Failed to get novels.")
        return
    
    db_novels = res.json()
    db_novels_with_norm = [
        {
            "id": n["id"],
            "title": n["title"],
            "norm": normalize_title(n["title"])
        }
        for n in db_novels
    ]
    
    for target in TITLES_TO_PATCH:
        target_norm = normalize_title(target)
        matched_novel = next((n for n in db_novels_with_norm if n["norm"] == target_norm), None)
        if not matched_novel:
            matched_novel = next((n for n in db_novels_with_norm if target_norm in n["norm"]), None)
        if not matched_novel:
            matched_novel = next((n for n in db_novels_with_norm if n["norm"] in target_norm), None)

        if not matched_novel:
            print(f"--> Novel not found in DB for targeting: {target}")
            continue
            
        novel_id = matched_novel['id']
        novel_title = matched_novel['title']
        print(f"\n--- Patching {novel_title} ---")

        # 2. Fetch Text First!
        print(" -> Fetching text from Gutendex...")
        raw_text = fetch_book_text_from_gutendex(novel_title, target_norm)
        if not raw_text:
            print(" -> Failed to fetch text. Retrying with explicit Gutendex call...")
            raw_text = fetch_book_text_from_gutendex(target, target_norm)
            if not raw_text:
                continue

        clean_text = clean_gutenberg_text(raw_text)
        print(f" -> Clean text length: {len(clean_text)}")

        # 3. Parse and chunk
        volumes = parse_volumes_and_chapters(clean_text)

        # 1. Safely delete old chapters & volumes to prevent duplicates
        print(" -> Deleting old volumes and chapters...")
        requests.delete(f"{url}/rest/v1/chapters?novel_id=eq.{novel_id}", headers=HEADERS)
        requests.delete(f"{url}/rest/v1/volumes?novel_id=eq.{novel_id}", headers=HEADERS)

        # 4. Insert
        vol_idx = 1
        for vol in volumes:
            print(f" -> Inserting {vol['title']} with {len(vol['chapters'])} chapters...")
            v_payload = {"novel_id": novel_id, "title": vol["title"][:255], "order_index": vol_idx}
            v_res = None
            for attempt in range(3):
                try:
                    v_res = requests.post(f"{url}/rest/v1/volumes", headers=HEADERS, json=v_payload, timeout=30)
                    break
                except requests.RequestException as e:
                    print(f"   [!] Volume insert network error (attempt {attempt + 1}/3): {e}")
                    time.sleep(2)
                    continue
            if v_res is None:
                print("   [!] Failed to insert volume after retries.")
                vol_idx += 1
                continue
            if v_res.status_code >= 300:
                print(f"   [!] Failed to insert vol: {v_res.text}")
                vol_idx += 1
                continue
            vol_id = v_res.json()[0]["id"]
            
            ch_idx = 1
            for ch in vol["chapters"]:
                c_payload = {
                    "novel_id": novel_id,
                    "volume_id": vol_id,
                    "title": ch["title"][:255],
                    "content": ch["content"],
                    "order_index": ch_idx,
                    "status": "published"
                }
                c_res = None
                for attempt in range(3):
                    try:
                        c_res = requests.post(f"{url}/rest/v1/chapters", headers=HEADERS, json=c_payload, timeout=40)
                        break
                    except requests.RequestException as e:
                        print(f"   [!] Chapter insert network error (attempt {attempt + 1}/3): {e}")
                        time.sleep(2)
                        continue

                time.sleep(0.5) # Sleep to avoid 502 Bad Gateway from Cloudflare rate limits on Supabase
                if c_res is None:
                    print(f"   [!] Failed to insert {ch['title']} after retries")
                    ch_idx += 1
                    continue
                if c_res.status_code >= 300:
                    print(f"   [!] Failed to insert {ch['title']} (Size: {len(ch['content'])}): {c_res.reason} - {c_res.text}")
                else:
                    print(f"   [OK] Inserted {ch['title']}")
                ch_idx += 1
            vol_idx += 1

if __name__ == "__main__":
    process_novels()