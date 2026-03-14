import os, requests
from dotenv import load_dotenv
load_dotenv('../.env')
url=os.environ.get('VITE_SUPABASE_URL')
key=os.environ.get('VITE_SUPABASE_ANON_KEY')
headers={'apikey': key, 'Authorization': f'Bearer {key}'}
c=requests.get(url+'/rest/v1/chapters?select=id,title', headers=headers).json()
print(f'Total chapters in db: {len(c)}')
print(c[:5])
