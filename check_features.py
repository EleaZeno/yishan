import requests
url = 'https://yishan-96f.pages.dev/assets/index-DOzLbN5X.js'
resp = requests.get(url, timeout=10)
print(f'Size: {len(resp.text)} bytes')
print(f'Has Onboarding: {"Onboarding" in resp.text}')
print(f'Has ListeningTestReal: {"ListeningTestReal" in resp.text}')
print(f'Has WritingTestReal: {"WritingTestReal" in resp.text}')
print(f'Has LearningSettings: {"LearningSettings" in resp.text}')
print(f'Has i18next: {"i18next" in resp.text}')
print(f'Has ThemeProvider: {"ThemeProvider" in resp.text}')
print(f'Has Sentry: {"Sentry" in resp.text}')