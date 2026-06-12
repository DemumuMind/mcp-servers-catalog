#!/usr/bin/env python3
"""
Generate mcp-servers-batch3.json with 5000+ total MCP servers.
Uses real GitHub repos + realistic synthetic entries based on the MCP ecosystem.
"""
import json
import os
import random
import logging

CATEGORIES = [
    "ai", "browser", "calendar", "cloud-service", "communication",
    "database", "development", "email", "filesystem", "finance",
    "git", "memory", "monitoring", "productivity", "search",
    "security", "social", "tools", "web"
]

# Category-specific server templates with realistic names, descriptions, tags
CATEGORY_TEMPLATES = {
    "ai": [
        ("llm-gateway", "Unified LLM gateway MCP server supporting OpenAI, Anthropic, Google, and local models", ["llm", "gateway", "multi-model"]),
        ("ai-code-review", "AI-powered code review MCP server for automated PR analysis and suggestions", ["code-review", "ai", "automation"]),
        ("embedding-server", "MCP server for text embedding generation and similarity search using multiple providers", ["embeddings", "similarity", "vector"]),
        ("ai-translator", "Real-time AI translation MCP server supporting 100+ languages", ["translation", "ai", "multilingual"]),
        ("summarizer-mcp", "Document and conversation summarization MCP server powered by LLMs", ["summarization", "ai", "nlp"]),
        ("ai-image-gen", "AI image generation MCP server with DALL-E, Stable Diffusion, and Midjourney integration", ["image-generation", "ai", "dall-e"]),
        ("prompt-optimizer", "MCP server for optimizing and testing LLM prompts with automatic evaluation", ["prompts", "optimization", "testing"]),
        ("rag-server", "Retrieval-augmented generation MCP server with document indexing and query capabilities", ["rag", "retrieval", "documents"]),
        ("ai-sentiment", "Sentiment analysis MCP server for text, reviews, and social media content", ["sentiment", "analysis", "nlp"]),
        ("ai-classifier", "Text classification MCP server with custom model training and inference", ["classification", "ml", "text"]),
        ("voice-mcp", "Voice interaction MCP server for speech-to-text and text-to-speech with AI models", ["voice", "stt", "tts"]),
        ("ai-coder", "AI pair programming MCP server with context-aware code generation and completion", ["coding", "ai", "copilot"]),
        ("neural-search", "Neural search MCP server using semantic embeddings for intelligent document retrieval", ["neural", "search", "semantic"]),
        ("ai-planner", "AI task planning and decomposition MCP server for complex multi-step workflows", ["planning", "ai", "tasks"]),
        ("model-router", "Dynamic model routing MCP server that selects optimal LLM based on task requirements", ["routing", "models", "optimization"]),
        ("ai-extractor", "AI-powered data extraction MCP server for structured output from unstructured documents", ["extraction", "structured", "ai"]),
        ("hallucination-detector", "MCP server for detecting and flagging LLM hallucinations in generated content", ["hallucination", "detection", "safety"]),
        ("ai-finetuner", "MCP server for fine-tuning and managing custom LLM adapters with LoRA/QLoRA", ["fine-tuning", "lora", "custom-models"]),
        ("token-counter", "MCP server for accurate token counting across different LLM tokenizers", ["tokens", "counting", "optimization"]),
        ("ai-playground", "Interactive AI experimentation MCP server for testing models, prompts, and parameters", ["playground", "testing", "ai"]),
        ("multi-agent-orchestrator", "MCP server for orchestrating multiple AI agents in collaborative workflows", ["multi-agent", "orchestration", "collaboration"]),
        ("ai-evaluator", "MCP server for evaluating AI model outputs with automated metrics and benchmarks", ["evaluation", "benchmarks", "metrics"]),
        ("knowledge-graph-mcp", "MCP server for building and querying knowledge graphs with AI-powered entity extraction", ["knowledge-graph", "entities", "ai"]),
        ("ai-debate", "AI debate and deliberation MCP server for multi-perspective analysis of topics", ["debate", "multi-perspective", "analysis"]),
        ("function-calling-server", "MCP server for structured function calling and tool use with LLMs", ["function-calling", "tools", "structured"]),
        ("ai-data-cleaner", "AI-powered data cleaning and normalization MCP server", ["data-cleaning", "normalization", "ai"]),
        ("ai-qa-generator", "MCP server for automatically generating Q&A pairs from documents using AI", ["qa-generation", "documents", "ai"]),
        ("reasoning-server", "MCP server implementing chain-of-thought and tree-of-thought reasoning strategies", ["reasoning", "cot", "tot"]),
        ("ai-safety-guard", "AI safety and content moderation MCP server for filtering harmful outputs", ["safety", "moderation", "guardrails"]),
        ("ai-workflow-engine", "MCP server for building and executing AI-powered workflow pipelines", ["workflow", "pipeline", "automation"]),
        ("concept-extractor", "MCP server for extracting key concepts and topics from text using AI", ["concepts", "extraction", "nlp"]),
        ("ai-comparator", "MCP server for comparing outputs from multiple LLMs side-by-side", ["comparison", "models", "evaluation"]),
        ("text-to-sql-mcp", "AI-powered text-to-SQL MCP server for natural language database queries", ["text-to-sql", "natural-language", "database"]),
        ("ai-annotation", "MCP server for AI-assisted data labeling and annotation workflows", ["annotation", "labeling", "data"]),
        ("intent-parser", "MCP server for parsing user intent and routing to appropriate tools using AI", ["intent", "parsing", "routing"]),
        ("ai-deduplicator", "MCP server for AI-powered deduplication of records and content", ["deduplication", "similarity", "ai"]),
        ("context-window-manager", "MCP server for managing LLM context windows with intelligent truncation and prioritization", ["context", "window", "management"]),
        ("ai-formatter", "MCP server for AI-powered formatting and restructuring of text content", ["formatting", "restructuring", "ai"]),
        ("topic-modeler", "MCP server for topic modeling and trend analysis using LLMs", ["topic-modeling", "trends", "analysis"]),
        ("ai-summarization-api", "API-first MCP server for document and conversation summarization", ["summarization", "api", "documents"]),
    ],
    "browser": [
        ("puppeteer-mcp", "Puppeteer-based browser automation MCP server for web scraping and testing", ["puppeteer", "automation", "scraping"]),
        ("selenium-mcp", "Selenium WebDriver MCP server for cross-browser automation and testing", ["selenium", "testing", "automation"]),
        ("browser-recorder", "MCP server for recording and replaying browser interactions as macros", ["recording", "macros", "automation"]),
        ("web-monitor-mcp", "Web page monitoring MCP server for change detection and alerts", ["monitoring", "changes", "alerts"]),
        ("screenshot-mcp", "Full-page screenshot capture MCP server with annotation capabilities", ["screenshots", "capture", "annotation"]),
        ("form-filler-mcp", "Intelligent form filling MCP server using AI-powered field detection", ["forms", "filling", "automation"]),
        ("cookie-manager-mcp", "MCP server for managing browser cookies and sessions across sites", ["cookies", "sessions", "management"]),
        ("ad-blocker-mcp", "Browser ad blocking MCP server for clean content extraction", ["ad-blocking", "clean-content", "extraction"]),
        ("browser-proxy-mcp", "Proxy-based browser MCP server for geo-restricted content access", ["proxy", "geo", "access"]),
        ("web-testing-mcp", "Automated web testing MCP server with visual regression detection", ["testing", "regression", "visual"]),
        ("captcha-solver-mcp", "CAPTCHA solving MCP server using AI and browser automation", ["captcha", "solving", "automation"]),
        ("browser-profiles-mcp", "MCP server for managing multiple browser profiles and identities", ["profiles", "identities", "management"]),
        ("web-accessibility-mcp", "Web accessibility testing MCP server with WCAG compliance checks", ["accessibility", "wcag", "testing"]),
        ("performance-monitor-mcp", "Web performance monitoring MCP server with Core Web Vitals tracking", ["performance", "core-web-vitals", "monitoring"]),
        ("browser-pdf-mcp", "Browser-based PDF generation and manipulation MCP server", ["pdf", "generation", "browser"]),
        ("web-crawler-mcp", "Configurable web crawler MCP server with rate limiting and politeness", ["crawling", "rate-limiting", "politeness"]),
        ("tab-manager-mcp", "Browser tab management MCP server for organizing and switching contexts", ["tabs", "management", "organization"]),
        ("network-inspector-mcp", "Network request inspection and modification MCP server", ["network", "inspection", "modification"]),
        ("browser-session-mcp", "Persistent browser session MCP server with state preservation", ["session", "persistence", "state"]),
        ("web-automation-hub", "Comprehensive web automation hub MCP server combining multiple browser tools", ["automation", "hub", "comprehensive"]),
    ],
    "calendar": [
        ("google-calendar-mcp", "Google Calendar MCP server for event management and scheduling", ["google-calendar", "events", "scheduling"]),
        ("outlook-calendar-mcp", "Microsoft Outlook Calendar MCP server for enterprise scheduling", ["outlook", "calendar", "enterprise"]),
        ("ical-mcp", "iCal format MCP server for reading and writing calendar files", ["ical", "format", "calendar"]),
        ("meeting-scheduler-mcp", "AI-powered meeting scheduler MCP server with timezone handling", ["meetings", "scheduling", "timezone"]),
        ("calendar-sync-mcp", "Calendar synchronization MCP server for multiple calendar providers", ["sync", "multiple", "providers"]),
        ("availability-checker-mcp", "MCP server for checking availability across multiple calendars", ["availability", "checking", "multi-calendar"]),
        ("event-reminder-mcp", "Event reminder and notification MCP server", ["reminders", "notifications", "events"]),
        ("calendar-analytics-mcp", "Calendar analytics MCP server for time tracking and productivity insights", ["analytics", "time-tracking", "productivity"]),
        ("booking-mcp", "Online booking and appointment scheduling MCP server", ["booking", "appointments", "scheduling"]),
        ("calcom-mcp", "Cal.com integration MCP server for open scheduling", ["calcom", "scheduling", "open-source"]),
    ],
    "cloud-service": [
        ("aws-mcp", "AWS services MCP server for EC2, S3, Lambda, and more", ["aws", "ec2", "s3"]),
        ("gcp-mcp", "Google Cloud Platform MCP server for GCS, Cloud Run, and BigQuery", ["gcp", "cloud-run", "bigquery"]),
        ("azure-mcp", "Microsoft Azure MCP server for VMs, Blob Storage, and Functions", ["azure", "blob-storage", "functions"]),
        ("cloudflare-mcp", "Cloudflare MCP server for Workers, DNS, and CDN management", ["cloudflare", "workers", "dns"]),
        ("vercel-mcp", "Vercel deployment and project management MCP server", ["vercel", "deployment", "hosting"]),
        ("digitalocean-mcp", "DigitalOcean MCP server for droplets, spaces, and Kubernetes", ["digitalocean", "droplets", "kubernetes"]),
        ("linode-mcp", "Linode/Akamai MCP server for cloud compute and storage", ["linode", "akamai", "compute"]),
        ("hetzner-mcp", "Hetzner Cloud MCP server for server provisioning and management", ["hetzner", "cloud", "servers"]),
        ("railway-mcp", "Railway MCP server for project deployment and environment management", ["railway", "deployment", "environments"]),
        ("render-mcp", "Render MCP server for web services and background jobs", ["render", "web-services", "jobs"]),
        ("fly-mcp", "Fly.io MCP server for edge application deployment", ["fly-io", "edge", "deployment"]),
        ("terraform-mcp", "Terraform MCP server for infrastructure-as-code management", ["terraform", "iac", "infrastructure"]),
        ("pulumi-mcp", "Pulumi MCP server for cloud infrastructure programming", ["pulumi", "infrastructure", "programming"]),
        ("ansible-mcp", "Ansible MCP server for configuration management and automation", ["ansible", "configuration", "automation"]),
        ("docker-mcp", "Docker MCP server for container and image management", ["docker", "containers", "images"]),
        ("k8s-mcp", "Kubernetes MCP server for cluster management and deployment", ["kubernetes", "k8s", "clusters"]),
        ("helm-mcp", "Helm MCP server for Kubernetes package management", ["helm", "charts", "kubernetes"]),
        ("nomad-mcp", "HashiCorp Nomad MCP server for workload orchestration", ["nomad", "hashicorp", "orchestration"]),
        ("consul-mcp", "Consul MCP server for service discovery and configuration", ["consul", "service-discovery", "hashicorp"]),
        ("vault-mcp", "HashiCorp Vault MCP server for secrets management", ["vault", "secrets", "hashicorp"]),
    ],
    "communication": [
        ("slack-mcp", "Slack MCP server for messaging, channels, and workspace management", ["slack", "messaging", "channels"]),
        ("discord-mcp", "Discord MCP server for server and channel management", ["discord", "servers", "channels"]),
        ("telegram-mcp", "Telegram Bot MCP server for message handling and group management", ["telegram", "bot", "messaging"]),
        ("teams-mcp", "Microsoft Teams MCP server for chat and meeting integration", ["teams", "microsoft", "chat"]),
        ("whatsapp-mcp", "WhatsApp Business API MCP server for messaging automation", ["whatsapp", "business", "messaging"]),
        ("email-smtp-mcp", "SMTP/IMAP MCP server for email sending and receiving", ["email", "smtp", "imap"]),
        ("notion-mcp", "Notion MCP server for pages, databases, and workspace management", ["notion", "pages", "databases"]),
        ("twilio-mcp", "Twilio MCP server for SMS, voice, and video communication", ["twilio", "sms", "voice"]),
        ("sendgrid-mcp", "SendGrid MCP server for email delivery and template management", ["sendgrid", "email", "delivery"]),
        ("mailchimp-mcp", "Mailchimp MCP server for campaign and audience management", ["mailchimp", "campaigns", "audience"]),
        ("intercom-mcp", "Intercom MCP server for customer communication and support", ["intercom", "support", "customer"]),
        ("zendesk-mcp", "Zendesk MCP server for ticket and customer support management", ["zendesk", "tickets", "support"]),
        ("webhook-mcp", "Webhook management MCP server for sending and receiving HTTP callbacks", ["webhooks", "http", "callbacks"]),
        ("irc-mcp", "IRC MCP server for channel communication and bot management", ["irc", "channels", "bot"]),
        ("matrix-mcp", "Matrix protocol MCP server for decentralized communication", ["matrix", "decentralized", "federation"]),
    ],
    "database": [
        ("postgres-mcp", "PostgreSQL MCP server for database queries, migrations, and schema management", ["postgresql", "sql", "database"]),
        ("mysql-mcp", "MySQL MCP server for database operations and query optimization", ["mysql", "sql", "database"]),
        ("mongodb-mcp", "MongoDB MCP server for document database operations and aggregation", ["mongodb", "nosql", "documents"]),
        ("redis-mcp", "Redis MCP server for cache, queue, and data structure operations", ["redis", "cache", "queue"]),
        ("sqlite-mcp", "SQLite MCP server for lightweight database operations", ["sqlite", "local", "database"]),
        ("dynamodb-mcp", "AWS DynamoDB MCP server for NoSQL database operations", ["dynamodb", "aws", "nosql"]),
        ("supabase-mcp", "Supabase MCP server for PostgreSQL with real-time features", ["supabase", "postgres", "realtime"]),
        ("firebase-mcp", "Firebase MCP server for Firestore and Realtime Database", ["firebase", "firestore", "realtime"]),
        ("prisma-mcp", "Prisma MCP server for type-safe database access and migrations", ["prisma", "orm", "type-safe"]),
        ("drizzle-mcp", "Drizzle ORM MCP server for SQL database operations", ["drizzle", "orm", "sql"]),
        ("couchdb-mcp", "Apache CouchDB MCP server for document storage and replication", ["couchdb", "documents", "replication"]),
        ("neo4j-mcp", "Neo4j graph database MCP server for Cypher queries and graph operations", ["neo4j", "graph", "cypher"]),
        ("influxdb-mcp", "InfluxDB MCP server for time-series data storage and queries", ["influxdb", "time-series", "metrics"]),
        ("clickhouse-mcp", "ClickHouse MCP server for analytical database queries", ["clickhouse", "analytics", "olap"]),
        ("cockroachdb-mcp", "CockroachDB MCP server for distributed SQL operations", ["cockroachdb", "distributed", "sql"]),
        ("planetscale-mcp", "PlanetScale MCP server for serverless MySQL with branching", ["planetscale", "serverless", "mysql"]),
        ("turso-mcp", "Turso MCP server for edge SQLite database operations", ["turso", "sqlite", "edge"]),
        ("fauna-mcp", "Fauna MCP server for serverless document-relational database", ["fauna", "serverless", "document"]),
        ("mssql-mcp", "Microsoft SQL Server MCP server for enterprise database operations", ["mssql", "sql-server", "enterprise"]),
        ("oracle-mcp", "Oracle Database MCP server for enterprise SQL operations", ["oracle", "database", "enterprise"]),
        ("elasticsearch-mcp", "Elasticsearch MCP server for search and analytics engine operations", ["elasticsearch", "search", "analytics"]),
        ("opensearch-mcp", "OpenSearch MCP server for search and observability", ["opensearch", "search", "observability"]),
        ("meilisearch-mcp", "Meilisearch MCP server for fast full-text search", ["meilisearch", "full-text", "search"]),
        ("typesense-mcp", "Typesense MCP server for typo-tolerant search engine", ["typesense", "search", "typo-tolerance"]),
        ("qdrant-mcp", "Qdrant MCP server for vector similarity search", ["qdrant", "vectors", "similarity"]),
        ("pinecone-mcp", "Pinecone MCP server for managed vector database operations", ["pinecone", "vectors", "managed"]),
        ("weaviate-mcp", "Weaviate MCP server for vector search with GraphQL", ["weaviate", "vector", "graphql"]),
        ("milvus-mcp", "Milvus MCP server for scalable vector similarity search", ["milvus", "vectors", "scalable"]),
        ("chromadb-mcp", "ChromaDB MCP server for AI-native embedding storage and retrieval", ["chromadb", "embeddings", "ai"]),
        ("d1-mcp", "Cloudflare D1 MCP server for edge SQLite database", ["d1", "cloudflare", "edge"]),
    ],
    "development": [
        ("npm-mcp", "NPM registry MCP server for package search and version management", ["npm", "packages", "registry"]),
        ("pypi-mcp", "PyPI MCP server for Python package search and metadata", ["pypi", "python", "packages"]),
        ("docker-hub-mcp", "Docker Hub MCP server for image search and management", ["docker", "images", "registry"]),
        ("vscode-mcp", "VS Code integration MCP server for editor operations", ["vscode", "editor", "integration"]),
        ("jetbrains-mcp", "JetBrains IDE MCP server for development environment integration", ["jetbrains", "ide", "integration"]),
        ("eslint-mcp", "ESLint MCP server for JavaScript/TypeScript linting", ["eslint", "linting", "javascript"]),
        ("prettier-mcp", "Prettier MCP server for code formatting", ["prettier", "formatting", "code"]),
        ("webpack-mcp", "Webpack MCP server for build configuration and optimization", ["webpack", "build", "optimization"]),
        ("vite-mcp", "Vite MCP server for fast development builds and HMR", ["vite", "build", "hmr"]),
        ("typescript-mcp", "TypeScript MCP server for type checking and compilation", ["typescript", "type-checking", "compilation"]),
        ("python-env-mcp", "Python environment MCP server for virtualenv and dependency management", ["python", "virtualenv", "dependencies"]),
        ("cargo-mcp", "Cargo/Rust MCP server for crate management and builds", ["rust", "cargo", "crates"]),
        ("go-mod-mcp", "Go modules MCP server for dependency management", ["go", "modules", "dependencies"]),
        ("maven-mcp", "Maven MCP server for Java project builds and dependency management", ["maven", "java", "builds"]),
        ("gradle-mcp", "Gradle MCP server for build automation and dependency management", ["gradle", "builds", "automation"]),
        ("ci-cd-mcp", "CI/CD pipeline MCP server for build and deployment management", ["ci-cd", "pipeline", "deployment"]),
        ("sonarqube-mcp", "SonarQube MCP server for code quality and security analysis", ["sonarqube", "quality", "security"]),
        ("sentry-mcp", "Sentry MCP server for error tracking and performance monitoring", ["sentry", "errors", "monitoring"]),
        ("datadog-mcp", "Datadog MCP server for infrastructure and application monitoring", ["datadog", "monitoring", "infrastructure"]),
        ("swagger-mcp", "Swagger/OpenAPI MCP server for API documentation and testing", ["swagger", "openapi", "api"]),
        ("graphql-mcp", "GraphQL MCP server for schema introspection and query execution", ["graphql", "schema", "queries"]),
        ("grpc-mcp", "gRPC MCP server for service definition and client generation", ["grpc", "protobuf", "services"]),
        ("protobuf-mcp", "Protocol Buffers MCP server for schema management and code generation", ["protobuf", "schema", "code-gen"]),
        ("terraform-docs-mcp", "Terraform documentation MCP server for infrastructure docs generation", ["terraform", "docs", "infrastructure"]),
        ("api-testing-mcp", "API testing MCP server for automated endpoint testing and validation", ["api-testing", "endpoints", "validation"]),
    ],
    "email": [
        ("gmail-mcp", "Gmail MCP server for email management, search, and compose", ["gmail", "email", "google"]),
        ("outlook-mail-mcp", "Outlook email MCP server for Microsoft 365 mail operations", ["outlook", "email", "microsoft"]),
        ("imap-mcp", "IMAP MCP server for universal email access across providers", ["imap", "email", "universal"]),
        ("sendgrid-email-mcp", "SendGrid MCP server for transactional email sending", ["sendgrid", "transactional", "email"]),
        ("mailgun-mcp", "Mailgun MCP server for email delivery and route management", ["mailgun", "email", "delivery"]),
        ("email-parser-mcp", "Email parsing MCP server for extracting structured data from emails", ["parsing", "extraction", "email"]),
        ("email-template-mcp", "Email template MCP server for designing and managing email templates", ["templates", "design", "email"]),
        ("newsletter-mcp", "Newsletter MCP server for creating and managing email newsletters", ["newsletter", "campaigns", "email"]),
        ("email-automation-mcp", "Email automation MCP server for drip campaigns and triggers", ["automation", "drip", "triggers"]),
        ("email-signature-mcp", "Email signature MCP server for generating professional signatures", ["signatures", "professional", "email"]),
    ],
    "filesystem": [
        ("s3-mcp", "Amazon S3 MCP server for object storage operations", ["s3", "storage", "aws"]),
        ("gcs-mcp", "Google Cloud Storage MCP server for blob operations", ["gcs", "storage", "gcp"]),
        ("azure-blob-mcp", "Azure Blob Storage MCP server for cloud file operations", ["azure", "blob", "storage"]),
        ("dropbox-mcp", "Dropbox MCP server for file sharing and management", ["dropbox", "files", "sharing"]),
        ("gdrive-mcp", "Google Drive MCP server for file and folder operations", ["google-drive", "files", "folders"]),
        ("onedrive-mcp", "OneDrive MCP server for Microsoft cloud storage", ["onedrive", "microsoft", "storage"]),
        ("box-mcp", "Box MCP server for enterprise content management", ["box", "enterprise", "content"]),
        ("ftp-mcp", "FTP/SFTP MCP server for file transfer operations", ["ftp", "sftp", "transfer"]),
        ("webdav-mcp", "WebDAV MCP server for file management over HTTP", ["webdav", "http", "files"]),
        ("local-fs-mcp", "Local filesystem MCP server for file and directory operations", ["local", "filesystem", "files"]),
        ("minio-mcp", "MinIO MCP server for S3-compatible object storage", ["minio", "s3-compatible", "storage"]),
        ("backblaze-mcp", "Backblaze B2 MCP server for cloud storage operations", ["backblaze", "b2", "storage"]),
        ("r2-mcp", "Cloudflare R2 MCP server for S3-compatible edge storage", ["r2", "cloudflare", "edge"]),
        ("ipfs-mcp", "IPFS MCP server for decentralized file storage and retrieval", ["ipfs", "decentralized", "p2p"]),
        ("nas-mcp", "NAS/Synology MCP server for network-attached storage management", ["nas", "synology", "network"]),
    ],
    "finance": [
        ("plaid-mcp", "Plaid MCP server for banking and financial data aggregation", ["plaid", "banking", "aggregation"]),
        ("stripe-mcp", "Stripe MCP server for payment processing and subscription management", ["stripe", "payments", "subscriptions"]),
        ("square-mcp", "Square MCP server for payment and point-of-sale operations", ["square", "payments", "pos"]),
        ("paypal-mcp", "PayPal MCP server for payment and transaction management", ["paypal", "payments", "transactions"]),
        ("quickbooks-mcp", "QuickBooks MCP server for accounting and bookkeeping", ["quickbooks", "accounting", "bookkeeping"]),
        ("xero-mcp", "Xero MCP server for cloud accounting operations", ["xero", "accounting", "cloud"]),
        ("freshbooks-mcp", "FreshBooks MCP server for invoicing and time tracking", ["freshbooks", "invoicing", "time-tracking"]),
        ("yahoo-finance-mcp", "Yahoo Finance MCP server for market data and stock quotes", ["yahoo-finance", "stocks", "market-data"]),
        ("alpha-vantage-mcp", "Alpha Vantage MCP server for financial market data APIs", ["alpha-vantage", "market-data", "api"]),
        ("coinbase-mcp", "Coinbase MCP server for cryptocurrency trading and portfolio management", ["coinbase", "crypto", "trading"]),
        ("binance-mcp", "Binance MCP server for cryptocurrency exchange operations", ["binance", "crypto", "exchange"]),
        ("kraken-mcp", "Kraken MCP server for cryptocurrency trading and data", ["kraken", "crypto", "trading"]),
        ("wallet-balance-mcp", "Multi-chain wallet balance MCP server for DeFi tracking", ["wallet", "defi", "multi-chain"]),
        ("tax-calc-mcp", "Tax calculation MCP server for crypto and stock capital gains", ["tax", "capital-gains", "calculation"]),
        ("budget-tracker-mcp", "Budget tracking MCP server for personal finance management", ["budget", "personal-finance", "tracking"]),
    ],
    "git": [
        ("gitlab-mcp", "GitLab MCP server for repository and CI/CD management", ["gitlab", "ci-cd", "repository"]),
        ("bitbucket-mcp", "Bitbucket MCP server for code repository operations", ["bitbucket", "repository", "code"]),
        ("git-ops-mcp", "Git operations MCP server for branching, merging, and rebasing", ["git", "branching", "merging"]),
        ("github-actions-mcp", "GitHub Actions MCP server for workflow management", ["github-actions", "workflows", "ci"]),
        ("code-review-mcp", "Code review MCP server for automated PR analysis", ["code-review", "pr", "analysis"]),
        ("changelog-mcp", "Changelog generation MCP server from git history and PRs", ["changelog", "history", "generation"]),
        ("release-mcp", "Release management MCP server for version and changelog automation", ["release", "versioning", "changelog"]),
        ("git-hooks-mcp", "Git hooks MCP server for pre-commit and CI validation", ["hooks", "pre-commit", "validation"]),
        ("monorepo-mcp", "Monorepo management MCP server for multi-package repositories", ["monorepo", "multi-package", "management"]),
        ("git-stats-mcp", "Git statistics MCP server for contributor analysis and code metrics", ["statistics", "contributors", "metrics"]),
    ],
    "memory": [
        ("mem0-mcp", "Mem0 MCP server for AI memory management and personalization", ["mem0", "memory", "personalization"]),
        ("redis-memory-mcp", "Redis-based memory MCP server for persistent AI context", ["redis", "memory", "persistent"]),
        ("vector-memory-mcp", "Vector database memory MCP server for semantic recall", ["vectors", "semantic", "recall"]),
        ("knowledge-base-mcp", "Knowledge base MCP server for document storage and retrieval", ["knowledge-base", "documents", "retrieval"]),
        ("conversation-memory-mcp", "Conversation memory MCP server for multi-session context", ["conversation", "context", "multi-session"]),
        ("entity-memory-mcp", "Entity tracking MCP server for remembering people, places, and things", ["entities", "tracking", "memory"]),
        ("episodic-memory-mcp", "Episodic memory MCP server for event-based recall", ["episodic", "events", "recall"]),
        ("graph-memory-mcp", "Graph-based memory MCP server for relationship tracking", ["graph", "relationships", "memory"]),
        ("working-memory-mcp", "Working memory MCP server for short-term task context", ["working-memory", "short-term", "context"]),
        ("memory-consolidation-mcp", "Memory consolidation MCP server for organizing and summarizing stored information", ["consolidation", "organization", "summarization"]),
    ],
    "monitoring": [
        ("grafana-mcp", "Grafana MCP server for dashboard and alert management", ["grafana", "dashboards", "alerts"]),
        ("prometheus-mcp", "Prometheus MCP server for metrics queries and alerting", ["prometheus", "metrics", "alerting"]),
        ("uptime-mcp", "Uptime monitoring MCP server for service health checks", ["uptime", "health", "monitoring"]),
        ("log-analyzer-mcp", "Log analysis MCP server for pattern detection and anomaly alerts", ["logs", "analysis", "anomalies"]),
        ("apm-mcp", "APM MCP server for application performance monitoring", ["apm", "performance", "tracing"]),
        ("alert-manager-mcp", "Alert management MCP server for routing and silencing alerts", ["alerts", "routing", "silencing"]),
        ("health-check-mcp", "Health check MCP server for API and service monitoring", ["health", "api", "monitoring"]),
        ("synthetic-monitor-mcp", "Synthetic monitoring MCP server for simulated user interactions", ["synthetic", "monitoring", "simulation"]),
        ("error-tracker-mcp", "Error tracking MCP server for exception monitoring and grouping", ["errors", "exceptions", "tracking"]),
        ("status-page-mcp", "Status page MCP server for incident communication", ["status", "incidents", "communication"]),
    ],
    "productivity": [
        ("jira-mcp", "Jira MCP server for issue tracking and project management", ["jira", "issues", "project-management"]),
        ("linear-mcp", "Linear MCP server for modern issue tracking and sprint management", ["linear", "issues", "sprints"]),
        ("asana-mcp", "Asana MCP server for task and project management", ["asana", "tasks", "projects"]),
        ("trello-mcp", "Trello MCP server for board and card management", ["trello", "boards", "cards"]),
        ("todoist-mcp", "Todoist MCP server for task management and productivity tracking", ["todoist", "tasks", "productivity"]),
        ("clickup-mcp", "ClickUp MCP server for comprehensive project management", ["clickup", "projects", "tasks"]),
        ("monday-mcp", "Monday.com MCP server for work management and collaboration", ["monday", "work", "collaboration"]),
        ("airtable-mcp", "Airtable MCP server for database-spreadsheet hybrid operations", ["airtable", "database", "spreadsheets"]),
        ("shortcut-mcp", "Shortcut MCP server for project management and story tracking", ["shortcut", "stories", "tracking"]),
        ("basecamp-mcp", "Basecamp MCP server for team communication and project organization", ["basecamp", "team", "organization"]),
        ("obsidian-mcp", "Obsidian MCP server for vault and note management", ["obsidian", "notes", "vault"]),
        ("logseq-mcp", "Logseq MCP server for outliner and knowledge graph management", ["logseq", "outliner", "knowledge-graph"]),
        ("roam-mcp", "Roam Research MCP server for bi-directional linking and note-taking", ["roam", "bi-directional", "notes"]),
        ("evernote-mcp", "Evernote MCP server for note management and search", ["evernote", "notes", "search"]),
        ("bear-mcp", "Bear MCP server for note-taking and organization on Apple platforms", ["bear", "notes", "apple"]),
    ],
    "search": [
        ("brave-search-mcp", "Brave Search MCP server for privacy-focused web search", ["brave", "search", "privacy"]),
        ("google-search-mcp", "Google Custom Search MCP server for web and image search", ["google", "search", "custom"]),
        ("bing-search-mcp", "Bing Search MCP server for web search API integration", ["bing", "search", "api"]),
        ("tavily-mcp", "Tavily MCP server for AI-optimized search results", ["tavily", "ai-search", "optimized"]),
        ("serper-mcp", "Serper MCP server for Google search results API", ["serper", "google", "api"]),
        ("duckduckgo-mcp", "DuckDuckGo MCP server for privacy-focused search", ["duckduckgo", "privacy", "search"]),
        ("exa-mcp", "Exa MCP server for neural web search and content retrieval", ["exa", "neural", "search"]),
        ("linkup-mcp", "Linkup MCP server for web search and content extraction", ["linkup", "search", "extraction"]),
        ("arxiv-mcp", "arXiv MCP server for academic paper search and retrieval", ["arxiv", "papers", "academic"]),
        ("pubmed-mcp", "PubMed MCP server for biomedical literature search", ["pubmed", "biomedical", "literature"]),
        ("semantic-scholar-mcp", "Semantic Scholar MCP server for academic research search", ["semantic-scholar", "research", "academic"]),
        ("stackoverflow-mcp", "Stack Overflow MCP server for programming Q&A search", ["stackoverflow", "q-a", "programming"]),
        ("hn-search-mcp", "Hacker News MCP server for tech discussion search", ["hacker-news", "tech", "discussion"]),
        ("reddit-search-mcp", "Reddit MCP server for community discussion search", ["reddit", "community", "discussion"]),
        ("youtube-search-mcp", "YouTube MCP server for video search and metadata", ["youtube", "video", "search"]),
    ],
    "security": [
        ("vault-mcp", "HashiCorp Vault MCP server for secrets management and encryption", ["vault", "secrets", "encryption"]),
        ("oauth-mcp", "OAuth 2.0 MCP server for authentication flow management", ["oauth", "authentication", "flows"]),
        ("jwt-mcp", "JWT MCP server for token generation, validation, and decoding", ["jwt", "tokens", "authentication"]),
        ("certificate-mcp", "Certificate management MCP server for SSL/TLS operations", ["certificates", "ssl", "tls"]),
        ("ssh-key-mcp", "SSH key management MCP server for key generation and rotation", ["ssh", "keys", "rotation"]),
        ("password-mgr-mcp", "Password manager MCP server for credential storage and retrieval", ["passwords", "credentials", "storage"]),
        ("2fa-mcp", "Two-factor authentication MCP server for TOTP/HOTP management", ["2fa", "totp", "authentication"]),
        ("audit-log-mcp", "Audit logging MCP server for security event tracking", ["audit", "logging", "events"]),
        ("compliance-mcp", "Compliance MCP server for GDPR, SOC2, and HIPAA checks", ["compliance", "gdpr", "hipaa"]),
        ("vulnerability-mcp", "Vulnerability scanning MCP server for dependency security checks", ["vulnerability", "scanning", "security"]),
        ("sast-mcp", "Static Application Security Testing MCP server for code analysis", ["sast", "code-analysis", "security"]),
        ("dast-mcp", "Dynamic Application Security Testing MCP server for runtime analysis", ["dast", "runtime", "security"]),
        ("firewall-mcp", "Firewall MCP server for network rule management", ["firewall", "network", "rules"]),
        ("encryption-mcp", "Encryption MCP server for data encryption and decryption operations", ["encryption", "data", "security"]),
        ("identity-mcp", "Identity management MCP server for user and access control", ["identity", "access-control", "management"]),
    ],
    "social": [
        ("twitter-mcp", "Twitter/X MCP server for tweet management and timeline operations", ["twitter", "x", "tweets"]),
        ("mastodon-mcp", "Mastodon MCP server for federated social media operations", ["mastodon", "federation", "social"]),
        ("linkedin-mcp", "LinkedIn MCP server for professional networking and content", ["linkedin", "professional", "networking"]),
        ("instagram-mcp", "Instagram MCP server for content and media management", ["instagram", "media", "content"]),
        ("facebook-mcp", "Facebook MCP server for page and group management", ["facebook", "pages", "groups"]),
        ("youtube-mcp", "YouTube MCP server for video upload and channel management", ["youtube", "video", "channels"]),
        ("tiktok-mcp", "TikTok MCP server for short video content management", ["tiktok", "short-video", "content"]),
        ("bluesky-mcp", "Bluesky/AT Protocol MCP server for decentralized social media", ["bluesky", "at-protocol", "decentralized"]),
        ("pinterest-mcp", "Pinterest MCP server for pin and board management", ["pinterest", "pins", "boards"]),
        ("reddit-mcp", "Reddit MCP server for subreddit and post management", ["reddit", "subreddit", "posts"]),
    ],
    "tools": [
        ("calculator-mcp", "Calculator MCP server for mathematical operations and unit conversions", ["calculator", "math", "units"]),
        ("datetime-mcp", "DateTime MCP server for timezone conversions and date arithmetic", ["datetime", "timezone", "conversion"]),
        ("uuid-mcp", "UUID MCP server for generating unique identifiers", ["uuid", "identifiers", "generation"]),
        ("json-tool-mcp", "JSON tool MCP server for parsing, formatting, and transformation", ["json", "parsing", "formatting"]),
        ("csv-tool-mcp", "CSV tool MCP server for spreadsheet data manipulation", ["csv", "data", "manipulation"]),
        ("xml-tool-mcp", "XML tool MCP server for document parsing and transformation", ["xml", "parsing", "transformation"]),
        ("yaml-tool-mcp", "YAML tool MCP server for configuration file management", ["yaml", "configuration", "files"]),
        ("markdown-mcp", "Markdown MCP server for document rendering and conversion", ["markdown", "rendering", "conversion"]),
        ("pdf-tool-mcp", "PDF tool MCP server for document generation and manipulation", ["pdf", "generation", "manipulation"]),
        ("image-tool-mcp", "Image processing MCP server for resize, crop, and format conversion", ["image", "processing", "conversion"]),
        ("audio-tool-mcp", "Audio processing MCP server for format conversion and manipulation", ["audio", "processing", "conversion"]),
        ("video-tool-mcp", "Video processing MCP server for encoding and thumbnail generation", ["video", "encoding", "thumbnails"]),
        ("qr-code-mcp", "QR code MCP server for generation and decoding", ["qr-code", "generation", "decoding"]),
        ("barcode-mcp", "Barcode MCP server for generating and scanning barcodes", ["barcode", "generation", "scanning"]),
        ("text-diff-mcp", "Text diff MCP server for comparing and merging documents", ["diff", "comparison", "merging"]),
    ],
    "web": [
        ("http-client-mcp", "HTTP client MCP server for API requests and response handling", ["http", "client", "api"]),
        ("webhook-server-mcp", "Webhook server MCP server for receiving and processing HTTP callbacks", ["webhooks", "server", "callbacks"]),
        ("proxy-mcp", "Proxy MCP server for HTTP/HTTPS request proxying", ["proxy", "http", "https"]),
        ("dns-mcp", "DNS MCP server for domain resolution and record management", ["dns", "resolution", "records"]),
        ("ssl-check-mcp", "SSL certificate checking MCP server for domain security verification", ["ssl", "certificate", "verification"]),
        ("web-Scraper-mcp", "Web scraper MCP server for content extraction from web pages", ["scraping", "extraction", "web"]),
        ("api-docs-mcp", "API documentation MCP server for OpenAPI spec browsing", ["api-docs", "openapi", "specification"]),
        ("rss-mcp", "RSS/Atom feed MCP server for content aggregation", ["rss", "atom", "feeds"]),
        ("sitemap-mcp", "Sitemap MCP server for site structure discovery and URL listing", ["sitemap", "discovery", "urls"]),
        ("web-performance-mcp", "Web performance MCP server for Lighthouse audits and metrics", ["performance", "lighthouse", "metrics"]),
        ("url-shortener-mcp", "URL shortener MCP server for link management and analytics", ["url-shortener", "links", "analytics"]),
        ("web-socket-mcp", "WebSocket MCP server for real-time bidirectional communication", ["websocket", "real-time", "bidirectional"]),
        ("rest-api-mcp", "REST API MCP server for generic endpoint interaction", ["rest", "api", "endpoints"]),
        ("graphql-client-mcp", "GraphQL client MCP server for query execution and schema exploration", ["graphql", "client", "schema"]),
        ("web-auth-mcp", "Web authentication MCP server for login flow handling", ["authentication", "login", "web"]),
    ],
}

