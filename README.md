# local-aws-api-gateway

This is a simple tool to emulate AWS API Gateway locally. It supports both `REST` and `Web Socket` APIs.

The main goal is let you develop your AWS Lambda functions locally without any dependencies.

## Pre-requisites

You have to use ES6 modules in your Lambda functions.

package.json

```json
{
  ...
  "type": "module",
  ...
}
``
```

## Install

```
npm install --global local-aws-api-gateway
```

## Usage

### REST API

Mapping.js
```javascript
import { handler as helloHandler } from "./Lambda.js";

export const REST_MAPPINGS = [
  {
    method: "GET",
    path: "/hello/{name}",
    handler: helloHandler
  }
];
```

Lambda.js
```javascript
export async function handler(event) {
  const name = event.pathParameters.name;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: `${name}, Hello World!` })
  };
}
```

#### Run
```
local-aws-api-gateway Mapping.js
```

#### Test
Access to http://localhost:8080/hello/John

### Web Socket API

Mapping.js
```javascript
import { handler as wsConnectHandler } from "./WsLambdaConnect.js";

export const WS_MAPPINGS = [
  {
    path: "/",
    handlers: {
      $connect: wsConnectHandler,
      $disconnect: ...,
      $default: ...,
      custom: ...
    }
  }
];
```

WsLambdaConnect.js
```javascript
import * as AWS from "@aws-sdk/client-apigatewaymanagementapi";
const client = new AWS.ApiGatewayManagementApi({ region: "REGION", endpoint: "http://localhost:8080" });

export async function handler(event) {
  const connectionId = event.requestContext.connectionId;

  await client.postToConnection({
    ConnectionId: connectionId,
    Data: "Hello World!"
  });

  return {
    statusCode: 200
  };
}
```

**NOTE**: You need to set any region and the endpoint must be `http://localhost:8080` when you use `ApiGatewayManagementApi` in Web Socket API.

#### Run
```
local-aws-api-gateway Mapping.js
```

#### Test

You can use [wscat](https://www.npmjs.com/package/wscat) to test Web Socket API.

````
wscat -c ws://localhost:8080
````

### Both REST and Web Socket API

Mapping.js
```javascript
export const REST_MAPPINGS = [
  ...
]

export const WS_MAPPINGS = [
  ...
]
```

#### Run
```
local-aws-api-gateway Mapping.js
```

### Use another port

```
PORT=8888 local-aws-api-gateway Mapping.js
```

### Use your environment variables

.env
```
DATABASE=localhost
USERNAME=root
PASSWORD=password
```

#### Run

```
local-aws-api-gateway Mapping.js
```