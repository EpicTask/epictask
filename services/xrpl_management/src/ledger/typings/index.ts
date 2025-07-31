import { AccountObject, BaseRequest } from "xrpl";

export interface Subscribe {
    accounts?: string[];
    books?: [],
    command: string;
    id?: string;
    ledger_index?: string;
    streams: string[];
}

export class AccountSubscribe implements BaseRequest {
    [x: string]: unknown;
    api_version?: number;
    id: string;
    accounts: string[];
    command: string;
    streams: string[];

    constructor(accounts: string[]) {
        this.accounts = accounts;
        this.command = 'subscribe';
        this.id = 'EpicTask';
        this.streams = ['transactions'];
    }
}