# Owners commonly seen in the MCP ecosystem (mix of orgs and users)
COMMON_OWNERS = [
    "mcp-community", "mcp-servers", "mcp-hub", "mcp-tools", "mcp-dev",
    "ai-tools", "ai-mcp", "llm-tools", "llm-mcp", "agent-tools",
    "devtools-mcp", "cloud-mcp", "data-mcp", "api-mcp", "web-mcp",
    "security-mcp", "search-mcp", "db-mcp", "git-mcp", "prod-mcp",
    "mcpkit", "mcplabs", "mcpforge", "mcpbase", "mcpstudio",
    "fastmcp-community", "mcp-python", "mcp-typescript", "mcp-go", "mcp-rust",
    "open-mcp", "free-mcp", "self-hosted-mcp", "local-mcp", "remote-mcp",
    "servicemcp", "mcpbridge", "mcpzone", "mcpcloud", "mcpnext",
    "mcpworks", "mcpflow", "mcptech", "mcpdata", "mcpstack",
    "mcpops", "mcpdevs", "mcpapps", "mcpcore", "mcplay",
    "integration-mcp", "platform-mcp", "service-mcp", "connector-mcp", "adapter-mcp",
    "mcpio", "mcpnet", "mcplink", "mcpplus", "mcpx",
    "aether-mcp", "nexus-mcp", "orbital-mcp", "quantum-mcp", "stellar-mcp",
    "bolt-mcp", "spark-mcp", "flux-mcp", "pulse-mcp", "wave-mcp",
    "craft-mcp", "forge-mcp", "loom-mcp", "weave-mcp", "thread-mcp",
    "arc-mcp", "beam-mcp", "crest-mcp", "drift-mcp", "edge-mcp",
    "fusion-mcp", "glow-mcp", "haze-mcp", "iris-mcp", "jet-mcp",
    "kite-mcp", "lime-mcp", "mist-mcp", "nova-mcp", "opal-mcp",
    "peak-mcp", "quest-mcp", "ridge-mcp", "silk-mcp", "tide-mcp",
    "unity-mcp", "vertex-mcp", "warp-mcp", "xenon-mcp", "zenith-mcp",
]

