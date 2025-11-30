/**
 * FinSight - Smart Financial Management
 * JavaScript Application
 */

// ============================================
// DOM Elements
// ============================================
const elements = {
    // Navigation
    toggleSidebar: document.getElementById('toggle-sidebar'),
    sidebar: document.getElementById('sidebar'),
    mainContent: document.getElementById('main-content'),
    menuItems: document.querySelectorAll('.menu-item'),
    menuIcon: document.getElementById('menu-icon'),
    
    // Content Sections
    dashboardContent: document.getElementById('dashboard-content'),
    placeholderContent: document.getElementById('placeholder-content'),
    placeholderTitle: document.getElementById('placeholder-title'),
    
    // Chat Widget
    chatWidget: document.getElementById('chat-widget'),
    chatBody: document.getElementById('chat-body'),
    chatMessages: document.getElementById('chat-messages'),
    chatInput: document.getElementById('chat-input'),
    sendMessage: document.getElementById('send-message'),
    openChat: document.getElementById('open-chat'),
    closeChat: document.getElementById('close-chat'),
    minimizeChat: document.getElementById('minimize-chat'),
    typingIndicator: document.getElementById('typing-indicator'),
    quickActionBtns: document.querySelectorAll('.quick-action-btn')
};

// ============================================
// State Management
// ============================================
const state = {
    sidebarOpen: true,
    activeMenu: 'dashboard',
    chatOpen: false,
    chatMinimized: false,
    messages: [
        {
            id: 1,
            type: 'ai',
            content: 'Halo! Saya AI Financial Assistant FinSight. Saya siap membantu Anda dengan analisis keuangan, saran penghematan, dan menjawab pertanyaan tentang keuangan Anda. Ada yang bisa saya bantu?',
            timestamp: new Date()
        }
    ]
};

// ============================================
// Menu Items Data
// ============================================
const menuTitles = {
    'dashboard': 'Dashboard & Overview',
    'transactions': 'Manajemen Transaksi',
    'budget': 'Manajemen Anggaran',
    'goals': 'Financial Goals Tracker',
    'insights': 'Financial Insights Basic',
    'multi-wallet': 'Multi-Wallet Support',
    'recurring': 'Recurring Transactions',
    'visualization': 'Data Visualization Enhanced',
    'export': 'Export',
    'notifications': 'Notification Center',
    'profile': 'User Profile & Preferences'
};

