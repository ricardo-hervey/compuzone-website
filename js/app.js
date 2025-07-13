/**
 * COMPUZONE - JAVASCRIPT PRINCIPAL (GITHUB PAGES VERSION)
 * Versión optimizada para GitHub Pages sin backend
 */

// Global Variables
let currentTheme = 'light';
let isAdminLoggedIn = false;
let selectedComponents = {};
let totalPrice = 0;
let pcScene = null;
let aiChatOpen = false;

// Sample Data for GitHub Pages
const componentsData = {
    cpu: [
        {
            id: 'cpu1',
            name: 'Intel Core i9-14900K',
            brand: 'Intel',
            price: 12500,
            specs: '24 cores, 32 threads, 3.2GHz base, 6.0GHz boost',
            image: '🧠',
            compatibility: ['LGA1700']
        },
        {
            id: 'cpu2',
            name: 'AMD Ryzen 9 7950X',
            brand: 'AMD',
            price: 11800,
            specs: '16 cores, 32 threads, 4.5GHz base, 5.7GHz boost',
            image: '🧠',
            compatibility: ['AM5']
        },
        {
            id: 'cpu3',
            name: 'Intel Core i7-13700K',
            brand: 'Intel',
            price: 8500,
            specs: '16 cores, 24 threads, 3.4GHz base, 5.4GHz boost',
            image: '🧠',
            compatibility: ['LGA1700']
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
            compatibility: ['PCIe 4.0']
        },
        {
            id: 'gpu2',
            name: 'GeForce RTX 4080 Super',
            brand: 'NVIDIA',
            price: 28000,
            specs: '16GB GDDR6X, 2550 MHz boost, 10240 CUDA cores',
            image: '🎮',
            compatibility: ['PCIe 4.0']
        },
        {
            id: 'gpu3',
            name: 'GeForce RTX 4070 Super',
            brand: 'NVIDIA',
            price: 18000,
            specs: '12GB GDDR6X, 2475 MHz boost, 7168 CUDA cores',
            image: '🎮',
            compatibility: ['PCIe 4.0']
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
            compatibility: ['DDR5']
        },
        {
            id: 'ram2',
            name: 'G.Skill Trident Z5 RGB',
            brand: 'G.Skill',
            price: 4500,
            specs: '32GB DDR5-5600, 2x16GB, RGB lighting',
            image: '💾',
            compatibility: ['DDR5']
        },
        {
            id: 'ram3',
            name: 'Kingston Fury Beast RGB',
            brand: 'Kingston',
            price: 2800,
            specs: '16GB DDR5-5200, 2x8GB, RGB lighting',
            image: '💾',
            compatibility: ['DDR5']
        }
    ],
    storage: [
        {
            id: 'storage1',
            name: 'Samsung 990 PRO',
            brand: 'Samsung',
            price: 4500,
            specs: '2TB NVMe PCIe 4.0, 7450MB/s read, 6900MB/s write',
            image: '💿',
            compatibility: ['M.2 NVMe']
        },
        {
            id: 'storage2',
            name: 'WD Black SN850X',
            brand: 'Western Digital',
            price: 2800,
            specs: '1TB NVMe PCIe 4.0, 7300MB/s read, 6600MB/s write',
            image: '💿',
            compatibility: ['M.2 NVMe']
        },
        {
            id: 'storage3',
            name: 'Crucial MX4',
            brand: 'Crucial',
            price: 1200,
            specs: '1TB SATA SSD, 560MB/s read, 510MB/s write',
            image: '💿',
            compatibility: ['SATA']
        }
    ],
    motherboard: [
        {
            id: 'mb1',
            name: 'ASUS ROG Maximus Z790 Hero',
            brand: 'ASUS',
            price: 12000,
            specs: 'LGA1700, DDR5-7800, WiFi 6E, Thunderbolt 4',
            image: '🔌',
            compatibility: ['LGA1700', 'DDR5', 'PCIe 4.0']
        },
        {
            id: 'mb2',
            name: 'MSI MEG X670E ACE',
            brand: 'MSI',
            price: 10500,
            specs: 'AM5, DDR5-6400, WiFi 6E, USB4',
            image: '🔌',
            compatibility: ['AM5', 'DDR5', 'PCIe 4.0']
        },
        {
            id: 'mb3',
            name: 'Gigabyte Z790 AORUS Elite',
            brand: 'Gigabyte',
            price: 6500,
            specs: 'LGA1700, DDR5-7600, WiFi 6, RGB lighting',
            image: '🔌',
            compatibility: ['LGA1700', 'DDR5', 'PCIe 4.0']
        }
    ],
    case: [
        {
            id: 'case1',
            name: 'Lian Li O11 Dynamic EVO',
            brand: 'Lian Li',
            price: 4500,
            specs: 'Mid-tower, tempered glass, triple chamber design',
            image: '🏠',
            compatibility: ['ATX', 'mATX', 'mini-ITX']
        },
        {
            id: 'case2',
            name: 'NZXT H7 Elite',
            brand: 'NZXT',
            price: 3800,
            specs: 'Mid-tower, tempered glass, RGB lighting, cable management',
            image: '🏠',
            compatibility: ['ATX', 'mATX', 'mini-ITX']
        },
        {
            id: 'case3',
            name: 'Fractal Design Define 7',
            brand: 'Fractal Design',
            price: 3200,
            specs: 'Full-tower, sound dampening, modular interior',
            image: '🏠',
            compatibility: ['E-ATX', 'ATX', 'mATX', 'mini-ITX']
        }
    ]
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 CompuZone iniciando...');
    initializeApp();
});

