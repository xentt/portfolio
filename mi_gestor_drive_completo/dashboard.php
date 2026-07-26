
<?php
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");
error_reporting(E_ALL & ~E_DEPRECATED);
ini_set('display_errors', 1);
session_start();
if (!isset($_SESSION['usuario'])) {
    header("Location: index.php");
    exit();
}

$credentialsPath = __DIR__ . '/api-drive/sistema-gestor-de-archivos-c81c3bf51991.json';
if (!file_exists($credentialsPath)) {
    die("Error: Archivo de credenciales no encontrado en: " . $credentialsPath);
}

putenv("GOOGLE_APPLICATION_CREDENTIALS=" . $credentialsPath);
define("RAIZ", "14NeVYJ4oXB5KVTl5GhmEoQpTK0eoVOam");

require_once __DIR__ . '/api-drive/vendor/autoload.php';

try {
    $client = new Google_Client();
    $client->setAuthConfig(getenv("GOOGLE_APPLICATION_CREDENTIALS"));
    $client->addScope(Google_Service_Drive::DRIVE);
$client->addScope(Google_Service_Drive::DRIVE_FILE);
$client->addScope(Google_Service_Drive::DRIVE);;
$client->addScope(Google_Service_Drive::DRIVE_METADATA);
$client->addScope(Google_Service_Drive::DRIVE_APPDATA);
    $client->setAccessType('offline');
    $service = new Google_Service_Drive($client);
} catch (Exception $e) {
    die("Error al inicializar el cliente de Google Drive: " . $e->getMessage());
}

function obtenerContenido(Google_Service_Drive $service, $folderId, $enPapelera = false): array
{
    try {
        $query = $enPapelera
            ? "trashed = true"
            : "'$folderId' in parents and trashed = false";
        $params = [
            'q' => $query,
            'fields' => 'files(id, name, mimeType, size, webContentLink, webViewLink, createdTime, modifiedTime, trashed)',
            'supportsAllDrives' => true,
            'includeItemsFromAllDrives' => true,
            'corpora' => 'user',
            'orderBy' => 'folder, name'
        ];
        $response = $service->files->listFiles($params);
        $files = $response->getFiles();
        return is_array($files) ? $files : [];
    } catch (Exception $e) {
        error_log("Error en obtenerContenido: " . $e->getMessage());
        return [];
    }
}

function manejarAccionesPOST(Google_Service_Drive $service, string &$carpetaActual): void
{
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        try {
            // Crear nueva carpeta
            if (isset($_POST['nueva_carpeta'])) {
                $nombreCarpeta = trim($_POST['nombre_carpeta']);
                if (empty($nombreCarpeta)) {
                    $_SESSION['error'] = "Por favor, ingrese un nombre para la carpeta.";
                } else {
                    $folder = new Google_Service_Drive_DriveFile([
                        'name' => $nombreCarpeta,
                        'mimeType' => 'application/vnd.google-apps.folder',
                        'parents' => [$carpetaActual]
                    ]);
                    $service->files->create($folder);
                    $_SESSION['exito'] = "✅ Carpeta creada exitosamente";
                }
            }
            // Manejar renombrado (agrega esto con los demás condicionales POST)
elseif (isset($_POST['renombrar'])) {
    $fileId = $_POST['file_id'];
    $nuevoNombre = trim($_POST['nuevo_nombre']);
    
    if (empty($nuevoNombre)) {
        $_SESSION['error'] = "El nombre no puede estar vacío";
    } else {
        try {
            $file = new Google_Service_Drive_DriveFile();
            $file->setName($nuevoNombre);
            
            // Actualización directa con forzado de caché
            $updatedFile = $service->files->update($fileId, $file, [
                'supportsAllDrives' => true,
                'fields' => 'name,modifiedTime',
                'alt' => 'json'
            ]);
            
            // Forzar recarga del listado
            $archivos = obtenerContenido($service, $carpetaActual);
            $_SESSION['exito'] = "Archivo renombrado a: " . htmlspecialchars($nuevoNombre);
            
        } catch (Exception $e) {
            $_SESSION['error'] = "Error al renombrar: " . $e->getMessage();
            // Después de manejar las acciones POST
if (isset($_POST['renombrar'])) {
    $archivos = obtenerContenido($service, $carpetaActual); // Forzar recarga
}
        }
    }
    // Redirigir para evitar reenvío del formulario
    header("Location: ".$_SERVER['REQUEST_URI']);
    exit();
}
            // Subir archivo
            elseif (isset($_FILES['archivo']) && $_FILES['archivo']['error'] == UPLOAD_ERR_OK) {
                $nombreArchivo = $_FILES['archivo']['name'];
                $tipoMime = $_FILES['archivo']['type'];
                $rutaArchivoTemporal = $_FILES['archivo']['tmp_name'];
                $fileSize = $_FILES['archivo']['size'];
                $maxFileSize = 100 * 1024 * 1024; // 100MB (aumentado)
                
                if ($fileSize > $maxFileSize) {
                    $_SESSION['error'] = "El archivo excede el tamaño máximo permitido (100MB).";
                } else {
                    $file = new Google_Service_Drive_DriveFile([
                        'name' => $nombreArchivo,
                        'parents' => [$carpetaActual]
                    ]);
                    $content = file_get_contents($rutaArchivoTemporal);
                    $service->files->create($file, [
                        'data' => $content,
                        'mimeType' => $tipoMime,
                        'uploadType' => 'multipart'
                    ]);
                    $_SESSION['exito'] = "⬆️ Archivo subido exitosamente";
                }
            }
            // Eliminar a papelera
            elseif (isset($_POST['eliminar'])) {
                $fileId = $_POST['eliminar'];
                $file = new Google_Service_Drive_DriveFile();
                $file->setTrashed(true);
                try {
                    $service->files->update($fileId, $file, ['fields' => 'trashed', 'supportsAllDrives' => true]);
                    $_SESSION['exito'] = "🗑️ Archivo movido a la papelera";
                } catch (Exception $e) {
                    $_SESSION['error'] = "No se pudo mover a la papelera: " . $e->getMessage();
                    error_log("Error al mover a papelera ($fileId): " . $e->getMessage());
                }
            }
            // Restaurar de papelera
            elseif (isset($_POST['restaurar'])) {
                $fileId = $_POST['restaurar'];
                $file = new Google_Service_Drive_DriveFile();
                $file->setTrashed(false);
                try {
                    $service->files->update($fileId, $file, ['fields' => 'trashed', 'supportsAllDrives' => true]);
                    $_SESSION['exito'] = "Archivo restaurado exitosamente.";
                } catch (Exception $e) {
                    $_SESSION['error'] = "No se pudo restaurar el archivo: " . $e->getMessage();
                    error_log("Error al restaurar ($fileId): " . $e->getMessage());
                }
                header("Location: dashboard.php?papelera=1");
                exit();
            }
            // Eliminar permanentemente
            elseif (isset($_POST['eliminar_permanentemente'])) {
                $fileId = $_POST['eliminar_permanentemente'];
                try {
                    $service->files->delete($fileId, ['supportsAllDrives' => true]);
                    $_SESSION['exito'] = "Archivo eliminado permanentemente.";
                } catch (Exception $e) {
                    $_SESSION['error'] = "No se pudo eliminar permanentemente el archivo: " . $e->getMessage();
                    error_log("Error al eliminar permanentemente ($fileId): " . $e->getMessage());
                }
                header("Location: dashboard.php?papelera=1");
                exit();
            }
            
            header("Location: dashboard.php?carpeta=" . urlencode($carpetaActual));
            exit();
        } catch (Exception $e) {
            $_SESSION['error'] = "Error en operación: " . $e->getMessage();
            error_log("Error en manejarAccionesPOST: " . $e->getMessage());
            header("Location: dashboard.php?carpeta=" . urlencode($carpetaActual));
            exit();
        }
    }
}