// ============================================
// AI Response Generator
// ============================================
function generateAIResponse(userInput) {
    const input = userInput.toLowerCase();
    
    if (input.includes('budget') || input.includes('anggaran')) {
        return `Berdasarkan analisis spending Anda, saya melihat bahwa kategori "Makanan" sudah mencapai 92.5% dari budget. Saran saya:

1. Kurangi makan di luar 2-3x seminggu (hemat ~Rp 300k/bulan)
2. Coba meal prep untuk weekday
3. Batasi delivery food hanya weekend

Dengan ini Anda bisa hemat Rp 400-500k per bulan. Mau saya buatkan rencana meal prep sederhana?`;
    } 
    
    if (input.includes('hemat') || input.includes('saving')) {
        return `Saya menemukan beberapa peluang penghematan untuk Anda:

💰 Potensial Hemat:
- Langganan Netflix & Spotify yang jarang dipakai: Rp 150k/bulan
- Transport: Gunakan transportasi umum 3x seminggu: Rp 200k/bulan
- Coffee shop: Bawa kopi dari rumah: Rp 150k/bulan

Total potensial: Rp 500k/bulan atau Rp 6 juta/tahun! 🎯

Mau saya bantu tracking implementasinya?`;
    } 
    
    if (input.includes('goal') || input.includes('tujuan')) {
        return `Saya lihat Anda punya 3 goals aktif:

1. 💻 Laptop Baru: 56.7% (Rp 8.5jt/15jt)
   Butuh: Rp 6.5jt lagi | Deadline: 33 hari
   Saran: Nabung Rp 200k/hari atau Rp 1.4jt/minggu

2. 🏦 Dana Darurat: 42% (Rp 4.2jt/10jt)
   Status: On track, teruskan!

3. ✈️ Liburan: 76% (Rp 3.8jt/5jt)
   Hampir tercapai! Tinggal Rp 1.2jt lagi

Mau saya bantu optimalkan strategi menabung?`;
    } 
    
    if (input.includes('laporan') || input.includes('report') || input.includes('bulanan')) {
        return `Laporan Keuangan Bulan Ini:

📊 Overview:
- Total Income: Rp 5.3 juta
- Total Expense: Rp 4.1 juta
- Net Saving: Rp 1.2 juta (22.6%)

📈 Top Spending:
1. Makanan: Rp 1.85 juta (45%)
2. Belanja: Rp 1.2 juta (29%)
3. Transport: Rp 650k (16%)

⚠️ Alert:
- Budget makanan hampir habis (92.5%)
- Spending weekend 30% lebih tinggi

Mau saya kirim laporan lengkap via email/PDF?`;
    } 
    
    if (input.includes('tips') || input.includes('saran')) {
        return `💡 Tips Financial Planning untuk Mahasiswa:

1. Atur Budget 50/30/20:
   - 50% Kebutuhan (makan, transport)
   - 30% Keinginan (hiburan, nongkrong)
   - 20% Tabungan & Investasi

2. Track SEMUA pengeluaran (even Rp 5000)

3. Manfaatkan diskon mahasiswa:
   - Spotify Student: Rp 27k/bulan
   - Adobe Creative Cloud: 60% off
   - Apple Music Student

4. Side hustle: Freelance, jual notes, jadi tutor

5. Hindari utang konsumtif!

Mau diskusi lebih detail tentang salah satu poin ini?`;
    } 
    
    if (input.includes('transaksi') || input.includes('transaction')) {
        return `Transaksi Terakhir Anda:

📅 Hari ini:
- Warteg Bahari: -Rp 25.000
- Grab to Campus: -Rp 35.000

📅 Kemarin:
- Gaji Freelance: +Rp 1.500.000 ✨
- Netflix Subscription: -Rp 54.000

Total spending 2 hari terakhir: Rp 114.000
Rata-rata/hari: Rp 57.000

Mau saya kategorikan transaksi yang belum dikategorikan?`;
    }
    
    // Default response
    return `Saya bisa membantu Anda dengan:

💰 Analisis Budget & Spending
📊 Financial Health Check
🎯 Tracking Goals
💡 Saran Penghematan
📈 Laporan Keuangan
⚠️ Alert & Reminder

Coba tanya saya tentang "budget", "goal", "hemat", atau "laporan"!

Atau ceritakan masalah keuangan Anda, saya akan berikan saran yang personalized.`;
}

// ============================================
// Chat Functions
// ============================================
function formatTime(date) {
    return date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.type}`;
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-bubble">${message.content}</div>
            <div class="message-time">${formatTime(message.timestamp)}</div>
        </div>
    `;
    
    return messageDiv;
}

function renderMessages() {
    elements.chatMessages.innerHTML = '';
    state.messages.forEach(message => {
        const messageEl = createMessageElement(message);
        elements.chatMessages.appendChild(messageEl);
    });
    scrollToBottom();
}