async function initializeApp() {
    try {
        console.log('📱 Inicializando aplicación...');
        
        // Initialize 3D scene
        await initPCScene();
        
        // Load initial data
        loadComponentGrid('cpu');
        setupScrollAnimations();
        setupHeaderScroll();
        loadDashboardData();
        
        // Hide loading screen after 2 seconds
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 2000);
        
        // Initialize stats counter
        animateStats();
        
        // Setup AI responses
        setupAI();
        
        console.log('✅ CompuZone inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando:', error);
        hideLoadingScreen();
    }
}

// 3D Scene Setup
async function initPCScene() {
    try {
        const canvas = document.getElementById('pc-canvas');
        if (!canvas) {
            console.warn('Canvas no encontrado');
            return;
        }

        if (typeof THREE === 'undefined') {
            console.warn('Three.js no cargado, usando fallback');
            showCanvasFallback(canvas);
            return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setClearColor(0x000000, 0);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Lighting setup
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0x3b82f6, 0.8, 100);
        pointLight.position.set(-10, 10, 10);
        scene.add(pointLight);

        // PC Components creation
        const components = {};
        
        // Motherboard
        const mbGeometry = new THREE.BoxGeometry(8, 0.2, 6);
        const mbMaterial = new THREE.MeshPhongMaterial({ color: 0x2d5016 });
        components.motherboard = new THREE.Mesh(mbGeometry, mbMaterial);
        components.motherboard.position.set(0, 0, 0);
        components.motherboard.castShadow = true;
        scene.add(components.motherboard);

        // CPU
        const cpuGeometry = new THREE.BoxGeometry(1.5, 0.3, 1.5);
        const cpuMaterial = new THREE.MeshPhongMaterial({ color: 0x4a5568 });
        components.cpu = new THREE.Mesh(cpuGeometry, cpuMaterial);
        components.cpu.position.set(-2, 0.25, 0);
        components.cpu.castShadow = true;
        scene.add(components.cpu);

        // RAM sticks
        const ramGeometry = new THREE.BoxGeometry(0.3, 1.5, 4);
        const ramMaterial = new THREE.MeshPhongMaterial({ color: 0x7c3aed });
        components.ram1 = new THREE.Mesh(ramGeometry, ramMaterial);
        components.ram1.position.set(1, 0.75, -1);
        components.ram1.castShadow = true;
        scene.add(components.ram1);

        components.ram2 = new THREE.Mesh(ramGeometry, ramMaterial);
        components.ram2.position.set(1.5, 0.75, -1);
        components.ram2.castShadow = true;
        scene.add(components.ram2);

        // GPU
        const gpuGeometry = new THREE.BoxGeometry(6, 1, 1.5);
        const gpuMaterial = new THREE.MeshPhongMaterial({ color: 0xea580c });
        components.gpu = new THREE.Mesh(gpuGeometry, gpuMaterial);
        components.gpu.position.set(0, -1, 2);
        components.gpu.castShadow = true;
        scene.add(components.gpu);

        // Storage
        const storageGeometry = new THREE.BoxGeometry(2, 0.3, 3);
        const storageMaterial = new THREE.MeshPhongMaterial({ color: 0x0891b2 });
        components.storage = new THREE.Mesh(storageGeometry, storageMaterial);
        components.storage.position.set(3, 0.15, 1);
        components.storage.castShadow = true;
        scene.add(components.storage);

        // PSU
        const psuGeometry = new THREE.BoxGeometry(3, 2, 3);
        const psuMaterial = new THREE.MeshPhongMaterial({ color: 0x374151 });
        components.psu = new THREE.Mesh(psuGeometry, psuMaterial);
        components.psu.position.set(0, -2, -2);
        components.psu.castShadow = true;
        scene.add(components.psu);

        // Case frame
        const caseGeometry = new THREE.BoxGeometry(10, 8, 8);
        const caseMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x1e293b, 
            transparent: true, 
            opacity: 0.3,
            wireframe: true 
        });
        components.case = new THREE.Mesh(caseGeometry, caseMaterial);
        components.case.position.set(0, 0, 0);
        scene.add(components.case);

        camera.position.set(15, 8, 15);
        camera.lookAt(0, 0, 0);

        // Animation loop
        let isExploded = false;
        let rotationSpeed = 0.01;
        const originalPositions = {};
        
        // Store original positions
        Object.keys(components).forEach(key => {
            originalPositions[key] = components[key].position.clone();
        });

        function animate() {
            requestAnimationFrame(animate);
            
            // Rotate scene
            scene.rotation.y += rotationSpeed;
            
            // Animate components
            Object.values(components).forEach(component => {
                if (component !== components.case) {
                    component.rotation.x += 0.005;
                    component.rotation.z += 0.003;
                }
            });

            renderer.render(scene, camera);
        }
        animate();

        // Scene controls
        window.pcScene = {
            explodeView: function() {
                isExploded = !isExploded;
                
                Object.keys(components).forEach(key => {
                    if (key === 'case') return;
                    
                    const component = components[key];
                    const targetPos = isExploded 
                        ? originalPositions[key].clone().multiplyScalar(2)
                        : originalPositions[key];

                    if (typeof gsap !== 'undefined') {
                        gsap.to(component.position, {
                            duration: 1,
                            x: targetPos.x,
                            y: targetPos.y,
                            z: targetPos.z,
                            ease: "power2.inOut"
                        });
                    } else {
                        component.position.copy(targetPos);
                    }
                });
            },
            
            rotateCamera: function() {
                if (typeof gsap !== 'undefined') {
                    gsap.to(camera.position, {
                        duration: 2,
                        x: camera.position.x * -1,
                        z: camera.position.z * -1,
                        ease: "power2.inOut",
                        onUpdate: () => camera.lookAt(0, 0, 0)
                    });
                } else {
                    camera.position.set(-camera.position.x, camera.position.y, -camera.position.z);
                    camera.lookAt(0, 0, 0);
                }
            },
            
            resetView: function() {
                camera.position.set(15, 8, 15);
                camera.lookAt(0, 0, 0);
                
                Object.keys(components).forEach(key => {
                    const component = components[key];
                    if (typeof gsap !== 'undefined') {
                        gsap.to(component.position, {
                            duration: 1,
                            x: originalPositions[key].x,
                            y: originalPositions[key].y,
                            z: originalPositions[key].z,
                            ease: "power2.inOut"
                        });
                    } else {
                        component.position.copy(originalPositions[key]);
                    }
                });
                
                isExploded = false;
            },
            
            toggleFullscreen: function() {
                if (!document.fullscreenElement) {
                    canvas.parentElement.requestFullscreen().catch(console.error);
                } else {
                    document.exitFullscreen();
                }
            }
        };

        // Handle resize
        window.addEventListener('resize', () => {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        });

        console.log('✅ 3D Scene inicializado');

    } catch (error) {
        console.error('❌ Error en 3D Scene:', error);
        const canvas = document.getElementById('pc-canvas');
        if (canvas) {
            showCanvasFallback(canvas);
        }
    }
}

