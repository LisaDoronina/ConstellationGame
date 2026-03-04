from python_ml.src.model_service import ModelService

def test_connection():
    print("Testing connection...")

    try:
        service = ModelService()
        print("Connection successful")
        return service
    except Exception as e:
        print(f"Connection failed: {e}")
        return None

def test_prompt():
    print("Testing text prompt...")

    try:
        service = ModelService()
        prompt = service.create_prompt(
            cur_state="Cir",
            end_state="Dor",
            path="[Cir]",
            file_name="../resources/graph.txt"
        )
        print("Prompt created successfully")
        return prompt

    except Exception as e:
        print(f"Connection failed: {e}")
        return None

def test_model_answer():
    print("Testing model prompt...")
    try:
        service = ModelService()
        answer = service.get_answer(cur_state="Cir",
                                    end_state="Dor",
                                    path=['Cir', 'Aps', 'Mus', 'Hor', 'Ret'],
                                    available_moves=['Nor', 'Lup', 'Cen', 'TrA'],
                                    file_name="../resources/graph.txt"
                                    )
        return answer
    except Exception as e:
        print(f"Connection failed: {e}")
        return None



if __name__ == "__main__":
    test_answer = test_model_answer()
    print(test_answer)

