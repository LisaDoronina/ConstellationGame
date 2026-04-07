# ConstellationGame

**Ollama & Model setup:** 

- install python dependencies ```pip install -r requirements.txt``` 

- install ollama on https://ollama.ai

- start Ollama service ```ollama serve```

- pull the model ```ollama pull gemma3:12b```

- to run tests ```python python_ml/test/test_model_service.py```

- to run the server ```python python_ml/src/main.py``` or ```python -m python_ml.src.main```

- to run front:
```cd js_frontend\src```
```npm install```
```npm run dev```
