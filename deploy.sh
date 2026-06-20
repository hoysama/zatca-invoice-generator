#!/bin/bash
# Build and deploy script

cd /c/Users/HoySa/projects/zatca-invoice-generator/frontend

# Build Next.js (generates CSS/JS assets)
bun run build

# Copy custom HTML files (overwrite Next.js generated ones)
cp /c/Users/HoySa/projects/zatca-invoice-generator/frontend/out/index.html /c/Users/HoySa/projects/zatca-invoice-generator/frontend/out/index.html.bak

# Deploy
set CLOUDFLARE_API_TOKEN=***
wrangler pages deploy out --project-name=zatca-invoice-generator --branch=master --commit-dirty=true
