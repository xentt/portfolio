<?php
session_start();
// Incluir archivo de conexión a la base de datos
require 'db.php'; // ¡Activado! Asegúrate que la ruta sea correcta y que defina $pdo.

// --- Lógica de procesamiento del formulario ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // La variable $pdo ahora debería estar disponible desde db.php

    try {
        // Verifica el token CSRF
        if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
            throw new Exception("Error de validación (CSRF). Intenta de nuevo.");
        }

        // Validación básica de campos vacíos
        if (empty($_POST['nombre']) || empty($_POST['email']) || empty($_POST['contraseña'])) {
            throw new Exception("Todos los campos son requeridos");
        }

        // Limpieza y obtención de datos
        $nombre = htmlspecialchars(trim($_POST['nombre']));
        $email = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
        $password = trim($_POST['contraseña']);

        // Validación de formato de email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Formato de correo electrónico inválido");
        }

        // --- Operaciones con Base de Datos (Ahora activas) ---
        // Verificar si el email ya existe
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);

        if ($stmt->rowCount() > 0) {
            throw new Exception("El correo electrónico ya está registrado");
        }

        // Hash de la contraseña
        $password_hash = password_hash($password, PASSWORD_BCRYPT);

        // Insertar nuevo usuario
        $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, email, contraseña) VALUES (?, ?, ?)");
        $stmt->execute([$nombre, $email, $password_hash]);

        // Éxito: Establecer mensaje y redirigir a index.php
        $_SESSION['exito_registro'] = "¡Registro exitoso! Ya puedes iniciar sesión.";
        header("Location: index.php");
        exit();
        // --- Fin Operaciones con Base de Datos ---

    } catch (PDOException $e) {
        // Error específico de base de datos
        // Podrías loggear $e->getMessage() para depuración interna
        $_SESSION['error_registro'] = "Error al procesar el registro. Intenta más tarde."; // Mensaje genérico para el usuario
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32)); // Regenerar token
        header("Location: registro.php");
        exit();
    } catch (Exception $e) {
        // Otros errores (validación, CSRF, etc.)
        $_SESSION['error_registro'] = $e->getMessage();
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32)); // Regenerar token
        header("Location: registro.php");
        exit();
    }
}

