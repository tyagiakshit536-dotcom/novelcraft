import os
import requests
from dotenv import load_dotenv

load_dotenv('../.env')
url = os.environ.get('VITE_SUPABASE_URL')
key = os.environ.get('VITE_SUPABASE_ANON_KEY')
headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
    'Content-Type': 'application/json'
}

res = requests.get(url + '/rest/v1/novels?select=id,title', headers=headers)
novels = res.json()
print(f"Total novels: {len(novels)}")
for target in novels[:5]:
    print(target['title'])
    vols = requests.get(f"{url}/rest/v1/volumes?novel_id=eq.{target['id']}", headers=headers).json()
    print("Vols:", len(vols))
    for v in vols:
        chaps = requests.get(f"{url}/rest/v1/chapters?volume_id=eq.{v['id']}&select=id", headers=headers).json()
        print(f" - Vol {v.get('order_index')} ({v.get('title')}) has {len(chaps)} chaps")
