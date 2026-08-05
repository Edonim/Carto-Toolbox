# 📦 Batch Appiattisci Gruppi BG

Uno script **ExtendScript (.jsx)** per **Adobe Photoshop** che elabora automaticamente intere cartelle di file **PSD** e **PSB**, appiattendo tutti i gruppi contenuti nelle cartelle chiamate **"BG"**.

Ideale per pipeline di produzione in cui è necessario preparare grandi quantità di file mantenendo una struttura coerente e riducendo il lavoro manuale.

---

## ✨ Funzionalità

- 📂 Elabora automaticamente tutti i file **PSD** e **PSB** di una cartella.
- 🔄 Supporta l'elaborazione ricorsiva delle sottocartelle.
- 🗂 Cerca automaticamente tutti i gruppi chiamati **BG** (anche annidati).
- 🖼 Appiattisce tutti i sottogruppi contenuti all'interno delle cartelle **BG**.
- 🔓 Sblocca automaticamente livelli e gruppi bloccati prima del merge.
- 💾 Salva i file elaborati in una cartella di output dedicata.
- 📝 Possibilità di aggiungere il suffisso `_MG` ai file esportati.
- 📊 Barra di avanzamento durante l'elaborazione.
- ✅ Report finale con file elaborati, saltati ed eventuali errori.

---

## 🎯 Perché nasce questo script?

Durante la produzione di serie animate o progetti con numerosi fondali, è comune avere centinaia di file PSD organizzati con una cartella **BG** contenente diversi gruppi di livelli.

Appiattire manualmente questi gruppi è un'operazione lunga, ripetitiva e soggetta a errori.

Questo script automatizza completamente il processo, consentendo di elaborare centinaia di file in pochi minuti e mantenendo una pipeline di lavoro uniforme.

---

## 📋 Requisiti

- Adobe Photoshop **CS6** o versioni successive
- Supporto agli script **ExtendScript (.jsx)**

---

## 🚀 Come si usa

1. Avvia lo script in Photoshop.
2. Seleziona la cartella contenente i file **PSD/PSB**.
3. Seleziona la cartella di destinazione.
4. Scegli se:
   - elaborare anche le sottocartelle;
   - aggiungere il suffisso `_MG` ai file generati.
5. Premi **Avvia**.

Lo script elaborerà automaticamente tutti i documenti trovati e, al termine, mostrerà un riepilogo con il risultato dell'operazione.

---

## 📁 Output

Per ogni documento elaborato:

- vengono appiattiti i gruppi contenuti nelle cartelle **BG**;
- il resto della struttura del PSD rimane invariato;
- il file viene salvato nella cartella di destinazione mantenendo, se richiesto, la struttura delle sottocartelle originali.

---

## 🛠 Tecnologie

- Adobe Photoshop
- ExtendScript (JavaScript)
