document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    const addProductBtn = document.getElementById('addProductBtn');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul li a');

    // --- Elementos del Modal ---
    const productModal = document.getElementById('productModal');
    const closeModalBtn = productModal.querySelector('.close-button');
    const cancelModalBtn = productModal.querySelector('.cancel-button');
    const modalTitle = document.getElementById('modalTitle');
    const productForm = document.getElementById('productForm');
    const productIdInput = document.getElementById('productId');
    const productNameInput = document.getElementById('productName');
    const productPriceInput = document.getElementById('productPrice');
    const productQuantityInput = document.getElementById('productQuantity');


// --- Elementos del Historial de Facturas ---
const filterDateStart = document.getElementById('filterDateStart');
const filterDateEnd = document.getElementById('filterDateEnd');
const filterPaymentMethod = document.getElementById('filterPaymentMethod');
const filterInvoiceId = document.getElementById('filterInvoiceId');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const historyTableBody = document.querySelector('#historyTable tbody');
const historyCountSpan = document.getElementById('historyCount');
const noHistoryMessage = document.getElementById('noHistoryMessage');


// DATOS DE PRUEBA
// --- Datos de prueba para cargar si no hay datos en localStorage ---
const sampleProducts = [
    {
        id: '1',
        name: 'Laptop Gamer',
        price: 1200.00,
        quantity: 10
    },
    {
        id: '2',
        name: 'Mouse Inalámbrico',
        price: 25.50,
        quantity: 4
    },
    {
        id: '3',
        name: 'Teclado Mecánico',
        price: 75.00,
        quantity: 20
    },
    {
        id: '4',
        name: 'Monitor 27 Pulgadas',
        price: 350.75,
        quantity: 5
    },
    {
        id: '5',
        name: 'Cargador Universal',
        price: 15.00,
        quantity: 0
    }
];

