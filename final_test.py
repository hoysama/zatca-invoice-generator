#!/usr/bin/env python3
import requests, json

API = "https://zatca-invoice-worker.hoysamax.workers.dev"

# Sign in
r = requests.post(f"{API}/api/auth/sign-in", json={"email": "final2@test.com", "password": "password123"})
token = r.json()["token"]
print(f"✅ Signed in. Token: {token[:30]}...")

# Get clients
r = requests.get(f"{API}/api/clients", headers={"Authorization": f"Bearer {token}"})
clients = r.json()["clients"]
print(f"✅ Clients: {len(clients)}")
for c in clients:
    print(f"   - {c['name']} (ID: {c['id']})")

# Create invoice
if clients:
    client_id = clients[0]["id"]
    r = requests.post(f"{API}/api/invoices", headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }, json={
        "clientId": client_id,
        "items": [
            {"description": "تصميم موقع إلكتروني", "quantity": 1, "unitPrice": 5000},
            {"description": "استضافة سنوية", "quantity": 1, "unitPrice": 1200}
        ],
        "notes": "شكراً لتعاملكم معنا"
    })
    inv = r.json()
    print(f"✅ Invoice created: {inv['invoice']['invoice_number']}")
    print(f"   Total: {inv['invoice']['total']} ر.س")
    
    # List invoices
    r = requests.get(f"{API}/api/invoices", headers={"Authorization": f"Bearer {token}"})
    invoices = r.json()["invoices"]
    print(f"✅ Total invoices: {len(invoices)}")
    for i in invoices:
        print(f"   - {i['invoice_number']}: {i['total']} ر.س")
