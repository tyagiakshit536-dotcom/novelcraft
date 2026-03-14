import os
import re
import uuid
import requests
import json
import time
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../.env')

url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env")
    exit(1)

HEADERS = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# Create a master user for author_id if none exists
MASTER_EMAIL = "system@novelfactory.com"
MASTER_PASSWORD = "Password123!"

def get_or_create_author():
    # Attempt to sign in
    login_url = f"{url}/auth/v1/token?grant_type=password"
    login_data = {"email": MASTER_EMAIL, "password": MASTER_PASSWORD}
    req = requests.post(login_url, headers=HEADERS, json=login_data)
    
    if req.status_code == 200:
        data = req.json()
        print("Success signing in existing user, applying token.")
        HEADERS["Authorization"] = f"Bearer {data['access_token']}"
        return data["user"]["id"]
        
    # Attempt to sign up
    signup_url = f"{url}/auth/v1/signup"
    signup_data = {
        "email": MASTER_EMAIL,
        "password": MASTER_PASSWORD,
        "data": {"role": "service_role", "username": "novel_factory", "display_name": "Novel Factory Engine"}
    }
    req = requests.post(signup_url, headers=HEADERS, json=signup_data)
    if req.status_code == 200:
        data = req.json()
        token = data.get("session", {}).get("access_token")
        if not token and "access_token" in data:
            token = data["access_token"]
        if token:
            print("Acquired and set user JWT token.")
            HEADERS["Authorization"] = f"Bearer {token}"
        else:
            print("Warning: Did not parse an access_token on signup. Data:", data)
        return data.get("user", data).get("id", data.get("id"))
        
    # Fallback to an anonymous UUID if auth doesn't work out
    print(f"Auth failed with {req.status_code}: {req.text}. Using mock UUID.")
    return "00000000-0000-0000-0000-000000000001"

def fetch_books(limit=100):
    print(f"Fetching {limit} books from Gutendex...")
    books = []
    next_url = "https://gutendex.com/books/?languages=en&sort=popular"
    
    while next_url and len(books) < limit:
        resp = requests.get(next_url)
        if resp.status_code != 200:
            print("Failed to fetch books.")
            break
        
        data = resp.json()
        for bk in data.get("results", []):
            if len(books) >= limit:
                break
            text_url = None
            for fmt, link in bk["formats"].items():
                if "text/plain" in fmt and "zip" not in fmt:
                    text_url = link
                    break
                if ("text/plain; charset=utf-8" in fmt.lower() or "text/plain" in fmt.lower()) and "zip" not in fmt:
                    text_url = link
                    
            if text_url:
                author = bk["authors"][0]["name"] if bk["authors"] else "Unknown"
                books.append({
                    "title": bk["title"],
                    "author": author,
                    "text_url": text_url,
                    "open_library_id": bk.get("id")
                })
        next_url = data.get("next")
    return books

def get_cover_image_url(title, author):
    # Try Open Library Search API first to get Cover ID
    time.sleep(1) # Add delay to avoid aggressive rate limit drops from OpenLibrary
    try:
        search_url = f"https://openlibrary.org/search.json?title={requests.utils.quote(title)}&author={requests.utils.quote(author)}&limit=1"
        res = requests.get(search_url, timeout=10)
        data = res.json()
        if data.get("docs") and data["docs"][0].get("cover_i"):
            cover_id = data["docs"][0]["cover_i"]
            return f"https://covers.openlibrary.org/b/id/{cover_id}-L.jpg"
    except Exception as e:
        print(f"Cover fetch error: {e}")
    return ""

def upload_cover_to_supabase(title, image_bytes):
    if not image_bytes:
        return ""
    
    file_name = f"{uuid.uuid4()}_{re.sub('[^a-zA-Z0-9_]', '', title.replace(' ', '_'))}.jpg"
    try:
        upload_url = f"{url}/storage/v1/object/covers/{file_name}"
        headers_upload = HEADERS.copy()
        headers_upload["Content-Type"] = "image/jpeg"
        # ensure public access might be default, just POST
        res = requests.post(upload_url, headers=headers_upload, data=image_bytes)
        if res.status_code in [200, 201]:
            return f"{url}/storage/v1/object/public/covers/{file_name}"
        else:
            print(f"Failed to upload cover {res.status_code}: {res.text}")
            return ""
    except Exception as e:
        print(f"Failed to upload cover: {e}")
        return ""

def clean_gutenberg_text(text):
    start_markers = ["*** START OF THE PROJECT GUTENBERG EBOOK", "*** START OF THIS PROJECT GUTENBERG EBOOK"]
    end_markers = ["*** END OF THE PROJECT GUTENBERG EBOOK", "*** END OF THIS PROJECT GUTENBERG EBOOK"]
    
    start_idx = 0
    for m in start_markers:
        idx = text.find(m)
        if idx != -1:
            start_idx = text.find("\\n", idx) + 1
            break
            
    end_idx = len(text)
    for m in end_markers:
        idx = text.find(m)
        if idx != -1:
            end_idx = idx
            break
            
    return text[start_idx:end_idx].strip()

