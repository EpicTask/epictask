import { XummTypes } from "xumm-sdk";

/** Xumm userToken returned in webhook callbacks.
 *  Persisted to users/{uid}.userToken to enable future push-style requests. */
export interface XummUserToken {
  user_token: string;
  token_issued: number;
  token_expiration: number;
}

export interface XummPayloadOptions {
    expire?: number;
    force_network?: string;
    return_url?: {
        app?: string;
        web?: string;
    }
}

export interface XummPayload extends Omit<XummTypes.XummPostPayloadBodyJson, 'options'> {
  custom_meta?: XummTypes.XummCustomMeta;
  options?: XummPayloadOptions | null
  user_token?: string;
  txjson: XummTypes.XummJsonTransaction;
}
