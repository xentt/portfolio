<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();

if (!isset($_SESSION['usuario'])) {
    die("Acceso no autorizado");
}

require_once __DIR__ . '/api-drive/vendor/autoload.php';

$client = new Google_Client();
$client->setAuthConfig(__DIR__ . '/api-drive/sistema-gestor-de-archivos-c81c3bf51991.json');
$client->addScope(Google_Service_Drive::DRIVE);
$service = new Google_Service_Drive($client);

$fileId = $_GET['id'] ?? '';
$filename = $_GET['name'] ?? 'download';

try {
    $file = $service->files->get($fileId, ['alt' => 'media', 'supportsAllDrives' => true]);
    
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Transfer-Encoding: binary');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    
    echo $file->getBody()->getContents();
    exit;
} catch (Exception $e) {
    $_SESSION['error'] = "Error al descargar: " . $e->getMessage();
    header("Location: dashboard.php");
    exit;
}