<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/data/season-picks.php'; ?>

<?php if (!empty($seasonPicks)): ?>
  <?php foreach ($seasonPicks as $section): ?>
    <section class="season-picks-section">
      <div class="container">
        <div class="season-picks-layout">

          <div class="season-picks-visual">
            <div class="season-picks-visual-bg">
              <img src="<?= htmlspecialchars($section['badge_image']) ?>" alt="<?= htmlspecialchars(str_replace("\n", ' ', $section['badge_text_main'])) ?>">
            </div>

            <div class="season-picks-badge">
              <p class="season-picks-badge-top"><?= htmlspecialchars($section['badge_text_top']) ?></p>
              <strong class="season-picks-badge-main">
                <?= nl2br(htmlspecialchars($section['badge_text_main'])) ?>
              </strong>
            </div>
          </div>

          <div class="season-picks-content">
            <div class="season-picks-head">
              <div class="season-picks-tags">
                <?php foreach ($section['hashtags'] as $tag): ?>
                  <span><?= htmlspecialchars($tag) ?></span>
                <?php endforeach; ?>
              </div>

              <h2><?= htmlspecialchars($section['title']) ?></h2>
              <p><?= htmlspecialchars($section['description']) ?></p>
            </div>

            <div class="season-picks-slider-wrap">
              <div class="season-picks-slider swiper">
                <div class="swiper-wrapper">
                  <?php foreach ($section['products'] as $item): ?>
                    <div class="swiper-slide">
                      <a href="<?= htmlspecialchars($item['link']) ?>" class="season-picks-card">
                        <div class="season-picks-card-thumb">
                          <img src="<?= htmlspecialchars($item['image']) ?>" alt="<?= htmlspecialchars($item['title']) ?>">
                        </div>

                        <div class="season-picks-card-body">
                          <span class="season-picks-card-location">
                            <?= htmlspecialchars($item['country']) ?>/<?= htmlspecialchars($item['city']) ?>
                          </span>
                          <h3><?= htmlspecialchars($item['title']) ?></h3>
                          <strong class="season-picks-card-price"><?= htmlspecialchars($item['price']) ?></strong>
                        </div>
                      </a>
                    </div>
                  <?php endforeach; ?>
                </div>
              </div>

              <div class="season-picks-controls">
                <div class="season-picks-pagination"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  <?php endforeach; ?>
<?php endif; ?>