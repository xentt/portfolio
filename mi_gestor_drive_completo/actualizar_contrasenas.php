<?php
require 'db.php';

// Seleccionar todos los usuarios de la base de datos
$stmt = $pdo->query("SELECT id, contraseña FROM usuarios");
$usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Recorrer los usuarios y actualizar la contraseña con el hash
foreach ($usuarios as $usuario) {
    // Hashear la contraseña
    $contraseñaHasheada = password_hash($usuario['contraseña'], PASSWORD_DEFAULT);

    // Actualizar la contraseña en la base de datos
    $updateStmt = $pdo->prepare("UPDATE usuarios SET contraseña = ? WHERE id = ?");
    $updateStmt->execute([$contraseñaHasheada, $usuario['id']]);
}

echo "Contraseñas actualizadas correctamente.";
?>