function showCanvasFallback(canvas) {
    canvas.style.background = 'linear-gradient(135deg, #1e293b, #334155)';
    canvas.style.display = 'flex';
    canvas.style.alignItems = 'center';
    canvas.style.justifyContent = 'center';
    canvas.style.color = 'white';
    canvas.style.fontSize = '1.2rem';
    canvas.innerHTML = '<div style="text-align: center;">🖥️ Configurador 3D<br><small>Cargando...</small></div>';
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

// Navigation Functions
function scrollToSection(sectionId) {
    console.log('Navegando a:', sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Theme Toggle
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', currentTheme);
    
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
        toggle.classList.toggle('dark');
    }
    
    console.log('Tema cambiado a:', currentTheme);
}

// Component Management
function selectCategory(category) {
    console.log('Categoría seleccionada:', category);
    
    // Update active category
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-category="${category}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Load components for category
    loadComponentGrid(category);
}

function loadComponentGrid(category) {
    const grid = document.getElementById('componentGrid');
    if (!grid) return;
    
    const components = componentsData[category] || [];
    
    grid.innerHTML = '';
    
    components.forEach(component => {
        const card = document.createElement('div');
        card.className = 'component-card';
        card.onclick = () => selectComponent(category, component);
        
        const isSelected = selectedComponents[category]?.id === component.id;
        
        card.innerHTML = `
            <div class="component-image">${component.image}</div>
            <div class="component-name">${component.name}</div>
            <div class="component-brand">${component.brand}</div>
            <div class="component-specs">${component.specs}</div>
            <div class="component-price">$${component.price.toLocaleString()} MXN</div>
            <button class="btn btn-primary" style="width: 100%; margin-top: 16px;">
                ${isSelected ? '✓ Seleccionado' : 'Seleccionar'}
            </button>
        `;
        
        if (isSelected) {
            card.style.borderColor = 'var(--primary-500)';
            card.style.background = 'var(--primary-50)';
        }
        
        grid.appendChild(card);
    });
}

function selectComponent(category, component) {
    console.log('Componente seleccionado:', category, component.name);
    
    // Update selection
    const previousComponent = selectedComponents[category];
    selectedComponents[category] = component;
    
    // Update price
    if (previousComponent) {
        totalPrice -= previousComponent.price;
    }
    totalPrice += component.price;
    
    // Update UI
    const priceElement = document.getElementById('totalPrice');
    if (priceElement) {
        priceElement.textContent = `$${totalPrice.toLocaleString()} MXN`;
    }
    
    loadComponentGrid(category);
    
    // Show AI recommendation
    showAIRecommendation(category, component);
    
    // Update 3D scene
    updatePCVisualization(category, component);
}

function updatePCVisualization(category, component) {
    console.log(`Actualizando visualización 3D: ${category} - ${component.name}`);
    
    // Add visual feedback
    const canvas = document.getElementById('pc-canvas');
    if (canvas) {
        canvas.style.filter = 'brightness(1.1)';
        setTimeout(() => {
            canvas.style.filter = 'brightness(1)';
        }, 300);
    }
}

// AI Assistant
function setupAI() {
    const aiMessages = [
        "¡Perfecto! Veo que estás configurando una PC gaming. ¿Qué tipo de juegos planeas usar?",
        "Excelente elección de componentes. ¿Te interesa optimizar para gaming 4K o 1440p?",
        "Recomiendo considerar la compatibilidad entre el procesador y la motherboard.",
        "¿Necesitas ayuda con la refrigeración para estos componentes?",
        "Tu configuración actual está muy balanceada para gaming de alta gama."
    ];
    
    window.aiResponses = aiMessages;
}

function toggleAI() {
    const aiChat = document.getElementById('aiChat');
    if (!aiChat) return;
    
    aiChatOpen = !aiChatOpen;
    aiChat.style.display = aiChatOpen ? 'flex' : 'none';
    
    if (aiChatOpen) {
        const aiInput = document.getElementById('aiInput');
        if (aiInput) {
            aiInput.focus();
        }
    }
}

function sendAIMessage() {
    const input = document.getElementById('aiInput');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    addAIMessage(message, 'user');
    input.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const responses = [
            "Basándome en tu configuración actual, te recomiendo considerar una fuente de poder de al menos 850W.",
            "Esa es una excelente combinación de componentes. ¿Has pensado en añadir refrigeración líquida?",
            "Para gaming 4K, esa GPU es perfecta. También recomiendo 32GB de RAM para futuro-proofing.",
            "Tu selección está muy balanceada. El cuello de botella será mínimo entre esos componentes.",
            "¿Te interesa que revise la compatibilidad de todos tus componentes?"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addAIMessage(randomResponse, 'bot');
    }, 1000);
}