function obtenerNombreCarpeta(Google_Service_Drive $service, string $folderId): string
{
    if ($folderId === RAIZ) {
        return "Mi Unidad";
    }
    try {
        $file = $service->files->get($folderId, ['fields' => 'name', 'supportsAllDrives' => true]);
        return $file->getName();
    } catch (Google_Service_Exception $e) {
        if ($e->getCode() == 404) {
            error_log("Carpeta no encontrada con ID $folderId: " . $e->getMessage());
            return "Carpeta Desconocida";
        } else {
            error_log("Error al obtener el nombre de la carpeta con ID $folderId: " . $e->getMessage());
            return "Error al Cargar Nombre";
        }
    } catch (Exception $e) {
        error_log("Error general al obtener el nombre de la carpeta con ID $folderId: " . $e->getMessage());
        return "Error al Cargar Nombre";
    }
}

$esPapelera = isset($_GET['papelera']);
$carpetaActual = !$esPapelera && isset($_GET['carpeta']) && preg_match('/^[a-zA-Z0-9_-]+$/', $_GET['carpeta'])
    ? $_GET['carpeta']
    : RAIZ;

manejarAccionesPOST($service, $carpetaActual);

$archivos = $esPapelera ? [] : obtenerContenido($service, $carpetaActual);
$papelera = $esPapelera ? obtenerContenido($service, '', true) : [];
$busqueda = isset($_GET['query']) ? trim($_GET['query']) : '';

if (!$esPapelera && $busqueda) {
    $archivos = array_filter($archivos, function($archivo) use ($busqueda) {
        return stristr($archivo->getName(), $busqueda) !== false;
    });
}

