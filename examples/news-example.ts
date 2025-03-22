/**
 * Example of using MCP news tools
 * 
 * This example demonstrates how to use the fetch-news and analyze-news tools
 * to retrieve and analyze news content from online sources.
 */
import { Client } from "@modelcontextprotocol/sdk/client";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse";

async function main() {
  // Connect to the MCP server
  console.log("Connecting to MCP server...");
  const transport = new SSEClientTransport("http://localhost:3501/sse", "http://localhost:3501/message");
  const client = new Client();
  
  try {
    await client.connect(transport);
    console.log("Connected to MCP server");
    
    // Fetch news from wp.pl
    console.log("\nFetching news from wp.pl...");
    const newsResult = await client.tools.execute("fetch-news", {
      source: "wp.pl",
      count: 5
    });
    
    console.log(`Fetched ${newsResult.items.length} news items from ${newsResult.source}`);
    
    // Print the news items
    newsResult.items.forEach((item, index) => {
      console.log(`\n[${index + 1}] ${item.title}`);
      console.log(`    Category: ${item.category || 'Unknown'}`);
      console.log(`    Summary: ${item.summary || 'No summary available'}`);
    });
    
    // Analyze the news
    console.log("\nAnalyzing news items...");
    
    // Example 1: Generate a summary
    const summaryResult = await client.tools.execute("analyze-news", {
      newsItems: newsResult.items,
      analysisType: "summary"
    });
    
    console.log("\nSummary Analysis:");
    console.log(summaryResult.analysis);
    
    if (summaryResult.topics) {
      console.log("\nDetected Topics:");
      summaryResult.topics.forEach(topic => console.log(`- ${topic}`));
    }
    
    // Example 2: Analyze sentiment
    const sentimentResult = await client.tools.execute("analyze-news", {
      newsItems: newsResult.items,
      analysisType: "sentiment"
    });
    
    console.log("\nSentiment Analysis:");
    console.log(sentimentResult.analysis);
    
    if (sentimentResult.sentiment) {
      console.log(`\nSentiment Score: ${sentimentResult.sentiment.score}`);
      console.log(`Sentiment Label: ${sentimentResult.sentiment.label}`);
    }
    
    // Example 3: Extract entities
    const entitiesResult = await client.tools.execute("analyze-news", {
      newsItems: newsResult.items,
      analysisType: "entities"
    });
    
    console.log("\nEntity Analysis:");
    console.log(entitiesResult.analysis);
    
    if (entitiesResult.entities) {
      console.log("\nExtracted Entities:");
      entitiesResult.entities.forEach(entity => console.log(`- ${entity}`));
    }
    
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