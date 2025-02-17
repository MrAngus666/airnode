# @airnode/operation

> Development and testing utilities for Airnode

## Setup

This package is currently not intended to be used in a standalone way. Instead you can clone and setup the full monorepo by running the following commands:

```sh
# Install and link dependencies
yarn run bootstrap

# Build each @airnode package
yarn run build
```

## Dummy web API

An optional "dummy" web API is also included in this package. This API uses [express.js](https://github.com/expressjs/express) behind the scenes that exposes a few hardcoded endpoints. These endpoint are intended to only be used when developing Airnode and running E2E tests. The server can be controlled with the following commands:

```sh
# Start the API at http://localhost:5000
yarn run dev:api

# Start the API at http://localhost:5000 (in a background process)
yarn run dev:api:background
```

See [Managing background processes](#managing-background-processes) for more information on how to control background processes.

## Airnode Development

See below for more details

### tl;dr

```sh
# Start an Eth node at http://localhost:8545 (separate terminal)
yarn run dev:eth-node

# OR to start as a background process
yarn run dev:eth-node:background

# Deploy Airnode RRP with Airnode parameters, templates, requesters etc. This creates a "deployment" file in a deployments/ folder.
yarn run dev:eth-deploy

# Make requests for Airnode to action
yarn run dev:eth-requests

# Airnode can then be invoked to process the requests. You must have a valid node development setup in place. You can find instructions in the node package README.
yarn run dev:invoke
```

### Ethereum Development Node

Start an Ethereum development node by running:

```sh
yarn run dev:eth-node
```

By default, this node listens on `http://127.0.0.1:8545/`. This is important as you will need to use this value in your `config.json` when running the Airnode.

This development node uses [Hardhat](https://hardhat.org/) behind the scenes. It creates no contracts by itself and only pre-funds a (configurable) number of accounts/addresses.

### Deploying Airnode

After starting an Ethereum development node, you can deploy the Airnode RRP contracts to it by running:

```sh
yarn run dev:eth-deploy
```

Along with simply deploying the Airnode RRP contracts, the above command will also set Airnode parameters onchain, deploy client contracts, create request templates and authorizers and several other things. See [Configuration](#Configuration) below for more information on customizing this behaviour.

Running this command will build and save a "deployment" file in a `./deployments` folder. This file contains the addresses for the relevant accounts and contracts that are created. This is necessary as subsequent scripts do not have context of what these addresses and contracts are. You do not need to edit this file yourself.

It is important to note that the Ethereum development node uses the same master mnemonic which means that the contracts will be deployed to the same addresses after restarting the node.

### Making Requests

Now that the contracts have been deployed and initial data setup, you can create some requests by running:

```sh
yarn run dev:eth-requests
```

A deployment file (`evm-dev.json`) must be present in the deployments folder before running this script.

Airnode can now be invoked which will cause these requests to be actioned.

## Configuration

### Configuring deployment

Deployment can be configured by adjusting the `config/eth-dev-config.json` file. This file has the following top level structure:

```json
{
  "airnodes": { ... },
  "authorizers": { ... },
  "clients": { ... },
  "requesters": [],
  "requests": []
}
```

### 1. airnodes

`airnodes` must have a unique name as the key.

`mnemonic` - must be a unique 12 or 24 list of dictionary words. You can generate a mnemonic [here](https://iancoleman.io/bip39/). This mnemonic is used to derive the Airnode's master wallet. The master wallet address also serves as the Airnode admin address. **DO NOT SEND REAL FUNDS TO A WALLET LINKED TO A TEST MNEMONIC**

**Endpoints**

`endpoints` - a key/value object where the key is the unique endpoint name and the value is an object describing the endpoint details. Casing matters here as the endpoint is encoded and hashed to generate the `endpointId`.

`endpoints.[name].authorizers` - a list of `authorizer` contracts. The values must correspond to a value defined in the `authorizers` top-level field.

`endpoints.[name].oisTitle` - the title of an [OIS](https://github.com/api3dao/api3-docs/blob/master/airnode/ois.md). This is used to derive the [endpointId](https://github.com/api3dao/api3-docs/blob/master/request-response-protocol/endpoint.md) which should match an `endpointId` in a [config.json trigger](https://github.com/api3dao/api3-docs/blob/master/airnode/config-json.md)

**Templates**

`templates` - a key/value object where the key is the unique template name and the value is the template object.

`templates.[name].endpoint` - a unique name given to the endpoint. Casing is important here

`templates.[name].oisTitle` - the title of an [OIS](https://github.com/api3dao/api3-docs/blob/master/airnode/ois.md). This is used to derive the [endpointId](https://github.com/api3dao/api3-docs/blob/master/request-response-protocol/endpoint.md) which should match an `endpointId` in a [config.json trigger](https://github.com/api3dao/api3-docs/blob/master/airnode/config-json.md)

`templates.[name].parameters` - a list of parameters that be encoded directly using [airnode-abi](https://github.com/api3dao/airnode/tree/master/packages/airnode-abi)

### 2. authorizers

`authorizers` is a key/value object where the key represents the unique authorizer name and the value is either an existing address or a string name of an existing authorizer contract. Values beginning with `0x` will not be deployed, while all other values will require a contract of the same name. See the [Authorizer documentation](https://github.com/api3dao/api3-docs/blob/master/request-response-protocol/authorizer.md) for more details.

### 3. clients

`clients` - a key/value object where the key represents the unique client contract name and the value represents the client options. All names defined correspond with actual contracts in the `contracts/folder`. See the [client documentation](https://github.com/api3dao/api3-docs/blob/master/request-response-protocol/client.md) for more details.

`client.[name].endorsers` - a list of requesters who have endorsed the client. See the [endorsement documentation](https://github.com/api3dao/api3-docs/blob/master/request-response-protocol/endorsement.md) for more details.

### 4. requesters

Requesters represent an ordered list of entities making requests to a given Airnode. Typically these would be individuals or businesses. You can find more information in the [Requester documentation](https://github.com/api3dao/api3-docs/blob/master/request-response-protocol/requester.md).

It is important to note that requesters is an array as they are assigned accounts in order. This is necessary as requesters need to use the same wallet when running each script.

Each requester object has the following structure:

`id` - a unique string that can be used to identify the same requester between script runs

`airnodes.[name].ethBalance` - a string value that represents how much ETH should be deposited into the requester's designated wallet for the given Airnode. Requesters have one designated wallet per Airnode.

### 5. requests

There are currently three types of requests that can be made. You can learn more about these request types in the [request documentation](https://github.com/api3dao/api3-docs/blob/master/request-response-protocol/request.md)

**Shared Fields**

`requesterId` - the ID for the requester making

`type` - "regular" or "full"

`airnode` - the name of the Airnode

**Regular Requests**

`client` - the name of the client contract

`template` - the name of the template

`fulfillFunctionName` - the name of the function to call when a fulfill transaction is submitted. Typically this would be `fulfill` or similar.

`parameters` - parameters that can be encoded directly using [airnode-abi](https://github.com/api3dao/airnode/tree/master/packages/airnode-abi)

**Full Requests**

`client` - the name of the client contract

`endpoint` - the name of the endpoint for the specific Airnode

`fulfillFunctionName` - the name of the function to call when a fulfill transaction is submitted. Typically this would be `fulfill` or similar.

`oisTitle` - the title of an [OIS](https://github.com/api3dao/api3-docs/blob/master/airnode/ois.md). This is used to derive the [endpointId](https://github.com/api3dao/api3-docs/blob/master/request-response-protocol/endpoint.md) which should match an `endpointId` in a [config.json trigger](https://github.com/api3dao/api3-docs/blob/master/airnode/config-json.md)

`parameters` - parameters that can be encoded directly using [airnode-abi](https://github.com/api3dao/airnode/tree/master/packages/airnode-abi)

**Withdrawals**

`destination` - the ID of the requester to which the withdrawn funds should be sent. Can also be an address starting with `0x`.

#### Full Example

```json
{
  "airnodes": {
    "CurrencyConverterAPI": {
      "mnemonic": "achieve climb couple wait accident symbol spy blouse reduce foil echo label",
      "endpoints": {
        "convertToUSD": {
          "authorizers": ["public"],
          "oisTitle": "currency-converter-api"
        }
      },
      "templates": {
        "template-1": {
          "endpoint": "convertToUSD",
          "oisTitle": "currency-converter-api",
          "parameters": [
            { "type": "bytes32", "name": "to", "value": "USD" },
            { "type": "bytes32", "name": "_type", "value": "int256" },
            { "type": "bytes32", "name": "_path", "value": "result" },
            { "type": "bytes32", "name": "_times", "value": "100000" }
          ]
        }
      }
    }
  },
  "authorizers": {
    "public": "0x0000000000000000000000000000000000000000"
  },
  "clients": {
    "MockAirnodeRrpClient": { "endorsers": ["bob"] }
  },
  "requesters": [
    {
      "id": "alice",
      "airnodes": {
        "CurrencyConverterAPI": { "ethBalance": "1" }
      }
    },
    {
      "id": "bob",
      "airnodes": {
        "CurrencyConverterAPI": { "ethBalance": "5" }
      }
    }
  ],
  "requests": [
    {
      "requesterId": "bob",
      "type": "regular",
      "airnode": "CurrencyConverterAPI",
      "template": "template-1",
      "client": "MockAirnodeRrpClient",
      "fulfillFunctionName": "fulfill",
      "parameters": [
        { "type": "bytes32", "name": "from", "value": "ETH" }
      ]
    },
    {
      "requesterId": "bob",
      "type": "full",
      "airnode": "CurrencyConverterAPI",
      "endpoint": "convertToUSD",
      "oisTitle": "currency-converter-api",
      "client": "MockAirnodeRrpClient",
      "fulfillFunctionName": "fulfill",
      "parameters": [
        { "type": "bytes32", "name": "from", "value": "ETH" },
        { "type": "bytes32", "name": "to", "value": "USD" },
        { "type": "bytes32", "name": "_type", "value": "int256" },
        { "type": "bytes32", "name": "_path", "value": "result" },
        { "type": "bytes32", "name": "_times", "value": "100000" }
      ]
    },
    {
      "requesterId": "alice",
      "type": "withdrawal",
      "airnode": "CurrencyConverterAPI",
      "destination": "alice"
    }
  ]
}
```

## Managing background processes

Background processes are managed using [PM2](https://pm2.keymetrics.io/). The configuration for PM2 can be found in the `ecosystem.config.js` file. This file also controls where logs for background processes are output. By default, they will be output to a `logs/` folder within the operation package.

Background processes can be controlled using the following commands:

```sh
# List existing background processes and their current statuses
yarn run dev:list

# Start both the Ethereum node and the dummy API as background processes
yarn run dev:background

# Remove any existing log files
yarn run dev:clean

# Stop any background processes
yarn run dev:stop

# Delete any lingering background processes
yarn run dev:delete
```