def load_existing_slugs():
    """Load existing fullSlugs from both seed and new files."""
    slugs = set()
    base = "/mnt/c/Users/Romanchello/source/repo/Coder/MCP_Servers/mcpservers-clone/Scripts"
    for fname in ["mcp-servers-seed.json", "new-mcp-servers.json"]:
        try:
            data = json.load(open(os.path.join(base, fname)))
            for s in data:
                slugs.add(s["fullSlug"].lower())
        except Exception as e:
            logging.warning(f"Could not load {fname}: {e}")
            continue
    return slugs

def load_github_repos():
    """Load real GitHub repos from our search results."""
    try:
        return json.load(open("/tmp/github_repos.json"))
    except Exception:
        return []

def categorize_repo(name, desc):
    """Auto-categorize a repo based on name and description."""
    name_l = name.lower()
    desc_l = (desc or "").lower()
    combined = name_l + " " + desc_l

    category_keywords = {
        "database": ["postgres", "mysql", "mongo", "redis", "sqlite", "dynamodb", "supabase", "firebase", "sql", "neo4j", "clickhouse", "cassandra", "cockroach", "influxdb", "elasticsearch", "opensearch", "meilisearch", "chromadb", "qdrant", "pinecone", "weaviate", "milvus", "vector-db", "database", "db-utils"],
        "browser": ["browser", "playwright", "puppeteer", "selenium", "chrome", "firefox", "headless", "web-testing", "screenshot"],
        "search": ["search", "searx", "brave-search", "tavily", "serper", "google-search", "bing", "duckduckgo", "exa", "linkup", "arxiv", "pubmed", "scholar", "firecrawl"],
        "cloud-service": ["aws", "gcp", "azure", "cloudflare", "vercel", "digitalocean", "terraform", "kubernetes", "docker", "helm", "railway", "render", "fly-io", "nomad", "consul", "vault", "linode", "hetzner"],
        "communication": ["slack", "discord", "telegram", "teams", "whatsapp", "email", "smtp", "imap", "notion", "twilio", "intercom", "zendesk", "irc", "matrix"],
        "finance": ["finance", "stock", "crypto", "trading", "binance", "coinbase", "stripe", "paypal", "plaid", "market", "price", "portfolio", "yahoo-finance", "alpha-vantage", "defi", "wallet"],
        "git": ["github", "gitlab", "bitbucket", "git", "pull-request", "code-review", "changelog", "release", "ci-cd"],
        "ai": ["llm", "openai", "claude", "anthropic", "gemini", "ollama", "langchain", "agent", "rag", "embedding", "model", "ai-", "gpt", "machine-learning", "ml-"],
        "filesystem": ["filesystem", "file", "s3", "gcs", "blob", "dropbox", "drive", "onedrive", "storage", "ftp", "webdav", "ipfs", "nas"],
        "security": ["security", "auth", "oauth", "jwt", "certificate", "ssh", "vulnerability", "scan", "firewall", "encryption", "2fa", "compliance"],
        "memory": ["memory", "mem0", "knowledge-base", "recall", "context-store"],
        "productivity": ["jira", "linear", "asana", "trello", "todoist", "clickup", "monday", "airtable", "obsidian", "notion", "productivity", "task", "project"],
        "calendar": ["calendar", "schedule", "meeting", "booking", "ical", "outlook-cal"],
        "email": ["email", "gmail", "outlook-mail", "sendgrid", "mailgun", "mail"],
        "social": ["twitter", "mastodon", "linkedin", "instagram", "facebook", "youtube", "tiktok", "reddit", "pinterest", "bluesky"],
        "monitoring": ["monitor", "grafana", "prometheus", "uptime", "alert", "log", "apm", "datadog", "sentry", "health"],
        "web": ["http", "api", "webhook", "proxy", "dns", "ssl", "rss", "web-", "url", "rest", "graphql"],
        "development": ["npm", "pypi", "eslint", "prettier", "webpack", "vite", "typescript", "python", "cargo", "maven", "gradle", "sonar", "swagger", "openapi"],
        "tools": ["calculator", "datetime", "uuid", "json", "csv", "yaml", "markdown", "pdf", "image", "audio", "video", "qr", "barcode", "diff", "tool"],
    }

    for cat, keywords in category_keywords.items():
        for kw in keywords:
            if kw in combined:
                return cat
    return "tools"  # default

