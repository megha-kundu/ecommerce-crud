// node-service/js/cart.js

const API_BASE = 'http://localhost:3000/api/cart';

// 1. Beautiful pop-up toast notification
function showToast(message, isSuccess = true) {
    let toast = document.getElementById('toast');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }

    toast.innerText = message;

    // Set explicit visual styling overrides
    toast.style.setProperty('position', 'fixed', 'important');
    toast.style.setProperty('bottom', '30px', 'important');
    toast.style.setProperty('right', '30px', 'important');
    toast.style.setProperty('background-color', isSuccess ? '#2ed573' : '#ff4757', 'important');
    toast.style.setProperty('color', 'white', 'important');
    toast.style.setProperty('padding', '15px 30px', 'important');
    toast.style.setProperty('border-radius', '8px', 'important');
    toast.style.setProperty('font-weight', 'bold', 'important');
    toast.style.setProperty('box-shadow', '0 6px 20px rgba(0,0,0,0.2)', 'important');
    toast.style.setProperty('z-index', '999999', 'important');
    toast.style.setProperty('display', 'block', 'important');
    toast.style.setProperty('opacity', '1', 'important');

    setTimeout(() => {
        toast.style.setProperty('display', 'none', 'important');
    }, 3000);
}

// 2. Function to add an item to the MySQL cart table
async function addItemToCart(userId, productId, quantity = 1) {
    try {
        const response = await fetch(`${API_BASE}/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                product_id: productId,
                quantity: quantity
            })
        });
        const data = await response.json();
        showToast(data.message || "Item added to cart! 🛒");
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast("Failed to add item.", false);
    }
}

// 3. Remove an item from the MySQL cart table
async function removeItemFromCart(userId, productId) {
    try {
        const response = await fetch(`${API_BASE}/remove`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                product_id: productId
            })
        });
        showToast("Item removed from cart.");
        renderCartDisplay(userId, 'cartDisplayGrid');
    } catch (error) {
        console.error('Error removing item:', error);
        showToast("Failed to remove item.", false);
    }
}

// 4. Load and render items on your cart page
async function renderCartDisplay(userId, containerId) {
    try {
        const response = await fetch(`${API_BASE}/${userId}`);
        const cartItems = await response.json();

        const container = document.getElementById(containerId);
        const summaryBlock = document.getElementById('cartSummaryBlock');
        const totalWindow = document.getElementById('totalPriceWindow');

        if (!container) return;

        if (cartItems.length === 0) {
            container.innerHTML = '<p class="empty-message">Your shopping cart is empty.</p>';
            if (summaryBlock) summaryBlock.style.display = 'none';
            return;
        }

        let totalPrice = 0;

        container.innerHTML = cartItems.map(item => {
            const priceVal = item.price ? item.price : 49.99;
            const itemPrice = Number(priceVal);
            const itemQty = Number(item.quantity || 1);
            totalPrice += itemPrice * itemQty;

            return `
                <div class="cart-item" style="display: flex; justify-content: space-between; background: white; padding: 15px; margin-bottom: 10px; border-radius: 8px;">
                    <div class="item-details">
                        <h4>${item.name || 'Fashion Item'}</h4>
                        <p>Quantity: ${itemQty} x $${itemPrice.toFixed(2)}</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <div class="price" style="font-weight: bold; color: #ff4757;">$${(itemPrice * itemQty).toFixed(2)}</div>
                        <button onclick="removeItemFromCart(${userId}, ${item.product_id})" 
                                style="background: #ff4757; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">
                            Remove
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        if (totalWindow) totalWindow.innerText = `$${totalPrice.toFixed(2)}`;
        if (summaryBlock) summaryBlock.style.display = 'block';

    } catch (error) {
        console.error('Error loading cart:', error);
        container.innerHTML = '<p class="empty-message">❌ Error loading cart rows.</p>';
    }
}