// Generar o regenerar token CSRF para mostrar en el formulario
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro | SuperviFile</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" integrity="sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWk5t3PyolY1cOd4DSE0Ga+ri4AuTroPR5aQvXU9xC6qOPnzFeg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script src="https://unpkg.com/@tailwindcss/browser@latest"></script>
    <style>
        /* --- Estilos COPIADOS de login_form_updated_v1 --- */
        /* Estilos generales */
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f0f4f8;
            margin: 0;
            overflow: hidden; /* Oculta el scroll durante la precarga */
        }

        /* Pantalla de precarga */
        #preload {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #f0f4f8;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            transition: opacity 0.5s ease;
        }

        #preload.hidden {
            opacity: 0;
            visibility: hidden;
        }

        /* Animación del spinner */
        .spinner {
            border: 6px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top-color: #8F99FB; /* Periwinkle */
            width: 60px;
            height: 60px;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Contenedor principal */
        .container-main {
            display: none; /* Oculto inicialmente */
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
            position: relative; /* Necesario para z-index de particles */
            z-index: 1;
        }

        /* Estilos de la tarjeta */
        .login-card { /* Usamos la misma clase para consistencia */
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(12px);
            border-radius: 18px;
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
            padding: 0;
            width: 100%;
            max-width: 450px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
            overflow: hidden;
            margin-top: 2rem;
            margin-bottom: 2rem;
        }

        .login-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
        }

        /* Encabezado de la tarjeta */
        .card-header {
            background: rgba(255, 255, 255, 0.03);
            padding: 25px;
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .card-header h4 {
            font-size: 26px;
            font-weight: 600;
            margin-bottom: 0;
            color: #34495e;
            text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .card-header i {
            margin-right: 12px;
            font-size: 1.2em;
            color: #8F99FB; /* Periwinkle */
            text-shadow: none;
        }

        /* Cuerpo de la tarjeta */
        .card-body {
            padding: 30px;
        }

        /* Etiquetas de formulario */
        .form-label {
            color: #4a5568;
            font-weight: 500;
            margin-bottom: 10px;
            display: block;
            transition: color 0.3s ease;
            text-shadow: 1px 0px 0px rgba(255,255,255,0.3);
        }

        .form-label:hover {
            color: #2d3748;
        }

        /* Campos de entrada */
        .form-control {
            background-color: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: #2d3748; /* Color de texto al escribir */
            padding: 14px 18px;
            margin-bottom: 22px; /* Espacio consistente */
            width: 100%;
            transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
            font-size: 16px;
            box-shadow: inset 0 2px 5px rgba(0,0,0, 0.08);
        }

        .form-control:focus {
            outline: none;
            background-color: rgba(255, 255, 255, 0.08);
            border-color: #8F99FB; /* Periwinkle */
            box-shadow: inset 0 2px 5px rgba(0,0,0, 0.08), 0 0 0 3px rgba(143, 153, 251, 0.3);
        }

        .form-control::placeholder {
            color: #a0aec0; /* Placeholder color consistente */
        }

        /* Iconos dentro de los inputs (si se usan) */
        .input-group-text {
            background-color: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-right: none; /* Asume icono a la izquierda */
            color: #4a5568;
            border-top-left-radius: 12px;
            border-bottom-left-radius: 12px;
            padding: 0 15px;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.03);
            transition: border-color 0.3s ease;
        }
        .input-group:focus-within .input-group-text {
            border-color: #8F99FB; /* Periwinkle */
        }

        /* Botón primario */
        .btn-primary {
            background-color: #8F99FB; /* Periwinkle */
            border: none;
            border-radius: 12px;
            color: white;
            padding: 12px 30px;
            width: 100%;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
            box-shadow: 0 6px 18px rgba(143, 153, 251, 0.15);
        }

        .btn-primary:hover {
            background-color: #7882e3;
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 10px 25px rgba(120, 130, 227, 0.25);
            animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
            0% { transform: translateY(-3px) scale(1.02); box-shadow: 0 10px 25px rgba(120, 130, 227, 0.25); }
            50% { transform: translateY(-3px) scale(1.04); box-shadow: 0 12px 30px rgba(120, 130, 227, 0.35); }
            100% { transform: translateY(-3px) scale(1.02); box-shadow: 0 10px 25px rgba(120, 130, 227, 0.25); }
        }

        .btn-primary:active {
            background-color: #5e66b7;
            transform: translateY(0) scale(1);
            box-shadow: 0 4px 10px rgba(94, 102, 183, 0.2);
            animation: none;
        }

        /* Alerta de error */
        .alert-danger {
            background-color: rgba(244, 67, 54, 0.05);
            border: 1px solid rgba(244, 67, 54, 0.1);
            border-radius: 12px;
            color: #e53e3e;
            padding: 15px;
            margin-bottom: 22px;
            animation: fadeIn 0.3s ease, shake 0.4s ease 0.1s;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }

        .alert-dismissible .btn-close {
            color: #e53e3e;
            opacity: 0.7;
            transition: opacity 0.3s ease;
            padding: 1rem;
        }

        .alert-dismissible .btn-close:hover { opacity: 1; }

        /* Clases de utilidad */
        .text-center { text-align: center; }

        .text-decoration-none {
            color: #8F99FB; /* Periwinkle */
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease, text-shadow 0.3s ease, background-color 0.3s ease;
            display: inline-block;
            padding: 4px 8px;
            border-radius: 8px;
            text-shadow: 1px 0px 0px rgba(255,255,255,0.3);
        }

        .text-decoration-none:hover {
            color: #7882e3;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
            background-color: rgba(143, 153, 251, 0.1);
        }

        .text-decoration-none:active { color: #5e66b7; text-shadow: none; }

        .my-4 {
            margin-top: 1.5rem; /* Margen reducido consistente */
            margin-bottom: 1.5rem; /* Margen reducido consistente */
            border-top: 1px solid rgba(255, 255, 255, 0.1); /* Borde más visible */
        }

        /* Fondo de partículas */
        #particles-js {
            position: fixed;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: 0;
        }
        /* --- Fin Estilos COPIADOS --- */
    </style>
</head>
<body class="bg-gray-100">
    <div id="preload">
        <div class="spinner"></div>
    </div>

    <div class="container-main" id="content">
        <div id="particles-js"></div>

        <div class="row justify-content-center w-100">
            <div class="col-lg-6 col-md-8 col-sm-10">
                <div class="login-card mx-auto">
                    <div class="card-header">
                        <h4><i class="fas fa-user-plus me-2"></i>Crear Cuenta</h4>
                    </div>
                    <div class="card-body p-4">
                        <?php if (isset($_SESSION['error_registro'])): ?>
                            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                                <?= htmlspecialchars($_SESSION['error_registro']) // Escapar salida ?>
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            </div>
                        <?php unset($_SESSION['error_registro']); endif; ?>

                        <form action="registro.php" method="POST">
                            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">

                            <div class="mb-3">
                                <label for="nombre" class="form-label">Nombre Completo</label>
                                <input type="text" name="nombre" id="nombre" class="form-control" placeholder="Tu nombre y apellido" required>
                            </div>

                            <div class="mb-3">
                                <label for="email" class="form-label">Correo Electrónico</label>
                                <input type="email" name="email" id="email" class="form-control" placeholder="tu@ejemplo.com" required>
                            </div>

                            <div class="mb-4">
                                <label for="contraseña" class="form-label">Contraseña</label>
                                <input type="password" name="contraseña" id="contraseña" class="form-control" placeholder="••••••••" required>
                            </div>

                            <button type="submit" class="btn btn-primary w-100 py-2 mt-3">
                                <i class="fas fa-user-check me-2"></i>Registrarse
                            </button>
                        </form>

                        <hr class="my-4">

                        <div class="text-center">
                            <a href="index.php" class="text-decoration-none">
                                ¿Ya tienes cuenta? Inicia Sesión
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
    <script>
        window.addEventListener('load', function() {
            const preload = document.getElementById('preload');
            const content = document.getElementById('content');

            setTimeout(function() {
                preload.classList.add('hidden');
                content.style.display = 'flex';
                document.body.style.overflow = 'auto';

                // Configuración de Particles.js (la misma que en login)
                particlesJS('particles-js', {
                    "particles": {
                        "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                        "color": { "value": "#8F99FB" },  // Periwinkle
                        "shape": { "type": "circle" },
                        "opacity": { "value": 0.4, "random": true, "anim": { "enable": true, "speed": 0.8, "opacity_min": 0.1, "sync": false } },
                        "size": { "value": 3, "random": true },
                        "line_linked": { "enable": true, "distance": 150, "color": "#808080", "opacity": 0.4, "width": 1 },
                        "move": { "enable": true, "speed": 3, "direction": "none", "out_mode": "out" }
                    },
                    "interactivity": {
                        "detect_on": "canvas",
                        "events": { "onhover": { "enable": true, "mode": "repulse" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
                        "modes": { "repulse": { "distance": 100, "duration": 0.4 }, "push": { "particles_nb": 4 } }
                    },
                    "retina_detect": true
                });
            }, 500); // Tiempo de precarga
        });
    </script>
</body>
</html>
