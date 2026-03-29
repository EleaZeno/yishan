import requests
import re
url = 'https://78c44a9d.yishan-96f.pages.dev'
resp = requests.get(url, timeout=10)
js_match = re.search(r'/assets/index-([A-Za-z0-9_-]+)\.js', resp.text)
print(f'JS: {js_match.group(0) if js_match else "NOT FOUND"}')
print(f'Has ThemeProvider: {"ThemeProvider" in resp.text}')
print(f'Has i18n: {"i18n" in resp.text}')