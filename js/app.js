$(document).ready(function() {
    // Fetch and display categories
    $.ajax({
        url: 'get_categorias.php',
        method: 'GET',
        dataType: 'json',
        success: function(categorias) {
            const container = $('#categorias-container');
            container.empty();
            if (categorias.error) {
                container.html('<p class="text-danger">Error al cargar categorías.</p>');
                return;
            }
            categorias.forEach(categoria => {
                const card = `
                    <div class="col-md-4 mb-4">
                        <div class="card shadow-sm">
                            <div class="card-body text-center">
                                <h5 class="card-title">${categoria.nombre}</h5>
                                <a href="#" class="btn btn-primary btn-sm categoria-link" data-id="${categoria.id}">Ver productos</a>
                            </div>
                        </div>
                    </div>
                `;
                container.append(card);
            });
        },
        error: function() {
            $('#categorias-container').html('<p class="text-danger">Error al cargar categorías.</p>');
        }
    });

    // Fetch and display products
    $.ajax({
        url: 'get_productos.php',
        method: 'GET',
        dataType: 'json',
        success: function(productos) {
            const container = $('#productos-container');
            container.empty();
            if (productos.error) {
                container.html('<p class="text-danger">Error al cargar productos.</p>');
                return;
            }
            productos.forEach(producto => {
                const imagen = producto.imagenes || 'https://via.placeholder.com/300x200';
                const card = `
                    <div class="col-md-4 mb-4">
                        <div class="card shadow-sm">
                            <img src="${imagen}" alt="${producto.nombre}" class="card-img-top">
                            <div class="card-body">
                                <h5 class="card-title">${producto.nombre}</h5>
                                <p class="card-text">${producto.caracteristicas || 'Sin descripción'}</p>
                                <p class="card-text"><strong>Categoría:</strong> ${producto.categoria}</p>
                                <p class="card-text"><strong>Precio:</strong> $${producto.precio}</p>
                                <button class="btn btn-primary btn-sm ver-detalles" data-id="${producto.id}">Ver detalles</button>
                            </div>
                        </div>
                    </div>
                `;
                container.append(card);
            });
        },
        error: function() {
            $('#productos-container').html('<p class="text-danger">Error al cargar productos.</p>');
        }
    });

    // Fetch and display reviews
    $.ajax({
        url: 'get_resenas.php',
        method: 'GET',
        dataType: 'json',
        success: function(resenas) {
            const container = $('#resenas-container');
            container.empty();
            if (resenas.error) {
                container.html('<p class="text-danger">Error al cargar reseñas.</p>');
                return;
            }
            resenas.forEach(resena => {
                const estrellas = '★'.repeat(resena.estrella) + '☆'.repeat(5 - resena.estrella);
                const card = `
                    <div class="col-md-4 mb-4">
                        <div class="card shadow-sm">
                            <div class="card-body">
                                <h6 class="card-title">${resena.producto}</h6>
                                <p class="card-text">${resena.contenido}</p>
                                <p class="card-text"><strong>Usuario:</strong> ${resena.usuario}</p>
                                <p class="card-text"><strong>Calificación:</strong> <span class="text-warning">${estrellas}</span></p>
                                <p class="card-text"><strong>Fecha:</strong> ${resena.fecha} ${resena.hora}</p>
                                <p class="card-text"><strong>Likes:</strong> ${resena.like} | <strong>Dislikes:</strong> ${resena.disLike}</p>
                            </div>
                        </div>
                    </div>
                `;
                container.append(card);
            });
        },
        error: function() {
            $('#resenas-container').html('<p class="text-danger">Error al cargar reseñas.</p>');
        }
    });

    // Handle product details modal
    $(document).on('click', '.ver-detalles', function() {
        const productId = $(this).data('id');
        $.ajax({
            url: 'get_productos.php',
            method: 'GET',
            dataType: 'json',
            success: function(productos) {
                const producto = productos.find(p => p.id == productId);
                if (producto) {
                    const imagen = producto.imagenes || 'https://via.placeholder.com/600x400';
                    const contenido = `
                        <div class="row">
                            <div class="col-md-6">
                                <img src="${imagen}" alt="${producto.nombre}" class="img-fluid rounded">
                            </div>
                            <div class="col-md-6">
                                <h4>${producto.nombre}</h4>
                                <p><strong>Categoría:</strong> ${producto.categoria}</p>
                                <p><strong>Precio:</strong> $${producto.precio}</p>
                                <p><strong>Características:</strong> ${producto.caracteristicas || 'Sin descripción'}</p>
                            </div>
                        </div>
                    `;
                    $('#modal-producto-titulo').text(producto.nombre);
                    $('#modal-producto-contenido').html(contenido);
                    $('#productoModal').modal('show');
                }
            }
        });
    });

    // Handle category filter
    $(document).on('click', '.categoria-link', function(e) {
        e.preventDefault();
        const categoryId = $(this).data('id');
        $.ajax({
            url: 'get_productos.php',
            method: 'GET',
            dataType: 'json',
            success: function(productos) {
                const container = $('#productos-container');
                container.empty();
                const filteredProductos = productos.filter(p => p.id_categoria == categoryId);
                if (filteredProductos.length === 0) {
                    container.html('<p class="text-center">No hay productos en esta categoría.</p>');
                    return;
                }
                filteredProductos.forEach(producto => {
                    const imagen = producto.imagenes || 'https://via.placeholder.com/300x200';
                    const card = `
                        <div class="col-md-4 mb-4">
                            <div class="card shadow-sm">
                                <img src="${imagen}" alt="${producto.nombre}" class="card-img-top">
                                <div class="card-body">
                                    <h5 class="card-title">${producto.nombre}</h5>
                                    <p class="card-text">${producto.caracteristicas || 'Sin descripción'}</p>
                                    <p class="card-text"><strong>Categoría:</strong> ${producto.categoria}</p>
                                    <p class="card-text"><strong>Precio:</strong> $${producto.precio}</p>
                                    <button class="btn btn-primary btn-sm ver-detalles" data-id="${producto.id}">Ver detalles</button>
                                </div>
                            </div>
                        </div>
                    `;
                    container.append(card);
                });
            }
        });
    });

    // Handle search functionality
    $('#search-button').click(function() {
        const query = $('#search-input').val().toLowerCase();
        $.ajax({
            url: 'get_productos.php',
            method: 'GET',
            dataType: 'json',
            success: function(productos) {
                const container = $('#productos-container');
                container.empty();
                const filteredProductos = productos.filter(p => p.nombre.toLowerCase().includes(query));
                if (filteredProductos.length === 0) {
                    container.html('<p class="text-center">No se encontraron productos.</p>');
                    return;
                }
                filteredProductos.forEach(producto => {
                    const imagen = producto.imagenes || 'https://via.placeholder.com/300x200';
                    const card = `
                        <div class="col-md-4 mb-4">
                            <div class="card shadow-sm">
                                <img src="${imagen}" alt="${producto.nombre}" class="card-img-top">
                                <div class="card-body">
                                    <h5 class="card-title">${producto.nombre}</h5>
                                    <p class="card-text">${producto.caracteristicas || 'Sin descripción'}</p>
                                    <p class="card-text"><strong>Categoría:</strong> ${producto.categoria}</p>
                                    <p class="card-text"><strong>Precio:</strong> $${producto.precio}</p>
                                    <button class="btn btn-primary btn-sm ver-detalles" data-id="${producto.id}">Ver detalles</button>
                                </div>
                            </div>
                        </div>
                    `;
                    container.append(card);
                });
            }
        });
    });

    // Handle login modal
    $('#user-btn').click(function(e) {
        e.preventDefault();
        $('#loginModal').modal('show');
    });

    $('#login-form').submit(function(e) {
        e.preventDefault();
        const nombre = $('#login-nombre').val();
        const ciudad = $('#login-ciudad').val();
        // Simulate login (you can extend this to save user data to the database if needed)
        localStorage.setItem('usuario', JSON.stringify({ nombre, ciudad }));
        $('#loginModal').modal('hide');
        alert(`Bienvenido, ${nombre}!`);
    });

    // Handle "Ver productos" button
    $('#ver-productos').click(function() {
        $('html, body').animate({
            scrollTop: $('#productos-container').offset().top
        }, 1000);
    });

    // Handle navigation links
    $('#categorias-link').click(function(e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $('#categorias-container').offset().top
        }, 1000);
    });

    $('#productos-link').click(function(e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $('#productos-container').offset().top
        }, 1000);
    });
});