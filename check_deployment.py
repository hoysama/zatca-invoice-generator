#!/usr/bin/env python3
import requests, json, os

token = os.environ.get('CLOUDFLARE_API_TOKEN', '')
account_id = '20a229f47d369296c2de6e3a1dbd5454'
project = 'zatca-invoice-generator'
deployment_id = 'b2bc54c2-54c4-42cc-98b4-86c5ffa3e761'

headers = {'Authorization': f'Bearer {token}'}

# Get deployment details
r = requests.get(
    f'https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project}/deployments/{deployment_id}',
    headers=headers
)
data = r.json()
print("Status:", data.get('result', {}).get('status'))
print("Errors:", json.dumps(data.get('errors', []), indent=2))
print("Latest stage:", json.dumps(data.get('result', {}).get('latest_stage', {}), indent=2))
