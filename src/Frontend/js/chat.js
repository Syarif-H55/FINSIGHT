// =====================================================
// FINSIGHT - AI Chat Module
// =====================================================

// Chat state
let chatState = {
    messages: [],
    isLoading: false,
    financialContext: null
};

document.addEventListener('DOMContentLoaded', () => {
    // Check Auth - TEMPORARILY DISABLED FOR TESTING
    // const token = localStorage.getItem('finsight_token');
    // const user = JSON.parse(localStorage.getItem('finsight_user'));

    // if (!token || !user) {
    //     window.location.href = 'login.html';
    //     return;
    // }

    // Display User Name in sidebar
    const user = JSON.parse(localStorage.getItem('finsight_user')) || {};
    const userName = document.querySelector('.user-name');
    const userEmail = document.querySelector('.user-email');
    if (userName && user.name) {
        userName.textContent = user.name;
    }
    if (userEmail && user.email) {
        userEmail.textContent = user.email;
    }

    // Initialize chat
    initializeChat();
});

// =====================================================
// Chat Initialization
// =====================================================
function initializeChat() {
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const clearChatBtn = document.getElementById('clearChatBtn');
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');

    // Load chat history from localStorage
    loadChatHistory();

    // Load financial context for AI
    loadFinancialContext();

    // Form submit handler
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (message && !chatState.isLoading) {
            await sendMessage(message);
            chatInput.value = '';
            updateCharCount();
            autoResizeTextarea(chatInput);
        }
    });

    // Textarea auto-resize and char count
    chatInput.addEventListener('input', () => {
        updateCharCount();
        autoResizeTextarea(chatInput);
    });

    // Enter to send, Shift+Enter for new line
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    // Clear chat button
    clearChatBtn.addEventListener('click', () => {
        if (confirm('Hapus semua riwayat chat?')) {
            clearChat();
        }
    });

    // Suggestion buttons
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const message = btn.dataset.message;
            chatInput.value = message;
            updateCharCount();
            chatForm.dispatchEvent(new Event('submit'));
        });
    });
}

// =====================================================
// Message Handling
// =====================================================
async function sendMessage(message) {
    if (chatState.isLoading) return;

    // Add user message to UI
    addMessageToUI('user', message);

    // Save to state
    chatState.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
    });

    // Hide suggestions after first message
    hideSuggestions();

    // Show loading indicator
    showTypingIndicator();
    chatState.isLoading = true;

    try {
        // Send to AI API
        const response = await sendToAI(message);

        // Remove typing indicator
        hideTypingIndicator();

        // Add AI response to UI
        addMessageToUI('ai', response);

        // Save to state
        chatState.messages.push({
            role: 'ai',
            content: response,
            timestamp: new Date().toISOString()
        });

        // Save chat history
        saveChatHistory();

    } catch (error) {
        console.error('Chat error:', error);
        hideTypingIndicator();
        addMessageToUI('ai', 'Maaf, terjadi kesalahan. Silakan coba lagi.', true);
    } finally {
        chatState.isLoading = false;
    }
}

// =====================================================
// AI API Integration
// =====================================================
async function sendToAI(message) {
    // Prepare context with financial data
    const context = prepareContext();

    // API request payload
    const payload = {
        message: message,
        context: context,
        conversation_history: chatState.messages.slice(-10) // Last 10 messages for context
    };

    // Call the AI endpoint
    const response = await APIClient.post('/ai/chat', payload);

    if (response.success && response.data) {
        return response.data.message || response.data.response || response.data;
    } else {
        throw new Error(response.message || 'Failed to get AI response');
    }
}

// =====================================================
// Financial Context
// =====================================================
async function loadFinancialContext() {
    try {
        const [walletsRes, transactionsRes, budgetsRes] = await Promise.all([
            APIClient.get('/wallets'),
            APIClient.get('/transactions'),
            APIClient.get('/budgets')
        ]);

        chatState.financialContext = {
            wallets: walletsRes.success ? walletsRes.data : [],
            transactions: transactionsRes.success ? transactionsRes.data : [],
            budgets: budgetsRes.success ? budgetsRes.data : [],
            loadedAt: new Date().toISOString()
        };

    } catch (error) {
        console.error('Failed to load financial context:', error);
        chatState.financialContext = null;
    }
}

