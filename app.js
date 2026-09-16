/* ==========================================================================
   CYBERVERSE 3D GAMING STORE - MAIN JAVASCRIPT APP (FULLY FUNCTIONAL)
   ========================================================================== */

// Estado global de la aplicación
let currentGenre = 'all';
let searchQuery = '';
let currentSort = 'featured';
let cart = JSON.parse(localStorage.getItem('cyberverse_cart')) || [];
let activePromoDiscount = 0;
let soundEnabled = true;
let audioCtx = null;
let currentCurrency = 'COP';
let particlesEnabled = true;
let tiltEnabled = true;

// Helper API: localhost (XAMPP/PHP) vs Vercel (Functions JS + Supabase)
// - file:// o localhost/cyber-game-store -> PHP local
// - localhost genérico -> api/*.php
// - Vercel / cualquier hosting -> /api/* (Functions JS con Supabase)
function getApiUrl(filePhp) {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';
    const isFile = window.location.protocol === 'file:';
    if (isFile) return 'http://localhost/cyber-game-store/api/' + filePhp;
    if (isLocalhost) {
        if (window.location.pathname.includes('cyber-game-store')) {
            return 'http://localhost/cyber-game-store/api/' + filePhp;
        }
        return 'api/' + filePhp;
    }
    return '/api/' + filePhp.replace('.php', '');
}

// Inicialización de la tienda
document.addEventListener('DOMContentLoaded', () => {
    init3DCanvas();
    renderProducts();
    initEventListeners();
    updateCartUI();
    init3DTiltEffects();
    updateUserAuthUI();
});

/* ==========================================================================
   FORMATEADOR DE MONEDAS
   ========================================================================== */
function formatCurrency(amountCOP) {
    const currencyObj = CURRENCIES[currentCurrency] || CURRENCIES.COP;
    return currencyObj.format(amountCOP);
}

/* ==========================================================================
   1. SINTETIZADOR DE SONIDOS FUTURISTAS
   ========================================================================== */
function playSound(type) {
    if (!soundEnabled) return;
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'add') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.08);
            osc.frequency.setValueAtTime(783.99, now + 0.16);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
        } else if (type === 'success') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(554.37, now + 0.1);
            osc.frequency.setValueAtTime(659.25, now + 0.2);
            osc.frequency.setValueAtTime(880, now + 0.3);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        }
    } catch (e) {
        console.warn('Audio Context API no inicializado aún.');
    }
}

/* ==========================================================================
   2. CANVAS DE FONDO 3D INTERACTIVO
   ========================================================================== */
function init3DCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = 120;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            z: Math.random() * width,
            radius: Math.random() * 2 + 0.5,
            color: i % 3 === 0 ? '#00f0ff' : (i % 3 === 1 ? '#ff0055' : '#8a2be2'),
            speed: Math.random() * 0.8 + 0.2
        });
    }

    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - width / 2) * 0.05;
        mouseY = (e.clientY - height / 2) * 0.05;
    });

    function animate() {
        ctx.fillStyle = 'rgba(5, 7, 15, 0.25)';
        ctx.fillRect(0, 0, width, height);

        if (particlesEnabled) {
            particles.forEach(p => {
                p.z -= p.speed;
                if (p.z <= 0) {
                    p.z = width;
                    p.x = Math.random() * width;
                    p.y = Math.random() * height;
                }

                const k = 258 / p.z;
                const px = (p.x - width / 2 + mouseX) * k + width / 2;
                const py = (p.y - height / 2 + mouseY) * k + height / 2;
                const size = Math.max(0.5, (1 - p.z / width) * 3.5);

                ctx.beginPath();
                ctx.arc(px, py, size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = p.color;
                ctx.fill();
            });
        }

        requestAnimationFrame(animate);
    }
    animate();
}

/* ==========================================================================
   3. RENDERIZADO DEL CATÁLOGO & FILTROS
   ========================================================================== */
