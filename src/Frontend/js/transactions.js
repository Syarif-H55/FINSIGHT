const modals = {
    transaction: document.getElementById('transaction-modal'),
    bulkUpload: document.getElementById('bulk-upload-modal'),
    history: document.getElementById('history-modal')
};

const buttons = {
    addTransaction: document.getElementById('add-transaction-btn'),
    bulkUpload: document.getElementById('bulk-upload-btn'),
    history: document.getElementById('history-btn')
};

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

buttons.addTransaction.addEventListener('click', () => openModal('transaction-modal'));
buttons.bulkUpload.addEventListener('click', () => openModal('bulk-upload-modal'));
buttons.history.addEventListener('click', () => openModal('history-modal'));

document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modalId = btn.dataset.modal || btn.closest('.modal').id;
        closeModal(modalId);
    });
});

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', () => {
        overlay.closest('.modal').classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

const cancelBtn = document.getElementById('cancel-btn');
const cancelUploadBtn = document.getElementById('cancel-upload-btn');

if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal('transaction-modal'));
if (cancelUploadBtn) cancelUploadBtn.addEventListener('click', () => closeModal('bulk-upload-modal'));

const typeButtons = document.querySelectorAll('.type-btn');
let selectedType = 'expense';

typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        typeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedType = btn.dataset.type;
    });
});

const transactionForm = document.getElementById('transaction-form');
if (transactionForm) {
    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = {
            type: selectedType,
            amount: document.getElementById('amount').value,
            description: document.getElementById('description').value,
            category: document.getElementById('category').value,
            date: document.getElementById('date').value,
            notes: document.getElementById('notes').value
        };

        console.log('Transaction Data:', formData);
        closeModal('transaction-modal');
        transactionForm.reset();

        showNotification('Transaksi berhasil ditambahkan!', 'success');
    });
}

const sourceCards = document.querySelectorAll('.source-card');
const uploadArea = document.getElementById('upload-area');
const csvFileInput = document.getElementById('csv-file-input');
const fileInfo = document.getElementById('file-info');
const fileName = document.getElementById('file-name');
const fileSize = document.getElementById('file-size');
const removeFileBtn = document.getElementById('remove-file');
const csvPreview = document.getElementById('csv-preview');
const processBtn = document.getElementById('process-csv-btn');
const downloadTemplateBtn = document.getElementById('download-template');

let selectedSource = null;
let uploadedFile = null;

sourceCards.forEach(card => {
    card.addEventListener('click', () => {
        sourceCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedSource = card.dataset.source;
    });
});

if (uploadArea) {
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });

    uploadArea.addEventListener('click', () => {
        csvFileInput.click();
    });
}

if (csvFileInput) {
    csvFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
}

function handleFileUpload(file) {
    if (!file.name.endsWith('.csv')) {
        showNotification('Hanya file CSV yang diperbolehkan', 'error');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showNotification('Ukuran file maksimal 5MB', 'error');
        return;
    }

    uploadedFile = file;
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);

    uploadArea.style.display = 'none';
    fileInfo.style.display = 'flex';
    processBtn.disabled = false;

    parseCSV(file);
}

if (removeFileBtn) {
    removeFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        uploadedFile = null;
        uploadArea.style.display = 'block';
        fileInfo.style.display = 'none';
        csvPreview.style.display = 'none';
        processBtn.disabled = true;
        csvFileInput.value = '';
    });
}

