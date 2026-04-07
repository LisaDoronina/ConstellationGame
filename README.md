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

- to run c++ service: ?

- to run java service:
```mvn spring-boot:run```


- to run database:
```docker compose down -v```
```docker compose up -d```
if u have some troubles just delete all the stuff:
```docker exec -i my_project_db psql -U myuser -d mydatabase -c "TRUNCATE games CASCADE; TRUNCATE users CASCADE;"```
add test data:
```docker exec -i my_project_db psql -U myuser -d mydatabase < db/test_data.sql```

