import os, requests
from dotenv import load_dotenv
load_dotenv('../.env')
url=os.environ.get('VITE_SUPABASE_URL')
key=os.environ.get('VITE_SUPABASE_ANON_KEY')
headers={'apikey': key, 'Authorization': f'Bearer {key}'}
n=requests.get(url+'/rest/v1/novels?select=id,title', headers=headers).json()
frank_id=next((x['id'] for x in n if 'Frankenstein' in x['title']), None)
chaps=requests.get(url+'/rest/v1/chapters?novel_id=eq.'+frank_id+'&select=id,title,volume_id,status,order_index', headers=headers).json()
print(chaps[0] if len(chaps) > 0 else 'No chapters')