function addAIMessage(message, sender) {
    const messagesContainer = document.getElementById('aiMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${sender}`;
    messageDiv.textContent = message;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function handleAIInput(event) {
    if (event.key === 'Enter') {
        sendAIMessage();
    }
}

function showAIRecommendation(category, component) {
    const recommendations = {
        cpu: `¡Excelente elección! El ${component.name} es perfecto para gaming y productividad. Recomiendo combinarlo con una motherboard de gama alta.`,
        gpu: `¡Increíble GPU! El ${component.name} puede manejar gaming 4K sin problemas. Asegúrate de tener una PSU de al menos 850W.`,
        ram: `Buena selección de memoria. ${component.name} ofrecerá excelente rendimiento. Para gaming, 32GB es el sweet spot actual.`,
        storage: `Excelente SSD. ${component.name} garantizará tiempos de carga ultra-rápidos. Considera añadir un HDD para almacenamiento masivo.`,
        motherboard: `Perfecta motherboard. ${component.name} tiene todas las características modernas que necesitas.`,
        case: `Gran gabinete. ${component.name} ofrecerá excelente flujo de aire y espacio para componentes grandes.`
    };
    
    if (aiChatOpen && recommendations[category]) {
        addAIMessage(recommendations[category], 'bot');
    }
}

// Admin Panel Functions
function showAdminLogin() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (username === 'admin' && password === 'compuzone2025') {
        isAdminLoggedIn = true;
        closeModal('loginModal');
        
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            adminPanel.style.display = 'block';
        }
        
        loadAdminData();
        showNotification('¡Bienvenido al panel administrativo!', 'success');
    } else {
        showNotification('Credenciales incorrectas', 'error');
    }
}

