from fastapi import APIRouter, Depends, HTTPException
from ...domain.task_models import TaskCreated
from ...services.contracts.contract_service import contract_service
from ...config.security import get_current_user, get_user_id

router = APIRouter()

@router.post("/generate")
async def generate_contract_endpoint(
    task_data: TaskCreated,
    user_id: str = Depends(get_user_id)
):
    """
    Generate a contract for a task.
    """
    try:
        contract_text = await contract_service.generate_contract(task_data, user_id)
        return {"contract": contract_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