$nombreCarpetaActual = $esPapelera ? "Papelera" : obtenerNombreCarpeta($service, $carpetaActual);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <!-- Agrega en el <head> -->
<link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script>
async function renombrarArchivo(fileId, nombreActual) {
    const { value: nuevoNombre } = await Swal.fire({
        title: 'Renombrar archivo',
        input: 'text',
        inputLabel: 'Nuevo nombre',
        inputValue: nombreActual,
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) return 'El nombre no puede estar vacío!';
            if (value === nombreActual) return 'Ingresa un nombre diferente!';
        }
    });
    
    if (nuevoNombre) {
        // Mostrar carga
        Swal.fire({
            title: 'Actualizando...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        
        // Enviar petición
        const formData = new FormData();
        formData.append('file_id', fileId);
        formData.append('nuevo_nombre', nuevoNombre);
        formData.append('renombrar', '1');
        
        try {
            const response = await fetch('', {
                method: 'POST',
                body: formData
            });
            
            // Recargar después de éxito
            Swal.fire({
                icon: 'success',
                title: '¡Renombrado!',
                text: `El archivo ahora se llama: ${nuevoNombre}`,
                willClose: () => location.reload()
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message
            });
        }
    }
}
</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($nombreCarpetaActual) ?> | CloudDrive</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
    :root {
        --primary: #6366f1;
        --primary-light: #818cf8;
        --primary-dark: #4f46e5;
        --secondary: #10b981;
        --light: #f8fafc;
        --dark: #1e293b;
        --dark-light: #334155;
        --success: #10b981;
        --danger: #ef4444;
        --warning: #f59e0b;
        --info: #0ea5e9;
        --glass: rgba(255, 255, 255, 0.2);
        --glass-border: rgba(255, 255, 255, 0.3);
        --neumorphism-shadow: 8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff;
        --neumorphism-shadow-inset: inset 2px 2px 5px #d1d9e6, inset -2px -2px 5px #ffffff;
        --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    body {
        background-color: #f1f5f9;
        font-family: 'Inter', sans-serif;
        display: flex;
        min-height: 100vh;
        color: var(--dark);
        overflow-x: hidden;
    }

    /* Glassmorphism Sidebar */
    .sidebar {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(79, 70, 229, 0.9) 100%);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        min-height: 100vh;
        color: white;
        width: 280px;
        transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        flex-shrink: 0;
        overflow-x: hidden;
        z-index: 1000;
        border-right: 1px solid var(--glass-border);
        box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
    }

    .sidebar.hidden {
        transform: translateX(-280px);
    }

    .sidebar .nav-link {
        color: rgba(255, 255, 255, 0.9);
        padding: 0.75rem 1.25rem;
        transition: var(--transition);
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        margin: 0.25rem 0.75rem;
        backdrop-filter: blur(5px);
    }

    .sidebar .nav-link:hover,
    .sidebar .nav-link.active {
        background-color: var(--glass);
        color: white;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .sidebar .nav-link i {
        width: 24px;
        text-align: center;
        flex-shrink: 0;
        transition: var(--transition);
    }

    .sidebar .nav-item.active .nav-link {
        background-color: var(--glass);
        color: white;
        font-weight: 500;
    }

    .sidebar-brand {
        padding: 1.5rem;
        font-size: 1.5rem;
        font-weight: 700;
        text-align: center;
        color: white;
        text-decoration: none;
        display: block;
        backdrop-filter: blur(5px);
        border-bottom: 1px solid var(--glass-border);
    }

    .sidebar-brand i {
        margin-right: 0.5rem;
    }

    /* User Profile with Glassmorphism */
    /* Estilos base */
.user-profile {
    padding: 1.25rem;
    margin: 1rem;
    border-radius: 0.75rem;
    background: var(--glass);
    backdrop-filter: blur(5px);
    border: 1px solid var(--glass-border);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.user-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.3);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2rem;
    font-weight: 600;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.user-info {
    overflow: hidden;
}

/* Estado colapsado */
.sidebar.collapsed .user-profile-content {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.sidebar.collapsed .user-avatar {
    margin-right: 0 !important;  /* Elimina el me-3 en estado colapsado */
    margin-bottom: 0.5rem;
}

.sidebar.collapsed .user-info {
    display: none;  /* Ocultamos la info en estado colapsado */
}

    .user-info .fw-bold {
        text-overflow: ellipsis;
        overflow: hidden;
        font-weight: 600;
    }

    .user-info small {
        text-overflow: ellipsis;
        overflow: hidden;
        display: block;
        opacity: 0.8;
    }

    /* Main Content Area */
    .main-content {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        overflow-x: hidden;
        transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    /* Neumorphic Topbar */
    .topbar {
        background-color: white;
        padding: 0.75rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
        position: sticky;
        top: 0;
        z-index: 1020;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    .topbar-left {
        display: flex;
        align-items: center;
    }

    #sidebarToggle {
        color: var(--dark);
        font-size: 1.25rem;
        padding: 0.5rem;
        margin-right: 1rem;
        line-height: 1;
        background: transparent;
        border: none;
        cursor: pointer;
        transition: var(--transition);
    }

    #sidebarToggle:hover {
        color: var(--primary);
        transform: scale(1.1);
    }

    .topbar h4 {
        margin: 0;
        font-size: 1.25rem;
        color: var(--dark);
        font-weight: 600;
    }

    /* Neumorphic Search */
    .search-form {
        position: relative;
        max-width: 350px;
        width: 100%;
    }

    .search-form .form-control {
        padding: 0.5rem 1rem;
        border-radius: 2rem;
        border: none;
        background: #f8fafc;
        box-shadow: var(--neumorphism-shadow-inset);
        transition: var(--transition);
        padding-right: 2.5rem;
    }

    .search-form .form-control:focus {
        box-shadow: inset 2px 2px 5px #d1d9e6, inset -2px -2px 5px #ffffff, 0 0 0 0.25rem rgba(99, 102, 241, 0.25);
    }

    .search-form .btn {
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        border: none;
        background: transparent;
        color: var(--dark-light);
        padding: 0 1rem;
        border-radius: 0 2rem 2rem 0;
        transition: var(--transition);
    }

    .search-form .btn:hover {
        color: var(--primary);
    }

    /* Content Area */
    .content-area {
        flex-grow: 1;
        padding: 1.5rem;
        background-color: #f8fafc;
    }

    /* Neumorphic File Cards */
    .file-card {
        border: none;
        border-radius: 1rem;
        transition: var(--transition);
        background: #f8fafc;
        box-shadow: var(--neumorphism-shadow);
        display: flex;
        flex-direction: column;
        height: 100%;
        position: relative;
        overflow: hidden;
        cursor: pointer;
    }

    .file-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }

    .file-card-body {
        padding: 1.5rem;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .folder-link, .file-link {
        color: inherit;
        text-decoration: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-grow: 1;
        width: 100%;
        padding-bottom: 0.5rem;
    }

    .folder-link:hover h6, .file-link:hover h6 {
        color: var(--primary);
    }

    .file-icon-wrapper {
        margin-bottom: 1rem;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        border-radius: 50%;
        box-shadow: var(--neumorphism-shadow);
    }

    .file-icon {
        font-size: 2.5rem;
    }

    .file-icon.folder { color: var(--warning); }
    .file-icon.pdf { color: var(--danger); }
    .file-icon.doc, .file-icon.docx { color: var(--info); }
    .file-icon.image { color: var(--success); }
    .file-icon.unknown { color: var(--dark-light); }

    .file-name {
        font-size: 0.95rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
        word-break: break-word;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        min-height: 2.7em;
        line-height: 1.35em;
    }

    .file-meta {
        font-size: 0.75rem;
        color: var(--dark-light);
        margin-top: auto;
        opacity: 0.8;
    }

    /* Kebab Menu with Glassmorphism */
    .kebab-menu {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        z-index: 5;
    }

    .kebab-menu .btn {
        background: rgba(255, 255, 255, 0.8);
        border: none;
        padding: 0.35rem;
        line-height: 1;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        transition: var(--transition);
    }

    .kebab-menu .btn:hover {
        background: white;
        transform: scale(1.1);
    }

    .kebab-menu .btn i {
        font-size: 0.9rem;
        color: var(--dark);
    }

    /* Glassmorphism Dropdown */
    .dropdown-menu {
        border: none;
        border-radius: 0.75rem;
        font-size: 0.9rem;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        overflow: hidden;
        padding: 0.5rem;
    }

    .dropdown-item {
        transition: var(--transition);
        padding: 0.5rem 1rem;
        display: flex;
        align-items: center;
        border-radius: 0.5rem;
        margin: 0.15rem 0;
    }

    .dropdown-item i {
        margin-right: 0.75rem;
        width: 16px;
        text-align: center;
        color: var(--dark-light);
    }

    .dropdown-item:hover {
        background-color: rgba(99, 102, 241, 0.1);
        color: var(--primary);
    }

    .dropdown-item:hover i {
        color: var(--primary);
    }

    .dropdown-item.text-danger i {
        color: var(--danger);
    }

    .dropdown-item.text-danger:hover {
        background-color: rgba(239, 68, 68, 0.1);
        color: var(--danger);
    }

    /* Empty Trash */
    .papelera-vacia {
        text-align: center;
        padding: 3rem;
        border-radius: 1rem;
        background: #f8fafc;
        color: var(--dark-light);
        box-shadow: var(--neumorphism-shadow);
        border: 2px dashed #e2e8f0;
    }

    .papelera-vacia i {
        font-size: 4rem;
        color: #cbd5e1;
        margin-bottom: 1.5rem;
        opacity: 0.7;
    }

    /* File Actions */
    .file-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(0, 0, 0, 0.05);
    }

    /* Buttons */
    .btn {
        border-radius: 0.75rem;
        padding: 0.5rem 1rem;
        font-weight: 500;
        transition: var(--transition);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    }

    .btn-primary {
        background-color: var(--primary);
        border-color: var(--primary);
    }

    .btn-primary:hover {
        background-color: var(--primary-dark);
        border-color: var(--primary-dark);
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
    }

    .btn-success {
        background-color: var(--success);
        border-color: var(--success);
    }

    .btn-success:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
    }

    .btn-outline-secondary {
        border-color: #e2e8f0;
    }

    .btn-outline-secondary:hover {
        background-color: #f1f5f9;
        border-color: #cbd5e1;
    }

    .btn-sm {
        padding: 0.35rem 0.75rem;
        font-size: 0.85rem;
    }

    .btn-sm i {
        font-size: 0.8rem;
    }

    /* Alerts */
    .alert {
        border-radius: 0.75rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        display: flex;
        align-items: center;
        border: none;
        backdrop-filter: blur(5px);
    }

    .alert .btn-close {
        margin-left: auto;
    }

    /* Modals */
    .modal-content {
        border: none;
        border-radius: 1rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    .modal-header {
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        background-color: #f8fafc;
    }

    .modal-footer {
        border-top: 1px solid rgba(0, 0, 0, 0.05);
        background-color: #f8fafc;
    }

    /* Animations */
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .fade-in {
        animation: fadeIn 0.3s ease-out forwards;
    }

    /* Search Results Animation */
    #searchResults {
        position: absolute;
        width: 100%;
        max-height: 300px;
        overflow-y: auto;
        background: white;
        border-radius: 0 0 1rem 1rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 100;
        display: none;
    }

    .search-result-item {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #f1f5f9;
        cursor: pointer;
        transition: var(--transition);
    }

    .search-result-item:hover {
        background-color: #f8fafc;
    }

    .search-result-item i {
        margin-right: 0.75rem;
        color: var(--primary);
    }

    /* Sidebar Collapsed State */
    .sidebar.collapsed {
        width: 80px !important;
    }

    .sidebar.collapsed .sidebar-brand-text,
    .sidebar.collapsed .user-info,
    .sidebar.collapsed .nav-link span {
        display: none !important;
    }

    .sidebar.collapsed .sidebar-brand {
        padding: 1.5rem 0.5rem;
    }

    .sidebar.collapsed .user-profile {
        padding: 1rem 0.5rem;
        display: flex;
        justify-content: center;
    }

    .sidebar.collapsed .user-avatar {
        width: 40px;
        height: 40px;
        margin: 0;
    }

    .sidebar.collapsed .nav-link {
        padding: 0.75rem;
        justify-content: center;
        margin: 0.25rem 0.5rem;
    }

    .sidebar.collapsed .nav-link i {
        margin-right: 0;
        font-size: 1.3rem;
    }
/* Estilos generales para los iconos */
.sidebar-icon {
    font-size: 1.25rem;
    transition: all 0.3s ease;
    color: rgba(255, 255, 255, 0.9);
}

.icon-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.nav-link {
    display: flex;
    align-items: center;
    padding: 0.75rem 0.5rem;
}

.nav-link-text {
    margin-left: 12px;
    transition: opacity 0.3s ease;
}

/* Efecto hover para los iconos */
.nav-link:hover .icon-container {
    background-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
}

.nav-link:hover .sidebar-icon {
    color: white;
    transform: scale(1.1);
}

/* Estado colapsado */
.sidebar.collapsed .nav-link {
    justify-content: center;
    padding: 0.75rem 0;
}

.sidebar.collapsed .icon-container {
    width: 44px;
    height: 44px;
}

.sidebar.collapsed .sidebar-icon {
    font-size: 1.4rem;
}

.sidebar.collapsed .nav-link-text,
.sidebar.collapsed .badge-collapse:not(.badge-collapse-visible) {
    display: none;
}

/* Badge para la papelera */
.badge-collapse {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    padding: 0;
    transition: all 0.3s ease;
}

.sidebar.collapsed .badge-collapse {
    transform: scale(0.8);
    top: 2px;
    right: 2px;
}

/* Estado activo */
.nav-item.active .icon-container {
    background-color: rgba(255, 255, 255, 0.25);
}

.nav-item.active .sidebar-icon {
    color: white;
}

/* Efecto hover para el estado activo */
.nav-item.active:hover .icon-container {
    background-color: rgba(255, 255, 255, 0.35);
}
    /* Responsive */
    @media (max-width: 992px) {
        .sidebar {
            position: fixed;
            height: 100%;
            z-index: 1030;
        }

        .sidebar:not(.collapsed) {
            width: 80px !important;
        }

        .sidebar:not(.collapsed) .sidebar-brand-text,
        .sidebar:not(.collapsed) .user-info,
        .sidebar:not(.collapsed) .nav-link span {
            display: none !important;
        }

        .sidebar:not(.collapsed) .sidebar-brand {
            padding: 1.5rem 0.5rem;
        }

        .sidebar:not(.collapsed) .user-profile {
            padding: 1rem 0.5rem;
            display: flex;
            justify-content: center;
        }

        .sidebar:not(.collapsed) .user-avatar {
            width: 40px;
            height: 40px;
            margin: 0;
        }

        .sidebar:not(.collapsed) .nav-link {
            padding: 0.75rem;
            justify-content: center;
            margin: 0.25rem 0.5rem;
        }

        .sidebar:not(.collapsed) .nav-link i {
            margin-right: 0;
            font-size: 1.3rem;
        }

        .main-content {
            margin-left: 80px;
        }

        .topbar {
            padding: 0.75rem 1rem;
        }

        .search-form {
            max-width: 200px;
        }

        .topbar h4 {
            font-size: 1.1rem;
        }

        .content-area {
            padding: 1rem;
        }
    }

    @media (max-width: 576px) {
        .search-form {
            max-width: 150px;
        }

        .action-buttons .btn span {
            display: none;
        }

        .action-buttons .btn i {
            margin-right: 0 !important;
        }
    }
    /* Estilos para el estado colapsado */
.sidebar.collapsed .nav-link-text,
.sidebar.collapsed .badge-collapse {
    display: none !important;
}

.sidebar.collapsed .nav-link {
    position: relative;
}

.sidebar.collapsed .badge-collapse {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6rem;
    padding: 0;
}

/* Asegurar que los iconos se centren correctamente */
.sidebar.collapsed .nav-link i {
    margin-right: 0;
    font-size: 1.2rem;
}

/* Ajustar el padding en estado colapsado */
.sidebar.collapsed .nav-link {
    padding: 0.75rem !important;
    justify-content: center;
}
/* Estilos para el modal profesional */
.connection-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.connection-modal-container {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 245, 255, 0.95) 100%);
    border-radius: 16px;
    padding: 2.5rem;
    width: 100%;
    max-width: 380px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15), 
                inset 0 0 0 1px rgba(255, 255, 255, 0.2);
    text-align: center;
    transform: scale(0.95);
    animation: scaleIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.connection-animation {
    position: relative;
    width: 120px;
    height: 120px;
    margin: 0 auto 1.5rem;
}

