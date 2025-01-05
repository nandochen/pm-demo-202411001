import { Body, Injectable, RawBody } from '@nestjs/common';

export type TonBalanceResult = {
  ok: boolean;
  result?: string;
  msg?: string;
};

export type TonTransactionsResult = {
  ok: boolean;
  result?: Array<object>;
  msg?: string;
}

const testnetEndPoint = 'https://testnet.toncenter.com/api/v2';
const apiKey = '12ef1fc91b0d4ee237475fed09efc66af909d83f72376c7c3c42bc9170847ecb';

@Injectable()
export class TokenService {

  getHello(): string {
    return 'Hello Ton!';
  }

  async getBalance(
    address: string
  ): Promise<TonBalanceResult> {
    const url = `${testnetEndPoint}/getAddressBalance?api_key=${apiKey}&address=${address}`;

    try {
        const response = await fetch(url);
        const tonResult:TonBalanceResult = await response.json();

        return tonResult;
    } catch (e) {
        return {
          ok: false,
          msg: e.message
        }
    }
  }

  async getTransactions(
    address: string
  ): Promise<TonTransactionsResult> {
    const url = `${testnetEndPoint}/getTransactions?api_key=${apiKey}&address=${address}`;

    try {
        const response = await fetch(url);
        const tonResult:TonTransactionsResult = await response.json();

        return tonResult;
    } catch (e) {
        return {
          ok: false,
          msg: e.message
        }
    }
  }
}
