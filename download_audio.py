import urllib.request
import urllib.parse
import json
import os

def get_url(query):
    # Search for files
    q = urllib.parse.quote(query)
    url = f'https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=File:{q}%20type:audio&utf8=&format=json'
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
    except Exception as e:
        print(f"Error searching for {query}: {e}")
        return None

    if not res.get('query', {}).get('search'):
        return None
        
    title = res['query']['search'][0]['title']
    title_encoded = urllib.parse.quote(title)
    
    # Get direct URL
    url2 = f'https://commons.wikimedia.org/w/api.php?action=query&titles={title_encoded}&prop=imageinfo&iiprop=url&format=json'
    req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req2) as response:
            res2 = json.loads(response.read().decode())
            pages = res2['query']['pages']
            for p in pages:
                return pages[p]['imageinfo'][0]['url']
    except Exception as e:
        print(f"Error getting URL for {title}: {e}")
    return None

os.makedirs('public/audio', exist_ok=True)

queries = {
    'ambient': 'Dark Ambient Background',
    'attack': 'Sword slash',
    'death': 'Monster death',
    'heal': 'Magic chime',
    'place': 'Card place',
    'victory': 'Victory fanfare',
    'defeat': 'Evil laugh'
}

for name, q in queries.items():
    print(f"Searching for {name} ({q})...")
    u = get_url(q)
    print(f'{name}: {u}')
    if u:
        ext = u.split('.')[-1]
        filepath = f'public/audio/{name}.{ext}'
        print(f"Downloading to {filepath}...")
        try:
            req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
                out_file.write(response.read())
            print("Done.")
        except Exception as e:
            print(f"Failed to download {u}: {e}")
