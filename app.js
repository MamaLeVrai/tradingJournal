// =======================
// GESTION DU STOCKAGE LOCAL
// =======================

class TradingJournal {
    constructor() {
        this.trades = [];
        this.accounts = [];
        this.markets = ['EUR/USD', 'GBP/USD', 'BTC/USD', 'GOLD'];
        this.traders = ['Marius'];
        this.charts = {};
        this.editingTradeId = null;
        this.editingAccountId = null;
        this.filters = {
            account: '',
            market: '',
            type: '',
            result: '',
            dateFrom: '',
            dateTo: ''
        };
        this.API_URL = 'http://localhost:3000/api/data';
        this.loadAllData();
        this.init();
    }

    async loadAllData() {
        try {
            const response = await fetch(this.API_URL);
            const data = await response.json();
            this.trades = data.trades || [];
            this.accounts = data.accounts || [];
            this.markets = data.markets || ['EUR/USD', 'GBP/USD', 'BTC/USD', 'GOLD'];
            this.traders = data.traders || ['Marius'];
            
            // Rafraîchir l'affichage après chargement
            this.displayTrades();
            this.displayAccounts();
            this.updateStats();
            this.displayMarkets();
            this.displayTraders();
        } catch (error) {
            console.error('Erreur chargement données:', error);
        }
    }

