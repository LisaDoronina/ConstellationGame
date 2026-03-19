import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from starlette.responses import JSONResponse

from python_ml.src.model_service import ModelService

app = FastAPI(title="ConstellationGame API", description="API for getting model's moves")

class MoveRequest(BaseModel):
    cur_state: str
    end_state: str
    path: list
    available_moves: list

model_service = ModelService()

@app.post("/get_answer")
def get_answer(request: MoveRequest):

    try:
        answer = model_service.get_answer(
            cur_state=request.cur_state,
            end_state=request.end_state,
            path=request.path,
            available_moves=request.available_moves
        )
        print(answer)
        return {"answer": answer}

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

if __name__ == "__main__":
    print("LISTENING ON http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)