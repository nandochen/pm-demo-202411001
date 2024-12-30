1) Install packages
npm i
2) Create express canister (Optional, for new or cache-removed project)
dfx canister create express
3) Build frontend
npm run build
4) Deploy/update canister
dfx deploy

FAQ
Q: While opening frontend web page some might encounter error "Response verification failed: Certification values not found"
A: Restart dfx using "dfx stop && dfx start --background --clean"
