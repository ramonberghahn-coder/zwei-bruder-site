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
        '1.3.0'
    );
}
add_action('wp_enqueue_scripts', 'zwei_bruder_assets');

function zwei_bruder_theme_option(string $key, string $default = ''): string
{
    $value = get_theme_mod($key, $default);
    return is_string($value) ? $value : $default;
}

function zwei_bruder_shop_url(): string
{
    if (function_exists('wc_get_page_permalink')) {
        $shop_url = wc_get_page_permalink('shop');
        if ($shop_url) {
            return $shop_url;
        }
    }

    return home_url('/loja/');
}

function zwei_bruder_contact_url(): string
{
    $whatsapp = zwei_bruder_theme_option('zwei_bruder_whatsapp_url');
    if ($whatsapp) {
        return $whatsapp;
    }

    $contact = get_page_by_path('contato');
    return $contact ? get_permalink($contact) : home_url('/contato/');
}

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

function zwei_bruder_product_image_src(WC_Product $product, string $size = 'large'): string
{
    $image_id = $product->get_image_id();
    if ($image_id) {
        $src = wp_get_attachment_image_url($image_id, $size);
        if ($src) {
            return $src;
        }
    }

    $gallery_ids = $product->get_gallery_image_ids();
    if (!empty($gallery_ids)) {
        $src = wp_get_attachment_image_url((int) $gallery_ids[0], $size);
        if ($src) {
            return $src;
        }
    }

    return function_exists('wc_placeholder_img_src') ? wc_placeholder_img_src($size) : '';
}

function zwei_bruder_bento_tile_class(int $index): string
{
    $mod = $index % 6;
    if ($mod === 0) {
        return 'bento-tile-lg';
    }
    if ($mod === 3) {
        return 'bento-tile-wide';
    }
    return 'bento-tile-md';
}

function zwei_bruder_product_primary_category(WC_Product $product): string
{
    $terms = get_the_terms($product->get_id(), 'product_cat');
    if (is_array($terms) && isset($terms[0])) {
        return $terms[0]->name;
    }
    return '';
}

function zwei_bruder_render_showcase_card(WC_Product $product, string $class = ''): void
{
    $category = zwei_bruder_product_primary_category($product);
    $is_waitlist = !$product->is_in_stock();
    ?>
    <a href="<?php echo esc_url(get_permalink($product->get_id())); ?>" class="showcase-card group <?php echo esc_attr($class); ?>">
        <img src="<?php echo esc_url(zwei_bruder_product_image_src($product)); ?>" alt="<?php echo esc_attr($product->get_name()); ?>" loading="lazy">
        <div class="zb-showcase-content">
            <?php if ($category) : ?>
                <span class="zb-showcase-category"><?php echo esc_html($category); ?></span>
            <?php else : ?>
                <span></span>
            <?php endif; ?>

            <div>
                <h3><?php echo esc_html($product->get_name()); ?></h3>
                <p>
                    <?php
                    if ($is_waitlist) {
                        esc_html_e('Sob encomenda', 'zwei-bruder');
                    } else {
                        echo wp_kses_post($product->get_price_html());
                    }
                    ?>
                </p>
            </div>
        </div>
    </a>
    <?php
}

function zwei_bruder_featured_products(): array
{
    if (!function_exists('wc_get_products')) {
        return [];
    }

    $featured = wc_get_products([
        'status' => 'publish',
        'featured' => true,
        'limit' => 8,
        'orderby' => 'date',
        'order' => 'DESC',
    ]);

    if (!empty($featured)) {
        return $featured;
    }

    return array_slice(zwei_bruder_catalog_products(8), 0, 4);
}

function zwei_bruder_catalog_products(int $limit = 12): array
{
    if (!function_exists('wc_get_products')) {
        return [];
    }

    return wc_get_products([
        'status' => 'publish',
        'limit' => $limit,
        'orderby' => 'date',
        'order' => 'DESC',
    ]);
}

function zwei_bruder_category_banners(): array
{
    if (!taxonomy_exists('product_cat') || !function_exists('wc_get_products')) {
        return [];
    }

    $terms = get_terms([
        'taxonomy' => 'product_cat',
        'hide_empty' => true,
        'number' => 2,
    ]);

    if (is_wp_error($terms)) {
        return [];
    }

    $banners = [];
    foreach ($terms as $term) {
        $products = wc_get_products([
            'status' => 'publish',
            'category' => [$term->slug],
            'limit' => 1,
        ]);
        $image = isset($products[0]) ? zwei_bruder_product_image_src($products[0]) : '';
        $banners[] = [
            'name' => $term->name,
            'url' => get_term_link($term),
            'count' => (int) $term->count,
            'image' => $image,
        ];
    }

    return $banners;
}

function zwei_bruder_create_page(string $title, string $slug, string $content = ''): int
{
    $existing = get_page_by_path($slug);
    if ($existing instanceof WP_Post) {
        return (int) $existing->ID;
    }

    return (int) wp_insert_post([
        'post_title' => $title,
        'post_name' => $slug,
        'post_content' => $content,
        'post_status' => 'publish',
        'post_type' => 'page',
    ]);
}

