import requests, json, os, base64

API_KEY = os.environ.get('ABACUSAI_API_KEY')
url = "https://routellm.abacus.ai/v1/chat/completions"

prompt = "A stunning artistic photograph of a professional pole dancer in an extraordinary aerial pose. She is inverted on a chrome pole, body arched perfectly, one leg extended in a flawless split, arms gracefully extended. Dramatic golden spotlight against pure black darkness. Cinematic editorial fashion photography. Deep blacks, rich gold tones, powerful and ethereal. Sophisticated nightclub aesthetic."

payload = {
    "model": "flux_pro_ultra",
    "modalities": ["image"],
    "messages": [{"role": "user", "content": prompt}]
}

resp = requests.post(url, headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}, json=payload, timeout=90)
print("Status:", resp.status_code)

if resp.status_code == 200:
    data = resp.json()
    choices = data.get('choices', [])
    if choices:
        content = choices[0]['message']['content']
        if isinstance(content, list):
            for item in content:
                if isinstance(item, dict):
                    img = item.get('image_url', {}).get('url', '')
                    if img.startswith('data:image'):
                        b64 = img.split(',')[1]
                        with open('/home/ubuntu/wlp/projects/featured-entertainer/dancer.jpg', 'wb') as f:
                            f.write(base64.b64decode(b64))
                        print("Saved dancer.jpg")
                        break
        elif isinstance(content, str):
            print("Full response:", json.dumps(data)[:1000])
else:
    print("Error:", resp.text[:500])
