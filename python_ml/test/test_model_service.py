from python_ml.src.model_service import ModelService
from python_ml.src.main import MoveRequest as MoveRequest
import python_ml.src.config as cfg

class TestModelService:

    def __init__(self, requests: list, model_name: str = cfg.MODEL_NAME):
        self.requests = requests
        self.model_name = model_name
        self.service = None

    def run_all_tests(self):
        print(f"RUNNING TESTS\nusing model {self.model_name}\n")

        self.test_connection()

        assert self.service is not None, "CONNECTION FAILED :("

        self.test_model_answer()

    def test_connection(self):
        print("* TESTING CONNECTION")

        try:
            self.service = ModelService(model_name=cfg.MODEL_NAME)
            print("SUCCESS\n")

        except Exception as e:
            self.service = None
            print(f"CONNECTION FAILED: {e}\n")

    def test_model_answer(self):
        print("* TESTING MODEL ANSWERS")
        test_num = 1
        for request in self.requests:

            print("-" * 20, f"\nTEST {test_num}\n\ncur: {request.cur_state}\nto: {request.end_state}\npath: {request.path}\navailable_moves: {request.available_moves}")

            answer = self.service.get_answer(
                cur_state=request.cur_state,
                end_state=request.end_state,
                path=request.path,
                available_moves=request.available_moves
            )

            assert answer in request.available_moves, f"\nINVALID ANSWER:\n ANSWER: {answer}, AVAILABLE_MOVES: {request.available_moves}"
            print(f"answer: {answer} <- GOOD\n")
            test_num += 1

        print("-" * 20, f"\nALL TESTS PASSED SUCCESSFULLY\n")



if __name__ == "__main__":

    requests = [
        MoveRequest(
            cur_state="Cir",
            end_state="Dor",
            path=['Cir', 'Aps', 'Mus', 'Hor', 'Ret'],
            available_moves=['Nor', 'Lup', 'Cen', 'TrA']
        ),
        MoveRequest(
            cur_state="Dor",
            end_state="Cir",
            path=['Dor', 'Aps', 'Mus', 'Hor', 'Ret'],
            available_moves=['Pic', 'Cae', 'Hyi', 'Men', 'Vol']
        ),
        MoveRequest(
            cur_state="Hyi",
            end_state="Men",
            path=['Hyi'],
            available_moves=['Men', 'Dor', 'Ret', 'Hor', 'Eri', 'Phe', 'Tuc', 'Oct']
        ),
        MoveRequest(
            cur_state="Phe",
            end_state="PsA",
            path=['Phe', 'Tuc', 'For'],
            available_moves=['Eri', 'Scl', 'Gru', 'Tuc']
        ),
        MoveRequest(
            cur_state="Lyr",
            end_state="Boo",
            path=['Lyr', 'Cyg', 'Her', 'Boo', 'UMa', 'Cam', 'UMi'],
            available_moves=['Cyg', 'Vul']
        )
    ]
    test_model_service = TestModelService(requests=requests, model_name=cfg.MODEL_NAME)
    test_model_service.run_all_tests()