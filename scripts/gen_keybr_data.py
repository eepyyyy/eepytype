import base64
import os

os.makedirs('D:/eepytype/frontend/src/ts/utils/keybr', exist_ok=True)
data = open('D:/eepytype/keybr.com/packages/keybr-phonetic-model/assets/model-en.data', 'rb').read()
b64 = base64.b64encode(data).decode('ascii')
with open('D:/eepytype/frontend/src/ts/utils/keybr/model-data.ts', 'w', encoding='utf-8') as f:
    f.write(f'export const MODEL_EN_BASE64 = "{b64}";\n')
print('Successfully generated model-data.ts')