function parseCSV(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
            showNotification('File CSV kosong atau tidak valid', 'error');
            return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1, 6).map(line => line.split(',').map(cell => cell.trim()));

        const previewTable = document.getElementById('preview-table');
        let tableHTML = '<thead><tr>';
        headers.forEach(header => {
            tableHTML += `<th>${header}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';

        rows.forEach(row => {
            tableHTML += '<tr>';
            row.forEach(cell => {
                tableHTML += `<td>${cell}</td>`;
            });
            tableHTML += '</tr>';
        });
        tableHTML += '</tbody>';

        previewTable.innerHTML = tableHTML;

        const totalRows = lines.length - 1;
        document.getElementById('total-rows').textContent = totalRows;
        document.getElementById('preview-income').textContent = Math.floor(totalRows * 0.3);
        document.getElementById('preview-expense').textContent = Math.floor(totalRows * 0.7);

        csvPreview.style.display = 'block';
    };

    reader.readAsText(file);
}

if (processBtn) {
    processBtn.addEventListener('click', () => {
        if (!uploadedFile) return;

        showNotification('Memproses data CSV...', 'info');

        setTimeout(() => {
            const totalRows = document.getElementById('total-rows').textContent;
            showNotification(`Berhasil mengimport ${totalRows} transaksi!`, 'success');
            closeModal('bulk-upload-modal');

            uploadedFile = null;
            uploadArea.style.display = 'block';
            fileInfo.style.display = 'none';
            csvPreview.style.display = 'none';
            processBtn.disabled = true;
            csvFileInput.value = '';
            sourceCards.forEach(c => c.classList.remove('active'));
        }, 2000);
    });
}

if (downloadTemplateBtn) {
    downloadTemplateBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const csvContent = 'Tanggal,Deskripsi,Kategori,Tipe,Jumlah,Catatan\n' +
                          '2024-12-15,Gaji Bulanan,Gaji,Pemasukan,8500000,Transfer dari PT Maju Jaya\n' +
                          '2024-12-14,Belanja Bulanan,Belanja,Pengeluaran,1250000,Supermarket ABC\n' +
                          '2024-12-13,Tagihan Listrik,Tagihan,Pengeluaran,450000,PLN - Des 2024';

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template_transaksi.csv';
        a.click();
        window.URL.revokeObjectURL(url);

        showNotification('Template CSV berhasil diunduh', 'success');
    });
}

const resetFiltersBtn = document.getElementById('reset-filters');
const applyFiltersBtn = document.getElementById('apply-filters');

if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
        document.getElementById('history-date-from').value = '';
        document.getElementById('history-date-to').value = '';
        document.getElementById('history-category').value = '';
        document.getElementById('history-type').value = '';
        document.getElementById('history-amount').value = '';

        showNotification('Filter direset', 'info');
    });
}

if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', () => {
        const filters = {
            dateFrom: document.getElementById('history-date-from').value,
            dateTo: document.getElementById('history-date-to').value,
            category: document.getElementById('history-category').value,
            type: document.getElementById('history-type').value,
            amount: document.getElementById('history-amount').value
        };

        console.log('Applying filters:', filters);
        showNotification('Filter diterapkan', 'success');
    });
}

document.querySelectorAll('.export-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const format = btn.textContent.includes('CSV') ? 'CSV' :
                      btn.textContent.includes('PDF') ? 'PDF' : 'Excel';
        showNotification(`Mengexport data ke ${format}...`, 'info');

        setTimeout(() => {
            showNotification(`Data berhasil diexport ke ${format}`, 'success');
        }, 1500);
    });
});

const selectAllCheckbox = document.getElementById('select-all');
const rowCheckboxes = document.querySelectorAll('.row-checkbox');

if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', (e) => {
        rowCheckboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
    });
}

const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('.transaction-row');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

const categoryFilter = document.getElementById('category-filter');
const typeFilter = document.getElementById('type-filter');
const dateFilter = document.getElementById('date-filter');

const applyTableFilters = () => {
    const category = categoryFilter?.value || '';
    const type = typeFilter?.value || '';
    const date = dateFilter?.value || '';
    const rows = document.querySelectorAll('.transaction-row');

    rows.forEach(row => {
        let show = true;

        if (category) {
            const categoryBadge = row.querySelector('.category-badge');
            if (categoryBadge && !categoryBadge.classList.contains(category)) {
                show = false;
            }
        }

        if (type) {
            const typeBadge = row.querySelector('.type-badge');
            if (typeBadge && !typeBadge.classList.contains(type)) {
                show = false;
            }
        }

        row.style.display = show ? '' : 'none';
    });
};

if (categoryFilter) categoryFilter.addEventListener('change', applyTableFilters);
if (typeFilter) typeFilter.addEventListener('change', applyTableFilters);
if (dateFilter) dateFilter.addEventListener('change', applyTableFilters);

const deleteButtons = document.querySelectorAll('.btn-icon[title="Hapus"]');
deleteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
            const row = e.target.closest('.transaction-row');
            row.remove();
            showNotification('Transaksi berhasil dihapus', 'success');
        }
    });
});

const editButtons = document.querySelectorAll('.btn-icon[title="Edit"]');
editButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        openModal('transaction-modal');
        document.querySelector('.modal-header h3').textContent = 'Edit Transaksi';
    });
});

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function showNotification(message, type = 'info') {
    const icons = {
        success: '✓',
        error: '✗',
        info: 'ℹ'
    };

    console.log(`${icons[type]} ${message}`);

    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

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

const dateInput = document.getElementById('date');
if (dateInput) {
    dateInput.valueAsDate = new Date();
}

const amountInput = document.getElementById('amount');
if (amountInput) {
    amountInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^\d]/g, '');
        e.target.value = value;
    });
}

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        buttons.addTransaction.click();
    }

    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }
});

const menuToggle = document.getElementById('menu-toggle');
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
}

console.log('FinSight Transaction Management - Ready!');
