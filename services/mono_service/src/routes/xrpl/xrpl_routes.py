from fastapi import APIRouter, HTTPException
from ...domain.xrpl_models import XrplLogEvent
from ...services.xrpl.xrpl_service import xrpl_service

router = APIRouter()

@router.post("/log")
async def log_xrpl_event(event: XrplLogEvent):
    """
    Log an XRPL event or response from the XRPL management service.
    """
    try:
        doc_id = await xrpl_service.log_event(event)
        return {"success": True, "doc_id": doc_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
