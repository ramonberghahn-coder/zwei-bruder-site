<?php
if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>
<section class="zb-hero">
    <div class="zb-container zb-hero-inner">
        <div>
            <p class="zb-eyebrow"><?php esc_html_e('Cutelaria artesanal', 'zwei-bruder'); ?></p>
            <h1><?php esc_html_e('Facas e acessorios em couro feitos para durar.', 'zwei-bruder'); ?></h1>
            <p class="zb-hero-copy">
                <?php esc_html_e('Pecas selecionadas com acabamento premium, linhas limpas e materiais pensados para acompanhar sua rotina por muitos anos.', 'zwei-bruder'); ?>
            </p>
            <p>
                <a class="zb-button" href="<?php echo esc_url(home_url('/loja/')); ?>">
                    <?php esc_html_e('Ver produtos', 'zwei-bruder'); ?>
                </a>
            </p>
        </div>

        <div class="zb-hero-card">
            <p class="zb-eyebrow"><?php esc_html_e('Zwei Bruder', 'zwei-bruder'); ?></p>
            <p>
                <?php esc_html_e('Uma loja enxuta para apresentar produtos de alto padrao, receber pedidos e facilitar o contato direto pelo WhatsApp.', 'zwei-bruder'); ?>
            </p>
        </div>
    </div>
</section>

<section class="zb-section" id="produtos">
    <div class="zb-container">
        <div class="zb-section-heading">
            <div>
                <p class="zb-eyebrow"><?php esc_html_e('Catalogo', 'zwei-bruder'); ?></p>
                <h2 class="zb-section-title"><?php esc_html_e('Produtos em destaque', 'zwei-bruder'); ?></h2>
            </div>
            <a href="<?php echo esc_url(home_url('/loja/')); ?>"><?php esc_html_e('Ver todos', 'zwei-bruder'); ?></a>
        </div>

        <?php
        if (shortcode_exists('products')) {
            echo do_shortcode('[products limit="8" columns="4" orderby="date" order="DESC" visibility="visible"]');
        } else {
            echo '<p>' . esc_html__('Instale e ative o WooCommerce para exibir os produtos.', 'zwei-bruder') . '</p>';
        }
        ?>
    </div>
</section>
<?php
get_footer();
