# Troubleshooting

## Installed dfx version 0.24.3 and encountered problems in frontend

In some OS we may run into trouble with version 0.24.3, it could be resolved by downgrading the dfx version to 0.23.0.

The following are the steps:

1. Stop dfx if it's running

    ```bash
    dfx stop
    ```

    If it stucks, then run

    ```bash
    dfx killall
    ```

2. Uninstall dfx version 0.24.3

    ```bash
    dfxvm uninstall 0.24.3
    ```

3. Install the specified dfx version 0.23.0

    ```bash
    DFX_VERSION=0.23.0 sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
    ```

4. Remove folders ".azle", ".dfx" in the project

5. Remove the package Azle in the project

    ```bash
    npm remove azle
    ```

6. Reinstall the package Azle

    ```bash
    npm install azle
    ```

7. Start dfx service

    ```bash
    dfx start --clean --background
    ```

    **The option "--clean" is important**

8. Create the canister "express"

    ```bash
    dfx canister create express
    ```

9. Build the frontend

    ```bash
    npm run build
    ```

10. Deploy the canisters

    ```bash
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
