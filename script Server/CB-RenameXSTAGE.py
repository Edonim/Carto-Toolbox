import os
from pathlib import Path
import tkinter as tk
from tkinter import filedialog, messagebox

def gestisci_xstage_in_cartella(cartella):
    base_path = Path(cartella)
    xstage_files = list(base_path.glob("*.xstage"))

    if len(xstage_files) < 1:
        return

    # Ordina per data di modifica (più recente per primo)
    xstage_files.sort(key=lambda f: f.stat().st_mtime, reverse=True)
    file_recentissimo = xstage_files[0]
    altri_file = xstage_files[1:]

    # Prima rinomina tutti gli altri file come .bak
    for f in altri_file:
        backup_path = f.with_suffix(f.suffix + ".bak")
        print(f"Backup: {f.name} → {backup_path.name}")
        f.rename(backup_path)

    # Poi rinomina il file più recente a nome troncato di 11 caratteri
    nome = file_recentissimo.stem
    if len(nome) > 11:
        nuovo_nome = nome[:11] + file_recentissimo.suffix
        nuovo_path = file_recentissimo.with_name(nuovo_nome)
        if nuovo_path != file_recentissimo:
            print(f"Rinomino: {file_recentissimo.name} → {nuovo_path.name}")
            file_recentissimo.rename(nuovo_path)
    else:
        print(f"Nessun rinomino per: {file_recentissimo.name}")

def esegui_su_sottocartelle_primo_livello(base_folder):
    base_path = Path(base_folder)
    sottocartelle = [sub for sub in base_path.iterdir() if sub.is_dir()]

    for sottocartella in sottocartelle:
        gestisci_xstage_in_cartella(sottocartella)

    messagebox.showinfo("Completato", "Rinomina completata con successo!")

if __name__ == "__main__":
    root = tk.Tk()
    root.withdraw()

    folder_selected = filedialog.askdirectory(title="Seleziona la cartella base")
    if folder_selected:
        esegui_su_sottocartelle_primo_livello(folder_selected)
    else:
        print("Nessuna cartella selezionata.")
