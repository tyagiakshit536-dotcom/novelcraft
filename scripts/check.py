import os, requests
from dotenv import load_dotenv
load_dotenv('../.env')
url=os.environ.get('VITE_SUPABASE_URL')
key=os.environ.get('VITE_SUPABASE_ANON_KEY')
headers={'apikey': key, 'Authorization': f'Bearer {key}'}
n=requests.get(url+'/rest/v1/novels?select=id,title&limit=2', headers=headers).json()
print(n)
print(len(requests.get(url+'/rest/v1/chapters?novel_id=eq.'+n[0]['id']+'&select=id', headers=headers).json()))