function adminLogout() {
    isAdminLoggedIn = false;
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.style.display = 'none';
    }
    showNotification('Sesión cerrada correctamente', 'success');
}

function showAdminSection(section) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Remove active from nav
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`admin${section.charAt(0).toUpperCase() + section.slice(1)}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active to nav item
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Load section specific data
    switch(section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'products':
            loadProductsData();
            break;
        case 'components':
            loadComponentsData();
            break;
    }
}

function loadAdminData() {
    loadDashboardData();
    loadProductsData();
    loadComponentsData();
}

function loadDashboardData() {
    // Recent sales
    const recentSales = [
        { customer: 'Juan Pérez', product: 'Gaming Pro X1', value: 45000, status: 'Completado' },
        { customer: 'María García', product: 'Workstation Elite', value: 65000, status: 'En proceso' },
        { customer: 'Carlos López', product: 'Gaming Ultimate', value: 85000, status: 'Pendiente' }
    ];
    
    const salesTable = document.getElementById('recentSales');
    if (salesTable) {
        salesTable.innerHTML = recentSales.map(sale => `
            <tr>
                <td>${sale.customer}</td>
                <td>${sale.product}</td>
                <td>$${sale.value.toLocaleString()}</td>
                <td><span class="status-badge">${sale.status}</span></td>
            </tr>
        `).join('');
    }
    
    // System activity
    const activities = [
        '🛒 Nueva orden: Gaming Pro X1',
        '💰 Pago recibido: $45,000',
        '📦 Producto enviado: #1001',
        '👤 Nuevo usuario registrado',
        '🔧 Componente actualizado: RTX 4090'
    ];
    
    const activityContainer = document.getElementById('systemActivity');
    if (activityContainer) {
        activityContainer.innerHTML = activities.map(activity => `
            <div style="padding: var(--space-3); border-left: 3px solid var(--primary-500); margin-bottom: var(--space-2); background: var(--gray-50); border-radius: var(--radius);">
                <div style="font-size: 0.9rem;">${activity}</div>
                <div style="font-size: 0.75rem; color: var(--gray-500); margin-top: var(--space-1);">Hace ${Math.floor(Math.random() * 60)} minutos</div>
            </div>
        `).join('');
    }
}

function loadProductsData() {
    const products = [
        { id: 1, name: 'Gaming Pro X1', category: 'Gaming', price: 45000, status: 'Disponible' },
        { id: 2, name: 'Workstation Elite', category: 'Trabajo', price: 65000, status: 'Disponible' },
        { id: 3, name: 'Gaming Ultimate', category: 'Gaming', price: 85000, status: 'Stock Limitado' }
    ];
    
    const table = document.getElementById('productsTable');
    if (table) {
        table.innerHTML = products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.price.toLocaleString()}</td>
                <td><span class="status-badge">${product.status}</span></td>
                <td>
                    <button class="btn-icon" onclick="editProduct(${product.id})">✏️</button>
                    <button class="btn-icon" onclick="deleteProduct(${product.id})">🗑️</button>
                </td>
            </tr>
        `).join('');
    }
}

