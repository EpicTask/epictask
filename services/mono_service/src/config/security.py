from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth, exceptions as firebase_exceptions


security = HTTPBearer()


def _verify(token: str, check_revoked: bool) -> dict:
    """Verify a Firebase ID token, mapping SDK errors onto 401s."""
    try:
        return auth.verify_id_token(token, check_revoked=check_revoked)
    except auth.RevokedIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has been revoked, please sign in again",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.UserDisabledError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This account has been disabled",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (
        auth.CertificateFetchError,
        firebase_exceptions.UnavailableError,
        firebase_exceptions.DeadlineExceededError,
    ):
        # check_revoked adds a network hop to the auth path. A transient
        # Google outage is not the caller's credentials being wrong, and
        # answering 401 would bounce a signed-in user to the login screen.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service temporarily unavailable",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_strict(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> dict:
    """
    Like `get_current_user`, but also rejects revoked sessions and disabled
    accounts.

    An ID token stays cryptographically valid for its full hour, so the plain
    check keeps honouring one for up to an hour after a parent revokes a
    child's access or an account is disabled. `check_revoked=True` closes that
    window at the cost of an Identity Toolkit round trip per call, so it is
    reserved for routes where an hour is too long: money movement, account
    deletion, and anything that changes who can act as a child.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return _verify(credentials.credentials, check_revoked=True)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> dict:
    """
    Verify Firebase ID token and return user information.

    Does not check revocation - see `get_current_user_strict` for routes where
    an hour-long window after revocation is unacceptable.

    Args:
        credentials: HTTP Bearer token from request header
        
    Returns:
        dict: Decoded token with user information
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return _verify(credentials.credentials, check_revoked=False)


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
