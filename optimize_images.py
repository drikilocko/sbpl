import os
from PIL import Image

def optimize_images(root_dir):
    print(f"--- Début de l'optimisation dans : {root_dir} ---")
    
    # Extensions à traiter
    valid_extensions = ('.webp', '.jpg', '.jpeg', '.png')
    
    for subdir, dirs, files in os.walk(root_dir):
        for file in files:
            if file.lower().endswith(valid_extensions):
                file_path = os.path.join(subdir, file)
                
                # Déterminer la qualité selon le dossier
                # Si le dossier contient "frame", on baisse à 60%
                quality = 60 if "frame" in subdir.lower() else 75
                
                try:
                    with Image.open(file_path) as img:
                        original_width, original_height = img.size
                        
                        # 1. Redimensionnement si > 1920px
                        if original_width > 1920:
                            new_width = 1920
                            new_height = int((1920 / original_width) * original_height)
                            img = img.resize((new_width, new_height), Image.LANCZOS)
                            print(f"[RESIZE] {file} : {original_width}px -> 1920px")
                        
                        # 2. Sauvegarde / Conversion en WebP optimisé
                        # On peut écraser le fichier ou changer l'extension
                        # Ici on garde le même nom mais on optimise le flux
                        img.save(file_path, "WEBP", quality=quality, method=6)
                        
                        new_size = os.path.getsize(file_path) / 1024
                        print(f"[OK] {file} optimisé (Qualité: {quality}%, Taille: {new_size:.1f} KB)")
                        
                except Exception as e:
                    print(f"[ERREUR] Impossible de traiter {file} : {e}")

    print("--- Optimisation terminée ! ---")

if __name__ == "__main__":
    # On cible le dossier courant
    optimize_images(".")
