# MCP Server Prompt Examples

This document contains example prompts for interacting with the Transcripter MCP server through Cursor Chat or other compatible clients.

## News Retrieval and Analysis

### Example 1: Fetch Recent News from Polish Website

```prompt
Fetch the latest news from wp.pl using the 'fetch-news' MCP tool and summarize the main headlines. Present the results in a concise format that highlights the top stories.
```

This prompt uses the `fetch-news` tool to retrieve recent headlines from wp.pl and formats them for easy reading.

### Example 2: News Analysis and Topic Extraction

```prompt
Use the MCP 'fetch-news' tool to get 5 news items from wp.pl, then pass them to the 'analyze-news' tool to identify the main topics, entities, and sentiment. Present a comprehensive analysis of the current news landscape in Poland.
```

This more complex prompt demonstrates a multi-step workflow:
1. Fetching news from wp.pl
2. Processing the news through the analysis tool
3. Extracting insights like topics, entities mentioned, and overall sentiment
4. Presenting a synthesized view of the current news landscape

## Transcription Tools

### Example 1: Searching for Specific Content in Transcriptions

```prompt
Use the MCP 'transcription-search' tool to find all transcriptions that mention "climate change" or "environmental policy", then extract key quotes from those transcriptions.
```

This prompt demonstrates how to use the search capabilities to find specific content across multiple transcriptions.

### Example 2: Generating Summaries for Long Transcriptions

```prompt
Find the longest transcription in the database using the 'transcription-search' tool, then use the 'transcription-summary' tool to create a concise summary with key points.
```

This shows how to chain multiple tools together to find and process specific transcriptions.

## API Testing

### Example: Testing the Transcription API

```prompt
Use the MCP 'test-api' tool to check if the transcription API endpoint is working correctly. Test both the GET and POST methods, and verify the response format.
```

This prompt demonstrates how to use the API testing capabilities to validate backend functionality.

## Resource Access

### Example: Accessing Transcription and Analysis Data

```prompt
Retrieve transcription resource at 'transcription://123' and its associated analysis at 'analysis://456', then compare the content to verify consistency.
```

This prompt shows how to access specific resources by their URI and perform comparisons between them.

## Combined Workflows

### Example: End-to-End Transcription Processing

```prompt
Use the MCP tools to:
1. Search for a transcription about "artificial intelligence"
2. Generate a summary of that transcription
3. Test the API to ensure the summary can be saved
4. Access the analysis resource to verify it was stored correctly
```

This complex prompt demonstrates a complete workflow that combines multiple tools and resources.

---

These prompts can be modified and combined to create custom workflows for different use cases. The MCP server provides a flexible interface for interacting with the Transcripter system through natural language requests.