<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();

if (!isset($_SESSION['usuario'])) {
    die(json_encode(['error' => 'No autorizado']));
}

require_once __DIR__.'/api-drive/vendor/autoload.php';

$client = new Google_Client();
$client->setAuthConfig(__DIR__.'/api-drive/sistema-gestor-de-archivos-c81c3bf51991.json');
$client->addScope(Google_Service_Drive::DRIVE);
$service = new Google_Service_Drive($client);

$fileId = $_POST['id'] ?? '';
$newName = $_POST['new_name'] ?? '';

header('Content-Type: application/json');

try {
    $file = new Google_Service_Drive_DriveFile();
    $file->setName($newName);
    
    $updatedFile = $service->files->update($fileId, $file, [
        'supportsAllDrives' => true,
        'fields' => 'id,name'
    ]);
    
    echo json_encode([
        'success' => true,
        'new_name' => $updatedFile->getName()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}