import { XummTypes } from "xumm-sdk";


export interface XummPayload extends XummTypes.XummPostPayloadBodyJson {
  custom_meta?: XummTypes.XummCustomMeta;
  options?: {
    [key: string]: any
  } | null
  user_token?: string;
  txjson: XummTypes.XummJsonTransaction;
}