function loadComponentsData() {
    const components = [
        { id: 1, name: 'Intel i9-14900K', brand: 'Intel', type: 'CPU', price: 12500, stock: 15 },
        { id: 2, name: 'RTX 4090', brand: 'NVIDIA', type: 'GPU', price: 35000, stock: 8 },
        { id: 3, name: 'DDR5-6000 32GB', brand: 'Corsair', type: 'RAM', price: 4500, stock: 25 }
    ];
    
    const table = document.getElementById('componentsTable');
    if (table) {
        table.innerHTML = components.map(component => `
            <tr>
                <td>${component.id}</td>
                <td>${component.name}</td>
                <td>${component.brand}</td>
                <td>${component.type}</td>
                <td>${component.price.toLocaleString()}</td>
                <td>${component.stock}</td>
                <td>
                    <button class="btn-icon" onclick="editComponent(${component.id})">✏️</button>
                    <button class="btn-icon" onclick="deleteComponent(${component.id})">🗑️</button>
                </td>
            </tr>
        `).join('');
    }
}

// Utility Functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        z-index: 10000;
        max-width: 300px;
        animation: slideInRight 0.3s ease-out;
        font-weight: 500;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="margin-left: auto; background: none; border: none; color: white; cursor: pointer; font-size: 18px;">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 3000);
}

function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-animate').forEach(el => {
        observer.observe(el);
    });
}

