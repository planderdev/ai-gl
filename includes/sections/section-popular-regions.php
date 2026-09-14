<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/data/popular-regions.php'; ?>

<section class="popular-region-section fullbleed">
  <div class="popular-region-shell">
    <div class="popular-region-side">
      <div class="section-head popular-region-head">
        <div>
          <h2>이달의 인기 지역</h2>
          <p>지금 가장 많이 찾는 해외 골프 지역을 한 번에 확인해보세요.</p>
        </div>
      </div>

      <div class="popular-region-list" role="tablist" aria-label="인기 지역 목록">
        <?php foreach ($popularRegions as $index => $region): ?>
          <button
            type="button"
            class="popular-region-item <?= $index === 0 ? 'active' : '' ?>"
            data-region-id="<?= htmlspecialchars($region['id']) ?>"
          >
            <span class="popular-region-rank"><?= htmlspecialchars($region['rank']) ?></span>
            <span class="popular-region-country"><?= htmlspecialchars($region['country']) ?></span>
          </button>

          <div
            class="popular-region-mini-grid <?= $index === 0 ? 'active' : '' ?>"
            data-thumb-group="<?= htmlspecialchars($region['id']) ?>"
          >
            <?php if (!empty($region['thumbs'])): ?>
              <?php foreach ($region['thumbs'] as $thumb): ?>
                <div class="popular-region-mini-card">
                  <img src="<?= htmlspecialchars($thumb['image']) ?>" alt="<?= htmlspecialchars($thumb['title']) ?>">
                  <span><?= htmlspecialchars($thumb['title']) ?></span>
                </div>
              <?php endforeach; ?>
            <?php endif; ?>
          </div>
        <?php endforeach; ?>
      </div>
    </div>

    <div class="popular-region-stage">
      <?php foreach ($popularRegions as $index => $region): ?>
        <div
          class="popular-region-panel <?= $index === 0 ? 'active' : '' ?>"
          data-region-panel="<?= htmlspecialchars($region['id']) ?>"
          style="--popular-region-bg: url('<?= htmlspecialchars($region['background']) ?>');"
        >
          <div class="popular-region-overlay"></div>

          <div class="popular-region-copy">
            <span class="popular-region-eyebrow"><?= htmlspecialchars($region['eyebrow']) ?></span>
            <h3><?= nl2br(htmlspecialchars($region['title'])) ?></h3>
            <p><?= htmlspecialchars($region['description']) ?></p>

            <div class="popular-region-theme-list">
              <?php if (!empty($region['themes'])): ?>
                <?php foreach ($region['themes'] as $theme): ?>
                  <span class="popular-region-theme"><?= htmlspecialchars($theme) ?></span>
                <?php endforeach; ?>
              <?php endif; ?>
            </div>
          </div>

          <div class="popular-region-slider-wrap">
            <div class="popular-region-slider swiper">
              <div class="swiper-wrapper">
                <?php if (!empty($region['products'])): ?>
                  <?php foreach ($region['products'] as $product): ?>
                    <div class="swiper-slide">
                      <a href="<?= htmlspecialchars($product['link']) ?>" class="popular-region-card">
                        <div class="popular-region-card-thumb">
                          <img src="<?= htmlspecialchars($product['image']) ?>" alt="<?= htmlspecialchars($product['title']) ?>">
                        </div>

                        <div class="popular-region-card-body">
                          <span class="popular-region-card-location">
                            <?= htmlspecialchars($product['country']) ?>/<?= htmlspecialchars($product['city']) ?>
                          </span>
                          <h4><?= htmlspecialchars($product['title']) ?></h4>

                          <div class="popular-region-card-bottom">
                            <strong><?= htmlspecialchars($product['price']) ?></strong>
                            <span class="popular-region-card-link">자세히 보기</span>
                          </div>
                        </div>
                      </a>
                    </div>
                  <?php endforeach; ?>
                <?php endif; ?>
              </div>
            </div>

            <div class="popular-region-slider-controls">
              <div class="popular-region-pagination"></div>
              <div class="popular-region-nav">
                <button type="button" class="popular-region-prev" aria-label="이전 슬라이드">
                  <span class="material-symbols-rounded">chevron_left</span>
                </button>
                <button type="button" class="popular-region-next" aria-label="다음 슬라이드">
                  <span class="material-symbols-rounded">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>