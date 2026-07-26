<div class="col" data-file-id="<?= $file->id ?>">
    <div class="file-card neumorphic">
        <div class="file-card-body">
            <!-- Icono y nombre -->
            <button class="btn btn-star" data-file-id="<?= $file->id ?>">
                <i class="<?= $file->isStarred ? 'fas' : 'far' ?> fa-star"></i>
            </button>
            <!-- ... resto del contenido ... -->
        </div>
    </div>
</div>