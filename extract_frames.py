import cv2
import os
import shutil

def extract_frames(video_path, output_dir, target_width=1920, webp_quality=85, target_fps=120.0):
    if os.path.exists(output_dir):
        for filename in os.listdir(output_dir):
            if filename.endswith('.webp'):
                try:
                    os.remove(os.path.join(output_dir, filename))
                except Exception:
                    pass
    else:
        os.makedirs(output_dir)
    
    vidcap = cv2.VideoCapture(video_path)
    if not vidcap.isOpened():
        print(f"Error opening video {video_path}")
        return 0
        
    original_fps = vidcap.get(cv2.CAP_PROP_FPS)
    if original_fps == 0:
        original_fps = 30.0 # fallback

    success, image = vidcap.read()
    if not success:
        return 0

    frame_count = 0
    saved_count = 1
    
    while success:
        current_video_time = frame_count / original_fps
        next_save_time = (saved_count - 1) / target_fps
        
        if current_video_time >= next_save_time:
            # Calculer le ratio
            height, width = image.shape[:2]
            ratio = target_width / float(width)
            target_height = int(height * ratio)
            
            # Redimensionnement
            resized_image = cv2.resize(image, (target_width, target_height), interpolation=cv2.INTER_AREA)
            
            # Enregistrer en format WebP au lieu de JPEG
            frame_path = os.path.join(output_dir, f"{saved_count}.webp")
            cv2.imwrite(frame_path, resized_image, [int(cv2.IMWRITE_WEBP_QUALITY), webp_quality])
            
            saved_count += 1
            continue
            
        success, image = vidcap.read()
        frame_count += 1
        
    print(f"Extracted {saved_count - 1} ultra-high-quality WebP frames (at {target_fps}fps) to {output_dir}")
    return saved_count - 1

if __name__ == "__main__":
    print("Optimization started (Ultra WebP)...")
    count1 = extract_frames("1.mp4", "frame 1", target_width=1920, webp_quality=85, target_fps=60.0)
    count2 = extract_frames("2.mp4", "frame 2", target_width=1920, webp_quality=85, target_fps=60.0)
    
    with open("frame_counts.txt", "w") as f:
        f.write(f"{count1}\n{count2}\n")
    print("Optimization finished!")
