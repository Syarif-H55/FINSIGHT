document.addEventListener('DOMContentLoaded', () => {
    // Check Auth
    const token = localStorage.getItem('finsight_token');
    const user = JSON.parse(localStorage.getItem('finsight_user'));

    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }

    // Display User Name in sidebar
    const userName = document.querySelector('.user-name');
    const userEmail = document.querySelector('.user-email');
    if (userName && user.name) {
        userName.textContent = user.name;
    }
    if (userEmail && user.email) {
        userEmail.textContent = user.email;
    }

    loadWallets();

    // Add Wallet Form Handler
    const addWalletForm = document.getElementById('addWalletForm');
    if (addWalletForm) {
        addWalletForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const walletName = document.getElementById('walletName').value;
            const walletType = document.getElementById('walletType').value;
            const initialBalance = parseFloat(document.getElementById('initialBalance').value);

            // Close modal
            const modalEl = document.getElementById('addWalletModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();

            const result = await APIClient.post('/wallets', {
                wallet_name: walletName,
                type: walletType,
                balance: initialBalance
            });

            if (result.success) {
                addWalletForm.reset();
                loadWallets();
            } else {
                alert('Failed to create wallet: ' + result.message);
            }
        });
    }

    // Edit Wallet Form Handler
    const editWalletForm = document.getElementById('editWalletForm');
    if (editWalletForm) {
        editWalletForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const walletId = document.getElementById('editWalletId').value;
            const walletName = document.getElementById('editWalletName').value;
            const walletType = document.getElementById('editWalletType').value;
            const balance = parseFloat(document.getElementById('editBalance').value);

            // Close modal
            const modalEl = document.getElementById('editWalletModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();

            const result = await APIClient.put(`/wallets/${walletId}`, {
                wallet_name: walletName,
                type: walletType,
                balance: balance
            });

            if (result.success) {
                editWalletForm.reset();
                loadWallets();
            } else {
                alert('Failed to update wallet: ' + result.message);
            }
        });
    }
    // --- TRANSFER LOGIC ---
    const transferModal = document.getElementById('transferModal');
    const transferForm = document.getElementById('transferForm');
    const transferFrom = document.getElementById('transferFrom');
    const transferTo = document.getElementById('transferTo');

    if (transferModal) {
        transferModal.addEventListener('show.bs.modal', () => {
            transferFrom.innerHTML = '<option value="">Select Source Wallet</option>';
            transferTo.innerHTML = '<option value="">Select Destination Wallet</option>';
            fetchWalletsForTransfer();
        });
    }

    if (transferForm) {
        // Handle Transfer Submit
        transferForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                from_wallet_id: transferFrom.value,
                to_wallet_id: transferTo.value,
                amount: document.getElementById('transferAmount').value,
                notes: document.getElementById('transferNotes').value
            };

            if (data.from_wallet_id === data.to_wallet_id) {
                alert('Source and destination wallets must be different.');
                return;
            }

            const btn = transferForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = 'Processing...';

            try {
                const result = await APIClient.post('/transfers', data);
                if (result.success) {
                    // Close Modal
                    const modal = bootstrap.Modal.getInstance(transferModal);
                    modal.hide();
                    transferForm.reset();
                    // Refresh Wallet List
                    loadWallets();
                    alert('Transfer successful!');
                } else {
                    alert(result.message || 'Transfer failed.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred.');
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        });
    }

    async function fetchWalletsForTransfer() {
        console.log('fetchWalletsForTransfer called');
        try {
            const result = await APIClient.get('/wallets');
            console.log('API Response:', result);

            if (result.success) {
                const wallets = result.data;
                console.log('Wallets data:', wallets);

                if (!wallets || wallets.length === 0) {
                    console.warn('No wallets found');
                    transferFrom.innerHTML = '<option value="">No wallets available</option>';
                    transferTo.innerHTML = '<option value="">No wallets available</option>';
                    return;
                }

                wallets.forEach(wallet => {
                    console.log('Adding wallet:', wallet.wallet_name);
                    const optionFrom = document.createElement('option');
                    optionFrom.value = wallet.wallet_id;
                    optionFrom.textContent = `${wallet.wallet_name} (IDR ${parseInt(wallet.balance).toLocaleString()})`;
                    transferFrom.appendChild(optionFrom);

                    const optionTo = document.createElement('option');
                    optionTo.value = wallet.wallet_id;
                    optionTo.textContent = wallet.wallet_name;
                    transferTo.appendChild(optionTo);
                });
                console.log('Dropdowns populated successfully');
            } else {
                console.error('API returned success=false:', result.message);
                alert('Failed to load wallets: ' + result.message);
            }
        } catch (error) {
            console.error('Error fetching wallets for transfer:', error);
            alert('Error loading wallets. Check console for details.');
        }
    }
});

async function loadWallets() {
    const container = document.getElementById('walletsContainer');
    const result = await APIClient.get('/wallets');

    if (result.success) {
        if (result.data.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="fas fa-wallet"></i>
                        <p>No wallets found. Create one to get started!</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = result.data.map(wallet => `
            <div class="col-lg-4 col-md-6">
                <div class="glass-card wallet-card">
                    <div class="wallet-header">
                        <div class="wallet-icon ${getWalletIconClass(wallet.type)}">
                            <i class="fas ${getWalletIcon(wallet.type)}"></i>
                        </div>
                        <span class="wallet-type-badge">${wallet.type.toUpperCase()}</span>
                    </div>
                    <div class="wallet-body">
                        <h4 class="wallet-name">${wallet.wallet_name}</h4>
                        <p class="wallet-balance">IDR ${parseFloat(wallet.balance).toLocaleString('id-ID')}</p>
                        <span class="wallet-date">
                            <i class="fas fa-calendar-alt me-1"></i>
                            Created: ${new Date(wallet.created_at).toLocaleDateString('id-ID')}
                        </span>
                    </div>
                    <div class="wallet-actions">
                        <button class="action-btn edit" onclick="editWallet(${wallet.wallet_id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete" onclick="deleteWallet(${wallet.wallet_id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load wallets.</p>
                </div>
            </div>
        `;
    }
}

async function editWallet(id) {
    const result = await APIClient.get('/wallets');
    if (result.success) {
        const wallet = result.data.find(w => w.wallet_id == id);
        if (wallet) {
            document.getElementById('editWalletId').value = wallet.wallet_id;
            document.getElementById('editWalletName').value = wallet.wallet_name;
            document.getElementById('editWalletType').value = wallet.type;
            document.getElementById('editBalance').value = wallet.balance;

            const modal = new bootstrap.Modal(document.getElementById('editWalletModal'));
            modal.show();
        }
    }
}

async function deleteWallet(id) {
    if (confirm('Are you sure you want to delete this wallet? All associated transactions will also be deleted.')) {
        const result = await APIClient.delete(`/wallets/${id}`);
        if (result.success) {
            loadWallets();
        } else {
            alert('Failed to delete wallet.');
        }
    }
}

// Helper functions for wallet icons
function getWalletIcon(type) {
    switch (type) {
        case 'bank': return 'fa-university';
        case 'ewallet': return 'fa-mobile-alt';
        case 'cash': return 'fa-money-bill-wave';
        default: return 'fa-wallet';
    }
}

function getWalletIconClass(type) {
    switch (type) {
        case 'bank': return 'icon-blue';
        case 'ewallet': return 'icon-cyan';
        case 'cash': return 'icon-green';
        default: return 'icon-blue';
    }
}
