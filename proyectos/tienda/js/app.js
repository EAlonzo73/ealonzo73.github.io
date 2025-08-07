document.addEventListener('DOMContentLoaded', () => {

    // Array de productos
    const productos = [
        { id: 1, nombre: 'Producto 1', precio: 10.00, imagen: 'images/producto1.jpg' },
        { id: 2, nombre: 'Producto 2', precio: 20.00, imagen: 'images/producto2.jpg' },
        // ... más productos
    ];

    let carrito = [];

    const catalogoProductos = document.querySelector('#productos');
    const carritoItems = document.querySelector('#carrito-items');
    const carritoTotal = document.querySelector('#carrito-total');
    const vaciarCarritoBtn = document.querySelector('#vaciar-carrito');
    const contadorCarrito = document.querySelector('#contador-carrito');

    // Cargar productos en el catálogo
    function renderizarProductos() {
        productos.forEach((producto) => {
            const productoDiv = document.createElement('div');
            productoDiv.classList.add('producto');

            productoDiv.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <h3>${producto.nombre}</h3>
                <p>$${producto.precio.toFixed(2)}</p>
                <button data-id="${producto.id}" class="agregar-carrito">Agregar al Carrito</button>
            `;

            catalogoProductos.appendChild(productoDiv);
        });
    }

    // Agregar producto al carrito
    function agregarAlCarrito(e) {
        if (e.target.classList.contains('agregar-carrito')) {
            const productoId = e.target.getAttribute('data-id');
            const productoSeleccionado = productos.find(producto => producto.id == productoId);
            
            // Comprobar si el producto ya está en el carrito
            const existe = carrito.some(producto => producto.id === productoSeleccionado.id);

            if (existe) {
                // Actualizar la cantidad
                const productos = carrito.map(producto => {
                    if (producto.id === productoSeleccionado.id) {
                        producto.cantidad++;
                        return producto;
                    } else {
                        return producto;
                    }
                });
                carrito = [...productos];
            } else {
                // Agregar al carrito
                const infoProducto = {
                    id: productoSeleccionado.id,
                    nombre: productoSeleccionado.nombre,
                    precio: productoSeleccionado.precio,
                    cantidad: 1
                }
                carrito = [...carrito, infoProducto];
            }
            renderizarCarrito();
        }
    }

    // Renderizar carrito en el HTML
    function renderizarCarrito() {
        // Limpiar HTML
        limpiarHTML();

        // Recorrer el carrito y generar el HTML
        carrito.forEach(producto => {
            const { id, nombre, precio, cantidad } = producto;
            const div = document.createElement('div');
            div.classList.add('carrito-item');
            div.innerHTML = `
                <p>${nombre}</p>
                <p>Precio: $${precio}</p>
                <p>Cantidad: ${cantidad}</p>
                <button data-id="${id}" class="eliminar-producto">Eliminar</button>
            `;
            carritoItems.appendChild(div);
        });

        actualizarTotal();
        guardarCarritoEnStorage();
    }

    // ... más funciones (eliminar, vaciar, etc.)

    // Event Listeners
    catalogoProductos.addEventListener('click', agregarAlCarrito);

    // ... más event listeners

    // Iniciar
    renderizarProductos();
});