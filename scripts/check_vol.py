import os, requests
from dotenv import load_dotenv
load_dotenv('../.env')
url=os.environ.get('VITE_SUPABASE_URL')
key=os.environ.get('VITE_SUPABASE_ANON_KEY')
headers={'apikey': key, 'Authorization': f'Bearer {key}'}
n=requests.get(url+'/rest/v1/novels?select=id,title', headers=headers).json()
frank_id=next((x['id'] for x in n if 'Frankenstein' in x['title']), None)
vols=requests.get(url+'/rest/v1/volumes?novel_id=eq.'+frank_id, headers=headers).json()
print(vols)

