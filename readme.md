# DFX Canister Deployment

1. Install packages

    ```shell
    npm i
    ```

2. Create express canister (Optional, for new or cache-removed project)

    ```shell
    dfx canister create express
    ```

3. Build frontend

    ```shell
    npm run build
    ```

4. start dfx if not yet

    ```shell
    dfx start --background
    ```

5. Deploy/update canister

    ```shell
    dfx deploy
    ```
