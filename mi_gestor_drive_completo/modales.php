<!-- Modal Nueva Carpeta -->
<div class="modal fade" id="modalCarpeta" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"><i class="fas fa-folder-plus me-2"></i>Nueva Carpeta</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form method="POST">
                <div class="modal-body">
                    <input type="hidden" name="nueva_carpeta">
                    <div class="mb-3">
                        <label class="form-label">Nombre de la carpeta</label>
                        <input type="text" name="nombre_carpeta" class="form-control" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Crear</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Modal Subir Archivo -->
<div class="modal fade" id="modalArchivo" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"><i class="fas fa-cloud-upload-alt me-2"></i>Subir Archivo</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form method="POST" enctype="multipart/form-data">
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Seleccionar archivo</label>
                        <input type="file" name="archivo" class="form-control" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Subir</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Modal Papelera -->
<div class="modal fade" id="modalPapelera" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"><i class="fas fa-trash me-2"></i>Papelera</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Tamaño</th>
                                <th>Eliminado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach($papelera as $archivo): ?>
                            <tr>
                                <td><?= htmlspecialchars($archivo->getName()) ?></td>
                                <td>
                                    <?= $archivo->getMimeType() === 'application/vnd.google-apps.folder' ? 
                                        '<span class="badge bg-warning">Carpeta</span>' : 
                                        '<span class="badge bg-info">Archivo</span>' ?>
                                </td>
                                <td><?= $archivo->getSize() ? round($archivo->getSize() / 1024, 2) . ' KB' : '-' ?></td>
                                <td><?= date('d/m/Y H:i', strtotime($archivo->getModifiedTime())) ?></td>
                                <td>
                                    <form method="post" class="d-inline">
                                        <input type="hidden" name="restaurar" value="<?= $archivo->getId() ?>">
                                        <button type="submit" class="btn btn-sm btn-success">
                                            <i class="fas fa-trash-restore"></i> Restaurar
                                        </button>
                                    </form>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
        </div>
    </div>
</div>