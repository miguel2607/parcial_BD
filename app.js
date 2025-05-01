// Configuración de la API
const API_URL = 'http://localhost:5000/api';

// Variables globales
let usuarioActual = null;

// Función para manejar errores de fetch
const handleFetchError = (error) => {
    console.error('Error en la solicitud:', error);
    alert('Ha ocurrido un error al comunicarse con el servidor.');
};

// Función para cargar categorías
const cargarCategorias = async () => {
    try {
        const response = await fetch(`${API_URL}/categorias`);
        if (!response.ok) throw new Error('Error al cargar categorías');
        
        const categorias = await response.json();
        const container = document.getElementById('categorias-container');
        container.innerHTML = '';
        
        categorias.forEach(categoria => {
            const col = document.createElement('div');
            col.className = 'col-md-3 col-sm-6 mb-4';
            col.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <div class="card-body text-center">
                        <i class="fas fa-folder fa-3x mb-3 text-primary"></i>
                        <h5 class="card-title">${categoria.nombre}</h5>
                        <p class="card-text small">${categoria.descripcion}</p>
                        <button class="btn btn-outline-primary btn-sm ver-categoria" data-id="${categoria.id}">
                            Ver productos
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });
        
        // Agregar listeners a los botones
        document.querySelectorAll('.ver-categoria').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const categoriaId = e.target.getAttribute('data-id');
                cargarProductos(categoriaId);
            });
        });
    } catch (error) {
        handleFetchError(error);
    }
};

// Función para cargar productos
const cargarProductos = async (categoriaId = null, busqueda = null) => {
    try {
        let url = `${API_URL}/productos`;
        const params = [];
        
        if (categoriaId) params.push(`categoria=${categoriaId}`);
        if (busqueda) params.push(`busqueda=${encodeURIComponent(busqueda)}`);
        
        if (params.length > 0) {
            url += '?' + params.join('&');
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al cargar productos');
        
        const productos = await response.json();
        const container = document.getElementById('productos-container');
        container.innerHTML = '';
        
        if (productos.length === 0) {
            container.innerHTML = '<div class="col-12 text-center"><p>No se encontraron productos.</p></div>';
            return;
        }
        
        productos.forEach(producto => {
            const col = document.createElement('div');
            col.className = 'col-md-3 col-sm-6 mb-4';
            col.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${producto.Nombre}</h5>
                        <p class="card-text small">${producto.Caracteristicas.substring(0, 100)}...</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-primary fw-bold">${producto.Precio} €</span>
                            <button class="btn btn-sm btn-primary ver-producto" data-id="${producto.id}">
                                Ver detalles
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });
        
        // Agregar listeners a los botones
        document.querySelectorAll('.ver-producto').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productoId = e.target.getAttribute('data-id');
                abrirModalProducto(productoId);
            });
        });
    } catch (error) {
        handleFetchError(error);
    }
};

// Función para cargar reseñas destacadas
const cargarResenas = async () => {
    try {
        const response = await fetch(`${API_URL}/resenas`);
        if (!response.ok) throw new Error('Error al cargar reseñas');
        
        const resenas = await response.json();
        const container = document.getElementById('resenas-container');
        container.innerHTML = '';
        
        resenas.forEach(resena => {
            const col = document.createElement('div');
            col.className = 'col-md-6 mb-4';
            
            let estrellas = '';
            for (let i = 0; i < resena.Estrellita; i++) {
                estrellas += '<i class="fas fa-star text-warning"></i>';
            }
            for (let i = resena.Estrellita; i < 5; i++) {
                estrellas += '<i class="far fa-star text-warning"></i>';
            }
            
            col.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between mb-2">
                            <h5 class="card-title">${resena.producto_nombre}</h5>
                            <div>${estrellas}</div>
                        </div>
                        <p class="card-text">${resena.Contenido}</p>
                        <p class="card-text small text-muted">Por ${resena.usuario_nombre} - ${new Date(resena.Fecha).toLocaleDateString()}</p>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });
    } catch (error) {
        handleFetchError(error);
    }
};

