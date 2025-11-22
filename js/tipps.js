// ===================================
// TIPPS.JS - Lerntipps Page Functionality
// ===================================

// Lerntipps Data - 100 verschiedene Tipps von konventionell bis unkonventionell
const lerntipps = [
    // Konventionelle Lernmethoden (1-30)
    { title: 'Die Feynman-Methode', description: 'Erkläre das Thema so, als würdest du es einem 5-Jährigen beibringen. Wenn du stecken bleibst, hast du eine Wissenslücke gefunden!', category: 'methode', subject: 'allgemein', difficulty: 'anfaenger', icon: '🧠' },
    { title: 'Spaced Repetition', description: 'Wiederhole Inhalte in immer größeren Abständen: Tag 1, 3, 7, 14, 30. So bleibt alles im Langzeitgedächtnis!', category: 'gedaechtnis', subject: 'allgemein', difficulty: 'anfaenger', icon: '🔁' },
    { title: 'Active Recall', description: 'Teste dich selbst BEVOR du lernst. Dein Gehirn merkt sich besser, was es aktiv abrufen musste!', category: 'methode', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '⚡' },
    { title: 'Pomodoro-Technik', description: '25 Minuten fokussiert lernen, 5 Minuten Pause. Nach 4 Sessions eine längere Pause von 15-30 Minuten.', category: 'organisation', subject: 'allgemein', difficulty: 'anfaenger', icon: '🍅' },
    { title: 'Memory Palace', description: 'Verknüpfe Informationen mit einem bekannten Ort (z.B. dein Zuhause). Spaziere gedanklich durch und sammel Wissen!', category: 'gedaechtnis', subject: 'allgemein', difficulty: 'profi', icon: '🏛️' },
    { title: 'Cornell Notes', description: 'Teile Seite in 3 Bereiche: Notizen, Schlüsselwörter, Zusammenfassung. Perfekt für strukturiertes Lernen!', category: 'organisation', subject: 'allgemein', difficulty: 'anfaenger', icon: '📝' },
    { title: 'SQ3R-Methode', description: 'Survey, Question, Read, Recite, Review - eine bewährte Lesestrategie für Lehrbücher und Texte.', category: 'methode', subject: 'allgemein', difficulty: 'anfaenger', icon: '📖' },
    { title: 'Mind Mapping', description: 'Erstelle visuelle Diagramme mit Hauptthema in der Mitte und verzweigten Unterthemen. Ideal für komplexe Themen!', category: 'organisation', subject: 'allgemein', difficulty: 'anfaenger', icon: '🗺️' },
    { title: 'Lernkarten', description: 'Erstelle Karteikarten mit Frage auf einer Seite und Antwort auf der anderen. Wiederhole regelmäßig!', category: 'gedaechtnis', subject: 'allgemein', difficulty: 'anfaenger', icon: '🃏' },
    { title: 'Zusammenfassungen schreiben', description: 'Fasse jeden Abschnitt in eigenen Worten zusammen. Das zwingt dich zum aktiven Denken!', category: 'methode', subject: 'allgemein', difficulty: 'anfaenger', icon: '✍️' },
    { title: 'Lerngruppen', description: 'Lerne mit anderen zusammen, erklärt euch gegenseitig die Themen und profitiert voneinander!', category: 'methode', subject: 'allgemein', difficulty: 'anfaenger', icon: '👥' },
    { title: 'Lernplan erstellen', description: 'Plane deine Lernzeiten im Voraus und halte dich daran. Struktur ist der Schlüssel zum Erfolg!', category: 'organisation', subject: 'allgemein', difficulty: 'anfaenger', icon: '📅' },
    { title: 'Farb-Kodierung', description: 'Nutze verschiedene Farben für verschiedene Themen oder Wichtigkeitsgrade. Visuelle Unterscheidung hilft!', category: 'organisation', subject: 'allgemein', difficulty: 'anfaenger', icon: '🎨' },
    { title: 'Laut vorlesen', description: 'Lies den Stoff laut vor. Durch Hören und Sprechen aktivierst du mehrere Sinne gleichzeitig!', category: 'methode', subject: 'allgemein', difficulty: 'anfaenger', icon: '📢' },
    { title: 'Pausen machen', description: 'Nach 45-60 Minuten Lernen brauchst du eine Pause. Dein Gehirn braucht Zeit zum Verarbeiten!', category: 'organisation', subject: 'allgemein', difficulty: 'anfaenger', icon: '☕' },
    { title: 'Morgenstunden nutzen', description: 'Lerne wichtige Dinge morgens, wenn dein Gehirn noch frisch ist. Der frühe Vogel fängt den Wurm!', category: 'organisation', subject: 'allgemein', difficulty: 'anfaenger', icon: '🌅' },
    { title: 'Wiederholungen planen', description: 'Wiederhole neues Wissen nach 1 Tag, 1 Woche, 1 Monat. So wandert es ins Langzeitgedächtnis!', category: 'gedaechtnis', subject: 'allgemein', difficulty: 'anfaenger', icon: '🔄' },
    { title: 'Lernumgebung optimieren', description: 'Schaffe einen ruhigen, aufgeräumten Lernplatz mit gutem Licht. Die Umgebung beeinflusst deine Leistung!', category: 'organisation', subject: 'allgemein', difficulty: 'anfaenger', icon: '🪑' },
    { title: 'Ziele setzen', description: 'Setze dir klare, erreichbare Lernziele für jede Session. Was willst du heute schaffen?', category: 'motivation', subject: 'allgemein', difficulty: 'anfaenger', icon: '🎯' },
    { title: 'Belohnungen einbauen', description: 'Belohne dich nach erfolgreichen Lernsessions. Positive Verstärkung motiviert!', category: 'motivation', subject: 'allgemein', difficulty: 'anfaenger', icon: '🎁' },
    { title: 'Ablenkungen eliminieren', description: 'Handy weg, Social Media aus. Fokus ist alles beim Lernen!', category: 'organisation', subject: 'allgemein', difficulty: 'anfaenger', icon: '📵' },
    { title: 'Teaching Method', description: 'Erkläre das Gelernte jemand anderem oder deinem Teddy. Wenn du es lehren kannst, hast du es verstanden!', category: 'methode', subject: 'allgemein', difficulty: 'anfaenger', icon: '🧸' },
    { title: 'Prüfungssimulation', description: 'Übe unter Prüfungsbedingungen: Zeitlimit, keine Hilfsmittel. So gewöhnst du dich an den Stress!', category: 'methode', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '⏱️' },
    { title: 'Schreibschrift nutzen', description: 'Handschriftliche Notizen fördern das Gedächtnis besser als Tippen. Die motorische Aktivität hilft!', category: 'methode', subject: 'allgemein', difficulty: 'anfaenger', icon: '✒️' },
    { title: 'Fragen stellen', description: 'Stelle dir selbst Fragen zum Thema und beantworte sie. Aktives Denken statt passives Lesen!', category: 'methode', subject: 'allgemein', difficulty: 'anfaenger', icon: '❓' },
    { title: 'Eselsbrücken bauen', description: 'Erstelle merkwürdige, lustige Eselsbrücken für schwierige Inhalte. Je absurder, desto besser!', category: 'gedaechtnis', subject: 'allgemein', difficulty: 'anfaenger', icon: '🫏' },
    { title: 'Schlaf ist wichtig', description: 'Mindestens 7-8 Stunden Schlaf! Im Schlaf verarbeitet dein Gehirn das Gelernte.', category: 'organisation', subject: 'allgemein', difficulty: 'anfaenger', icon: '😴' },
    { title: 'Wasser trinken', description: 'Bleib hydratisiert! Dein Gehirn braucht Wasser für optimale Leistung.', category: 'organisation', subject: 'allgemein', difficulty: 'anfaenger', icon: '💧' },
    { title: 'Bewegung einbauen', description: 'Kurze Bewegungspausen fördern die Durchblutung und Konzentration. Steh auf, streck dich!', category: 'organisation', subject: 'allgemein', difficulty: 'anfaenger', icon: '🤸' },
    { title: '2-Minuten-Regel', description: 'Wenn eine Aufgabe unter 2 Minuten dauert, mach sie SOFORT. Überwinde Prokrastination in Sekunden!', category: 'motivation', subject: 'allgemein', difficulty: 'anfaenger', icon: '💪' },

    // Fortgeschrittene Methoden (31-60)
    { title: 'Interleaving', description: 'Wechsle zwischen verschiedenen Themen statt eines zu perfektionieren. Dein Gehirn lernt besser durch Kontraste!', category: 'methode', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '🔀' },
    { title: 'Elaborative Interrogation', description: 'Frage dich bei jedem Fakt: "Warum ist das so?" Die Erklärung hilft beim Merken!', category: 'methode', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '🤔' },
    { title: 'Self-Explanation', description: 'Erkläre dir selbst jeden Schritt beim Problemlösen. Verbalisiere deinen Denkprozess!', category: 'methode', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '💭' },
    { title: 'Dual Coding', description: 'Kombiniere Worte mit Bildern. Visuelle und verbale Information gleichzeitig speichern!', category: 'gedaechtnis', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '🖼️' },
    { title: 'Chunking', description: 'Teile große Informationsmengen in kleine "Chunks". Wie Telefonnummern: 0123-456-789 statt 0123456789!', category: 'gedaechtnis', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '🧩' },
    { title: 'Metaphern nutzen', description: 'Vergleiche neue Konzepte mit bekannten Dingen. "Das Atom ist wie ein Sonnensystem..."', category: 'methode', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '🌟' },
    { title: 'Lerntagebuch führen', description: 'Schreibe täglich auf, was du gelernt hast und was noch unklar ist. Reflektiere deinen Fortschritt!', category: 'organisation', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '📓' },
    { title: 'Wissenslücken identifizieren', description: 'Teste dich selbst und markiere, was du NICHT weißt. Konzentriere dich auf die Lücken!', category: 'methode', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '🕳️' },
    { title: 'Rückwärts lernen', description: 'Beginne mit der Lösung und arbeite dich rückwärts zum Problem. Besonders gut für Mathe!', category: 'methode', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '⏪' },
    { title: 'Kontextwechsel', description: 'Lerne das gleiche Thema an verschiedenen Orten. So wird das Wissen kontextunabhängiger!', category: 'gedaechtnis', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '🌍' },
    { title: 'Analogien bilden', description: 'Finde Parallelen zu anderen Fächern oder Lebensbereichen. "Chemische Reaktionen sind wie Kochen..."', category: 'methode', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '🔗' },
    { title: 'Pre-Testing', description: 'Teste dich BEVOR du lernst, auch wenn du nichts weißt. Es aktiviert dein Gehirn für das Thema!', category: 'methode', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '📋' },
    { title: 'Distributed Practice', description: 'Verteile das Lernen über Wochen statt alles in 2 Tagen. Langfristig effektiver!', category: 'organisation', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '📆' },
    { title: 'Retrieval Practice', description: 'Übe das Abrufen von Informationen aus dem Gedächtnis. Das Abrufen selbst ist Lernen!', category: 'gedaechtnis', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '🎣' },
    { title: 'Elaboration', description: 'Verbinde neues Wissen mit Vorwissen. "Das erinnert mich an..." Baue ein Wissensnetz!', category: 'methode', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '🕸️' },
    { title: 'Generation Effect', description: 'Generiere selbst Beispiele statt sie nur zu lesen. Selbst gemachte Beispiele bleiben besser hängen!', category: 'methode', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '⚡' },
    { title: 'Testing Effect', description: 'Tests sind nicht nur zum Bewerten da - sie sind eine der besten Lernmethoden!', category: 'methode', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '📝' },
    { title: 'Desirable Difficulties', description: 'Mach es dir schwerer! Kleine Hindernisse beim Lernen führen zu besserem Langzeiterfolg.', category: 'methode', subject: 'allgemein', difficulty: 'profi', icon: '🏋️' },
    { title: 'Metacognition', description: 'Denke über dein Denken nach. "Wie lerne ich am besten? Was funktioniert bei mir?"', category: 'methode', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '🧠' },
    { title: 'Konzeptmaps', description: 'Erstelle Karten mit Konzepten und ihren Beziehungen. Zeigt dir das große Ganze!', category: 'organisation', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '🗺️' },
    { title: 'Pareto-Prinzip', description: '80% der Ergebnisse kommen von 20% des Aufwands. Identifiziere die wichtigsten 20%!', category: 'organisation', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '📊' },
    { title: 'Deep Work', description: 'Schaffe 2-4 Stunden intensive, ununterbrochene Fokuszeit. Qualität über Quantität!', category: 'organisation', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '🎯' },
    { title: 'Timeboxing', description: 'Weise jeder Aufgabe eine feste Zeitspanne zu. Verhindert endloses Prokrastinieren!', category: 'organisation', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '⏰' },
    { title: 'Batch Processing', description: 'Gruppiere ähnliche Aufgaben zusammen. Bearbeite alle Mathe-Aufgaben am Stück!', category: 'organisation', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '📦' },
    { title: 'Energy Management', description: 'Lerne, wenn deine Energie hoch ist. Nicht jeder ist ein Morgenmensch!', category: 'organisation', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '⚡' },
    { title: 'Progressive Summarization', description: 'Erstelle mehrere Zusammenfassungs-Ebenen: Grob → Detail → Kern. Schichten von Verständnis!', category: 'methode', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '📑' },
    { title: 'Zettelkasten-Methode', description: 'Erstelle vernetzte Notizen wie Luhmann. Jede Notiz ist ein Gedanke, verlinkt mit anderen!', category: 'organisation', subject: 'allgemein', difficulty: 'profi', icon: '🗃️' },
    { title: 'Sokratische Methode', description: 'Stelle dir selbst kritische Fragen. "Was wäre, wenn...? Warum nicht...?"', category: 'methode', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '💬' },
    { title: 'First Principles Thinking', description: 'Breche Probleme auf fundamentale Wahrheiten herunter. Lerne von Grund auf!', category: 'methode', subject: 'allgemein', difficulty: 'profi', icon: '🔬' },
    { title: 'Deliberate Practice', description: 'Übe gezielt deine Schwächen, nicht was du schon kannst. Raus aus der Komfortzone!', category: 'methode', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '🎯' },

    // Unkonventionelle & Verrückte Methoden (61-100)
    { title: 'Astra AI Fokus-Playlist', description: 'Lass Astra AI dir 40-Hz-Beats kuratieren und lerne dazu. Algorithmus-Power für deinen Flow!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🎧' },
    { title: 'Astra AI Geschmacks-Anker', description: 'Astra AI pingt dich, wenn du deinen Zitronen-Kaugummi zum Lernstart kaust. Dein Gehirn liebt Wiedererkennung!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🍬' },
    { title: 'Astra AI Rückwärts-Challenge', description: 'Starte den Lernstoff beim Rückwärtsgehen und lass Astra AI mitzählen. Ungewöhnlich, aber wach!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🔙' },
    { title: 'Astra AI Duft-Trigger', description: 'Astra AI erinnert dich an dein Lern-Parfüm und loggt, wann du es nutzt. Geruch koppelt den Stoff!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🌸' },
    { title: 'Astra AI Song-Mode', description: 'Lass Astra AI den Stoff in Songzeilen strukturieren und sing ihn durch. Takt + Fakten = Treffer!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🎶' },
    { title: 'Astra AI Rap-Coach', description: 'Schreib mit Astra AI einen Lern-Rap und performe ihn laut. Rhythmus speichert Wissen!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🎤' },
    { title: 'Astra AI Seitenwechsel', description: 'Astra AI erinnert dich, mit der anderen Hand zu schreiben. Neue Nervenbahnen, neues Tempo!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🖐️' },
    { title: 'Astra AI Power-Pose-Alarm', description: 'Stell den 2-Minuten-Timer in Astra AI und nimm die Pose ein. Selbstvertrauen vor dem Stoff!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🦸' },
    { title: 'Astra AI Kaltstart', description: 'Astra AI gibt dir ein kaltes-Wasser-Go, bevor du lernst. Frische für dein Hirn!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '❄️' },
    { title: 'Astra AI Upside-Reader', description: 'Lass Astra AI dir Upside-Down-Challenges schicken. Kopfstand fürs Denken!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🙃' },
    { title: 'Astra AI Juggle-Reminder', description: 'Astra AI plant kleine Jonglier-Pausen ein. Mehr Ballgefühl, mehr Synapsen!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🤹' },
    { title: 'Astra AI Standing-Mode', description: 'Astra AI erinnert dich an Steh-Sessions oder Balanceboard. Bewegung hält den Fokus!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🧍' },
    { title: 'Astra AI Farbfilter', description: 'Astra AI ordnet Themen Farben zu und zeigt sie in deinen Notizen. Visuals pushen das Gedächtnis!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '👓' },
    { title: 'Astra AI Spiegel-Notizen', description: 'Lass Astra AI dir Spiegelschrift-Prompts geben. Dein Gehirn liebt die Extra-Herausforderung!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🪞' },
    { title: 'Astra AI Shorts-Skripte', description: 'Astra AI baut Skripte für 15-Sekunden-Lernvideos. Kreativ posten = doppelt lernen!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '📱' },
    { title: 'Astra AI Emotions-Log', description: 'Markiere Fakten mit Emojis, Astra AI trackt deine Stimmung dazu. Gefühle verankern Wissen!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '❤️' },
    { title: 'Astra AI Story-Builder', description: 'Astra AI spinnt absurde Geschichten aus deinem Stoff. Je verrückter, desto einprägsamer!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '📚' },
    { title: 'Astra AI Nano-Spick', description: 'Astra AI schrumpft deinen Spickzettel Runde für Runde. Am Ende brauchst du ihn nicht mehr!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '📄' },
    { title: 'Astra AI Rollenwerkstatt', description: 'Erschaffe mit Astra AI Charaktere für deine Konzepte. Figuren halten den Stoff lebendig!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🎭' },
    { title: 'Astra AI Parcours-Plan', description: 'Astra AI legt Lernkarten im Raum fest und führt dich im Parkour durch. Bewegung + Fokus!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🏃' },
    { title: 'Astra AI als Lernpartner', description: 'Lass dir von Astra AI den Stoff wie einem 5-Jährigen erklären und diskutiere nach. Dialog = Tiefgang!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🤖' },
    { title: 'Memes erstellen', description: 'Erstelle Memes über den Lernstoff. Humor hilft beim Erinnern!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '😂' },
    { title: 'Fingerübungen', description: 'Mache spezielle Fingerübungen beim Lernen. Aktiviert motorische Areale!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🖐️' },
    { title: 'Farben essen', description: 'Iss Lebensmittel in verschiedenen Farben für verschiedene Themen. Sinnesverknüpfung!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🍎' },
    { title: 'Reim-Technik', description: 'Erstelle Reime für alles. "Mitochondrien ist die Powerstation, gibt uns Energie - was für eine Sensation!"', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🎵' },
    { title: 'Lern-Kostüm', description: 'Trage ein spezielles Outfit nur zum Lernen. Dein Gehirn schaltet in "Lern-Modus"!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '👔' },
    { title: 'Grimassen schneiden', description: 'Schneide Grimassen beim Lernen schwieriger Konzepte. Emotionale Verbindung!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '😝' },
    { title: 'Lern-Ritual', description: 'Erstelle ein absurdes Ritual vor jeder Lernsession. Mentale Vorbereitung!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🕯️' },
    { title: 'Visualisierungs-Theater', description: 'Stelle dir vor, du bist IN dem Konzept. "Ich bin ein Elektron und reise durch den Stromkreis..."', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🎬' },
    { title: 'Schreib-Marathon', description: 'Schreibe den Stoff 10x hintereinander auf. Monoton, aber effektiv für motorisches Gedächtnis!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '✍️' },
    { title: 'Luftschrift', description: 'Schreibe Formeln in die Luft mit großen Bewegungen. Kinästhetisches Lernen!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '✋' },
    { title: 'Lern-Mantra', description: 'Wiederhole wichtige Fakten wie ein Mantra. Meditation meets Lernen!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🧘' },
    { title: 'Gewichte am Stift', description: 'Befestige kleine Gewichte am Stift. Die Anstrengung verstärkt das Gedächtnis!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🖊️' },
    { title: 'Esspapier-Vokabeln', description: 'Schreibe Vokabeln auf Esspapier und iss sie. Buchstäblich "Wissen aufnehmen"!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '📄' },
    { title: 'Stimmen imitieren', description: 'Lerne den Stoff mit verschiedenen Stimmen/Akzenten. Aktiviert verschiedene Gehirnareale!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🗣️' },
    { title: 'Blind lernen', description: 'Schließe die Augen und lerne nur durch Hören/Tasten. Schärft andere Sinne!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🙈' },
    { title: 'Neon-Notizen', description: 'Nutze nur Neon-Farben für Notizen. Visueller Schock = besser Erinnerung!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🌈' },
    { title: 'Lern-Challenges', description: 'Erstelle TikTok-Challenges für Lernthemen. Gamification!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🏆' },
    { title: 'Akrostichon', description: 'Erstelle Sätze aus Anfangsbuchstaben. "Mein Vater Erklärt Mir Jeden Sonntag Unsere Neun Planeten"', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🔤' },
    { title: 'Zahlen-Formen', description: 'Verbinde Zahlen mit Formen. 0=Ei, 1=Kerze, 2=Schwan... Erstelle visuelle Geschichten!', category: 'verruckt', subject: 'allgemein', difficulty: 'anfaenger', icon: '🔢' },

    // Astra AI Booster (101-111)
    { title: 'Astra AI Lernroutine', description: 'Astra AI blockt dir Lernfenster und erinnert dich liebevoll. Konsistenz siegt!', category: 'organisation', subject: 'allgemein', difficulty: 'anfaenger', icon: '⏰' },
    { title: 'Astra AI Quiz-Blitz', description: 'Starte 5-Minuten-Blitztests mit Astra AI. Kurze Checks, großer Effekt!', category: 'methode', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '⚡' },
    { title: 'Astra AI Prüfungssimulator', description: 'Lass Astra AI Prüfungsfragen generieren und stoppe die Zeit. Realitätsnah üben!', category: 'methode', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '🧪' },
    { title: 'Astra AI Aufgaben-Mix', description: 'Astra AI mischt deine Themen wild durch. Interleaving ohne Nachdenken!', category: 'organisation', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '🔀' },
    { title: 'Astra AI Stimmungs-Check', description: 'Logge deine Stimmung vor dem Lernen, Astra AI passt die Tipps an. Selbstfürsorge rockt!', category: 'motivation', subject: 'allgemein', difficulty: 'anfaenger', icon: '😊' },
    { title: 'Astra AI Fokus-Countdown', description: 'Setze 20-Minuten-Sprints mit Astra AI und gönn dir Mikro-Pausen. Tempo hält wach!', category: 'organisation', subject: 'allgemein', difficulty: 'anfaenger', icon: '⏳' },
    { title: 'Astra AI Lernkarten', description: 'Astra AI baut digitale Karteikarten mit Active Recall. Tippe, wische, speichere!', category: 'gedaechtnis', subject: 'allgemein', difficulty: 'anfaenger', icon: '🃏' },
    { title: 'Astra AI Whiteboard', description: 'Erkläre dein Thema live auf dem virtuellen Whiteboard von Astra AI. Visualisieren schafft Klarheit!', category: 'methode', subject: 'allgemein', difficulty: 'fortgeschritten', icon: '🧑‍🏫' },
    { title: 'Astra AI Deep-Dive', description: 'Bitte Astra AI um Gegenfragen, bis du keine Lücken mehr hast. Tiefe statt Oberfläche!', category: 'methode', subject: 'allgemein', difficulty: 'profi', icon: '🌊' },
    { title: 'Astra AI Pausen-Coach', description: 'Astra AI plant Stretch- und Trinkpausen ein. Körper fit, Kopf klar!', category: 'organisation', subject: 'allgemein', difficulty: 'anfaenger', icon: '☕' },
    { title: 'Astra AI Erfolgstracker', description: 'Tracke erledigte Sessions in Astra AI und feiere kleine Wins. Motivation bleibt hoch!', category: 'motivation', subject: 'allgemein', difficulty: 'anfaenger', icon: '📈' }
];

// ===================================
// SAFE STORAGE HELPERS
// ===================================

function safeGetItem(key, fallback = null) {
    try {
        const value = localStorage.getItem(key);
        return value !== null ? value : fallback;
    } catch (error) {
        console.warn(`[Storage] Konnte ${key} nicht auslesen, nutze Fallback.`, error);
        return fallback;
    }
}

function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.warn(`[Storage] Konnte ${key} nicht speichern.`, error);
    }
}

function safeParseJSON(value, fallback, label = 'Wert') {
    try {
        return JSON.parse(value);
    } catch (error) {
        console.warn(`[Storage] Konnte ${label} nicht parsen, nutze Fallback.`, error);
        return fallback;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== TIPPS.JS DOMContentLoaded ===');
    console.log('Initializing tip generator...');
    initializeGenerator();
    console.log('Initializing view toggle...');
    initializeViewToggle();
    console.log('Updating points...');
    updatePoints();
    console.log('Initializing dark mode...');
    initializeDarkMode();
    console.log('=== TIPPS.JS Initialization complete ===');
});

// ===================================
// RANDOM TIP GENERATOR
// ===================================

function initializeGenerator() {
    const generateBtn = document.getElementById('generate-tip-btn');
    const tipDisplay = document.getElementById('tip-display');

    console.log('initializeGenerator called');
    console.log('generateBtn:', generateBtn);
    console.log('tipDisplay:', tipDisplay);
    console.log('lerntipps length:', lerntipps.length);

    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            console.log('Button clicked!');
            try {
                // Get random tip
                const randomTip = lerntipps[Math.floor(Math.random() * lerntipps.length)];
                console.log('Random tip selected:', randomTip);

                // Display tip
                showRandomTip(randomTip);

                // Check cooldown for bonus points (10 minutes = 600000 milliseconds)
                const lastBonusTime = parseInt(safeGetItem('studytok_tip_bonus_time', '0') || '0');
                const currentTime = Date.now();
                const cooldownPeriod = 10 * 60 * 1000; // 10 minutes in milliseconds
                const timeSinceLastBonus = currentTime - lastBonusTime;

                if (timeSinceLastBonus >= cooldownPeriod) {
                    // Cooldown has passed, give bonus
                    addPoints(2);
                    safeSetItem('studytok_tip_bonus_time', currentTime.toString());
                    showNotification('💡 Neuer Lerntipp generiert! +2 Punkte Bonus!');
                } else {
                    // Still in cooldown
                    const remainingMinutes = Math.ceil((cooldownPeriod - timeSinceLastBonus) / 60000);
                    showNotification(`💡 Neuer Lerntipp generiert! (Bonus in ${remainingMinutes} Min)`);
                }
            } catch (error) {
                console.error('Error in tip generator:', error);
                alert('Fehler beim Generieren des Tipps: ' + error.message);
            }
        });
    } else {
        console.error('Generate button not found!');
    }
}

function showRandomTip(tip) {
    console.log('showRandomTip called with:', tip);
    const tipDisplay = document.getElementById('tip-display');
    if (!tipDisplay) {
        console.error('tipDisplay element not found!');
        return;
    }

    console.log('Setting tipDisplay to visible');
    tipDisplay.style.display = 'block';

    console.log('Creating HTML content');
    tipDisplay.innerHTML = `
        <div class="tip-card-flip">
            <div class="tip-card-front">
                <div class="tip-icon">${tip.icon}</div>
                <h3 class="tip-title">${tip.title}</h3>
                <p class="tip-category">${getCategoryName(tip.category)} • ${getDifficultyName(tip.difficulty)}</p>
            </div>
            <div class="tip-description">
                ${tip.description}
            </div>
        </div>
    `;

    console.log('Scrolling to tip');
    // Scroll to tip
    tipDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    console.log('showRandomTip completed');
}

// ===================================
// FILTERS
// ===================================

function initializeFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const subjectFilter = document.getElementById('subject-filter');
    const difficultyFilter = document.getElementById('difficulty-filter');
    const searchInput = document.getElementById('search-input');

    // Filter change events
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    if (subjectFilter) {
        subjectFilter.addEventListener('change', applyFilters);
    }
    if (difficultyFilter) {
        difficultyFilter.addEventListener('change', applyFilters);
    }
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
}

function applyFilters() {
    const categoryValue = document.getElementById('category-filter')?.value || 'all';
    const subjectValue = document.getElementById('subject-filter')?.value || 'all';
    const difficultyValue = document.getElementById('difficulty-filter')?.value || 'all';
    const searchValue = document.getElementById('search-input')?.value.toLowerCase() || '';

    const videoCards = document.querySelectorAll('.video-card-item');

    videoCards.forEach(card => {
        const category = card.dataset.category;
        const subject = card.dataset.subject;
        const difficulty = card.dataset.difficulty;
        const title = card.querySelector('.video-title-large')?.textContent.toLowerCase() || '';
        const description = card.querySelector('.video-description')?.textContent.toLowerCase() || '';

        const categoryMatch = categoryValue === 'all' || category === categoryValue;
        const subjectMatch = subjectValue === 'all' || subject === subjectValue;
        const difficultyMatch = difficultyValue === 'all' || difficulty === difficultyValue;
        const searchMatch = searchValue === '' ||
                           title.includes(searchValue) ||
                           description.includes(searchValue);

        if (categoryMatch && subjectMatch && difficultyMatch && searchMatch) {
            card.style.display = '';
            card.style.animation = 'fadeIn 0.3s ease-out';
        } else {
            card.style.display = 'none';
        }
    });
}

// ===================================
// VIEW TOGGLE (Grid/List)
// ===================================

function initializeViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    const videosGrid = document.getElementById('videos-grid');

    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;

            // Update active button
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Update grid class
            if (view === 'list') {
                videosGrid?.classList.add('list-view');
            } else {
                videosGrid?.classList.remove('list-view');
            }
        });
    });
}

// ===================================
// FAVORITES
// ===================================

function initializeFavorites() {
    const favoriteButtons = document.querySelectorAll('.action-btn.favorite');

    favoriteButtons.forEach(btn => {
        // Load saved state
        const videoCard = btn.closest('.video-card-item');
        const videoTitle = videoCard?.querySelector('.video-title-large')?.textContent;
        const favorites = getFavorites();

        if (favorites.includes(videoTitle)) {
            btn.classList.add('active');
            btn.textContent = '❤️';
        }

        // Click event
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const isFavorite = this.classList.contains('active');

            if (isFavorite) {
                this.classList.remove('active');
                this.textContent = '❤️';
                removeFavorite(videoTitle);
                showNotification('Aus Favoriten entfernt', 'info');
            } else {
                this.classList.add('active');
                this.textContent = '❤️';
                addFavorite(videoTitle);
                showNotification('Zu Favoriten hinzugefügt!');
            }
        });
    });
}

function getFavorites() {
    const stored = safeGetItem('studytok_favorites');
    return stored ? safeParseJSON(stored, [], 'studytok_favorites') : [];
}

function addFavorite(title) {
    const favorites = getFavorites();
    if (!favorites.includes(title)) {
        favorites.push(title);
        safeSetItem('studytok_favorites', JSON.stringify(favorites));
    }
}

function removeFavorite(title) {
    let favorites = getFavorites();
    favorites = favorites.filter(f => f !== title);
    safeSetItem('studytok_favorites', JSON.stringify(favorites));
}

// ===================================
// VIDEO CARDS INTERACTION
// ===================================

// Video cards now have direct TikTok links, so no special click handling needed

// ===================================
// UTILITY FUNCTIONS
// ===================================

function getCategoryName(category) {
    const names = {
        'methode': 'Lernmethode',
        'gedaechtnis': 'Gedächtnis',
        'motivation': 'Motivation',
        'organisation': 'Organisation',
        'verruckt': 'Verrückt'
    };
    const result = names[category] || category;
    console.log('getCategoryName(' + category + ') = ' + result);
    return result;
}

function getDifficultyName(difficulty) {
    const names = {
        'anfaenger': 'Anfänger',
        'fortgeschritten': 'Fortgeschritten',
        'profi': 'Profi'
    };
    const result = names[difficulty] || difficulty;
    console.log('getDifficultyName(' + difficulty + ') = ' + result);
    return result;
}

function getStats() {
    const defaultStats = {
        sessions: 0,
        focusTime: 0,
        streak: 1,
        achievements: 0,
        points: 0,
        lastActive: new Date().toDateString(),
        unlockedAchievements: [],
        sessionsToday: 0,
        lastSessionDate: new Date().toDateString(),
        consecutiveSessions: 0
    };

    const stored = safeGetItem('studytok_stats');
    const stats = stored ? safeParseJSON(stored, { ...defaultStats }, 'studytok_stats') : { ...defaultStats };

    // Ensure new properties exist
    if (!stats.unlockedAchievements) stats.unlockedAchievements = [];
    if (!stats.sessionsToday) stats.sessionsToday = 0;
    if (!stats.lastSessionDate) stats.lastSessionDate = new Date().toDateString();
    if (!stats.consecutiveSessions) stats.consecutiveSessions = 0;

    return stats;
}

function saveStats(stats) {
    safeSetItem('studytok_stats', JSON.stringify(stats));
}

function addPoints(points) {
    const stats = getStats();
    stats.points += points;
    saveStats(stats);
    updatePoints();
}

function updatePoints() {
    const stats = getStats();
    const pointsElements = document.querySelectorAll('.points-value');
    pointsElements.forEach(el => {
        el.textContent = stats.points;
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#4CAF50' : type === 'info' ? '#2196F3' : '#FF5252'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const tippsAnimationStyle = document.createElement('style');
tippsAnimationStyle.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
`;
document.head.appendChild(tippsAnimationStyle);

// ===================================
// DARK MODE FUNCTIONALITY
// ===================================

function initializeDarkMode() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = safeGetItem('studytok_theme', 'light');

    // Apply saved theme
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Toggle event
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    safeSetItem('studytok_theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const isDark = theme === 'dark';
        themeToggle.classList.toggle('is-dark', isDark);
        themeToggle.setAttribute('aria-pressed', isDark);
        themeToggle.setAttribute('aria-label', isDark ? 'Light Mode aktivieren' : 'Dark Mode aktivieren');
    }
}
