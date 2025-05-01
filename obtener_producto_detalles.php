php
<?php
include 'conexion.php';

$productoId = $_GET['id'];

$sql = "SELECT p.Nombre, p.Precio, p.Características, p.Imagenes, p.Video, c.nombre AS nombre_categoria 
        FROM empresa_comercial_productos p
        INNER JOIN empresa_comercial_categoria c ON p.id_categoria = c.id
        WHERE p.id = ?";
        
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $productoId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $response = array(
        'Nombre' => $row['Nombre'],
        'Precio' => $row['Precio'],
        'Características' => $row['Características'],
        'Imagenes' => $row['Imagenes'],
        'Video' => $row['Video'],
        'nombre_categoria' => $row['nombre_categoria']
    );
    header('Content-Type: application/json');
    echo json_encode($response);
} else {
    header('Content-Type: application/json');
    echo json_encode(array('mensaje' => 'Producto no encontrado'));
}

$stmt->close();
$conn->close();
?>