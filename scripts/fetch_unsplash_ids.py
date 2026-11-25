import urllib.request, re, json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

def get_unsplash_photos(query):
    url = f"https://unsplash.com/s/photos/{query}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            matches = re.findall(r'https://images\.unsplash\.com/photo-([0-9a-fA-F-]+)\?', html)
            # unique ordered
            seen = set()
            res = []
            for m in matches:
                if m not in seen and len(m) > 10:
                    seen.add(m)
                    res.append(f"https://images.unsplash.com/photo-{m}?w=600&auto=format&fit=crop&q=80")
            return res
    except Exception as e:
        print(f"Error for {query}: {e}")
        return []

animals = ['hippopotamus', 'kangaroo', 'cheetah', 'water-buffalo']
results = {}
for a in animals:
    urls = get_unsplash_photos(a)
    print(f"=== {a} (found {len(urls)}) ===")
    for u in urls[:5]:
        print(" ", u)
    results[a] = urls

with open('scripts/unsplash_animal_candidates.json', 'w') as f:
    json.dump(results, f, indent=2)
