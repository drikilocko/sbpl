import os
from PIL import Image

def convert_png_to_webp(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith('.png'):
                png_path = os.path.join(root, file)
                webp_path = os.path.splitext(png_path)[0] + '.webp'
                
                try:
                    with Image.open(png_path) as img:
                        # Convert to RGB if necessary (e.g. for RGBA transparency support in WebP)
                        img.save(webp_path, 'webp', quality=85)
                    print(f"Converted: {png_path} -> {webp_path}")
                except Exception as e:
                    print(f"Error converting {png_path}: {e}")

if __name__ == "__main__":
    project_dir = os.getcwd()
    print(f"Starting conversion in: {project_dir}")
    convert_png_to_webp(project_dir)
    print("Conversion finished.")
