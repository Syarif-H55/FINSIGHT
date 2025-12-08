// Wallets Data
let wallets = [];
let currentFilter = 'all';
let currentView = 'grid';

// Providers by type
const providers = {
    bank: ['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga', 'Permata', 'Danamon', 'BTN', 'Maybank', 'OCBC NISP', 'Panin', 'Bank Jago', 'Jenius'],
    ewallet: ['GoPay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja', 'Flip', 'PayPal', 'iSaku'],
    investment: ['Bibit', 'Bareksa', 'Ajaib', 'Stockbit', 'Pluang', 'TaniFund', 'Tokopedia Emas'],
    cash: ['Dompet Utama', 'Dompet Kecil', 'Celengan'],
    other: ['Lainnya']
};

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    return new Date(date).toLocaleDateString('id-ID');
}

function getWalletIcon(type) {
    const icons = {
        bank: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>',
        ewallet: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>',
        cash: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>',
        investment: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>',
        other: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>'
    };
    return icons[type] || icons.other;
}

// Update Summary Cards
function updateSummaryCards() {
    const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
    const activeWallets = wallets.filter(w => w.active).length;
    const lastSync = wallets.length > 0
        ? formatRelativeTime(wallets.reduce((latest, w) =>
            new Date(w.lastUpdated) > new Date(latest) ? w.lastUpdated : latest, wallets[0].lastUpdated))
        : '-';

    document.getElementById('total-balance').textContent = formatCurrency(totalBalance);
    document.getElementById('total-wallets').textContent = wallets.length;
    document.getElementById('active-wallets').textContent = activeWallets;
    document.getElementById('last-sync').textContent = lastSync;
}

