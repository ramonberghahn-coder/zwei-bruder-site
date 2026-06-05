<?php
if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>
<section class="zb-section">
    <div class="zb-container">
        <?php woocommerce_content(); ?>
    </div>
</section>
<?php
get_footer();
