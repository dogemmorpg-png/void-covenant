import os
import sys
from PIL import Image, ImageFilter

def remove_background(image_path, output_path, threshold=45):
    if not os.path.exists(image_path):
        print(f"File not found: {image_path}")
        return False
        
    img = Image.open(image_path).convert("RGBA")
    width, height = img.size
    
    # Find background using flood fill from the 4 corners
    visited = set()
    bg_mask = Image.new("L", (width, height), 255) # 255 means keep, 0 means transparent
    
    # Initialize queue with corners
    queue = [(0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)]
    for x, y in queue:
        visited.add((x, y))
        
    while queue:
        cx, cy = queue.pop(0)
        r, g, b, a = img.getpixel((cx, cy))
        if max(r, g, b) < threshold:
            bg_mask.putpixel((cx, cy), 0)
            
            # Check 4 directions
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                    visited.add((nx, ny))
                    queue.append((nx, ny))
                    
    # Apply a slight Gaussian blur to the mask to feather and smooth the edges
    bg_mask = bg_mask.filter(ImageFilter.GaussianBlur(1.2))
    
    # Combine mask with the original image alpha
    img_data = img.getdata()
    mask_data = bg_mask.getdata()
    
    new_data = []
    for i in range(len(img_data)):
        r, g, b, a = img_data[i]
        mask_val = mask_data[i]
        new_data.append((r, g, b, int(a * (mask_val / 255.0))))
        
    img.putdata(new_data)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG")
    print(f"Converted {os.path.basename(image_path)} -> {output_path} (threshold={threshold})")
    return True

def main():
    base_dir = r"C:\Users\vaska\.gemini\antigravity\brain\352d29a2-d3f7-4da2-a122-c063b90b6234"
    public_icons_dir = r"C:\Users\vaska\Desktop\void-covenant\public\icons"
    
    targets = [
        ("crown_icon_1787757299396.jpg", "crown.png", 45),
        ("arena_ticket_1787757323414.jpg", "ticket.png", 45),
        ("league_bronze_1787757344112.jpg", "league_bronze.png", 45),
        ("league_silver_1787757372192.jpg", "league_silver.png", 45),
        ("league_gold_1787757397975.jpg", "league_gold.png", 45),
        ("league_platinum_1787757488443.jpg", "league_platinum.png", 45),
        ("league_diamond_1787757550304.jpg", "league_diamond.png", 45),
        ("league_void_overlord_1787757608378.jpg", "league_void_overlord.png", 45),
    ]
    
    for filename, out_name, thresh in targets:
        src = os.path.join(base_dir, filename)
        dest = os.path.join(public_icons_dir, out_name)
        remove_background(src, dest, thresh)

if __name__ == "__main__":
    main()
