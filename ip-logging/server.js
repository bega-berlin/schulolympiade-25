const http = require('http');
const fs = require('fs');

const PORT = 3005; // Port für das Logging-Skript
const LOGFILE = './ip_log.txt'; // Pfad zur Log-Datei
const FORMULAR_URL = 'http://192.168.100.73:5678/form/b5b09eca-2b69-43bf-8240-ba4a063d219e'; // Ziel-URL für Weiterleitung

http.createServer((req, res) => {
  // IP-Adresse ermitteln
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  // IPv6-mapped IPv4 entfernen, falls vorhanden
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  // Zeitstempel erzeugen
  const now = new Date().toISOString();

  // Log-Eintrag
  const logEntry = `${now} - ${ip}\n`;

  // Log in Datei schreiben (anhängen)
  fs.appendFile(LOGFILE, logEntry, (err) => {
    if (err) {
      console.error('Fehler beim Schreiben der Log-Datei:', err);
    }
  });

  // HTTP-Redirect zum Formular
  res.writeHead(302, { Location: FORMULAR_URL });
  res.end();

}).listen(PORT, () => {
  console.log(`IP-Logging Server läuft auf Port ${PORT}`);
});