function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    let filtered = PRODUCTS.filter(product => {
        const matchesGenre = currentGenre === 'all' || product.genre === currentGenre;
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              product.genreName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              product.platform.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesGenre && matchesSearch;
    });

    if (currentSort === 'price-low') {
        filtered.sort((a, b) => a.priceCOP - b.priceCOP);
    } else if (currentSort === 'price-high') {
        filtered.sort((a, b) => b.priceCOP - a.priceCOP);
    } else if (currentSort === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px; color: var(--text-muted);">
                <i class="fa-solid fa-ghost" style="font-size: 3.5rem; margin-bottom: 15px; color: var(--accent-magenta);"></i>
                <h3 style="color: #fff; font-size: 1.5rem;">No se encontraron juegos 3D</h3>
                <p>Intenta cambiar el género seleccionado o tu término de búsqueda.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(product => `
        <div class="product-card glass-panel" data-id="${product.id}">
            <div class="card-image-wrapper">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
                <span class="card-badge"><i class="fa-solid fa-cube"></i> ${product.badge}</span>
                <button class="card-quick-btn" onclick="openQuickView(${product.id})" title="Vista Rápida & Reseñas">
                    <i class="fa-solid fa-eye"></i>
                </button>
            </div>

            <div class="card-body">
                <div>
                    <div class="card-meta">
                        <span class="card-genre"><i class="fa-solid fa-tag"></i> ${product.genreName}</span>
                        <span class="card-rating" onclick="openQuickView(${product.id})" style="cursor: pointer;" title="Ver Reseñas">
                            <i class="fa-solid fa-star"></i> ${product.rating} (${product.reviewsCount})
                        </span>
                    </div>

                    <h3 class="card-title" onclick="openQuickView(${product.id})" style="cursor: pointer;">${product.title}</h3>
                    <p class="card-platform"><i class="fa-solid fa-display"></i> ${product.platform}</p>
                </div>

                <div class="card-footer">
                    <div class="card-price-box">
                        ${product.originalPriceCOP > product.priceCOP ? `<span class="original-price">${formatCurrency(product.originalPriceCOP)}</span>` : ''}
                        <span class="current-price">${formatCurrency(product.priceCOP)}</span>
                    </div>

                    <button class="add-cart-btn" onclick="addToCart(${product.id})">
                        <i class="fa-solid fa-cart-plus"></i> Añadir
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    init3DTiltEffects();
}

/* ==========================================================================
   4. EFECTO 3D TILT
   ========================================================================== */
function init3DTiltEffects() {
    const cards = document.querySelectorAll('.product-card, .hero-3d-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            if (!tiltEnabled) return;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -12;
            const rotateY = ((x - centerX) / centerX) * 12;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
}

/* ==========================================================================
   5. EVENT LISTENERS
   ========================================================================== */
function initEventListeners() {
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) {
        currencySelect.addEventListener('change', (e) => {
            playSound('click');
            currentCurrency = e.target.value;
            showToast(`Moneda cambiada a ${currentCurrency}`, 'fa-coins');
            renderProducts();
            updateCartUI();
            updateCheckoutTotals();
        });
    }

    document.querySelectorAll('.genre-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            playSound('click');
            document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentGenre = btn.getAttribute('data-genre');
            renderProducts();
        });
    });

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderProducts();
        });
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderProducts();
        });
    }

    const cartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartDrawer = document.getElementById('cart-drawer');

    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            playSound('click');
            cartDrawer.classList.add('active');
            cartOverlay.classList.add('active');
        });
    }

    if (closeCartBtn && cartOverlay) {
        const closeCart = () => {
            playSound('click');
            cartDrawer.classList.remove('active');
            cartOverlay.classList.remove('active');
        };
        closeCartBtn.addEventListener('click', closeCart);
        cartOverlay.addEventListener('click', closeCart);
    }

    const promoBtn = document.getElementById('apply-promo-btn');
    if (promoBtn) {
        promoBtn.addEventListener('click', applyPromoCode);
    }

    const heroPromoBtn = document.getElementById('hero-promo-btn');
    if (heroPromoBtn) {
        heroPromoBtn.addEventListener('click', () => {
            document.getElementById('promo-input').value = 'GAMER2026';
            applyPromoCode();
            cartDrawer.classList.add('active');
            cartOverlay.classList.add('active');
        });
    }

    const startCheckoutBtn = document.getElementById('start-checkout-btn');
    const closeCheckoutBtn = document.getElementById('close-checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');

    if (startCheckoutBtn) {
        startCheckoutBtn.addEventListener('click', () => {
            playSound('click');
            if (cart.length === 0) {
                showToast('¡Tu carrito está vacío!', 'fa-triangle-exclamation');
                return;
            }
            cartDrawer.classList.remove('active');
            cartOverlay.classList.remove('active');
            checkoutModal.classList.add('active');
            updateCheckoutTotals();
        });
    }

    if (closeCheckoutBtn && checkoutModal) {
        closeCheckoutBtn.addEventListener('click', () => {
            playSound('click');
            checkoutModal.classList.remove('active');
        });
    }

    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            soundToggle.innerHTML = soundEnabled ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>';
            soundToggle.style.color = soundEnabled ? 'var(--accent-cyan)' : 'var(--text-muted)';
            showToast(soundEnabled ? 'Efectos de sonido activados' : 'Efectos de sonido desactivados', 'fa-volume-high');
        });
    }

    document.querySelectorAll('.payment-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            playSound('click');
            document.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.payment-content').forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    const inputCardNum = document.getElementById('input-card-num');
    const inputCardName = document.getElementById('input-card-name');
    const inputCardExp = document.getElementById('input-card-exp');

    if (inputCardNum) {
        inputCardNum.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '').substring(0, 16);
            let formatted = val.match(/.{1,4}/g)?.join(' ') || '•••• •••• •••• ••••';
            document.getElementById('card-num-preview').innerText = formatted;
        });
    }

    if (inputCardName) {
        inputCardName.addEventListener('input', (e) => {
            document.getElementById('card-name-preview').innerText = e.target.value.toUpperCase() || 'GAMER PRO';
        });
    }

    if (inputCardExp) {
        inputCardExp.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length >= 2) {
                val = val.substring(0, 2) + '/' + val.substring(2, 4);
            }
            e.target.value = val;
            document.getElementById('card-exp-preview').innerText = val || '12/28';
        });
    }
}

/* ==========================================================================
   6. GESTIÓN DEL CARRITO
   ========================================================================== */
function addToCart(productId) {
    playSound('add');
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = cart.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    showToast(`¡"${product.title}" añadido al carrito!`, 'fa-cart-plus');

    const cartBadge = document.getElementById('cart-count');
    if (cartBadge) {
        cartBadge.style.transform = 'scale(1.4)';
        setTimeout(() => cartBadge.style.transform = 'scale(1)', 200);
    }
}

function updateQuantity(productId, delta) {
    playSound('click');
    const index = cart.findIndex(item => item.id === productId);
    if (index > -1) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart();
        updateCartUI();
    }
}

function removeFromCart(productId) {
    playSound('click');
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    showToast('Producto eliminado del carrito', 'fa-trash-can');
}

function saveCart() {
    localStorage.setItem('cyberverse_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const countBadge = document.getElementById('cart-count');
    const cartContainer = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('cart-subtotal');
    const discountEl = document.getElementById('cart-discount');
    const totalEl = document.getElementById('cart-total');

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (countBadge) countBadge.innerText = totalCount;

    if (cart.length === 0) {
        if (cartContainer) {
            cartContainer.innerHTML = `
                <div class="cart-empty-msg">
                    <i class="fa-solid fa-cart-flatbed"></i>
                    <p>Tu carrito está totalmente vacío</p>
                    <span style="font-size: 0.85rem; color: var(--text-muted);">¡Explora el catálogo y añade tus juegos 3D!</span>
                </div>
            `;
        }
        if (subtotalEl) subtotalEl.innerText = formatCurrency(0);
        if (discountEl) discountEl.innerText = formatCurrency(0);
        if (totalEl) totalEl.innerText = formatCurrency(0);
        return;
    }

    const subtotalCOP = cart.reduce((sum, item) => sum + (item.priceCOP * item.quantity), 0);
    const discountAmountCOP = subtotalCOP * activePromoDiscount;
    const finalTotalCOP = subtotalCOP - discountAmountCOP;

    if (cartContainer) {
        cartContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">${formatCurrency(item.priceCOP)}</div>
                    <div class="cart-qty-controls">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span style="font-size: 0.9rem; font-family: var(--font-heading);">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="cart-remove-btn" onclick="removeFromCart(${item.id})" title="Eliminar">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `).join('');
    }

    if (subtotalEl) subtotalEl.innerText = formatCurrency(subtotalCOP);
    if (discountEl) discountEl.innerText = `-${formatCurrency(discountAmountCOP)}`;
    if (totalEl) totalEl.innerText = formatCurrency(finalTotalCOP);
}

