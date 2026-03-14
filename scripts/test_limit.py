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

res = requests.get(url + '/rest/v1/chapters?select=id&limit=2000', headers=headers)
print("count:", len(res.json()))