function setupHeaderScroll() {
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (header) {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
}

function animateStats() {
    const buildsElement = document.getElementById('buildsCount');
    if (!buildsElement) return;
    
    let currentCount = 0;
    const targetCount = 2847;
    const increment = targetCount / 100;
    
    const counter = setInterval(() => {
        currentCount += increment;
        if (currentCount >= targetCount) {
            currentCount = targetCount;
            clearInterval(counter);
        }
        buildsElement.textContent = Math.floor(currentCount).toLocaleString();
    }, 30);
}

function requestQuote() {
    if (Object.keys(selectedComponents).length === 0) {
        showNotification('Primero selecciona algunos componentes', 'error');
        return;
    }
    
    const config = Object.entries(selectedComponents)
        .map(([type, component]) => `${type}: ${component.name}`)
        .join('\n');
    
    const message = `¡Excelente configuración!\n\nComponentes seleccionados:\n${config}\n\nTotal: ${totalPrice.toLocaleString()} MXN\n\nUn especialista se pondrá en contacto contigo para finalizar tu cotización personalizada.`;
    
    alert(message);
    showNotification('Cotización enviada correctamente', 'success');
}

function startTour() {
    showNotification('Iniciando demo 3D...', 'info');
    
    setTimeout(() => {
        if (window.pcScene) window.pcScene.explodeView();
    }, 1000);
    
    setTimeout(() => {
        if (window.pcScene) window.pcScene.rotateCamera();
    }, 3000);
    
    setTimeout(() => {
        if (window.pcScene) window.pcScene.resetView();
    }, 6000);
}

// Contact Form
function submitContactForm(event) {
    event.preventDefault();
    showNotification('¡Gracias por tu interés! Nos pondremos en contacto contigo muy pronto.', 'success');
    event.target.reset();
}

// Placeholder functions for admin features
function showProductForm() {
    showNotification('Función de agregar producto en desarrollo', 'info');
}

function showComponentForm() {
    showNotification('Función de agregar componente en desarrollo', 'info');
}

function editProduct(id) {
    showNotification(`Editando producto ${id}`, 'info');
}

function deleteProduct(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        showNotification(`Producto ${id} eliminado`, 'success');
    }
}

function editComponent(id) {
    showNotification(`Editando componente ${id}`, 'info');
}

function deleteComponent(id) {
    if (confirm('¿Estás seguro de eliminar este componente?')) {
        showNotification(`Componente ${id} eliminado`, 'success');
    }
}

// Add CSS animations dynamically
const additionalStyles = `
    @keyframes slideInRight {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100px); opacity: 0; }
    }
    
    .btn:hover {
        transform: translateY(-1px);
        transition: all 0.2s ease;
    }
    
    .btn:active {
        transform: translateY(0);
    }
    
    .component-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 40px rgba(59, 130, 246, 0.1);
        transition: all 0.3s ease;
    }
    
    .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        background: #10b981;
        color: white;
    }
    
    .btn-icon {
        background: none;
        border: none;
        padding: 0.5rem;
        margin: 0 0.25rem;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .btn-icon:hover {
        background: var(--primary-100);
        transform: scale(1.1);
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Service Worker Registration (PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('✅ Service Worker registrado:', registration);
            })
            .catch(registrationError => {
                console.log('❌ Service Worker falló:', registrationError);
            });
    });
}

// Performance monitoring
window.addEventListener('load', () => {
    try {
        const perfData = performance.getEntriesByType('navigation')[0];
        const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
        console.log('⚡ Tiempo de carga:', loadTime, 'ms');
        
        if (loadTime > 3000) {
            console.warn('⚠️ Carga lenta detectada');
        }
    } catch (error) {
        console.log('Performance data no disponible');
    }
});

// Global error handling
window.addEventListener('error', (event) => {
    console.error('❌ Error global:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rechazada:', event.reason);
});

console.log('🚀 CompuZone JavaScript cargado correctamente');
        '
