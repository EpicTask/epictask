from typing import Dict, Any
from firebase_admin import auth as firebase_auth
from fastapi import APIRouter, Depends, HTTPException, status
from ...domain.user_models import (
    ManagedChildCreate,
    ChildInviteCreate,
    ChildInviteRedeem,
    ChildPinUpdate,
    VerifyPinRequest,
    UserProfileUpdate,
    InviteCodeRequest,
    LinkChildRequest,
    FcmTokenUpdate,
    NotificationPreferencesUpdate,
)
from ...services.users.user_service import user_service
from ...config.security import get_current_user, get_current_user_strict
from ...config.role_claims import sync_role_claim
from ...config import age_policy
from ...storage.db import user_db

router = APIRouter()


def _require_parent(uid: str) -> dict:
    """
    Load the caller's profile and assert they can manage children.

    Unlike the task routes this genuinely needs the profile document (callers
    read `children` and `uid` off it), so the read stays. It still repairs the
    role claim so the cheaper token-only checks elsewhere stop falling back.
    """
    profile = user_db.get_user_profile(uid)
    if not profile or profile.get("role") not in ("parent", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only a parent can manage child profiles",
        )
    sync_role_claim(uid, profile.get("role"))
    return profile


def _require_own_child(parent_profile: dict, child_id: str) -> dict:
    """Assert child_id belongs to the caller, and return the child profile."""
    child = user_db.get_user_profile(child_id)
    if not child or child.get("parent_id") != parent_profile.get("uid"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="That child is not linked to your account",
        )
    return child

@router.put("/profile", dependencies=[Depends(get_current_user)])
async def update_profile(
    request: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile."""
    uid = current_user['uid']
    success = await user_service.update_profile(uid, request)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )
    return {"message": "Successful profile update"}

@router.get("/age-policy")
async def get_age_policy():
    """Age bands the client uses to pick a signup path. Single source of truth."""
    return {
        "min_child_age": age_policy.MIN_CHILD_AGE,
        "max_child_age": age_policy.MAX_CHILD_AGE,
        "teen_min_age": age_policy.TEEN_MIN_AGE,
    }


@router.post("/managed-child")
async def create_managed_child(
    request: ManagedChildCreate,
    current_user: dict = Depends(get_current_user_strict),
):
    """Create a child profile for parent-controlled shared-device sessions."""
    _require_parent(current_user["uid"])
    try:
        return user_db.create_managed_child(current_user["uid"], request.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create managed child") from e


# ---------------------------------------------------------------------------
# Teen (13+) invites
# ---------------------------------------------------------------------------

@router.post("/child-invite")
async def create_child_invite(
    request: ChildInviteCreate,
    current_user: dict = Depends(get_current_user_strict),
):
    """Issue a single-use code a teen redeems to create their own account."""
    parent_profile = _require_parent(current_user["uid"])
    parent_name = parent_profile.get("display_name") or "Your parent"
    try:
        return user_db.create_child_invite(current_user["uid"], parent_name, request.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create invite",
        ) from e


@router.get("/child-invites", dependencies=[Depends(get_current_user)])
async def list_child_invites(current_user: dict = Depends(get_current_user)):
    """Outstanding invites the caller has issued."""
    _require_parent(current_user["uid"])
    return {"success": True, "invites": user_db.list_child_invites(current_user["uid"])}


@router.delete("/child-invite/{code}")
async def revoke_child_invite(code: str, current_user: dict = Depends(get_current_user_strict)):
    """Cancel an invite that hasn't been redeemed yet."""
    _require_parent(current_user["uid"])
    if not user_db.revoke_child_invite(current_user["uid"], code):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No pending invite with that code",
        )
    return {"success": True, "message": "Invite cancelled"}


@router.get("/child-invite/{code}")
async def preview_child_invite(code: str):
    """Public lookup for the teen join screen — they have no account yet.

    Returns only what the join screen needs to render, with the email masked.
    Possession of the code is the credential; the email typed at redeem time is
    what actually has to match.
    """
    result = user_db.get_child_invite(code)
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=result.get("message"))
    return result


@router.post("/child-invite/{code}/redeem")
async def redeem_child_invite(code: str, request: ChildInviteRedeem):
    """Create the teen's account from an invite. Intentionally unauthenticated —
    the caller is a teen who does not have credentials yet; the invite code plus
    a matching email is the authorization."""
    try:
        return user_db.redeem_child_invite(
            code=code,
            email=request.email,
            password=request.password,
            pin=request.pin,
            avatar_key=request.avatar_key,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    except firebase_auth.EmailAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account already exists for that email. Try signing in instead.",
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not complete signup. Please try again.",
        ) from e

