import os
import shutil
import traceback

def flatten_nested_scenes(main_dir):
    successi = 0
    errori = 0
    skippati = 0

    print(f"\n🔍 Scansione cartelle in: {main_dir}\n")

    for folder in os.listdir(main_dir):
        outer_path = os.path.join(main_dir, folder)

        if not os.path.isdir(outer_path):
            continue

        try:
            subfolders = [f for f in os.listdir(outer_path) if os.path.isdir(os.path.join(outer_path, f))]

            # Corrispondenza: una sola sottocartella col nome uguale
            if len(subfolders) == 1 and subfolders[0] == folder:
                inner_path = os.path.join(outer_path, folder)
                print(f"📂 Appiattisco: {inner_path}")

                for item in os.listdir(inner_path):
                    src = os.path.join(inner_path, item)
                    dst = os.path.join(outer_path, item)

                    if os.path.exists(dst):
                        print(f"⚠️ Skippato (esiste già): {dst}")
                        skippati += 1
                        continue

                    shutil.move(src, dst)

                os.rmdir(inner_path)
                print(f"✅ '{inner_path}' sistemata.\n")
                successi += 1
            else:
                print(f"➖ Nessuna cartella annidata trovata in: {outer_path}\n")

        except Exception as e:
            print(f"❌ Errore con '{outer_path}': {e}")
            traceback.print_exc()
            errori += 1

    # Report finale
    print("\n📊 Report finale:")
    print(f"  ✅ Sistemate: {successi}")
    print(f"  ⚠️ Skippate (file già presenti): {skippati}")
    print(f"  ❌ Errori: {errori}\n")

if __name__ == "__main__":
    folder_path = input("📂 Inserisci il percorso della cartella principale: ").strip()
    if os.path.isdir(folder_path):
        flatten_nested_scenes(folder_path)
    else:
        print("❌ Percorso non valido.")
