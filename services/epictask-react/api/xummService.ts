import axios from "axios";
import MicroserviceUrls from "../constants/Microservices";
import authService from "./authService";

export interface XummSignInResponse {
  qrUrl?: string;
  next?: {
    always?: string;
  };
  uuid?: string;
}

const xummApiClient = axios.create({
  baseURL: MicroserviceUrls.xrplManagement,
});

xummApiClient.interceptors.request.use(
  async (config) => {
    const token = await authService.refreshToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Requests a Xumm sign-in payload for a given user.
 * @param uid The user's ID
 * @returns The payload response containing the QR URL and next steps
 */
export const requestXummSignIn = async (
  uid: string,
): Promise<XummSignInResponse> => {
  try {
    console.log(`Calling Xumm SignIn endpoint: /xummSignInRequest/${uid}`);

    const response = await xummApiClient.get(`/xummSignInRequest/${uid}`);
    return response.data as XummSignInResponse;
  } catch (error) {
    console.log("Failed to request Xumm sign in:", error);
    throw error;
  }
};

export interface XummPaymentRequest {
  type: "Payment";
  source: string;
  destination: string;
  amount: string;
  user_token?: string;
  task_id?: string;
}

export const requestPayment = async (
  payload: XummPaymentRequest,
): Promise<XummSignInResponse> => {
  try {
    console.log(`Calling payment_request endpoint`);

    const response = await xummApiClient.post("/payment_request", payload);
    return response.data as XummSignInResponse;
  } catch (error) {
    console.log("Failed to request Xumm payment:", error);
    throw error;
  }
};

export interface XummEscrowRequest {
  task_id?: string;
  user_token?: string;
  source?: string;
  destination?: string;
  amount?: string;
  cancelAfter?: string; // or ISO string
  finishAfter?: string;
  condition?: string;
  fulfillment?: string;
  escrowSequence?: number;
  owner?: string;
  user_id?: string;
}

export const createEscrow = async (
  payload: XummEscrowRequest,
): Promise<XummSignInResponse> => {
  try {
    const response = await xummApiClient.post("/create_escrow", payload);
    return response.data as XummSignInResponse;
  } catch (error) {
    console.log("Failed to create escrow:", error);
    throw error;
  }
};

export const finishEscrow = async (
  payload: XummEscrowRequest,
): Promise<XummSignInResponse> => {
  try {
    const response = await xummApiClient.post("/finish_escrow_xumm", payload);
    return response.data as XummSignInResponse;
  } catch (error) {
    console.log("Failed to finish escrow:", error);
    throw error;
  }
};

export const cancelEscrow = async (
  payload: XummEscrowRequest,
): Promise<XummSignInResponse> => {
  try {
    const response = await xummApiClient.post("/cancel_escrow_xumm", payload);
    return response.data as XummSignInResponse;
  } catch (error) {
    console.log("Failed to cancel escrow:", error);
    throw error;
  }
};
