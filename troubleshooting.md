# Trouble Shooting

## Installation and Deployment

1. Install the IC SDK and then logout

    ```shell
    sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

    logout
    ```

2. Login to confirm the SDK has been installed and start dfx replica in background

    ```shell
    dfx --version

    dfx start --background --clean
    ```

3. Install necessary packages for CentOS 9

    ```shell
    sudo dnf install libunwind libunwind-dev
    ```

4. Install packages (before it use nvm to install nodejs v20)

    ```shell
    npm i
    ```

5. Create express canister (Optional, for new or cache-removed project)

    ```shell
    dfx canister create express
    ```

6. Build frontend

    ```shell
    npm run build
    ```

7. Deploy/update canister

    ```shell
    dfx deploy
    ```

## Integration with NestJS

1. There are some packages of NestJS that can't be used by Azle

    ```shell
    dfx deploy

    Deploying all canisters.
    All canisters have already been created.
    Building canisters...
    Executing 'node_modules/.bin/azle compile express'
    ...
    Error: Build failed with 4 errors:
    node_modules/@nestjs/core/nest-application.js:19:115: ERROR: Could not resolve "@nestjs/websockets/socket-module"
    node_modules/@nestjs/core/nest-application.js:20:132: ERROR: Could not resolve "@nestjs/microservices/microservices-module"
    node_modules/@nestjs/core/nest-application.js:123:128: ERROR: Could not resolve "@nestjs/microservices"
    node_modules/@nestjs/core/nest-factory.js:57:128: ERROR: Could not resolve "@nestjs/microservices"
    ...
    ```

    Modify dfx.json by adding property "esm_externals" to exclude the unwanted packages

    ```json
    {
      "canisters": {
        "api": {
          "type": "azle",
          "main": "src/api.ts",
          "custom": {
            "experimental": true,
            "candid_gen": "http",
    +       "esm_externals": ["@nestjs/microservices", "@nestjs/websockets"]
          }
        }
      }
    }
    ```
