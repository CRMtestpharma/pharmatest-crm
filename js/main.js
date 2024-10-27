// User roles and their corresponding dashboards
const userRoles = {
    'ADMIN': 'admin-dashboard.html',
    'MEDICAL_REP': 'dashboard.html',
    'MANAGER': 'manager-dashboard.html',
    'KAM': 'kam-dashboard.html'
};

// Test users for demonstration
const testUsers = {
    'test@pharmatest.com': {
        password: 'Test@2024',
        role: 'MEDICAL_REP',
        name: 'Test User'
    },
    'admin@pharmatest.com': {
        password: 'Admin@2024',
        role: 'ADMIN',
        name: 'Admin User'
    }
};

// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Check credentials
    if (testUsers[email] && testUsers[email].password === password) {
        // Store user info in session
        sessionStorage.setItem('user', JSON.stringify({
            email: email,
            role: testUsers[email].role,
            name: testUsers[email].name
        }));
        
        // Redirect to appropriate dashboard
        window.location.href = userRoles[testUsers[email].role];
    } else {
        alert('Invalid credentials. Please try again.');
    }
});

// Check if user is logged in
function checkAuth() {
    const user = sessionStorage.getItem('user');
    if (!user && !window.location.href.includes('index.html')) {
        window.location.href = 'index.html';
    }
}

// Handle logout
function logout() {
    sessionStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Initialize notifications
function initializeNotifications() {
    const notifications = [
        { title: 'New Order Approval', message: 'Order #123 needs your approval' },
        { title: 'Visit Reminder', message: 'Upcoming visit to King Fahd Hospital' },
        { title: 'Target Alert', message: '85% of monthly target achieved' }
    ];
    
    return notifications;
}

// Handle order creation
function createOrder(orderData) {
    // Validate order data
    if (!orderData.account || !orderData.products || !orderData.quantity) {
        return { success: false, message: 'Missing required fields' };
    }
    
    // Process order (demo functionality)
    console.log('Creating order:', orderData);
    return { success: true, message: 'Order created successfully' };
}

// Format currency
function formatCurrency(amount) {
    return `SAR ${amount.toLocaleString()}`;
}

// Calculate KPIs
function calculateKPIs() {
    return {
        totalSales: 2500000,
        coverage: 85,
        activeOrders: 45,
        visitCompletion: 92
    };
}

// Initialize dashboards
function initializeDashboard() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user) return;

    // Set user info
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => {
        el.textContent = user.name;
    });

    // Load KPIs
    const kpis = calculateKPIs();
    Object.keys(kpis).forEach(kpi => {
        const element = document.getElementById(kpi);
        if (element) {
            element.textContent = typeof kpis[kpi] === 'number' && kpi.includes('Sales') 
                ? formatCurrency(kpis[kpi]) 
                : kpis[kpi];
        }
    });

    // Load notifications
    const notifications = initializeNotifications();
    const notificationsList = document.getElementById('notificationsList');
    if (notificationsList) {
        notifications.forEach(notification => {
            const li = document.createElement('li');
            li.className = 'p-4 hover:bg-gray-50';
            li.innerHTML = `
                <h4 class="font-medium text-gray-900">${notification.title}</h4>
                <p class="text-sm text-gray-500">${notification.message}</p>
            `;
            notificationsList.appendChild(li);
        });
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initializeDashboard();
    
    // Handle logout button clicks
    const logoutButtons = document.querySelectorAll('.logout-button');
    logoutButtons.forEach(button => {
        button.addEventListener('click', logout);
    });
});
