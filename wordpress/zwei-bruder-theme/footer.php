<?php
if (!defined('ABSPATH')) {
    exit;
}
?>
</main>
<footer class="zb-site-footer" id="contato">
    <div class="zb-container">
        <div class="zb-footer-inner">
            <div>
                <p class="zb-footer-brand"><?php bloginfo('name'); ?></p>
                <p class="zb-footer-text">
                    <?php
                    echo esc_html(
                        get_bloginfo('description') ?:
                        'Facas e acessorios em couro de alta qualidade. Cada peca e pensada para durar, com design limpo e materiais selecionados.'
                    );
                    ?>
                </p>
            </div>

            <div>
                <p class="zb-footer-heading"><?php esc_html_e('Encontre-nos', 'zwei-bruder'); ?></p>
                <div class="zb-footer-menu">
                    <?php
                    if (has_nav_menu('footer')) {
                        wp_nav_menu([
                            'theme_location' => 'footer',
                            'container' => false,
                            'depth' => 1,
                        ]);
                    } else {
                        wp_list_pages([
                            'title_li' => '',
                            'depth' => 1,
                        ]);
                    }
                    ?>
                </div>
                <?php if (is_active_sidebar('footer')) : ?>
                    <div class="zb-footer-widgets">
                        <?php dynamic_sidebar('footer'); ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
    <div class="zb-footer-bottom">
        &copy; <?php echo esc_html(date('Y')); ?> <?php bloginfo('name'); ?>. <?php esc_html_e('Todos os direitos reservados.', 'zwei-bruder'); ?>
    </div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
