<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/data/bucket-list.php'; ?>

<section class="bucket-list-section bucket-list-fullbleed">
  <div class="bucket-list-shell">
    <div class="bucket-list-copy">
      <div class="bucket-list-head">
        <?php if (!empty($bucketListSection['eyebrow'])): ?>
          <div class="bucket-list-badges">
            <?php foreach ($bucketListSection['eyebrow'] as $index => $badge): ?>
              <span class="bucket-list-badge badge-<?= $index + 1 ?>">
                <?= htmlspecialchars($badge) ?>
              </span>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>

        <h2><?= nl2br(htmlspecialchars($bucketListSection['title'])) ?></h2>
        <p><?= htmlspecialchars($bucketListSection['description']) ?></p>
      </div>

      <div class="bucket-list-nav">
        <button type="button" class="bucket-list-prev" aria-label="이전 슬라이드">
          <span class="material-symbols-rounded">chevron_left</span>
        </button>
        <button type="button" class="bucket-list-next" aria-label="다음 슬라이드">
          <span class="material-symbols-rounded">chevron_right</span>
        </button>
      </div>
    </div>

    <div class="bucket-list-slider-wrap">
      <div class="bucket-list-slider swiper">
        <div class="swiper-wrapper">
          <?php foreach ($bucketListSection['products'] as $item): ?>
            <div class="swiper-slide">
              <a href="<?= htmlspecialchars($item['link']) ?>" class="bucket-list-card">
                <div class="bucket-list-card-thumb">
                  <img src="<?= htmlspecialchars($item['image']) ?>" alt="<?= htmlspecialchars($item['title']) ?>">
                </div>

                <div class="bucket-list-card-body">
                  <span class="bucket-list-card-location">
                    <?= htmlspecialchars($item['country']) ?>/<?= htmlspecialchars($item['city']) ?>
                  </span>
                  <h3><?= htmlspecialchars($item['title']) ?></h3>
                  <strong class="bucket-list-card-price"><?= htmlspecialchars($item['price']) ?></strong>
                </div>
              </a>
            </div>
          <?php endforeach; ?>
        </div>
      </div>

      <div class="bucket-list-pagination"></div>
    </div>
  </div>
</section>