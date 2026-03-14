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

def delete_duplicates():
    print('Fetching novels...')
    res = requests.get(url + '/rest/v1/novels?select=id,title', headers=headers)
    novels = res.json()
    
    seen_titles = set()
    duplicates = []
    
    for novel in novels:
        title = novel['title'].strip()
        if title in seen_titles:
            duplicates.append(novel['id'])
        else:
            seen_titles.add(title)
            
    print(f'Found {len(duplicates)} duplicate novels out of {len(novels)} total novels.')
    
    for i, dup_id in enumerate(duplicates):
        print(f'Deleting duplicate {i+1}/{len(duplicates)}: {dup_id}...')
        del_res = requests.delete(f'{url}/rest/v1/novels?id=eq.{dup_id}', headers=headers)

if __name__ == '__main__':
    delete_duplicates()
