<?php
if (!isset($footerData)) {
    $footerPath = $_SERVER['DOCUMENT_ROOT'] . '/includes/data/footer.php';

    if (file_exists($footerPath)) {
        include_once $footerPath;
    } else {
        $footerData = [
            'brand' => ['title' => '캐디스 AI'],
            'links' => [],
            'company' => [
                'address' => '',
                'ceo' => '',
                'business_number' => '',
                'travel_license' => '',
                'contact' => '',
            ],
            'support' => [
                'phone_label' => '고객센터',
                'phone' => '',
                'hours' => '',
                'email_label' => '이메일 문의',
                'email' => '',
            ],
            'copyright' => '캐디스 AI. All rights reserved.',
        ];
    }
}
?>

<footer class="site-footer">
    <div class="footer-main">
        <div class="footer-left">
            <div class="footer-brand">
                <strong><?= htmlspecialchars($footerData['brand']['title']) ?></strong>
            </div>

            <?php if (!empty($footerData['links'])): ?>
                <nav class="footer-links" aria-label="푸터 바로가기">
                    <?php foreach ($footerData['links'] as $link): ?>
                        <a href="<?= htmlspecialchars($link['url']) ?>">
                            <?= htmlspecialchars($link['label']) ?>
                        </a>
                    <?php endforeach; ?>
                </nav>
            <?php endif; ?>

            <div class="company-info">
                <?php if (!empty($footerData['company']['address'])): ?>
                    <p>주소: <?= htmlspecialchars($footerData['company']['address']) ?></p>
                <?php endif; ?>

                <p>
                    <?php if (!empty($footerData['company']['ceo'])): ?>
                        대표이사: <?= htmlspecialchars($footerData['company']['ceo']) ?>
                    <?php endif; ?>

                    <?php if (!empty($footerData['company']['business_number'])): ?>
                        <span class="dot"></span>
                        사업자등록번호: <?= htmlspecialchars($footerData['company']['business_number']) ?>
                    <?php endif; ?>

                    <?php if (!empty($footerData['company']['travel_license'])): ?>
                        <span class="dot"></span>
                        통신판매번호: <?= htmlspecialchars($footerData['company']['travel_license']) ?>
                    <?php endif; ?>

                    <?php if (!empty($footerData['company']['contact'])): ?>
                        <span class="dot"></span>
                        고객센터: <?= htmlspecialchars($footerData['company']['contact']) ?>
                    <?php endif; ?>
                </p>
            </div>
        </div>

        <div class="footer-right">
            <div class="footer-support">
                <p class="support-label"><?= htmlspecialchars($footerData['support']['phone_label']) ?></p>
                <?php if (!empty($footerData['support']['phone'])): ?>
                    <a class="support-phone" href="tel:<?= preg_replace('/[^0-9+]/', '', $footerData['support']['phone']) ?>">
                        <?= htmlspecialchars($footerData['support']['phone']) ?>
                    </a>
                <?php endif; ?>
                <?php if (!empty($footerData['support']['hours'])): ?>
                    <p class="support-hours"><?= htmlspecialchars($footerData['support']['hours']) ?></p>
                <?php endif; ?>
            </div>

            <div class="footer-support">
                <p class="support-label"><?= htmlspecialchars($footerData['support']['email_label']) ?></p>
                <?php if (!empty($footerData['support']['email'])): ?>
                    <a class="support-email" href="mailto:<?= htmlspecialchars($footerData['support']['email']) ?>">
                        <?= htmlspecialchars($footerData['support']['email']) ?>
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <div class="container footer-bottom">
        <p class="copyright">&copy; <?= date('Y') ?> <?= htmlspecialchars($footerData['copyright']) ?></p>
    </div>
</footer>

</div>

<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/assets/js-common.php'; ?>

<?php if (!empty($pageJs) && is_array($pageJs)): ?>
    <?php foreach ($pageJs as $js): ?>
        <script src="<?= asset($js); ?>"></script>
    <?php endforeach; ?>
<?php endif; ?>

<script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        AOS.init({
            duration: 700,
            easing: 'ease-out-cubic',
            once: true,
            offset: 40,
        });
    });
</script>

</body>

</html>