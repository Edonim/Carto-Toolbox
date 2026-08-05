/*
    Batch Appiattisci Gruppi BG.jsx

    Descrizione:
    Script Photoshop per elaborare in batch file PSD e PSB in una cartella,
    appiattendo tutti i gruppi di livelli contenuti nella cartella "BG",
    e salvando il risultato in una cartella di output.

    Compatibilita:
    Adobe Photoshop CS6 e versioni successive.
*/

// Abilita il doppio click da Esplora File o Mac Finder
#target photoshop

function main() {
    // Statistiche di elaborazione
    var stats = {
        success: 0,
        errors: 0,
        skipped: 0,
        errorList: []
    };

    // Mostra l'interfaccia di configurazione
    var config = showUI();
    if (!config) {
        return; // Utente ha annullato
    }

    // Scansiona i file
    var files = [];
    getFilesRecursive(config.inputFolder, files, config.processSubfolders);

    if (files.length === 0) {
        alert("Non trovo file PSD o PSB nella cartella di input selezionata.", "Nessun File Trovato", false);
        return;
    }

    // Crea la cartella di output se non esiste
    if (!config.outputFolder.exists) {
        config.outputFolder.create();
    }

    // --- Barra di avanzamento ---
    // Viene mostrata come palette PRIMA di qualsiasi operazione sui file,
    // con una piccola pausa per permettere a Photoshop di renderizzarla.
    var progressWin = new Window("palette", "Appiattimento Gruppi BG in corso...");
    progressWin.orientation = "column";
    progressWin.alignChildren = ["fill", "top"];
    progressWin.spacing = 8;
    progressWin.margins = 16;

    var progressLabel = progressWin.add("statictext", undefined, "Inizializzazione...", { truncate: "middle" });
    progressLabel.preferredSize.width = 400;

    var progressBar = progressWin.add("progressbar", undefined, 0, files.length);
    progressBar.preferredSize.width = 400;

    var progressCounter = progressWin.add("statictext", undefined, "0 / " + files.length + " file");
    progressCounter.alignment = "right";

    progressWin.show();

    // Pausa per dare tempo a Photoshop di renderizzare la palette
    // prima di entrare nel ciclo di elaborazione pesante
    $.sleep(300);

    // Disabilita i dialoghi di Photoshop durante l'elaborazione
    app.displayDialogs = DialogModes.NO;

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var doc = null;

        // Aggiorna la barra di avanzamento
        progressLabel.text = file.name;
        progressBar.value = i;
        progressCounter.text = (i + 1) + " / " + files.length + " file";
        progressWin.update();

        try {
            // Apri il file
            doc = app.open(file);

            // Cerca tutti i gruppi chiamati "BG" (case-insensitive)
            var bgGroups = [];
            findBGGroups(doc, bgGroups);

            // Controlla se esistono gruppi "BG" con sottogruppi da appiattire
            var hasGroupsToFlatten = false;
            for (var g = 0; g < bgGroups.length; g++) {
                if (bgGroups[g].layerSets.length > 0) {
                    hasGroupsToFlatten = true;
                    break;
                }
            }

            if (!hasGroupsToFlatten) {
                stats.skipped++;
                doc.close(SaveOptions.DONOTSAVECHANGES);
            } else {
                // Appiattisci tutti i gruppi dentro la cartella "BG"
                flattenBGGroups(doc);

                // Prepara il nome e il percorso del file di output
                var baseName = file.name.substring(0, file.name.lastIndexOf("."));
                var ext = file.name.substring(file.name.lastIndexOf("."));
                var suffix = config.appendSuffix ? "_MG" : "";
                var newName = baseName + suffix + ext;

                // Determina la destinazione (preserva la struttura di sottocartelle se richiesto)
                var relativePath = "";
                if (config.processSubfolders) {
                    relativePath = getRelativePath(config.inputFolder, file.parent);
                }

                var destFolder = config.outputFolder;
                if (relativePath !== "") {
                    destFolder = new Folder(config.outputFolder.fsName + "/" + relativePath);
                    if (!destFolder.exists) {
                        destFolder.create();
                    }
                }

                var saveFile = new File(destFolder.fsName + "/" + newName);

                // Opzioni di salvataggio PSD
                var psdSaveOptions = new PhotoshopSaveOptions();
                psdSaveOptions.layers = true;
                psdSaveOptions.embedColorProfile = true;
                psdSaveOptions.annotations = true;
                psdSaveOptions.alphaChannels = true;
                psdSaveOptions.spotColors = true;

                // Salva e chiudi
                doc.saveAs(saveFile, psdSaveOptions, true, Extension.LOWERCASE);
                doc.close(SaveOptions.DONOTSAVECHANGES);
                stats.success++;
            }

        } catch (e) {
            stats.errors++;
            stats.errorList.push(file.name + ": " + e.message);
            if (doc !== null) {
                try { doc.close(SaveOptions.DONOTSAVECHANGES); } catch (err) {}
            }
        }
    }

    // Chiudi la barra di avanzamento
    progressWin.close();

    // Ripristina i dialoghi di Photoshop
    app.displayDialogs = DialogModes.ALL;

    // Mostra il rapporto finale
    var report = "Elaborazione completata!\n\n" +
        "Elaborati con successo:  " + stats.success + " file\n" +
        "Saltati (nessun gruppo BG):  " + stats.skipped + " file\n" +
        "Falliti:  " + stats.errors + " file";

    if (stats.errors > 0) {
        report += "\n\nErrori riscontrati:\n" + stats.errorList.slice(0, 5).join("\n");
        if (stats.errorList.length > 5) {
            report += "\n...e altri " + (stats.errorList.length - 5) + ".";
        }
    }

    alert(report, "Elaborazione Completata", false);
}

