# Journal de Trading 2025

Application web (React + Vite + TypeScript + Tailwind + Recharts) pour remplacer votre page Notion.

## Fonctionnalités initiales
- Ajout de trades (stockage localStorage)
- Tableau des trades
- Statistiques globales (profit total, win rate, max drawdown, expectancy, profit factor, payoff ratio, R moyen)
- Agrégations par mois et année (graphiques)
- Thème sombre dégradé rouge/noir
- Filtres (année, mois, actif, trader, side, résultat)
- Export / Import JSON
- Profils multiples (sélection de profil)
- Distribution des profits (histogramme)
- Duplication rapide de trade

## Prochaines étapes proposées
- Export / Import JSON
- Filtres (par actif, trader, période, side)
- Graphique distribution gains/pertes & R multiples
- Vue performance par actif / trader / jour de la semaine
- Auth ou synchro (optionnel plus tard - Supabase / Firebase)
- Mode multi-portefeuilles

## Démarrage
Installez les dépendances puis lancez le serveur dev.

```
npm install
npm run dev
```

## Déploiement GitHub Pages
1. Crée le dépôt GitHub nommé `tradingJournal` (ou adapte `repoName` dans `vite.config.ts`).
2. Remplace `YOUR_GITHUB_USERNAME` dans `package.json` champ `homepage`.
3. Commit & push sur la branche `main`.
4. L’action GitHub (`.github/workflows/deploy.yml`) build et publie automatiquement sur Pages.
5. Dans Settings > Pages, choisis Source: GitHub Actions si pas déjà actif.

Déploiement manuel alternatif (branche gh-pages) :
```
npm run deploy
```

## Structure des données Trade
```ts
interface Trade {
  id: string;
  trader: string;
  asset: string;
  date: string; // YYYY-MM-DD
  year: number;
  time?: string; // HH:mm
  month: string; // ex: 'octobre'
  dayOfWeek: string; // lundi, mardi, ...
  side: 'BUY' | 'SELL';
  resultLabel?: 'gagnant' | 'perdant';
  profit: number; // montant
  capitalPct: number; // % du capital
  risk?: number; // risque engagé
  rMultiple?: number; // profit / risk
  comment?: string;
}
```

## Personnalisation thème
Couleurs dans `tailwind.config.cjs` (palette primary) + gradients.

## Contributions futures
Ouvrir une issue avec la fonctionnalité souhaitée.
