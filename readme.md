
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
    
## FAQ

#### Q1. While opening frontend web page some might encounter error "Response verification failed: Certification values not found"

Restart dfx using "dfx stop && dfx start --background --clean"

#### Q2.

Answer 2

