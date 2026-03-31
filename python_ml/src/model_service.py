import requests
import python_ml.resources.graph as graph
import python_ml.src.config as cfg

class ModelService:
    def __init__(self, model_name=cfg.MODEL_NAME, url=cfg.MODEL_URL):
        self.model_name = model_name
        self.url = url
        self.api_url = f"{url}/api/generate"

    @staticmethod
    def get_neighbors(states):

        neighbors = dict()

        for state_name in states:
            state = graph.database[state_name]
            neighbors[state_name] = state

        return neighbors

    def create_prompt(self, cur_state, end_state, path, available_moves):

        available_neighbors = self.get_neighbors(available_moves)
        neighbors = ""

        for neighbor in available_neighbors:
            neighbors += f"{neighbor} -> {available_neighbors[neighbor]}\n"

        prompt = f"""RULES:
    1. Ur goal is to WIN
    2. If u move to {end_state} - you WIN 
    3. If ur opponent has no valid moves - they LOSE
    4. U CANNOT move to *** in {path}
    5. U can only move to DIRECTLY CONNECTED *** in {available_moves}

    DECISION PRIORITIES

    1 - WIN:
    - Check if {end_state} is in {available_moves}. If YES: MOVE TO

    2 - BLOCK OPPONENT'S WIN:
    - If u cannot win immediately, analyze possible moves
    - For each candidate *** (connected to {cur_state} and not in {path}):
      * If {end_state} is in ***'s neighbors → AVOID
    - Choose a SAFE *** if available, else: random ***
    
    3 - CHECK FUTURE 
    - if you go to ***, player goes to $$$ from *** and u have NO MOVES from $$$ - AVOID ***
    
    AVAILABLE MOVES: {available_moves} \n
    {neighbors}
    
    ANSWER IN ONE WORD"""

        return prompt

    def send_request(self, prompt):

        try:
            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": cfg.TEMPERATURE,
                    "num_predict": 500
                }
            }

            response = requests.post(self.api_url, json=payload, timeout=cfg.TIMEOUT)
            response.raise_for_status()

            raw_response = response.json()
            return raw_response
        except Exception as e:
            print("[Model Service] ERROR BY SENDING REQUEST: ", e)
            return None

    @staticmethod
    def parse_response(raw_response):

        if raw_response is None or "response" not in raw_response:
            print("[Model Service] NO RESPONSE")
            return "No response received"

        response = raw_response["response"].strip()
        if "*" in response:
            response = response.replace("*", "")

        print("[Model Service] model's response:", response)
        return response

    def get_answer(self, cur_state, end_state, path, available_moves):
        prompt = self.create_prompt(cur_state, end_state, path, available_moves)
        raw_response = self.send_request(prompt)
        response = self.parse_response(raw_response)
        return response