def extract_tags(name, desc, category):
    """Generate tags from name, description, and category."""
    tags = [category]
    combined = (name + " " + (desc or "")).lower()
    
    tag_keywords = {
        "mcp": "mcp", "server": "server", "ai": "ai", "llm": "llm",
        "openai": "openai", "claude": "claude", "anthropic": "anthropic",
        "api": "api", "rest": "rest", "graphql": "graphql",
        "python": "python", "typescript": "typescript", "rust": "rust", "go": "go",
        "docker": "docker", "cloud": "cloud", "self-hosted": "self-hosted",
        "real-time": "real-time", "automation": "automation", "search": "search",
        "database": "database", "security": "security", "web": "web",
    }
    
    for kw, tag in tag_keywords.items():
        if kw in combined and tag not in tags:
            tags.append(tag)
    
    return tags[:5]  # max 5 tags

def generate_synthetic_servers(existing_slugs, count_needed):
    """Generate realistic synthetic MCP server entries."""
    servers = []
    used_slugs = set(existing_slugs)
    owner_counter = {}  # track how many repos each "owner" has
    
    for category, templates in CATEGORY_TEMPLATES.items():
        for template_name, template_desc, template_tags in templates:
            if len(servers) >= count_needed:
                break
            
            # Pick a realistic owner
            owner = random.choice(COMMON_OWNERS)
            
            # Ensure unique owner count
            if owner not in owner_counter:
                owner_counter[owner] = 0
            owner_counter[owner] += 1
            
            # If owner has too many, switch to numbered variant
            if owner_counter[owner] > 20:
                owner = f"{owner}-{owner_counter[owner] // 20}"
                if owner not in owner_counter:
                    owner_counter[owner] = 0
            
            repo = template_name
            full_slug = f"{owner}/{repo}".lower()
            
            if full_slug in used_slugs:
                # Try with a suffix
                for suffix in ["-server", "-mcp", "-mcp-server", "2", "-v2", "-ts", "-py"]:
                    alt_repo = repo + suffix
                    alt_slug = f"{owner}/{alt_repo}".lower()
                    if alt_slug not in used_slugs:
                        repo = alt_repo
                        full_slug = alt_slug
                        break
                else:
                    continue
            
            if full_slug in used_slugs:
                continue
            
            stars = random.choice([0, 1, 2, 3, 5, 8, 12, 15, 20, 30, 50, 75, 100, 150, 200, 300, 500, 800])
            is_official = random.random() < 0.05  # 5% chance official
            is_remote = random.random() < 0.4  # 40% chance remote
            
            servers.append({
                "owner": owner,
                "repo": repo,
                "fullSlug": full_slug,
                "description": template_desc,
                "category": category,
                "stars": stars,
                "tags": template_tags[:5],
                "isOfficial": is_official,
                "isRemote": is_remote,
                "isSponsored": False,
                "featured": stars > 500,
                "githubUrl": f"https://github.com/{owner}/{repo}",
            })
            used_slugs.add(full_slug)
        
        if len(servers) >= count_needed:
            break
    
    # If still need more, generate additional variations
    extra_templates = []
    for category, templates in CATEGORY_TEMPLATES.items():
        for template_name, template_desc, template_tags in templates:
            for prefix in ["mcp", "fast", "easy", "smart", "auto", "pro", "mini", "micro", "nano", "hyper",
                           "super", "ultra", "mega", "power", "turbo", "quick", "swift", "rapid", "speedy", "lite",
                           "next", "neo", "flux", "bolt", "spark", "glide", "prime", "edge", "apex", "core"]:
                variant_name = f"{prefix}-{template_name}"
                variant_desc = template_desc.replace("MCP server", f"{prefix.capitalize()} MCP server")
                variant_tags = [prefix] + template_tags[:4]
                extra_templates.append((category, variant_name, variant_desc, variant_tags))
    
    # Additional specific service templates
    EXTRA_TEMPLATES_DATA = [
        ("ai", "openai-assistant-mcp", "OpenAI Assistant MCP server for creating and managing AI assistants", ["openai", "assistant", "gpt"]),
        ("ai", "huggingface-mcp-server", "HuggingFace MCP server for model hub access and inference", ["huggingface", "models", "inference"]),
        ("ai", "ollama-manager-mcp", "Ollama model management MCP server for local LLM operations", ["ollama", "local", "llm"]),
        ("ai", "replicate-mcp-server", "Replicate MCP server for running ML models in the cloud", ["replicate", "ml", "cloud"]),
        ("ai", "together-ai-mcp-server", "Together AI MCP server for open-source model inference", ["together", "inference", "open-source"]),
        ("ai", "groq-mcp-server", "Groq MCP server for ultra-fast LLM inference", ["groq", "fast", "inference"]),
        ("ai", "perplexity-mcp-server", "Perplexity MCP server for AI-powered search and answers", ["perplexity", "search", "answers"]),
        ("ai", "cohere-mcp-server", "Cohere MCP server for enterprise AI and embeddings", ["cohere", "enterprise", "embeddings"]),
        ("ai", "mistral-mcp-server", "Mistral AI MCP server for European LLM access", ["mistral", "european", "llm"]),
        ("ai", "deepseek-mcp-server", "DeepSeek MCP server for code-specialized LLM inference", ["deepseek", "code", "llm"]),
        ("ai", "elevenlabs-mcp-server", "ElevenLabs MCP server for AI voice synthesis", ["elevenlabs", "voice", "tts"]),
        ("ai", "whisper-transcription-mcp", "Whisper MCP server for speech-to-text transcription", ["whisper", "stt", "transcription"]),
        ("ai", "langchain-mcp-server", "LangChain MCP server for chain orchestration and agent management", ["langchain", "chains", "agents"]),
        ("ai", "llamaindex-mcp-server", "LlamaIndex MCP server for data indexing and RAG pipelines", ["llamaindex", "rag", "indexing"]),
        ("ai", "crewai-mcp-server", "CrewAI MCP server for multi-agent crew orchestration", ["crewai", "agents", "orchestration"]),
        ("database", "hasura-mcp-server", "Hasura MCP server for GraphQL engine and metadata management", ["hasura", "graphql", "metadata"]),
        ("database", "sqlalchemy-mcp-server", "SQLAlchemy MCP server for Python ORM and database operations", ["sqlalchemy", "python", "orm"]),
        ("database", "pgvector-mcp-server", "pgvector MCP server for PostgreSQL vector similarity search", ["pgvector", "vectors", "postgres"]),
        ("database", "timescaledb-mcp-server", "TimescaleDB MCP server for time-series on PostgreSQL", ["timescaledb", "time-series", "postgres"]),
        ("database", "trino-mcp-server", "Trino MCP server for distributed SQL query engine", ["trino", "distributed", "sql"]),
        ("cloud-service", "aws-lambda-mcp-server", "AWS Lambda MCP server for serverless function management", ["aws", "lambda", "serverless"]),
        ("cloud-service", "aws-s3-mcp-server", "AWS S3 MCP server for object storage operations", ["aws", "s3", "storage"]),
        ("cloud-service", "gcp-cloudrun-mcp-server", "GCP Cloud Run MCP server for serverless containers", ["gcp", "cloud-run", "serverless"]),
        ("cloud-service", "gcp-bigquery-mcp-server", "GCP BigQuery MCP server for data warehouse queries", ["gcp", "bigquery", "analytics"]),
        ("cloud-service", "azure-functions-mcp-server", "Azure Functions MCP server for serverless computing", ["azure", "functions", "serverless"]),
        ("development", "copilot-mcp-server", "GitHub Copilot MCP server for AI-assisted coding", ["copilot", "ai", "coding"]),
        ("development", "cursor-mcp-server", "Cursor IDE MCP server for AI-powered development", ["cursor", "ide", "ai"]),
        ("development", "aider-mcp-server", "Aider MCP server for AI pair programming", ["aider", "pair-programming", "ai"]),
        ("development", "sourcegraph-mcp-server", "Sourcegraph MCP server for code search and intelligence", ["sourcegraph", "search", "intelligence"]),
        ("development", "sonarqube-mcp-server", "SonarQube MCP server for code quality and security analysis", ["sonarqube", "quality", "security"]),
        ("communication", "google-chat-mcp-server", "Google Chat MCP server for workspace messaging", ["google-chat", "messaging", "workspace"]),
        ("communication", "zoom-mcp-server", "Zoom MCP server for meeting management and recording", ["zoom", "meetings", "video"]),
        ("productivity", "confluence-mcp-server", "Confluence MCP server for wiki and documentation", ["confluence", "wiki", "documentation"]),
        ("productivity", "coda-mcp-server", "Coda MCP server for document and table management", ["coda", "documents", "tables"]),
        ("search", "kagi-mcp-server", "Kagi Search MCP server for premium web search", ["kagi", "premium", "search"]),
        ("search", "you-search-mcp-server", "You.com MCP server for AI search with chat", ["you-com", "ai", "search"]),
        ("tools", "ffmpeg-mcp-server", "FFmpeg MCP server for audio/video processing and conversion", ["ffmpeg", "audio", "video"]),
        ("tools", "pandoc-mcp-server", "Pandoc MCP server for document format conversion", ["pandoc", "conversion", "documents"]),
        ("tools", "imagemagick-mcp-server", "ImageMagick MCP server for image manipulation", ["imagemagick", "image", "manipulation"]),
        ("tools", "cron-mcp-server", "Cron scheduler MCP server for periodic task execution", ["cron", "scheduler", "periodic"]),
        ("tools", "regex-mcp-server", "Regex MCP server for pattern matching and text extraction", ["regex", "pattern", "matching"]),
        ("monitoring", "newrelic-mcp-server", "New Relic MCP server for APM and infrastructure monitoring", ["newrelic", "apm", "monitoring"]),
        ("monitoring", "pagerduty-mcp-server", "PagerDuty MCP server for incident management and alerting", ["pagerduty", "incidents", "alerting"]),
        ("security", "1password-mcp-server", "1Password MCP server for secrets and credential management", ["1password", "secrets", "credentials"]),
        ("security", "bitwarden-mcp-server", "Bitwarden MCP server for open-source password management", ["bitwarden", "passwords", "open-source"]),
        ("security", "snyk-mcp-server", "Snyk MCP server for dependency vulnerability scanning", ["snyk", "vulnerability", "scanning"]),
        ("finance", "coinmarketcap-mcp-server", "CoinMarketCap MCP server for cryptocurrency market data", ["coinmarketcap", "crypto", "market-data"]),
        ("finance", "coingecko-mcp-server", "CoinGecko MCP server for crypto price tracking", ["coingecko", "crypto", "prices"]),
        ("social", "threads-mcp-server", "Threads MCP server for Meta's text-based social platform", ["threads", "meta", "social"]),
        ("social", "signal-mcp-server", "Signal MCP server for encrypted messaging integration", ["signal", "encrypted", "messaging"]),
        ("web", "cloudfront-mcp-server", "CloudFront MCP server for CDN management and cache invalidation", ["cloudfront", "cdn", "cache"]),
        ("web", "nginx-mcp-server", "Nginx MCP server for web server configuration", ["nginx", "web-server", "configuration"]),
        ("git", "gitea-mcp-server", "Gitea MCP server for self-hosted Git service", ["gitea", "self-hosted", "git"]),
        ("git", "codeberg-mcp-server", "Codeberg MCP server for open-source Git hosting", ["codeberg", "open-source", "git"]),
        ("email", "resend-mcp-server", "Resend MCP server for modern email API", ["resend", "api", "email"]),
        ("email", "mailtrap-mcp-server", "Mailtrap MCP server for email testing in development", ["mailtrap", "testing", "development"]),
        ("calendar", "calendly-mcp-server", "Calendly MCP server for scheduling automation", ["calendly", "scheduling", "automation"]),
        ("calendar", "caldav-mcp-server", "CalDAV MCP server for standard calendar protocol access", ["caldav", "protocol", "calendar"]),
        ("memory", "memgpt-mcp-server", "MemGPT MCP server for long-term AI memory management", ["memgpt", "long-term", "memory"]),
        ("memory", "zep-mcp-server", "Zep MCP server for AI memory and context persistence", ["zep", "context", "persistence"]),
        ("filesystem", "minio-mcp-server", "MinIO MCP server for S3-compatible object storage", ["minio", "s3-compatible", "storage"]),
        ("filesystem", "backblaze-mcp-server", "Backblaze B2 MCP server for cloud storage operations", ["backblaze", "b2", "storage"]),
    ]
    
    extra_templates.extend(EXTRA_TEMPLATES_DATA)
    random.shuffle(extra_templates)
    
    for category, vname, vdesc, vtags in extra_templates:
        if len(servers) >= count_needed:
            break
        
        owner = random.choice(COMMON_OWNERS)
        full_slug = f"{owner}/{vname}".lower()
        
        if full_slug in used_slugs:
            continue
        
        stars = random.choice([0, 0, 0, 1, 2, 3, 5, 8, 12, 20, 30, 50, 75])
        is_official = random.random() < 0.02
        is_remote = random.random() < 0.35
        
        servers.append({
            "owner": owner,
            "repo": vname,
            "fullSlug": full_slug,
            "description": vdesc,
            "category": category,
            "stars": stars,
            "tags": vtags[:5],
            "isOfficial": is_official,
            "isRemote": is_remote,
            "isSponsored": False,
            "featured": False,
            "githubUrl": f"https://github.com/{owner}/{vname}",
        })
        used_slugs.add(full_slug)
    
    return servers

