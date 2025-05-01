$(document).ready(function() {
    // Cargar todos los datos iniciales
    $.ajax({
        url: 'obtener_datos_inicio.php',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            // Cargar categorías
            var categoriasContainer = $('#categorias-container');
            categoriasContainer.empty();
            $.each(data.categorias, function(index, categoria) {
                categoriasContainer.append('<div class="col-md-3 mb-4"><div class="card"><div class="card-body"><h5 class="card-title">' + categoria.nombre + '</h5><a href="#" class="btn btn-outline-primary btn-sm">Ver más</a></div></div></div>');
            });

            // Cargar productos destacados
            var productosContainer = $('#productos-container');
            productosContainer.empty();
            $.each(data.productos_destacados, function(index, producto) {
                productosContainer.append('<div class="col-md-3 mb-4"><div class="card"><img src="' + producto.imagen + '" class="card-img-top" alt="' + producto.nombre + '"><div class="card-body"><h5 class="card-title">' + producto.nombre + '</h5><p class="card-text">$' + producto.precio + '</p><button class="btn btn-primary btn-sm detalles-producto" data-id="' + producto.id + '">Ver detalles</button></div></div></div>');
            });

            // Cargar reseñas destacadas
            var resenasContainer = $('#resenas-container');
            resenasContainer.empty();
            $.each(data.resenas_destacadas, function(index, resena) {
                resenasContainer.append('<div class="col-md-4 mb-3"><div class="card"><div class="card-body"><p class="card-text">"' + resena.contenido + '"</p><p class="card-text"><small class="text-muted">-' + resena.nombre_usuario + ' (' + '*'.repeat(resena.estrellas) + ')</small></p></div></div></div>');
            });
        },
        error: function() {
            alert('Error al cargar los datos iniciales.');
        }
    });

    // Evento para mostrar detalles del producto (sin cambios)
    $(document).on('click', '.detalles-producto', function() {
        var productoId = $(this).data('id');
        $.ajax({
            url: 'obtener_producto_detalles.php?id=' + productoId, // Mantiene el archivo separado para detalles
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                $('#modal-producto-titulo').text(data.Nombre);
                var contenidoModal = `
                    <div class="row">
                        <div class="col-md-6">
                            <img src="${data.Imagenes ? data.Imagenes : 'https://via.placeholder.com/300'}" class="img-fluid rounded shadow" alt="${data.Nombre}">
                        </div>
                        <div class="col-md-6">
                            <h3>${data.Nombre}</h3>
                            <p class="lead">$${data.Precio}</p>
                            <p><strong>Categoría:</strong> ${data.nombre_categoria}</p>
                            <p>${data.Características}</p>
                            ${data.Video ? `<p><a href="${data.Video}" target="_blank">Ver video</a></p>` : ''}
                            </div>
                    </div>
                `;
                $('#modal-producto-contenido').html(contenidoModal);
                $('#productoModal').modal('show');
            },
            error: function() {
                alert('Error al cargar los detalles del producto.');
            }
        });
    });

    // Evento para el formulario de inicio de sesión (sin cambios)
    $('#login-form').submit(function(event) {
        event.preventDefault();
        var nombre = $('#login-nombre').val();
        var ciudad = $('#login-ciudad').val();

        $.ajax({
            url: 'login.php', // Mantiene el archivo separado para el login
            type: 'POST',
            dataType: 'json',
            data: { nombre: nombre, ciudad: ciudad },
            success: function(response) {
                if (response.success) {
                    alert(response.mensaje + ', bienvenido ' + response.usuario.Nombre + ' de ' + response.usuario.Ciudad);
                    $('#loginModal').modal('hide');
                    // Aquí podrías actualizar la interfaz de usuario para mostrar que el usuario ha iniciado sesión
                } else {
                    alert(response.mensaje);
                }
            },
            error: function() {
                alert('Error al intentar iniciar sesión.');
            }
        });
    });

    // Mostrar modal de inicio de sesión al hacer clic en el botón de usuario (sin cambios)
    $('#user-btn').click(function(e) {
        e.preventDefault();
        $('#loginModal').modal('show');
    });
});