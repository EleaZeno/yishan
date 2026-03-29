import requests
url = 'https://yishan-96f.pages.dev/assets/index-CAiaqmU_.js'
resp = requests.get(url, timeout=10)
print(f'Size: {len(resp.text)} bytes')
print(f'Onboarding: {"Onboarding" in resp.text}')
print(f'LearningSettings: {"LearningSettings" in resp.text}')
print(f'i18next: {"i18next" in resp.text}')
print(f'ThemeProvider: {"ThemeProvider" in resp.text}')
print(f'useTranslation: {"useTranslation" in resp.text}')