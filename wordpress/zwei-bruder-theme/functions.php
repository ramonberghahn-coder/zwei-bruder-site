<?php
if (!defined('ABSPATH')) {
    exit;
}

function zwei_bruder_setup(): void
{
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('woocommerce');
    add_theme_support('wc-product-gallery-zoom');
    add_theme_support('wc-product-gallery-lightbox');
    add_theme_support('wc-product-gallery-slider');

    register_nav_menus([
        'primary' => __('Menu principal', 'zwei-bruder'),
        'footer' => __('Menu do rodape', 'zwei-bruder'),
    ]);
}
add_action('after_setup_theme', 'zwei_bruder_setup');

function zwei_bruder_assets(): void
{
    wp_enqueue_style(
        'zwei-bruder-theme',
        get_template_directory_uri() . '/assets/css/theme.css',
        [],
        '1.0.0'
    );
}
add_action('wp_enqueue_scripts', 'zwei_bruder_assets');

function zwei_bruder_widgets(): void
{
    register_sidebar([
        'name' => __('Rodape', 'zwei-bruder'),
        'id' => 'footer',
        'description' => __('Widgets exibidos no rodape.', 'zwei-bruder'),
        'before_widget' => '<div class="zb-footer-widget">',
        'after_widget' => '</div>',
        'before_title' => '<p class="zb-footer-heading">',
        'after_title' => '</p>',
    ]);
}
add_action('widgets_init', 'zwei_bruder_widgets');

function zwei_bruder_excerpt_length(): int
{
    return 22;
}
add_filter('excerpt_length', 'zwei_bruder_excerpt_length');

function zwei_bruder_woocommerce_products_per_page(): int
{
    return 12;
}
add_filter('loop_shop_per_page', 'zwei_bruder_woocommerce_products_per_page');

function zwei_bruder_woocommerce_loop_columns(): int
{
    return 4;
}
add_filter('loop_shop_columns', 'zwei_bruder_woocommerce_loop_columns');
