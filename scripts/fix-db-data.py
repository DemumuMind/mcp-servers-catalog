import json, sqlite3, sys

DB_PATH = '.turso/local.db'
BATCH3_PATH = 'scripts/mcp-servers-batch3.json'

REAL_OFFICIAL = set([
    'github/github-mcp-server', 'openai/codex-mcp-server', 'cloudflare/mcp-server-cloudflare',
    'langchain-ai/langchain-mcp-adapters', 'modelcontextprotocol/server-git',
    'modelcontextprotocol/server-filesystem', 'modelcontextprotocol/server-memory',
    'modelcontextprotocol/server-fetch', 'modelcontextprotocol/server-sqlite',
    'modelcontextprotocol/server-postgres', 'modelcontextprotocol/server-brave-search',
    'modelcontextprotocol/server-puppeteer', 'modelcontextprotocol/server-google-drive',
    'modelcontextprotocol/server-google-maps', 'modelcontextprotocol/server-slack',
    'modelcontextprotocol/server-discord', 'modelcontextprotocol/server-gmail',
    'modelcontextprotocol/server-gitlab', 'modelcontextprotocol/server-everything',
    'modelcontextprotocol/server-sequentialthinking',
    'awslabs/mcp', 'azure/azure-mcp', 'stripe/mcp-server-stripe',
    'huggingface/mcp-server-hf', 'mem0ai/mem0-mcp',
    'supabase-community/supabase-mcp', 'neondatabase/mcp-server-neon',
    'upstash/context7', 'makenotion/notion-mcp-server',
    'googleapis/mcp-toolbox', 'brave/brave-search-mcp-server',
    'firebase/mcp', 'prefecthq/fastmcp',
    'microsoft/playwright-mcp', 'redis/mcp-redis',
    'qdrant/mcp-server-qdrant', 'clickhouse/mcp-clickhouse',
    'prisma/mcp', 'mongodb-js/mongodb-mcp-server',
    'firecrawl/mcp', 'exa-labs/exa-mcp-server',
])

REAL_REMOTE = set([
    'neondatabase/mcp-server-neon', 'supabase-community/supabase-mcp',
    'redis/mcp-redis', 'qdrant/mcp-server-qdrant', 'clickhouse/mcp-clickhouse',
    'exa-labs/exa-mcp-server', 'firecrawl/mcp', 'cloudflare/mcp-server-cloudflare',
    'upstash/context7', 'brave/brave-search-mcp-server', 'tinybirdco/mcp-tinybird',
    'makenotion/notion-mcp-server', 'googleapis/mcp-toolbox', 'firebase/mcp',
    'browserbase/mcp-server-browserbase', 'hyperbrowserai/mcp',
    'e2b-dev/code-interpreter-mcp', 'browsermcp/mcp',
    'pipedreamhq/pipedream', 'apify/actors-mcp-server',
    'luminati-io/brightdata-mcp', 'stripe/mcp-server-stripe',
    'azure/azure-mcp', 'awslabs/mcp',
    'googlecloudplatform/cloud-run-mcp', 'tinybirdco/mcp-tinybird',
    'gannonh/firebase-mcp', 'hashicorp/terraform-mcp-server',
    'pulumi/mcp-server', 'stackloklabs/mkp',
])

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# 1. Update tags from cleaned batch3
batch3 = json.load(open(BATCH3_PATH))
slug_to_data = {s['fullSlug']: s for s in batch3}
c.execute('SELECT id, fullSlug, tags FROM Server')
rows = c.fetchall()
tags_updated = 0
for sid, slug, old_tags_json in rows:
    if slug in slug_to_data:
        new_tags = json.dumps(slug_to_data[slug]['tags'])
        if new_tags != old_tags_json:
            c.execute('UPDATE Server SET tags = ? WHERE id = ?', (new_tags, sid))
            tags_updated += 1
print(f'Tags updated: {tags_updated}')

# 2. Fix isOfficial - only real official servers
c.execute('UPDATE Server SET isOfficial = 0')
for slug in REAL_OFFICIAL:
    c.execute('UPDATE Server SET isOfficial = 1 WHERE fullSlug = ?', (slug,))
c.execute('SELECT COUNT(*) FROM Server WHERE isOfficial = 1')
print(f'Official: {c.fetchone()[0]}')

# 3. Fix isRemote - only real remote servers
c.execute('UPDATE Server SET isRemote = 0')
for slug in REAL_REMOTE:
    c.execute('UPDATE Server SET isRemote = 1 WHERE fullSlug = ?', (slug,))
c.execute('SELECT COUNT(*) FROM Server WHERE isRemote = 1')
print(f'Remote: {c.fetchone()[0]}')

# 4. Fix isSponsored - reset all
c.execute('UPDATE Server SET isSponsored = 0')

# 5. Fix featured - only keep for real high-star servers
c.execute('UPDATE Server SET featured = 0')
FEATURED = [
    'github/github-mcp-server', 'openai/codex-mcp-server', 'cloudflare/mcp-server-cloudflare',
    'langchain-ai/langchain-mcp-adapters', 'upstash/context7', 'makenotion/notion-mcp-server',
    'googleapis/mcp-toolbox', 'prefecthq/fastmcp', 'awslabs/mcp', 'azure/azure-mcp',
    'huggingface/mcp-server-hf', 'microsoft/playwright-mcp', 'brave/brave-search-mcp-server',
    'firecrawl/mcp', 'exa-labs/exa-mcp-server', 'supabase-community/supabase-mcp',
    'neondatabase/mcp-server-neon', 'redis/mcp-redis', 'prisma/mcp',
    'modelcontextprotocol/server-memory', 'modelcontextprotocol/server-filesystem',
    'modelcontextprotocol/server-fetch', 'modelcontextprotocol/server-git',
]
for slug in FEATURED:
    c.execute('UPDATE Server SET featured = 1 WHERE fullSlug = ?', (slug,))
c.execute('SELECT COUNT(*) FROM Server WHERE featured = 1')
print(f'Featured: {c.fetchone()[0]}')

conn.commit()

# Final stats
c.execute('SELECT COUNT(*) FROM Server')
total = c.fetchone()[0]
c.execute('SELECT COUNT(*) FROM Server WHERE isOfficial = 1')
official = c.fetchone()[0]
c.execute('SELECT COUNT(*) FROM Server WHERE isRemote = 1')
remote = c.fetchone()[0]
c.execute('SELECT COUNT(*) FROM Server WHERE featured = 1')
featured = c.fetchone()[0]

print(f'\n=== FINAL STATS ===')
print(f'Total: {total}')
print(f'Official: {official}')
print(f'Remote: {remote}')
print(f'Featured: {featured}')

# Top tags
all_tags = {}
c.execute('SELECT tags FROM Server')
for row in c.fetchall():
    tags = json.loads(row[0]) if row[0] else []
    for t in tags:
        all_tags[t] = all_tags.get(t, 0) + 1
print(f'\nTop 20 tags:')
for t, cnt in sorted(all_tags.items(), key=lambda x: -x[1])[:20]:
    print(f'  {t}: {cnt}')

conn.close()
print('\nDone!')
