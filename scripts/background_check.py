import os
import requests
from dotenv import load_dotenv

load_dotenv('../.env')
url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY")

HEADERS = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

TITLES_TO_PATCH = [
    "Frankenstein", "Wuthering Heights", "Moby Dick", "Pride and Prejudice",
    "Romeo and Juliet", "The Complete Works of William Shakespeare", "A Room with a View",
    "Alice's Adventures in Wonderland", "The strange case of Dr. Jekyll and Mr. Hyde", "Middlemarch", 
    "Little Women", "The Great Gatsby", "Jane Eyre", "The Blue Castle", 
    "Crime and Punishment", "The Enchanted April", "The Picture of Dorian Gray", 
    "Twenty years after", "My Life", "Cranford"
]

res = requests.get(f"{url}/rest/v1/novels?select=id,title", headers=HEADERS)
novels = res.json()

print(f"{'Novel':<45} | {'Volumes':<7} | {'Chapters':<8}")
print("-" * 65)

for target in TITLES_TO_PATCH:
    match = next((n for n in novels if target.lower() in n['title'].lower()), None)
    if not match:
        print(f"{target[:43]:<45} | Not Found")
        continue

    vols = requests.get(f"{url}/rest/v1/volumes?novel_id=eq.{match['id']}&select=id", headers=HEADERS).json()
    chaps = requests.get(f"{url}/rest/v1/chapters?novel_id=eq.{match['id']}&select=id", headers=HEADERS).json()
    
    print(f"{match['title'][:43]:<45} | {str(len(vols)):<7} | {str(len(chaps)):<8}")