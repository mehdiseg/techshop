// =========================================
// GESTION DU PANIER (Persistant avec localStorage)
// =========================================

class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.updateCartDisplay();
    }

    loadCart() {
        const savedCart = localStorage.getItem('techshop_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    saveCart() {
        localStorage.setItem('techshop_cart', JSON.stringify(this.cart));
        this.updateCartDisplay();
    }

    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        
        this.saveCart();
        this.showNotification('Produit ajouté au panier !');
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                this.saveCart();
            }
        }
    }

    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    getTotalPrice() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    updateCartDisplay() {
        const count = this.getTotalItems();
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
        });
        this.renderCartSidebar();
    }

    renderCartSidebar() {
        const cartContent = document.getElementById('cartContent');
        const cartTotal = document.getElementById('cartTotal');
        
        if (!cartContent || !cartTotal) return;

        if (this.cart.length === 0) {
            cartContent.innerHTML = `
                <div class="cart-empty">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <p>Votre panier est vide</p>
                </div>
            `;
            cartTotal.textContent = '0 €';
            return;
        }

        cartContent.innerHTML = this.cart.map(item => {
            const itemTotal = (item.price * item.quantity).toFixed(2);
            return `
                <div class="cart-item" data-product-id="${item.id}">
                    <div class="cart-item-image">${this.getProductEmoji(item.category)}</div>
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${item.price} €</div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn" onclick="cartManager.updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                                onchange="cartManager.updateQuantity(${item.id}, parseInt(this.value))">
                            <button class="quantity-btn" onclick="cartManager.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                            <button class="cart-item-remove" onclick="cartManager.removeFromCart(${item.id})">Supprimer</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const total = this.getTotalPrice().toFixed(2);
        cartTotal.textContent = `${total} €`;
    }

    getProductEmoji(category) {
        const emojis = {
            'smartphones': '📱',
            'ordinateurs': '💻',
            'audio': '🎧'
        };
        return emojis[category] || '📦';
    }

    openCartSidebar() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeCartSidebar() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    clearCart() {
        if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
            this.cart = [];
            this.saveCart();
            this.showNotification('Panier vidé');
        }
    }

    showNotification(message) {
        // Créer une notification temporaire
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: var(--accent);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            animation: slideIn 0.3s;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Instance globale du panier
const cartManager = new CartManager();

// =========================================
// MENU HAMBURGER RESPONSIVE
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', () => {
            mainNav.classList.toggle('open');
            mobileToggle.textContent = mainNav.classList.contains('open') ? '✕' : '☰';
            
            // Empêcher le scroll du body quand le menu est ouvert
            if (mainNav.classList.contains('open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Fermer le menu quand on clique sur un lien
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('open');
                mobileToggle.textContent = '☰';
                document.body.style.overflow = '';
            });
        });

        // Fermer le menu si on clique en dehors
        document.addEventListener('click', (e) => {
            if (!mainNav.contains(e.target) && !mobileToggle.contains(e.target)) {
                mainNav.classList.remove('open');
                mobileToggle.textContent = '☰';
                document.body.style.overflow = '';
            }
        });
    }

    // =========================================
    // GESTION DES BOUTONS "AJOUTER AU PANIER"
    // =========================================
    document.querySelectorAll('[data-product]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productData = JSON.parse(button.getAttribute('data-product'));
            cartManager.addToCart(productData);
        });
    });

    // =========================================
    // GESTION DU PANNEAU PANIER
    // =========================================
    const cartIcon = document.getElementById('cartIcon');
    const cartClose = document.getElementById('cartClose');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartCheckout = document.getElementById('cartCheckout');
    const cartClear = document.getElementById('cartClear');

    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            cartManager.renderCartSidebar();
            cartManager.openCartSidebar();
        });
    }

    if (cartClose) {
        cartClose.addEventListener('click', () => {
            cartManager.closeCartSidebar();
        });
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', () => {
            cartManager.closeCartSidebar();
        });
    }

    if (cartCheckout) {
        cartCheckout.addEventListener('click', () => {
            if (cartManager.cart.length === 0) {
                alert('Votre panier est vide !');
                return;
            }
            window.location.href = 'checkout.html';
        });
    }

    if (cartClear) {
        cartClear.addEventListener('click', () => {
            cartManager.clearCart();
        });
    }

    // =========================================
    // MODE SOMBRE
    // =========================================
    const darkModeToggle = document.getElementById('darkModeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // =========================================
    // RECHERCHE EN TEMPS RÉEL
    // =========================================
    const productSearch = document.getElementById('productSearch');
    if (productSearch) {
        productSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const cards = document.querySelectorAll('.card[data-category]');
            
            cards.forEach(card => {
                const productName = card.querySelector('h3')?.textContent.toLowerCase() || '';
                if (productName.includes(searchTerm)) {
                    card.classList.remove('hidden');
                    card.style.animation = 'fadeIn 0.3s';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    }

    // =========================================
    // TRI DES PRODUITS
    // =========================================
    const sortSelect = document.getElementById('sortProducts');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const sortValue = e.target.value;
            const productsGrid = document.getElementById('productsGrid');
            if (!productsGrid) return;
            
            const cards = Array.from(productsGrid.querySelectorAll('.card[data-category]'));
            
            cards.sort((a, b) => {
                const priceA = parseFloat(a.querySelector('.price')?.textContent.replace(/[^\d,]/g, '').replace(',', '.') || '0');
                const priceB = parseFloat(b.querySelector('.price')?.textContent.replace(/[^\d,]/g, '').replace(',', '.') || '0');
                const nameA = a.querySelector('h3')?.textContent || '';
                const nameB = b.querySelector('h3')?.textContent || '';
                
                switch(sortValue) {
                    case 'price-asc':
                        return priceA - priceB;
                    case 'price-desc':
                        return priceB - priceA;
                    case 'name-asc':
                        return nameA.localeCompare(nameB);
                    case 'name-desc':
                        return nameB.localeCompare(nameA);
                    default:
                        return 0;
                }
            });
            
            cards.forEach(card => {
                productsGrid.appendChild(card);
                card.style.animation = 'fadeIn 0.3s';
            });
        });
    }

    // =========================================
    // FILTRES DE PRODUITS
    // =========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.card[data-category]');

    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Retirer la classe active de tous les boutons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Ajouter la classe active au bouton cliqué
                button.classList.add('active');

                const category = button.getAttribute('data-category');

                productCards.forEach(card => {
                    if (category === 'all' || card.getAttribute('data-category') === category) {
                        card.classList.remove('hidden');
                        card.style.animation = 'fadeIn 0.3s';
                    } else {
                        card.classList.add('hidden');
                    }
                });
            });
        });
    }

    // =========================================
    // SLIDER HERO
    // =========================================
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    let currentSlide = 0;
    let slideInterval;

    if (slides.length > 0) {
        const showSlide = (index) => {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            if (index >= slides.length) currentSlide = 0;
            if (index < 0) currentSlide = slides.length - 1;
            
            slides[currentSlide].classList.add('active');
            if (dots[currentSlide]) {
                dots[currentSlide].classList.add('active');
            }
        };

        const nextSlide = () => {
            currentSlide++;
            if (currentSlide >= slides.length) currentSlide = 0;
            showSlide(currentSlide);
        };

        const prevSlide = () => {
            currentSlide--;
            if (currentSlide < 0) currentSlide = slides.length - 1;
            showSlide(currentSlide);
        };

        const startSlider = () => {
            slideInterval = setInterval(nextSlide, 8000); // 8 secondes entre chaque slide
        };

        const stopSlider = () => {
            clearInterval(slideInterval);
        };

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                stopSlider();
                startSlider();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                stopSlider();
                startSlider();
            });
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
                stopSlider();
                startSlider();
            });
        });

        // Démarrer le slider automatique
        startSlider();

        // Pause au survol
        const heroSlider = document.querySelector('.hero-slider');
        if (heroSlider) {
            heroSlider.addEventListener('mouseenter', stopSlider);
            heroSlider.addEventListener('mouseleave', startSlider);
        }
    }

    // =========================================
    // VALIDATION DES FORMULAIRES
    // =========================================

    // Validation du formulaire de contact
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let isValid = true;
            const formData = new FormData(contactForm);

            // Validation du nom
            const name = document.getElementById('name');
            const nameError = document.getElementById('nameError');
            if (!name.value.trim() || name.value.trim().length < 2) {
                showError(name, nameError, 'Le nom doit contenir au moins 2 caractères');
                isValid = false;
            } else {
                clearError(name, nameError);
            }

            // Validation de l'email
            const email = document.getElementById('email');
            const emailError = document.getElementById('emailError');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email.value.trim() || !emailRegex.test(email.value)) {
                showError(email, emailError, 'Veuillez entrer une adresse email valide');
                isValid = false;
            } else {
                clearError(email, emailError);
            }

            // Validation du téléphone (optionnel mais doit être valide si rempli)
            const phone = document.getElementById('phone');
            const phoneError = document.getElementById('phoneError');
            if (phone.value.trim()) {
                const phoneRegex = /^[0-9+\s\-()]{10,}$/;
                if (!phoneRegex.test(phone.value)) {
                    showError(phone, phoneError, 'Format de téléphone invalide');
                    isValid = false;
                } else {
                    clearError(phone, phoneError);
                }
            } else {
                clearError(phone, phoneError);
            }

            // Validation du sujet
            const subject = document.getElementById('subject');
            const subjectError = document.getElementById('subjectError');
            if (!subject.value) {
                showError(subject, subjectError, 'Veuillez sélectionner un sujet');
                isValid = false;
            } else {
                clearError(subject, subjectError);
            }

            // Validation du message
            const message = document.getElementById('message');
            const messageError = document.getElementById('messageError');
            if (!message.value.trim() || message.value.trim().length < 10) {
                showError(message, messageError, 'Le message doit contenir au moins 10 caractères');
                isValid = false;
            } else {
                clearError(message, messageError);
            }

            if (isValid) {
                const messageDiv = document.getElementById('contactMessage');
                messageDiv.textContent = 'Merci ! Votre message a été envoyé avec succès.';
                messageDiv.className = 'form-message success';
                contactForm.reset();
                
                // Réinitialiser après 5 secondes
                setTimeout(() => {
                    messageDiv.textContent = '';
                    messageDiv.className = 'form-message';
                }, 5000);
            }
        });

        // Validation en temps réel
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                validateField(input);
            });
        });
    }

    // Validation du formulaire newsletter
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('newsletterEmail');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const messageDiv = document.getElementById('newsletterMessage');
            
            if (!email.value.trim() || !emailRegex.test(email.value)) {
                messageDiv.textContent = 'Veuillez entrer une adresse email valide';
                messageDiv.className = 'form-message error';
            } else {
                messageDiv.textContent = 'Merci pour votre inscription à notre newsletter !';
                messageDiv.className = 'form-message success';
                newsletterForm.reset();
                
                setTimeout(() => {
                    messageDiv.textContent = '';
                    messageDiv.className = 'form-message';
                }, 5000);
            }
        });
    }

    // Fonctions utilitaires de validation
    function showError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    function clearError(input, errorElement) {
        input.classList.remove('error');
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }

    function validateField(input) {
        const errorElement = document.getElementById(input.id + 'Error');
        if (!errorElement) return;

        if (input.hasAttribute('required') && !input.value.trim()) {
            showError(input, errorElement, 'Ce champ est obligatoire');
            return false;
        }

        if (input.type === 'email' && input.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                showError(input, errorElement, 'Format d\'email invalide');
                return false;
            }
        }

        if (input.type === 'tel' && input.value.trim()) {
            const phoneRegex = /^[0-9+\s\-()]{10,}$/;
            if (!phoneRegex.test(input.value)) {
                showError(input, errorElement, 'Format de téléphone invalide');
                return false;
            }
        }

        clearError(input, errorElement);
        return true;
    }
});

// Ajout des animations CSS pour les notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// =========================================
// BOUTON RETOUR EN HAUT
// =========================================

const scrollToTopButton = document.getElementById('scrollToTop');

// Fonction pour afficher/masquer le bouton selon le scroll
function toggleScrollToTopButton() {
    if (window.pageYOffset > 300) {
        scrollToTopButton?.classList.add('show');
    } else {
        scrollToTopButton?.classList.remove('show');
    }
}

// Écouter l'événement de scroll
window.addEventListener('scroll', toggleScrollToTopButton);

// Fonction pour remonter en haut de la page
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Ajouter l'événement au clic sur le bouton
scrollToTopButton?.addEventListener('click', scrollToTop);

// =========================================
// GESTION DE LA PAGE CHECKOUT
// =========================================
    if (window.location.pathname.includes('checkout.html') || window.location.href.includes('checkout.html')) {
    // Vérifier si le panier est vide
    if (cartManager.cart.length === 0) {
        alert('Votre panier est vide ! Redirection vers la page produits...');
        window.location.href = 'produits.html';
    } else {
        // Système de coupons
        const coupons = {
            'WELCOME10': 0.1,
            'SUMMER20': 0.2,
            'TECHSHOP15': 0.15
        };
        let currentDiscount = 0;

        const applyCouponBtn = document.getElementById('applyCoupon');
        const couponCodeInput = document.getElementById('couponCode');
        const couponMessage = document.getElementById('couponMessage');

        // Afficher le récapitulatif de la commande
        function renderOrderSummary() {
            const orderSummary = document.getElementById('orderSummary');
            const subtotalEl = document.getElementById('subtotal');
            const totalPriceEl = document.getElementById('totalPrice');
            const totalPriceButton = document.getElementById('totalPriceButton');

            if (!orderSummary || !subtotalEl || !totalPriceEl) return;

            const subtotal = cartManager.getTotalPrice();
            const discount = subtotal * currentDiscount;
            const total = subtotal - discount;

            orderSummary.innerHTML = cartManager.cart.map(item => {
                const itemTotal = (item.price * item.quantity).toFixed(2);
                return `
                    <div class="order-summary-item">
                        <div class="order-summary-item-info">
                            <div class="order-summary-item-name">${item.name}</div>
                            <div class="order-summary-item-details">Quantité: ${item.quantity} × ${item.price} €</div>
                        </div>
                        <div class="order-summary-item-price">${itemTotal} €</div>
                    </div>
                `;
            }).join('');

            subtotalEl.textContent = subtotal.toFixed(2) + ' €';
            
            if (currentDiscount > 0) {
                totalPriceEl.innerHTML = `<span style="text-decoration: line-through; opacity: 0.5; margin-right: 0.5rem;">${subtotal.toFixed(2)} €</span><span style="color: var(--accent);">${total.toFixed(2)} €</span>`;
                if (totalPriceButton) totalPriceButton.innerHTML = `${total.toFixed(2)} € <small style="opacity: 0.8;">(-${(currentDiscount * 100)}%)</small>`;
            } else {
                totalPriceEl.textContent = total.toFixed(2) + ' €';
                if (totalPriceButton) totalPriceButton.textContent = total.toFixed(2) + ' €';
            }
        }

        renderOrderSummary();

        // Validation du formulaire de paiement
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Validation des champs
                let isValid = true;

                // Validation email
                const email = document.getElementById('deliveryEmail');
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!email.value.trim() || !emailRegex.test(email.value)) {
                    showFieldError(email, 'Veuillez entrer une adresse email valide');
                    isValid = false;
                } else {
                    clearFieldError(email);
                }

                // Validation téléphone
                const phone = document.getElementById('deliveryPhone');
                const phoneRegex = /^[0-9+\s\-()]{10,}$/;
                if (!phone.value.trim() || !phoneRegex.test(phone.value)) {
                    showFieldError(phone, 'Veuillez entrer un numéro de téléphone valide');
                    isValid = false;
                } else {
                    clearFieldError(phone);
                }

                // Validation code postal
                const postal = document.getElementById('deliveryPostal');
                const postalRegex = /^[0-9]{5}$/;
                if (!postal.value.trim() || !postalRegex.test(postal.value)) {
                    showFieldError(postal, 'Veuillez entrer un code postal valide (5 chiffres)');
                    isValid = false;
                } else {
                    clearFieldError(postal);
                }

                // Validation carte bancaire
                const cardNumber = document.getElementById('cardNumber');
                const cardNumberClean = cardNumber.value.replace(/\s/g, '');
                if (cardNumberClean.length < 13 || cardNumberClean.length > 19 || !/^[0-9]+$/.test(cardNumberClean)) {
                    showFieldError(cardNumber, 'Veuillez entrer un numéro de carte valide');
                    isValid = false;
                } else {
                    clearFieldError(cardNumber);
                }

                // Validation date d'expiration
                const cardExpiry = document.getElementById('cardExpiry');
                const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
                if (!expiryRegex.test(cardExpiry.value)) {
                    showFieldError(cardExpiry, 'Format invalide (MM/AA)');
                    isValid = false;
                } else {
                    clearFieldError(cardExpiry);
                }

                // Validation CVC
                const cardCVC = document.getElementById('cardCVC');
                if (cardCVC.value.length < 3 || !/^[0-9]+$/.test(cardCVC.value)) {
                    showFieldError(cardCVC, 'CVC invalide (3-4 chiffres)');
                    isValid = false;
                } else {
                    clearFieldError(cardCVC);
                }

                if (!isValid) {
                    const messageDiv = document.getElementById('checkoutMessage');
                    if (messageDiv) {
                        messageDiv.className = 'form-message error';
                        messageDiv.textContent = 'Veuillez corriger les erreurs dans le formulaire';
                    }
                    return;
                }

                // Traitement du paiement (simulé)
                const messageDiv = document.getElementById('checkoutMessage');
                if (messageDiv) {
                    messageDiv.className = 'form-message';
                    messageDiv.textContent = 'Traitement du paiement...';
                }

                // Simulation du paiement (2 secondes)
                setTimeout(() => {
                    // Vider le panier
                    cartManager.cart = [];
                    cartManager.saveCart();
                    
                    // Afficher message de succès
                    if (messageDiv) {
                        messageDiv.className = 'form-message success';
                        messageDiv.textContent = '✅ Commande validée avec succès ! Vous recevrez un email de confirmation.';
                    }

                    // Rediriger vers la page d'accueil après 3 secondes
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 3000);
                }, 2000);
            });
        }

        // Formatage automatique du numéro de carte
        const cardNumberInput = document.getElementById('cardNumber');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue;
            });
        }

        // Formatage automatique de la date d'expiration
        const cardExpiryInput = document.getElementById('cardExpiry');
        if (cardExpiryInput) {
            cardExpiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }

        function showFieldError(field, message) {
            field.classList.add('error');
            const errorId = field.id + 'Error';
            const errorEl = document.getElementById(errorId);
            if (errorEl) {
                errorEl.textContent = message;
                errorEl.classList.add('show');
            }
        }

        function clearFieldError(field) {
            field.classList.remove('error');
            const errorId = field.id + 'Error';
            const errorEl = document.getElementById(errorId);
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.classList.remove('show');
            }
        }
    }
}