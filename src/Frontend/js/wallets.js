document.addEventListener('DOMContentLoaded', () => {
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
});

async function loadWallets() {
    const container = document.getElementById('walletsContainer');
    const result = await APIClient.get('/wallets');

    if (result.success) {
        if (result.data.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-muted">No wallets found. Create one to get started!</div>';
            return;
        }

        container.innerHTML = result.data.map(wallet => `
            <div class="col-md-4 mb-3">
                <div class="card h-100 border-${getBorderColor(wallet.type)}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <h5 class="card-title">${wallet.wallet_name}</h5>
                            <span class="badge bg-${getBadgeColor(wallet.type)}">${wallet.type.toUpperCase()}</span>
                        </div>
                        <h3 class="card-text mt-3">IDR ${parseFloat(wallet.balance).toLocaleString('id-ID')}</h3>
                        <p class="text-muted small">Created: ${new Date(wallet.created_at).toLocaleDateString()}</p>
                    </div>
                    <div class="card-footer bg-transparent border-top-0 text-end">
                        <button class="btn btn-sm btn-outline-primary" onclick="editWallet(${wallet.wallet_id})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteWallet(${wallet.wallet_id})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        container.innerHTML = '<div class="col-12 text-center text-danger">Failed to load wallets.</div>';
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

// Helper for UI/UX
function getBadgeColor(type) {
    switch (type) {
        case 'cash': return 'success';
        case 'bank': return 'primary';
        case 'ewallet': return 'info';
        default: return 'secondary';
    }
}

function getBorderColor(type) {
    switch (type) {
        case 'cash': return 'success';
        case 'bank': return 'primary';
        case 'ewallet': return 'info';
        default: return 'secondary';
    }
}
