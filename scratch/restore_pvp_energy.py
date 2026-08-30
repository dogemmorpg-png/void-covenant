import urllib.request
import json
import time

url = "https://yetzjqqnmllwufmzopor.supabase.co/rest/v1/profiles"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4"

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

print("Fetching profiles...")
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        rows = json.loads(response.read().decode('utf-8'))
        target = None
        for r in rows:
            if r.get('data') and r['data'].get('username') and r['data']['username'].lower() == 'adminus':
                target = r
                break
        
        if target:
            wallet = target['wallet_address']
            profile_data = target['data']
            profile_data['pvpEnergy'] = profile_data.get('pvpEnergyMax', 5)
            profile_data['lastPvpEnergyRefill'] = int(time.time() * 1000)
            
            patch_url = f"{url}?wallet_address=eq.{wallet}"
            patch_data = json.dumps({"data": profile_data, "updated_at": "now()"}).encode('utf-8')
            
            patch_req = urllib.request.Request(patch_url, data=patch_data, headers=headers, method='PATCH')
            with urllib.request.urlopen(patch_req) as patch_response:
                print(f"Successfully restored PvP energy to {profile_data['pvpEnergy']} for Adminus!")
        else:
            print("Adminus not found. Registered usernames:")
            for r in rows:
                if r.get('data') and r['data'].get('username'):
                    print("-", r['data']['username'])
except Exception as e:
    print("Error:", e)
