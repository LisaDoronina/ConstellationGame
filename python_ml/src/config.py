import os

from dotenv import load_dotenv

load_dotenv()

MODEL_NAME = "gpt-4o-mini"
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
TIMEOUT = 60
TEMPERATURE = 0.7