// Interfaccia utente di configurazione
function showUI() {
    var dialog = new Window("dialog", "Appiattisci Gruppi BG - Batch");
    dialog.orientation = "column";
    dialog.alignChildren = ["fill", "top"];
    dialog.spacing = 12;
    dialog.margins = 16;

    var inputFolder = null;
    var outputFolder = null;

    // Selezione cartella di input
    var inputPanel = dialog.add("panel", undefined, "Cartella di Input");
    inputPanel.orientation = "row";
    inputPanel.alignChildren = ["left", "center"];
    inputPanel.spacing = 10;
    inputPanel.margins = 12;
    var inputPathText = inputPanel.add("statictext", undefined, "Nessuna cartella selezionata...", { truncate: "middle" });
    inputPathText.preferredSize.width = 300;
    var inputBtn = inputPanel.add("button", undefined, "Sfoglia...");
    inputBtn.onClick = function() {
        var folder = Folder.selectDialog("Seleziona la cartella contenente i file PSD/PSB");
        if (folder != null) {
            inputFolder = folder;
            inputPathText.text = folder.fsName;
        }
    };

    // Selezione cartella di output
    var outputPanel = dialog.add("panel", undefined, "Cartella di Output");
    outputPanel.orientation = "row";
    outputPanel.alignChildren = ["left", "center"];
    outputPanel.spacing = 10;
    outputPanel.margins = 12;
    var outputPathText = outputPanel.add("statictext", undefined, "Nessuna cartella selezionata...", { truncate: "middle" });
    outputPathText.preferredSize.width = 300;
    var outputBtn = outputPanel.add("button", undefined, "Sfoglia...");
    outputBtn.onClick = function() {
        var folder = Folder.selectDialog("Seleziona la cartella di destinazione per i file elaborati");
        if (folder != null) {
            outputFolder = folder;
            outputPathText.text = folder.fsName;
        }
    };

    // Impostazioni
    var settingsPanel = dialog.add("panel", undefined, "Impostazioni");
    settingsPanel.orientation = "column";
    settingsPanel.alignChildren = ["left", "top"];
    settingsPanel.spacing = 8;
    settingsPanel.margins = 12;

    var checkRecursive = settingsPanel.add("checkbox", undefined, "Elabora le sottocartelle in modo ricorsivo");
    var checkSuffix = settingsPanel.add("checkbox", undefined, "Aggiungi '_MG' al nome dei file di output");
    checkSuffix.value = true;

    // Pulsanti Avvia / Annulla
    var btnGroup = dialog.add("group");
    btnGroup.alignment = "right";
    btnGroup.spacing = 8;
    var cancelBtn = btnGroup.add("button", undefined, "Annulla", { name: "cancel" });
    var runBtn = btnGroup.add("button", undefined, "Avvia", { name: "ok" });

    var processSubfolders = false;
    var appendSuffix = true;

    runBtn.onClick = function() {
        if (inputFolder == null) {
            alert("Seleziona una cartella di input.");
            return;
        }
        if (outputFolder == null) {
            alert("Seleziona una cartella di output.");
            return;
        }
        if (inputFolder.fsName === outputFolder.fsName && !checkSuffix.value) {
            alert("Le cartelle di input e output sono le stesse e il suffisso '_MG' e' disabilitato.\n\nPer non sovrascrivere i file originali, seleziona una cartella di output diversa oppure abilita il suffisso '_MG'.");
            return;
        }

        // Leggi i valori prima che la dialog venga chiusa
        processSubfolders = checkRecursive.value;
        appendSuffix = checkSuffix.value;
        dialog.close(1);
    };

    cancelBtn.onClick = function() {
        dialog.close(0);
    };

    if (dialog.show() === 1) {
        return {
            inputFolder: inputFolder,
            outputFolder: outputFolder,
            processSubfolders: processSubfolders,
            appendSuffix: appendSuffix
        };
    }
    return null;
}