function prepareContext() {
    if (!chatState.financialContext) {
        return null;
    }

    const ctx = chatState.financialContext;
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    // Calculate summary
    const totalBalance = ctx.wallets.reduce((sum, w) => sum + parseFloat(w.balance || 0), 0);

    const thisMonthTrans = ctx.transactions.filter(t => {
        const tDate = new Date(t.transaction_date);
        return tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear;
    });

    const monthlyIncome = thisMonthTrans
        .filter(t => t.transaction_type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const monthlyExpense = thisMonthTrans
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    // Budget status
    const budgetStatus = ctx.budgets.map(budget => {
        const spent = ctx.transactions
            .filter(t => {
                const tDate = new Date(t.transaction_date);
                const start = new Date(budget.start_date);
                const end = new Date(budget.end_date);
                return t.category_name === budget.category_name &&
                       t.transaction_type === 'expense' &&
                       tDate >= start && tDate <= end;
            })
            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

        return {
            category: budget.category_name,
            allocated: parseFloat(budget.allocated_amount),
            spent: spent,
            percentage: Math.round((spent / parseFloat(budget.allocated_amount)) * 100)
        };
    });

    return {
        total_balance: totalBalance,
        monthly_income: monthlyIncome,
        monthly_expense: monthlyExpense,
        monthly_savings: monthlyIncome - monthlyExpense,
        wallet_count: ctx.wallets.length,
        budget_status: budgetStatus,
        transaction_count: thisMonthTrans.length
    };
}

// =====================================================
// UI Functions
// =====================================================
function addMessageToUI(role, content, isError = false) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}${isError ? ' error' : ''}`;

    const time = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });

    if (role === 'user') {
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-bubble">${escapeHtml(content)}</div>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">${formatAIResponse(content)}</div>
                <span class="message-time">${time}</span>
            </div>
        `;
    }

    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message ai typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="message-bubble">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function hideSuggestions() {
    const suggestions = document.getElementById('chatSuggestions');
    if (suggestions) {
        suggestions.style.display = 'none';
    }
}

function showSuggestions() {
    const suggestions = document.getElementById('chatSuggestions');
    if (suggestions) {
        suggestions.style.display = 'flex';
    }
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function updateCharCount() {
    const chatInput = document.getElementById('chatInput');
    const charCount = document.getElementById('charCount');
    charCount.textContent = chatInput.value.length;
}

function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

// =====================================================
// Chat History
// =====================================================
function saveChatHistory() {
    try {
        const history = chatState.messages.slice(-50); // Keep last 50 messages
        localStorage.setItem('finsight_chat_history', JSON.stringify(history));
    } catch (error) {
        console.error('Failed to save chat history:', error);
    }
}

function loadChatHistory() {
    try {
        const saved = localStorage.getItem('finsight_chat_history');
        if (saved) {
            const history = JSON.parse(saved);
            chatState.messages = history;

            // Render saved messages
            const messagesContainer = document.getElementById('chatMessages');

            history.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `chat-message ${msg.role}`;

                const time = new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                if (msg.role === 'user') {
                    messageDiv.innerHTML = `
                        <div class="message-content">
                            <div class="message-bubble">${escapeHtml(msg.content)}</div>
                            <span class="message-time">${time}</span>
                        </div>
                        <div class="message-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                    `;
                } else {
                    messageDiv.innerHTML = `
                        <div class="message-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="message-content">
                            <div class="message-bubble">${formatAIResponse(msg.content)}</div>
                            <span class="message-time">${time}</span>
                        </div>
                    `;
                }

                messagesContainer.appendChild(messageDiv);
            });

            if (history.length > 0) {
                hideSuggestions();
                scrollToBottom();
            }
        }
    } catch (error) {
        console.error('Failed to load chat history:', error);
    }
}

function clearChat() {
    chatState.messages = [];
    localStorage.removeItem('finsight_chat_history');

    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = `
        <div class="chat-message ai">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <p>Halo! Saya adalah AI Financial Advisor Anda. Saya siap membantu Anda dengan:</p>
                    <ul>
                        <li>Analisis keuangan pribadi</li>
                        <li>Saran pengelolaan budget</li>
                        <li>Tips menabung dan investasi</li>
                        <li>Perencanaan keuangan</li>
                    </ul>
                    <p>Silakan tanyakan apa saja tentang keuangan Anda!</p>
                </div>
                <span class="message-time">Just now</span>
            </div>
        </div>
    `;

    showSuggestions();
}

// =====================================================
// Utility Functions
// =====================================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatAIResponse(text) {
    // Convert markdown-like formatting to HTML
    let formatted = escapeHtml(text);

    // Convert **bold** to <strong>
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert *italic* to <em>
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert newlines to <br>
    formatted = formatted.replace(/\n/g, '<br>');

    // Convert bullet points
    formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

    // Convert numbered lists
    formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    return formatted;
}
