"""Client for XRPL Management Service integration."""
import os
from typing import Dict, Any, Optional
import httpx
from datetime import datetime

from src.domain.models import PayoutRequest, PayoutRequestRecord


class XRPLClient:
    """Client for interacting with XRPL Management Service."""
    
    def __init__(self):
        self.base_url = os.getenv(
            "XRPL_MANAGEMENT_URL",
            "http://localhost:3000"  # Default for local development
        )
        self.timeout = 30.0
    
    async def create_payout(
        self,
        user_id: str,
        wallet_address: str,
        token: str,
        amount: float,
        reference: str
    ) -> Dict[str, Any]:
        """
        Create a payout request via XRPL Management Service.
        
        Args:
            user_id: User identifier
            wallet_address: Destination wallet address
            token: Token type (eTask, RLUSD, XRP)
            amount: Amount to pay out
            reference: Reference string (e.g., "narrative:storyId#nodeId")
            
        Returns:
            Response from XRPL Management Service with txId and status
            
        Raises:
            httpx.HTTPError: If the request fails
        """
        payload = {
            "userId": user_id,
            "walletAddress": wallet_address,
            "token": token,
            "amount": amount,
            "reference": reference
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/payment_request",
                    json=payload
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                # Log the error and re-raise
                print(f"XRPL Management Service error: {str(e)}")
                raise
    
    async def get_transaction_status(self, tx_hash: str) -> Dict[str, Any]:
        """
        Get the status of a transaction from XRPL.
        
        Args:
            tx_hash: Transaction hash
            
        Returns:
            Transaction status information
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/verify_transaction/{tx_hash}"
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                print(f"Error getting transaction status: {str(e)}")
                raise
    
    async def get_account_balance(self, address: str) -> Dict[str, Any]:
        """
        Get account balance from XRPL.
        
        Args:
            address: Wallet address
            
        Returns:
            Account balance information
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/balance/{address}"
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                print(f"Error getting account balance: {str(e)}")
                raise


# Global instance
xrpl_client = XRPLClient()
