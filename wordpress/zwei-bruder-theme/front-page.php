<?php
if (!defined('ABSPATH')) {
    exit;
}

get_header();

$catalog_products = zwei_bruder_catalog_products(12);
$featured_products = zwei_bruder_featured_products();
$hero_product = $featured_products[0] ?? $catalog_products[0] ?? null;
$category_banners = zwei_bruder_category_banners();
$product_categories = [];
if (taxonomy_exists('product_cat')) {
    $terms = get_terms([
        'taxonomy' => 'product_cat',
        'hide_empty' => true,
    ]);
    if (!is_wp_error($terms)) {
        $product_categories = $terms;
    }
}
?>
<div id="produtos" class="zb-container zb-catalog-page">
    <p class="zb-breadcrumb">
        <a href="<?php echo esc_url(home_url('/')); ?>"><?php esc_html_e('Inicio', 'zwei-bruder'); ?></a>
        <span>/</span>
        <span><?php esc_html_e('Catalogo', 'zwei-bruder'); ?></span>
    </p>

    <h1 class="zb-catalog-title"><?php esc_html_e('Catalogo', 'zwei-bruder'); ?></h1>

    <?php if (!function_exists('wc_get_products')) : ?>
        <div class="zb-catalog-empty">
            <?php esc_html_e('Instale e ative o WooCommerce para exibir os produtos.', 'zwei-bruder'); ?>
        </div>
    <?php else : ?>
        <?php if (!empty($category_banners)) : ?>
            <div class="zb-category-banners">
                <?php foreach ($category_banners as $banner) : ?>
                    <a class="showcase-card zb-category-banner" href="<?php echo esc_url($banner['url']); ?>">
                        <?php if ($banner['image']) : ?>
                            <img src="<?php echo esc_url($banner['image']); ?>" alt="<?php echo esc_attr($banner['name']); ?>" loading="lazy">
                        <?php endif; ?>
                        <div class="zb-category-banner-content">
                            <p><?php echo esc_html($banner['name']); ?></p>
                            <span>
                                <?php
                                printf(
                                    esc_html(_n('%d produto', '%d produtos', $banner['count'], 'zwei-bruder')),
                                    (int) $banner['count']
                                );
                                ?>
                            </span>
                        </div>
                    </a>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <?php if (!empty($featured_products)) : ?>
            <section class="zb-featured-carousel">
                <div class="zb-carousel-heading">
                    <h2><?php esc_html_e('Destaques', 'zwei-bruder'); ?></h2>
                    <div class="zb-carousel-actions" aria-hidden="true">
                        <span>‹</span>
                        <span>›</span>
                    </div>
                </div>
                <div class="zb-catalog-scroll">
                    <?php foreach ($featured_products as $product) : ?>
                        <div class="zb-carousel-item">
                            <?php zwei_bruder_render_showcase_card($product, 'zb-carousel-card'); ?>
                        </div>
                    <?php endforeach; ?>
                </div>
            </section>
        <?php endif; ?>

        <?php if ($hero_product) : ?>
            <section class="zb-hero-product">
                <div class="zb-hero-product-copy">
                    <p class="zb-eyebrow">
                        <?php echo esc_html(zwei_bruder_product_primary_category($hero_product) ?: get_bloginfo('description')); ?>
                    </p>
                    <h2><?php echo esc_html($hero_product->get_name()); ?></h2>
                    <p>
                        <?php
                        echo esc_html(
                            wp_trim_words(
                                wp_strip_all_tags(zwei_bruder_theme_option(
                                    'zwei_bruder_about_text',
                                    'Pecas selecionadas com acabamento artesanal e materiais de alta qualidade.'
                                )),
                                24
                            )
                        );
                        ?>
                    </p>
                    <a href="<?php echo esc_url(get_permalink($hero_product->get_id())); ?>" class="zb-button">
                        <?php esc_html_e('Ver produto', 'zwei-bruder'); ?>
                    </a>
                </div>
                <div class="zb-hero-product-image">
                    <img src="<?php echo esc_url(zwei_bruder_product_image_src($hero_product)); ?>" alt="<?php echo esc_attr($hero_product->get_name()); ?>">
                </div>
            </section>
        <?php endif; ?>

        <?php if (!empty($product_categories)) : ?>
            <nav class="zb-category-filter" aria-label="<?php esc_attr_e('Categorias de produto', 'zwei-bruder'); ?>">
                <a class="is-active" href="<?php echo esc_url(home_url('/#produtos')); ?>"><?php esc_html_e('Todos', 'zwei-bruder'); ?></a>
                <?php foreach ($product_categories as $term) : ?>
                    <a href="<?php echo esc_url(get_term_link($term)); ?>"><?php echo esc_html($term->name); ?></a>
                <?php endforeach; ?>
            </nav>
        <?php endif; ?>

        <?php if (empty($catalog_products)) : ?>
            <p class="zb-catalog-empty"><?php esc_html_e('Nenhum produto cadastrado ainda.', 'zwei-bruder'); ?></p>
        <?php else : ?>
            <div class="catalog-bento">
                <?php foreach ($catalog_products as $index => $product) : ?>
                    <?php zwei_bruder_render_showcase_card($product, zwei_bruder_bento_tile_class((int) $index)); ?>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    <?php endif; ?>
</div>
<?php
get_footer();
