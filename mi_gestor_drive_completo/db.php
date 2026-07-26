<?php
$host = 'localhost';
$dbname = 'gestor_drive';
$username = 'root';
$password = 'jirafasss07';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Eliminar el echo de aquí
} catch (PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}
?>
