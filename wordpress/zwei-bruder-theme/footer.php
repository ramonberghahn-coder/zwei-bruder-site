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
                    echo esc_html(zwei_bruder_theme_option(
                        'zwei_bruder_about_text',
                        get_bloginfo('description') ?:
                            'Facas e acessorios em couro de alta qualidade. Cada peca e pensada para durar, com design limpo e materiais selecionados.'
                    )
                    );
                    ?>
                </p>
            </div>

            <div>
                <p class="zb-footer-heading"><?php esc_html_e('Encontre-nos', 'zwei-bruder'); ?></p>
                <div class="zb-contact-links">
                    <?php if (zwei_bruder_theme_option('zwei_bruder_whatsapp_url')) : ?>
                        <a href="<?php echo esc_url(zwei_bruder_theme_option('zwei_bruder_whatsapp_url')); ?>" target="_blank" rel="noopener noreferrer">WhatsApp</a>
                    <?php endif; ?>
                    <?php if (zwei_bruder_theme_option('zwei_bruder_instagram_url')) : ?>
                        <a href="<?php echo esc_url(zwei_bruder_theme_option('zwei_bruder_instagram_url')); ?>" target="_blank" rel="noopener noreferrer">Instagram</a>
                    <?php endif; ?>
                    <?php if (zwei_bruder_theme_option('zwei_bruder_contact_email')) : ?>
                        <a href="mailto:<?php echo esc_attr(zwei_bruder_theme_option('zwei_bruder_contact_email')); ?>"><?php echo esc_html(zwei_bruder_theme_option('zwei_bruder_contact_email')); ?></a>
                    <?php endif; ?>
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
