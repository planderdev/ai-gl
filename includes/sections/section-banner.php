<section class="promo-banner-section">
  <div class="container">
    <div class="promo-banner-wrap">

      <?php foreach ($bannerData['promo'] as $index => $banner): ?>
        <div class="promo-banner-card <?= $banner['type'] ?>">

          <div class="promo-banner-text">
            <span class="promo-label <?= $banner['type'] === 'secondary' ? 'dark' : '' ?>">
              <?= htmlspecialchars($banner['label']) ?>
            </span>

            <?php if ($banner['type'] === 'primary'): ?>
              <h2><?= nl2br(htmlspecialchars($banner['title'])) ?></h2>
            <?php else: ?>
              <h3><?= nl2br(htmlspecialchars($banner['title'])) ?></h3>
            <?php endif; ?>

            <p><?= htmlspecialchars($banner['desc']) ?></p>

            <a href="<?= htmlspecialchars($banner['url']) ?>"
               class="<?= $banner['type'] === 'primary' ? 'promo-link-btn' : 'promo-link-text' ?>">
              <?= htmlspecialchars($banner['button_text']) ?>

              <?php if ($banner['type'] === 'primary'): ?>
                <span class="material-symbols-rounded">arrow_forward</span>
              <?php else: ?>
                <span class="material-symbols-rounded">open_in_new</span>
              <?php endif; ?>

            </a>
          </div>

          <?php if ($banner['type'] === 'primary'): ?>
            <div class="promo-banner-visual"
                 style="background-image:url('<?= htmlspecialchars($banner['image']) ?>');">
            </div>
          <?php endif; ?>

        </div>
      <?php endforeach; ?>

    </div>
  </div>
</section>