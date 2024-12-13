import { html, css, LitElement } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { live } from 'lit/directives/live.js';

import { customElement, property } from 'lit/decorators.js';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

import { KeyPair, mnemonicNew, mnemonicToPrivateKey, keyPairFromSecretKey, keyPairFromSeed } from "@ton/crypto";

import { JsonnableEd25519KeyIdentity } from "@dfinity/identity/lib/esm/identity/ed25519"
import getRandomValues from "get-random-values";

const endpoint: string = 'https://testnet.toncenter.com/api/v2/jsonRPC?api_key=12ef1fc91b0d4ee237475fed09efc66af909d83f72376c7c3c42bc9170847ecb';
const explorer: string = 'https://testnet.tonviewer.com/';
const workchain = 0; // Usually you need a workchain 0
const devWalletAddress = '0QDQBpCcv361Q785LZ33ky4fowYlgSYLTEIRTPzHVOaAhsVm';

interface sysWallet {
    address: string;
    addressICP: string;
    mnemonic: string[] | null;
    keyPair: KeyPair | null;
    keyPairJSON: JsonnableEd25519KeyIdentity | null;
}

let sysWallet: sysWallet = {
    address: '', 
    addressICP: '', 
    mnemonic: null,
    keyPair: null,
    keyPairJSON: null
}

@customElement('azle-app')
export class AzleApp extends LitElement {
    // canisterOrigin: string = process.env.CANISTER_ORIGIN!;
    canisterOrigin: string = `http://${import.meta.env.VITE_CANISTER_ID}.localhost:4943`;

    @property()
    createWalletResponse: string = '...';

    @property()
    getBalanceResponse: string = '...';

    @property()
    sendTONResponse: string = '...';

    @property()
    resSendResponse: string = '...';

    @property()
    getTransactionsResponse: string = '...';

    @property()
    sendTONAddress: string = devWalletAddress;

    @property()
    createWalletCFResponse: string = '...';

    @property()
    fileStreamResponse: string = '';

    @property()
    globalStateResponse: string = JSON.stringify({});

    @property()
    getInfoResponse: string = '...';


    /**
     * ICP Chain Fusion - identity 
     */
    async createWalletCF(): Promise<void> {
        this.createWalletCFResponse = 'Loading...';
        try {
            const identity = (await import("@dfinity/identity"));
            const WalletContractV4 = (await import("@ton/ton")).WalletContractV4;
            const ton = (await import("@ton/ton"));
            // ICP ID
            const entropy = getRandomValues(new Uint8Array(32));
            const did = identity.Ed25519KeyIdentity.generate(entropy);
            console.log(did);
            // keyPair 
            // const _keyPair = did.getKeyPair();
            // address 
            const _addrICP = did.getPrincipal().toString();            
            let [pubKey, privKey] = did.toJSON();
            // hack 1 -> actual pk is here
            pubKey = this.toHexString(did.getPublicKey().toRaw());
            const _publicKey = Buffer.from(pubKey, "hex");
            /*
            console.log(did.getPublicKey().toRaw());
            console.log(pubKey);
            pubKey = pubKey.slice(0, 64);
            console.log(pubKey);
            console.log(privKey);
            */
            // const privateKeya = Buffer.from(privKey, "hex");
            // console.log(_publicKey);
            // console.log(privateKeya);
            /*
            const kp = Buffer.from(privKey, "hex");
            const keyIdObject = identity.Ed25519KeyIdentity.fromSecretKey(kp);
            let [pubKey2, privKey2] = keyIdObject.toJSON();
            console.log(kp);
            console.log(did);
            console.log(keyIdObject);
            console.log(pubKey2);
            console.log(privKey2);
            */

            // use public key to create TON wallet
            let wallet = WalletContractV4.create({ workchain, publicKey: _publicKey });
            const address = wallet.address.toString({ testOnly: false, bounceable: false });
            // set sys wallet
            sysWallet.address = address;
            sysWallet.addressICP = _addrICP;
            sysWallet.keyPairJSON = [pubKey, privKey];
            // out 
            this.createWalletCFResponse = `TON Address: ${address}<br />ICP Address: ${_addrICP}<br />
                                           Public Key: ${pubKey}<br />Secret Key: ${privKey}`;
        } catch (e) {
            this.createWalletCFResponse = `Error0: ${e}`;
        }
    }

    /**
     * TON
     */
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

            console.log(keyPair.secretKey);

            // set sys wallet
            sysWallet.address = address;
            sysWallet.mnemonic = mnemonics;
            sysWallet.keyPair = keyPair;