// Función para abrir el modal con detalles del producto
const abrirModalProducto = async (productoId) => {
    try {
        const response = await fetch(`${API_URL}/productos/${productoId}`);
        if (!response.ok) throw new Error('Error al cargar detalles del producto');
        
        const producto = await response.json();
        const modal = new bootstrap.Modal(document.getElementById('productoModal'));
        
        document.getElementById('modal-producto-titulo').textContent = producto.Nombre;
        
        let resenasHTML = '';
        if (producto.reseñas && producto.reseñas.length > 0) {
            producto.reseñas.forEach(resena => {
                let estrellas = '';
                for (let i = 0; i < resena.Estrellita; i++) {
                    estrellas += '<i class="fas fa-star text-warning"></i>';
                }
                for (let i = resena.Estrellita; i < 5; i++) {
                    estrellas += '<i class="far fa-star text-warning"></i>';
                }
                
                resenasHTML += `
                    <div class="border-top my-3 pt-3">
                        <div class="d-flex justify-content-between">
                            <h6>${resena.usuario_nombre}</h6>
                            <div>${estrellas}</div>
                        </div>
                        <p>${resena.Contenido}</p>
                        <small class="text-muted">${new Date(resena.Fecha).toLocaleDateString()} ${resena.Hora}</small>
                    </div>
                `;
            });
        } else {
            resenasHTML = '<p class="text-center my-3">No hay reseñas para este producto.</p>';
        }
        
        document.getElementById('modal-producto-contenido').innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <img src="https://via.placeholder.com/400x300" alt="${producto.Nombre}" class="img-fluid rounded">
                </div>
                <div class="col-md-6">
                    <h4>${producto.Nombre}</h4>
                    <p class="text-primary fw-bold h5">${producto.Precio} €</p>
                    <p><strong>Categoría:</strong> ${producto.categoria_nombre}</p>
                    <div class="mb-3">
                        <h5>Características:</h5>
                        <p>${producto.Caracteristicas}</p>
                    </div>
                    <button class="btn btn-primary" id="btn-comprar-producto" data-id="${producto.id}">
                        <i class="fas fa-shopping-cart me-2"></i>Comprar
                    </button>
                </div>
            </div>
            <div class="row mt-4">
                <div class="col-12">
                    <h5>Reseñas</h5>
                    ${resenasHTML}
                    ${usuarioActual ? `
                        <div class="mt-4">
                            <h6>Añadir reseña</h6>
                            <form id="form-reseña">
                                <input type="hidden" id="producto-id" value="${producto.id}">
                                <div class="mb-3">
                                    <label for="reseña-estrellas" class="form-label">Calificación</label>
                                    <select class="form-select" id="reseña-estrellas" required>
                                        <option value="5">5 estrellas</option>
                                        <option value="4">4 estrellas</option>
                                        <option value="3">3 estrellas</option>
                                        <option value="2">2 estrellas</option>
                                        <option value="1">1 estrella</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="reseña-titulo" class="form-label">Título</label>
                                    <input type="text" class="form-control" id="reseña-titulo" required>
                                </div>
                                <div class="mb-3">
                                    <label for="reseña-contenido" class="form-label">Comentario</label>
                                    <textarea class="form-control" id="reseña-contenido" rows="3" required></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary">Enviar reseña</button>
                            </form>
                        </div>
                    ` : `
                        <div class="alert alert-info mt-4">
                            <i class="fas fa-info-circle me-2"></i>
                            Inicia sesión para dejar una reseña.
                        </div>
                    `}
                </div>
            </div>
        `;
        
        // Agregar listener al formulario de reseña si el usuario está logueado
        if (usuarioActual) {
            document.getElementById('form-reseña').addEventListener('submit', enviarResena);
        }
        
        modal.show();
    } catch (error) {
        handleFetchError(error);
    }
};

// Función para enviar una reseña
const enviarResena = async (e) => {
    e.preventDefault();
    
    if (!usuarioActual) {
        alert('Debes iniciar sesión para dejar una reseña.');
        return;
    }
    
    const productoId = document.getElementById('producto-id').value;
    const estrellas = parseInt(document.getElementById('reseña-estrellas').value);
    const titulo = document.getElementById('reseña-titulo').value;
    const contenido = document.getElementById('reseña-contenido').value;
    
    try {
        const response = await fetch(`${API_URL}/resenas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario_id: usuarioActual.id,
                producto_id: productoId,
                contenido: contenido,
                reseña: titulo,
                estrellita: estrellas
            })
        });
        
        if (!response.ok) throw new Error('Error al enviar reseña');
        
        const data = await response.json();
        
        if (data.success) {
            alert('Reseña enviada con éxito.');
            // Recargar detalles del producto para mostrar la nueva reseña
            abrirModalProducto(productoId);
            // Recargar reseñas destacadas
            cargarResenas();
        }
    } catch (error) {
        handleFetchError(error);
    }
};

