from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth


security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Verify Firebase ID token and return user information.
    
    Args:
        credentials: HTTP Bearer token from request header
        
    Returns:
        dict: Decoded token with user information
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    token = credentials.credentials
    
    try:
        # Verify the ID token
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_user_id(current_user: dict = Depends(get_current_user)) -> str:
    """
    Extract user ID from decoded token.
    
    Args:
        current_user: Decoded token from get_current_user
        
    Returns:
        str: User ID (uid)
    """
    return current_user.get("uid")


def get_user_role(current_user: dict = Depends(get_current_user)) -> str:
    """
    Extract user role from decoded token custom claims.
    
    Args:
        current_user: Decoded token from get_current_user
        
    Returns:
        str: User role (parent, kid, admin)
    """
    return current_user.get("role", "kid")  # Default to kid if not specified