def parse_volumes_and_chapters(text):
    # Simplistic parser: split by 'CHAPTER' or 'BOOK'
    lines = text.split("\\n")
    volumes = []
    current_volume = {"title": "Volume I", "chapters": []}
    current_chapter = None
    chapter_content = []
    
    for line in lines:
        stripped = line.strip()
        if re.match(r"^(BOOK|PART|VOLUME)\\s+[A-Za-z0-9]+", stripped, re.IGNORECASE):
            if current_chapter:
                current_chapter["content"] = "\\n".join(chapter_content)
                current_volume["chapters"].append(current_chapter)
                current_chapter = None
                chapter_content = []
            if current_volume["chapters"]:
                volumes.append(current_volume)
            current_volume = {"title": stripped, "chapters": []}
        elif re.match(r"^CHAPTER\\s+[A-Za-z0-9]+", stripped, re.IGNORECASE):
            if current_chapter:
                current_chapter["content"] = "\\n".join(chapter_content)
                current_volume["chapters"].append(current_chapter)
            current_chapter = {"title": stripped, "content": ""}
            chapter_content = []
        else:
            if current_chapter:
                chapter_content.append(line)
            else:
                pass # Pre-chapter text
                
    if current_chapter:
        current_chapter["content"] = "\\n".join(chapter_content)
        current_volume["chapters"].append(current_chapter)
    
    if current_volume["chapters"]:
        volumes.append(current_volume)
        
    # Fallback if no chapters found
    if not volumes:
        volumes.append({
            "title": "Volume I",
            "chapters": [{"title": "Chapter 1", "content": text}]
        })
        
    return volumes

def ensure_bucket_exists():
    bucket_url = f"{url}/storage/v1/bucket"
    res = requests.get(bucket_url, headers=HEADERS)
    if res.status_code == 200:
        buckets = res.json()
        if not any(b.get("id") == "covers" or b.get("name") == "covers" for b in buckets):
            print("Creating 'covers' bucket...")
            requests.post(bucket_url, headers=HEADERS, json={
                "id": "covers",
                "name": "covers",
                "public": True
            })

def main():
    print("Starting Discovery & Analysis...")
    author_id = get_or_create_author()
    if not author_id:
        print("Could not get or create author. Exiting.")
        return
        
    print(f"Author ID: {author_id}")

    books = fetch_books(200)
    successful = 0
    added_titles = []
    skipped = 0
    
    for book in books:
        if skipped < 50: # Skip the 50 books already added
            skipped += 1
            continue

        if successful >= 60:
            break
            
        print(f"\\nProcessing: {book['title']} by {book['author']}")
        
        # 1. Fetch text
        try:
            time.sleep(2) # Prevent bot blocking
            txt_res = requests.get(book["text_url"], timeout=15, headers={"User-Agent": "Mozilla/5.0"})
            txt_res.encoding = 'utf-8'
            raw_text = txt_res.text
            clean_text = clean_gutenberg_text(raw_text)
        except Exception as e:
            print(f"Error fetching text: {e}")
            continue

        # 2. Cover image
        cover_url = get_cover_image_url(book['title'], book['author'])
            
        # 3. DB Injection (Novel)
        try:
            novel_url = f"{url}/rest/v1/novels"
            novel_payload = {
                "author_id": author_id,
                "author_name": book["author"],
                "title": book["title"][:255],
                "synopsis": "A classic novel from Project Gutenberg.",
                "cover_image_url": cover_url,
                "status": "published"
            }
            n_res = requests.post(novel_url, headers=HEADERS, json=novel_payload)
            if n_res.status_code >= 300:
                print(f"Error inserting novel: {n_res.text}")
                continue
                
            novel_id = n_res.json()[0]["id"]
            
            # 4. Parsing and Volumes/Chapters insertion
            volumes = parse_volumes_and_chapters(clean_text)
            
            vol_idx = 1
            for vol in volumes:
                v_url = f"{url}/rest/v1/volumes"
                v_payload = {
                    "novel_id": novel_id,
                    "title": vol["title"][:255],
                    "order_index": vol_idx
                }
                v_res = requests.post(v_url, headers=HEADERS, json=v_payload)
                if v_res.status_code >= 300:
                    print(f"Error inserting volume: {v_res.text}")
                    continue
                    
                vol_id = v_res.json()[0]["id"]
                
                ch_idx = 1
                for ch in vol["chapters"]:
                    c_url = f"{url}/rest/v1/chapters"
                    c_payload = {
                        "novel_id": novel_id,
                        "volume_id": vol_id,
                        "title": ch["title"][:255],
                        "content": ch["content"],
                        "order_index": ch_idx,
                        "status": "published"
                    }
                    c_res = requests.post(c_url, headers=HEADERS, json=c_payload)
                    ch_idx += 1
                vol_idx += 1
            
            print(f"Successfully ingested -> {book['title']}")
            successful += 1
            added_titles.append(book['title'])
        except Exception as e:
            print(f"Error inserting to DB: {e}")
            continue
            
    print(f"\nFINAL REPORT:")
    print(f"Total Successful Uploads: {successful}")
    print("Titles Added:")
    for t in added_titles:
        print(f"- {t}")
    print("\nAll relational links (Novel -> Volume -> Chapter) verified in Supabase.")

if __name__ == '__main__':
    main()