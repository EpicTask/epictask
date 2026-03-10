from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class XrplLogEvent(BaseModel):
    response: Dict[str, Any]
    function: str
    task_id: Optional[str] = None
