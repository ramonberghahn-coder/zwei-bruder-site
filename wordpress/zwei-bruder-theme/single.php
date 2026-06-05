<?php
if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>
<section class="zb-section">
    <div class="zb-container">
        <?php while (have_posts()) : the_post(); ?>
            <article <?php post_class('zb-page-content'); ?>>
                <h1 class="zb-page-title"><?php the_title(); ?></h1>
                <div class="entry-content">
                    <?php the_content(); ?>
                </div>
            </article>
        <?php endwhile; ?>
    </div>
</section>
<?php
get_footer();
