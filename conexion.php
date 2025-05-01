<?php
$servername = "localhost"; // Reemplaza con tu servidor
$username = "root"; // Reemplaza con tu nombre de usuario de la base de datos
$password = ""; // Reemplaza con tu contraseña de la base de datos
$dbname = "empresa_comercial"; // Reemplaza con el nombre de tu base de datos

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Obtener categorías
$sql_categorias = "SELECT id, nombre FROM empresa_comercial_categoria";
$result_categorias = $conn->query($sql_categorias);
$categorias = array();
if ($result_categorias->num_rows > 0) {
    while($row = $result_categorias->fetch_assoc()) {
        $categorias[] = array(
            'id' => $row["id"],
            'nombre' => $row["nombre"]
        );
    }
}

// Obtener productos destacados
$sql_productos = "SELECT id, Nombre, Precio, Imagenes FROM empresa_comercial_productos LIMIT 8"; // Ejemplo: los 8 más recientes
$result_productos = $conn->query($sql_productos);
$productos = array();
if ($result_productos->num_rows > 0) {
    while($row = $result_productos->fetch_assoc()) {
        $productos[] = array(
            'id' => $row["id"],
            'nombre' => $row["Nombre"],
            'precio' => $row["Precio"],
            'imagen' => $row["Imagenes"] ? $row["Imagenes"] : 'https://via.placeholder.com/150'
        );
    }
}

// Obtener reseñas destacadas
$sql_resenas = "SELECT r.Contenido, r.Estrellas, u.Nombre AS nombre_usuario
                FROM empresa_comercial_reseña r
                INNER JOIN empresa_comercial_usuario u ON r.id_usuario = u.id
                ORDER BY r.Fecha DESC, r.Hora DESC
                LIMIT 3";
$result_resenas = $conn->query($sql_resenas);
$resenas = array();
if ($result_resenas->num_rows > 0) {
    while($row = $result_resenas->fetch_assoc()) {
        $resenas[] = array(
            'contenido' => $row["Contenido"],
            'estrellas' => $row["Estrellas"],
            'nombre_usuario' => $row["nombre_usuario"]
        );
    }
}

$conn->close();

$response = array(
    'categorias' => $categorias,
    'productos_destacados' => $productos,
    'resenas_destacadas' => $resenas
);

header('Content-Type: application/json');
echo json_encode($response);
?>