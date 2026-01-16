const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialiser le fichier de données s'il n'existe pas
async function initDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        const initialData = {
            trades: [],
            accounts: [],
            markets: ['EUR/USD', 'GBP/USD', 'BTC/USD', 'GOLD'],
            traders: ['Marius']
        };
        await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
        console.log('✅ Fichier data.json créé');
    }
}

// Lire toutes les données
app.get('/api/data', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Erreur lecture données' });
    }
});

// Sauvegarder toutes les données
app.post('/api/data', async (req, res) => {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erreur sauvegarde données' });
    }
});

// Démarrer le serveur
initDataFile().then(() => {
    app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════╗
║   📊 TRADING JOURNAL - SERVEUR ACTIF  ║
╠════════════════════════════════════════╣
║  🌐 http://localhost:${PORT}            ║
║  📁 Données: data.json                 ║
╚════════════════════════════════════════╝
        `);
    });
});
