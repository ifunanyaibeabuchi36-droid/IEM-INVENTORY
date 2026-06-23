// Auth Configuration (Mock Default Admin)
const AUTH_USER = "admin";
const AUTH_PASS = "password123";

// App State Core
let inventory = JSON.parse(localStorage.getItem('iem_inventory')) || [];
let isEditing = false;

// DOM Layout View toggles
const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');

// DOM Form Elements
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const formTitle = document.getElementById('form-title');
const inventoryForm = document.getElementById('inventory-form');

const productNameInput = document.getElementById('product-name');
const refNumberInput = document.getElementById('ref-number');
const quantityInput = document.getElementById('quantity');
const priceInput = document.getElementById('price');
const editIndexInput = document.getElementById('edit-index');

const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const logoutBtn = document.getElementById('logout-btn');

// DOM Table & Metrics Elements
const tbody = document.getElementById('inventory-tbody');
const emptyState = document.getElementById('empty-state');
const statProducts = document.getElementById('stat-total-products');
const statStock = document.getElementById('stat-total-stock');
const statValue = document.getElementById('stat-total-value');

// --- AUTHENTICATION PROCESS ---
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;

    if(user === AUTH_USER && pass === AUTH_PASS) {
        loginError.classList.add('hidden');
        loginForm.reset();
        
        // Save simple auth session state
        sessionStorage.setItem('iem_authenticated', 'true');
        showDashboard();
    } else {
        loginError.classList.remove('hidden');
    }
});

logoutBtn.addEventListener('click', function() {
    sessionStorage.removeItem('iem_authenticated');
    showLogin();
});

function checkAuthSession() {
    if (sessionStorage.getItem('iem_authenticated') === 'true') {
        showDashboard();
    } else {
        showLogin();
    }
}

function showDashboard() {
    loginContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');
    renderSystem();
}

function showLogin() {
    appContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
}


// --- INVENTORY MANAGEMENT ENGINE ---
inventoryForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const productData = {
        name: productNameInput.value.trim(),
        ref: refNumberInput.value.trim(),
        quantity: parseInt(quantityInput.value),
        price: parseFloat(priceInput.value).toFixed(2)
    };

    if (isEditing) {
        const index = editIndexInput.value;
        inventory[index] = productData;
        resetFormState();
    } else {
        inventory.push(productData);
    }

    saveAndRefresh();
    inventoryForm.reset();
});

function renderSystem() {
    tbody.innerHTML = '';
    let totalItems = 0;
    let totalValue = 0;

    if (inventory.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        
        inventory.forEach((product, index) => {
            const qty = Number(product.quantity);
            const prc = Number(product.price);
            
            totalItems += qty;
            totalValue += (qty * prc);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${escapeHTML(product.name)}</strong></td>
                <td>${escapeHTML(product.ref)}</td>
                <td>${qty}</td>
                <td>₦${prc.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td>
                    <button class="btn-edit" onclick="editProduct(${index})">Edit</button>
                    <button class="btn-delete" onclick="deleteProduct(${index})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Update Dashboard Metrics Cards
    statProducts.textContent = inventory.length;
    statStock.textContent = totalItems;
    statValue.textContent = `₦${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

function editProduct(index) {
    isEditing = true;
    const product = inventory[index];
    
    productNameInput.value = product.name;
    refNumberInput.value = product.ref;
    quantityInput.value = product.quantity;
    priceInput.value = product.price;
    editIndexInput.value = index;
    
    formTitle.textContent = "Edit Product Details";
    submitBtn.textContent = 'Update Product';
    cancelBtn.classList.remove('hidden');
    productNameInput.focus();
}

cancelBtn.addEventListener('click', resetFormState);

function resetFormState() {
    isEditing = false;
    inventoryForm.reset();
    formTitle.textContent = "Add New Product";
    submitBtn.textContent = 'Add Product';
    cancelBtn.classList.add('hidden');
}

function deleteProduct(index) {
    if (confirm('Are you sure you want to permanently delete this product?')) {
        inventory.splice(index, 1);
        if (isEditing && editIndexInput.value == index) {
            resetFormState();
        }
        saveAndRefresh();
    }
}

function saveAndRefresh() {
    localStorage.setItem('iem_inventory', JSON.stringify(inventory));
    renderSystem();
}

function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// Global App Initialization
document.addEventListener('DOMContentLoaded', checkAuthSession);
