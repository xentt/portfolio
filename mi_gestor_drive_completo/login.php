<?php
session_start();
require 'db.php';

if($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        if(!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
            throw new Exception("Solicitud inválida");
        }

        if(empty($_POST['email']) || empty($_POST['contraseña'])) {
            throw new Exception("Todos los campos son requeridos");
        }

        $email = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
        $password = trim($_POST['contraseña']);

        if(!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Credenciales inválidas");
        }

        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if(!$usuario || !password_verify($password, $usuario['contraseña'])) {
            throw new Exception("Credenciales inválidas");
        }

        $_SESSION['usuario'] = [
            'id' => $usuario['id'],
            'nombre' => $usuario['nombre'],
            'email' => $usuario['email'],
            'ip' => $_SERVER['REMOTE_ADDR'],
            'user_agent' => $_SERVER['HTTP_USER_AGENT']
        ];

        session_regenerate_id(true);
        $_SESSION['conexion_exitosa'] = true;
        header("Location: dashboard.php");
        exit();

    } catch(Exception $e) {
        $_SESSION['error_login'] = $e->getMessage();
        header("Location: index.php");
        exit();
    }
}