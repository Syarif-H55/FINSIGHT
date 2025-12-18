// Sidebar Component
class Sidebar {
    constructor() {
        this.sidebar = null;
        this.overlay = null;
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1);
        return page || 'dashboard.html';
    }

    getMenuItems() {
        return [
            {
                section: 'Main',
                items: [
                    {
                        name: 'Dashboard',
                        icon: 'fa-home',
                        url: 'dashboard.html',
                        page: 'dashboard.html'
                    },
                    {
                        name: 'Wallets',
                        icon: 'fa-wallet',
                        url: 'wallets.html',
                        page: 'wallets.html'
                    },
                    {
                        name: 'Transactions',
                        icon: 'fa-exchange-alt',
                        url: 'transactions.html',
                        page: 'transactions.html'
                    },
                    {
                        name: 'Budgets',
                        icon: 'fa-chart-pie',
                        url: 'budgets.html',
                        page: 'budgets.html'
                    }
                ]
            },
            {
                section: 'Account',
                items: [
                    {
                        name: 'Settings',
                        icon: 'fa-cog',
                        url: 'settings.html',
                        page: 'settings.html'
                    },
                    {
                        name: 'Logout',
                        icon: 'fa-sign-out-alt',
                        url: '#',
                        action: 'logout'
                    }
                ]
            }
        ];
    }

    init() {
        this.render();
        this.attachEventListeners();
        this.loadUserInfo();
    }

    render() {
        const menuItems = this.getMenuItems();

        const sidebarHTML = `
            <!-- Mobile Menu Button -->
            <button class="mobile-menu-btn" id="mobileMenuBtn">
                <i class="fas fa-bars"></i>
            </button>

            <!-- Sidebar Overlay -->
            <div class="sidebar-overlay" id="sidebarOverlay"></div>

            <!-- Sidebar -->
            <aside class="sidebar" id="sidebar">
                <!-- Sidebar Header -->
                <div class="sidebar-header">
                    <a href="dashboard.html" class="sidebar-brand">
                        <div class="brand-icon">F</div>
                        <span class="brand-text">FINSIGHT</span>
                    </a>
                    <button class="sidebar-toggle" id="sidebarToggle">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                </div>

                <!-- Sidebar Navigation -->
                <nav class="sidebar-nav">
                    ${menuItems.map(section => `
                        <div class="nav-section">
                            <div class="nav-section-title">${section.section}</div>
                            <ul class="nav-menu">
                                ${section.items.map(item => `
                                    <li class="nav-item">
                                        <a href="${item.url}"
                                           class="nav-link ${this.currentPage === item.page ? 'active' : ''}"
                                           ${item.action ? `data-action="${item.action}"` : ''}>
                                            <span class="nav-icon">
                                                <i class="fas ${item.icon}"></i>
                                            </span>
                                            <span class="nav-text">${item.name}</span>
                                        </a>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </nav>

                <!-- Sidebar Footer -->
                <div class="sidebar-footer">
                    <div class="user-profile" id="userProfile">
                        <div class="user-avatar" id="userAvatar">U</div>
                        <div class="user-info">
                            <div class="user-name" id="userName">Loading...</div>
                            <div class="user-email" id="userEmail">user@example.com</div>
                        </div>
                    </div>
                </div>
            </aside>
        `;

        // Insert sidebar at the beginning of body
        document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

        // Wrap existing content in main-content div if not already wrapped
        if (!document.querySelector('.main-content')) {
            const existingContent = Array.from(document.body.children)
                .filter(child => !child.classList.contains('sidebar') &&
                    !child.classList.contains('sidebar-overlay') &&
                    !child.classList.contains('mobile-menu-btn'));

            const mainContent = document.createElement('div');
            mainContent.className = 'main-content';

            existingContent.forEach(child => {
                mainContent.appendChild(child);
            });

            document.body.appendChild(mainContent);
        }

        // Store references
        this.sidebar = document.getElementById('sidebar');
        this.overlay = document.getElementById('sidebarOverlay');
    }

    attachEventListeners() {
        // Toggle sidebar
        const toggleBtn = document.getElementById('sidebarToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleSidebar());
        }

        // Mobile menu button
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.toggleMobileSidebar());
        }

        // Overlay click
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeMobileSidebar());
        }

        // Logout action
        const logoutLinks = document.querySelectorAll('[data-action="logout"]');
        logoutLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        });

        // Close mobile sidebar when clicking nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    this.closeMobileSidebar();
                }
            });
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeMobileSidebar();
            }
        });
    }

    toggleSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.toggle('collapsed');

            // Update toggle icon
            const toggleIcon = document.querySelector('#sidebarToggle i');
            if (toggleIcon) {
                if (this.sidebar.classList.contains('collapsed')) {
                    toggleIcon.className = 'fas fa-chevron-right';
                } else {
                    toggleIcon.className = 'fas fa-chevron-left';
                }
            }

            // Save state to localStorage
            localStorage.setItem('sidebarCollapsed', this.sidebar.classList.contains('collapsed'));
        }
    }

    toggleMobileSidebar() {
        if (this.sidebar && this.overlay) {
            this.sidebar.classList.toggle('mobile-active');
            this.overlay.classList.toggle('active');
        }
    }

    closeMobileSidebar() {
        if (this.sidebar && this.overlay) {
            this.sidebar.classList.remove('mobile-active');
            this.overlay.classList.remove('active');
        }
    }

    loadUserInfo() {
        // Get user info from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        const userNameEl = document.getElementById('userName');
        const userEmailEl = document.getElementById('userEmail');
        const userAvatarEl = document.getElementById('userAvatar');

        if (user.name) {
            if (userNameEl) userNameEl.textContent = user.name;
            if (userEmailEl) userEmailEl.textContent = user.email || '';
            if (userAvatarEl) {
                userAvatarEl.textContent = user.name.charAt(0).toUpperCase();
            }
        } else {
            // Try to get from API if available
            this.fetchUserInfo();
        }

        // Restore sidebar state
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (sidebarCollapsed && this.sidebar) {
            this.sidebar.classList.add('collapsed');
            const toggleIcon = document.querySelector('#sidebarToggle i');
            if (toggleIcon) {
                toggleIcon.className = 'fas fa-chevron-right';
            }
        }
    }

    async fetchUserInfo() {
        try {
            // Check if API is available
            if (typeof API !== 'undefined') {
                const response = await API.get('/auth/profile');
                if (response.success && response.data) {
                    const user = response.data;

                    const userNameEl = document.getElementById('userName');
                    const userEmailEl = document.getElementById('userEmail');
                    const userAvatarEl = document.getElementById('userAvatar');

                    if (userNameEl) userNameEl.textContent = user.name || 'User';
                    if (userEmailEl) userEmailEl.textContent = user.email || '';
                    if (userAvatarEl) {
                        userAvatarEl.textContent = (user.name || 'U').charAt(0).toUpperCase();
                    }

                    // Save to localStorage
                    localStorage.setItem('user', JSON.stringify(user));
                }
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    }

    handleLogout() {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('sidebarCollapsed');

        // Redirect to login
        window.location.href = 'login.html';
    }
}

// Initialize sidebar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Sidebar();
});