function zwei_bruder_add_menu_item(int $menu_id, string $title, string $url): void
{
    $items = wp_get_nav_menu_items($menu_id) ?: [];
    foreach ($items as $item) {
        if ($item->url === $url || $item->title === $title) {
            return;
        }
    }

    wp_update_nav_menu_item($menu_id, 0, [
        'menu-item-title' => $title,
        'menu-item-url' => $url,
        'menu-item-status' => 'publish',
        'menu-item-type' => 'custom',
    ]);
}

function zwei_bruder_remove_menu_items_by_title(int $menu_id, array $titles): void
{
    $items = wp_get_nav_menu_items($menu_id) ?: [];
    $normalized_titles = array_map('strtolower', $titles);

    foreach ($items as $item) {
        if (in_array(strtolower($item->title), $normalized_titles, true)) {
            wp_delete_post((int) $item->ID, true);
        }
    }
}

function zwei_bruder_run_initial_setup(): void
{
    if (!current_user_can('manage_options')) {
        return;
    }

    $setup_version = '1.2.0';
    if (get_option('zwei_bruder_setup_version') === $setup_version) {
        return;
    }

    $home_id = zwei_bruder_create_page('Inicio', 'inicio');
    zwei_bruder_create_page(
        'Contato',
        'contato',
        "Fale conosco pelo WhatsApp, Instagram ou e-mail para tirar duvidas sobre produtos, pedidos e personalizacoes."
    );

    if ($home_id > 0) {
        update_option('show_on_front', 'page');
        update_option('page_on_front', $home_id);
    }

    if (!get_bloginfo('name') || get_bloginfo('name') === 'Meu site') {
        update_option('blogname', 'Zwei Bruder');
    }

    if (!get_bloginfo('description')) {
        update_option('blogdescription', 'Facas e acessorios em couro');
    }

    $locations = get_theme_mod('nav_menu_locations', []);
    $primary_menu = wp_get_nav_menu_object('Menu principal');
    if (!$primary_menu) {
        $primary_menu_id = wp_create_nav_menu('Menu principal');
    } else {
        $primary_menu_id = (int) $primary_menu->term_id;
    }

    if ($primary_menu_id > 0) {
        zwei_bruder_remove_menu_items_by_title($primary_menu_id, ['Contato']);
        zwei_bruder_add_menu_item($primary_menu_id, 'Produtos', zwei_bruder_shop_url());
        $locations['primary'] = $primary_menu_id;
    }

    $footer_menu = wp_get_nav_menu_object('Menu do rodape');
    if (!$footer_menu) {
        $footer_menu_id = wp_create_nav_menu('Menu do rodape');
    } else {
        $footer_menu_id = (int) $footer_menu->term_id;
    }

    if ($footer_menu_id > 0) {
        zwei_bruder_remove_menu_items_by_title($footer_menu_id, ['Loja', 'Minha conta', 'Contato']);
        $locations['footer'] = $footer_menu_id;
    }

    set_theme_mod('nav_menu_locations', $locations);
    update_option('zwei_bruder_setup_version', $setup_version);
}
add_action('after_switch_theme', 'zwei_bruder_run_initial_setup');
add_action('admin_init', 'zwei_bruder_run_initial_setup');

function zwei_bruder_customize_register(WP_Customize_Manager $wp_customize): void
{
    $wp_customize->add_section('zwei_bruder_brand', [
        'title' => __('Zwei Bruder - textos e contato', 'zwei-bruder'),
        'priority' => 30,
    ]);

    $settings = [
        'zwei_bruder_hero_title' => [
            'label' => __('Titulo da home', 'zwei-bruder'),
            'default' => 'Facas e acessorios em couro feitos para durar.',
            'sanitize' => 'sanitize_text_field',
            'type' => 'text',
        ],
        'zwei_bruder_hero_text' => [
            'label' => __('Texto da home', 'zwei-bruder'),
            'default' => 'Pecas selecionadas com acabamento premium, linhas limpas e materiais pensados para acompanhar sua rotina por muitos anos.',
            'sanitize' => 'sanitize_textarea_field',
            'type' => 'textarea',
        ],
        'zwei_bruder_about_text' => [
            'label' => __('Texto do rodape', 'zwei-bruder'),
            'default' => 'Facas e acessorios em couro de alta qualidade. Cada peca e pensada para durar, com design limpo e materiais selecionados.',
            'sanitize' => 'sanitize_textarea_field',
            'type' => 'textarea',
        ],
        'zwei_bruder_whatsapp_url' => [
            'label' => __('Link do WhatsApp', 'zwei-bruder'),
            'default' => '',
            'sanitize' => 'esc_url_raw',
            'type' => 'url',
        ],
        'zwei_bruder_instagram_url' => [
            'label' => __('Link do Instagram', 'zwei-bruder'),
            'default' => '',
            'sanitize' => 'esc_url_raw',
            'type' => 'url',
        ],
        'zwei_bruder_contact_email' => [
            'label' => __('E-mail de contato', 'zwei-bruder'),
            'default' => '',
            'sanitize' => 'sanitize_email',
            'type' => 'email',
        ],
    ];

    foreach ($settings as $key => $config) {
        $wp_customize->add_setting($key, [
            'default' => $config['default'],
            'sanitize_callback' => $config['sanitize'],
        ]);

        $wp_customize->add_control($key, [
            'label' => $config['label'],
            'section' => 'zwei_bruder_brand',
            'type' => $config['type'],
        ]);
    }
}
add_action('customize_register', 'zwei_bruder_customize_register');
