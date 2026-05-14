// Cart management
const cart = {};

// Menu dishes data
const dishes = [
    { id: 'thieboudienne', name: 'Thiéboudienne', price: 10472, emoji: '🍛' },
    { id: 'yassa', name: 'Yassa Poulet', price: 9161, emoji: '🍗' },
    { id: 'mafe', name: 'Mafé', price: 9816, emoji: '🥘' },
    { id: 'ceebu-jen', name: 'Ceebu Jën', price: 11127, emoji: '🐟' },
    { id: 'riz-coco', name: 'Riz au Lait de Coco', price: 3923, emoji: '🥥' },
    { id: 'attieke', name: 'Attiéké', price: 3270, emoji: '🥔' },
    { id: 'salade', name: 'Salade Sénégalaise', price: 3923, emoji: '🥗' },
    { id: 'plantain', name: 'Plantain Frit', price: 2613, emoji: '🍌' },
    { id: 'soupe-poisson', name: 'Soupe de Poisson', price: 5231, emoji: '🍲' },
    { id: 'soupe-oignon', name: 'Soupe à l\'Oignon', price: 4578, emoji: '🧅' },
    { id: 'accras', name: 'Accras de Poisson', price: 3923, emoji: '🍟' },
    { id: 'boulettes', name: 'Boulettes de Viande', price: 3270, emoji: '🍖' },
    { id: 'jus-baobab', name: 'Jus de Baobab', price: 2613, emoji: '🥤' },
    { id: 'jus-gingembre', name: 'Jus de Gingembre', price: 2288, emoji: '🧃' },
    { id: 'thiakry', name: 'Thiakry', price: 3270, emoji: '🍮' },
    { id: 'cafe', name: 'Café Sénégalais', price: 1961, emoji: '☕' }
];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize order items display
    initializeOrderItems();

    // Navigation active state
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            navLinks.forEach(l => l.style.color = '');
            this.style.color = 'var(--primary-color)';
        });
    });

    // Contact form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Merci pour votre message! Nous vous recontacterons bientôt.');
            this.reset();
        });
    }

    // Order form submission
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const total = calculateTotal();
            if (total === 0) {
                alert('Veuillez ajouter des plats à votre commande!');
                return;
            }
            const formData = new FormData(this);
            alert(`Commande reçue! Total: ${total.toLocaleString('fr-FR')} FCFA\n\nNous vous confirmerons la livraison par email.`);
            cart = {};
            updateSummary();
            this.reset();
        });
    }

    // Clear cart button
    const clearCartBtn = document.getElementById('clearCart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            if (Object.keys(cart).length > 0) {
                cart = {};
                updateSummary();
                alert('Panier vidé!');
            }
        });
    }

    // Smooth scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        } else {
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
    });

    // Add animation to menu items on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const menuDishes = document.querySelectorAll('.dish');
    menuDishes.forEach(dish => {
        dish.style.opacity = '0';
        dish.style.transform = 'translateY(20px)';
        dish.style.transition = 'all 0.5s ease';
        observer.observe(dish);
    });
});

// Initialize order items display
function initializeOrderItems() {
    const orderItemsContainer = document.getElementById('orderItems');
    if (!orderItemsContainer) return;

    orderItemsContainer.innerHTML = dishes.map(dish => `
        <div class="order-item">
            <div class="order-item-image">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <rect fill="#FFE4B5" width="200" height="200"/>
                    <text x="100" y="100" font-size="80" text-anchor="middle" dominant-baseline="middle">${dish.emoji}</text>
                </svg>
            </div>
            <div class="order-item-details">
                <h4>${dish.name}</h4>
                <div class="order-item-price">${dish.price.toLocaleString('fr-FR')} FCFA</div>
                <div class="item-quantity">
                    <button type="button" onclick="updateQuantity('${dish.id}', -1)">-</button>
                    <input type="number" id="qty-${dish.id}" value="0" min="0" readonly>
                    <button type="button" onclick="updateQuantity('${dish.id}', 1)">+</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Update quantity
function updateQuantity(dishId, change) {
    const qtyInput = document.getElementById(`qty-${dishId}`);
    let currentQty = parseInt(qtyInput.value) || 0;
    currentQty = Math.max(0, currentQty + change);
    
    if (currentQty === 0) {
        delete cart[dishId];
    } else {
        cart[dishId] = currentQty;
    }
    
    qtyInput.value = currentQty;
    updateSummary();
}

// Update cart summary
function updateSummary() {
    const summaryContainer = document.getElementById('summaryItems');
    const totalPriceSpan = document.getElementById('totalPrice');
    
    if (Object.keys(cart).length === 0) {
        summaryContainer.innerHTML = '<p class="empty-cart">Votre panier est vide</p>';
        totalPriceSpan.textContent = '0';
        return;
    }

    let total = 0;
    const items = Object.entries(cart).map(([dishId, qty]) => {
        const dish = dishes.find(d => d.id === dishId);
        const itemTotal = dish.price * qty;
        total += itemTotal;
        
        return `
            <div class="summary-item">
                <span class="summary-item-name">${dish.name}</span>
                <span class="summary-item-qty">x${qty}</span>
                <span class="summary-item-price">${itemTotal.toLocaleString('fr-FR')} FCFA</span>
                <span class="summary-item-remove" onclick="removeFromCart('${dishId}')">×</span>
            </div>
        `;
    }).join('');

    summaryContainer.innerHTML = items;
    totalPriceSpan.textContent = total.toLocaleString('fr-FR');
}

// Remove from cart
function removeFromCart(dishId) {
    delete cart[dishId];
    document.getElementById(`qty-${dishId}`).value = '0';
    updateSummary();
}

// Calculate total
function calculateTotal() {
    let total = 0;
    Object.entries(cart).forEach(([dishId, qty]) => {
        const dish = dishes.find(d => d.id === dishId);
        total += dish.price * qty;
    });
    return total;
}
