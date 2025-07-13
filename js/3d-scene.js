/**
 * COMPUZONE - ADVANCED 3D SCENE MANAGER
 * Professional 3D rendering with Three.js
 * @version 2.0.0
 */

class PCScene3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.components = {};
        this.originalPositions = {};
        this.lights = {};
        this.animations = {};
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.config = {
            canvas: '#pc-canvas',
            backgroundColor: 0x000000,
            enableShadows: true,
            enablePostProcessing: true,
            antialias: true,
            alpha: true
        };
        
        this.state = {
            isExploded: false,
            isRotating: true,
            isPaused: false,
            selectedComponent: null,
            animationSpeed: 1.0
        };
        
        this.materials = new Map();
        this.geometries = new Map();
        this.textures = new Map();
        
        this.performance = {
            frameCount: 0,
            lastTime: performance.now(),
            fps: 0
        };
    }

    /**
     * Initialize the 3D scene
     */
    async init() {
        try {
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.setupLights();
            await this.loadAssets();
            this.createComponents();
            this.setupControls();
            this.setupEventListeners();
            this.startAnimationLoop();
            
            console.log('🎮 3D Scene initialized successfully');
        } catch (error) {
            console.error('Failed to initialize 3D scene:', error);
            this.showFallback();
        }
    }

    /**
     * Setup the Three.js scene
     */
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.config.backgroundColor);
        
        // Add fog for depth
        this.scene.fog = new THREE.Fog(0x000000, 50, 200);
        
        // Environment mapping
        const loader = new THREE.CubeTextureLoader();
        try {
            const envMap = loader.load([
                '/assets/textures/env/px.jpg', '/assets/textures/env/nx.jpg',
                '/assets/textures/env/py.jpg', '/assets/textures/env/ny.jpg',
                '/assets/textures/env/pz.jpg', '/assets/textures/env/nz.jpg'
            ]);
            this.scene.environment = envMap;
        } catch (error) {
            console.warn('Environment textures not found, using default');
        }
    }

    /**
     * Setup camera with optimal settings
     */
    setupCamera() {
        const canvas = document.querySelector(this.config.canvas);
        const aspect = canvas.clientWidth / canvas.clientHeight;
        
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(15, 8, 15);
        this.camera.lookAt(0, 0, 0);
        
        // Add camera helper for debugging
        if (window.DEBUG_MODE) {
            const helper = new THREE.CameraHelper(this.camera);
            this.scene.add(helper);
        }
    }

    /**
     * Setup WebGL renderer with advanced settings
     */
    setupRenderer() {
        const canvas = document.querySelector(this.config.canvas);
        
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: this.config.antialias,
            alpha: this.config.alpha,
            powerPreference: "high-performance"
        });
        
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Enable shadows
        if (this.config.enableShadows) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        // Enable tone mapping for better colors
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        // Enable gamma correction
        this.renderer.outputEncoding = THREE.sRGBEncoding;
    }

    /**
     * Setup advanced lighting system
     */
    setupLights() {
        // Ambient light for overall illumination
        this.lights.ambient = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(this.lights.ambient);

        // Main directional light (sun)
        this.lights.main = new THREE.DirectionalLight(0xffffff, 1.0);
        this.lights.main.position.set(10, 10, 5);
        this.lights.main.castShadow = true;
        
        // Configure shadow properties
        this.lights.main.shadow.mapSize.width = 2048;
        this.lights.main.shadow.mapSize.height = 2048;
        this.lights.main.shadow.camera.near = 0.5;
        this.lights.main.shadow.camera.far = 100;
        this.lights.main.shadow.camera.left = -20;
        this.lights.main.shadow.camera.right = 20;
        this.lights.main.shadow.camera.top = 20;
        this.lights.main.shadow.camera.bottom = -20;
        
        this.scene.add(this.lights.main);

        // Accent lights for visual appeal
        this.lights.accent1 = new THREE.PointLight(0x3b82f6, 0.8, 50);
        this.lights.accent1.position.set(-10, 5, 10);
        this.scene.add(this.lights.accent1);

        this.lights.accent2 = new THREE.PointLight(0xff6b6b, 0.6, 30);
        this.lights.accent2.position.set(10, -5, -10);
        this.scene.add(this.lights.accent2);

        // Rim light for edge definition
        this.lights.rim = new THREE.DirectionalLight(0xffffff, 0.3);
        this.lights.rim.position.set(-5, 0, -10);
        this.scene.add(this.lights.rim);

        // Animate accent lights
        this.animateLights();
    }

    /**
     * Load 3D assets and textures
     */
    async loadAssets() {
        const textureLoader = new THREE.TextureLoader();
        const materialPromises = [];

        // Load material textures
        const materials = [
            { name: 'metal', diffuse: '/assets/textures/metal_diffuse.jpg', normal: '/assets/textures/metal_normal.jpg' },
            { name: 'plastic', diffuse: '/assets/textures/plastic_diffuse.jpg' },
            { name: 'glass', diffuse: '/assets/textures/glass_diffuse.jpg' },
            { name: 'pcb', diffuse: '/assets/textures/pcb_diffuse.jpg', normal: '/assets/textures/pcb_normal.jpg' }
        ];

        materials.forEach(material => {
            const promise = this.loadMaterial(material.name, material.diffuse, material.normal);
            materialPromises.push(promise);
        });

        try {
            await Promise.all(materialPromises);
        } catch (error) {
            console.warn('Some textures failed to load, using fallback materials');
            this.createFallbackMaterials();
        }
    }

    /**
     * Load individual material with textures
     */
    async loadMaterial(name, diffusePath, normalPath) {
        const textureLoader = new THREE.TextureLoader();
        
        try {
            const diffuseTexture = await this.loadTexture(textureLoader, diffusePath);
            let normalTexture = null;
            
            if (normalPath) {
                normalTexture = await this.loadTexture(textureLoader, normalPath);
            }
            
            const material = new THREE.MeshPhysicalMaterial({
                map: diffuseTexture,
                normalMap: normalTexture,
                roughness: name === 'metal' ? 0.1 : 0.8,
                metalness: name === 'metal' ? 0.9 : 0.0,
                clearcoat: name === 'plastic' ? 1.0 : 0.0,
                clearcoatRoughness: 0.1
            });
            
            this.materials.set(name, material);
        } catch (error) {
            console.warn(`Failed to load material: ${name}`);
            this.materials.set(name, this.createFallbackMaterial(name));
        }
    }

    /**
     * Load texture with promise wrapper
     */
    loadTexture(loader, path) {
        return new Promise((resolve, reject) => {
            loader.load(
                path,
                resolve,
                undefined,
                reject
            );
        });
    }

    /**
     * Create fallback materials when textures fail to load
     */
    createFallbackMaterials() {
        const materialConfigs = {
            metal: { color: 0x888888, roughness: 0.1, metalness: 0.9 },
            plastic: { color: 0x222222, roughness: 0.8, metalness: 0.0 },
            glass: { color: 0x888888, roughness: 0.0, metalness: 0.0, transparent: true, opacity: 0.8 },
            pcb: { color: 0x2d5016, roughness: 0.9, metalness: 0.0 },
            cpu: { color: 0x4a5568, roughness: 0.3, metalness