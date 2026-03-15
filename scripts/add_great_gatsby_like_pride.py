import os
import re
import math
import requests
from dotenv import load_dotenv


load_dotenv('../.env')

SUPABASE_URL = os.environ.get('VITE_SUPABASE_URL', '').rstrip('/')
SUPABASE_KEY = os.environ.get('VITE_SUPABASE_ANON_KEY', '')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise SystemExit('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')

HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
}

TARGET_TITLE = 'The Great Gatsby'
TARGET_AUTHOR = 'F. Scott Fitzgerald'


def normalize_whitespace(text: str) -> str:
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    text = re.sub(r'\t+', ' ', text)
    text = re.sub(r'[ ]{2,}', ' ', text)
    return text


def clean_gutenberg_text(text: str) -> str:
    start_markers = [
        '*** START OF THE PROJECT GUTENBERG EBOOK',
        '*** START OF THIS PROJECT GUTENBERG EBOOK',
    ]
    end_markers = [
        '*** END OF THE PROJECT GUTENBERG EBOOK',
        '*** END OF THIS PROJECT GUTENBERG EBOOK',
    ]

    start_idx = 0
    for marker in start_markers:
        idx = text.find(marker)
        if idx != -1:
            next_newline = text.find('\n', idx)
            start_idx = next_newline + 1 if next_newline != -1 else idx
            break

    end_idx = len(text)
    for marker in end_markers:
        idx = text.find(marker)
        if idx != -1:
            end_idx = idx
            break

    return text[start_idx:end_idx].strip()


def to_html_chapter(chapter_num: int, chapter_text: str) -> str:
    blocks = [b.strip() for b in re.split(r'\n\s*\n', chapter_text) if b.strip()]
    html_parts = [
        f'<h1 style="text-align: center;">Chapter {chapter_num}</h1>',
        '<p style="text-align: center;"></p>',
    ]
    for block in blocks:
        escaped = (
            block.replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('"', '&quot;')
        )
        html_parts.append(f'<p>{escaped}</p>')
    return ''.join(html_parts)


def split_into_chapters(clean_text: str) -> list[tuple[int, str]]:
    text = normalize_whitespace(clean_text)
    # Pattern A: explicit headings like "CHAPTER I" / "Chapter 1"
    pattern = re.compile(r'(?im)^\s*chapter\s+([ivxlcdm]+|\d+)[\.:]?\s*$', re.IGNORECASE)
    matches = list(pattern.finditer(text))

    # Pattern B fallback: standalone roman numeral headings (I..IX) used by some editions.
    if not matches:
        roman_pattern = re.compile(
            r'(?im)(?:^|\n)\s*(?:I|II|III|IV|V|VI|VII|VIII|IX)\s*(?:\n|$)'
        )
        matches = list(roman_pattern.finditer(text))

    if not matches:
        # Final fallback: single chapter
        plain = text.strip()
        return [(1, plain)] if plain else []

    chapters: list[tuple[int, str]] = []
    for i, m in enumerate(matches):
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end].strip()
        if not body:
            continue
        chapters.append((len(chapters) + 1, body))
    return chapters


def chunk_for_three_volumes(chapters: list[tuple[int, str]]) -> list[list[tuple[int, str]]]:
    if not chapters:
        return [[], [], []]
    target = int(math.ceil(len(chapters) / 3))
    return [
        chapters[0:target],
        chapters[target:target * 2],
        chapters[target * 2:],
    ]


def get_or_create_novel() -> str:
    query = (
        f"{SUPABASE_URL}/rest/v1/novels"
        f"?select=id,title,author_name"
        f"&title=eq.{requests.utils.quote(TARGET_TITLE)}"
    )
    res = requests.get(query, headers=HEADERS, timeout=30)
    res.raise_for_status()
    rows = res.json()

    if rows:
        return rows[0]['id']

    payload = {
        'author_id': '00000000-0000-0000-0000-000000000001',
        'author_name': TARGET_AUTHOR,
        'title': TARGET_TITLE,
        'synopsis': '',
        'genre_tags': ['Literary Fiction'],
        'language': 'English',
        'age_rating': 'all',
        'status': 'published',
        'is_unlisted': False,
    }
    create_res = requests.post(f'{SUPABASE_URL}/rest/v1/novels', headers=HEADERS, json=payload, timeout=30)
    create_res.raise_for_status()
    return create_res.json()[0]['id']