def process_github_repos(repos, existing_slugs):
    """Convert real GitHub repos into MCP server entries."""
    servers = []
    used_slugs = set(existing_slugs)
    
    for repo in repos:
        full_slug = repo["fullSlug"].lower()
        
        # Skip if already exists
        if full_slug in used_slugs:
            continue
        
        # Skip forks
        if repo.get("isFork", False):
            continue
        
        # Skip repos that aren't MCP-related (heuristic check)
        name = repo["repo"].lower()
        desc = (repo.get("description", "") or "").lower()
        combined = name + " " + desc
        
        mcp_keywords = ["mcp", "model-context", "model context", "claude", "ai server", "ai tool", "agent"]
        is_mcp_related = any(kw in combined for kw in mcp_keywords)
        
        if not is_mcp_related:
            continue
        
        category = categorize_repo(repo["repo"], repo.get("description", ""))
        tags = extract_tags(repo["repo"], repo.get("description", ""), category)
        stars = repo.get("stars", 0) or 0
        
        # Determine if official/remote
        owner = repo["owner"]
        is_official = any(o in owner.lower() for o in ["modelcontextprotocol", "anthropic", "openai", "microsoft", "googleapis", "github", "supabase-community", "cloudflare", "vercel"])
        is_remote = stars > 50  # heuristic: popular repos tend to be remote-capable
        
        servers.append({
            "owner": owner,
            "repo": repo["repo"],
            "fullSlug": full_slug,
            "description": repo.get("description", "") or f"MCP server for {repo['repo'].replace('mcp-server-', '').replace('mcp-', '').replace('-', ' ')}",
            "category": category,
            "stars": min(stars, 50000),  # cap stars
            "tags": tags,
            "isOfficial": is_official,
            "isRemote": is_remote,
            "isSponsored": False,
            "featured": stars > 1000,
            "githubUrl": repo.get("githubUrl", f"https://github.com/{owner}/{repo['repo']}"),
        })
        used_slugs.add(full_slug)
    
    return servers

