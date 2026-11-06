// ============================================================
// SBPL - preloader.js (Indépendant de app.js)
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    const loaderBar = document.getElementById('loader-bar');
    const startBtn = document.getElementById('start-btn');
    const preloaderMsg = document.getElementById('preloader-msg');

    if (!preloader) return;

    // 1. Démarrer la barre de progression (8 secondes)
    if (loaderBar) {
        loaderBar.style.transition = 'width 8s linear';
        // Petit timeout pour laisser le navigateur respirer avant l'animation
        setTimeout(() => {
            loaderBar.style.width = '100%';
        }, 100);
    }

    // 2. Timer de 8 secondes pour l'ouverture
    setTimeout(() => {
        if (preloaderMsg) preloaderMsg.innerText = 'SYSTÈME PRÊT';
        if (startBtn) {
            startBtn.style.display = 'inline-block';
            // Animation subtile d'entrée du bouton
            startBtn.style.opacity = '0';
            setTimeout(() => {
                startBtn.style.transition = 'opacity 0.5s ease';
                startBtn.style.opacity = '1';
            }, 10);
        }
    }, 8000);

    // 3. Gestion du clic de démarrage
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            // Animation de sortie du preloader
            preloader.style.transition = 'opacity 1s ease-in-out, transform 1.2s ease-in-out';
            preloader.style.opacity = '0';
            preloader.style.transform = 'scale(1.1)';
            
            document.body.style.overflow = 'auto';

            setTimeout(() => {
                preloader.style.display = 'none';
                // On peut déclencher un événement personnalisé si app.js veut savoir quand c'est fini
                window.dispatchEvent(new Event('site-ready'));
            }, 1000);
        });
    }
});
