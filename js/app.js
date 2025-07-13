/**
 * COMPUZONE - MAIN APPLICATION JAVASCRIPT
 * Advanced web application with 3D, AI, and real-time features
 * @version 2.0.0
 * @author CompuZone Team
 */

class CompuZoneApp {
    constructor() {
        this.state = {
            currentTheme: 'light',
            selectedComponents: {},
            totalPrice: 0,
            user: null,
            cart: [],
            isLoading: false,
            errors: []
        };
        
        this.config = {
            apiBaseUrl: '/api',
            animationDuration: 300,
            debounceDelay: 300,
            maxRetries: 3
        };
        
        this.eventBus = new EventTarget();
        this.cache = new Map();
        this.observers = new Map();
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            this.showLoadingScreen();
            
            // Initialize core systems
            await this.initializeCore();
            await this.loadInitialData();
            await this.setupEventListeners();
            await this.initializeModules();
            
            // Setup performance monitoring
            this.initializePerformanceMonitoring();
            
            // Hide loading screen
            setTimeout(() => this.hideLoadingScreen(), 2000);
            
            console.log('🚀 CompuZone initialized successfully');
        } catch (error) {
            this.handleError('Failed to initialize application', error);
        }
    }

    /**
     * Initialize core systems
     */
    async initializeCore() {
        // Setup theme system
        this.initializeTheme();
        
        // Setup local storage
        this.initializeStorage();
        
        // Setup service worker
        await this.registerServiceWorker();
        
        // Setup error handling
        this.setupGlobalErrorHandling();
    }

    /**
     * Load initial application data
     */
    async loadInitialData() {
        try {
            const [components, products, settings] = await Promise.all([
                this.loadComponents(),
                this.loadProducts(),
                this.loadSettings()
            ]);
            
            this.state.components = components;
            this.state.products = products;
            this.state.settings = settings;
            
            // Update UI with initial data
            this.renderComponentGrid('cpu');
            this.updateStats();
            
        } catch (error) {
            this.handleError('Failed to load initial data', error);
        }
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Component selection
        this.eventBus.addEventListener('componentSelected', (event) => {
            this.handleComponentSelection(event.detail);
        });

        // Admin login
        document.getElementById('loginForm')?.addEventListener('submit', (event) => {
            this.handleAdminLogin(event);
        });

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((event) => {
                this.handleSearch(event.target.value);
            }, this.config.debounceDelay));
        }

        // Scroll events
        window.addEventListener('scroll', this.throttle(() => {
            this.handleScroll();
        }, 16)); // 60fps

        // Resize events
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });

        // Visibility change
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }

    /**
     * Initialize application modules
     */
    async initializeModules() {
        // Initialize 3D scene
        if (window.PCScene3D) {
            this.scene3D = new PCScene3D();
            await this.scene3D.init();
        }

        // Initialize AI assistant
        if (window.AIAssistant) {
            this.aiAssistant = new AIAssistant();
            await this.aiAssistant.init();
        }

        // Initialize admin panel
        if (window.AdminPanel) {
            this.adminPanel = new AdminPanel();
            this.adminPanel.init();
        }

        // Initialize analytics
        this.initializeAnalytics();
    }

    /**
     * Theme management
     */
    initializeTheme() {
        const savedTheme = localStorage.getItem('compuzone-theme') || 'light';
        this.setTheme(savedTheme);
    }

    toggleTheme() {
        const newTheme = this.state.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        this.state.currentTheme = theme;
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('compuzone-theme', theme);
        
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.classList.toggle('dark', theme === 'dark');
        }
        
        // Update CSS custom properties
        this.updateThemeProperties(theme);
        
        // Emit theme change event
        this.eventBus.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme }
        }));
    }

    updateThemeProperties(theme) {
        const root = document.documentElement;
        
        if (theme === 'dark') {
            root.style.setProperty('--bg-primary', 'var(--gray-900)');
            root.style.setProperty('--bg-secondary', 'var(--gray-800)');
            root.style.setProperty('--text-primary', 'var(--gray-100)');
            root.style.setProperty('--text-secondary', 'var(--gray-300)');
        } else {
            root.style.setProperty('--bg-primary', 'var(--gray-50)');
            root.style.setProperty('--bg-secondary', 'white');
            root.style.setProperty('--text-primary', 'var(--gray-900)');
            root.style.setProperty('--text-secondary', 'var(--gray-600)');
        }
    }

    /**
     * Component management
     */
    async loadComponents() {
        const cacheKey = 'components';
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const response = await this.apiRequest('/components');
            const components = response.data || this.getFallbackComponents();
            
            // Cache the result
            this.cache.set(cacheKey, components);
            
            return components;
        } catch (error) {
            console.warn('Failed to load components from API, using fallback data');
            return this.getFallbackComponents();
        }
    }

    getFallbackComponents() {
        return {
            cpu: [
                {
                    id: 'cpu1',
                    name: 'Intel Core i9-14900K',
                    brand: 'Intel',
                    price: 12500,
                    specs: '24 cores, 32 threads, 3.2GHz base, 6.0GHz boost',
                    image: '🧠',
                    compatibility: ['LGA1700'],
                    performance: 95,
                    powerConsumption: 125,
                    features: ['Hyperthreading', 'Overclocking', 'Integrated Graphics']
                },
                {
                    id: 'cpu2',
                    name: 'AMD Ryzen 9 7950X',
                    brand: 'AMD',
                    price: 11800,
                    specs: '16 cores, 32 threads, 4.5GHz base, 5.7GHz boost',
                    image: '🧠',
                    compatibility: ['AM5'],
                    performance: 93,
                    powerConsumption: 170,
                    features: ['Precision Boost', 'PCIe 5.0', 'DDR5 Support']
                },
                {
                    id: 'cpu3',
                    name: 'Intel Core i7-13700K',
                    brand: 'Intel',
                    price: 8500,
                    specs: '16 cores, 24 threads, 3.4GHz base, 5.4GHz boost',
                    image: '🧠',
                    compatibility: ['LGA1700'],
                    performance: 88,
                    powerConsumption: 125,
                    features: ['Hyperthreading', 'Overclocking', 'Intel UHD Graphics']
                }
            ],
            gpu: [
                {
                    id: 'gpu1',
                    name: 'GeForce RTX 4090',
                    brand: 'NVIDIA',
                    price: 35000,
                    specs: '24GB GDDR6X, 2520 MHz boost, 16384 CUDA cores',
                    image: '🎮',
                    compatibility: ['PCIe 4.0'],
                    performance: 100,
                    powerConsumption: 450,
                    features: ['Ray Tracing', 'DLSS 3.0', 'AV1 Encoding']
                },
                {
                    id: 'gpu2',
                    name: 'GeForce RTX 4080 Super',
                    brand: 'NVIDIA',
                    price: 28000,
                    specs: '16GB GDDR6X, 2550 MHz boost, 10240 CUDA cores',
                    image: '🎮',
                    compatibility: ['PCIe 4.0'],
                    performance: 85,
                    powerConsumption: 320,
                    features: ['Ray Tracing', 'DLSS 3.0', 'AV1 Encoding']
                },
                {
                    id: 'gpu3',
                    name: 'GeForce RTX 4070 Super',
                    brand: 'NVIDIA',
                    price: 18000,
                    specs: '12GB GDDR6X, 2475 MHz boost, 7168 CUDA cores',
                    image: '🎮',
                    compatibility: ['PCIe 4.0'],
                    performance: 75,
                    powerConsumption: 220,
                    features: ['Ray Tracing', 'DLSS 3.0', 'AV1 Encoding']
                }
            ],
            ram: [
                {
                    id: 'ram1',
                    name: 'Corsair Dominator Platinum RGB',
                    brand: 'Corsair',
                    price: 8500,
                    specs: '64GB DDR5-6000, 4x16GB, RGB lighting, low latency',
                    image: '💾',
                    compatibility: ['DDR5'],
                    performance: 95,
                    powerConsumption: 15,
                    features: ['RGB Lighting', 'Low Latency', 'Premium Heatsink']
                },
                {
                    id: 'ram2',
                    name: 'G.Skill Trident Z5 RGB',
                    brand: 'G.Skill',
                    price: 4500,
                    specs: '32GB DDR5-5600, 2x16GB, RGB lighting',
                    image: '💾',
                    compatibility: ['DDR5'],
                    performance: 85,
                    powerConsumption: 10,
                    features: ['RGB Lighting', 'Intel XMP 3.0', 'AMD EXPO']
                },
                {
                    id: 'ram3',
                    name: 'Kingston Fury Beast RGB',
                    brand: 'Kingston',
                    price: 2800,
                    specs: '16GB DDR5-5200, 2x8GB, RGB lighting',
                    image: '💾',
                    compatibility: ['DDR5'],
                    performance: 75,
                    powerConsumption: 8,
                    features: ['RGB Lighting', 'Plug N Play', 'JEDEC Compliant']
                }
            ]
        };
    }

    renderComponentGrid(category) {
        const grid = document.getElementById('componentGrid');
        if (!grid) return;

        const components = this.state.components?.[category] || [];
        
        // Add loading state
        grid.innerHTML = '<div class="loading-skeleton" style="height: 200px; border-radius: 16px;"></div>';
        
        setTimeout(() => {
            grid.innerHTML = '';
            
            components.forEach(component => {
                const card = this.createComponentCard(component, category);
                grid.appendChild(card);
            });
            
            // Add scroll animation
            this.animateComponentCards();
        }, 300);
    }

    createComponentCard(component, category) {
        const card = document.createElement('div');
        card.className = 'component-card component-card-advanced component-enter';
        
        const isSelected = this.state.selectedComponents[category]?.id === component.id;
        
        if (isSelected) {
            card.style.borderColor = 'var(--primary-500)';
            card.style.background = 'var(--primary-50)';
        }
        
        card.innerHTML = `
            <div class="component-image">${component.image}</div>
            <div class="component-name">${component.name}</div>
            <div class="component-brand">${component.brand}</div>
            <div class="component-specs">${component.specs}</div>
            <div class="component-price">$${component.price.toLocaleString()} MXN</div>
            <div class="component-features">
                ${component.features?.slice(0, 3).map(feature => 
                    `<span class="feature-tag">${feature}</span>`
                ).join('') || ''}
            </div>
            <div class="component-performance">
                <div class="performance-bar">
                    <div class="performance-fill" style="width: ${component.performance || 0}%"></div>
                </div>
                <small>Rendimiento: ${component.performance || 0}%</small>
            </div>
            <button class="btn btn-premium" style="width: 100%; margin-top: 16px;">
                ${isSelected ? '✓ Seleccionado' : 'Seleccionar'}
            </button>
        `;
        
        // Add click handler
        const button = card.querySelector('button');
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectComponent(category, component);
        });
        
        return card;
    }

    selectComponent(category, component) {
        // Update state
        const previousComponent = this.state.selectedComponents[category];
        this.state.selectedComponents[category] = component;
        
        // Update price
        if (previousComponent) {
            this.state.totalPrice -= previousComponent.price;
        }
        this.state.totalPrice += component.price;
        
        // Update UI
        this.updateTotalPrice();
        this.renderComponentGrid(category);
        
        // Emit event
        this.eventBus.dispatchEvent(new CustomEvent('componentSelected', {
            detail: { category, component, totalPrice: this.state.totalPrice }
        }));
        
        // Update 3D scene
        if (this.scene3D) {
            this.scene3D.updateComponent(category, component);
        }
        
        // Show AI recommendation
        if (this.aiAssistant) {
            this.aiAssistant.showRecommendation(category, component);
        }
        
        // Analytics
        this.trackEvent('component_selected', {
            category,
            component_id: component.id,
            component_name: component.name,
            price: component.price
        });
    }

    updateTotalPrice() {
        const priceElement = document.getElementById('totalPrice');
        if (priceElement) {
            // Animate price change
            priceElement.style.transform = 'scale(1.1)';
            priceElement.textContent = `$${this.state.totalPrice.toLocaleString()} MXN`;
            
            setTimeout(() => {
                priceElement.style.transform = 'scale(1)';
            }, 200);
        }
    }

    /**
     * API management
     */
    async apiRequest(endpoint, options = {}) {
        const url = `${this.config.apiBaseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        };
        
        const requestOptions = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(url, requestOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
