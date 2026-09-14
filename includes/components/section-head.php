<?php
$kicker = $sectionHead['kicker'] ?? '';
$title = $sectionHead['title'] ?? '';
$desc = $sectionHead['desc'] ?? '';
$moreUrl = $sectionHead['more_url'] ?? '';
$moreText = $sectionHead['more_text'] ?? '전체보기';
?>

<div class="section-head">
    <div>
        <?php if ($kicker): ?>
            <span class="section-kicker"><?php echo $kicker; ?></span>
        <?php endif; ?>
        <h2><?php echo $title; ?></h2>
        <p><?php echo $desc; ?></p>
    </div>

    <?php if ($moreUrl): ?>
        <a href="<?php echo $moreUrl; ?>" class="section-more-link">
            <?php echo $moreText; ?>
            <i class="ri-arrow-right-line"></i>
        </a>
    <?php endif; ?>
</div>