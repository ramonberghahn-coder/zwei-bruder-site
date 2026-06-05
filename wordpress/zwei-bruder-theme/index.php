<?php
if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>
<section class="zb-section">
    <div class="zb-container">
        <?php if (have_posts()) : ?>
            <?php while (have_posts()) : the_post(); ?>
                <article <?php post_class('zb-page-content'); ?>>
                    <h1 class="zb-page-title">
                        <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                    </h1>
                    <div class="entry-content">
                        <?php the_excerpt(); ?>
                    </div>
                </article>
            <?php endwhile; ?>
            <?php the_posts_pagination(); ?>
        <?php else : ?>
            <h1 class="zb-page-title"><?php esc_html_e('Nada encontrado', 'zwei-bruder'); ?></h1>
        <?php endif; ?>
    </div>
</section>
<?php
get_footer();
