# Browser MCP Setup Guide

This project supports [Browser MCP](https://browsermcp.io/) for browser automation and interaction.

## Prerequisites

- [Node.js](https://nodejs.org/) installed.
- A supported IDE (Cursor, VS Code, Windsurf) or Claude Desktop.

## Setup Instructions

### 1. Install the Extension

Install the **Browser MCP** extension for your browser (Chrome/Edge/Brave/Arc) from the [Chrome Web Store](https://browsermcp.io/install).

### 2. Configure the MCP Server

Add the following configuration to your MCP settings file (e.g., `~/.cursor/mcp.json` or via IDE settings):

```json
{
  "mcpServers": {
    "browsermcp": {
      "command": "npx",
      "args": ["@browsermcp/mcp@latest"]
    }
  }
}
```

### 3. Connect

1. Open the Browser MCP extension in your browser.
2. Click **Connect**.
3. The server should now be able to control your browser tab.

## Running via Script

You can also run the MCP server manually using the helper script added to this project:

```bash
npm run mcp:browser
```