// Scansiona ricorsivamente i file PSD/PSB nella cartella
function getFilesRecursive(folder, filesArray, recursive) {
    var files = folder.getFiles();
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (file instanceof Folder) {
            if (recursive) {
                getFilesRecursive(file, filesArray, recursive);
            }
        } else if (file instanceof File) {
            if (file.name.match(/\.(psd|psb)$/i)) {
                filesArray.push(file);
            }
        }
    }
}

// Calcola il percorso relativo di una sottocartella rispetto alla cartella radice
function getRelativePath(rootFolder, subFolder) {
    var rootPath = rootFolder.fsName;
    var subPath = subFolder.fsName;
    if (subPath.indexOf(rootPath) === 0) {
        var rel = subPath.substring(rootPath.length);
        if (rel.charAt(0) === "/" || rel.charAt(0) === "\\") {
            rel = rel.substring(1);
        }
        return rel;
    }
    return "";
}

// Cerca ricorsivamente tutti i gruppi chiamati "BG" (case-insensitive)
function findBGGroups(parent, bgGroups) {
    var groups = parent.layerSets;
    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        if (group.name.toUpperCase() === "BG") {
            bgGroups.push(group);
        }
        findBGGroups(group, bgGroups);
    }
}

// Appiattisce tutti i gruppi contenuti in qualsiasi gruppo chiamato "BG"
function flattenBGGroups(doc) {
    var bgGroups = [];
    findBGGroups(doc, bgGroups);

    for (var g = 0; g < bgGroups.length; g++) {
        var bgGroup = bgGroups[g];
        var innerGroups = bgGroup.layerSets;
        // Loop al contrario: il merge rimuove il gruppo dalla lista
        for (var i = innerGroups.length - 1; i >= 0; i--) {
            try {
                var group = innerGroups[i];
                unlockLayersRecursively(group);
                group.merge();
            } catch (e) {
                // Se il merge fallisce, continua con gli altri gruppi
            }
        }
    }
}

// Sblocca ricorsivamente tutti i livelli e gruppi in un LayerSet
function unlockLayersRecursively(layerSet) {
    try { layerSet.locked = false; } catch (e) {}
    try { layerSet.allLocked = false; } catch (e) {}

    for (var i = 0; i < layerSet.layers.length; i++) {
        var layer = layerSet.layers[i];
        try { layer.locked = false; } catch (e) {}

        if (layer.typename === "LayerSet") {
            unlockLayersRecursively(layer);
        }
    }
}

// Avvia lo script
main();
