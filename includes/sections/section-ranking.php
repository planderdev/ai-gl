<section class="ranking-section">
  <div class="container">
    <div class="section-head">
      <div>
        <span class="section-kicker"><?= htmlspecialchars($rankingData['section']['kicker']) ?></span>
        <h2><?= htmlspecialchars($rankingData['section']['title']) ?></h2>
        <p><?= htmlspecialchars($rankingData['section']['desc']) ?></p>
      </div>
    </div>

    <div class="ranking-layout">
      <div class="ranking-list">
        <?php foreach ($rankingData['items'] as $index => $item): ?>
          <article class="ranking-item <?= $index === 0 ? 'is-active' : '' ?>">
            <div class="ranking-no"><?= htmlspecialchars((string) $item['rank']) ?></div>

            <div class="ranking-info">
              <strong><?= htmlspecialchars($item['country']) ?></strong>
              <p><?= htmlspecialchars($item['courses']) ?></p>
            </div>

            <div class="ranking-meta">
              <span><?= htmlspecialchars($item['badge']) ?></span>
            </div>
          </article>
        <?php endforeach; ?>
      </div>

      <div class="ranking-feature-card">
        <div
          class="ranking-feature-thumb"
          style="background-image:url('<?= htmlspecialchars($rankingData['featured']['image']) ?>');"
        ></div>

        <div class="ranking-feature-body">
          <span class="ranking-feature-badge">
            <?= htmlspecialchars($rankingData['featured']['badge']) ?>
          </span>

          <h3><?= htmlspecialchars($rankingData['featured']['title']) ?></h3>

          <p><?= htmlspecialchars($rankingData['featured']['desc']) ?></p>

          <div class="ranking-feature-points">
            <?php foreach ($rankingData['featured']['tags'] as $tag): ?>
              <span><?= htmlspecialchars($tag) ?></span>
            <?php endforeach; ?>
          </div>

          <a href="<?= htmlspecialchars($rankingData['featured']['url']) ?>" class="ranking-feature-link">
            상품 보러가기
            <span class="material-symbols-rounded">arrow_forward</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>