    async saveAllData() {
        try {
            const data = {
                trades: this.trades,
                accounts: this.accounts,
                markets: this.markets,
                traders: this.traders
            };
            await fetch(this.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.error('Erreur sauvegarde données:', error);
            alert('❌ Erreur lors de la sauvegarde des données');
        }
    }

    init() {
        this.initTabs();
        this.initForms();
        this.loadSettings();
        this.refreshUI();
        this.setDefaultDateTime();
    }

    // =======================
    // GESTION DES ONGLETS
    // =======================

    initTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                this.switchTab(targetTab);
            });
        });
    }

    switchTab(tabName) {
        // Masquer tous les onglets
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Désactiver tous les boutons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Activer l'onglet sélectionné
        document.getElementById(tabName).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Mettre à jour les graphiques si on affiche l'onglet performance
        if (tabName === 'performance') {
            this.initializeFilters();
            setTimeout(() => this.updatePerformanceCharts(), 100);
        }
    }

    // =======================
    // GESTION DES FORMULAIRES
    // =======================

    initForms() {
        // Formulaire de trade
        document.getElementById('tradeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTrade();
        });

        // Formulaire de compte
        document.getElementById('accountForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addAccount();
        });

        // Générer les champs spécifiques quand les comptes changent
        document.getElementById('tradeAccounts').addEventListener('change', () => {
            this.generateAccountSpecificFields();
        });
    }

    generateAccountSpecificFields() {
        const accountsSelect = document.getElementById('tradeAccounts');
        const selectedAccounts = Array.from(accountsSelect.selectedOptions);
        const container = document.getElementById('accountFieldsContainer');
        const section = document.getElementById('accountSpecificFields');

        if (selectedAccounts.length === 0) {
            section.style.display = 'none';
            container.innerHTML = '';
            return;
        }

        section.style.display = 'block';
        container.innerHTML = '';

        selectedAccounts.forEach(option => {
            const accountId = option.value;
            const accountName = option.textContent;
            
            const accountCard = document.createElement('div');
            accountCard.className = 'account-specific-card';
            accountCard.style.cssText = `
                background: var(--secondary-bg);
                padding: 20px;
                border-radius: 8px;
                border: 1px solid var(--border-color);
                margin-bottom: 15px;
            `;
            
            accountCard.innerHTML = `
                <h4 style="color: var(--accent-red); margin-bottom: 15px;">💼 ${accountName}</h4>
                <div class="form-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div class="form-group">
                        <label>% Risque:</label>
                        <input type="number" step="0.001" class="account-field" data-account="${accountId}" data-field="riskPercent" placeholder="Laisser vide pour utiliser la valeur par défaut">
                    </div>
                    <div class="form-group">
                        <label>% Gain/Perte:</label>
                        <input type="number" step="0.001" class="account-field" data-account="${accountId}" data-field="profitPercent" placeholder="Laisser vide pour utiliser la valeur par défaut">
                    </div>
                    <div class="form-group">
                        <label>RR:</label>
                        <input type="number" step="0.001" class="account-field" data-account="${accountId}" data-field="rr" placeholder="Laisser vide pour utiliser la valeur par défaut">
                    </div>
                    <div class="form-group">
                        <label>PnL ($):</label>
                        <input type="number" step="0.001" class="account-field" data-account="${accountId}" data-field="pnl" placeholder="Laisser vide pour utiliser la valeur par défaut">
                    </div>
                    <div class="form-group">
                        <label>Commission ($):</label>
                        <input type="number" step="0.001" class="account-field" data-account="${accountId}" data-field="commission" placeholder="0" value="0">
                    </div>
                </div>
            `;
            
            container.appendChild(accountCard);
        });
    }

    autoCalculateTradeValues() {
        const result = document.getElementById('tradeResult').value;
        const profitPercentField = document.getElementById('tradeProfitPercent');
        const rrField = document.getElementById('tradeRR');
        const pnlField = document.getElementById('tradePnL');

        // Ajuster les signes en fonction du résultat (sauf pour BE)
        if (result !== 'BE') {
            [profitPercentField, rrField, pnlField].forEach(field => {
                let value = parseFloat(field.value);
                if (!isNaN(value) && value !== 0) {
                    const absValue = Math.abs(value);
                    
                    if (result === 'TP') {
                        // TP = gains positifs
                        field.value = absValue;
                    } else if (result === 'SL') {
                        // SL = pertes négatives
                        field.value = -absValue;
                    }
                }
            });
        }
        // Pour BE, on laisse l'utilisateur entrer les valeurs manuellement (proches de 0 mais pas forcément 0)
    }

    setDefaultDateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        document.getElementById('tradeDate').value = `${year}-${month}-${day}`;
    }

    // =======================
    // GESTION DES TRADES
    // =======================

    addTrade() {
        const accountsSelect = document.getElementById('tradeAccounts');
        const selectedAccounts = Array.from(accountsSelect.selectedOptions).map(option => option.value);
        
        if (selectedAccounts.length === 0) {
            this.showNotification('Veuillez sélectionner au moins un compte!', 'danger');
            return;
        }

        // Valeurs par défaut
        const defaultValues = {
            market: document.getElementById('tradeMarket').value,
            type: document.getElementById('tradeType').value,
            trader: document.getElementById('tradeTrader').value,
            date: document.getElementById('tradeDate').value,
            riskPercent: parseFloat(document.getElementById('tradeRiskPercent').value) || 0,
            profitPercent: parseFloat(document.getElementById('tradeProfitPercent').value) || 0,
            rr: parseFloat(document.getElementById('tradeRR').value) || 0,
            result: document.getElementById('tradeResult').value,
            pnl: parseFloat(document.getElementById('tradePnL').value) || 0,
            commission: parseFloat(document.getElementById('tradeCommission').value) || 0,
            notes: document.getElementById('tradeNotes').value
        };

        const groupId = this.editingTradeId || Date.now();

        if (this.editingTradeId) {
            // Mode édition : supprimer tous les trades du groupe
            this.trades = this.trades.filter(t => t.groupId !== this.editingTradeId);
        }

        // Créer un trade pour chaque compte
        selectedAccounts.forEach(accountId => {
            // Récupérer les valeurs spécifiques au compte ou utiliser les valeurs par défaut
            const accountFields = document.querySelectorAll(`.account-field[data-account="${accountId}"]`);
            const accountData = {};
            
            accountFields.forEach(field => {
                const fieldName = field.dataset.field;
                const value = parseFloat(field.value);
                accountData[fieldName] = !isNaN(value) && field.value !== '' ? value : defaultValues[fieldName];
            });

            const trade = {
                id: Date.now() + Math.random(), // ID unique pour chaque trade
                groupId: groupId, // Même groupId pour tous les trades du groupe
                account: accountId,
                market: defaultValues.market,
                type: defaultValues.type,
                trader: defaultValues.trader,
                date: defaultValues.date,
                riskPercent: accountData.riskPercent !== undefined ? accountData.riskPercent : defaultValues.riskPercent,
                profitPercent: accountData.profitPercent !== undefined ? accountData.profitPercent : defaultValues.profitPercent,
                rr: accountData.rr !== undefined ? accountData.rr : defaultValues.rr,
                result: defaultValues.result,
                pnl: accountData.pnl !== undefined ? accountData.pnl : defaultValues.pnl,
                commission: accountData.commission !== undefined ? accountData.commission : defaultValues.commission,
                notes: defaultValues.notes
            };

            this.trades.push(trade);
        });

        if (this.editingTradeId) {
            this.showNotification('Trade(s) modifié(s) avec succès!', 'success');
            this.editingTradeId = null;
            this.updateFormMode();
        } else {
            this.showNotification(`${selectedAccounts.length} trade(s) enregistré(s) avec succès!`, 'success');
        }

        this.saveAllData();
        this.refreshUI();
        document.getElementById('tradeForm').reset();
        this.generateAccountSpecificFields();
        this.setDefaultDateTime();
    }

    deleteTradeGroup(groupId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce(s) trade(s)?')) {
            this.trades = this.trades.filter(t => (t.groupId || t.id) !== groupId);
            this.saveAllData();
            this.refreshUI();
            this.showNotification('Trade(s) supprimé(s)', 'danger');
        }
    }

    editTradeGroup(groupId) {
        const groupTrades = this.trades.filter(t => (t.groupId || t.id) === groupId);
        if (groupTrades.length === 0) return;

        // Passer en mode édition
        this.editingTradeId = groupId;

        // Utiliser le premier trade du groupe pour les valeurs communes
        const firstTrade = groupTrades[0];

        // Sélectionner tous les comptes du groupe
        const accountsSelect = document.getElementById('tradeAccounts');
        const accounts = groupTrades.map(t => t.account);
        Array.from(accountsSelect.options).forEach(option => {
            option.selected = accounts.includes(option.value);
        });

        // Remplir les valeurs communes
        document.getElementById('tradeMarket').value = firstTrade.market;
        document.getElementById('tradeType').value = firstTrade.type;
        document.getElementById('tradeTrader').value = firstTrade.trader;
        document.getElementById('tradeDate').value = firstTrade.date;
        document.getElementById('tradeResult').value = firstTrade.result;
        document.getElementById('tradeNotes').value = firstTrade.notes || '';

        // Remplir les valeurs par défaut (premier trade)
        document.getElementById('tradeRiskPercent').value = firstTrade.riskPercent || '';
        document.getElementById('tradeProfitPercent').value = firstTrade.profitPercent || '';
        document.getElementById('tradeRR').value = firstTrade.rr || '';
        document.getElementById('tradePnL').value = firstTrade.pnl || '';
        document.getElementById('tradeCommission').value = firstTrade.commission || 0;

        // Générer les champs spécifiques
        this.generateAccountSpecificFields();

        // Remplir les valeurs spécifiques par compte
        groupTrades.forEach(trade => {
            const inputs = document.querySelectorAll(`.account-field[data-account="${trade.account}"]`);
            inputs.forEach(input => {
                const field = input.dataset.field;
                if (trade[field] !== undefined) {
                    input.value = trade[field];
                }
            });
        });

        // Mettre à jour l'interface
        this.updateFormMode();

        // Scroller jusqu'au formulaire
        document.getElementById('tradeForm').scrollIntoView({ behavior: 'smooth', block: 'start' });

        this.showNotification('Mode édition activé', 'success');
    }

    cancelEdit() {
        this.editingTradeId = null;
        document.getElementById('tradeForm').reset();
        this.generateAccountSpecificFields();
        this.setDefaultDateTime();
        this.updateFormMode();
        this.showNotification('Modification annulée', 'success');
    }

    updateFormMode() {
        const submitBtn = document.getElementById('tradeFormSubmitBtn');
        const cancelBtn = document.getElementById('tradeCancelEditBtn');
        const editLabel = document.getElementById('tradeEditingLabel');

        if (this.editingTradeId) {
            submitBtn.textContent = 'Modifier le Trade';
            submitBtn.className = 'btn btn-secondary';
            cancelBtn.style.display = 'inline-block';
            editLabel.style.display = 'inline-block';
        } else {
            submitBtn.textContent = 'Enregistrer le Trade';
            submitBtn.className = 'btn btn-primary';
            cancelBtn.style.display = 'none';
            editLabel.style.display = 'none';
        }
    }

    displayTrades() {
        const tbody = document.getElementById('tradesTableBody');
        tbody.innerHTML = '';

        if (this.trades.length === 0) {
            tbody.innerHTML = '<tr><td colspan="11" style="text-align: center; padding: 40px; color: var(--text-muted);">Aucun trade enregistré</td></tr>';
            return;
        }

        // Trier les trades par date (plus récent en premier)
        const sortedTrades = [...this.trades].sort((a, b) => new Date(b.date) - new Date(a.date));

        let totalPnL = 0;
        let totalCommission = 0;

        sortedTrades.forEach(trade => {
            const tr = document.createElement('tr');
            
            const date = new Date(trade.date);
            const formattedDate = date.toLocaleDateString('fr-FR');
            
            const pnlClass = trade.pnl > 0 ? 'pnl-positive' : trade.pnl < 0 ? 'pnl-negative' : 'pnl-neutral';
            const typeClass = trade.type === 'BUY' ? 'trade-buy' : 'trade-sell';
            const resultClass = trade.result === 'TP' ? 'trade-tp' : trade.result === 'SL' ? 'trade-sl' : 'trade-be';
            const profitPercentClass = trade.profitPercent > 0 ? 'pnl-positive' : trade.profitPercent < 0 ? 'pnl-negative' : 'pnl-neutral';
            const rrClass = trade.rr > 0 ? 'pnl-positive' : trade.rr < 0 ? 'pnl-negative' : 'pnl-neutral';
            
            // Afficher le compte (nouveau format) ou les comptes (ancien format)
            const accountsDisplay = trade.account || (trade.accounts ? trade.accounts.join(', ') : 'N/A');

            totalPnL += trade.pnl;
            totalCommission += (trade.commission || 0);

            tr.innerHTML = `
                <td>${formattedDate}</td>
                <td>${accountsDisplay}</td>
                <td>${trade.market}</td>
                <td class="${typeClass}">${trade.type}</td>
                <td>${trade.riskPercent !== undefined ? trade.riskPercent.toFixed(3) + '%' : 'N/A'}</td>
                <td class="${profitPercentClass}">${trade.profitPercent !== undefined ? trade.profitPercent.toFixed(3) + '%' : 'N/A'}</td>
                <td class="${rrClass}">${trade.rr !== undefined ? trade.rr.toFixed(3) + 'R' : 'N/A'}</td>
                <td class="${resultClass}">${trade.result}</td>
                <td class="${pnlClass}">$${trade.pnl.toFixed(3)}</td>
                <td class="pnl-negative">$${(trade.commission || 0).toFixed(3)}</td>
                <td>${trade.trader}</td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick="journal.editTradeGroup(${trade.groupId || trade.id})" style="margin-right: 5px;">Modifier</button>
                    <button class="btn btn-danger btn-small" onclick="journal.deleteTradeGroup(${trade.groupId || trade.id})">Supprimer</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Ajouter une ligne de total dans le footer
        const tfoot = document.getElementById('tradesTableFooter');
        if (tfoot && this.trades.length > 0) {
            const totalPnLClass = totalPnL > 0 ? 'pnl-positive' : totalPnL < 0 ? 'pnl-negative' : 'pnl-neutral';
            tfoot.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: right; padding: 15px;">TOTAL:</td>
                    <td class="${totalPnLClass}">$${totalPnL.toFixed(3)}</td>
                    <td class="pnl-negative">$${totalCommission.toFixed(3)}</td>
                    <td colspan="2"></td>
                </tr>
            `;
        } else if (tfoot) {
            tfoot.innerHTML = '';
        }
    }

    // =======================
    // GESTION DES COMPTES
    // =======================

    addAccount() {
        const accountId = document.getElementById('accountId').value;
        const accountName = document.getElementById('accountName').value;
        const initialBalance = parseFloat(document.getElementById('accountBalance').value);
        const description = document.getElementById('accountDescription').value;

        if (this.editingAccountId) {
            // Mode édition : mettre à jour le compte existant
            const account = this.accounts.find(a => a.id === this.editingAccountId);
            if (account) {
                // Vérifier si le nouvel ID existe déjà (sauf si c'est le même)
                if (accountId !== this.editingAccountId && this.accounts.find(a => a.id === accountId)) {
                    this.showNotification('Un compte avec cet ID existe déjà!', 'danger');
                    return;
                }

                account.id = accountId;
                account.name = accountName;
                account.initialBalance = initialBalance;
                account.description = description;
                
                this.showNotification('Compte modifié avec succès!', 'success');
            }
            this.editingAccountId = null;
            this.updateAccountFormMode();
        } else {
            // Mode ajout : vérifier si l'ID existe déjà
            if (this.accounts.find(a => a.id === accountId)) {
                this.showNotification('Un compte avec cet ID existe déjà!', 'danger');
                return;
            }

            const account = {
                id: accountId,
                name: accountName,
                initialBalance: initialBalance,
                description: description,
                createdAt: new Date().toISOString()
            };

            this.accounts.push(account);
            this.showNotification('Compte ajouté avec succès!', 'success');
        }

        this.saveAllData();
        this.refreshUI();
        document.getElementById('accountForm').reset();
    }

    deleteAccount(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce compte?')) {
            this.accounts = this.accounts.filter(a => a.id !== id);
            this.saveAllData();
            this.refreshUI();
            this.showNotification('Compte supprimé', 'danger');
        }
    }

    editAccount(id) {
        const account = this.accounts.find(a => a.id === id);
        if (!account) return;

        // Passer en mode édition
        this.editingAccountId = id;

        // Remplir le formulaire avec les données du compte
        document.getElementById('accountId').value = account.id;
        document.getElementById('accountName').value = account.name;
        document.getElementById('accountBalance').value = account.initialBalance;
        document.getElementById('accountDescription').value = account.description || '';

        // Mettre à jour l'interface
        this.updateAccountFormMode();

        // Scroller jusqu'au formulaire
        document.getElementById('accountForm').scrollIntoView({ behavior: 'smooth', block: 'start' });

        this.showNotification('Mode édition activé', 'success');
    }

    cancelAccountEdit() {
        this.editingAccountId = null;
        document.getElementById('accountForm').reset();
        this.updateAccountFormMode();
        this.showNotification('Modification annulée', 'success');
    }

    updateAccountFormMode() {
        const submitBtn = document.getElementById('accountFormSubmitBtn');
        const cancelBtn = document.getElementById('accountCancelEditBtn');
        const editLabel = document.getElementById('accountEditingLabel');

        if (this.editingAccountId) {
            submitBtn.textContent = 'Modifier le Compte';
            submitBtn.className = 'btn btn-secondary';
            cancelBtn.style.display = 'inline-block';
            editLabel.style.display = 'inline-block';
        } else {
            submitBtn.textContent = 'Ajouter le Compte';
            submitBtn.className = 'btn btn-primary';
            cancelBtn.style.display = 'none';
            editLabel.style.display = 'none';
        }
    }

    // =======================
    // MODALE DE DÉTAILS DU COMPTE
    // =======================

    openAccountModal(accountId) {
        const account = this.accounts.find(a => a.id === accountId);
        if (!account) return;

        // Récupérer tous les trades de ce compte
        const accountTrades = this.trades.filter(t => {
            if (t.account) return t.account === accountId;
            if (t.accounts && Array.isArray(t.accounts)) return t.accounts.includes(accountId);
            return false;
        });

        // Trier par date
        accountTrades.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Calculer les statistiques
        const totalPnL = accountTrades.reduce((sum, t) => sum + t.pnl, 0);
        const currentBalance = account.initialBalance + totalPnL;
        const totalGain = accountTrades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
        const totalLoss = Math.abs(accountTrades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));

        // Compter les trades uniques (par groupId)
        const uniqueGroups = new Set();
        accountTrades.forEach(t => {
            uniqueGroups.add(t.groupId || t.id);
        });
        const totalTrades = uniqueGroups.size;

        // Remplir la modale
        document.getElementById('modalAccountTitle').textContent = `Détails — ${account.name}`;
        document.getElementById('modalInitialBalance').textContent = `$${account.initialBalance.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('modalCreatedDate').textContent = `Créé le ${new Date(account.createdAt).toLocaleString('fr-FR')}`;
        document.getElementById('modalDescription').textContent = account.description || 'Aucune description fournie.';
        document.getElementById('modalTotalTrades').textContent = totalTrades;
        document.getElementById('modalTotalLoss').textContent = `$${totalLoss.toFixed(2)}`;
        document.getElementById('modalTotalGain').textContent = `$${totalGain.toFixed(2)}`;
        document.getElementById('modalCurrentBalance').textContent = `$${currentBalance.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

        // Créer le graphique d'évolution
        this.createAccountEvolutionChart(account, accountTrades);

        // Afficher la modale
        document.getElementById('accountModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeAccountModal() {
        document.getElementById('accountModal').classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Détruire le graphique
        if (this.accountEvolutionChart) {
            this.accountEvolutionChart.destroy();
            this.accountEvolutionChart = null;
        }
    }

    createAccountEvolutionChart(account, trades) {
        const ctx = document.getElementById('accountEvolutionChart');
        if (!ctx) return;

        // Détruire l'ancien graphique s'il existe
        if (this.accountEvolutionChart) {
            this.accountEvolutionChart.destroy();
        }

        // Créer les points d'évolution
        const evolutionData = [];
        const labels = [];
        let balance = account.initialBalance;

        // Point de départ
        evolutionData.push(balance);
        labels.push(new Date(account.createdAt).toLocaleDateString('fr-FR'));

        // Ajouter chaque trade
        trades.forEach(trade => {
            balance += trade.pnl;
            evolutionData.push(balance);
            labels.push(new Date(trade.date).toLocaleDateString('fr-FR'));
        });

        this.accountEvolutionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    data: evolutionData,
                    borderColor: '#08f7fe',
                    backgroundColor: 'rgba(8, 247, 254, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: '#08f7fe',
                    pointBorderColor: '#08f7fe',
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#08f7fe',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(26, 22, 37, 0.95)',
                        titleColor: '#08f7fe',
                        bodyColor: '#ffffff',
                        borderColor: '#08f7fe',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return '$' + context.parsed.y.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        display: false,
                        grid: {
                            display: false
                        }
                    },
                    x: {
                        display: false,
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    displayAccounts() {
        const grid = document.getElementById('accountsGrid');
        grid.innerHTML = '';

        if (this.accounts.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">Aucun compte enregistré</p>';
            return;
        }

        this.accounts.forEach(account => {
            // Gérer les anciens et nouveaux formats de trades
            const accountTrades = this.trades.filter(t => {
                // Nouveau format (account)
                if (t.account) {
                    return t.account === account.id;
                }
                // Ancien format (accounts array)
                if (t.accounts && Array.isArray(t.accounts)) {
                    return t.accounts.includes(account.id);
                }
                return false;
            });
            const totalPnL = accountTrades.reduce((sum, t) => sum + t.pnl, 0);
            const currentBalance = account.initialBalance + totalPnL;

            const card = document.createElement('div');
            card.className = 'account-card';
            card.onclick = () => this.openAccountModal(account.id);
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <div class="account-header">
                    <div class="account-name">${account.name}</div>
                    <div class="account-id">${account.id}</div>
                </div>
                <div class="account-balance">$${currentBalance.toFixed(2)}</div>
                <div class="account-description">${account.description || 'Aucune description'}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">
                    <div>Solde initial: $${account.initialBalance.toFixed(2)}</div>
                    <div>PnL: <span class="${totalPnL >= 0 ? 'pnl-positive' : 'pnl-negative'}">$${totalPnL.toFixed(2)}</span></div>
                    <div>Nombre de trades: ${accountTrades.length}</div>
                </div>
                <div class="account-actions">
                    <button class="btn btn-secondary btn-small" onclick="event.stopPropagation(); journal.editAccount('${account.id}')" style="margin-right: 5px;">Modifier</button>
                    <button class="btn btn-danger btn-small" onclick="event.stopPropagation(); journal.deleteAccount('${account.id}')">Supprimer</button>
                </div>
            `;
            grid.appendChild(card);
        });

        // Mettre à jour le select du formulaire de trade
        this.updateAccountSelect();
    }

    updateAccountSelect() {
        const select = document.getElementById('tradeAccounts');
        select.innerHTML = '';
        this.accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = `${account.name} (${account.id})`;
            select.appendChild(option);
        });
    }

    // =======================
    // GESTION DES FILTRES
    // =======================

    initializeFilters() {
        // Remplir les selects de filtres
        this.updateFilterSelects();
        
        // Ajouter les listeners
        const filterIds = ['filterAccount', 'filterMarket', 'filterType', 'filterResult', 'filterDateFrom', 'filterDateTo'];
        filterIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.applyFilters());
            }
        });
    }

    updateFilterSelects() {
        // Filtrer par compte
        const accountSelect = document.getElementById('filterAccount');
        if (accountSelect) {
            accountSelect.innerHTML = '<option value="">Tous les comptes</option>';
            this.accounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account.id;
                option.textContent = `${account.name} (${account.id})`;
                accountSelect.appendChild(option);
            });
        }

        // Filtrer par marché
        const marketSelect = document.getElementById('filterMarket');
        if (marketSelect) {
            marketSelect.innerHTML = '<option value="">Tous les marchés</option>';
            this.markets.forEach(market => {
                const option = document.createElement('option');
                option.value = market;
                option.textContent = market;
                marketSelect.appendChild(option);
            });
        }
    }

    getFilteredTrades() {
        return this.trades.filter(trade => {
            // Filtre par compte
            if (this.filters.account) {
                // Nouveau format (account)
                if (trade.account && trade.account !== this.filters.account) {
                    return false;
                }
                // Ancien format (accounts array)
                if (trade.accounts) {
                    const tradeAccounts = trade.accounts || [trade.account];
                    if (!tradeAccounts.includes(this.filters.account)) {
                        return false;
                    }
                }
            }

            // Filtre par marché
            if (this.filters.market && trade.market !== this.filters.market) {
                return false;
            }

            // Filtre par type
            if (this.filters.type && trade.type !== this.filters.type) {
                return false;
            }

            // Filtre par résultat
            if (this.filters.result && trade.result !== this.filters.result) {
                return false;
            }

            // Filtre par date de début
            if (this.filters.dateFrom) {
                const tradeDate = new Date(trade.date);
                const filterDate = new Date(this.filters.dateFrom);
                if (tradeDate < filterDate) {
                    return false;
                }
            }

            // Filtre par date de fin
            if (this.filters.dateTo) {
                const tradeDate = new Date(trade.date);
                const filterDate = new Date(this.filters.dateTo);
                filterDate.setHours(23, 59, 59, 999); // Inclure toute la journée
                if (tradeDate > filterDate) {
                    return false;
                }
            }

            return true;
        });
    }

    applyFilters() {
        this.filters.account = document.getElementById('filterAccount').value;
        this.filters.market = document.getElementById('filterMarket').value;
        this.filters.type = document.getElementById('filterType').value;
        this.filters.result = document.getElementById('filterResult').value;
        this.filters.dateFrom = document.getElementById('filterDateFrom').value;
        this.filters.dateTo = document.getElementById('filterDateTo').value;

        this.updatePerformanceStats();
        this.updatePerformanceCharts();
    }

    applyQuickFilter(period) {
        const now = new Date();
        let dateFrom = new Date();

        switch (period) {
            case 'week':
                // Début de la semaine (lundi)
                const day = now.getDay();
                const diff = day === 0 ? -6 : 1 - day; // Si dimanche, revenir à lundi précédent
                dateFrom.setDate(now.getDate() + diff);
                break;
            case 'month':
                // Début du mois
                dateFrom.setDate(1);
                break;
            case 'year':
                // Début de l'année
                dateFrom.setMonth(0, 1);
                break;
        }

        // Formater les dates pour les inputs
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        document.getElementById('filterDateFrom').value = formatDate(dateFrom);
        document.getElementById('filterDateTo').value = formatDate(now);
        
        // Réinitialiser les autres filtres
        document.getElementById('filterAccount').value = '';
        document.getElementById('filterMarket').value = '';
        document.getElementById('filterType').value = '';
        document.getElementById('filterResult').value = '';

        this.applyFilters();
    }

    resetFilters() {
        this.filters = {
            account: '',
            market: '',
            type: '',
            result: '',
            dateFrom: '',
            dateTo: ''
        };

        document.getElementById('filterAccount').value = '';
        document.getElementById('filterMarket').value = '';
        document.getElementById('filterType').value = '';
        document.getElementById('filterResult').value = '';
        document.getElementById('filterDateFrom').value = '';
        document.getElementById('filterDateTo').value = '';

        this.updatePerformanceStats();
        this.updatePerformanceCharts();
    }

    // =======================
    // CALCULS DE PERFORMANCE
    // =======================

    calculateStats() {
        // Utiliser les trades filtrés si on est dans l'onglet performance
        const tradesToUse = document.getElementById('performance')?.classList.contains('active') 
            ? this.getFilteredTrades() 
            : this.trades;

        // Grouper les trades par groupId pour compter correctement
        const groupedTrades = {};
        tradesToUse.forEach(trade => {
            const gid = trade.groupId || trade.id;
            if (!groupedTrades[gid]) {
                groupedTrades[gid] = [];
            }
            groupedTrades[gid].push(trade);
        });

        const stats = {
            totalPnL: 0,
            winningTrades: 0,
            losingTrades: 0,
            breakEvenTrades: 0,
            winRate: 0,
            avgRR: 0,
            totalCommissions: 0,
            totalTrades: Object.keys(groupedTrades).length, // Compter les groupes
            buyTrades: 0,
            sellTrades: 0,
            pnlByDate: {},
            pnlByDay: { 'Lundi': 0, 'Mardi': 0, 'Mercredi': 0, 'Jeudi': 0, 'Vendredi': 0, 'Samedi': 0, 'Dimanche': 0 },
            pnlByMarket: {}
        };

        let totalRR = 0;
        let rrCount = 0;

        // Parcourir les groupes
        Object.values(groupedTrades).forEach(group => {
            // Utiliser le premier trade du groupe pour les caractéristiques communes
            const trade = group[0];
            
            // Sommer les valeurs de tous les trades du groupe
            const groupPnL = group.reduce((sum, t) => sum + t.pnl, 0);
            const groupCommission = group.reduce((sum, t) => sum + (t.commission || 0), 0);
            const groupRR = group.reduce((sum, t) => sum + (t.rr || 0), 0) / group.length; // Moyenne du RR

            // PnL total
            stats.totalPnL += groupPnL;

            // Total des commissions
            stats.totalCommissions += groupCommission;

            // Comptage des résultats (basé sur le résultat commun du groupe)
            if (trade.result === 'TP') {
                stats.winningTrades++;
            } else if (trade.result === 'SL') {
                stats.losingTrades++;
            } else {
                stats.breakEvenTrades++;
            }

            // Calcul du RR moyen
            if (groupRR !== undefined && groupRR !== null && !isNaN(groupRR)) {
                totalRR += groupRR;
                rrCount++;
            }

            // Comptage BUY/SELL (1 seul compte par groupe)
            if (trade.type === 'BUY') {
                stats.buyTrades++;
            } else {
                stats.sellTrades++;
            }

            // PnL par date (somme du groupe)
            const date = new Date(trade.date).toLocaleDateString('fr-FR');
            stats.pnlByDate[date] = (stats.pnlByDate[date] || 0) + groupPnL;

            // PnL par jour de la semaine
            const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
            const dayName = dayNames[new Date(trade.date).getDay()];
            stats.pnlByDay[dayName] += groupPnL;

            // PnL par marché
            stats.pnlByMarket[trade.market] = (stats.pnlByMarket[trade.market] || 0) + groupPnL;
        });

        // Calcul du win rate (seulement TP et SL)
        const significantTrades = stats.winningTrades + stats.losingTrades;
        stats.winRate = significantTrades > 0 ? (stats.winningTrades / significantTrades * 100) : 0;
        
        // Calcul du RR moyen
        stats.avgRR = rrCount > 0 ? (totalRR / rrCount) : 0;

        return stats;
    }

    updatePerformanceStats() {
        const stats = this.calculateStats();

        document.getElementById('totalPnL').textContent = `$${stats.totalPnL.toFixed(2)}`;
        document.getElementById('totalPnL').className = stats.totalPnL >= 0 ? 'stat-value pnl-positive' : 'stat-value pnl-negative';
        
        document.getElementById('winningTrades').textContent = stats.winningTrades;
        document.getElementById('losingTrades').textContent = stats.losingTrades;
        document.getElementById('breakEvenTrades').textContent = stats.breakEvenTrades;
        document.getElementById('winRate').textContent = `${stats.winRate.toFixed(1)}%`;
        document.getElementById('avgRR').textContent = `${stats.avgRR.toFixed(3)}R`;
        document.getElementById('totalCommissions').textContent = `$${stats.totalCommissions.toFixed(3)}`;
        document.getElementById('totalTrades').textContent = stats.totalTrades;
    }

    // =======================
    // GRAPHIQUES
    // =======================

    updatePerformanceCharts() {
        const stats = this.calculateStats();

        // Détruire les anciens graphiques
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });

        this.createPnLEvolutionChart(stats);
        this.createProfitDistributionChart(stats);
        this.createBuySellChart(stats);
        this.createDayOfWeekChart(stats);
        this.createMarketPerformanceChart(stats);
    }

    createPnLEvolutionChart(stats) {
        const ctx = document.getElementById('pnlEvolutionChart');
        if (!ctx) return;

        const sortedDates = Object.keys(stats.pnlByDate).sort((a, b) => {
            const dateA = a.split('/').reverse().join('-');
            const dateB = b.split('/').reverse().join('-');
            return dateA.localeCompare(dateB);
        });

        let cumulativePnL = 0;
        const cumulativeData = sortedDates.map(date => {
            cumulativePnL += stats.pnlByDate[date];
            return cumulativePnL;
        });

        this.charts.pnlEvolution = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedDates,
                datasets: [{
                    label: 'PnL Cumulé ($)',
                    data: cumulativeData,
                    borderColor: '#06d6a0',
                    backgroundColor: 'rgba(6, 214, 160, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: { color: '#f1faee' }
                    }
                },
                scales: {
                    y: {
                        ticks: { color: '#a8b2d1' },
                        grid: { color: 'rgba(61, 38, 103, 0.3)' }
                    },
                    x: {
                        ticks: { color: '#a8b2d1' },
                        grid: { color: 'rgba(61, 38, 103, 0.3)' }
                    }
                }
            }
        });
    }

    createProfitDistributionChart(stats) {
        const ctx = document.getElementById('profitDistributionChart');
        if (!ctx) return;

        const winningPnL = this.trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
        const losingPnL = Math.abs(this.trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));

        this.charts.profitDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Gains', 'Pertes'],
                datasets: [{
                    data: [winningPnL, losingPnL],
                    backgroundColor: ['#06d6a0', '#e63946'],
                    borderColor: '#251441',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: { color: '#f1faee' }
                    }
                }
            }
        });
    }

    createBuySellChart(stats) {
        const ctx = document.getElementById('buySellChart');
        if (!ctx) return;

        this.charts.buySell = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['BUY', 'SELL'],
                datasets: [{
                    data: [stats.buyTrades, stats.sellTrades],
                    backgroundColor: ['#06d6a0', '#e63946'],
                    borderColor: '#251441',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: { color: '#f1faee' }
                    }
                }
            }
        });
    }

    createDayOfWeekChart(stats) {
        const ctx = document.getElementById('dayOfWeekChart');
        if (!ctx) return;

        const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const data = days.map(day => stats.pnlByDay[day]);

        this.charts.dayOfWeek = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [{
                    label: 'PnL ($)',
                    data: data,
                    backgroundColor: data.map(val => val >= 0 ? '#06d6a0' : '#e63946'),
                    borderColor: data.map(val => val >= 0 ? '#06d6a0' : '#e63946'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: { color: '#f1faee' }
                    }
                },
                scales: {
                    y: {
                        ticks: { color: '#a8b2d1' },
                        grid: { color: 'rgba(61, 38, 103, 0.3)' }
                    },
                    x: {
                        ticks: { color: '#a8b2d1' },
                        grid: { color: 'rgba(61, 38, 103, 0.3)' }
                    }
                }
            }
        });
    }

    createMarketPerformanceChart(stats) {
        const ctx = document.getElementById('marketPerformanceChart');
        if (!ctx) return;

        const markets = Object.keys(stats.pnlByMarket);
        const data = markets.map(market => stats.pnlByMarket[market]);

        this.charts.marketPerformance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: markets,
                datasets: [{
                    label: 'PnL ($)',
                    data: data,
                    backgroundColor: data.map(val => val >= 0 ? '#06d6a0' : '#e63946'),
                    borderColor: data.map(val => val >= 0 ? '#06d6a0' : '#e63946'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: { color: '#f1faee' }
                    }
                },
                scales: {
                    y: {
                        ticks: { color: '#a8b2d1' },
                        grid: { color: 'rgba(61, 38, 103, 0.3)' }
                    },
                    x: {
                        ticks: { color: '#a8b2d1' },
                        grid: { color: 'rgba(61, 38, 103, 0.3)' }
                    }
                }
            }
        });
    }

    // =======================
    // GESTION DES RÉGLAGES
    // =======================

    loadSettings() {
        this.displayMarkets();
        this.displayTraders();
        this.updateMarketSelect();
        this.updateTraderSelect();
    }

    displayMarkets() {
        const container = document.getElementById('marketsList');
        container.innerHTML = '';

        this.markets.forEach(market => {
            const tag = document.createElement('div');
            tag.className = 'tag';
            tag.innerHTML = `
                <span class="tag-text">${market}</span>
                <span class="tag-remove" onclick="journal.removeMarket('${market}')">✕</span>
            `;
            container.appendChild(tag);
        });
    }

    displayTraders() {
        const container = document.getElementById('tradersList');
        container.innerHTML = '';

        this.traders.forEach(trader => {
            const tag = document.createElement('div');
            tag.className = 'tag';
            tag.innerHTML = `
                <span class="tag-text">${trader}</span>
                <span class="tag-remove" onclick="journal.removeTrader('${trader}')">✕</span>
            `;
            container.appendChild(tag);
        });
    }

    updateMarketSelect() {
        const select = document.getElementById('tradeMarket');
        select.innerHTML = '<option value="">Sélectionner un marché</option>';
        this.markets.forEach(market => {
            const option = document.createElement('option');
            option.value = market;
            option.textContent = market;
            select.appendChild(option);
        });
    }

    updateTraderSelect() {
        const select = document.getElementById('tradeTrader');
        select.innerHTML = '<option value="">Sélectionner un trader</option>';
        this.traders.forEach(trader => {
            const option = document.createElement('option');
            option.value = trader;
            option.textContent = trader;
            select.appendChild(option);
        });
    }

    removeMarket(market) {
        this.markets = this.markets.filter(m => m !== market);
        this.saveAllData();
        this.displayMarkets();
        this.updateMarketSelect();
    }

    removeTrader(trader) {
        this.traders = this.traders.filter(t => t !== trader);
        this.saveAllData();
        this.displayTraders();
        this.updateTraderSelect();
    }

    // =======================
    // INTERFACE UTILISATEUR
    // =======================

    refreshUI() {
        this.displayTrades();
        this.displayAccounts();
        this.updatePerformanceStats();
    }

    showNotification(message, type = 'success') {
        // Créer une notification temporaire
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#06d6a0' : '#e63946'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// =======================
// FONCTIONS GLOBALES
// =======================

function addMarket() {
    const input = document.getElementById('newMarket');
    const market = input.value.trim();
    
    if (market && !journal.markets.includes(market)) {
        journal.markets.push(market);
        journal.saveAllData();
        journal.displayMarkets();
        journal.updateMarketSelect();
        input.value = '';
        journal.showNotification('Marché ajouté!', 'success');
    }
}

function addTrader() {
    const input = document.getElementById('newTrader');
    const trader = input.value.trim();
    
    if (trader && !journal.traders.includes(trader)) {
        journal.traders.push(trader);
        journal.saveAllData();
        journal.displayTraders();
        journal.updateTraderSelect();
        input.value = '';
        journal.showNotification('Trader ajouté!', 'success');
    }
}

function exportData() {
    const data = {
        trades: journal.trades,
        accounts: journal.accounts,
        markets: journal.markets,
        traders: journal.traders,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-journal-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    journal.showNotification('Données exportées!', 'success');
}

function importData() {
    const input = document.getElementById('importFile');
    input.click();
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (confirm('Cette action remplacera toutes les données actuelles. Continuer?')) {
                    journal.trades = data.trades || [];
                    journal.accounts = data.accounts || [];
                    journal.markets = data.markets || [];
                    journal.traders = data.traders || [];
                    
                    journal.saveAllData();
                    
                    journal.loadSettings();
                    journal.refreshUI();
                    journal.showNotification('Données importées!', 'success');
                }
            } catch (error) {
                journal.showNotification('Erreur lors de l\'importation!', 'danger');
                console.error(error);
            }
        };
        reader.readAsText(file);
    };
}

function clearAllData() {
    if (confirm('ATTENTION: Cette action supprimera TOUTES les données de manière permanente. Continuer?')) {
        if (confirm('Êtes-vous VRAIMENT sûr? Cette action est irréversible!')) {
            localStorage.clear();
            location.reload();
        }
    }
}

// Ajouter des styles pour les animations
const style = document.createElement('style');
style.textContent = `
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
`;
document.head.appendChild(style);

// Initialiser l'application
const journal = new TradingJournal();
