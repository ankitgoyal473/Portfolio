"""
Test the Razorpay verify route end-to-end without making a real payment.
Crafts a valid HMAC signature and POSTs to the local dev server.

Usage:
  1. Start dev server: npm run dev  (in web/)
  2. Run: python scripts/test_purchase_flow.py
"""

import hmac, hashlib, json, urllib.request, time

# --- Config ---
BASE_URL = "http://localhost:3000"
RAZORPAY_KEY_SECRET = "JMFkmPgOa1C9dqZGV5WJ1HZc"
TEST_EMAIL = "ankitgoyal473@gmail.com"
PRODUCT_SLUG = "warren"

# Fake IDs (same format Razorpay uses)
fake_order_id  = f"order_test_{int(time.time())}"
fake_payment_id = f"pay_test_{int(time.time()) + 1}"

# Compute valid HMAC (same logic as verify/route.ts)
body = f"{fake_order_id}|{fake_payment_id}"
signature = hmac.new(
    RAZORPAY_KEY_SECRET.encode(),
    body.encode(),
    hashlib.sha256
).hexdigest()

payload = {
    "razorpay_payment_id": fake_payment_id,
    "razorpay_order_id":   fake_order_id,
    "razorpay_signature":  signature,
    "product_slug":        PRODUCT_SLUG,
    "email":               TEST_EMAIL,
}

print(f"POST {BASE_URL}/api/razorpay/verify")
print(f"order_id:   {fake_order_id}")
print(f"payment_id: {fake_payment_id}")
print()

req = urllib.request.Request(
    f"{BASE_URL}/api/razorpay/verify",
    data=json.dumps(payload).encode(),
    method="POST",
    headers={"Content-Type": "application/json"},
)

try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read())
        print("Status: 200 OK")
        if data.get("downloadUrl"):
            print("Download URL: OK (first 80 chars)")
            print(" ", data["downloadUrl"][:80] + "...")
            print()
            print("PASS - signed URL generated, email sent to", TEST_EMAIL)
        else:
            print("fallback=True - storage error, check Supabase bucket")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"Error {e.code}: {body}")
    print()
    print("FAIL")
