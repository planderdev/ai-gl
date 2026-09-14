<?php include_once $_SERVER['DOCUMENT_ROOT'].'/includes/header.php'; ?>
<?php include_once $_SERVER['DOCUMENT_ROOT'].'/includes/data/package-data.php'; ?>

<link rel="stylesheet" href="/assets/css/pages/package/list.css">

<section class="package-hero">
  <div class="hero-bg"></div>

  <div class="container">
    <h1>세계 100대 코스 버킷리스트</h1>
    <p># 해외골프투어 # 럭셔리 골프</p>

    <?php include $_SERVER['DOCUMENT_ROOT'].'/components/search-bar.php'; ?>
  </div>
</section>


<!-- 카테고리 추천 -->
<section class="package-category">
  <div class="container">
    <div class="category-grid">
      <?php foreach($packageCategories as $cat): ?>
        <div class="category-card">
          <img src="<?= $cat['image'] ?>">
          <div class="overlay">
            <h3><?= $cat['title'] ?></h3>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>


<!-- 패키지 상품 -->
<section class="package-list">
  <div class="container">

    <div class="section-head">
      <h2>지금 떠나기 좋은 골프 여행</h2>
    </div>

    <div class="product-grid">
      <?php foreach($packageProducts as $p): ?>
        <?php include $_SERVER['DOCUMENT_ROOT'].'/components/product-card.php'; ?>
      <?php endforeach; ?>
    </div>

  </div>
</section>


<!-- 특가 -->
<section class="package-special">
  <div class="container">

    <div class="section-head">
      <h2>놓치기 아쉬운 특가 패키지</h2>
    </div>

    <div class="special-slider swiper">
      <div class="swiper-wrapper">
        <?php foreach($specialPackages as $p): ?>
          <div class="swiper-slide">
            <?php include $_SERVER['DOCUMENT_ROOT'].'/components/product-card.php'; ?>
          </div>
        <?php endforeach; ?>
      </div>
    </div>

  </div>
</section>


<!-- 버킷리스트 -->
<section class="package-bucket">
  <div class="container">

    <div class="bucket-left">
      <h2>BUCKET LIST</h2>
      <div class="filters">
        <button class="active">DREAM</button>
        <button>WORLD TOP 100</button>
        <button>LEGENDARY</button>
      </div>
    </div>

    <div class="bucket-list">
      <?php foreach($packageProducts as $p): ?>
        <?php include $_SERVER['DOCUMENT_ROOT'].'/components/product-card.php'; ?>
      <?php endforeach; ?>
    </div>

  </div>
</section>


<script src="/assets/js/pages/package/list.js"></script>

<?php include_once $_SERVER['DOCUMENT_ROOT'].'/includes/footer.php'; ?>