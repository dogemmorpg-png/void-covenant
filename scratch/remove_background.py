import sys
import os
from PIL import Image, ImageFilter

def remove_background(image_path, output_path, threshold=45):
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
    img.save(output_path, "PNG")
    print(f"Saved transparent PNG to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python remove_background.py <input_image> <output_image> [threshold]")
        sys.exit(1)
        
    input_img = sys.argv[1]
    output_img = sys.argv[2]
    thresh = int(sys.argv[3]) if len(sys.argv) > 3 else 45
    
    remove_background(input_img, output_img, thresh)
