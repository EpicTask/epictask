from fastapi import APIRouter, Depends, HTTPException, Request
from ...config.internal_auth import verify_internal_caller
from ...domain.xrpl_models import XrplLogEvent
from ...services.xrpl.xrpl_service import xrpl_service

router = APIRouter()


@router.post("/log")
async def log_xrpl_event(
    event: XrplLogEvent,
    request: Request,
    _: None = Depends(verify_internal_caller),
):
    """
    Log an XRPL event or response from the XRPL management service.

    Called only by xrpl_management. This was previously unauthenticated, which
    made it an open write endpoint on a service that also moves money.
    """
    try:
        doc_id = await xrpl_service.log_event(event)
        return {"success": True, "doc_id": doc_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
