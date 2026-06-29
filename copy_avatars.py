import os
import shutil
import glob

brain_dir = r"C:\Users\vaska\.gemini\antigravity\brain\608ee10e-cbf5-420e-8624-231ac0d86799"
target_dir = r"C:\Users\vaska\Desktop\void-covenant\public\avatars"

os.makedirs(target_dir, exist_ok=True)

patterns = {
    "knight.png": "avatar_knight_*.png",
    "lich.png": "avatar_lich_*.png",
    "vampire.png": "avatar_vampire_*.png",
    "rogue.png": "avatar_rogue_*.png"
}

for dest_name, pattern in patterns.items():
    matches = glob.glob(os.path.join(brain_dir, pattern))
    if matches:
        shutil.copy(matches[0], os.path.join(target_dir, dest_name))
        print(f"Copied {matches[0]} to {dest_name}")
    else:
        print(f"No match for {pattern}")
