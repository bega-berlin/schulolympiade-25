class OlympiadeDashboard {
    constructor() {
        this.apiBase = '/api';
        this.data = {};
        this.emojiMap = null; // Emoji-Map wird geladen
        this.init();
    }

    async init() {
        await this.loadEmojiMap();
        await this.loadData();
        this.setupEventListeners();
        //this.startAutoRefresh();
    }

    async loadEmojiMap() {
        try {
            const res = await fetch('./data/emojiMap.json');
            this.emojiMap = await res.json(); // jetzt ein Array!
        } catch (e) {
            console.error('Fehler beim Laden der Emoji-Map:', e);
            this.emojiMap = [];
        }
    }

    async loadData() {
        try {
            const [stats, leaderboard, recent, disciplines] = await Promise.all([
                fetch(`${this.apiBase}/stats`).then(r => r.json()),
                fetch(`${this.apiBase}/leaderboard`).then(r => r.json()),
                fetch(`${this.apiBase}/recent`).then(r => r.json()),
                fetch(`${this.apiBase}/disciplines`).then(r => r.json())
            ]);

            this.data = { stats, leaderboard, recent, disciplines };
            this.updateUI();
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
            this.showError();
        }
    }

    updateUI() {
        this.updateStats();
        this.updateChart();
        this.updateLeaderboard();
        this.updateRecentResults();
        this.updateLastUpdateTime();
    }

    updateStats() {
        const { stats, leaderboard } = this.data;

        document.getElementById('totalTeams').textContent = stats.totalParticipants || 0;
        document.getElementById('totalEvents').textContent = stats.totalEvents || 0;
        document.getElementById('totalDisciplines').textContent = stats.totalDisciplines || 0;

        const avgPoints = leaderboard.length > 0
            ? Math.round(leaderboard.reduce((sum, team) => sum + team.totalPoints, 0) / leaderboard.length)
            : 0;
        document.getElementById('avgPoints').textContent = "⌀ " + avgPoints;
    }

    updateChart() {
        const chartContainer = document.getElementById('barChart');
        const loading = document.getElementById('chartLoading');

        loading.style.display = 'none';
        chartContainer.style.display = 'flex'; // Flex statt Grid!
        chartContainer.style.flexDirection = 'column'; // Vertikal stapeln
        chartContainer.innerHTML = '';

        // Zeige nur Top 8 Teams
        const teams = this.data.leaderboard.slice(0, 10);
        const maxPoints = Math.max(...teams.map(team => team.totalPoints));

        teams.forEach((team, index) => {
            const barItem = document.createElement('div');
            barItem.className = 'bar-item';

            const bar = document.createElement('div');
            bar.className = 'bar';

            // Proportionale Breite (ohne Mindestbreite)
            let widthPercent = 0;
            if (maxPoints > 0) {
                // Quadratische Skalierung für mehr Unterschied
                widthPercent = Math.pow(team.totalPoints / maxPoints, 2) * 100;
            }
            bar.style.width = widthPercent + '%';

            const value = document.createElement('div');
            value.className = 'bar-value';
            value.textContent = team.totalPoints;

            const label = document.createElement('div');
            label.className = 'bar-label';
            label.textContent = team.name;
            label.title = team.name;

            barItem.appendChild(label);
            barItem.appendChild(bar);
            barItem.appendChild(value);

            chartContainer.appendChild(barItem);
        });
    }

    updateLeaderboard() {
        const container = document.getElementById('leaderboardContent');
        const teams = this.data.leaderboard.slice(0, 10);

        container.innerHTML = teams.map((team, index) => {
            const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'other';
            // Durchschnittliche Platzierung formatieren (1 Nachkommastelle, falls vorhanden)
            const avgPlace = team.avgPlace && !isNaN(team.avgPlace)
                ? Number(team.avgPlace).toFixed(1).replace('.', '.')
                : '-';

            return `
                <div class="leaderboard-item">
                    <div class="rank ${rankClass}">${team.rank}</div>
                    <div class="team-info">
                        <div class="team-name" title="${team.name}">${team.name}</div>
                        <div class="team-stats">
                            ${team.events} Wettbewerbe
                            <span class="avg-place">| Ø ${avgPlace} Platz</span>
                        </div>
                    </div>
                    <div class="points">${team.totalPoints}</div>
                </div>
            `;
        }).join('');
    }

    updateRecentResults() {
        const container = document.getElementById('recentResults');
        // Nur die 5 neuesten Ergebnisse anzeigen
        //        const results = this.data.recent;
        const results = (this.data.recent || []).slice(0, 6);

        if (!results || results.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">Keine aktuellen Ergebnisse verfügbar</div>';
            return;
        }

        const disciplineColors = [
            'discipline-1', 'discipline-2', 'discipline-3', 'discipline-4'
        ];

        container.innerHTML = results.map((result, index) => {
            const colorClass = disciplineColors[index % disciplineColors.length];
            const emoji = this.getDisciplineEmoji(result.discipline);

            return `
                <div class="recent-item">
                    <div class="discipline-icon ${colorClass}">
                        ${emoji}
                    </div>
                    <div class="recent-info">
                        <h4 class="recent-discipline" title="${capitalizeFirstLetter(result.discipline)}">${capitalizeFirstLetter(result.discipline)}</h4>
                        <p class="recent-team">${result.team}</p>
                    </div>
                    <div class="recent-score">
                        <div class="score-value">${result.points} Pkt</div>
                        <div class="score-date">${result.time || ''}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getDisciplineEmoji(discipline) {
        if (!Array.isArray(this.emojiMap)) return '🏆';
        const lowercased = discipline.toLowerCase();
        for (const entry of this.emojiMap) {
            if (lowercased.includes(entry.Trigger.toLowerCase())) {
                return entry.Emoji;
            }
        }
        return '🏆';
    }

    updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('lastUpdate').textContent = `Zuletzt aktualisiert: ${timeString}`;
    }

    setupEventListeners() {
        // Chart-Periode ändern
        const chartPeriod = document.getElementById('chartPeriod');
        if (chartPeriod) {
            chartPeriod.addEventListener('change', () => {
                this.updateChart();
            });
        }

        // Navigation
        document.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    filterResults(searchTerm) {
        if (!searchTerm) {
            this.updateLeaderboard();
            this.updateRecentResults();
            return;
        }

        const filtered = this.data.leaderboard.filter(team =>
            team.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Aktualisiere Rangliste mit gefilterten Ergebnissen
        const container = document.getElementById('leaderboardContent');
        if (filtered.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">Keine Teams gefunden</div>';
            return;
        }

        container.innerHTML = filtered.map((team, index) => {
            const rankClass = team.rank === 1 ? 'gold' : team.rank === 2 ? 'silver' : team.rank === 3 ? 'bronze' : 'other';

            return `
                <div class="leaderboard-item">
                    <div class="rank ${rankClass}">${team.rank}</div>
                    <div class="team-info">
                        <div class="team-name" title="${team.name}">${team.name}</div>
                        <div class="team-stats">${team.events} Wettbewerbe</div>
                    </div>
                    <div class="points">${team.totalPoints}</div>
                </div>
            `;
        }).join('');
    }

   /* startAutoRefresh() {
        // Aktualisiere alle 30 Sekunden
        setInterval(() => {
            location.reload();
        }, 20000); // 20 Sekunden
    }*/

    showError() {
        const errorMessage = `
            <div class="error-message">
                <h3>⚠️ Verbindungsproblem</h3>
                <p>Daten können nicht geladen werden. Überprüfen Sie die Excel-Datei und den Server.</p>
                <button onclick="location.reload()">Seite neu laden</button>
            </div>
        `;

        document.getElementById('leaderboardContent').innerHTML = errorMessage;
        document.getElementById('recentResults').innerHTML = errorMessage;
        document.getElementById('barChart').innerHTML = errorMessage;
    }
}

// Dashboard initialisieren wenn die Seite geladen ist
document.addEventListener('DOMContentLoaded', () => {
    new OlympiadeDashboard();
});

// Reload Funktion
function reloadwebsite() {
    location.reload();
}

// Service Worker für Offline-Funktionalität (optional)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
}

function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Beispiel für das Setzen des Werts im Formular:
input.value = capitalizeFirstLetter(team.name);
