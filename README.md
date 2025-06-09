# 🏆 Schulolympiade Dashboard 2025

Willkommen zum **Live Dashboard** der Schulolympiade am Otto-Nagel-Gymnasium!  
Dieses Projekt bietet eine moderne, TV-optimierte Übersicht aller Ergebnisse, Ranglisten und Disziplinen – in Echtzeit und mit vielen coolen Features. 🚀

---

## ✨ Features

- **Live-Ansicht** der Ergebnisse & Ranglisten  
- **Automatische Aktualisierung** (alle 10 Sekunden)
- **Disziplin-Emojis** für bessere Übersicht 😃
- **Admin-Panel** zum Bearbeiten der Ergebnisse (geschützt)
- **Emoji-Mapping** Verwaltung für Disziplinen
- **Docker & NGINX**-Support für einfache Bereitstellung
- **Dark Mode** & modernes Apple-inspiriertes Design 🌙

---

## 📸 Vorschau

> _Hinweis: Beispielbilder sind generiert und zeigen keine echten Daten._

![Dashboard Vorschau](https://raw.githubusercontent.com/github/explore/main/topics/dashboard/dashboard.png)
![Admin Panel Vorschau](https://raw.githubusercontent.com/github/explore/main/topics/admin/admin.png)

---

## 🚦 Projektstruktur

```
dashboard/                # Haupt-Dashboard (Frontend & API)
edit-data-dashboard/      # Admin-Panel für Ergebnisse
edit-emoji-dashboard/     # Admin-Panel für Emoji-Mappings
success-n8n/              # Erfolgsseite nach Ergebnis-Eintrag
success-emoji-n8n/        # Erfolgsseite nach Emoji-Eintrag
nginx/                    # NGINX Docker-Setup für Weiterleitungen
n8n/                      # n8n Automatisierung (optional)
```

---

## ⚡ Schnellstart

1. **Abhängigkeiten installieren**
   ```sh
   cd dashboard
   npm install
   ```

2. **Dashboard starten**
   ```sh
   npm start
   ```
   → Läuft dann auf [http://localhost:3000](http://localhost:3000)

3. **Admin-Panel starten**
   ```sh
   cd ../edit-data-dashboard
   npm install
   npm start
   # → http://localhost:3003
   ```

4. **Emoji-Panel starten**
   ```sh
   cd ../edit-emoji-dashboard
   npm install
   npm start
   # → http://localhost:3004
   ```

---

## 🔒 Admin-

- **Benutzername:** `DauView25`
- **Passwort:** (Siehe .env oder Quelltext, aus Sicherheitsgründen hier nicht gelistet)

---

## 🛠️ Entwicklung

- **Frontend:** HTML, CSS (Apple-inspiriert), Vanilla JS
- **Backend:** Node.js (Express), Chokidar (Live-Reload)
- **Daten:** JSON-Dateien ([`dashboard/data/results.json`](dashboard/data/results.json ), [`dashboard/public/data/emojiMap.json`](dashboard/public/data/emojiMap.json ))
- **Docker/NGINX:** Für Weiterleitungen & Reverse Proxy

---

## 📂 Datenstruktur

- **Ergebnisse:**  
  [`dashboard/data/results.json`](dashboard/data/results.json )
  ```json
  [
    {
      "Team": "10A",
      "Disziplin": "Weitsprung",
      "Punkte": 12,
      "Platz": 1,
      "Uhr": "09:30"
    }
  ]
  ```

- **Emoji-Mapping:**  
  [`dashboard/public/data/emojiMap.json`](dashboard/public/data/emojiMap.json )
  ```json
  [
    { "Emoji": "🏃", "Trigger": "lauf" },
    { "Emoji": "🏀", "Trigger": "basketball" }
  ]
  ```

---

## 🖼️ Beispiel-UI (Mockup)

> _Die echten Screenshots werden beim ersten Start generiert!_

![Mockup Dashboard](https://placehold.co/900x400/222/fff?text=Dashboard+Mockup)
![Mockup Admin](https://placehold.co/900x400/222/fff?text=Admin+Panel+Mockup)

---

## 👨‍💻 Lizenz

```
Copyright (c) 2025 BEGA Team
Diese Software darf ohne ausdrückliche, schriftliche Genehmigung des Autors nicht verwendet, kopiert, verändert, verbreitet oder weitergegeben werden.
```

---

## 💬 Kontakt & Mitmachen

Fragen, Feedback oder Ideen?  
Melde dich beim BEGA Team am Otto-Nagel-Gymnasium!  
Oder öffne ein Issue/PR auf GitHub.

---

**Viel Spaß bei der Schulolympiade!** 🎉