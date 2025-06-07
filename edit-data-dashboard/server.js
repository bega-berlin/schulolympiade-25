const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const app = express();

const ADMIN_USER = 'DauView25';
const ADMIN_PASS_HASH = crypto.createHash('sha256').update('ongOlympiade#2025').digest('hex');
const validTokens = new Set();

app.use(express.json());

// Statische Auslieferung von Frontend und Data-Ordner
app.use(express.static(__dirname)); // index.html, script.js, style.css etc.
app.use('/data', express.static('/home/regie/schulolympiade/dashboard/data')); // /data/results.json

// Login-Endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    if (username === ADMIN_USER && hash === ADMIN_PASS_HASH) {
        const token = crypto.randomBytes(32).toString('hex');
        validTokens.add(token);
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Login fehlgeschlagen' });
    }
});

// Middleware zur Token-Prüfung
function checkAuth(req, res, next) {
    const token = req.headers.authorization;
    if (token && validTokens.has(token)) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Nicht autorisiert' });
    }
}

// Save-Endpoint mit Token-Prüfung
app.post('/api/save', checkAuth, (req, res) => {
    const filePath = '/home/regie/schulolympiade/dashboard/data/results.json';
    fs.writeFile(filePath, JSON.stringify(req.body, null, 2), 'utf8', err => {
        if (err) {
            res.status(500).json({ success: false, error: err.message });
        } else {
            res.json({ success: true });
        }
    });
});

const PORT = 3003;
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
