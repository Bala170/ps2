import base64
import os
from google import genai
from IPython.display import Image, display

client = genai.Client(
    api_key=os.environ.get("GEMINI_API_KEY"),
)

generation_config = {
    'temperature': 1,
    'max_output_tokens': 65536,
    'top_p': 0.95,
    'thinking_level': 'minimal',
    'image_config': {
        'image_size': '1K',
    },
}

interaction = client.interactions.create(
    model='models/gemini-3.1-flash-lite-image',
    input='',
    generation_config=generation_config,
    response_modalities=['image', 'text'],
)

for step in interaction.steps:
    if step.type == 'model_output' and step.content:
        for part in step.content:
            if part.type == 'text':
                print(part.text)
            elif part.type == 'image':
                display(Image(data=base64.b64decode(part.data)))


