# all-notion-site

A tool to fetch and parse Notion site sitemaps into JSON format.

## Features

- Automatically fetches Notion public sitemap XML files
- Converts to JSON format
- Splits data into 1000-entry chunks for handling large datasets

## Requirements

- Node.js
- pnpm

## Installation

```bash
git clone https://github.com/fa0311/all-notion-site.git
cd all-notion-site
pnpm install
```

## Usage

### Development Mode

```bash
pnpm dev
```

### Build and Run

```bash
pnpm build
pnpm start
```

## Output Format

Running the tool generates files in the `output/` directory:

- `output/raw/` - Original XML files fetched from Notion
- `output/all/notion-site-sitemap.json` - Combined JSON file with all entries
- `output/chunks/notion-site-sitemap-{n}.json` - JSON files split into chunks of 1000 entries

Each entry is formatted as:

```json
{
  "loc": "https://example.notion.site/...",
  "lastmod": "2024-01-01"
}
```

## License

MIT
