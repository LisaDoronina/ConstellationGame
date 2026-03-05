from fastapi import FastAPI
from pydantic import BaseModel
from model_service import ModelService

app = FastAPI()

class MoveRequest(BaseModel):
    cur_state: str
    end_state: str
    path: list
    available_moves: list

model_service = ModelService()

@app.post("/get_answer")
def get_answer(request: MoveRequest):

    answer = model_service.get_answer(
        cur_state=request.cur_state,
        end_state=request.end_state,
        path=request.path,
        available_moves=request.available_moves
    )

    return {"answer": answer}

@app.get("/test_answer")
async def test_answer():
    answer = model_service.get_answer(
        cur_state="Cir",
        end_state="Dor",
        path=['Cir', 'Aps', 'Mus', 'Hor', 'Ret'],
        available_moves=['Nor', 'Lup', 'Cen', 'TrA']
    )
    return {"answer": answer}