function applyPromoCode() {
    const input = document.getElementById('promo-input');
    if (!input) return;

    const code = input.value.trim().toUpperCase();
    if (code === 'GAMER2026') {
        activePromoDiscount = 0.20;
        playSound('success');
        showToast('¡Cupón GAMER2026 Aplicado! (20% Descuento)', 'fa-percent');
        updateCartUI();
    } else {
        showToast('Cupón inválido o expirado', 'fa-circle-xmark');
    }
}

function updateCheckoutTotals() {
    const subtotalCOP = cart.reduce((sum, item) => sum + (item.priceCOP * item.quantity), 0);
    const finalTotalCOP = subtotalCOP * (1 - activePromoDiscount);

    document.querySelectorAll('.checkout-total-val').forEach(el => {
        el.innerText = formatCurrency(finalTotalCOP);
    });
}

/* ==========================================================================
   7. PASARELA DE PAGO
   ========================================================================== */
async function processPayment(methodName) {
    if (cart.length === 0) {
        showToast('El carrito está vacío', 'fa-circle-xmark');
        return;
    }

    playSound('success');

    const subtotalCOP = cart.reduce((sum, item) => sum + (item.priceCOP * item.quantity), 0);
    const discountAmountCOP = subtotalCOP * activePromoDiscount;
    const finalTotalCOP = subtotalCOP - discountAmountCOP;

    const customerName = document.getElementById('input-customer-name')?.value || document.getElementById('input-card-name')?.value || 'Juan Pérez';
    const customerEmail = document.getElementById('input-customer-email')?.value || 'juan.perez@gmail.com';
    const cardNum = document.getElementById('input-card-num')?.value || '4532 8901 2345 6789';
    const cardExp = document.getElementById('input-card-exp')?.value || '12/28';

    const payload = {
        usuario_id: currentUser ? currentUser.id : null,
        metodo: methodName,
        nombre: customerName,
        email: customerEmail,
        totalCOP: finalTotalCOP,
        descuentoCOP: discountAmountCOP,
        items: cart,
        tarjeta: {
            numero: cardNum,
            nombre: customerName,
            exp: cardExp
        }
    };

    let orderRefCode = '#CV-' + Math.floor(10000 + Math.random() * 90000);

    // Guardar la venta: local usa PHP/MySQL, Vercel usa Functions/Supabase
    try {
        const apiUrl = getApiUrl('process_payment.php');

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.success) {
            orderRefCode = result.codigo_referencia;
            showToast('¡Venta guardada exitosamente en Supabase!', 'fa-database');
        } else {
            console.error('Error de API MySQL:', result.message);
            showToast('Error al registrar venta: ' + result.message, 'fa-triangle-exclamation');
        }
    } catch (e) {
        console.error('Error al conectar con la API de MySQL:', e);
        if (window.location.protocol === 'file:') {
            alert('📌 Para registrar ventas en MySQL (XAMPP), debes abrir la tienda en tu navegador desde:\n\nhttp://localhost/cyber-game-store');
        } else {
            showToast('Error de conexión con la base de datos XAMPP', 'fa-triangle-exclamation');
        }
    }

    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal) checkoutModal.classList.remove('active');

    document.getElementById('receipt-order-id').innerText = orderRefCode;
    document.getElementById('receipt-method').innerText = methodName;
    document.getElementById('receipt-total').innerText = formatCurrency(finalTotalCOP);

    cart = [];
    activePromoDiscount = 0;
    saveCart();
    updateCartUI();

    const confirmModal = document.getElementById('confirmation-modal');
    if (confirmModal) confirmModal.classList.add('active');
}

