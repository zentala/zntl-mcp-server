NEVER MOFIY THIS FILE.
THIS IS PRODUCT OWNER VISION. 

# 2025/03/23 

* Lets use Winston for logging. 
* Lets use typescript and budil atuoamgically 
* I want our serverr to be MCP SSE.

```md
### HTTP with SSE

[](https://github.com/modelcontextprotocol/typescript-sdk?tab=readme-ov-file#http-with-sse)

For remote servers, start a web server with a Server-Sent Events (SSE) endpoint, and a separate endpoint for the client to send its messages to:

import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const server \= new McpServer({
  name: "example-server",
  version: "1.0.0"
});

// ... set up server resources, tools, and prompts ...

const app \= express();

app.get("/sse", async (req, res) \=> {
  const transport \= new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

app.post("/messages", async (req, res) \=> {
  // Note: to support multiple simultaneous connections, these messages will
  // need to be routed to a specific matching transport. (This logic isn't
  // implemented here, for simplicity.)
  await transport.handlePostMessage(req, res);
});

app.listen(3001);
```


* I want this server features to be covered in tests.
* I want you to be descriptive in how you code - self descritive, use formats CodeAct, XMLs, TSDocs, markdown summaries, utf8 icons, [DDD untiqous language](./DDD.md).

*  Can you expose some commands based on path of codespace project pagh?
* I wold like to read from workpace or repo main dir or smth file `.mcp.json` i jesli on tam jest to on moze zmapowac np 
{
    "commands": [
        {
            cmd: "run UI components client test",
            cwd: "./workspaces/packages/client/"
            sh: "pnpm run ui:test"  
        },
        {
            cmd: "run GUI e2e integration test",
            cwd: "./workspaces/"
            sh: "pnpm run gui:test"  
        },
                {
            cmd: "run backend API e2e test",
            cwd: "./workspaces/packages/server/"
            sh: "pnpm run test"  
        }
    ]
}


wtedy mmozemy tak wystaiwac sobie z projektu do servera mpcc nowe narzedzia, co wiecej one sa dosptent ylko w scope danego porjektu. 
chce aby wykrywalo .mpc.json z katlagu clienta i zwracalo jego contnet do narzezdzia, a naerdzie go logowalo. czykki aby narzedzie mialo dostep do konfiga z pliku z katlogu glownego z jakiego rpo jest opalone