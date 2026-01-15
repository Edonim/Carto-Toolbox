function impostaCompositeVector() {
    
    var nodeType = ["COMPOSITE"];
    var nodesFound = node.getNodes(nodeType);

    System.println("--- Forza la Modalità Composite a 'Vector' per tutti i nodi ---");

    if (nodesFound.length > 0) {
        
        for (var i = 0; i < nodesFound.length; i++) {
            var path = nodesFound[i];
            var name = node.getName(path);
            
            // Attributo e Valore ESATTI (come stabilito dal file XSTAGE)
            var attributeName = "compositeMode"; 
            var requiredValue = "compositeVector"; 
            var attrIndex = 1; 

            // AZIONE BRUTALE: Nessun check, imposta direttamente il valore
            node.setTextAttr(path, attributeName, attrIndex, requiredValue); 
            
            System.println("Impostato: " + name + " (" + path + ") su 'compositeVector'.");
        }
        
    } else {
        System.println("Nessun nodo Composite trovato nella scena.");
    }
}

function disattivaColorCard() {
    
    // Il tipo di nodo per la Color Card è "COLORCARD"
    var nodeType = ["COLORCARD"];
    var nodesFound = node.getNodes(nodeType);

    System.println("--- Controllo e disattivazione nodi Color Card ---");

    if (nodesFound.length > 0) {
        
        for (var i = 0; i < nodesFound.length; i++) {
            var path = nodesFound[i];
            var name = node.getName(path);
            
            // Disattiva il nodo (false = 0)
            node.setEnable(path, false); 
            
            System.println("Disattivato: " + name + " (" + path + ")");
        }
        
    } else {
        System.println("Nessun nodo Color Card trovato in scena.");
    }
}

function disattivaCutter() {
    
    // Il tipo di nodo per il Cutter è "CUTTER"
    var nodeType = ["CUTTER"];
    var nodesFound = node.getNodes(nodeType);

    System.println("--- Controllo e disattivazione nodi Cutter ---");

    if (nodesFound.length > 0) {
        
        for (var i = 0; i < nodesFound.length; i++) {
            var path = nodesFound[i];
            var name = node.getName(path);
            
            // Disattiva il nodo (false)
            node.setEnable(path, false); 
            
            System.println("Disattivato: " + name + " (" + path + ")");
        }
        
    } else {
        System.println("Nessun nodo Cutter trovato in scena.");
    }
}