// Render Wallets
function renderWallets() {
    const container = document.getElementById('wallets-grid');

    // Apply filter
    let filteredWallets = wallets;
    if (currentFilter !== 'all') {
        filteredWallets = wallets.filter(w => w.type === currentFilter);
    }

    // Apply view
    if (currentView === 'list') {
        container.classList.add('list-view');
    } else {
        container.classList.remove('list-view');
    }

    // Render
    if (filteredWallets.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <h3>Belum Ada Wallet</h3>
                <p>Mulai kelola keuangan dengan menambahkan wallet pertama Anda</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredWallets.map(wallet => {
        // Budget progress HTML
        let budgetHTML = '';
        if (wallet.budget && wallet.budget.limit > 0) {
            const spent = wallet.budget.spent || 0;
            const limit = wallet.budget.limit;
            const alertThreshold = wallet.budget.alertThreshold || 80;
            const percentage = Math.min(100, (spent / limit) * 100);

            let budgetStatus = 'on-track';
            if (percentage >= 100) budgetStatus = 'danger';
            else if (percentage >= alertThreshold) budgetStatus = 'warning';

            budgetHTML = `
                <div class="wallet-budget-status">
                    <div class="budget-info-row">
                        <span class="budget-label">Budget Bulanan</span>
                        <span class="budget-amount ${budgetStatus}">${formatCurrency(spent)} / ${formatCurrency(limit)}</span>
                    </div>
                    <div class="budget-progress-bar">
                        <div class="budget-progress-fill ${budgetStatus}" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="wallet-card ${wallet.active ? '' : 'inactive'}">
                <div class="wallet-status"></div>
                <div class="wallet-header" style="background: ${wallet.color};">
                    <span class="wallet-type-badge">${getTypeName(wallet.type)}</span>
                    <div class="wallet-name">${wallet.name}</div>
                    ${wallet.number ? `<div class="wallet-number">**** ${wallet.number.slice(-4)}</div>` : ''}
                    <div class="wallet-balance-section">
                        <div class="balance-label">Saldo</div>
                        <div class="wallet-balance">${formatCurrency(wallet.balance)}</div>
                    </div>
                </div>
                <div class="wallet-body">
                    <div class="wallet-info">
                        <div class="info-item">
                            <span class="info-label">Provider</span>
                            <span class="info-value">${wallet.provider || '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Status</span>
                            <span class="info-value">${wallet.active ? 'Aktif' : 'Non-aktif'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Last Update</span>
                            <span class="info-value">${formatRelativeTime(wallet.lastUpdated)}</span>
                        </div>
                    </div>
                    ${budgetHTML}
                    <div class="wallet-actions">
                        <button class="wallet-action-btn" onclick="editWallet(${wallet.id})">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                            Edit
                        </button>
                        <button class="wallet-action-btn primary" onclick="openTransferModal(${wallet.id})">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                            </svg>
                            Transfer
                        </button>
                        <button class="wallet-action-btn" onclick="openBudgetModal(${wallet.id})">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                            </svg>
                            Budget
                        </button>
                        <button class="wallet-action-btn" onclick="deleteWallet(${wallet.id})">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                            Hapus
                        </button>
                        <button class="wallet-action-btn" onclick="toggleWalletStatus(${wallet.id})">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                            ${wallet.active ? 'Non-aktifkan' : 'Aktifkan'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getTypeName(type) {
    const names = {
        bank: 'Bank',
        ewallet: 'E-Wallet',
        cash: 'Cash',
        investment: 'Investasi',
        other: 'Lainnya'
    };
    return names[type] || type;
}

// Modal Functions
function openWalletModal() {
    const modal = document.getElementById('wallet-modal');
    modal.classList.add('active');
    document.getElementById('wallet-form').reset();
    document.getElementById('modal-title').textContent = 'Tambah Wallet Baru';
    document.getElementById('provider-group').style.display = 'none';
}

function closeWalletModal() {
    const modal = document.getElementById('wallet-modal');
    modal.classList.remove('active');
}

function openTransferModal(walletId) {
    const modal = document.getElementById('transfer-modal');
    const wallet = wallets.find(w => w.id === walletId);

    if (!wallet) return;

    modal.classList.add('active');
    document.getElementById('transfer-from-id').value = walletId;
    document.getElementById('transfer-form').reset();

    // Populate destination wallets
    const transferTo = document.getElementById('transfer-to');
    transferTo.innerHTML = '<option value="">Pilih Wallet Tujuan</option>';

    wallets.filter(w => w.id !== walletId && w.active).forEach(w => {
        transferTo.innerHTML += `<option value="${w.id}">${w.name} (${formatCurrency(w.balance)})</option>`;
    });
}

function closeTransferModal() {
    const modal = document.getElementById('transfer-modal');
    modal.classList.remove('active');
}

function openBudgetModal(walletId) {
    const modal = document.getElementById('budget-modal');
    const wallet = wallets.find(w => w.id === walletId);

    if (!wallet) return;

    modal.classList.add('active');
    document.getElementById('budget-wallet-id').value = walletId;
    document.getElementById('budget-wallet-name').textContent = wallet.name;
    document.getElementById('budget-current-balance').textContent = formatCurrency(wallet.balance);

    // Populate existing budget data if available
    if (wallet.budget) {
        document.getElementById('budget-limit').value = wallet.budget.limit || '';
        document.getElementById('budget-alert-threshold').value = wallet.budget.alertThreshold || 80;

        // Set category checkboxes
        const categories = wallet.budget.categories || [];
        document.querySelectorAll('.budget-categories input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = categories.includes(checkbox.value);
        });
    } else {
        // Reset form for new budget
        document.getElementById('budget-limit').value = '';
        document.getElementById('budget-alert-threshold').value = 80;
        document.querySelectorAll('.budget-categories input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = true; // Default all categories checked
        });
    }
}

function closeBudgetModal() {
    const modal = document.getElementById('budget-modal');
    modal.classList.remove('active');
}

function editWallet(walletId) {
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) return;

    // Populate form
    document.getElementById('wallet-type').value = wallet.type;
    updateProviderOptions(wallet.type);
    document.getElementById('wallet-provider').value = wallet.provider || '';
    document.getElementById('wallet-name').value = wallet.name;
    document.getElementById('wallet-number').value = wallet.number || '';
    document.getElementById('wallet-balance').value = wallet.balance;
    document.getElementById('wallet-notes').value = wallet.notes || '';
    document.getElementById('wallet-active').checked = wallet.active;

    // Set color
    const colorInputs = document.querySelectorAll('input[name="wallet-color"]');
    colorInputs.forEach(input => {
        if (input.value === wallet.color) {
            input.checked = true;
        }
    });

    // Change modal title and store edit id
    document.getElementById('modal-title').textContent = 'Edit Wallet';
    document.getElementById('wallet-form').dataset.editId = walletId;

    openWalletModal();
}

function deleteWallet(walletId) {
    if (!confirm('Apakah Anda yakin ingin menghapus wallet ini?')) return;

    wallets = wallets.filter(w => w.id !== walletId);
    updateSummaryCards();
    renderWallets();
    saveToLocalStorage();
}

function toggleWalletStatus(walletId) {
    const wallet = wallets.find(w => w.id === walletId);
    if (wallet) {
        wallet.active = !wallet.active;
        wallet.lastUpdated = new Date().toISOString();
        updateSummaryCards();
        renderWallets();
        saveToLocalStorage();
    }
}

function updateProviderOptions(type) {
    const providerGroup = document.getElementById('provider-group');
    const providerSelect = document.getElementById('wallet-provider');

    if (type && providers[type]) {
        providerGroup.style.display = 'block';
        providerSelect.innerHTML = '<option value="">Pilih Provider</option>';
        providers[type].forEach(provider => {
            providerSelect.innerHTML += `<option value="${provider}">${provider}</option>`;
        });
    } else {
        providerGroup.style.display = 'none';
    }
}

// Save to LocalStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem('wallets', JSON.stringify(wallets));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

// Load from LocalStorage
function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('wallets');
        if (saved) {
            wallets = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Load data
    loadFromLocalStorage();
    updateSummaryCards();
    renderWallets();

    // Add Wallet Button
    const addWalletBtn = document.getElementById('add-wallet-btn');
    if (addWalletBtn) {
        addWalletBtn.addEventListener('click', openWalletModal);
    }

    // Close Modal Buttons
    const modalCloses = document.querySelectorAll('.modal-close, #cancel-btn, #cancel-transfer-btn, #cancel-budget-btn');
    modalCloses.forEach(btn => {
        btn.addEventListener('click', function() {
            closeWalletModal();
            closeTransferModal();
            closeBudgetModal();
        });
    });

    // Modal Overlay Click
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', function() {
            closeWalletModal();
            closeTransferModal();
            closeBudgetModal();
        });
    });

    // Wallet Type Change
    const walletType = document.getElementById('wallet-type');
    if (walletType) {
        walletType.addEventListener('change', function() {
            updateProviderOptions(this.value);
        });
    }

    // Filter Tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.type;
            renderWallets();
        });
    });

    // View Toggle
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.dataset.view;
            renderWallets();
        });
    });

    // Wallet Form Submit
    const walletForm = document.getElementById('wallet-form');
    if (walletForm) {
        walletForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const editId = this.dataset.editId;
            const selectedColor = document.querySelector('input[name="wallet-color"]:checked').value;

            const walletData = {
                type: document.getElementById('wallet-type').value,
                provider: document.getElementById('wallet-provider').value,
                name: document.getElementById('wallet-name').value,
                number: document.getElementById('wallet-number').value,
                balance: parseFloat(document.getElementById('wallet-balance').value),
                color: selectedColor,
                notes: document.getElementById('wallet-notes').value,
                active: document.getElementById('wallet-active').checked,
                lastUpdated: new Date().toISOString()
            };

            if (editId) {
                // Edit existing wallet
                const wallet = wallets.find(w => w.id === parseInt(editId));
                if (wallet) {
                    Object.assign(wallet, walletData);
                }
                delete this.dataset.editId;
            } else {
                // Create new wallet
                const newWallet = {
                    id: wallets.length > 0 ? Math.max(...wallets.map(w => w.id)) + 1 : 1,
                    ...walletData,
                    createdAt: new Date().toISOString()
                };
                wallets.push(newWallet);
            }

            saveToLocalStorage();
            updateSummaryCards();
            renderWallets();
            closeWalletModal();

            alert('Wallet berhasil disimpan!');
        });
    }

    // Transfer Form Submit
    const transferForm = document.getElementById('transfer-form');
    if (transferForm) {
        transferForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const fromId = parseInt(document.getElementById('transfer-from-id').value);
            const toId = parseInt(document.getElementById('transfer-to').value);
            const amount = parseFloat(document.getElementById('transfer-amount').value);

            const fromWallet = wallets.find(w => w.id === fromId);
            const toWallet = wallets.find(w => w.id === toId);

            if (!fromWallet || !toWallet) {
                alert('Wallet tidak ditemukan!');
                return;
            }

            if (fromWallet.balance < amount) {
                alert('Saldo tidak mencukupi!');
                return;
            }

            // Perform transfer
            fromWallet.balance -= amount;
            toWallet.balance += amount;
            fromWallet.lastUpdated = new Date().toISOString();
            toWallet.lastUpdated = new Date().toISOString();

            saveToLocalStorage();
            updateSummaryCards();
            renderWallets();
            closeTransferModal();

            alert('Transfer berhasil!');
        });
    }

    // Budget Form Submit
    const budgetForm = document.getElementById('budget-form');
    if (budgetForm) {
        budgetForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const walletId = parseInt(document.getElementById('budget-wallet-id').value);
            const wallet = wallets.find(w => w.id === walletId);

            if (!wallet) {
                alert('Wallet tidak ditemukan!');
                return;
            }

            const limit = parseFloat(document.getElementById('budget-limit').value);
            const alertThreshold = parseInt(document.getElementById('budget-alert-threshold').value);

            // Get selected categories
            const categories = [];
            document.querySelectorAll('.budget-categories input[type="checkbox"]:checked').forEach(checkbox => {
                categories.push(checkbox.value);
            });

            // Save budget to wallet
            wallet.budget = {
                limit: limit,
                alertThreshold: alertThreshold,
                categories: categories,
                spent: wallet.budget?.spent || 0, // Preserve existing spent amount
                lastUpdated: new Date().toISOString()
            };

            wallet.lastUpdated = new Date().toISOString();

            saveToLocalStorage();
            renderWallets();
            closeBudgetModal();

            alert('Budget berhasil disimpan!');
        });
    }

    // Sync All Button
    const syncAllBtn = document.getElementById('sync-all-btn');
    if (syncAllBtn) {
        syncAllBtn.addEventListener('click', function() {
            this.disabled = true;
            this.style.opacity = '0.6';

            // Simulate sync
            setTimeout(() => {
                wallets.forEach(w => {
                    w.lastUpdated = new Date().toISOString();
                });
                saveToLocalStorage();
                updateSummaryCards();
                renderWallets();

                this.disabled = false;
                this.style.opacity = '1';
                alert('Semua wallet berhasil disinkronkan!');
            }, 1500);
        });
    }
});

// Export functions for use in HTML
window.openWalletModal = openWalletModal;
window.closeWalletModal = closeWalletModal;
window.openTransferModal = openTransferModal;
window.closeTransferModal = closeTransferModal;
window.openBudgetModal = openBudgetModal;
window.closeBudgetModal = closeBudgetModal;
window.editWallet = editWallet;
window.deleteWallet = deleteWallet;
window.toggleWalletStatus = toggleWalletStatus;
