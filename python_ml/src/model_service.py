import requests
import json
import python_ml.resources.raw_graph as raw_graph

class ModelService:
    def __init__(self, model_name="deepseek-v3.1:671b-cloud", url="http://localhost:11434"):
        self.model_name = model_name
        self.url = url
        self.api_url = f"{url}/api/generate"
        self.connection_test()

    def connection_test(self):
        try:
            response = requests.get(f"{self.url}/api/tags")
            if response.status_code == 200:
                print("Ollama connected")

        except requests.exceptions.ConnectionError:
            print("Connection error")

    def get_neighbors(self, states):
        neighbors = dict()
        for state in states:
            neighbors[state] = [raw_graph.db[state]]

        return neighbors


    def create_prompt(self, cur_state, end_state, path, available_moves, file_name = None):

        available_neighbors = self.get_neighbors(available_moves)
        neighbors = ""

        for neighbor in available_neighbors:
            neighbors += f"{neighbor} -> {available_moves[neighbor]}\n"

        prompt = f"""You are playing a game on a constellation graph.

    GAME RULES:
    1. Your goal is to WIN (reach the target constellation {end_state})
    2. If you move to {end_state} - you win immediately
    3. If the opponent moves to {end_state} - they win immediately
    4. If you have no valid moves - you lose
    5. You CANNOT move to constellations in the PATH list
    6. You can only move to DIRECTLY CONNECTED constellations (see graph)

    CURRENT SITUATION:
    • Target constellation: {end_state}
    • Forbidden constellations: {path}
    • Available moves: {available_moves}

    YOUR DECISION PRIORITIES (in order):

    PRIORITY 1 - WIN IMMEDIATELY:
    - Check if {end_state} is directly in available moves
    - If YES: Move to {end_state} and win

    PRIORITY 2 - BLOCK OPPONENT'S WIN:
    - If you cannot win immediately, analyze each possible move
    - For each candidate constellation C (connected to {cur_state} and not in PATH):
      * Check if {end_state} is in C's neighbors
      * If {end_state} is in C's neighbors → DANGER (opponent can win next turn)
      * If {end_state} is NOT in C's neighbors → SAFE
    - Choose a SAFE constellation if available

    PRIORITY 3 - CONTROL & STRATEGY:
    - If ALL safe moves are equivalent, consider:
      * Choose constellation with FEWEST escape routes for opponent
      * Choose constellation that leads toward {end_state} indirectly
      * Choose constellation that limits opponent's future options

    AVAILABLE NEIGBORS:
    {neighbors}
    
    ANSWER IN ONLY ONE WORD"""

        return "\n".join(prompt)

    def send_request(self, prompt):

        try:
            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": 500
                }
            }

            response = requests.post(self.api_url, json=payload, timeout=60)
            response.raise_for_status()

            raw_response = response.json()
            print("Raw response received.")
            return raw_response
        except Exception as e:
            print(e)
            return None


    def parse_response(self, raw_response):
        if raw_response is None:
            return "No response received"
        if "response" in raw_response:
            response = raw_response["response"].strip()
            if "*" in response:
                response = response.replace("*", "")
            return response
        else:
            return "No response received"


    def get_answer(self, cur_state, end_state, path, available_moves, file_name = None):
        print("Getting model answer...")
        prompt = self.create_prompt(cur_state, end_state, path, available_moves, file_name)
        raw_response = self.send_request(prompt)
        response = self.parse_response(raw_response)
        return response