function CartoExport(exportFolder, exportFormat) {

    // Utilizziamo un oggetto per la mappatura dei progetti.
    var projects = {
        "MO": { path: "\\\\srv-harmony24\\usadata000\\00_OUTPUTMOV\\MORTINA\\", message: "Per tutte le zucche! Il progetto attuale è Mortina!" },
        "LS": { path: "\\\\srv-harmony24\\usadata000\\00_OUTPUTMOV\\LYON\\", message: "Il progetto attuale è Lyon, gli snack sono gratis!" },
        "SG": { path: "\\\\Carto-progetti\\PRODUZIONI\\MORTINA\\18_STYLE_GUIDE_LM\\03_MATERIALE_GRAFICO\\05_PDF_PROP\\", message: "Esporto in pdf per style guide"}
    };

    var exportPath = "";
    var projectFound = false;

    // Usiamo il ciclo for...in per iterare le proprietà dell'oggetto.

    for (var sigla in projects) {
        if (exportFolder.indexOf(sigla) !== -1) { 
            exportPath = projects[sigla].path + exportFolder + "\\";
            System.println(projects[sigla].message);
            projectFound = true;
            break;
        }
    }

    if (!projectFound) {
        exportPath = "\\\\srv-harmony24\\usadata000\\00_OUTPUTMOV\\NOT_DEFINED\\" + exportFolder + "\\";
        System.println("Il progetto non sembra essere stato definito in precedenza, esporto in NOT_DEFINED, sentire Edo o Vale");
    }

    System.println("Percorso impostato:" + exportPath);


    var IS_MP4 = false;
    var IS_PRORES = false;
    var IS_PDF = false; 
    // Dichiariamo gli array per i formati.
    var formatTypeLOW = ["MP4", "mp4", "H264", "Low"];
    var formatTypeHIGH = ["MOV", "mov", "ProRes", "PRORES", "High"];
    var formatTypePDF = ["PDF", "pdf", "Illustrator"];

    var formatFound = false;

    // Usiamo un ciclo for tradizionale per scorrere l'array, sostituendo .some()
    for (var i = 0; i < formatTypeLOW.length; i++) {
        if (exportFormat.toLowerCase().indexOf(formatTypeLOW[i].toLowerCase()) !== -1) {
            IS_MP4 = true;
            formatFound = true;
            break;
        }
    }

    if (formatFound) {
        System.println("Formato video selezionato H264");
    } else {
        for (var i = 0; i < formatTypeHIGH.length; i++) {
            if (exportFormat.toLowerCase().indexOf(formatTypeHIGH[i].toLowerCase()) !== -1) {
                IS_PRORES = true;
                formatFound = true;
                break;
            }
        }
        if (formatFound) {
            System.println("Formato video selezionato ProRes");
        } else {
            for (var i = 0; i < formatTypePDF.length; i++) {
                if (exportFormat.toLowerCase().indexOf(formatTypePDF[i].toLowerCase()) !== -1) {
                    IS_PDF = true;
                    formatFound = true;
                    break;
                }
            }
            if (formatFound) {
                System.println("Formato video selezionato PDF");
            } else {
                IS_PRORES = true;
                System.println("Nessun formato indicato, default a ProRes");
            }
        }
    }

    // Iniziamo a cercare il nodo write
    var sceneName = scene.currentScene();
    var burninNode = "Top/Burn-in";

    if (node.getEnable(burninNode)) {
        System.println("Burn-in attivo, lo disattivo...");
        node.setEnable(burninNode, false);
    }

    var nodeType = ["WRITE"];
    var nodesFound = node.getNodes(nodeType);
    var allow = ["Write_HIGH", "Write"];
    var writeNodePath = "";

    for (var i = 0; i < nodesFound.length; i++) {
        var path = nodesFound[i];
        var name = node.getName(path);
        var enable = allow.indexOf(name) !== -1; // Usiamo indexOf() su un array
        node.setEnable(path, enable);
        MessageLog.trace((enable ? "ENABLED " : "DISABLED ") + name);

        if (enable) {
            writeNodePath = path;
        }
    }

    if (exportFolder) {
        // Aggiorniamo il percorso del nodo Write
        node.setTextAttr(writeNodePath, "MOVIE_PATH", 1, exportPath + sceneName);
        node.setTextAttr(writeNodePath, "drawingName", 1, exportPath + sceneName);
        System.println("Percorso di esportazione aggiornato a: " + exportPath + sceneName);

        // Aggiustiamo la sintassi per evitare il parse error, usando && all'interno delle parentesi.
        if (IS_PRORES && !IS_MP4 && !IS_PDF) {
            node.setTextAttr(writeNodePath, "MOVIE_FORMAT", 1, "com.toonboom.prores.mov.1.0");
            node.setTextAttr(writeNodePath, "MOVIE_VIDEOAUDIO", 1, "com.toonboom.prores.mov.1.0:enableSound(1)com.toonboom.prores.mov.1.0:sampleRate(22050)com.toonboom.prores.mov.1.0:nChannels(2)com.toonboom.prores.mov.1.0:videoCodec(prores4444)com.toonboom.prores.mov.1.0:alpha(0)");
        } else if (IS_MP4 && !IS_PRORES && !IS_PDF) {
            node.setTextAttr(writeNodePath, "MOVIE_FORMAT", 1, "com.toonboom.mp4.1.0");
        } else if (IS_PDF && !IS_PRORES && !IS_MP4) {
            // imposta il tipo di esportazione come immagini
            node.setTextAttr(writeNodePath, "exportToMovie", 0, "false");
            node.setTextAttr(writeNodePath, "EXPORT_TYPE", 1, "Images");
            node.setTextAttr(writeNodePath, "DRAWING_TYPE", 1, "PDF");
            impostaCompositeVector()
            disattivaColorCard()
            disattivaCutter()
        }
    } // Fine del blocco if (exportFolder)

} // Fine della funzione CartoExport
