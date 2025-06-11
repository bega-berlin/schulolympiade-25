const express = require('express');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const app = express();
const PORT = 3000;

// Konfiguration
const JSON_FILE_PATH = './data/results.json'; // Pfad zur JSON-Datei
let currentData = {};

// Middleware
app.use(express.static('public'));
app.use(express.json());

// CORS (optional für lokale Entwicklung)
const allowedOrigins = ['http://localhost', 'http://localhost:3000'];
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// JSON-Datei lesen
function readJsonFile() {
    try {
        if (!fs.existsSync(JSON_FILE_PATH)) {
            console.warn('⚠️ JSON-Datei nicht gefunden:', JSON_FILE_PATH);
            return null;
        }

        const raw = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
        const json = JSON.parse(raw);

        return processOlympiadeData(json);
    } catch (error) {
        console.error('Fehler beim Lesen der JSON-Datei:', error);
        return null;
    }
}

// Verarbeitung der Olympiade-Daten
function processOlympiadeData(rawData) {
    const processed = {
        teams: [],
        disciplines: [],
        totalParticipants: 0,
        totalEvents: 0,
        leaderboard: [],
        recentResults: [],
        statistics: {}
    };

    const teamScores = {};
    const disciplineStats = {};

    const requiredFields = ['Team', 'Disziplin', 'Punkte', 'Platz', 'Uhr'];
    if (!Array.isArray(rawData)) {
        return { ...processed, error: 'JSON-Daten sind kein Array!' };
    }

    if (rawData.length === 0) {
        return processed;
    }

    const missingFields = requiredFields.filter(field =>
        !Object.keys(rawData[0]).some(key => key.toLowerCase() === field.toLowerCase())
    );

    if (missingFields.length > 0) {
        return {
            ...processed,
            error: `Fehlende Felder: ${missingFields.join(', ')}`
        };
    }

    rawData.forEach(row => {
        const team = row.Team || row.team;
        const discipline = row.Disziplin || row.disziplin || row.discipline;
        const points = parseInt(row.Punkte || row.points || 0);
        const place = parseInt(row.Platz || row.place || 0);
        const time = row.Uhr || row.time || '';

        if (!team || !discipline) return;

        if (!teamScores[team]) {
            teamScores[team] = {
                name: team,
                totalPoints: 0,
                events: 0,
                avgPlace: 0,
                places: []
            };
        }

        teamScores[team].totalPoints += points;
        teamScores[team].events++;
        if (place > 0) teamScores[team].places.push(place);

        if (!disciplineStats[discipline]) {
            disciplineStats[discipline] = {
                name: discipline,
                participants: new Set(),
                totalPoints: 0,
                events: 0
            };
        }

        disciplineStats[discipline].participants.add(team);
        disciplineStats[discipline].totalPoints += points;
        disciplineStats[discipline].events++;

        processed.recentResults.push({
            team,
            discipline,
            points,
            place,
            time
        });
    });

    // Durchschnittsplätze berechnen
    Object.values(teamScores).forEach(team => {
        if (team.places.length > 0) {
            team.avgPlace = team.places.reduce((a, b) => a + b, 0) / team.places.length;
        }
    });

    // Rangliste erstellen
    processed.leaderboard = Object.values(teamScores)
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map((team, index) => ({
            ...team,
            rank: index + 1
        }));

    // Disziplin-Statistiken
    processed.disciplines = Object.values(disciplineStats).map(d => ({
        name: d.name,
        participants: d.participants.size,
        avgPoints: d.events > 0 ? (d.totalPoints / d.events).toFixed(1) : 0,
        totalEvents: d.events
    }));

    processed.totalParticipants = Object.keys(teamScores).length;
    processed.totalEvents = rawData.length;
    processed.teams = Object.keys(teamScores);

    // Neueste Ergebnisse (nach Zeit sortieren, wenn vorhanden)
    processed.recentResults = processed.recentResults
        .filter(r => r.time && /^\d{1,2}:\d{2}(:\d{2})?$/.test(r.time))
        .sort((a, b) => {
            // Unterstützt hh:mm oder hh:mm:ss
            const [ah, am, as] = a.time.split(':').map(Number);
            const [bh, bm, bs] = b.time.split(':').map(Number);
            const aSecs = (ah * 3600) + (am * 60) + (as || 0);
            const bSecs = (bh * 3600) + (bm * 60) + (bs || 0);
            const timeDiff = bSecs - aSecs;
            if (timeDiff !== 0) return timeDiff;
            return b.points - a.points;
        })
        .slice(0, 10);

    return processed;
}

// Dateiüberwachung
function watchJsonFile() {
    const watcher = chokidar.watch(JSON_FILE_PATH, {
        persistent: true,
        usePolling: true,
        interval: 1000
    });

    watcher.on('change', () => {
        console.log('📂 JSON-Datei wurde geändert. Lade neu...');
        const newData = readJsonFile();
        if (newData) currentData = newData;
    });
}

// API-Endpunkte
app.get('/api/data', (req, res) => {
    res.json(currentData);
});

app.get('/api/leaderboard', (req, res) => {
    res.json(currentData.leaderboard || []);
});

app.get('/api/disciplines', (req, res) => {
    res.json(currentData.disciplines || []);
});

app.get('/api/recent', (req, res) => {
    res.json(currentData.recentResults || []);
});

app.get('/api/stats', (req, res) => {
    res.json({
        totalParticipants: currentData.totalParticipants || 0,
        totalEvents: currentData.totalEvents || 0,
        totalDisciplines: currentData.disciplines?.length || 0,
        lastUpdate: new Date().toLocaleString('de-DE')
    });
});

// Dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown IP';
  const now = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const userAgent = req.headers['user-agent'] || 'unknown UA';

  const logLine = `[${now}] ${ip} - ${method} ${url} - UA: ${userAgent}\n`;

  // Log in Konsole
  console.log(logLine.trim());

  // Log in Datei (append)
  const logFilePath = path.join(__dirname, 'data', 'api-logs.txt');
  fs.appendFile(logFilePath, logLine, (err) => {
    if (err) {
      console.error('Fehler beim Schreiben in api-logs.txt:', err);
    }
  });

  next();
});


// Server starten
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Dashboard läuft auf http://localhost:${PORT}`);

    const initialData = readJsonFile();
    if (initialData) {
        currentData = initialData;
        console.log('✅ Daten geladen');
    } else {
        console.log('⚠️ Keine Daten gefunden.');
    }

    watchJsonFile();
});

process.on('SIGINT', () => {
    console.log('\n🛑 Server wird durch User Eingabe beendet...');
    process.exit(0);
});