/* Animación del checkmark */
.checkmark {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    display: block;
    stroke-width: 3;
    stroke: #fff;
    stroke-miterlimit: 10;
    box-shadow: 0 0 0 rgba(99, 102, 241, 0.4);
    animation: checkmark-fill 0.6s ease-in-out forwards, 
               checkmark-scale 0.5s ease-in-out both;
}

.checkmark-circle {
    stroke-dasharray: 166;
    stroke-dashoffset: 166;
    stroke-width: 3;
    stroke-miterlimit: 10;
    stroke: #6366f1;
    fill: none;
    animation: checkmark-stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
    transform-origin: 50% 50%;
    stroke-dasharray: 48;
    stroke-dashoffset: 48;
    animation: checkmark-stroke 0.4s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
}

/* Partículas animadas */
.particle {
    position: absolute;
    background: #6366f1;
    border-radius: 50%;
    animation: particle-pop 1s ease-out forwards;
}

.particle:nth-child(1) {
    width: 8px;
    height: 8px;
    top: 20%;
    left: 30%;
    animation-delay: 0.6s;
}

.particle:nth-child(2) {
    width: 6px;
    height: 6px;
    top: 15%;
    right: 25%;
    animation-delay: 0.8s;
}

.particle:nth-child(3) {
    width: 7px;
    height: 7px;
    bottom: 25%;
    left: 20%;
    animation-delay: 0.7s;
}