function scrollToBottom() {
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function showTypingIndicator() {
    elements.typingIndicator.classList.remove('hidden');
    scrollToBottom();
}

function hideTypingIndicator() {
    elements.typingIndicator.classList.add('hidden');
}

function addMessage(type, content) {
    const message = {
        id: state.messages.length + 1,
        type: type,
        content: content,
        timestamp: new Date()
    };
    state.messages.push(message);
    
    const messageEl = createMessageElement(message);
    elements.chatMessages.appendChild(messageEl);
    scrollToBottom();
    
    return message;
}

async function handleSendMessage() {
    const input = elements.chatInput.value.trim();
    if (!input) return;
    
    // Add user message
    addMessage('user', input);
    elements.chatInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate AI response delay
    setTimeout(() => {
        hideTypingIndicator();
        const response = generateAIResponse(input);
        addMessage('ai', response);
    }, 1500);
}

function openChat() {
    state.chatOpen = true;
    elements.chatWidget.classList.remove('hidden');
    elements.openChat.classList.add('hidden');
    elements.chatInput.focus();
}

function closeChat() {
    state.chatOpen = false;
    elements.chatWidget.classList.add('hidden');
    elements.openChat.classList.remove('hidden');
}

function toggleMinimizeChat() {
    state.chatMinimized = !state.chatMinimized;
    if (state.chatMinimized) {
        elements.chatWidget.classList.add('minimized');
    } else {
        elements.chatWidget.classList.remove('minimized');
    }
    
    // Update minimize icon
    const minimizeIcon = elements.minimizeChat.querySelector('svg');
    if (minimizeIcon) {
        lucide.createIcons({
            icons: {
                'minimize-2': state.chatMinimized ? lucide.icons['maximize-2'] : lucide.icons['minimize-2']
            }
        });
    }
}

// ============================================
// Sidebar Functions
// ============================================
function toggleSidebar() {
    state.sidebarOpen = !state.sidebarOpen;
    
    if (state.sidebarOpen) {
        elements.sidebar.classList.remove('collapsed');
        elements.sidebar.classList.add('open');
        elements.mainContent.classList.remove('expanded');
    } else {
        elements.sidebar.classList.add('collapsed');
        elements.sidebar.classList.remove('open');
        elements.mainContent.classList.add('expanded');
    }
}

function setActiveMenu(menuId) {
    state.activeMenu = menuId;
    
    // Update menu item styles
    elements.menuItems.forEach(item => {
        if (item.dataset.menu === menuId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Show/hide content sections
    if (menuId === 'dashboard') {
        elements.dashboardContent.classList.add('active');
        elements.placeholderContent.classList.remove('active');
    } else {
        elements.dashboardContent.classList.remove('active');
        elements.placeholderContent.classList.add('active');
        elements.placeholderTitle.textContent = menuTitles[menuId] || menuId;
    }
    
    // Re-initialize Lucide icons
    lucide.createIcons();
}

// ============================================
// Event Listeners
// ============================================
function initEventListeners() {
    // Sidebar toggle
    elements.toggleSidebar.addEventListener('click', toggleSidebar);
    
    // Menu items
    elements.menuItems.forEach(item => {
        item.addEventListener('click', () => {
            setActiveMenu(item.dataset.menu);
        });
    });
    
    // Chat widget
    elements.openChat.addEventListener('click', openChat);
    elements.closeChat.addEventListener('click', closeChat);
    elements.minimizeChat.addEventListener('click', toggleMinimizeChat);
    
    // Send message
    elements.sendMessage.addEventListener('click', handleSendMessage);
    elements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
    
    // Quick actions
    elements.quickActionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.chatInput.value = btn.dataset.text;
            elements.chatInput.focus();
        });
    });
    
    // Update send button state
    elements.chatInput.addEventListener('input', () => {
        elements.sendMessage.disabled = !elements.chatInput.value.trim();
    });
    
    // Handle window resize for responsive sidebar
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 1024) {
            elements.sidebar.classList.add('collapsed');
            elements.mainContent.classList.add('expanded');
            state.sidebarOpen = false;
        }
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024 && 
            state.sidebarOpen && 
            !elements.sidebar.contains(e.target) && 
            !elements.toggleSidebar.contains(e.target)) {
            toggleSidebar();
        }
    });
}

// ============================================
// Initialization
// ============================================
function init() {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Initialize event listeners
    initEventListeners();
    
    // Render initial chat messages
    renderMessages();
    
    // Set initial send button state
    elements.sendMessage.disabled = true;
    
    // Check initial viewport
    if (window.innerWidth <= 1024) {
        elements.sidebar.classList.add('collapsed');
        elements.mainContent.classList.add('expanded');
        state.sidebarOpen = false;
    }
    
    console.log('FinSight initialized successfully!');
}

// Run initialization when DOM is ready
document.addEventListener('DOMContentLoaded', init);