const sampleInvoices = [
    {
        id: '1722880000000',
        date: new Date(2025, 7, 5, 10, 30, 0).toLocaleString('es-GT'),
        items: [
            { id: '1', name: 'Laptop Gamer', price: 1200.00, quantity: 1 },
            { id: '2', name: 'Mouse Inalámbrico', price: 25.50, quantity: 1 }
        ],
        subtotal: 1225.50,
        tax: 147.06,
        total: 1372.56,
        paymentMethod: 'Tarjeta',
        change: 0
    },
    {
        id: '1722880000001',
        date: new Date(2025, 7, 5, 11, 45, 0).toLocaleString('es-GT'),
        items: [
            { id: '3', name: 'Teclado Mecánico', price: 75.00, quantity: 2 },
        ],
        subtotal: 150.00,
        tax: 18.00,
        total: 168.00,
        paymentMethod: 'Efectivo',
        change: 32.00
    },
];


    // --- Navegación entre secciones ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            sections.forEach(section => {
                section.classList.remove('section-active');
            });
            document.getElementById(targetId).classList.add('section-active');
        });
    });

    // --- Funciones de Inventario ---

    // Array para almacenar los productos (se cargará de localStorage)
    let products = [];

    // Cargar productos de localStorage
     // Cargar productos de localStorage
    const loadProducts = () => {
        const storedProducts = localStorage.getItem('products');
        if (storedProducts) {
            products = JSON.parse(storedProducts);
        } else {
            // Si no hay productos guardados, cargar los de prueba
            products = sampleProducts;
            saveProducts(); // Guardar los productos de prueba
        }
    };
    // Guardar productos en localStorage
    const saveProducts = () => {
        localStorage.setItem('products', JSON.stringify(products));
    };

    // Renderizar (mostrar) los productos en la cuadrícula
    const renderProducts = () => {
        productGrid.innerHTML = ''; // Limpiar la cuadrícula antes de volver a renderizar
        if (products.length === 0) {
            productGrid.innerHTML = '<p>No hay productos en el inventario. ¡Agrega uno!</p>';
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            // Lógica para las alertas de stock
            let stockAlertClass = '';
            if (product.quantity <= 0) {
                stockAlertClass = 'stock-red'; // Rojo: sin stock
            } else if (product.quantity < 5) {
                stockAlertClass = 'stock-orange'; // Naranja: bajo stock
            }

            productCard.innerHTML = `
                <h3 class="${stockAlertClass}">${product.name}</h3>
                <p>Precio: $<span class="product-price">${product.price.toFixed(2)}</span></p>
                <p>Cantidad: <span class="product-quantity">${product.quantity}</span></p>
                <button data-id="${product.id}" class="edit-product-btn">Editar</button>
                <button data-id="${product.id}" class="delete-product-btn">Eliminar</button>
            `;
            productGrid.appendChild(productCard);
        });
        // Las alertas de stock (clases stock-red, stock-orange) se definirán en CSS en el siguiente paso.
        // Aún no verás el efecto visual, pero la lógica ya está aquí.
    };

    // Mostrar el formulario modal (para agregar o editar)
    const showProductForm = (product = {}) => {
        productModal.style.display = 'flex'; // Mostrar como flex para centrar
        if (product.id) {
            modalTitle.textContent = 'Editar Producto';
            productIdInput.value = product.id;
            productNameInput.value = product.name;
            productPriceInput.value = product.price;
            productQuantityInput.value = product.quantity;
        } else {
            modalTitle.textContent = 'Agregar Nuevo Producto';
            productForm.reset(); // Limpiar el formulario para un nuevo producto
            productIdInput.value = ''; // Asegurarse de que no haya ID al agregar
        }
    };

    // Ocultar el formulario modal
    const hideProductForm = () => {
        productModal.style.display = 'none';
    };

    // Manejar el envío del formulario (agregar o actualizar producto)
    productForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Evitar que el formulario se recargue

        const id = productIdInput.value;
        const name = productNameInput.value.trim();
        const price = parseFloat(productPriceInput.value);
        const quantity = parseInt(productQuantityInput.value);

        if (!name || isNaN(price) || isNaN(quantity) || price <= 0 || quantity < 0) {
            alert('Por favor, ingresa datos válidos para el producto (nombre, precio > 0, cantidad >= 0).');
            return;
        }

        if (id) {
            // Editar producto existente
            const productIndex = products.findIndex(p => p.id === id);
            if (productIndex !== -1) {
                products[productIndex] = { ...products[productIndex], name, price, quantity };
            }
        } else {
            // Agregar nuevo producto
            const newProduct = {
                id: Date.now().toString(), // ID único basado en la marca de tiempo
                name,
                price,
                quantity
            };
            products.push(newProduct);
        }

        saveProducts(); // Guardar cambios en localStorage
        renderProducts(); // Volver a renderizar la lista de productos
        hideProductForm(); // Ocultar el modal
    });

    // Event listeners para los botones del modal
    closeModalBtn.addEventListener('click', hideProductForm);
    cancelModalBtn.addEventListener('click', hideProductForm);
    // Cerrar modal si se hace clic fuera del contenido
    window.addEventListener('click', (e) => {
        if (e.target === productModal) {
            hideProductForm();
        }
    });

    // Event listener para el botón "Agregar Nuevo Producto"
    addProductBtn.addEventListener('click', () => showProductForm());

    // Event listeners para los botones de editar y eliminar (delegación de eventos)
    // Usamos delegación de eventos porque los botones se añaden dinámicamente
    productGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-product-btn')) {
            const productId = e.target.dataset.id;
            const productToEdit = products.find(p => p.id === productId);
            if (productToEdit) {
                showProductForm(productToEdit);
            }
        } else if (e.target.classList.contains('delete-product-btn')) {
            const productId = e.target.dataset.id;
            if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                products = products.filter(p => p.id !== productId);
                saveProducts();
                renderProducts();
            }
        }
    });


    // --- Elementos de Facturación (Punto de Venta) ---
    const productSearchInput = document.getElementById('productSearch');
    const searchResultsDiv = document.getElementById('searchResults');
    const selectedProductInfoDiv = document.getElementById('selectedProductInfo');
    const selectedProductNameSpan = document.getElementById('selectedProductName');
    const selectedProductPriceSpan = document.getElementById('selectedProductPrice');
    const selectedProductStockSpan = document.getElementById('selectedProductStock');
    const productQuantityToAddInput = document.getElementById('productQuantityToAdd');
    const addToCartBtn = document.getElementById('addToCartBtn');
    const cartItemsDiv = document.getElementById('cartItems');
    const cartSubtotalSpan = document.getElementById('cartSubtotal');
    const cartTaxSpan = document.getElementById('cartTax');
    const cartTotalSpan = document.getElementById('cartTotal');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const proceedToPaymentBtn = document.getElementById('proceedToPaymentBtn');

    
    // Carrito de compras: array para almacenar los productos seleccionados para la venta
    let cart = [];
    let selectedProduct = null; // Para guardar el producto seleccionado del buscador/grilla

    const TAX_RATE = 0.12; // 12% de IVA

    // Función para renderizar todos los productos disponibles en la sección de venta
    const renderAvailableProducts = (filterTerm = '') => {
        availableProductsGrid.innerHTML = ''; // Limpiar la cuadrícula antes de renderizar

        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(filterTerm.toLowerCase()) && product.quantity > 0 // Solo productos con stock
        );

        if (filteredProducts.length === 0) {
            availableProductsGrid.innerHTML = '<p>No hay productos disponibles en este momento.</p>';
            return;
        }

        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('available-product-card');
            if (product.quantity <= 0) { // Aunque ya filtramos por > 0, si por alguna razón llega aquí sin stock
                productCard.classList.add('no-stock');
                productCard.title = "Producto agotado";
            }

            productCard.innerHTML = `
                <h4>${product.name}</h4>
                <p>Precio: $${product.price.toFixed(2)}</p>
                <p>Stock: ${product.quantity}</p>
            `;
            productCard.dataset.productId = product.id; // Guardar el ID para selección

            productCard.addEventListener('click', () => {
                if (product.quantity > 0) { // Solo si hay stock para seleccionar
                    selectProductForSale(product.id);
                    productSearchInput.value = product.name; // Poner el nombre en el buscador
                    searchResultsDiv.innerHTML = ''; // Limpiar resultados de búsqueda al seleccionar de la grilla
                }
            });
            availableProductsGrid.appendChild(productCard);
        });
    };

    // Función para buscar productos (ahora afecta a la cuadrícula de productos disponibles)
    productSearchInput.addEventListener('input', () => {
        const searchTerm = productSearchInput.value.toLowerCase();
        selectedProductInfoDiv.style.display = 'none'; // Ocultar info del producto seleccionado
        // Si el término de búsqueda está vacío, mostramos todos los productos, de lo contrario, filtramos.
        if (searchTerm.length === 0) {
            renderAvailableProducts(); // Sin filtro
        } else {
            renderAvailableProducts(searchTerm); // Con filtro
        }
    });

    // Función para seleccionar un producto y mostrar su información
    const selectProductForSale = (productId) => {
        selectedProduct = products.find(p => p.id === productId);
        if (selectedProduct) {
            selectedProductNameSpan.textContent = selectedProduct.name;
            selectedProductPriceSpan.textContent = selectedProduct.price.toFixed(2);
            selectedProductStockSpan.textContent = selectedProduct.quantity;
            productQuantityToAddInput.value = 1; // Restablecer cantidad a 1
            productQuantityToAddInput.max = selectedProduct.quantity; // Establecer maximo según stock
            selectedProductInfoDiv.style.display = 'block';
            addToCartBtn.disabled = selectedProduct.quantity === 0; // Deshabilitar si no hay stock
        }
    };


    // Añadir producto al carrito
    addToCartBtn.addEventListener('click', () => {
        if (!selectedProduct) {
            alert('Por favor, selecciona un producto primero.');
            return;
        }

        const quantityToAdd = parseInt(productQuantityToAddInput.value);

        if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
            alert('La cantidad a añadir debe ser un número positivo.');
            return;
        }

        if (quantityToAdd > selectedProduct.quantity) {
            alert(`No hay suficiente stock. Solo quedan ${selectedProduct.quantity} unidades de ${selectedProduct.name}.`);
            return;
        }

        // Buscar si el producto ya está en el carrito
        const existingCartItem = cart.find(item => item.id === selectedProduct.id);

        if (existingCartItem) {
            // Si ya está, aumentar la cantidad
            existingCartItem.quantity += quantityToAdd;
        } else {
            // Si no está, añadirlo como un nuevo elemento
            cart.push({
                id: selectedProduct.id,
                name: selectedProduct.name,
                price: selectedProduct.price,
                quantity: quantityToAdd
            });
        }

        // Limpiar la selección después de añadir al carrito
        productSearchInput.value = '';
        selectedProductInfoDiv.style.display = 'none';
        selectedProduct = null;
        searchResultsDiv.innerHTML = ''; // Limpiar resultados de búsqueda

        renderCart();
    });

    // Renderizar el carrito de compras
    const renderCart = () => {
        cartItemsDiv.innerHTML = ''; // Limpiar el carrito antes de renderizar

        if (cart.length === 0) {
            cartItemsDiv.innerHTML = '<p>Tu carrito está vacío.</p>';
            proceedToPaymentBtn.disabled = true;
            clearCartBtn.disabled = true;
        } else {
            cart.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.innerHTML = `
                    <div class="cart-item-info">
                        <strong>${item.name}</strong>
                        <span>Cantidad: ${item.quantity} x $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}</span>
                    </div>
                    <div class="cart-item-actions">
                        <button data-id="${item.id}" data-action="decrease">-</button>
                        <button data-id="${item.id}" data-action="increase">+</button>
                        <button data-id="${item.id}" data-action="remove">X</button>
                    </div>
                `;
                cartItemsDiv.appendChild(cartItemDiv);
            });
            proceedToPaymentBtn.disabled = false;
            clearCartBtn.disabled = false;
        }
        calculateCartTotals();
    };

    // Manejar acciones del carrito (aumentar, disminuir, remover)
    cartItemsDiv.addEventListener('click', (e) => {
        const target = e.target;
        if (target.tagName === 'BUTTON') {
            const itemId = target.dataset.id;
            const action = target.dataset.action;
            const cartItemIndex = cart.findIndex(item => item.id === itemId);

            if (cartItemIndex !== -1) {
                const productInStock = products.find(p => p.id === itemId);

                if (action === 'increase') {
                    if (cart[cartItemIndex].quantity < productInStock.quantity) {
                        cart[cartItemIndex].quantity++;
                    } else {
                        alert(`No hay más stock de ${cart[cartItemIndex].name}.`);
                    }
                } else if (action === 'decrease') {
                    if (cart[cartItemIndex].quantity > 1) {
                        cart[cartItemIndex].quantity--;
                    } else {
                        // Si la cantidad es 1 y se quiere disminuir, preguntar si quiere removerlo
                        if (confirm(`¿Quitar ${cart[cartItemIndex].name} del carrito?`)) {
                            cart.splice(cartItemIndex, 1);
                        }
                    }
                } else if (action === 'remove') {
                    if (confirm(`¿Quitar ${cart[cartItemIndex].name} del carrito?`)) {
                        cart.splice(cartItemIndex, 1);
                    }
                }
                renderCart();
            }
        }
    });

    // Calcular y mostrar subtotales, IVA y total del carrito
    const calculateCartTotals = () => {
        let subtotal = 0;
        cart.forEach(item => {
            subtotal += item.quantity * item.price;
        });
        const tax = subtotal * TAX_RATE;
        const total = subtotal + tax;

        cartSubtotalSpan.textContent = subtotal.toFixed(2);
        cartTaxSpan.textContent = tax.toFixed(2);
        cartTotalSpan.textContent = total.toFixed(2);
    };

    // Vaciar todo el carrito
    clearCartBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
            cart = [];
            renderCart();
        }
    });

    // Lógica para proceder al pago (se implementará en la Fase 3)
    proceedToPaymentBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('El carrito está vacío. Añade productos para proceder al pago.');
            return;
        }
        // Por ahora, solo un console log. En la fase 3, mostraremos las opciones de pago.
        console.log('Proceder al pago con:', cart);
        // Aquí podrías mostrar la sección de métodos de pago
        // document.getElementById('payment-options').style.display = 'block';
        // document.getElementById('facturacion').scrollIntoView({ behavior: 'smooth' });
    });

