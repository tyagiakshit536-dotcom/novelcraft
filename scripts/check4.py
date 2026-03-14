import os, requests
from dotenv import load_dotenv
load_dotenv('../.env')
url=os.environ.get('VITE_SUPABASE_URL')
key=os.environ.get('VITE_SUPABASE_ANON_KEY')
headers={'apikey': key, 'Authorization': f'Bearer {key}'}
n=requests.get(url+'/rest/v1/novels?select=id,title', headers=headers).json()
t_id=next((x['id'] for x in n if 'Frankenstein' in x['title']), None)
ch=requests.get(url+'/rest/v1/chapters?novel_id=eq.'+t_id+'&select=id,title,content', headers=headers).json()
print(len(ch[0].get('content', '')) if len(ch)>0 else 'No chapters')