.particle:nth-child(4) {
    width: 5px;
    height: 5px;
    bottom: 15%;
    right: 30%;
    animation-delay: 0.9s;
}

.particle:nth-child(5) {
    width: 6px;
    height: 6px;
    top: 30%;
    right: 15%;
    animation-delay: 0.5s;
}

/* Contenido textual */
.connection-content {
    margin-bottom: 1.5rem;
}

.connection-title {
    color: #1e293b;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    opacity: 0;
    transform: translateY(10px);
    animation: textFadeIn 0.5s ease-out 0.4s forwards;
}

.connection-message {
    color: #64748b;
    font-size: 1rem;
    opacity: 0;
    transform: translateY(10px);
    animation: textFadeIn 0.5s ease-out 0.6s forwards;
}

/* Barra de progreso */
.connection-progress {
    height: 4px;
    background: rgba(99, 102, 241, 0.1);
    border-radius: 2px;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    width: 0;
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
    border-radius: 2px;
    animation: progressLoad 2s ease-in-out forwards;
}

/* Animaciones clave */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

@keyframes checkmark-stroke {
    to { stroke-dashoffset: 0; }
}

@keyframes checkmark-fill {
    to { box-shadow: inset 0 0 0 60px #6366f1; }
}

@keyframes checkmark-scale {
    0%, 100% { transform: none; }
    50% { transform: scale3d(1.1, 1.1, 1); }
}

@keyframes particle-pop {
    0% { transform: scale(0); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: scale(1.5); opacity: 0; }
}

@keyframes textFadeIn {
    to { opacity: 1; transform: translateY(0); }
}

@keyframes progressLoad {
    to { width: 100%; }
}
/* Estilos para el encabezado del sidebar */
.sidebar-header {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    border-radius: 8px;
    margin: 0.5rem;
}

.sidebar-header:hover {
    background-color: rgba(255, 255, 255, 0.15);
}

/* Contenedor del icono de folder */
.folder-icon-container {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

/* Icono de folder */
.folder-icon {
    font-size: 1.5rem; /* Tamaño aumentado */
    color: #FFFFFF; /* Color amarillo/naranja para folders */
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

/* Efecto hover para el icono */
.sidebar-header:hover .folder-icon {
    transform: scale(1.1) translateY(-2px);
    color: #FFFFFF; /* Color más intenso al hacer hover */
    filter: drop-shadow(0 2px 4px rgba(245, 158, 11, 0.3));
}

/* Texto del brand */
.sidebar-brand-text {
    font-size: 1.8rem;
    font-weight: 1000000;
    color: white;
    transition: all 0.3s ease;
}

/* Efecto hover para el texto */
.sidebar-header:hover .sidebar-brand-text {
    transform: translateX(2px);
    text-shadow: 0 2px 4px rgba(255, 255, 255, 0.2);
}

/* Estado colapsado */
.sidebar.collapsed .sidebar-brand-text {
    display: none;
}

.sidebar.collapsed .folder-icon-container {
    margin-right: 0;
}

.sidebar.collapsed .sidebar-header {
    justify-content: center;
    padding: 1rem 0;
}

.sidebar.collapsed .folder-icon {
    font-size: 1.7rem; /* Aún más grande cuando está colapsado */
}
</style>
</head>
<body> 
<?php if (isset($_SESSION['conexion_exitosa'])) : ?>
<div class="connection-modal-overlay">
    <div class="connection-modal-container">
        <div class="connection-animation">
            <svg class="checkmark" viewBox="0 0 52 52">
                <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
            <div class="particles">
                <div class="particle"></div>
                <div class="particle"></div>
                <div class="particle"></div>
                <div class="particle"></div>
                <div class="particle"></div>
            </div>
        </div>
        
        <div class="connection-content">
            <h3 class="connection-title">¡Conexión Exitosa!</h3>
            <p class="connection-message">Acceso autorizado al sistema</p>
        </div>
        
        <div class="connection-progress">
            <div class="progress-bar"></div>
        </div>
    </div>
</div>

<?php
    unset($_SESSION['conexion_exitosa']);
    echo '<script>setTimeout(() => window.location.href = "dashboard.php?carpeta=' . urlencode($carpetaActual) . '", 2500);</script>';
    exit();
?>
<?php endif; ?>
    <div class="sidebar" id="sidebar">
    <div class="sidebar-header px-3 py-3" id="sidebarHeader" style="cursor: pointer;">
    <div class="d-flex align-items-center">
        <div class="folder-icon-container me-3">
            <i class="fa-solid fa-folder-closed folder-icon"></i>
        </div>
        <span class="sidebar-brand-text"><b></b>SuperviFile<b></b></span>
    </div>
</div>
    <div class="user-profile">
    <div class="d-flex align-items-center user-profile-content">  <!-- Contenedor flex normal para desktop -->
        <div class="user-avatar me-3">  <!-- Mantenemos me-3 para el margen derecho -->
            <?php
                if(isset($_SESSION['usuario']['foto']) && !empty($_SESSION['usuario']['foto'])){
                    echo '<img src="' . htmlspecialchars($_SESSION['usuario']['foto']) . '" alt="Avatar" class="d-block">';
                } elseif (isset($_SESSION['usuario']['nombre'])) {
                    $nombre = trim($_SESSION['usuario']['nombre']);
                    $partes = explode(' ', $nombre);
                    $iniciales = '';
                    if (count($partes) >= 2) {
                        $iniciales = strtoupper(substr($partes[0], 0, 1) . substr($partes[1], 0, 1));
                    } elseif (count($partes) == 1 && strlen($nombre) > 0) {
                        $iniciales = strtoupper(substr($nombre, 0, 2));
                    } else {
                        $iniciales = '??';
                    }
                    echo $iniciales;
                } else {
                    echo '<i class="fas fa-user"></i>';
                }
            ?>
        </div>
        <div class="user-info">
            <div class="fw-bold text-truncate"><?= isset($_SESSION['usuario']['nombre']) ? htmlspecialchars($_SESSION['usuario']['nombre']) : 'Usuario' ?></div>
            <small class="text-truncate d-block"><?= isset($_SESSION['usuario']['email']) ? htmlspecialchars($_SESSION['usuario']['email']) : '' ?></small>
        </div>
    </div>
</div>
        <ul class="nav flex-column px-2">
    <li class="nav-item mb-1 <?= !$esPapelera && $carpetaActual === RAIZ ? 'active' : '' ?>">
        <a href="?carpeta=<?= RAIZ ?>" class="nav-link icon-wrapper">
            <div class="icon-container">
                <i class="fas fa-home fa-fw sidebar-icon"></i>
            </div>
            <span class="nav-link-text">Mi Unidad</span>
        </a>
    </li>
    <li class="nav-item mb-1 <?= $esPapelera ? 'active' : '' ?>">
        <a href="?papelera=1" class="nav-link icon-wrapper">
            <div class="icon-container">
                <i class="fas fa-trash fa-fw sidebar-icon"></i>
                <?php $countPapelera = count($papelera); ?>
                <?php if($countPapelera > 0): ?>
                    <span class="badge bg-danger rounded-pill badge-collapse"><?= $countPapelera ?></span>
                <?php endif; ?>
            </div>
            <span class="nav-link-text">Papelera</span>
        </a>
    </li>
</ul>
<ul class="nav flex-column px-2 mt-auto pb-3">
    <li class="nav-item">
        <a href="logout.php" class="nav-link icon-wrapper">
            <div class="icon-container">
                <i class="fas fa-sign-out-alt fa-fw sidebar-icon"></i>
            </div>
            <span class="nav-link-text">Cerrar sesión</span>
        </a>
    </li>
</ul>
    </div>

    <div class="main-content" id="mainContent">
        <div class="topbar">
            <div class="topbar-left">
                <button id="sidebarToggle" class="btn btn-link d-md-none">
                    <i class="fas fa-bars"></i>
                </button>
                <h4><?= htmlspecialchars($nombreCarpetaActual) ?></h4>
            </div>
            <form class="d-flex search-form" method="GET" action="dashboard.php" id="searchForm">
                <input type="hidden" name="carpeta" value="<?= htmlspecialchars($carpetaActual) ?>">
                <input class="form-control me-2 form-control-sm" type="search" 
                       placeholder="Buscar en <?= htmlspecialchars($nombreCarpetaActual) ?>" 
                       aria-label="Buscar" name="query" id="searchInput" 
                       value="<?= htmlspecialchars($busqueda) ?>" autocomplete="off">
                <button class="btn btn-outline-primary btn-sm" type="submit">
                    <i class="fas fa-search"></i>
                </button>
                <div id="searchResults"></div>
            </form>
        </div>

        <div class="content-area">
            <?php if (isset($_SESSION['error'])) : ?>
            <div class="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <?= htmlspecialchars($_SESSION['error']) ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            <?php unset($_SESSION['error']); endif; ?>
            
            <?php if (isset($_SESSION['exito'])) : ?>
            <div class="alert alert-success alert-dismissible fade show mb-4" role="alert">
                <i class="fas fa-check-circle me-2"></i>
                <?= htmlspecialchars($_SESSION['exito']) ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            <?php unset($_SESSION['exito']); endif; ?>

            <?php if ($esPapelera) : ?>
                <?php if (empty($papelera)) : ?>
                    <div class="papelera-vacia">
                        <i class="fas fa-trash-alt"></i>
                        <p class="lead">La papelera está vacía.</p>
                        <p class="text-muted">Los elementos eliminados aparecerán aquí.</p>
                    </div>
                <?php else : ?>
                    <h5 class="mb-3">Contenido de la Papelera</h5>
                    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3">
                        <?php foreach ($papelera as $archivo) : ?>
                            <?php
                                $mimeType = $archivo->getMimeType();
                                $esCarpeta = $mimeType === 'application/vnd.google-apps.folder';
                                $iconClass = 'fas fa-file unknown';
                                $iconColorClass = 'text-secondary';
                                if ($esCarpeta) {
                                    $iconClass = 'fas fa-folder folder';
                                    $iconColorClass = 'text-warning';
                                } elseif (strpos($mimeType, 'image/') === 0) {
                                    $iconClass = 'fas fa-file-image image';
                                    $iconColorClass = 'text-success';
                                } elseif ($mimeType === 'application/pdf') {
                                    $iconClass = 'fas fa-file-pdf pdf';
                                    $iconColorClass = 'text-danger';
                                } elseif (in_array($mimeType, ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])) {
                                    $iconClass = 'fas fa-file-word doc';
                                    $iconColorClass = 'text-primary';
                                }
                            ?>
                            <div class="col">
                                <div class="file-card fade-in">
                                    <div class="file-card-body">
                                        <div class="file-icon-wrapper">
                                            <i class="<?= $iconClass ?> file-icon <?= $iconColorClass ?>"></i>
                                        </div>
                                        <h6 class="file-name" title="<?= htmlspecialchars($archivo->getName()) ?>">
                                            <?= htmlspecialchars($archivo->getName()) ?>
                                        </h6>
                                        <div class="file-meta">
                                            <?php if(!$esCarpeta && $archivo->getSize()): ?>
                                                <span><?= round($archivo->getSize() / 1024, 1) ?> KB</span>
                                            <?php endif; ?>
                                            <?php if($archivo->getModifiedTime()): ?>
                                                <span class="ms-1" title="Modificado">
                                                    <i class="far fa-clock fa-xs"></i>
                                                    <?= date('d/m/y', strtotime($archivo->getModifiedTime())) ?>
                                                </span>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                    <div class="file-actions p-2">
                                        <form method="post" class="d-inline">
                                            <input type="hidden" name="restaurar" value="<?= $archivo->getId() ?>">
                                            <button type="submit" class="btn btn-sm btn-outline-success" title="Restaurar">
                                                <i class="fas fa-undo"></i>
                                            </button>
                                        </form>
                                        <form method="post" class="d-inline">
                                            <input type="hidden" name="eliminar_permanentemente" value="<?= $archivo->getId() ?>">
                                            <button type="submit" class="btn btn-sm btn-outline-danger"
                                                    onclick="return confirm('¿Estás seguro de que quieres eliminar permanentemente \'<?= htmlspecialchars(addslashes($archivo->getName())) ?>\'? Esta acción no se puede deshacer.')"
                                                    title="Eliminar permanentemente">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            <?php else : ?>
                <div class="d-flex justify-content-end align-items-center mb-4 action-buttons gap-2">
                    <?php
                    if ($carpetaActual !== RAIZ) {
                        try {
                            $parentFolder = $service->files->get($carpetaActual, ['fields' => 'parents', 'supportsAllDrives' => true]);
                            $parentId = $parentFolder->getParents() ? $parentFolder->getParents()[0] : RAIZ;
                            echo '<a href="?carpeta=' . urlencode($parentId) . '" class="btn btn-outline-secondary btn-sm me-auto" title="Volver a ' . htmlspecialchars(obtenerNombreCarpeta($service, $parentId)) . '">
                                    <i class="fas fa-arrow-left me-1"></i> Volver
                                  </a>';
                        } catch (Exception $e) {
                            echo '<a href="?carpeta=' . RAIZ . '" class="btn btn-outline-secondary btn-sm me-auto" title="Volver a Mi Unidad">
                                    <i class="fas fa-arrow-left me-1"></i> Volver
                                  </a>';
                            error_log("Error obteniendo padre de $carpetaActual: " . $e->getMessage());
                        }
                    } else {
                        echo '<div class="me-auto"></div>';
                    }
                    ?>
                    <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modalCarpeta">
                        <i class="fas fa-folder-plus me-1"></i> <span>Nueva Carpeta</span>
                    </button>
                    <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#modalArchivo">
                        <i class="fas fa-cloud-upload-alt me-1"></i> <span>Subir Archivo</span>
                    </button>
                </div>

                <?php if (empty($archivos) && !$busqueda): ?>
                    <div class="text-center text-muted mt-5">
                        <i class="fas fa-folder-open fa-3x mb-3"></i>
                        <p>Esta carpeta está vacía.</p>
                    </div>
                <?php elseif (empty($archivos) && $busqueda): ?>
                    <div class="text-center text-muted mt-5">
                        <i class="fas fa-search fa-3x mb-3"></i>
                        <p>No se encontraron archivos o carpetas que coincidan con "<?= htmlspecialchars($busqueda) ?>".</p>
                    </div>
                <?php else: ?>
                    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3">
                        <?php foreach ($archivos as $archivo) : ?>
                            <?php
                                $mimeType = $archivo->getMimeType();
                                $esCarpeta = $mimeType === 'application/vnd.google-apps.folder';
                                $iconClass = 'fas fa-file unknown';
                                $iconColorClass = 'text-secondary';
                                if ($esCarpeta) {
                                    $iconClass = 'fas fa-folder folder';
                                    $iconColorClass = 'text-warning';
                                } elseif (strpos($mimeType, 'image/') === 0) {
                                    $iconClass = 'fas fa-file-image image';
                                    $iconColorClass = 'text-success';
                                } elseif ($mimeType === 'application/pdf') {
                                    $iconClass = 'fas fa-file-pdf pdf';
                                    $iconColorClass = 'text-danger';
                                } elseif (in_array($mimeType, ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])) {
                                    $iconClass = 'fas fa-file-word doc';
                                    $iconColorClass = 'text-primary';
                                } elseif (in_array($mimeType, ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])) {
                                    $iconClass = 'fas fa-file-excel excel';
                                    $iconColorClass = 'text-success';
                                } elseif (in_array($mimeType, ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'])) {
                                    $iconClass = 'fas fa-file-powerpoint ppt';
                                    $iconColorClass = 'text-warning';
                                } elseif (strpos($mimeType, 'audio/') === 0) {
                                    $iconClass = 'fas fa-file-audio audio';
                                    $iconColorClass = 'text-info';
                                } elseif (strpos($mimeType, 'video/') === 0) {
                                    $iconClass = 'fas fa-file-video video';
                                    $iconColorClass = 'text-info';
                                } elseif ($mimeType === 'text/plain') {
                                    $iconClass = 'fas fa-file-alt text';
                                    $iconColorClass = 'text-muted';
                                }
                            ?>
                            <div class="col">
                                <div class="file-card fade-in">
                                    <div class="dropdown kebab-menu">
                                        <button class="btn btn-light btn-sm" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            <i class="fas fa-ellipsis-v"></i>
                                        </button>
                                        <ul class="dropdown-menu dropdown-menu-end">
                                        <?php if (!$esCarpeta && $archivo->getWebContentLink()) : ?>
    <li>
        <a class="dropdown-item" href="download.php?id=<?= $archivo->getId() ?>&name=<?= urlencode($archivo->getName()) ?>" download>
            <i class="fas fa-download fa-fw"></i> Descargar
        </a>
    </li>
<?php endif; ?>
<li>
    <a class="dropdown-item" href="#" onclick="renombrarArchivo('<?= $archivo->getId() ?>', '<?= htmlspecialchars(addslashes($archivo->getName())) ?>')">
        <i class="fas fa-edit fa-fw"></i> Renombrar
    </a>
</li>
                                                <form method="post" class="d-inline">
                                                    <input type="hidden" name="eliminar" value="<?= $archivo->getId() ?>">
                                                    <button type="submit" class="dropdown-item text-danger"
                                                            onclick="return confirm('¿Estás seguro de que quieres mover \'<?= htmlspecialchars(addslashes($archivo->getName())) ?>\' a la papelera?')">
                                                        <i class="fas fa-trash fa-fw"></i> Mover a papelera
                                                    </button>
                                                </form>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="file-card-body">
                                        <?php
                                            $linkHref = $esCarpeta
                                                ? '?carpeta=' . $archivo->getId()
                                                : ($archivo->getWebViewLink() ? htmlspecialchars($archivo->getWebViewLink()) : '#');
                                            $linkClass = $esCarpeta ? 'folder-link' : 'file-link';
                                            $linkTarget = !$esCarpeta && $archivo->getWebViewLink() ? '_blank' : '';
                                            $linkDownload = !$esCarpeta && $archivo->getWebContentLink() ? 'download="'.htmlspecialchars($archivo->getName()).'"' : '';
                                        ?>
                                        <a href="<?= $linkHref ?>" class="<?= $linkClass ?>" <?= $linkTarget ?> <?= $linkDownload ?> title="Abrir <?= htmlspecialchars($archivo->getName()) ?>">
                                            <div class="file-icon-wrapper">
                                                <i class="<?= $iconClass ?> file-icon <?= $iconColorClass ?>"></i>
                                            </div>
                                            <h6 class="file-name">
                                                <?= htmlspecialchars($archivo->getName()) ?>
                                            </h6>
                                        </a>
                                        <div class="file-meta">
                                            <?php if(!$esCarpeta && $archivo->getSize()): ?>
                                                <span><?= round($archivo->getSize() / 1024, 1) ?> KB</span>
                                            <?php endif; ?>
                                            <?php if($archivo->getModifiedTime()): ?>
                                                <span class="ms-1" title="Modificado">
                                                    <i class="far fa-clock fa-xs"></i>
                                                    <?= date('d/m/y', strtotime($archivo->getModifiedTime())) ?>
                                                </span>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            <?php endif; ?>
        </div>
    </div>

    <!-- Modal Nueva Carpeta -->
    <div class="modal fade" id="modalCarpeta" tabindex="-1" aria-labelledby="modalCarpetaLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalCarpetaLabel">Nueva Carpeta</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form method="post" action="dashboard.php?carpeta=<?= htmlspecialchars($carpetaActual) ?>">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="nombre_carpeta" class="form-label">Nombre de la carpeta</label>
                            <input type="text" class="form-control" id="nombre_carpeta" name="nombre_carpeta" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-primary" name="nueva_carpeta">Crear Carpeta</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Modal Subir Archivo -->
    <div class="modal fade" id="modalArchivo" tabindex="-1" aria-labelledby="modalArchivoLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalArchivoLabel">Subir Archivo</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form method="post" action="dashboard.php?carpeta=<?= htmlspecialchars($carpetaActual) ?>" enctype="multipart/form-data">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="archivo" class="form-label">Seleccionar archivo</label>
                            <input class="form-control" type="file" id="archivo" name="archivo" required>
                            <div class="form-text">Tamaño máximo: 100MB</div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-success">Subir Archivo</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Modal Renombrar -->
    <div class="modal fade" id="modalRenombrar" tabindex="-1" aria-labelledby="modalRenombrarLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalRenombrarLabel">Renombrar</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form method="post" action="dashboard.php?carpeta=<?= htmlspecialchars($carpetaActual) ?>">
                    <div class="modal-body">
                        <p>Renombrar: <strong id="current_name"></strong></p>
                        <div class="mb-3">
                            <label for="nuevo_nombre" class="form-label">Nuevo nombre</label>
                            <input type="text" class="form-control" id="nuevo_nombre" name="nuevo_nombre" required>
                            <input type="hidden" id="file_id" name="file_id">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-primary" name="renombrar">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            // Toggle sidebar
            const sidebarToggle = document.getElementById('sidebarToggle');
            const sidebar = document.getElementById('sidebar');
            
            function toggleSidebar() {
                sidebar.classList.toggle('hidden');
                // Guardar preferencia en localStorage
                localStorage.setItem('sidebarHidden', sidebar.classList.contains('hidden'));
            }
            
            if (sidebarToggle && sidebar) {
                sidebarToggle.addEventListener('click', toggleSidebar);
                
                // Cargar preferencia de sidebar al iniciar
                if (localStorage.getItem('sidebarHidden') === 'true') {
                    sidebar.classList.add('hidden');
                }
            }
            
            // Búsqueda en tiempo real
            const searchInput = document.getElementById('searchInput');
            const searchResults = document.getElementById('searchResults');
            
            if (searchInput && searchResults) {
                searchInput.addEventListener('input', function() {
                    const query = this.value.trim();
                    
                    if (query.length > 0) {
                        fetch(`search.php?query=${encodeURIComponent(query)}&carpeta=<?= $carpetaActual ?>`)
                            .then(response => response.json())
                            .then(data => {
                                if (data.length > 0) {
                                    searchResults.innerHTML = '';
                                    data.forEach(item => {
                                        const resultItem = document.createElement('div');
                                        resultItem.className = 'search-result-item';
                                        resultItem.innerHTML = `
                                            <i class="${getIconClass(item.mimeType)} ${getIconColorClass(item.mimeType)}"></i>
                                            ${item.name}
                                        `;
                                        resultItem.addEventListener('click', function() {
                                            if (item.mimeType === 'application/vnd.google-apps.folder') {
                                                window.location.href = `?carpeta=${item.id}`;
                                            } else {
                                                window.open(item.webViewLink || item.webContentLink, '_blank');
                                            }
                                        });
                                        searchResults.appendChild(resultItem);
                                    });
                                    searchResults.style.display = 'block';
                                } else {
                                    searchResults.innerHTML = '<div class="search-result-item">No se encontraron resultados</div>';
                                    searchResults.style.display = 'block';
                                }
                            })
                            .catch(error => {
                                console.error('Error en la búsqueda:', error);
                            });
                    } else {
                        searchResults.style.display = 'none';
                    }
                });
                
                // Ocultar resultados al hacer clic fuera
                document.addEventListener('click', function(e) {
                    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                        searchResults.style.display = 'none';
                    }
                });
            }
            
            // Funciones auxiliares para iconos
            function getIconClass(mimeType) {
                if (mimeType === 'application/vnd.google-apps.folder') return 'fas fa-folder';
                if (mimeType.startsWith('image/')) return 'fas fa-file-image';
                if (mimeType === 'application/pdf') return 'fas fa-file-pdf';
                if (['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(mimeType)) 
                    return 'fas fa-file-word';
                return 'fas fa-file';
            }
            
            function getIconColorClass(mimeType) {
                if (mimeType === 'application/vnd.google-apps.folder') return 'text-warning';
                if (mimeType.startsWith('image/')) return 'text-success';
                if (mimeType === 'application/pdf') return 'text-danger';
                if (['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(mimeType)) 
                    return 'text-primary';
                return 'text-secondary';
            }
            
            // Animación de carga para botones de acción
            document.querySelectorAll('form').forEach(form => {
                form.addEventListener('submit', function() {
                    const submitBtn = this.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';
                    }
                });
            });
        });
        <script>
// Función directa para renombrar
function renombrarArchivo(fileId, nombreActual) {
    const nuevoNombre = prompt("Nuevo nombre:", nombreActual);
    if (nuevoNombre && nuevoNombre !== nombreActual) {
        // Crear formulario dinámico
        const form = document.createElement('form');
        form.method = 'post';
        form.action = '';
        
        const inputId = document.createElement('input');
        inputId.type = 'hidden';
        inputId.name = 'file_id';
        inputId.value = fileId;
        
        const inputNombre = document.createElement('input');
        inputNombre.type = 'hidden';
        inputNombre.name = 'nuevo_nombre';
        inputNombre.value = nuevoNombre;
        
        const inputAccion = document.createElement('input');
        inputAccion.type = 'hidden';
        inputAccion.name = 'renombrar';
        inputAccion.value = '1';
        
        form.appendChild(inputId);
        form.appendChild(inputNombre);
        form.appendChild(inputAccion);
        document.body.appendChild(form);
        form.submit();
    }
}

</script>
    </script>
 <script>
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const sidebarHeader = document.getElementById('sidebarHeader');
    
    // Cargar estado guardado
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
    }
    
    // Evento click en el encabezado
    sidebarHeader.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
    
    // Auto-colapsar en móviles
    function handleResponsive() {
        if (window.innerWidth < 768 && !localStorage.getItem('sidebarCollapsed')) {
            sidebar.classList.add('collapsed');
        }
    }
    
    window.addEventListener('resize', handleResponsive);
    handleResponsive(); // Ejecutar al cargar
});
</script>
</body>
</html>