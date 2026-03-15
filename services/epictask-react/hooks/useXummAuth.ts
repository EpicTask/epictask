import { useState, useEffect } from 'react';
import { Platform, Linking, Alert } from 'react-native';
import { 
  requestXummSignIn, 
  XummSignInResponse, 
  requestPayment, 
  createEscrow, 
  finishEscrow, 
  cancelEscrow,
  XummPaymentRequest,
  XummEscrowRequest
} from '../api/xummService';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
// Ensure the collection matches your environment config (e.g. 'xumm_callbacks' vs 'test_xumm_callbacks')
// Often this can be mapped to a constant if needed.
const XUMM_CALLBACK_COLLECTION = 'test_xumm_callbacks'; // Adjust as per your environment

type XummActionType = 'SIGN_IN' | 'PAYMENT' | 'CREATE_ESCROW' | 'FINISH_ESCROW' | 'CANCEL_ESCROW';

export const useXummAuth = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [payloadId, setPayloadId] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<XummActionType | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;

    if (payloadId) {
      const db = getFirestore();
      const docRef = doc(db, XUMM_CALLBACK_COLLECTION, payloadId);

      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Xumm callback received:', data);
          
          if (data.payload?.response?.resolved_at) {
             // Handle the successful sign-in resolution here
             // E.g., Save user token, update profile, etc.
             
             
             let title = 'Xumm Success';
             let message = 'Your Xumm request was completed successfully.';
             
             switch (currentAction) {
               case 'SIGN_IN':
                 title = 'Wallet Connected';
                 message = 'Your Xumm wallet was connected successfully.';
                 break;
               case 'PAYMENT':
                 title = 'Payment Complete';
                 message = 'Your payment was successfully processed.';
                 break;
               case 'CREATE_ESCROW':
                 title = 'Escrow Created';
                 message = 'Your escrow has been successfully created.';
                 break;
               case 'FINISH_ESCROW':
                 title = 'Escrow Finished';
                 message = 'Your escrow has been successfully finished.';
                 break;
               case 'CANCEL_ESCROW':
                 title = 'Escrow Cancelled';
                 message = 'Your escrow has been successfully cancelled.';
                 break;
             }

             Alert.alert('Success', message);
             // Persistent in-app notifications for XRPL events are now created
             // server-side by xrpl_management/src/wallets/xumm/webhook.ts when
             // the Xumm webhook fires with signed=true. No client-side creation needed.
             closeModal();
          }
        }
      }, (error) => {
        console.error("Firestore listen error:", error);
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [payloadId, currentAction]);

  const handlePayloadResponse = async (response: XummSignInResponse, actionType: XummActionType) => {
    if (response.uuid) {
      setPayloadId(response.uuid);
      setCurrentAction(actionType);
    }

    const deepLinkUrl = response.next?.always;
    const responseQrUrl = response.qrUrl;

    if (Platform.OS === 'web') {
      setQrUrl(responseQrUrl || null);
      setShowQrModal(true);
    } else {
      if (deepLinkUrl) {
        const supported = await Linking.canOpenURL(deepLinkUrl);
        if (supported) {
          await Linking.openURL(deepLinkUrl);
        } else {
          setQrUrl(responseQrUrl || null);
          setShowQrModal(true);
        }
      } else {
         setQrUrl(responseQrUrl || null);
         setShowQrModal(true);
      }
    }
  }

  const connectWallet = async (uid: string) => {
    setIsConnecting(true);
    try {
      const response = await requestXummSignIn(uid);
      await handlePayloadResponse(response, 'SIGN_IN');
    } catch (error) {
      console.error('Error connecting Xumm wallet:', error);
      Alert.alert('Error', 'Failed to request Xumm sign in. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const sendPayment = async (payload: XummPaymentRequest) => {
    setIsConnecting(true);
    try {
      const response = await requestPayment(payload);
      await handlePayloadResponse(response, 'PAYMENT');
    } catch (error) {
      console.error('Error sending payment:', error);
      Alert.alert('Error', 'Failed to request payment. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const createXummEscrow = async (payload: XummEscrowRequest) => {
    setIsConnecting(true);
    try {
      const response = await createEscrow(payload);
      await handlePayloadResponse(response, 'CREATE_ESCROW');
    } catch (error) {
      console.error('Error creating escrow:', error);
      Alert.alert('Error', 'Failed to create escrow. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const finishXummEscrow = async (payload: XummEscrowRequest) => {
    setIsConnecting(true);
    try {
      const response = await finishEscrow(payload);
      await handlePayloadResponse(response, 'FINISH_ESCROW');
    } catch (error) {
      console.error('Error finishing escrow:', error);
      Alert.alert('Error', 'Failed to finish escrow. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const cancelXummEscrow = async (payload: XummEscrowRequest) => {
    setIsConnecting(true);
    try {
      const response = await cancelEscrow(payload);
      await handlePayloadResponse(response, 'CANCEL_ESCROW');
    } catch (error) {
      console.error('Error cancelling escrow:', error);
      Alert.alert('Error', 'Failed to cancel escrow. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const closeModal = () => {
    setShowQrModal(false);
    setQrUrl(null);
    setPayloadId(null);
  };

  return {
    isConnecting,
    showQrModal,
    qrUrl,
    connectWallet,
    sendPayment,
    createXummEscrow,
    finishXummEscrow,
    cancelXummEscrow,
    closeModal,
  };
};