function closeConfirmation() {
    playSound('click');
    const confirmModal = document.getElementById('confirmation-modal');
    if (confirmModal) confirmModal.classList.remove('active');
}

function copyWallet() {
    playSound('click');
    const walletText = document.getElementById('wallet-address-text').innerText;
    navigator.clipboard.writeText(walletText).then(() => {
        showToast('¡Dirección de Wallet copiada al portapapeles!', 'fa-copy');
    });
}

/* ==========================================================================
   8. VISTA RÁPIDA & RESEÑAS
   ========================================================================== */
function openQuickView(productId) {
    playSound('click');
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('quick-modal');
    const body = document.getElementById('quick-modal-body');

    const reviewsHtml = (product.reviews && product.reviews.length > 0) ? product.reviews.map(rev => `
        <div class="review-card glass-panel" style="padding: 15px; margin-bottom: 12px; border-left: 3px solid var(--accent-cyan);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 28px; height: 28px; background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold;">
                        ${rev.author.charAt(0)}
                    </div>
                    <strong style="color: #fff; font-size: 0.95rem;">${rev.author}</strong>
                    ${rev.verified ? `<span style="font-size: 0.75rem; background: rgba(0, 255, 136, 0.15); color: var(--accent-green); padding: 2px 6px; border-radius: 4px;"><i class="fa-solid fa-check-double"></i> Compra Verificada</span>` : ''}
                </div>
                <span style="font-size: 0.8rem; color: var(--text-muted);">${rev.date}</span>
            </div>
            <div style="color: var(--accent-gold); font-size: 0.85rem; margin-bottom: 6px;">
                ${'★'.repeat(Math.floor(rev.rating))}${'☆'.repeat(5 - Math.floor(rev.rating))} (${rev.rating})
            </div>
            <p style="color: var(--text-secondary); font-size: 0.9rem; font-style: italic;">"${rev.comment}"</p>
        </div>
    `).join('') : '<p style="color: var(--text-muted); font-size: 0.9rem;">Sé el primero en dejar una reseña para este videojuego 3D.</p>';

    body.innerHTML = `
        <button class="modal-close-btn" onclick="closeQuickView()"><i class="fa-solid fa-xmark"></i></button>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: start; margin-bottom: 30px;">
            <div style="border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border-cyan);">
                <img src="${product.image}" alt="${product.title}" style="width: 100%; height: 320px; object-fit: cover;">
            </div>

            <div>
                <span class="card-badge" style="position: static; margin-bottom: 10px; display: inline-block;">${product.badge}</span>
                <h2 style="font-size: 1.8rem; margin-bottom: 8px;">${product.title}</h2>
                <div style="color: var(--accent-purple); font-family: var(--font-cyber); font-weight: bold; margin-bottom: 15px;">
                    GÉNERO: ${product.genreName.toUpperCase()} | ${product.platform}
                </div>
                <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 0.95rem;">${product.description}</p>

                <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: var(--radius-sm); margin-bottom: 20px;">
                    <div style="font-family: var(--font-cyber); color: var(--accent-cyan); font-weight: bold; margin-bottom: 5px;">REQUISITOS MÍNIMOS (3D):</div>
                    <ul style="list-style: none; font-size: 0.85rem; color: var(--text-muted); display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                        <li><i class="fa-solid fa-microchip"></i> OS: ${product.specs.os}</li>
                        <li><i class="fa-solid fa-hard-drive"></i> GPU: ${product.specs.gpu}</li>
                        <li><i class="fa-solid fa-memory"></i> RAM: ${product.specs.ram}</li>
                        <li><i class="fa-solid fa-server"></i> Espacio: ${product.specs.storage}</li>
                    </ul>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="current-price" style="font-size: 1.6rem;">${formatCurrency(product.priceCOP)}</div>
                    <button class="btn-primary" onclick="addToCart(${product.id}); closeQuickView();">
                        <i class="fa-solid fa-cart-plus"></i> AÑADIR AL CARRITO
                    </button>
                </div>
            </div>
        </div>

        <hr style="border-color: var(--border-glass); margin-bottom: 25px;">
        <div>
            <h3 style="color: var(--accent-cyan); font-size: 1.3rem; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-comments"></i> Reseñas Verificadas (${product.reviews ? product.reviews.length : 0})
            </h3>
            
            <div id="reviews-list-container" style="max-height: 250px; overflow-y: auto; padding-right: 10px; margin-bottom: 25px;">
                ${reviewsHtml}
            </div>

            <div style="background: rgba(0, 240, 255, 0.04); border: 1px solid var(--border-glass); padding: 20px; border-radius: var(--radius-md);">
                <h4 style="margin-bottom: 12px; color: #fff;"><i class="fa-solid fa-pen"></i> Escribir una Reseña Verificada</h4>
                <form onsubmit="event.preventDefault(); submitUserReview(${product.id});">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 12px;">
                        <input type="text" id="rev-name" class="form-input" placeholder="Tu Apodo / GamerTag" required>
                        <select id="rev-rating" class="form-input" style="font-family: var(--font-cyber); font-weight: bold;" required>
                            <option value="5">⭐⭐⭐⭐⭐ (5 / 5)</option>
                            <option value="4">⭐⭐⭐⭐ (4 / 5)</option>
                            <option value="3">⭐⭐⭐ (3 / 5)</option>
                            <option value="2">⭐⭐ (2 / 5)</option>
                            <option value="1">⭐ (1 / 5)</option>
                        </select>
                    </div>
                    <textarea id="rev-comment" class="form-input" rows="2" placeholder="Escribe tu opinión sobre los gráficos 3D, jugabilidad..." required style="resize: none; margin-bottom: 12px;"></textarea>
                    <button type="submit" class="btn-secondary" style="width: 100%;">
                        <i class="fa-solid fa-paper-plane"></i> Publicar Reseña Verificada
                    </button>
                </form>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

function submitUserReview(productId) {
    playSound('success');
    const nameInput = document.getElementById('rev-name');
    const ratingSelect = document.getElementById('rev-rating');
    const commentInput = document.getElementById('rev-comment');

    if (!nameInput || !commentInput) return;

    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    if (!product.reviews) product.reviews = [];

    const newReview = {
        author: nameInput.value.trim() || "Gamer_Anonimo",
        rating: parseFloat(ratingSelect.value),
        date: "Hoy",
        verified: true,
        comment: commentInput.value.trim()
    };

    product.reviews.unshift(newReview);
    product.reviewsCount += 1;

    showToast('¡Tu reseña verificada ha sido publicada!', 'fa-circle-check');
    openQuickView(productId);
    renderProducts();
}

function closeQuickView() {
    playSound('click');
    document.getElementById('quick-modal').classList.remove('active');
}

/* ==========================================================================
   9. MODALES ADICIONALES (SOPORTE 24/7, RESEÑAS COMUNIDAD, PASARELA GUÍA)
   ========================================================================== */
function openSupportModal() {
    playSound('click');
    document.getElementById('support-modal').classList.add('active');
}

function closeSupportModal() {
    playSound('click');
    document.getElementById('support-modal').classList.remove('active');
}

function sendQuickSupportMsg(msg) {
    document.getElementById('support-msg-input').value = msg;
    submitSupportMsg();
}

function submitSupportMsg() {
    const input = document.getElementById('support-msg-input');
    const chatBox = document.getElementById('support-chat-box');
    if (!input || !chatBox) return;

    const userText = input.value.trim();
    if (!userText) return;

    playSound('click');

    // Mensaje de usuario
    chatBox.innerHTML += `
        <div style="background: rgba(255,255,255,0.08); padding: 10px 14px; border-radius: 12px; align-self: flex-end; max-width: 85%; font-size: 0.9rem; color: #fff;">
            <strong>TÚ:</strong> ${userText}
        </div>
    `;

    input.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    // Respuesta inteligente simulada del bot
    setTimeout(() => {
        playSound('add');
        let botReply = "¡Excelente pregunta! Recuerda que todos nuestros juegos 3D son licencias digitales globales con activación inmediata al momento del pago.";
        
        const lower = userText.toLowerCase();
        if (lower.includes('clave') || lower.includes('recibo')) {
            botReply = "Una vez completado el pago en la pasarela, tu clave de juego en 3D se muestra en el recibo en pantalla y se envía a tu correo registrado.";
        } else if (lower.includes('nequi') || lower.includes('pse') || lower.includes('pago')) {
            botReply = "Aceptamos PSE, Nequi, Bancolombia, tarjetas de crédito (Visa/Mastercard), Bitcoin/Crypto, PayPal y Apple Pay con total seguridad de 256-bit.";
        } else if (lower.includes('cupón') || lower.includes('descuento')) {
            botReply = "Usa el cupón secreto <strong>GAMER2026</strong> en el carrito de compras para obtener un 20% de descuento directo.";
        }

        chatBox.innerHTML += `
            <div style="background: rgba(0, 240, 255, 0.15); border: 1px solid var(--border-cyan); padding: 10px 14px; border-radius: 12px; align-self: flex-start; max-width: 85%; font-size: 0.9rem;">
                <strong>CYBER-BOT AI:</strong> ${botReply}
            </div>
        `;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 600);
}

function openCommunityReviewsModal() {
    playSound('click');
    const container = document.getElementById('all-community-reviews');
    if (container) {
        let allReviews = [];
        PRODUCTS.forEach(p => {
            if (p.reviews) {
                p.reviews.forEach(r => {
                    allReviews.push({ ...r, gameTitle: p.title, gameImage: p.image });
                });
            }
        });

        container.innerHTML = allReviews.map(r => `
            <div class="glass-panel" style="padding: 18px; border-left: 4px solid var(--accent-cyan); display: flex; gap: 15px; align-items: center;">
                <img src="${r.gameImage}" alt="${r.gameTitle}" style="width: 70px; height: 70px; border-radius: var(--radius-sm); object-fit: cover;">
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <strong style="color: var(--accent-cyan);">${r.gameTitle}</strong>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">${r.date}</span>
                    </div>
                    <div style="font-size: 0.85rem; color: #fff; margin-bottom: 4px;">
                        <strong>${r.author}</strong> ${r.verified ? `<span style="color: var(--accent-green); font-size: 0.75rem;"><i class="fa-solid fa-shield-check"></i> Verificada</span>` : ''}
                    </div>
                    <div style="color: var(--accent-gold); font-size: 0.8rem; margin-bottom: 4px;">
                        ${'★'.repeat(Math.floor(r.rating))} (${r.rating}/5)
                    </div>
                    <p style="font-size: 0.88rem; color: var(--text-secondary); font-style: italic;">"${r.comment}"</p>
                </div>
            </div>
        `).join('');
    }

    document.getElementById('community-reviews-modal').classList.add('active');
}

function closeCommunityReviewsModal() {
    playSound('click');
    document.getElementById('community-reviews-modal').classList.remove('active');
}

function openPaymentGuideModal() {
    playSound('click');
    document.getElementById('payment-guide-modal').classList.add('active');
}

function closePaymentGuideModal() {
    playSound('click');
    document.getElementById('payment-guide-modal').classList.remove('active');
}

function openGraphicsModal() {
    playSound('click');
    document.getElementById('graphics-modal').classList.add('active');
}

function closeGraphicsModal() {
    playSound('click');
    document.getElementById('graphics-modal').classList.remove('active');
}

function toggleParticles() {
    playSound('click');
    particlesEnabled = !particlesEnabled;
    const btn = document.getElementById('toggle-particles-btn');
    if (btn) {
        btn.innerText = particlesEnabled ? 'ACTIVADO' : 'DESACTIVADO';
        btn.style.color = particlesEnabled ? 'var(--accent-green)' : 'var(--accent-magenta)';
    }
    showToast(particlesEnabled ? 'Fondo 3D de Partículas Activado' : 'Fondo de Partículas Pausado', 'fa-cube');
}

function toggleTilt() {
    playSound('click');
    tiltEnabled = !tiltEnabled;
    const btn = document.getElementById('toggle-tilt-btn');
    if (btn) {
        btn.innerText = tiltEnabled ? 'ACTIVADO' : 'DESACTIVADO';
        btn.style.color = tiltEnabled ? 'var(--accent-green)' : 'var(--accent-magenta)';
    }
    showToast(tiltEnabled ? 'Efecto 3D Tilt Activado' : 'Efecto 3D Tilt Desactivado', 'fa-cube');
}

function openSocialLink(platformName) {
    playSound('click');
    showToast(`¡Conectado con la comunidad oficial de ${platformName}!`, 'fa-users');
}

/* ==========================================================================
   10. SISTEMA DE TOAST NOTIFICATIONS
   ========================================================================== */
function showToast(message, iconClass = 'fa-circle-info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fa-solid ${iconClass}" style="color: var(--accent-cyan); font-size: 1.2rem;"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

/* ==========================================================================
   11. SISTEMA DE AUTENTICACIÓN (LOGIN, REGISTRO, LOGS Y MIS COMPRAS)
   ========================================================================== */
let currentUser = JSON.parse(localStorage.getItem('cyberverse_user')) || null;

function updateUserAuthUI() {
    const wrapper = document.getElementById('nav-user-wrapper');
    if (!wrapper) return;

    if (currentUser) {
        wrapper.innerHTML = `
            <button class="btn-primary" id="user-profile-btn" onclick="openUserOrders()" style="font-size: 0.85rem; padding: 6px 12px;" title="Ver Mis Compras y Claves">
                <i class="fa-solid fa-user-check"></i> <span>Hola, ${currentUser.nombre_completo.split(' ')[0]}</span>
            </button>
            <button onclick="logoutUser()" class="sound-toggle-btn" title="Cerrar Sesión" style="width: 36px; height: 36px;">
                <i class="fa-solid fa-right-from-bracket" style="color: #ff0055;"></i>
            </button>
        `;

        // Pre-llenar datos del usuario autenticado en la pasarela de pago
        const nameInput = document.getElementById('input-customer-name');
        const emailInput = document.getElementById('input-customer-email');
        if (nameInput && !nameInput.value) nameInput.value = currentUser.nombre_completo;
        if (emailInput && !emailInput.value) emailInput.value = currentUser.email;
    } else {
        wrapper.innerHTML = `
            <button class="btn-secondary" id="nav-auth-btn" onclick="openAuthModal()" style="font-size: 0.85rem; padding: 8px 14px;">
                <i class="fa-solid fa-right-to-bracket"></i> Iniciar Sesión / Registro
            </button>
        `;
    }
}

function openAuthModal() {
    playSound('click');
    const errLogin = document.getElementById('login-error-msg');
    const errReg = document.getElementById('reg-error-msg');
    if (errLogin) errLogin.style.display = 'none';
    if (errReg) errReg.style.display = 'none';
    document.getElementById('auth-modal').classList.add('active');
}

function closeAuthModal() {
    playSound('click');
    document.getElementById('auth-modal').classList.remove('active');
}

function switchAuthTab(tab) {
    playSound('click');
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    const btnLogin = document.getElementById('tab-btn-login');
    const btnReg = document.getElementById('tab-btn-register');

    if (tab === 'login') {
        loginForm.style.display = 'block';
        regForm.style.display = 'none';
        btnLogin.classList.add('active');
        btnReg.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        regForm.style.display = 'block';
        btnLogin.classList.remove('active');
        btnReg.classList.add('active');
    }
}

async function submitLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error-msg');

    if (errorDiv) errorDiv.style.display = 'none';

    try {
        const apiUrl = getApiUrl('login.php');

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success && data.user) {
            currentUser = data.user;
            localStorage.setItem('cyberverse_user', JSON.stringify(currentUser));
            updateUserAuthUI();
            closeAuthModal();
            playSound('success');
            showToast(`¡Bienvenido de nuevo, ${currentUser.nombre_completo}!`, 'fa-user-check');
        } else {
            playSound('click');
            if (errorDiv) {
                errorDiv.innerText = data.message || 'Contraseña incorrecta o usuario no registrado.';
                errorDiv.style.display = 'block';
            }
            showToast(data.message || 'Acceso denegado', 'fa-triangle-exclamation');
        }
    } catch (e) {
        console.error('Error de login:', e);
        if (errorDiv) {
            errorDiv.innerText = 'Error de conexión con el servidor MySQL.';
            errorDiv.style.display = 'block';
        }
    }
}

async function submitRegister() {
    const nombre = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const errorDiv = document.getElementById('reg-error-msg');

    if (errorDiv) errorDiv.style.display = 'none';

    try {
        const apiUrl = getApiUrl('register.php');

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre_completo: nombre, email, password })
        });

        const data = await response.json();

        if (response.ok && data.success && data.user) {
            currentUser = data.user;
            localStorage.setItem('cyberverse_user', JSON.stringify(currentUser));
            updateUserAuthUI();
            closeAuthModal();
            playSound('success');
            showToast(`¡Cuenta creada con éxito! Bienvenido, ${currentUser.nombre_completo}`, 'fa-user-check');
        } else {
            playSound('click');
            if (errorDiv) {
                errorDiv.innerText = data.message || 'Error al registrar la cuenta.';
                errorDiv.style.display = 'block';
            }
        }
    } catch (e) {
        console.error('Error de registro:', e);
        if (errorDiv) {
            errorDiv.innerText = 'Error de conexión con el servidor MySQL.';
            errorDiv.style.display = 'block';
        }
    }
}

function logoutUser() {
    playSound('click');
    currentUser = null;
    localStorage.removeItem('cyberverse_user');
    updateUserAuthUI();
    showToast('Sesión cerrada correctamente', 'fa-right-from-bracket');
}

async function openUserOrders() {
    playSound('click');
    if (!currentUser) {
        openAuthModal();
        return;
    }

    const modal = document.getElementById('user-orders-modal');
    const container = document.getElementById('user-orders-list');
    modal.classList.add('active');

    container.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-secondary);"><i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 10px;"></i><p>Cargando tus compras desde Supabase...</p></div>`;

    try {
        const apiUrl = getApiUrl('my_orders.php') + `?usuario_id=${currentUser.id}&email=${currentUser.email}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.success && data.compras && data.compras.length > 0) {
            container.innerHTML = data.compras.map(item => `
                <div class="glass-panel" style="padding: 16px; border-left: 4px solid var(--accent-cyan); display: flex; align-items: center; justify-content: space-between; gap: 15px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <img src="${item.imagen_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e'}" alt="${item.videojuego}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                        <div>
                            <h4 style="color: #fff; margin-bottom: 4px;">${item.videojuego}</h4>
                            <div style="font-size: 0.8rem; color: var(--text-muted);">
                                <span>Ref: <strong>${item.codigo_referencia}</strong></span> | 
                                <span>Fecha: ${item.fecha_creacion}</span>
                            </div>
                            <div style="margin-top: 6px; font-size: 0.85rem; color: var(--accent-gold);">
                                <i class="fa-solid fa-key"></i> Clave: <strong style="font-family: monospace; background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 4px; color: #fff;">${item.clave_activacion}</strong>
                            </div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.1rem; font-weight: bold; color: var(--accent-cyan);">${formatCurrency(item.precio_unitario_cop)}</div>
                        <span style="font-size: 0.75rem; background: rgba(0,255,136,0.15); color: var(--accent-green); padding: 3px 8px; border-radius: 10px;"><i class="fa-solid fa-check"></i> ${item.estado_orden}</span>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fa-solid fa-cart-flatbed" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 15px;"></i>
                    <h3>Aún no has realizado ninguna compra</h3>
                    <p style="color: var(--text-secondary);">Explora el catálogo 3D y realiza tu primer pedido para ver tus claves aquí.</p>
                </div>
            `;
        }
    } catch (e) {
        console.error('Error al cargar órdenes:', e);
        container.innerHTML = `<div style="color: #ff0055; text-align: center; padding: 20px;">Error al conectar con la base de datos MySQL.</div>`;
    }
}

function closeUserOrdersModal() {
    playSound('click');
    document.getElementById('user-orders-modal').classList.remove('active');
}
