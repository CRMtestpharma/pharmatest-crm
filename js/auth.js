// Authentication Configuration
const AUTH_CONFIG = {
    tokenKey: 'pharmatest_auth_token',
    refreshTokenKey: 'pharmatest_refresh_token',
    tokenExpiry: 3600, // 1 hour
    apiUrl: '/api/auth'
};

// User Roles and Permissions
const ROLES = {
    MEDICAL_REP: {
        level: 1,
        permissions: ['VIEW_ACCOUNTS', 'CREATE_ORDERS', 'CREATE_VISITS']
    },
    SALES_COORDINATOR: {
        level: 1,
        permissions: ['VIEW_ACCOUNTS', 'VIEW_ORDERS', 'CREATE_REPORTS']
    },
    DISTRICT_SALES_MANAGER: {
        level: 2,
        permissions: ['APPROVE_ORDERS', 'VIEW_TEAM_STATS', 'MANAGE_TEAM']
    },
    REGIONAL_SALES_MANAGER: {
        level: 3,
        permissions: ['MANAGE_DISTRICTS', 'VIEW_REGIONAL_STATS', 'APPROVE_SPECIAL_ORDERS']
    },
    KEY_ACCOUNT_MANAGER: {
        level: 2,
        permissions: ['MANAGE_KEY_ACCOUNTS', 'APPROVE_ORDERS', 'VIEW_ACCOUNT_STATS']
    },
    ADMIN: {
        level: 4,
        permissions: ['ALL']
    }
};

// Database Schema (SQL)
const DATABASE_SCHEMA = `
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    region VARCHAR(50),
    district VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts Table
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    address TEXT,
    region VARCHAR(50),
    district VARCHAR(50),
    assigned_rep_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HCPs Table
CREATE TABLE hcps (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id),
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(50),
    contact_number VARCHAR(20),
    email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    unit_price DECIMAL(10,2) NOT NULL,
    moh_discount DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    account_id INTEGER REFERENCES accounts(id),
    hcp_id INTEGER REFERENCES hcps(id),
    rep_id INTEGER REFERENCES users(id),
    total_amount DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    is_foc BOOLEAN DEFAULT false,
    total_amount DECIMAL(12,2) NOT NULL
);

-- Visits Table
CREATE TABLE visits (
    id SERIAL PRIMARY KEY,
    rep_id INTEGER REFERENCES users(id),
    account_id INTEGER REFERENCES accounts(id),
    hcp_id INTEGER REFERENCES hcps(id),
    visit_date DATE NOT NULL,
    visit_time TIME NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Targets Table
CREATE TABLE targets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_value DECIMAL(12,2) NOT NULL,
    achieved_value DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs Table
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_accounts_region ON accounts(region);
CREATE INDEX idx_accounts_district ON accounts(district);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_visits_date ON visits(visit_date);
CREATE INDEX idx_activity_logs_type ON activity_logs(activity_type);
`;

// Initialize the authentication system
const initAuth = () => {
    // Check for existing session
    const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
    if (token) {
        validateToken(token);
    } else {
        redirectToLogin();
    }
};

// Validate user credentials
const login = async (email, password) => {
    try {
        // In production, this would be an API call
        const response = await fetch(AUTH_CONFIG.apiUrl + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem(AUTH_CONFIG.tokenKey, data.token);
            localStorage.setItem(AUTH_CONFIG.refreshTokenKey, data.refreshToken);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Login failed:', error);
        return false;
    }
};

// Protect routes based on user role
const checkPermission = (requiredPermission) => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || !userData.role) {
        return false;
    }
    
    const userRole = ROLES[userData.role];
    return userRole.permissions.includes(requiredPermission) || 
           userRole.permissions.includes('ALL');
};
