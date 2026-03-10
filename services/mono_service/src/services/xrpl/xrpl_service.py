from ...domain.xrpl_models import XrplLogEvent
from ...storage.xrpl_db import write_xrpl_event_to_firestore

class XrplService:
    async def log_event(self, event: XrplLogEvent):
        doc_id = write_xrpl_event_to_firestore(event)
        if not doc_id:
            raise Exception("Failed to write XRPL event to database")
        return doc_id

xrpl_service = XrplService()