// Función para iniciar sesión
const iniciarSesion = async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('login-nombre').value;
    const ciudad = document.getElementById('login-ciudad').value;
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: nombre,
                ciudad: ciudad
            })
        });
        
        if (!response.ok) throw new Error('Error en el inicio de sesión');
        
        const data = await response.json();
        
        if (data.success) {
            usuarioActual = data.usuario;
            
            // Guardar usuario en localStorage
            localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
            
            // Ocultar modal
            bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
            
            // Actualizar UI
            actualizarUIUsuario();
            
            alert(`¡Bienvenido, ${usuarioActual.Nombre}!`);
        }
    } catch (error) {
        handleFetchError(error);
    }
};

// Función para cerrar sesión
const cerrarSesion = () => {
    usuarioActual = null;
    localStorage.removeItem('usuarioActual');
    actualizarUIUsuario();
    alert('Sesión cerrada.');
};

// Función para actualizar la UI según el estado de la sesión
const actualizarUIUsuario = () => {
    const userBtn = document.getElementById('user-btn');
    
    if (usuarioActual) {
        userBtn.innerHTML = `<i class="fas fa-user-check"></i>`;
        userBtn.title = `${usuarioActual.Nombre} (${usuarioActual.Ciudad})`;
        
        // Convertir a dropdown
        userBtn.className = 'btn btn-outline-light dropdown-toggle ms-2';
        userBtn.setAttribute('data-bs-toggle', 'dropdown');
        userBtn.setAttribute('aria-expanded', 'false');
        
        // Crear menú dropdown
        const dropdownMenu = document.createElement('ul');
        dropdownMenu.className = 'dropdown-menu dropdown-menu-end';
        dropdownMenu.innerHTML = `
            <li><span class="dropdown-item-text"><strong>${usuarioActual.Nombre}</strong></span></li>
            <li><span class="dropdown-item-text">${usuarioActual.Ciudad}</span></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" id="logout-btn">Cerrar sesión</a></li>
        `;
        
        // Insertar después del botón
        userBtn.parentNode.insertBefore(dropdownMenu, userBtn.nextSibling);
        
        // Agregar listener al botón de cerrar sesión
        document.getElementById('logout-btn').addEventListener('click', cerrarSesion);
    } else {
        userBtn.innerHTML = `<i class="fas fa-user"></i>`;
        userBtn.title = 'Iniciar sesión';
        userBtn.className = 'btn btn-outline-light ms-2';
        userBtn.removeAttribute('data-bs-toggle');
        userBtn.removeAttribute('aria-expanded');
        
        // Eliminar menú dropdown si existe
        const nextSibling = userBtn.nextSibling;
        if (nextSibling && nextSibling.className && nextSibling.className.includes('dropdown-menu')) {
            nextSibling.remove();
        }
        
        // Restaurar comportamiento original
        userBtn.addEventListener('click', () => {
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
        });
    }
};

// Eventos cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    // Comprobar si hay un usuario en localStorage
    const storedUser = localStorage.getItem('usuarioActual');
    if (storedUser) {
        usuarioActual = JSON.parse(storedUser);
    }
    
    // Actualizar UI según estado de sesión
    actualizarUIUsuario();
    
    // Cargar datos iniciales
    cargarCategorias();
    cargarProductos();
    cargarResenas();
    
    // Event listener para el formulario de login
    document.getElementById('login-form').addEventListener('submit', iniciarSesion);
    
    // Event listener para el botón de usuario
    document.getElementById('user-btn').addEventListener('click', () => {
        if (!usuarioActual) {
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
        }
    });
    
    // Event listener para el enlace de categorías
    document.getElementById('categorias-link').addEventListener('click', (e) => {
        e.preventDefault();
        cargarCategorias();
        // Desplazar a la sección de categorías
        document.querySelector('section:nth-of-type(2)').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Event listener para el enlace de productos
    document.getElementById('productos-link').addEventListener('click', (e) => {
        e.preventDefault();
        cargarProductos();
        // Desplazar a la sección de productos
        document.querySelector('section:nth-of-type(3)').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Event listener para el botón del banner
    document.getElementById('ver-productos').addEventListener('click', () => {
        cargarProductos();
        // Desplazar a la sección de productos
        document.querySelector('section:nth-of-type(3)').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Event listener para la búsqueda
    document.getElementById('search-button').addEventListener('click', () => {
        const busqueda = document.getElementById('search-input').value.trim();
        if (busqueda) {
            cargarProductos(null, busqueda);
            // Desplazar a la sección de productos
            document.querySelector('section:nth-of-type(3)').scrollIntoView({ behavior: 'smooth' });
        }
    });
    
    // Event listener para buscar al presionar Enter
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const busqueda = e.target.value.trim();
            if (busqueda) {
                cargarProductos(null, busqueda);
                // Desplazar a la sección de productos
                document.querySelector('section:nth-of-type(3)').scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});