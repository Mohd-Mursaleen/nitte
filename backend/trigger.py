import urllib.request
import json

url = "http://localhost:8000/session/complete"
data = {
    "name": "Test User",
    "bhk_type": "2 BHK",
    "locality": "Electronic City",
    "budget_range": "15000-20000",
    "furnishing_type": "semi-furnished",
}

req = urllib.request.Request(
    url,
    data=json.dumps(data).encode(),
    headers={"Content-Type": "application/json"},
    method="POST",
)

with urllib.request.urlopen(req) as res:
    print("Response:", json.loads(res.read()))
