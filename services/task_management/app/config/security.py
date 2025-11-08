from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin.auth

async def get_current_user(cred: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
    """Get the current user from the firebase token"""
    if not cred:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
        )
    try:
        decoded_token = firebase_admin.auth.verify_id_token(cred.credentials)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid authentication credentials: {e}",
        )
