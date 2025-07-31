import { XummTypes } from "xumm-sdk";

export interface XummPayloadOptions {
    expire?: number;
    force_network?: string;
    return_url?: {
        app?: string;
        web?: string;
    }
}

export interface XummPayload extends XummTypes.XummPostPayloadBodyJson {
  custom_meta?: XummTypes.XummCustomMeta;
  options?: XummPayloadOptions | null
  user_token?: string;
  txjson: XummTypes.XummJsonTransaction;
}
