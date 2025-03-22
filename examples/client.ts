/**
 * Example client for the MCP server
 */
import { Client } from "@modelcontextprotocol/sdk/client";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse";

async function main() {
  // Connect to the MCP server
  console.log("Connecting to MCP server...");
  const transport = new SSEClientTransport("http://localhost:3500/sse", "http://localhost:3500/message");
  const client = new Client();
  
  try {
    await client.connect(transport);
    console.log("Connected to MCP server");
    
    // Show server info
    const serverInfo = client.info;
    console.log("Server info:", serverInfo);

    // List available tools
    const tools = await client.tools.list();
    console.log("Available tools:", tools);
    
    // Use the test-api tool
    console.log("\nTesting API endpoint...");
    const apiResult = await client.tools.execute("test-api", {
      endpoint: "transcriptions",
      method: "GET",
    });
    console.log("API test result:", apiResult);
    
    // Use the transcription-search tool
    console.log("\nSearching transcriptions...");
    const searchResult = await client.tools.execute("transcription-search", {
      tags: ["demo"],
      page: 1,
      pageSize: 5,
    });
    console.log("Search result:", searchResult);
    
    // Use the transcription-summary tool
    console.log("\nGenerating transcription summary...");
    const summaryResult = await client.tools.execute("transcription-summary", {
      transcriptionId: 1,
      model: "gpt-4",
      options: {
        extractKeyPoints: true,
      },
    });
    console.log("Summary result:", summaryResult);
    
    // Get a transcription resource
    console.log("\nFetching transcription resource...");
    const transcription = await client.resources.get("transcription://1");
    console.log("Transcription resource:", transcription);
    
    // Get an analysis resource
    console.log("\nFetching analysis resource...");
    const analysis = await client.resources.get("analysis://1");
    console.log("Analysis resource:", analysis);
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close the connection
    client.close();
    console.log("\nConnection closed");
  }
}

// Run the example
main().catch(console.error);