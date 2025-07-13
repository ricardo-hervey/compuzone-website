$this->connection = new PDO(
                "mysql:host={$this->host};dbname={$this->dbname};charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                ]
            );
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            exit();
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
}

// Authentication and authorization
class Auth {
    private static $secretKey = 'your-super-secret-jwt-key-2025';
    
    public static function generateToken($userId, $role = 'user') {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'user_id' => $userId,
            'role' => $role,
            'exp' => time() + (24 * 60 * 60), // 24 hours
            'iat' => time()
        ]);
        
        $headerEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $payloadEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, self::$secretKey, true);
        $signatureEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
    }
    
    public static function validateToken($token) {
        if (!$token) return false;
        
        $parts = explode('.', $token);
        if (count($parts) !== 3) return false;
        
        [$headerEncoded, $payloadEncoded, $signatureEncoded] = $parts;
        
        $signature = base64_decode(str_replace(['-', '_'], ['+', '/'], $signatureEncoded));
        $expectedSignature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, self::$secretKey, true);
        
        if (!hash_equals($signature, $expectedSignature)) return false;
        
        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payloadEncoded)), true);
        
        if ($payload['exp'] < time()) return false;
        
        return $payload;
    }
    
    public static function requireAuth($requiredRole = null) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        
        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(['error' => 'Authorization header missing or invalid']);
            exit();
        }
        
        $token = $matches[1];
        $payload = self::validateToken($token);
        
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            exit();
        }
        
        if ($requiredRole && $payload['role'] !== $requiredRole && $payload['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Insufficient permissions']);
            exit();
        }
        
        return $payload;
    }
}

// Input validation and sanitization
class Validator {
    public static function validateProduct($data) {
        $errors = [];
        
        if (empty($data['name']) || strlen($data['name']) < 3) {
            $errors['name'] = 'Name must be at least 3 characters long';
        }
        
        if (empty($data['category'])) {
            $errors['category'] = 'Category is required';
        }
        
        if (!isset($data['price']) || $data['price'] <= 0) {
            $errors['price'] = 'Price must be greater than 0';
        }
        
        if (empty($data['description']) || strlen($data['description']) < 10) {
            $errors['description'] = 'Description must be at least 10 characters long';
        }
        
        return $errors;
    }
    
    public static function validateComponent($data) {
        $errors = [];
        
        if (empty($data['name']) || strlen($data['name']) < 2) {
            $errors['name'] = 'Name must be at least 2 characters long';
        }
        
        if (empty($data['brand'])) {
            $errors['brand'] = 'Brand is required';
        }
        
        if (empty($data['type'])) {
            $errors['type'] = 'Type is required';
        }
        
        if (!isset($data['price']) || $data['price'] <= 0) {
            $errors['price'] = 'Price must be greater than 0';
        }
        
        if (isset($data['stock']) && $data['stock'] < 0) {
            $errors['stock'] = 'Stock cannot be negative';
        }
        
        return $errors;
    }
    
    public static function sanitizeInput($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitizeInput'], $data);
        }
        
        return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
    }
}

// Rate limiting
class RateLimiter {
    private static $limits = [
        'default' => ['requests' => 100, 'window' => 3600], // 100 requests per hour
        'admin' => ['requests' => 1000, 'window' => 3600],   // 1000 requests per hour for admin
        'auth' => ['requests' => 10, 'window' => 900]        // 10 auth attempts per 15 minutes
    ];
    
    public static function checkLimit($identifier, $type = 'default') {
        $limit = self::$limits[$type];
        $key = "rate_limit_{$type}_{$identifier}";
        $file = sys_get_temp_dir() . "/{$key}.json";
        
        $data = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
        $now = time();
        
        // Clean old entries
        $data = array_filter($data, function($timestamp) use ($now, $limit) {
            return ($now - $timestamp) < $limit['window'];
        });
        
        if (count($data) >= $limit['requests']) {
            http_response_code(429);
            echo json_encode(['error' => 'Rate limit exceeded']);
            exit();
        }
        
        $data[] = $now;
        file_put_contents($file, json_encode($data));
    }
}