// --- Elementos de Métodos de Pago ---
    const paymentOptionsDiv = document.getElementById('payment-options');
    const cashPaymentBtn = document.getElementById('cashPaymentBtn');
    const cardPaymentBtn = document.getElementById('cardPaymentBtn');
    const cashPaymentDetails = document.getElementById('cashPaymentDetails');
    const cardPaymentDetails = document.getElementById('cardPaymentDetails');
    const cashTotalDisplay = document.getElementById('cashTotalDisplay');
    const cardTotalDisplay = document.getElementById('cardTotalDisplay');
    const cashReceivedInput = document.getElementById('cashReceived');
    const cashChangeDisplay = document.getElementById('cashChangeDisplay');
    const completeCashPaymentBtn = document.getElementById('completeCashPaymentBtn');
    const completeCardPaymentBtn = document.getElementById('completeCardPaymentBtn');
    const posAnimationDiv = document.getElementById('posAnimation');
    const cancelPaymentBtn = document.getElementById('cancelPaymentBtn');

    // --- Variables para el Historial (Fase 5) ---
    let invoiceHistory = [];

    // Cargar historial de localStorage
    const loadInvoiceHistory = () => {
        const storedHistory = localStorage.getItem('invoiceHistory');
        if (storedHistory) {
            invoiceHistory = JSON.parse(storedHistory);
        } else {
            // Si no hay historial, cargar las facturas de prueba
            invoiceHistory = sampleInvoices;
            saveInvoiceHistory(); // Guardar el historial de prueba
        }
    };

    // Guardar historial en localStorage
    const saveInvoiceHistory = () => {
        localStorage.setItem('invoiceHistory', JSON.stringify(invoiceHistory));
    };


    // --- Lógica para mostrar/ocultar secciones de pago ---
    proceedToPaymentBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('El carrito está vacío. Añade productos para proceder al pago.');
            return;
        }
        // Ocultar sección de selección de productos y carrito, mostrar opciones de pago
        document.querySelector('.sale-container').style.display = 'none';
        paymentOptionsDiv.style.display = 'block';
        
        // Establecer el total en ambas pantallas de pago
        const total = parseFloat(cartTotalSpan.textContent);
        cashTotalDisplay.textContent = total.toFixed(2);
        cardTotalDisplay.textContent = total.toFixed(2);
        
        // Limpiar y resetear campos de pago
        cashReceivedInput.value = null; // Valor por defecto igual al total
        cashChangeDisplay.textContent = '0.00';
        posAnimationDiv.style.display = 'none'; // Ocultar animación POS
        cashPaymentDetails.style.display = 'none'; // Ocultar detalles efectivo
        cardPaymentDetails.style.display = 'none'; // Ocultar detalles tarjeta

        // Remover clase 'active' de botones de pago
        cashPaymentBtn.classList.remove('active');
        cardPaymentBtn.classList.remove('active');
    });

    cancelPaymentBtn.addEventListener('click', () => {
        // Volver a mostrar sección de selección de productos y carrito, ocultar opciones de pago
        document.querySelector('.sale-container').style.display = 'flex';
        paymentOptionsDiv.style.display = 'none';
        // Ocultar detalles de pago específicos
        cashPaymentDetails.style.display = 'none';
        cardPaymentDetails.style.display = 'none';
    });

    // --- Lógica para Pago en Efectivo ---
    cashPaymentBtn.addEventListener('click', () => {
        cashPaymentDetails.style.display = 'block';
        cardPaymentDetails.style.display = 'none';
        cashPaymentBtn.classList.add('active');
        cardPaymentBtn.classList.remove('active');
        posAnimationDiv.style.display = 'none'; // Asegurarse de que la animación no esté visible
        calculateCashChange(); // Calcular el cambio inicial
    });

    cashReceivedInput.addEventListener('input', calculateCashChange);

    function calculateCashChange() {
        const total = parseFloat(cashTotalDisplay.textContent);
        const received = parseFloat(cashReceivedInput.value);
        if (isNaN(received)) {
            cashChangeDisplay.textContent = '0.00';
            completeCashPaymentBtn.disabled = true;
            return;
        }
        const change = received - total;
        cashChangeDisplay.textContent = change.toFixed(2);
        completeCashPaymentBtn.disabled = change < 0; // Deshabilitar si el efectivo es insuficiente
    }

    completeCashPaymentBtn.addEventListener('click', () => {
        if (confirm('¿Confirmar venta en efectivo?')) {
            finalizeSale('Efectivo');
        }
    });

    // --- Lógica para Pago con Tarjeta ---
    cardPaymentBtn.addEventListener('click', () => {
        cardPaymentDetails.style.display = 'block';
        cashPaymentDetails.style.display = 'none';
        cardPaymentBtn.classList.add('active');
        cashPaymentBtn.classList.remove('active');
        posAnimationDiv.style.display = 'none'; // Ocultar animación al seleccionar
        completeCardPaymentBtn.disabled = false; // Habilitar el botón de completar pago con tarjeta
    });

    completeCardPaymentBtn.addEventListener('click', () => {
        // Simular proceso del POS
        posAnimationDiv.style.display = 'block';
        completeCardPaymentBtn.disabled = true; // Deshabilitar botón mientras la animación corre

        setTimeout(() => {
            posAnimationDiv.style.display = 'none';
            if (confirm('¿Confirmar venta con tarjeta?')) {
                finalizeSale('Tarjeta');
            } else {
                completeCardPaymentBtn.disabled = false; // Re-habilitar si se cancela
            }
        }, 3000); // 3 segundos de animación
    });

     // --- Función para Finalizar la Venta (MODIFICADA para mostrar el modal de factura) ---
    


