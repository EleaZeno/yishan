import requests
url = 'https://yishan-96f.pages.dev/assets/index-UdPEKq7k.js'
resp = requests.get(url, timeout=10)
print(f'Status: {resp.status_code}')
print(f'Size: {len(resp.text)} bytes')
print(f'Has i18next: {"i18next" in resp.text}')
print(f'Has ThemeProvider: {"ThemeProvider" in resp.text}')
print(f'Has useTranslation: {"useTranslation" in resp.text}')
print(f'Has setTheme: {"setTheme" in resp.text}')