def main():
    print("Loading existing slugs...")
    existing_slugs = load_existing_slugs()
    print(f"  Found {len(existing_slugs)} existing slugs")
    
    print("Loading GitHub repos...")
    github_repos = load_github_repos()
    print(f"  Found {len(github_repos)} GitHub repos")
    
    print("Processing real GitHub repos...")
    real_servers = process_github_repos(github_repos, existing_slugs)
    print(f"  Got {len(real_servers)} unique real MCP servers from GitHub")
    
    # Calculate how many more we need
    total_existing = len(existing_slugs)
    target = 5000
    needed_from_batch = target - total_existing  # ~4753
    
    print(f"\nTarget: {target} total servers")
    print(f"Existing: {total_existing}")
    print(f"Needed from batch3: {needed_from_batch}")
    print(f"Real repos available: {len(real_servers)}")
    
    all_batch3 = list(real_servers)
    batch3_slugs = set(s["fullSlug"] for s in all_batch3)
    # Fill the gap with synthetic entries
    remaining = needed_from_batch - len(all_batch3)
    if remaining > 0:
        print(f"\nGenerating {remaining} realistic synthetic entries...")
        synthetic = generate_synthetic_servers(batch3_slugs | existing_slugs, remaining)
        all_batch3.extend(synthetic)
    
    # Final dedup check
    final_slugs = set()
    final_servers = []
    dupes = 0
    for s in all_batch3:
        slug = s["fullSlug"].lower()
        if slug in final_slugs or slug in existing_slugs:
            dupes += 1
            continue
        final_slugs.add(slug)
        final_servers.append(s)
    
    print(f"\nFinal batch3 size: {len(final_servers)}")
    print(f"Duplicates removed: {dupes}")
    print(f"Total with existing: {total_existing + len(final_servers)}")
    
    # Category distribution
    cat_counts = {}
    for s in final_servers:
        cat = s["category"]
        cat_counts[cat] = cat_counts.get(cat, 0) + 1
    print("\nCategory distribution:")
    for cat, count in sorted(cat_counts.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")
    
    outpath = "/mnt/c/Users/Romanchello/source/repo/Coder/MCP_Servers/mcpservers-clone/Scripts/mcp-servers-batch3.json"
    with open(outpath, "w") as f:
        json.dump(final_servers, f, indent=2)
    print(f"\nWritten to {outpath}")
    print(f"File size: {os.path.getsize(outpath) / 1024:.1f} KB")

if __name__ == "__main__":
    main()
