
# Peymate Demo Project

A demo project for Peymate including frontend(node.js, lit), backend(node.js, express) and ii.

## Installation

Install dfx first. https://internetcomputer.org/docs/current/developer-docs/getting-started/install

```bash
1) Install packages
npm i
2) Create express canister (Optional, for new or cache-removed project)
dfx canister create express
3) Build frontend
npm run build
4) Deploy/update canister
dfx deploy
```
## TON dev wallet 
Install TON wallet. You can use TONKeeper.https://tonkeeper.com/
Please update #19@src/frontend/index.ts with your wallet address.

## FAQ

#### Q1. While creating canister might encounter error "Caused by: Failed to create wallet
Caused by: Failed create canister call.
Caused by: Certificate is stale (over 240s). Is the computer's clock synchronized?"

Restart dfx using "dfx stop && dfx start --clean"

#### Q2. Response verification failed: Certification values not found

Please update #23@src/frontend/index.ts with your local ii canister url