// API Router
class APIRouter {
    private $routes = [];
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->setupRoutes();
    }
    
    private function setupRoutes() {
        // Public routes
        $this->routes['GET']['/api/products'] = [$this, 'getProducts'];
        $this->routes['GET']['/api/products/(\d+)'] = [$this, 'getProduct'];
        $this->routes['GET']['/api/components'] = [$this, 'getComponents'];
        $this->routes['GET']['/api/components/(\d+)'] = [$this, 'getComponent'];
        $this->routes['POST']['/api/auth/login'] = [$this, 'login'];
        $this->routes['POST']['/api/contact'] = [$this, 'submitContact'];
        $this->routes['POST']['/api/quote'] = [$this, 'submitQuote'];
        
        // Admin routes (require authentication)
        $this->routes['GET']['/api/admin/dashboard'] = [$this, 'getAdminDashboard'];
        $this->routes['POST']['/api/admin/products'] = [$this, 'createProduct'];
        $this->routes['PUT']['/api/admin/products/(\d+)'] = [$this, 'updateProduct'];
        $this->routes['DELETE']['/api/admin/products/(\d+)'] = [$this, 'deleteProduct'];
        $this->routes['POST']['/api/admin/components'] = [$this, 'createComponent'];
        $this->routes['PUT']['/api/admin/components/(\d+)'] = [$this, 'updateComponent'];
        $this->routes['DELETE']['/api/admin/components/(\d+)'] = [$this, 'deleteComponent'];
        $this->routes['GET']['/api/admin/orders'] = [$this, 'getOrders'];
        $this->routes['PUT']['/api/admin/orders/(\d+)'] = [$this, 'updateOrder'];
        $this->routes['GET']['/api/admin/analytics'] = [$this, 'getAnalytics'];
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        // Apply rate limiting
        $clientIP = $_SERVER['REMOTE_ADDR'];
        $rateLimitType = strpos($path, '/admin/') !== false ? 'admin' : 'default';
        if (strpos($path, '/auth/') !== false) $rateLimitType = 'auth';
        
        RateLimiter::checkLimit($clientIP, $rateLimitType);
        
        // Find matching route
        foreach ($this->routes[$method] ?? [] as $pattern => $handler) {
            if (preg_match('#^' . $pattern . '$#', $path, $matches)) {
                array_shift($matches); // Remove full match
                
                try {
                    // Check if admin route
                    if (strpos($pattern, '/admin/') !== false) {
                        Auth::requireAuth('admin');
                    }
                    
                    call_user_func_array($handler, $matches);
                    return;
                } catch (Exception $e) {
                    error_log("API Error: " . $e->getMessage());
                    http_response_code(500);
                    echo json_encode(['error' => 'Internal server error']);
                    return;
                }
            }
        }
        
        // Route not found
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
    }
    
    // Authentication endpoints
    public function login() {
        $input = json_decode(file_get_contents('php://input'), true);
        $username = Validator::sanitizeInput($input['username'] ?? '');
        $password = $input['password'] ?? '';
        
        // Demo credentials - in production, use proper password hashing
        if ($username === 'admin' && $password === 'compuzone2025') {
            $token = Auth::generateToken(1, 'admin');
            
            echo json_encode([
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => 1,
                    'username' => 'admin',
                    'role' => 'admin',
                    'name' => 'Administrator'
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
        }
    }
    
    // Product endpoints
    public function getProducts() {
        $page = (int)($_GET['page'] ?? 1);
        $limit = min((int)($_GET['limit'] ?? 20), 100); // Max 100 items per page
        $category = $_GET['category'] ?? '';
        $search = $_GET['search'] ?? '';
        $offset = ($page - 1) * $limit;
        
        $sql = "SELECT * FROM products WHERE 1=1";
        $params = [];
        
        if ($category) {
            $sql .= " AND category = ?";
            $params[] = $category;
        }
        
        if ($search) {
            $sql .= " AND (name LIKE ? OR description LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }
        
        $sql .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $products = $stmt->fetchAll();
            
            // Get total count
            $countSql = str_replace("SELECT *", "SELECT COUNT(*)", explode("ORDER BY", $sql)[0]);
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute(array_slice($params, 0, -2));
            $total = $countStmt->fetchColumn();
            
            echo json_encode([
                'success' => true,
                'data' => $products,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => (int)$total,
                    'pages' => ceil($total / $limit)
                ]
            ]);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Database error']);
        }
    }
    
    public function getProduct($id) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM products WHERE id = ?");
            $stmt->execute([$id]);
            $product = $stmt->fetch();
            
            if (!$product) {
                http_response_code(404);
                echo json_encode(['error' => 'Product not found']);
                return;
            }
            
            // Get product components
            $stmt = $this->db->prepare("
                SELECT c.*, pc.quantity 
                FROM product_components pc 
                JOIN components c ON pc.component_id = c.id 
                WHERE pc.product_id = ?
            ");
            $stmt->execute([$id]);
            $product['components'] = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => $product
            ]);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Database error']);
        }
    }
    
    public function createProduct() {
        $input = json_decode(file_get_contents('php://input'), true);
        $data = Validator::sanitizeInput($input);
        
        $errors = Validator::validateProduct($data);
        if (!empty($errors)) {
            http_response_code(400);
            echo json_encode(['error' => 'Validation failed', 'details' => $errors]);
            return;
        }
        
        try {
            $this->db->beginTransaction();
            
            $stmt = $this->db->prepare("
                INSERT INTO products (name, category, price, description, status, stock, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");
            
            $stmt->execute([
                $data['name'],
                $data['category'],
                $data['price'],
                $data['description'],
                $data['status'] ?? 'available',
                $data['stock'] ?? 0
            ]);
            
            $productId = $this->db->lastInsertId();
            
            // Add components if provided
            if (!empty($data['components'])) {
                $componentStmt = $this->db->prepare("
                    INSERT INTO product_components (product_id, component_id, quantity) 
                    VALUES (?, ?, ?)
                ");
                
                foreach ($data['components'] as $component) {
                    $componentStmt->execute([
                        $productId,
                        $component['id'],
                        $component['quantity'] ?? 1
                    ]);
                }
            }
            
            $this->db->commit();
            
            echo json_encode([
                'success' => true,
                'data' => ['id' => $productId],
                'message' => 'Product created successfully'
            ]);
        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("Database error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create product']);
        }
    }
    
    public function updateProduct($id) {
        $input = json_decode(file_get_contents('php://input'), true);
        $data = Validator::sanitizeInput($input);
        
        $errors = Validator::validateProduct($data);
        if (!empty($errors)) {
            http_response_code(400);
            echo json_encode(['error' => 'Validation failed', 'details' => $errors]);
            return;
        }
        
        try {
            $stmt = $this->db->prepare("
                UPDATE products 
                SET name = ?, category = ?, price = ?, description = ?, status = ?, stock = ?, updated_at = NOW() 
                WHERE id = ?
            ");
            
            $result = $stmt->execute([
                $data['name'],
                $data['category'],
                $data['price'],
                $data['description'],
                $data['status'] ?? 'available',
                $data['stock'] ?? 0,
                $id
            ]);
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Product not found']);
                return;
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Product updated successfully'
            ]);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update product']);
        }
    }
    
    public function deleteProduct($id) {
        try {
            $this->db->beginTransaction();
            
            // Delete product components first
            $stmt = $this->db->prepare("DELETE FROM product_components WHERE product_id = ?");
            $stmt->execute([$id]);
            
            // Delete product
            $stmt = $this->db->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() === 0) {
                $this->db->rollBack();
                http_response_code(404);
                echo json_encode(['error' => 'Product not found']);
                return;
            }
            
            $this->db->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Product deleted successfully'
            ]);
        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("Database error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete product']);
        }
    }
    
    // Component endpoints
    public function getComponents() {
        $type = $_GET['type'] ?? '';
        $brand = $_GET['brand'] ?? '';
        
        $sql = "SELECT * FROM components WHERE 1=1";
        $params = [];
        
        if ($type) {
            $sql .= " AND type = ?";
            $params[] = $type;
        }
        
        if ($brand) {
            $sql .= " AND brand = ?";
            $params[] = $brand;
        }
        
        $sql .= " ORDER BY brand, name";
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $components = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => $components
            ]);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Database error']);
        }
    }
    
    // Contact and quote endpoints
    public function submitContact() {
        $input = json_decode(file_get_contents('php://input'), true);
        $data = Validator::sanitizeInput($input);
        
        if (empty($data['name']) || empty($data['email']) || empty($data['message'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Name, email, and message are required']);
            return;
        }
        
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email address']);
            return;
        }
        
        try {
            $stmt = $this->db->prepare("
                INSERT INTO contact_submissions (name, email, phone, message, created_at) 
                VALUES (?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                $data['name'],
                $data['email'],
                $data['phone'] ?? '',
                $data['message']
            ]);
            
            // Send email notification (implement with your preferred email service)
            $this->sendContactNotification($data);
            
            echo json_encode([
                'success' => true,
                'message' => 'Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.'
            ]);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to submit contact form']);
        }
    }
    
    public function submitQuote() {
        $input = json_decode(file_get_contents('php://input'), true);
        $data = Validator::sanitizeInput($input);
        
        if (empty($data['name']) || empty($data['email']) || empty($data['components'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Name, email, and components are required']);
            return;
        }
        
        try {
            $this->db->beginTransaction();
            
            $stmt = $this->db->prepare("
                INSERT INTO quote_requests (name, email, phone, total_price, status, created_at) 
                VALUES (?, ?, ?, ?, 'pending', NOW())
            ");
            
            $stmt->execute([
                $data['name'],
                $data['email'],
                $data['phone'] ?? '',
                $data['total_price'] ?? 0
            ]);
            
            $quoteId = $this->db->lastInsertId();
            
            // Add quote components
            $componentStmt = $this->db->prepare("
                INSERT INTO quote_components (quote_id, component_id, quantity, price) 
                VALUES (?, ?, ?, ?)
            ");
            
            foreach ($data['components'] as $component) {
                $componentStmt->execute([
                    $quoteId,
                    $component['id'],
                    $component['quantity'] ?? 1,
                    $component['price'] ?? 0
                ]);
            }
            
            $this->db->commit();
            
            // Send quote notification
            $this->sendQuoteNotification($data, $quoteId);
            
            echo json_encode([
                'success' => true,
                'data' => ['quote_id' => $quoteId],
                'message' => 'Cotización enviada correctamente. Te contactaremos pronto con los detalles.'
            ]);
        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("Database error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to submit quote']);
        }
    }
    
    // Admin dashboard
    public function getAdminDashboard() {
        try {
            // Get various statistics
            $stats = [];
            
            // Total sales this month
            $stmt = $this->db->prepare("
                SELECT SUM(total) as total_sales, COUNT(*) as total_orders 
                FROM orders 
                WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
                AND YEAR(created_at) = YEAR(CURRENT_DATE())
                AND status = 'completed'
            ");
            $stmt->execute();
            $salesData = $stmt->fetch();
            
            $stats['total_sales'] = $salesData['total_sales'] ?? 0;
            $stats['total_orders'] = $salesData['total_orders'] ?? 0;
            
            // Active products
            $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM products WHERE status = 'available'");
            $stmt->execute();
            $stats['active_products'] = $stmt->fetchColumn();
            
            // Average order value
            $stats['avg_order_value'] = $stats['total_orders'] > 0 ? 
                $stats['total_sales'] / $stats['total_orders'] : 0;
            
            // Recent sales
            $stmt = $this->db->prepare("
                SELECT o.*, p.name as product_name 
                FROM orders o 
                LEFT JOIN products p ON o.product_id = p.id 
                ORDER BY o.created_at DESC 
                LIMIT 10
            ");
            $stmt->execute();
            $recent_sales = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'stats' => $stats,
                    'recent_sales' => $recent_sales,
                    'system_activity' => $this->getSystemActivity()
                ]
            ]);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch dashboard data']);
        }
    }
    
    private function getSystemActivity() {
        // This would typically come from a system log table
        // For demo purposes, return sample data
        return [
            ['action' => 'Nueva orden: Gaming Pro X1', 'time' => '15 minutos', 'type' => 'order'],
            ['action' => 'Pago recibido: $45,000', 'time' => '23 minutos', 'type' => 'payment'],
            ['action' => 'Producto enviado: #1001', 'time' => '35 minutos', 'type' => 'shipping'],
            ['action' => 'Nuevo usuario registrado', 'time' => '42 minutos', 'type' => 'user'],
            ['action' => 'Componente actualizado: RTX 4090', 'time' => '1 hora', 'type' => 'inventory']
        ];
    }
    
    // Email notification helpers (implement with your email service)
    private function sendContactNotification($data) {
        // Implement email sending logic
        error_log("Contact form submitted: " . json_encode($data));
    }
    
    private function sendQuoteNotification($data, $quoteId) {
        // Implement email sending logic
        error_log("Quote request submitted: " . json_encode($data) . " ID: " . $quoteId);
    }
    
    // Placeholder methods for other endpoints
    public function getComponent($id) { echo json_encode(['success' => true, 'data' => []]); }
    public function createComponent() { echo json_encode(['success' => true]); }
    public function updateComponent($id) { echo json_encode(['success' => true]); }
    public function deleteComponent($id) { echo json_encode(['success' => true]); }
    public function getOrders() { echo json_encode(['success' => true, 'data' => []]); }
    public function updateOrder($id) { echo json_encode(['success' => true]); }
    public function getAnalytics() { echo json_encode(['success' => true, 'data' => []]); }
}

// Database schema creation (run once)
function createDatabaseSchema() {
    $db = Database::getInstance()->getConnection();
    
    $tables = [
        "CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(50) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            description TEXT,
            status ENUM('available', 'limited', 'preorder', 'discontinued') DEFAULT 'available',
            stock INT DEFAULT 0,
            image VARCHAR(255),
            gallery JSON,
            specifications JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_category (category),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        "CREATE TABLE IF NOT EXISTS components (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            brand VARCHAR(100) NOT NULL,
            type ENUM('cpu', 'gpu', 'ram', 'storage', 'motherboard', 'psu', 'case', 'cooling') NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            stock INT DEFAULT 0,
            specifications JSON,
            status ENUM('available', 'discontinued') DEFAULT 'available',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_type (type),
            INDEX idx_brand (brand)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        "CREATE TABLE IF NOT EXISTS product_components (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            component_id INT NOT NULL,
            quantity INT DEFAULT 1,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE,
            UNIQUE KEY unique_product_component (product_id, component_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        "CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customer_name VARCHAR(255) NOT NULL,
            customer_email VARCHAR(255) NOT NULL,
            customer_phone VARCHAR(50),
            product_id INT,
            total DECIMAL(10,2) NOT NULL,
            <?php
/**
 * COMPUZONE - BACKEND API ENDPOINTS
 * Professional PHP REST API with security and performance
 * @version 2.0.0
 */

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

// CORS configuration
$allowed_origins = [
    'https://compuzone.mx',
    'https://www.compuzone.mx',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set content type
header('Content-Type: application/json; charset=utf-8');

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Database configuration
class Database {
    private static $instance = null;
    private $connection;
    
    private $host = 'localhost';
    private $dbname = 'compuzone_db';
    private $username = 'compuzone_user';
    private $password = 'secure_password_2025';
    
    private function __construct() {
        try {
