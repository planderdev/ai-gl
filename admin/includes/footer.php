<?php
$pageJs = $pageJs ?? [];
?>
<script src="<?= e(asset_url('js/admin.js')) ?>"></script>
<?php foreach ($pageJs as $js): ?>
    <script src="<?= e(asset_url('js/' . $js)) ?>"></script>
<?php endforeach; ?>
</body>
</html>