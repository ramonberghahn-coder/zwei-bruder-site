<?php
if (!defined('ABSPATH')) {
    exit;
}
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<header class="zb-site-header">
    <div class="zb-container">
        <div class="zb-header-inner">
            <nav class="zb-nav" aria-label="<?php esc_attr_e('Menu principal', 'zwei-bruder'); ?>">
                <a href="<?php echo esc_url(zwei_bruder_shop_url()); ?>"><?php esc_html_e('Catalogo', 'zwei-bruder'); ?></a>
                <a href="#contato"><?php esc_html_e('Contato', 'zwei-bruder'); ?></a>
            </nav>

            <a class="zb-brand" href="<?php echo esc_url(home_url('/')); ?>">
                <?php bloginfo('name'); ?>
            </a>

            <div class="zb-header-actions">
                <?php if (function_exists('wc_get_cart_url')) : ?>
                    <a href="<?php echo esc_url(wc_get_cart_url()); ?>"><?php esc_html_e('Carrinho', 'zwei-bruder'); ?></a>
                <?php endif; ?>
            </div>
        </div>
    </div>
</header>
<main class="zb-main">
