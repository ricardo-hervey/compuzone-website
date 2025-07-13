/**
 * COMPUZONE - ADVANCED ADMIN PANEL
 * Comprehensive administration system
 * @version 2.0.0
 */

class AdminPanel {
    constructor() {
        this.state = {
            currentUser: null,
            activeSection: 'dashboard',
            data: {
                products: [],
                components: [],
                orders: [],
                users: [],
                analytics: {},
                settings: {}
            },
            filters: {},
            sortBy: 'id',
            sortOrder: 'asc',
            pagination: {
                page: 1,
                perPage: 10,
                total: 0
            }
        };
        
        this.config = {
            apiBaseUrl: '/api/admin',
            autoSaveInterval: 30000, // 30 seconds
            maxFileSize: 5 * 1024 * 1024, // 5MB
            allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp']
        };
        
        this.eventBus = new EventTarget();
        this.validators = new Map();
        this.cache = new Map();
        
        this.setupValidators();
    }

    /**
     * Initialize admin panel
     */
    init() {
        this.setupEventListeners();
        this.setupAutoSave();
        this.setupKeyboardShortcuts();
        this.loadInitialData();
        
        console.log('🔧 Admin Panel initialized');
    }

    /**
     * Setup form validators
     */
    setupValidators() {
        this.validators.set('product', {
            name: (value) => value && value.length >= 3 ? null : 'Nombre debe tener al menos 3 caracteres',
            price: (value) => value && value > 0 ? null : 'Precio debe ser mayor a 0',
            category: (value) => value ? null : 'Categoría es requerida',
            description: (value) => value && value.length >= 10 ? null : 'Descripción debe tener al menos 10 caracteres'
        });

        this.validators.set('component', {
            name: (value) => value && value.length >= 2 ? null : 'Nombre debe tener al menos 2 caracteres',
            brand: (value) => value ? null : 'Marca es requerida',
            type: (value) => value ? null : 'Tipo es requerido',
            price: (value) => value && value > 0 ? null : 'Precio debe ser mayor a 0',
            stock: (value) => value >= 0 ? null : 'Stock no puede ser negativo'
        });

        this.validators.set('user', {
            username: (value) => value && value.length >= 3 ? null : 'Usuario debe tener al menos 3 caracteres',
            email: (value) => this.isValidEmail(value) ? null : 'Email inválido',
            role: (value) => ['admin', 'manager', 'user'].includes(value) ? null : 'Rol inválido'
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('admin-nav-item')) {
                const section = event.target.dataset.section;
                if (section) {
                    this.showSection(section);
                }
            }
        });

        // Form submissions
        document.addEventListener('submit', (event) => {
            if (event.target.closest('.admin-panel')) {
                event.preventDefault();
                this.handleFormSubmit(event);
            }
        });

        // File uploads
        document.addEventListener('change', (event) => {
            if (event.target.type === 'file' && event.target.closest('.admin-panel')) {
                this.handleFileUpload(event);
            }
        });

        // Search and filters
        document.addEventListener('input', (event) => {
            if (event.target.classList.contains('admin-search')) {
                this.debounce(() => this.handleSearch(event.target.value), 300)();
            }
        });

