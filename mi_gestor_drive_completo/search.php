<?php
error_reporting(E_ALL & ~E_DEPRECATED);
ini_set('display_errors', 1);
session_start();
if (!isset($_SESSION['usuario'])) {
    header("HTTP/1.1 403 Forbidden");
    exit();
}

require_once __DIR__ . '/api-drive/vendor/autoload.php';

try {
    $client = new Google_Client();
    $client->setAuthConfig(__DIR__ . '/api-drive/sistema-gestor-de-archivos-c81c3bf51991.json');
    $client->addScope(Google_Service_Drive::DRIVE);
    $service = new Google_Service_Drive($client);
} catch (Exception $e) {
    header("HTTP/1.1 500 Internal Server Error");
    exit(json_encode(['error' => $e->getMessage()]));
}

$query = isset($_GET['query']) ? trim($_GET['query']) : '';
$folderId = isset($_GET['carpeta']) ? $_GET['carpeta'] : '14NeVYJ4oXB5KVTl5GhmEoQpTK0eoVOam';

if (empty($query)) {
    exit(json_encode([]));
}

try {
    $searchQuery = "name contains '".addslashes($query)."' and '".addslashes($folderId)."' in parents and trashed = false";
    $params = [
        'q' => $searchQuery,
        'fields' => 'files(id, name, mimeType, webViewLink, webContentLink)',
        'pageSize' => 10,
        'supportsAllDrives' => true,
        'includeItemsFromAllDrives' => true
    ];
    
    $response = $service->files->listFiles($params);
    $files = $response->getFiles();
    
    $results = [];
    foreach ($files as $file) {
        $results[] = [
            'id' => $file->getId(),
            'name' => $file->getName(),
            'mimeType' => $file->getMimeType(),
            'webViewLink' => $file->getWebViewLink(),
            'webContentLink' => $file->getWebContentLink()
        ];
    }
    
    header('Content-Type: application/json');
    echo json_encode($results);
} catch (Exception $e) {
    header("HTTP/1.1 500 Internal Server Error");
    exit(json_encode(['error' => $e->getMessage()]));
}