            // rtn 
            this.createWalletResponse = `Address: ${address}<br />
                                        Public Key: ${keyPair.publicKey.toString('hex')}<br />
                                        Private Key: ${keyPair.secretKey.toString('hex')}<br />
                                        Mnemonic: ${mnemonics.toString()}`;
        } catch (e) {
            this.createWalletResponse = `Error0: ${e}`;
        }
    }

    /**
     * ICP Chain Fusion - HTTPS outcalls
     */
    async getBalance(): Promise<void> {
        this.getBalanceResponse = 'Loading...';
        try { 
            // https outcall 
            const response = await fetch(
                    `${this.canisterOrigin}/getBalance`, 
                    { 
                        method: 'POST',                    
                        headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ address: sysWallet.address})
                    });
            const responseText = await response.json();
            try {
                let balance = parseFloat(BigInt(responseText.result).toString()) / (10 ** 9);
                console.log(responseText)
                this.getBalanceResponse = `${balance} TON`;
            } catch (e) {
                this.getBalanceResponse = `Error: ${e}`;
            }
            /*
            // ton 
            const TonClient = (await import("@ton/ton")).TonClient;
            const WalletContractV4 = (await import("@ton/ton")).WalletContractV4;
            // Create Client
            const client = new TonClient({
              endpoint: endpoint,
            });

            let _publicKey = sysWallet.keyPair ? sysWallet.keyPair!.publicKey : Buffer.from(sysWallet.keyPairJSON![0], "hex"); 
            let wallet = WalletContractV4.create({ workchain, publicKey: _publicKey });
            let contract = client.open(wallet);
            
            // Get balance
            let balance: bigint = await contract.getBalance();
    
            this.getBalanceResponse = `${parseFloat(BigInt(balance).toString()) / (10 ** 9)} TON`;
            */
        } catch (e) {
            this.getBalanceResponse = `Error0: ${e}`;
        }
    }

    /**
     * ICP Chain Fusion - HTTPS outcalls
     */
    async getTransactions(): Promise<void> {
        this.getTransactionsResponse = 'Loading...';
        try { 
            // https outcall 
            const response = await fetch(
                    `${this.canisterOrigin}/getTransactions`, 
                    { 
                        method: 'POST',                    
                        headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ address: sysWallet.address})
                    });
            try {
                const responseText = await response.text();
                this.getTransactionsResponse = `${responseText}`;
            } catch (e) {
                this.getTransactionsResponse = `Error: ${e}`;
            }
        } catch (e) {
            this.getTransactionsResponse = `Error0: ${e}`;
        }
    }

    /**
     * ICP Chain Fusion - identity 
     */
    async sendTON(): Promise<void> {
        this.sendTONResponse = 'Loading...';
        let ok = false;
        // check address 
        try {
            const Address = (await import("@ton/core")).Address;
            const address = Address.parse(this.sendTONAddress);
            console.log('Address is valid.');
            console.log(`${address}`);
            console.log('Address is valid.');
            ok = true;
        } catch (e) {
            this.sendTONResponse = `Error1: ${this.sendTONAddress} not valid. (${e})`;
        }
        // break flow on error
        if (ok) {
            // trans
            try { 
                const TonClient = (await import("@ton/ton")).TonClient;
                const WalletContractV4 = (await import("@ton/ton")).WalletContractV4;
                const internal = (await import("@ton/ton")).internal;
                // Create Client
                const client = new TonClient({
                  endpoint: endpoint,
                });
                // hack 2 -> sim TON secret key 
                let _combineKey = sysWallet.keyPairJSON![1] + sysWallet.keyPairJSON![0];
                let _publicKey = sysWallet.keyPair ? sysWallet.keyPair!.publicKey : Buffer.from(sysWallet.keyPairJSON![0], "hex"); 
                let _secretKey = sysWallet.keyPair ? sysWallet.keyPair!.secretKey : Buffer.from(_combineKey, "hex"); 

                console.log(_secretKey);

                let wallet = WalletContractV4.create({ workchain, publicKey: _publicKey });
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
                  secretKey: _secretKey,
                  messages: [internal_msg]
                });
        
                await contract.send(transfer);
    
                // const hash = internal_msg.body.hash().toString('hex');
                // console.log(internal_msg);
                
                const hash = await this.getHash(transfer, wallet.address);
                
                // this.sendTONResponse = `Done<br /><a href="${explorer}transaction/${hash}" target="_blank">${hash}</a><br /><a href="${explorer}${devWalletAddress}" target="_blank">Address</a>`;
                this.sendTONResponse = `Done. <a href="${explorer}${devWalletAddress}" target="_blank">Explorer 🗗</a>`;
            } catch (e) {
                this.sendTONResponse = `Error0: ${e}`;
            }
        }
    }

    async getInfo(): Promise<void> {
        this.getInfoResponse = 'Loading...';
        try { 
            // https outcall 
            const response = await fetch(`${this.canisterOrigin}/backend-get`);
            const responseText = await response.text();
            try {
                this.getInfoResponse = `${responseText}`;
            } catch (e) {
                this.getInfoResponse = `Error: ${e}`;
            }
        } catch (e) {
            this.getInfoResponse = `Error0: ${e}`;
        }
    }

    async setInfo(): Promise<void> {
        this.getInfoResponse = 'Loading...';
        try { 
            // https outcall 
            const response = await fetch(`${this.canisterOrigin}/backend-set`, 
                    { 
                        method: 'POST',
                    });
            const responseText = await response.text();
            try {
                this.getInfoResponse = `${responseText}`;
            } catch (e) {
                this.getInfoResponse = `Error: ${e}`;
            }
        } catch (e) {
            this.getInfoResponse = `Error0: ${e}`;
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

    setSendTONAddress (e:any) {
        this.sendTONAddress = e.srcElement.value;
        console.log(e.srcElement.value);
    }

    toHexString(byteArray:any) {
        return Array.from(byteArray, function(byte:any) {
          return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('')
      }

    inputSendTONAddress(){
        return html `<input type="text" class="form-control" value="${live(this.sendTONAddress)}" @change=${this.setSendTONAddress} />`
    }

    // inject css file 
    static get styles() {
        const globalStyle = Array.from(document.styleSheets).map(x => {
                                const sheet = new CSSStyleSheet();
                                const css = Array.from(x.cssRules).map(rule => rule.cssText).join('\n');
                                sheet.replaceSync(css);
                                return sheet;
                            });
        return [
            globalStyle,
            css``
        ];
    }

    render(): any {
        return html`
        <div class="card mb-3">
            <div class="card-header">
                <a href="#" class="btn btn-sm btn-primary" @click=${this.createWalletCF}>Create Wallet</a>
            </div>
            <div class="card-body">
                <p class="card-text small">@difinity/identity.Ed25519KeyIdentity</p>
                <p class="card-text text-muted small">${unsafeHTML(this.createWalletCFResponse)}</p>
            </div>
        </div>
        <div class="card mb-3">
            <div class="card-header">
                <a href="#" class="btn btn-sm btn-primary" @click=${this.getBalance}>Get Balance</a>
            </div>
            <div class="card-body">
                <p class="card-text small">HTTPS Outcalls <-> TON RPC</p>
                <p class="card-text text-muted small">${unsafeHTML(this.getBalanceResponse)}</p>
            </div>
        </div>
        <div class="card mb-3">
            <div class="card-header">
                <a href="#" class="btn btn-sm btn-primary" @click=${this.sendTON}>Send TON</a>
            </div>
            <div class="card-body">
                <p class="card-text small">${this.inputSendTONAddress()}</p>
                <p class="card-text text-muted small">${unsafeHTML(this.sendTONResponse)}</p>
            </div>
        </div>
        <div class="card mb-3">
            <div class="card-header">
                <a href="#" class="btn btn-sm btn-primary" @click=${this.getTransactions}>Get Transactions</a>
            </div>
            <div class="card-body">
                <p class="card-text small">HTTPS Outcalls <-> TON RPC</p>
                <p class="card-text text-muted small">${unsafeHTML(this.getTransactionsResponse)}</p>
            </div>
        </div>
        <div class="card mb-3">
            <div class="card-header">
                <a href="#" class="btn btn-sm btn-primary" @click=${this.getInfo}>Get Info</a>
                <a href="#" class="btn btn-sm btn-primary" @click=${this.setInfo}>Set Info</a>
            </div>
            <div class="card-body">
                <p class="card-text small">HTTPS Outcalls <-> Backend</p>
                <p class="card-text text-muted small">${unsafeHTML(this.getInfoResponse)}</p>
            </div>
        </div>
        <!--
        <div class="card mb-3">
            <div class="card-header">
                <a href="#" class="btn btn-sm btn-primary" @click=${this.testResSend}>Call Backend</a>
            </div>
            <div class="card-body">
                <p class="card-text small">Interact with Backend canister.</p>
                <p class="card-text text-muted small">${unsafeHTML(this.resSendResponse)}</p>
            </div>
        </div>
        <div class="card mb-3">
            <div class="card-header">Create Wallet - TON</div>
            <div class="card-body">
                <p class="card-text">@ton/ton</p>
                <a href="#" class="btn btn-light" @click=${this.createWallet}>Create Wallet</a>
            </div>
            <div class="card-footer text-muted small">${unsafeHTML(this.createWalletResponse)}</div>
        </div>
        -->
        <p class="text-muted">Dev Wallet: ${devWalletAddress}</p>
        `;
    }
}