        // Table sorting
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('sortable')) {
                this.handleSort(event.target.dataset.field);
            }
        });

        // Bulk actions
        document.addEventListener('change', (event) => {
            if (event.target.classList.contains('bulk-checkbox')) {
                this.handleBulkSelection(event);
            }
        });
    }

    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        setInterval(() => {
            this.autoSave();
        }, this.config.autoSaveInterval);

        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl/Cmd + S for save
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                this.saveCurrentForm();
            }

            // Ctrl/Cmd + N for new item
            if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
                event.preventDefault();
                this.showCreateForm();
            }

            // Escape to close modals
            if (event.key === 'Escape') {
                this.closeAllModals();
            }

            // F5 to refresh data
            if (event.key === 'F5') {
                event.preventDefault();
                this.refreshCurrentSection();
            }
        });
    }

    /**
     * Load initial data
     */
    async loadInitialData() {
        try {
            this.showLoadingState();
            
            await Promise.all([
                this.loadDashboardData(),
                this.loadProducts(),
                this.loadComponents(),
                this.loadOrders(),
                this.loadUsers(),
                this.loadAnalytics(),
                this.loadSettings()
            ]);
            
            this.hideLoadingState();
            this.renderCurrentSection();
            
        } catch (error) {
            this.handleError('Failed to load initial data', error);
        }
    }

    /**
     * Dashboard management
     */
    async loadDashboardData() {
        try {
            const response = await this.apiRequest('/dashboard');
            this.state.data.dashboard = response.data || this.getFallbackDashboardData();
        } catch (error) {
            this.state.data.dashboard = this.getFallbackDashboardData();
        }
    }

    getFallbackDashboardData() {
        return {
            stats: {
                totalSales: 1247500,
                totalOrders: 89,
                activeProducts: 24,
                avgOrderValue: 52450,
                salesGrowth: 12.5,
                ordersGrowth: 8.2,
                productsGrowth: 15.3,
                avgOrderGrowth: 5.2
            },
            recentSales: [
                {
                    id: 1001,
                    customer: 'Juan Pérez',
                    product: 'Gaming Pro X1',
                    value: 45000,
                    status: 'completed',
                    date: '2025-01-10'
                },
                {
                    id: 1002,
                    customer: 'María García',
                    product: 'Workstation Elite',
                    value: 65000,
                    status: 'in_progress',
                    date: '2025-01-12'
                },
                {
                    id: 1003,
                    customer: 'Carlos López',
                    product: 'Gaming Ultimate',
                    value: 85000,
                    status: 'pending',
                    date: '2025-01-13'
                }
            ],
            systemActivity: [
                { action: 'Nueva orden: Gaming Pro X1', time: '15 minutos', type: 'order' },
                { action: 'Pago recibido: $45,000', time: '23 minutos', type: 'payment' },
                { action: 'Producto enviado: #1001', time: '35 minutos', type: 'shipping' },
                { action: 'Nuevo usuario registrado', time: '42 minutos', type: 'user' },
                { action: 'Componente actualizado: RTX 4090', time: '1 hora', type: 'inventory' }
            ],
            charts: {
                salesTrend: this.generateSalesData(),
                productCategories: this.generateCategoryData(),
                orderStatus: this.generateOrderStatusData()
            }
        };
    }

    generateSalesData() {
        const data = [];
        const currentDate = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(currentDate);
            date.setDate(date.getDate() - i);
            
            data.push({
                date: date.toISOString().split('T')[0],
                sales: Math.floor(Math.random() * 50000) + 20000,
                orders: Math.floor(Math.random() * 10) + 5
            });
        }
        
        return data;
    }

    generateCategoryData() {
        return [
            { name: 'Gaming', value: 45, color: '#3b82f6' },
            { name: 'Workstation', value: 25, color: '#10b981' },
            { name: 'Oficina', value: 20, color: '#f59e0b' },
            { name: 'Creadores', value: 10, color: '#ef4444' }
        ];
    }

    generateOrderStatusData() {
        return [
            { status: 'Completado', count: 145, color: '#10b981' },
            { status: 'En Proceso', count: 23, color: '#f59e0b' },
            { status: 'Pendiente', count: 12, color: '#ef4444' },
            { status: 'Cancelado', count: 5, color: '#6b7280' }
        ];
    }

    renderDashboard() {
        const container = document.getElementById('adminDashboard');
        if (!container) return;

        const data = this.state.data.dashboard;
        
        container.innerHTML = `
            <div class="admin-header-section">
                <h1 class="admin-title">Dashboard</h1>
                <div class="admin-actions">
                    <button class="btn btn-secondary" onclick="adminPanel.refreshDashboard()">
                        🔄 Actualizar
                    </button>
                    <button class="btn btn-primary" onclick="adminPanel.exportReport()">
                        📊 Exportar Reporte
                    </button>
                </div>
            </div>

            ${this.renderStatsCards(data.stats)}
            
            <div class="dashboard-grid">
                <div class="dashboard-section">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Ventas Recientes</h3>
                            <button class="btn btn-ghost btn-sm" onclick="adminPanel.showSection('orders')">
                                Ver Todas
                            </button>
                        </div>
                        ${this.renderRecentSales(data.recentSales)}
                    </div>
                </div>
                
                <div class="dashboard-section">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Actividad del Sistema</h3>
                        </div>
                        ${this.renderSystemActivity(data.systemActivity)}
                    </div>
                </div>
            </div>

            <div class="charts-grid">
                <div class="chart-container">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Tendencia de Ventas</h3>
                        </div>
                        <canvas id="salesChart" width="400" height="200"></canvas>
                    </div>
                </div>
                
                <div class="chart-container">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Categorías de Productos</h3>
                        </div>
                        <canvas id="categoriesChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>
        `;

        // Render charts
        this.renderCharts(data.charts);
    }

    renderStatsCards(stats) {
        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-content">
                        <div class="stat-value">$${stats.totalSales.toLocaleString()}</div>
                        <div class="stat-label">Ventas del Mes</div>
                        <div class="stat-change positive">+${stats.salesGrowth}% vs mes anterior</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">📦</div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.totalOrders}</div>
                        <div class="stat-label">Órdenes Completadas</div>
                        <div class="stat-change positive">+${stats.ordersGrowth}% esta semana</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">💻</div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.activeProducts}</div>
                        <div class="stat-label">Productos Activos</div>
                        <div class="stat-change positive">+${stats.productsGrowth}% nuevos</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-content">
                        <div class="stat-value">$${stats.avgOrderValue.toLocaleString()}</div>
                        <div class="stat-label">Ticket Promedio</div>
                        <div class="stat-change positive">+${stats.avgOrderGrowth}%</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderRecentSales(sales) {
        if (!sales || sales.length === 0) {
            return '<div class="empty-state">No hay ventas recientes</div>';
        }

        return `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Producto</th>
                            <th>Valor</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sales.map(sale => `
                            <tr onclick="adminPanel.showOrderDetails(${sale.id})">
                                <td>${sale.customer}</td>
                                <td>${sale.product}</td>
                                <td>$${sale.value.toLocaleString()}</td>
                                <td><span class="status-badge status-${sale.status}">${this.getStatusText(sale.status)}</span></td>
                                <td>${this.formatDate(sale.date)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderSystemActivity(activities) {
        if (!activities || activities.length === 0) {
            return '<div class="empty-state">No hay actividad reciente</div>';
        }

        return `
            <div class="activity-list">
                ${activities.map(activity => `
                    <div class="activity-item">
                        <div class="activity-icon activity-${activity.type}">${this.getActivityIcon(activity.type)}</div>
                        <div class="activity-content">
                            <div class="activity-text">${activity.action}</div>
                            <div class="activity-time">Hace ${activity.time}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Products management
     */
    async loadProducts() {
        try {
            const response = await this.apiRequest('/products');
            this.state.data.products = response.data || this.getFallbackProducts();
        } catch (error) {
            this.state.data.products = this.getFallbackProducts();
        }
    }

    getFallbackProducts() {
        return [
            {
                id: 1,
                name: 'CompuZone Gaming Pro X1',
                category: 'gaming