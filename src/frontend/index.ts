import { html, LitElement } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { customElement, property } from 'lit/decorators.js';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

import { KeyPair, mnemonicNew, mnemonicToPrivateKey } from "@ton/crypto";

const endpoint: string = 'https://testnet.toncenter.com/api/v2/jsonRPC?api_key=12ef1fc91b0d4ee237475fed09efc66af909d83f72376c7c3c42bc9170847ecb';
const explorer: string = 'https://testnet.tonviewer.com/';
const workchain = 0; // Usually you need a workchain 0
const devWalletAddress = '0QDQBpCcv361Q785LZ33ky4fowYlgSYLTEIRTPzHVOaAhsVm';

interface sysWallet {
    address: string;
    mnemonic: string[] | null;
    keyPair: KeyPair | null;
}

let sysWallet: sysWallet = {
    address: '', 
    mnemonic: null,
    keyPair: null,
}

@customElement('azle-app')
export class AzleApp extends LitElement {
    canisterOrigin: string = `http://${
        import.meta.env.VITE_CANISTER_ID
    }.localhost:4943`;

    @property()
    createWalletResponse: string = '';

    @property()
    getBalanceResponse: string = '';

    @property()
    sendTONResponse: string = '';

    @property()
    resSendResponse: string = '';

    @property()
    resWriteResponse: string = '';

    @property()
    fileStreamResponse: string = '';

    @property()
    globalStateResponse: string = JSON.stringify({});

    async createWallet(): Promise<void> {
        this.createWalletResponse = 'Loading...';
        try { 
            const TonClient = (await import("@ton/ton")).TonClient;
            const WalletContractV4 = (await import("@ton/ton")).WalletContractV4;
            // Create Client
            const client = new TonClient({
              endpoint: endpoint,
            });
    
            // Generate new key
            const mnemonics = await mnemonicNew();
            const keyPair = await mnemonicToPrivateKey(mnemonics);
    
            // Create wallet contract
            let wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
            const address = wallet.address.toString({ testOnly: true });

            // set sys wallet
            sysWallet.address = address;
            sysWallet.mnemonic = mnemonics;
            sysWallet.keyPair = keyPair;

            // rtn 
            this.createWalletResponse = `<br />Address: ${address}<br />Mnemonic: ${mnemonics.toString()}`;
        } catch (e) {
            this.createWalletResponse = `Error0: ${e}`;
        }
    }

    async getBalance(): Promise<void> {
        this.getBalanceResponse = 'Loading...';
        try { 
            const TonClient = (await import("@ton/ton")).TonClient;
            const WalletContractV4 = (await import("@ton/ton")).WalletContractV4;
            // Create Client
            const client = new TonClient({
              endpoint: endpoint,
            });

            let wallet = WalletContractV4.create({ workchain, publicKey: sysWallet.keyPair!.publicKey });
            let contract = client.open(wallet);
            
            // Get balance
            let balance: bigint = await contract.getBalance();
    
            this.getBalanceResponse = `${parseFloat(BigInt(balance).toString()) / (10 ** 9)} TON`;
        } catch (e) {
            this.getBalanceResponse = `Error0: ${e}`;
        }
    }

    async sendTON(): Promise<void> {
        this.sendTONResponse = 'Loading...';
        try { 
            const TonClient = (await import("@ton/ton")).TonClient;
            const WalletContractV4 = (await import("@ton/ton")).WalletContractV4;
            const internal = (await import("@ton/ton")).internal;
            // Create Client
            const client = new TonClient({
              endpoint: endpoint,
            });

            let wallet = WalletContractV4.create({ workchain, publicKey: sysWallet.keyPair!.publicKey });
            let contract = client.open(wallet);

            // Create a transfer
            let seqno: number = await contract.getSeqno();

            const internal_msg = internal({
                to: devWalletAddress,
                value: '0.001',
                init: undefined,
                body: `Test@${Date.now()}`
            });
            
            let transfer = contract.createTransfer({
              seqno,
              secretKey: sysWallet.keyPair!.secretKey,
              messages: [internal_msg]
            });
    
            await contract.send(transfer);

            // const hash = internal_msg.body.hash().toString('hex');
            // console.log(internal_msg);
            
            const hash = await this.getHash(transfer, wallet.address);
            
            this.sendTONResponse = `Done<br /><a href="${explorer}transaction/${hash}" target="_blank">${hash}</a><br /><a href="${explorer}${devWalletAddress}" target="_blank">Address</a>`;
        } catch (e) {
            this.sendTONResponse = `Error0: ${e}`;
        }
    }

    async getHash(transfer: any, address: any): Promise<string> {
        const external = (await import("@ton/ton")).external;
        const beginCell = (await import("@ton/ton")).beginCell;
        const storeMessage = (await import("@ton/ton")).storeMessage;
        // get external info
        let neededInit = null;
        const ext = external({
          to: address,
          init: neededInit,
          body: transfer,
        });
        // convert to boc 
        let boc = beginCell().store(storeMessage(ext)).endCell();
        console.log(boc);
        // return hasn
        return boc.hash().toString("hex");
    }

    async testResSend(): Promise<void> {
        this.resSendResponse = 'Loading...';

        const response = await fetch(`${this.canisterOrigin}/backend-get`);
        const responseText = await response.text();

        this.resSendResponse = responseText;
    }

    /*
    async testResWrite(): Promise<void> {
        this.resWriteResponse = 'Loading...';

        const response = await fetch(`${this.canisterOrigin}/res-write`);
        const responseText = await response.text();

        this.resWriteResponse = responseText;
    }

    async testFileStream(): Promise<void> {
        this.fileStreamResponse = 'Loading...';

        const response = await fetch(`${this.canisterOrigin}/file-stream`);
        const responseText = await response.text();

        this.fileStreamResponse = responseText;
    }

    async testGlobalState(): Promise<void> {
        this.globalStateResponse = 'Loading...';

        const response = await fetch(
            `${this.canisterOrigin}/global-state/post`,
            {
                method: 'POST',
                headers: [['Content-Type', 'application/json']],
                body: JSON.stringify({
                    hello: 'world'
                })
            }
        );
        const responseJson = await response.json();

        this.globalStateResponse = JSON.stringify(responseJson);
    }

    async deleteGlobalState(): Promise<void> {
        this.globalStateResponse = 'Loading...';

        const response = await fetch(
            `${this.canisterOrigin}/global-state/delete`,
            {
                method: 'DELETE'
            }
        );
        const responseJson = await response.json();

        this.globalStateResponse = JSON.stringify(responseJson);
    }
    */

    render(): any {
        return html`
            <div>
                <button @click=${this.createWallet}>Create Wallet</button>:
                <p class="rsp">${unsafeHTML(this.createWalletResponse)}</p>
            </div>

            <br />
            <div>
                <button @click=${this.getBalance}>Get Balance</button>:
                <p class="rsp">${unsafeHTML(this.getBalanceResponse)}</p>
            </div>

            <br />
            <div>
                <button @click=${this.sendTON}>Send TON</button>:
                <p class="rsp">${unsafeHTML(this.sendTONResponse)}</p>
            </div>

            <br />
            <div>
                <button @click=${this.testResSend}>Backend Get</button>:
                <p class="rsp">${unsafeHTML(this.resSendResponse)}</p>
            </div>
        `;
    }
}
