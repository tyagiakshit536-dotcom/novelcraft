import os, requests
from dotenv import load_dotenv
load_dotenv('../.env')
url=os.environ.get('VITE_SUPABASE_URL')
key=os.environ.get('VITE_SUPABASE_ANON_KEY')
headers={'apikey': key, 'Authorization': f'Bearer {key}'}
n=requests.get(f'{url}/rest/v1/novels?select=id,title', headers=headers).json()
t=['Frankenstein', 'Wuthering Heights', 'Moby Dick', 'Pride and Prejudice', 'Shakespeare', 'Wonderland', 'Jekyll', 'Bram Stoker', 'Little Women', 'Great Gatsby']
for x in t:
  m=next((a for a in n if x.lower() in a['title'].lower()), None)
  if m:
    v=requests.get(f'{url}/rest/v1/volumes?novel_id=eq.{m["id"]}', headers=headers).json()
    c=requests.get(f'{url}/rest/v1/chapters?novel_id=eq.{m["id"]}', headers=headers).json()
    print(f'{m["title"][:43]:<45} | {len(v):<4} | {len(c):<5}')