def fetch_gatsby_text() -> str:
    search_url = 'https://gutendex.com/books/?search=' + requests.utils.quote(TARGET_TITLE)
    r = requests.get(search_url, timeout=30)
    r.raise_for_status()
    data = r.json()

    if not data.get('results'):
        raise RuntimeError('No Gutendex results for The Great Gatsby')

    chosen = None
    for item in data['results']:
        title = (item.get('title') or '').lower()
        if 'great gatsby' in title:
            chosen = item
            break
    if chosen is None:
        chosen = data['results'][0]

    text_url = None
    for fmt, link in (chosen.get('formats') or {}).items():
        lf = fmt.lower()
        if 'text/plain' in lf and 'zip' not in lf:
            text_url = link
            break
    if not text_url:
        raise RuntimeError('No plain-text format available on Gutendex record')

    raw = requests.get(text_url, timeout=60, headers={'User-Agent': 'Mozilla/5.0'})
    raw.raise_for_status()
    return raw.text


def delete_existing_structure(novel_id: str) -> None:
    requests.delete(f'{SUPABASE_URL}/rest/v1/chapters?novel_id=eq.{novel_id}', headers=HEADERS, timeout=30).raise_for_status()
    requests.delete(f'{SUPABASE_URL}/rest/v1/volumes?novel_id=eq.{novel_id}', headers=HEADERS, timeout=30).raise_for_status()


def insert_structure(novel_id: str, volume_chunks: list[list[tuple[int, str]]]) -> int:
    total_words = 0
    volume_titles = ['Volume I', 'Volume II', 'Volume III']

    for v_idx, chapters in enumerate(volume_chunks):
        vol_payload = {
            'novel_id': novel_id,
            'title': volume_titles[v_idx],
            'order_index': v_idx,
        }
        v_res = requests.post(f'{SUPABASE_URL}/rest/v1/volumes', headers=HEADERS, json=vol_payload, timeout=30)
        v_res.raise_for_status()
        vol_id = v_res.json()[0]['id']

        for c_idx, (chapter_num, chapter_body) in enumerate(chapters, start=1):
            words = len(re.findall(r"\b[\w'-]+\b", chapter_body))
            total_words += words
            chapter_html = to_html_chapter(chapter_num, chapter_body)

            chap_payload = {
                'novel_id': novel_id,
                'volume_id': vol_id,
                'title': f'Chapter {c_idx}: Untitled',
                'content': chapter_html,
                'order_index': c_idx,
                'word_count': words,
                'status': 'draft',
            }
            c_res = requests.post(f'{SUPABASE_URL}/rest/v1/chapters', headers=HEADERS, json=chap_payload, timeout=40)
            c_res.raise_for_status()

    return total_words


def update_novel_stats(novel_id: str, total_words: int) -> None:
    payload = {
        'author_name': TARGET_AUTHOR,
        'title': TARGET_TITLE,
        'synopsis': '',
        'genre_tags': ['Literary Fiction'],
        'language': 'English',
        'age_rating': 'all',
        'status': 'published',
        'is_unlisted': False,
        'total_words': total_words,
    }
    res = requests.patch(f'{SUPABASE_URL}/rest/v1/novels?id=eq.{novel_id}', headers=HEADERS, json=payload, timeout=30)
    res.raise_for_status()


def main() -> None:
    print('Preparing The Great Gatsby in Pride-and-Prejudice style...')
    novel_id = get_or_create_novel()
    print(f'Using novel id: {novel_id}')

    raw = fetch_gatsby_text()
    clean = clean_gutenberg_text(raw)
    chapters = split_into_chapters(clean)
    if not chapters:
        raise RuntimeError('Failed to parse chapters from source text')

    chunks = chunk_for_three_volumes(chapters)

    delete_existing_structure(novel_id)
    total_words = insert_structure(novel_id, chunks)
    update_novel_stats(novel_id, total_words)

    print('Done.')
    print(f'Inserted chapters: {sum(len(x) for x in chunks)}')
    print(f'Total words: {total_words}')
    print(f'Volumes: {len(chunks)}')


if __name__ == '__main__':
    main()