@router.delete("/account")
async def delete_account(current_user: dict = Depends(get_current_user_strict)):
    """Delete user account."""
    uid = current_user['uid']
    success = await user_service.delete_account(uid)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account"
        )
    return {"message": "Successful user account deletion"}

@router.post("/invite-code", dependencies=[Depends(get_current_user)])
async def generate_invite_code(current_user: dict = Depends(get_current_user)):
    """Generate invite code for a child."""
    # Logic in Node.js used req.user.uid as childId. 
    # Usually this endpoint is called BY THE CHILD.
    uid = current_user['uid']
    return await user_service.generate_invite_code(uid)

@router.post("/link-child")
async def link_child(
    request: LinkChildRequest,
    current_user: dict = Depends(get_current_user_strict)
):
    """Link child account (for parents)."""
    uid = current_user['uid']
    try:
        return await user_service.link_child(uid, request)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/admin/metrics")
async def get_metrics(current_user: dict = Depends(get_current_user)):
    """Get user metrics (Admin only)."""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return await user_service.get_metrics()


@router.put("/fcm-token", dependencies=[Depends(get_current_user)])
async def register_fcm_token(
    request: FcmTokenUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Register or rotate the caller's device push token.

    Called by the React Native app on launch (after sign-in) and whenever
    expo-notifications reports that the token has been refreshed.
    The token is stored on the user's Firestore profile document and used by
    notification_service._dispatch_fcm() when sending push notifications.
    """
    uid = current_user["uid"]
    success = user_db.update_fcm_token(uid, request.token, request.platform)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register push token",
        )
    return {"message": "Push token registered successfully"}


@router.delete("/fcm-token", dependencies=[Depends(get_current_user)])
async def unregister_fcm_token(current_user: dict = Depends(get_current_user)):
    """Remove the caller's push token (e.g. on sign-out or notifications disabled)."""
    uid = current_user["uid"]
    user_db.clear_fcm_token(uid)
    return {"message": "Push token removed"}

@router.get("/preferences/notifications", dependencies=[Depends(get_current_user)])
async def get_notification_preferences(current_user: dict = Depends(get_current_user)):
    """Get notification preferences."""
    uid = current_user['uid']
    return await user_service.get_notification_preferences(uid)

@router.put("/preferences/notifications", dependencies=[Depends(get_current_user)])
async def update_notification_preferences(
    request: NotificationPreferencesUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update notification preferences."""
    uid = current_user['uid']
    success = await user_service.update_notification_preferences(uid, request)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification preferences"
        )
    return {"message": "Successful preferences update"}

@router.post("/verify-pin")
async def verify_pin(request: VerifyPinRequest, current_user: dict = Depends(get_current_user_strict)):
    """Unlock a managed child's profile on the parent's device.

    Requires a signed-in parent who owns the child. Attempt counting and
    lockout are durable (Firestore), so they survive restarts and are shared
    across instances — see user_db.verify_child_pin.
    """
    caller_uid = current_user["uid"]
    if caller_uid != request.child_id:
        parent_profile = _require_parent(caller_uid)
        child = _require_own_child(parent_profile, request.child_id)
        if not child.get("device_sharing_enabled"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"{child.get('display_name') or 'This child'} has their own account. "
                    "Ask them to sign in with their email and password."
                ),
            )

    res = user_db.verify_child_pin(request.child_id, request.pin)

    if not res.get("success"):
        if res.get("locked"):
            minutes = max(1, round(res.get("retry_after_seconds", 900) / 60))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many incorrect PINs. Try again in {minutes} minute"
                       f"{'s' if minutes != 1 else ''}.",
                headers={"Retry-After": str(res.get("retry_after_seconds", 900))},
            )

        detail = res.get("message", "Invalid PIN")
        remaining = res.get("attempts_remaining")
        if detail == "Invalid PIN" and remaining is not None:
            detail = (
                f"That PIN isn't right. {remaining} "
                f"{'try' if remaining == 1 else 'tries'} left."
            )
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

    return res


@router.put("/child-pin")
async def set_child_pin(request: ChildPinUpdate, current_user: dict = Depends(get_current_user_strict)):
    """Set or reset a child's PIN. Parents may do this for their own children;
    a teen may do it for themselves. Also clears any active lockout."""
    caller_uid = current_user["uid"]
    if caller_uid != request.child_id:
        parent_profile = _require_parent(caller_uid)
        _require_own_child(parent_profile, request.child_id)

    user_db.set_child_pin(request.child_id, request.pin)
    return {"success": True, "message": "PIN updated"}

@router.post("/ask-help", dependencies=[Depends(get_current_user)])
async def ask_parent_for_help(current_user: dict = Depends(get_current_user)):
    """Kid requests help from their parent."""
    uid = current_user['uid']
    try:
        success = await user_service.ask_parent_for_help(uid)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send help request"
            )
        return {"message": "Help request sent successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
