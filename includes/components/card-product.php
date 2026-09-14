<?php if (!empty($productItem)): ?>
<article class="product-card">
    <div class="product-thumb <?php echo $productItem['image_class']; ?>"></div>

    <div class="product-body">
        <span class="product-badge"><?php echo $productItem['badge']; ?></span>
        <h3><?php echo $productItem['title']; ?></h3>
        <p><?php echo $productItem['desc']; ?></p>

        <div class="product-bottom">
            <strong><?php echo $productItem['price']; ?></strong>
            <a href="<?php echo $productItem['url']; ?>" class="product-link">자세히 보기</a>
        </div>
    </div>
</article>
<?php endif; ?>