// --- Función para Finalizar la Venta (MODIFICADA) ---
const finalizeSale = (paymentMethod) => {
    // 1. Reducir inventario de los productos en el carrito (ESTO NO CAMBIA)
    cart.forEach(cartItem => {
        const productIndex = products.findIndex(p => p.id === cartItem.id);
        if (productIndex !== -1) {
            products[productIndex].quantity -= cartItem.quantity;
        }
    });
    saveProducts();
    renderProducts();
    renderAvailableProducts();

    // 2. Crear registro de factura para el historial (ESTO NO CAMBIA)
    const total = parseFloat(cartTotalSpan.textContent);
    const currentInvoice = {
        id: Date.now().toString(),
        date: new Date().toLocaleString('es-GT', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        items: JSON.parse(JSON.stringify(cart)),
        subtotal: parseFloat(cartSubtotalSpan.textContent),
        tax: parseFloat(cartTaxSpan.textContent),
        total: total,
        paymentMethod: paymentMethod,
        change: paymentMethod === 'Efectivo' ? parseFloat(cashChangeDisplay.textContent) : 0
    };
    invoiceHistory.push(currentInvoice);
    saveInvoiceHistory();

    // 3. Limpiar el carrito y volver a la vista principal (ESTO NO CAMBIA)
    cart = [];
    renderCart();
    document.querySelector('.sale-container').style.display = 'flex';
    paymentOptionsDiv.style.display = 'none';

    // --- NUEVO: Llamar a la función que imprime en una nueva ventana ---
    printInvoiceInNewWindow(currentInvoice);
};


// --- Nueva función para generar la factura y abrirla en una nueva ventana ---
const printInvoiceInNewWindow = (invoice) => {
    const changeHtml = invoice.paymentMethod === 'Efectivo' && invoice.change > 0 ?
        `<p>Cambio: $${invoice.change.toFixed(2)}</p>` : '';

    const invoiceItemsHtml = invoice.items.map(item => `
        <li>
            <span>${item.name} (${item.quantity} x $${item.price.toFixed(2)})</span>
            <span>$${(item.quantity * item.price).toFixed(2)}</span>
        </li>
    `).join('');

    const invoiceContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Factura ${invoice.id}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
                .invoice-container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border: 1px solid #ddd; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                h3, h4 { text-align: center; margin: 5px 0; }
                h3 { border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
                p { margin: 5px 0; }
                ul { list-style: none; padding: 0; margin-top: 10px; }
                li { display: flex; justify-content: space-between; border-bottom: 1px dotted #eee; padding: 8px 0; }
                .invoice-summary { text-align: right; margin-top: 20px; border-top: 2px solid #ccc; padding-top: 10px; }
                .invoice-summary p { font-size: 1.1em; }
                .total { font-weight: bold; font-size: 1.3em; color: #0056b3; }
                /* Estilos para impresión */
                @media print {
                    body { background-color: #fff; }
                    .invoice-container { box-shadow: none; border: none; }
                }
            </style>
        </head>
        <body>
            <div class="invoice-container">
                <h3>Factura</h3>
                <p><strong>Factura ID:</strong> ${invoice.id}</p>
                <p><strong>Fecha:</strong> ${invoice.date}</p>
                <p><strong>Método de Pago:</strong> ${invoice.paymentMethod}</p>
                <hr>
                <h4>Productos:</h4>
                <ul>${invoiceItemsHtml}</ul>
                <div class="invoice-summary">
                    <p>Subtotal: $${invoice.subtotal.toFixed(2)}</p>
                    <p>IVA: $${invoice.tax.toFixed(2)}</p>
                    <p class="total">Total: $${invoice.total.toFixed(2)}</p>
                    ${changeHtml}
                </div>
            </div>
        </body>
        </html>
    `;

    const newWindow = window.open('', '_blank');
    newWindow.document.write(invoiceContent);
    newWindow.document.close();
    newWindow.print(); // Activar la impresión en la nueva ventana
};

const renderInvoiceHistory = (filteredInvoices = invoiceHistory) => {
    historyTableBody.innerHTML = '';
    historyCountSpan.textContent = filteredInvoices.length;

    if (filteredInvoices.length === 0) {
        noHistoryMessage.style.display = 'block';
        return;
    } else {
        noHistoryMessage.style.display = 'none';
    }

    filteredInvoices.forEach(invoice => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoice.id.substring(0, 8)}...</td>
            <td>${invoice.date}</td>
            <td>$${invoice.total.toFixed(2)}</td>
            <td>${invoice.paymentMethod}</td>
            <td><button data-id="${invoice.id}" class="view-details-btn">Ver Detalles</button></td>
        `;
        historyTableBody.appendChild(row);
    });
};

// --- Lógica de Filtrado del Historial ---
const filterInvoices = () => {
    const startDate = filterDateStart.value ? new Date(filterDateStart.value) : null;
    const endDate = filterDateEnd.value ? new Date(filterDateEnd.value) : null;
    const paymentMethod = filterPaymentMethod.value;
    const invoiceId = filterInvoiceId.value.trim().toLowerCase();

    let filtered = invoiceHistory;

    // Filtro por ID
    if (invoiceId) {
        filtered = filtered.filter(invoice => invoice.id.toLowerCase().includes(invoiceId));
    }

    // Filtro por fecha
    if (startDate) {
        filtered = filtered.filter(invoice => new Date(invoice.date) >= startDate);
    }
    if (endDate) {
        // Ajustar la fecha de fin para incluir todo el día
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
        filtered = filtered.filter(invoice => new Date(invoice.date) < adjustedEndDate);
    }

    // Filtro por método de pago
    if (paymentMethod !== 'all') {
        filtered = filtered.filter(invoice => invoice.paymentMethod === paymentMethod);
    }

    renderInvoiceHistory(filtered);
};

// --- Manejadores de eventos para los botones de filtro ---
applyFiltersBtn.addEventListener('click', filterInvoices);

clearFiltersBtn.addEventListener('click', () => {
    filterDateStart.value = '';
    filterDateEnd.value = '';
    filterPaymentMethod.value = 'all';
    filterInvoiceId.value = '';
    renderInvoiceHistory(); // Renderizar todas las facturas sin filtro
});

// --- Event listener para ver detalles de factura (delegación de eventos) ---
historyTableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('view-details-btn')) {
        const invoiceId = e.target.dataset.id;
        const invoice = invoiceHistory.find(inv => inv.id === invoiceId);
        if (invoice) {
            // Volvemos a usar la función que ya tenemos para mostrar la factura en una nueva ventana
            printInvoiceInNewWindow(invoice);
        }
    }
});


    // Asegúrate de que estas llamadas estén al final del script
    loadProducts();
    loadInvoiceHistory(); // Cargar el historial al inicio
    renderCart();
    renderAvailableProducts();
});