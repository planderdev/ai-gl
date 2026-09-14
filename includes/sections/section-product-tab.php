<?php if (!isset($golfPackageTabs)) include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/data/golf-packages.php'; ?>

<section class="golf-tab-section">
  <div class="container">
    <div class="section-head golf-tab-head">
      <div>
        <h2>캐디스 추천 골프 상품</h2>
        <p>지역별 인기 골프 상품을 한눈에 비교하고 원하는 일정에 맞게 선택해보세요.</p>
      </div>
      <a href="#;" class="section-more-link">전체보기</a>
    </div>

    <div class="golf-tab-nav" role="tablist" aria-label="골프 상품 지역 탭">
      <?php foreach ($golfPackageTabs as $index => $tab): ?>
        <button
          type="button"
          class="golf-tab-btn <?= $index === 0 ? 'active' : '' ?>"
          data-tab="<?= htmlspecialchars($tab['id']) ?>">
          <?= htmlspecialchars($tab['label']) ?>
        </button>
      <?php endforeach; ?>
    </div>

    <?php foreach ($golfPackageTabs as $index => $tab): ?>
      <div class="golf-tab-panel <?= $index === 0 ? 'active' : '' ?>" id="<?= htmlspecialchars($tab['id']) ?>">
        <div class="golf-theme-grid">
          <?php foreach ($tab['groups'] as $group): ?>
            <article class="golf-theme-column">
              <div class="golf-theme-hero">
                <div class="golf-theme-hero-thumb">
                  <img src="<?= htmlspecialchars($group['hero_image']) ?>" alt="<?= htmlspecialchars($group['title']) ?>">
                </div>
                <div class="golf-theme-hero-body">
                  <h3><?= htmlspecialchars($group['title']) ?></h3>
                  <p><?= htmlspecialchars($group['description']) ?></p>
                </div>
              </div>

              <div class="golf-theme-list">
                <?php foreach ($group['items'] as $item): ?>
                  <a href="<?= htmlspecialchars($item['link']) ?>" class="golf-theme-item">
                    <div class="golf-theme-item-thumb">
                      <img src="<?= htmlspecialchars($item['image']) ?>" alt="<?= htmlspecialchars($item['title']) ?>">
                    </div>

                    <div class="golf-theme-item-body">
                      <span class="golf-theme-item-region"><?= htmlspecialchars($item['region']) ?></span>
                      <h4><?= htmlspecialchars($item['title']) ?></h4>
                      <span class="golf-theme-item-badge"><?= htmlspecialchars($item['badge']) ?></span>
                    </div>

                    <strong class="golf-theme-item-price"><?= htmlspecialchars($item['price']) ?></strong>
                  </a>
                <?php endforeach; ?>
              </div>
            </article>
          <?php endforeach; ?>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
</section>