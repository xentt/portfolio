<?php
session_start();
// Redirige si el usuario ya ha iniciado sesión
if (isset($_SESSION['usuario'])) {
    header("Location: dashboard.php");
    exit();
}

// Genera un token CSRF para proteger contra ataques CSRF
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));
if (empty($_SESSION['csrf_token']) || isset($_SESSION['error_login'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
$error = $_SESSION['error_login'] ?? null;
unset($_SESSION['error_login']);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión | SuperviFile</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" integrity="sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWk5t3PyolY1cOd4DSE0Ga+ri4AuTroPR5aQvXU9xC6qOPnzFeg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script src="https://unpkg.com/@tailwindcss/browser@latest"></script>
    <style>
        /* Estilos generales (Originales) */
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f0f4f8;
            margin: 0;
            overflow: hidden; /* Oculta el scroll durante la precarga */
        }

        /* Pantalla de precarga (Original) */
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

        /* Animación del spinner (Original) */
        .spinner {
            border: 6px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top-color: #8F99FB;  /* Periwinkle */
            width: 60px;
            height: 60px;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Contenedor principal (Original, renombrado para evitar conflicto) */
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

        /* Estilos de la tarjeta de inicio de sesión (Originales) */
        .login-card {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(12px);
            border-radius: 18px;
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
            /* Padding original se maneja en header/body */
            padding: 0; /* Ajustado para que header/body controlen padding */
            width: 100%;
            max-width: 450px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
            overflow: hidden; /* Añadido para bordes redondeados */
            margin-top: 2rem; /* Margen original preservado */
            margin-bottom: 2rem; /* Margen original preservado */
        }

        .login-card:hover {
            transform: translateY(-6px); /* Efecto hover original */
            box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18); /* Sombra hover original */
        }

        /* Encabezado de la tarjeta (Original) */
        .card-header {
            background: rgba(255, 255, 255, 0.03);
            padding: 25px; /* Padding original */
            text-align: center;
            /* border-top-left-radius: 18px; */ /* Eliminado por overflow:hidden en .login-card */
            /* border-top-right-radius: 18px; */ /* Eliminado por overflow:hidden en .login-card */
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .card-header h4 {
            font-size: 26px; /* Tamaño original */
            font-weight: 600; /* Peso original */
            margin-bottom: 0;
            color: #34495e; /* Color original */
            text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3); /* Sombra original */
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .card-header i {
            margin-right: 12px;
            font-size: 1.2em; /* Tamaño original */
            color: #8F99FB; /* Periwinkle */
            text-shadow: none;
        }

        /* Cuerpo de la tarjeta (Original) */
        .card-body {
            padding: 30px; /* Padding ajustado (antes era p-4 en HTML) */
        }

        /* Etiquetas de formulario (Original) */
        .form-label {
            color: #4a5568;
            font-weight: 500; /* Peso original */
            margin-bottom: 10px; /* Margen original */
            display: block;
            transition: color 0.3s ease;
            text-shadow: 1px 0px 0px rgba(255,255,255,0.3);
        }

        .form-label:hover {
            color: #2d3748; /* Hover original */
        }

        /* --- INICIO: Estilos MEJORADOS para Inputs --- */
        .form-control {
            background-color: rgba(255, 255, 255, 0.04); /* Fondo sutil */
            border: 1px solid rgba(255, 255, 255, 0.1); /* Borde inicial */
            border-radius: 12px; /* Bordes redondeados consistentes */
            color: #2d3748;
            padding: 14px 18px; /* Más padding */
            margin-bottom: 0px; /* Espacio inferior original */
            width: 100%;
            transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
            font-size: 16px;
            box-shadow: inset 0 2px 5px rgba(0,0,0, 0.08); /* Sombra interior más visible */
        }

        .form-control:focus {
            outline: none;
            background-color: rgba(255, 255, 255, 0.08); /* Fondo más claro al enfocar */
            border-color: #8F99FB; /* Periwinkle */
            box-shadow: inset 0 2px 5px rgba(0,0,0, 0.08), 0 0 0 3px rgba(143, 153, 251, 0.3); /* Sombra interior y exterior (glow) */
        }
        /* --- FIN: Estilos MEJORADOS para Inputs --- */

        .form-control::placeholder {
            color: #a0aec0;
            text-shadow: 1px 0px 0px rgba(255,255,255,0.3);
        }

        /* Iconos dentro de los inputs (Original + Mejora de borde en focus) */
        .input-group-text {
            background-color: rgba(255, 255, 255, 0.02); /* Fondo original */
            border: 1px solid rgba(255, 255, 255, 0.08); /* Borde original */
            border-right: none;
            color: #4a5568;
            border-top-left-radius: 12px; /* Redondeo consistente */
            border-bottom-left-radius: 12px; /* Redondeo consistente */
            padding: 0 15px; /* Padding ajustado */
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.03); /* Sombra original */
            transition: border-color 0.3s ease; /* Añadido para transición de borde */
        }
        /* Ajuste para que el borde del icono cambie junto con el input */
        .form-control:focus + .input-group-text,
        .input-group:focus-within .input-group-text
        {
            border-color: #8F99FB; /* Periwinkle */
        }

        /* Botón primario (Original Base) */
        .btn-primary {
            background-color: #8F99FB; /* Periwinkle */
            border: none;
            border-radius: 12px; /* Redondeo consistente */
            color: white;
            padding: 12px 30px; /* Padding original */
            width: 100%;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            /* Transición original + transform + animación */
            transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
            /* Sombra original ligeramente ajustada */
            box-shadow: 0 6px 18px rgba(143, 153, 251, 0.15);
        }

        /* --- INICIO: Estilos MEJORADOS para Botón (Hover/Active/Animación) --- */
        .btn-primary:hover {
            background-color: #7882e3; /* Color hover original */
            transform: translateY(-3px) scale(1.02); /* Levanta y escala ligeramente */
            box-shadow: 0 10px 25px rgba(120, 130, 227, 0.25); /* Sombra hover mejorada */
            animation: pulse 1.5s infinite; /* Animación de pulso añadida */
        }

        /* Keyframes para la animación de pulso */
        @keyframes pulse {
            0% {
                transform: translateY(-3px) scale(1.02);
                box-shadow: 0 10px 25px rgba(120, 130, 227, 0.25);
            }
            50% {
                transform: translateY(-3px) scale(1.04); /* Escala un poco más */
                box-shadow: 0 12px 30px rgba(120, 130, 227, 0.35); /* Sombra más intensa */
            }
            100% {
                transform: translateY(-3px) scale(1.02);
                box-shadow: 0 10px 25px rgba(120, 130, 227, 0.25);
            }
        }

        .btn-primary:active {
            background-color: #5e66b7; /* Color active mejorado */
            transform: translateY(0) scale(1); /* Vuelve a la posición original */
            box-shadow: 0 4px 10px rgba(94, 102, 183, 0.2); /* Sombra active mejorada */
            animation: none; /* Detiene la animación al hacer clic */
        }
        /* --- FIN: Estilos MEJORADOS para Botón --- */

        /* Alerta de error (Original + Animación) */
        .alert-danger {
            background-color: rgba(244, 67, 54, 0.05);
            border: 1px solid rgba(244, 67, 54, 0.1);
            border-radius: 12px;
            color: #e53e3e;
            padding: 15px;
            margin-bottom: 22px;
            animation: fadeIn 0.3s ease, shake 0.4s ease 0.1s; /* Animación shake mejorada */
        }

        @keyframes fadeIn { /* Animación original */
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes shake { /* Animación original */
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }

        .alert-dismissible .btn-close { /* Estilo original */
            color: #e53e3e;
            opacity: 0.7;
            transition: opacity 0.3s ease;
            padding: 1rem; /* Padding mejorado */
        }

        .alert-dismissible .btn-close:hover { /* Estilo original */
            opacity: 1;
        }

        /* Clases de utilidad (Originales) */
        .text-center { text-align: center; }

        .text-decoration-none {
            color: #8F99FB; /* Periwinkle */
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease, text-shadow 0.3s ease, background-color 0.3s ease; /* Añadido background-color */
            display: inline-block;
            padding: 4px 8px; /* Padding mejorado */
            border-radius: 8px; /* Redondeo mejorado */
            text-shadow: 1px 0px 0px rgba(255,255,255,0.3);
        }

        .text-decoration-none:hover {
            color: #7882e3; /* Hover original */
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1); /* Hover original */
            background-color: rgba(143, 153, 251, 0.1); /* Fondo sutil al pasar el cursor */
        }

        .text-decoration-none:active { /* Estilo original */
            color: #5e66b7;
            text-shadow: none;
        }

        .my-4 { /* Estilo original */
            margin-top: 2rem;
            margin-bottom: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        /* Fondo de partículas (Original) */
        #particles-js {
            position: fixed;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: 0;
        }

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
                        <h4><i class="fas fa-folder me-2"></i>SuperviFile</h4>
                    </div>
                    <div class="card-body p-4">
                        <?php if (isset($_SESSION['error_login'])): ?>
                            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                                <?= htmlspecialchars($_SESSION['error_login']) ?>
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            </div>
                        <?php unset($_SESSION['error_login']); endif; ?>

                        <form action="login.php" method="POST">
    <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">

                            <div class="mb-3">
                                <label for="emailInput" class="form-label">Correo electrónico</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                                    <input type="email" id="emailInput" name="email" class="form-control" placeholder="" required>
                                </div>
                            </div>

                            <div class="mb-4">
                                <label for="passwordInput" class="form-label">Contraseña</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-lock"></i></span>
                                    <input type="password" id="passwordInput" name="contraseña" class="form-control" placeholder="" required>
                                </div>
                            </div>

                            <button type="submit" class="btn btn-primary w-100 py-2 mt-3">
                                <i class="fas fa-sign-in-alt me-2"></i>Ingresar
                            </button>
                        </form>

                        <hr class="my-4">

                        <div class="text-center">
                            <a href="registro.php" class="text-decoration-none">
                                ¿No tienes cuenta? Regístrate
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
            const content = document.getElementById('content'); // ID del contenedor principal

            setTimeout(function() {
                preload.classList.add('hidden');
                content.style.display = 'flex'; // Asegurarse que se muestre como flex
                document.body.style.overflow = 'auto'; // Restaurar scroll

                // Configuración original de Particles.js
                particlesJS('particles-js', {
                    "particles": {
                        "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                        "color": { "value": "#8F99FB" }, // Periwinkle
                        "shape": { "type": "circle", "stroke": { "width": 0, "color": "#000000" }, "polygon": { "nb_sides": 5 } },
                        "opacity": { "value": 0.4, "random": true, "anim": { "enable": true, "speed": 0.8, "opacity_min": 0.1, "sync": false } },
                        "size": { "value": 3, "random": true, "anim": { "enable": false, "speed": 40, "size_min": 0.1, "sync": false } },
                        "line_linked": { "enable": true, "distance": 150, "color": "#808080", "opacity": 0.4, "width": 1 }, // Color original líneas
                        "move": { "enable": true, "speed": 3, "direction": "none", "random": false, "straight": false, "out_mode": "out", "attract": { "enable": false, "rotateX": 600, "rotateY": 1200 } }
                    },
                    "interactivity": {
                        "detect_on": "canvas",
                        "events": { "onhover": { "enable": true, "mode": "repulse" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
                        "modes": {
                            "grab": { "distance": 400, "line_linked": { "opacity": 1 } },
                            "bubble": { "distance": 400, "size": 40, "duration": 2, "opacity": 0.8, "speed": 3 },
                            "repulse": { "distance": 200, "duration": 0.4 }, // Distancia original repulse
                            "push": { "particles_nb": 4 },
                            "remove": { "particles_nb": 2 }
                        }
                    },
                    "retina_detect": true
                });
            }, 500); // Tiempo de precarga ajustado
        });
    </script>
</body>
</html>
