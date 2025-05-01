php
<?php
include 'conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $nombre = $_POST['nombre'];
    $ciudad = $_POST['ciudad'];

    if (empty($nombre) || empty($ciudad)) {
        echo json_encode(['success' => false, 'mensaje' => 'Nombre y ciudad son campos obligatorios.', 'usuario' => []]);
        exit;
    }

    $sql = "INSERT INTO empresa_comercial_usuario (Nombre, Ciudad) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $nombre, $ciudad);

    if ($stmt->execute()) {
        $usuario = ['Nombre' => $nombre, 'Ciudad' => $ciudad];
        echo json_encode(['success' => true, 'mensaje' => 'Usuario creado correctamente.', 'usuario' => $usuario]);
    } else {
        echo json_encode(['success' => false, 'mensaje' => 'Error al crear el usuario: ' . $stmt->error, 'usuario' => []]);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'mensaje' => 'Método no permitido.', 'usuario' => []]);
}
?>