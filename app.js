// ============================================================
// SPBL - app.js - Version stable
// ============================================================
gsap.registerPlugin(ScrollTrigger);

// ============================================================
// 0. CUSTOM CURSOR
// ============================================================
const cursor = document.querySelector('.custom-cursor');
const cursorFollower = document.querySelector('.custom-cursor-follower');

if (cursor && cursorFollower) {
    let mx = 0, my = 0, fx = 0, fy = 0;
    document.body.style.cursor = 'none';

    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        gsap.set(cursor, { x: mx, y: my });
    });

    (function loop() {
        fx += (mx - fx) * 0.1;
        fy += (my - fy) * 0.1;
        gsap.set(cursorFollower, { x: fx, y: fy });
        requestAnimationFrame(loop);
    })();

    document.querySelectorAll('a, button, .faq-item, .entity-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
            cursorFollower.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover');
            cursorFollower.classList.remove('cursor-hover');
        });
    });
}

// ============================================================
// 1. SITE REVEAL (WAIT FOR PRELOADER)
// ============================================================
function revealSite() {
    const tl = gsap.timeline();

    tl.fromTo('.logo-min', { opacity: 0, y: -25 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out' })
      .fromTo('.nav-links-desktop a, .burger-toggle', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'expo.out' }, '-=0.6')
      .fromTo('.hero-main-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.4')
      .fromTo('.image-split-rect', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' }, '-=0.8')
      .fromTo('.hero-info p', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
      .fromTo('.social-link', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, '-=0.8');
}

// Écouter l'événement envoyé par preloader.js
window.addEventListener('site-ready', () => {
    revealSite();
});

// ============================================================
// 2. CANVAS FRAME SEQUENCES
// ============================================================
function initCanvas(canvasId, frameCount, folder) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const images = [];
    const obj = { frame: 0 };
    const num = canvasId.split('-')[1];

    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = folder + '/' + i + '.webp';
        images.push(img);
    }

    function resize() {
        canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
        canvas.height = canvas.parentElement.offsetHeight || window.innerHeight;
    }

    function render() {
        const idx = Math.min(Math.round(obj.frame), frameCount - 1);
        const img = images[idx];
        if (!img || !img.complete || !img.naturalWidth) return;

        // Removed resize() from here to prevent extreme layout thrashing (lag)
        const r = Math.max(canvas.width / img.width, canvas.height / img.height);
        const cx = (canvas.width - img.width * r) / 2;
        const cy = (canvas.height - img.height * r) / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, img.width, img.height, cx, cy, img.width * r, img.height * r);
    }

    resize();
    if (images[0]) images[0].onload = render;

    // Only resize when the window resizes, and call render once
    window.addEventListener('resize', () => {
        resize();
        render();
    });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: '#video-section-' + num,
            start: 'top top',
            end: '+=80%',   // Ultra rapide : se joue sur moins d'un écran
            scrub: 0.1,    // Ultra sensible : pas de latence
            pin: true,
            anticipatePin: 1
        }
    });

    // L'animation des images commence très vite puis reprend une vitesse normale
    tl.to(obj, {
        frame: Math.floor((frameCount - 1) * 0.3), // Fait 30% des frames
        ease: 'power2.out',
        onUpdate: render,
        duration: 0.15 // en seulement 15% du scroll
    }, 0);

    tl.to(obj, {
        frame: frameCount - 1,
        ease: 'none',
        onUpdate: render,
        duration: 0.85 // Le reste à vitesse constante
    }, 0.15);

    // Si c'est la section 1, on ajoute l'animation du texte SPBL sur la MÊME timeline
    if (num === '1') {
        const chars = document.querySelectorAll('.blend-text .char');
        if (chars.length > 0) {
            // Apparition entre 28% et 48%
            // Note: filter blur combiné à mix-blend-mode tue les performances GPU (lag absolu). Remplacé par scale pour l'effet premium
            tl.fromTo(chars,
                { opacity: 0, y: 60, scale: 0.7 },
                { opacity: 1, y: 0, scale: 1, stagger: 0.05, ease: 'power2.out', duration: 0.2 },
                0.28
            );
        }
    }
}

// canvas-1 (haut, section 1) = frame 2 - DÉSACTIVÉ (Design épuré)
// initCanvas('canvas-1', 479, 'frame 2');

// Animation SBPL - SUPPRIMÉE

// Animation de Luminosité - DÉSACTIVÉE

// ============================================================
// ============================================================
// TEXT REVEAL (Letter by Letter Color Split)
// ============================================================
const revealText = document.querySelector('.reveal-text-main');
if (revealText) {
    const textContent = revealText.textContent.trim();
    revealText.innerHTML = '';

    // Split into spans for each character
    const words = textContent.split(' ');
    words.forEach((word, wordIndex) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        wordSpan.style.display = 'inline-block';

        word.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.textContent = char;
            charSpan.className = 'char';
            charSpan.style.display = 'inline-block';
            charSpan.style.color = 'rgba(255, 255, 255, 0.1)'; // Initial state
            wordSpan.appendChild(charSpan);
        });

        revealText.appendChild(wordSpan);

        // Add space after word (except the last one)
        if (wordIndex < words.length - 1) {
            const spaceSpan = document.createElement('span');
            spaceSpan.textContent = ' ';
            spaceSpan.className = 'char';
            spaceSpan.style.whiteSpace = 'pre';
            revealText.appendChild(spaceSpan);
        }
    });

    // Animate color change letter by letter during scroll
    gsap.to(revealText.querySelectorAll('.char'), {
        color: '#ff0000',
        stagger: 0.1,
        ease: 'none',
        scrollTrigger: {
            trigger: '.text-reveal-section',
            start: 'top 30%',
            end: 'bottom 70%',
            scrub: 1
        }
    });
}

// Animate the moved SBPL background letters on scroll
const sbplChars = document.querySelectorAll('.sbpl-reveal-section .blend-text .char');
if (sbplChars.length > 0) {
    gsap.fromTo(sbplChars,
        { opacity: 0, scale: 0.8, y: 50 },
        {
            opacity: 1, scale: 1, y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.sbpl-reveal-section',
                start: 'top 50%', // Attendre que la section soit au milieu de l'écran
                toggleActions: 'play none none reverse'
            }
        }
    );
}


// ============================================================
// PARALLAX ZIGZAG IMAGES
// ============================================================
// Les 4 images défilent une par une en zigzag tout au long du scroll de la section
const parallaxImgs = ['.p1', '.p2', '.p3', '.p4'];
parallaxImgs.forEach((sel, i) => {
    const startProgress = i * 20; // 0%, 20%, 40%, 60% de déclenchement décalé

    gsap.fromTo(sel,
        { opacity: 0.8, y: window.innerHeight, scale: 0.9 }, // Commence tout en bas de l'écran
        {
            y: -window.innerHeight - 300, // Monte jusqu'en haut et sort de l'écran
            scale: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: '.text-reveal-section',
                start: `top+=${startProgress}% bottom`, // Le déclenchement est retardé pour chaque image
                end: `bottom top`,
                scrub: 1
            }
        }
    );
});




// ============================================================
// 6. ENTITIES VIDEO SEQUENCE (Canvas 2)
// ============================================================
const vSection = document.querySelector('.entities-video-section');
const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

if (vSection && !isSafariBrowser) {
    const canvas2 = document.getElementById('canvas-2');
    let ctx2 = null;
    let images2 = [];
    let images2Loaded = 0;
    const frameCount2 = 479;

    if (canvas2) {
        ctx2 = canvas2.getContext('2d');
        for (let i = 0; i < frameCount2; i++) {
            const img = new Image();
            img.src = `frame 1/${i + 1}.webp`;
            img.onload = () => {
                images2Loaded++;
                if (images2Loaded === 1) renderCanvas2(0);
            };
            images2.push(img);
        }

        function resizeCanvas2() {
            canvas2.width = window.innerWidth;
            canvas2.height = window.innerHeight;
            if (images2[0]) renderCanvas2(0); // Rendu immédiat
        }
        window.addEventListener('resize', resizeCanvas2);
        resizeCanvas2();
    }

    function renderCanvas2(frameIdx) {
        if (!ctx2 || !images2[frameIdx] || !images2[frameIdx].complete || !images2[frameIdx].naturalWidth) return;
        const img = images2[frameIdx];
        const r = Math.max(canvas2.width / img.width, canvas2.height / img.height);
        const cx = (canvas2.width - img.width * r) / 2;
        const cy = (canvas2.height - img.height * r) / 2;
        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
        ctx2.drawImage(img, 0, 0, img.width, img.height, cx, cy, img.width * r, img.height * r);
    }

    // Zoom Intro
    gsap.fromTo(canvas2,
        { scale: 1.8 },
        {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: vSection,
                start: 'top bottom',
                end: 'top top',
                scrub: 0.5
            }
        }
    );

    // Frame Sequence (Sticky while playing)
    gsap.to({}, {
        scrollTrigger: {
            trigger: vSection,
            pin: true,
            start: 'top top',
            end: '+=100%',
            scrub: true,
            onUpdate: self => {
                const frameIdx = Math.min(Math.round(self.progress * (frameCount2 - 1)), frameCount2 - 1);
                renderCanvas2(frameIdx);
            }
        }
    });

    // ============================================================
    // 6. PREMIUM HORIZONTAL SHOWCASE (SIDE TITLE + PARALLAX BG)
    // ============================================================
    const scSection = document.querySelector('.horizontal-showcase');
    const scContainer = document.querySelector('.showcase-container');
    const scProgress = document.querySelector('.showcase-progress-bar');
    const scBg = document.querySelector('.showcase-bg-image');

    if (scSection && scContainer) {
        const cards = gsap.utils.toArray('.showcase-card');
        const getMoveAmount = () => {
            const sideWidth = window.innerWidth > 480 ? window.innerWidth * 0.25 : 0;
            const extra = window.innerWidth > 480 ? 0 : 60; // Marge pour mobile
            return scContainer.scrollWidth - window.innerWidth + sideWidth + extra;
        };

        let tl = gsap.timeline({
            scrollTrigger: {
                trigger: scSection,
                start: 'top top',
                end: () => `+=${scContainer.scrollWidth}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
                onUpdate: self => {
                    if (scProgress) scProgress.style.width = `${self.progress * 100}%`;
                }
            }
        });

        // Main cards movement
        tl.to(scContainer, {
            x: () => -getMoveAmount(),
            ease: 'none'
        });

        // Background Parallax (Moves slower than cards)
        if (scBg) {
            tl.to(scBg, {
                x: () => -getMoveAmount() * 0.2, // Parallaxe subtile
                ease: 'none'
            }, 0);
        }

        // Parallax effect on card content
        cards.forEach(card => {
            const inner = card.querySelector('.card-parallax-content');
            if (inner) {
                gsap.fromTo(inner,
                    { x: 30 },
                    {
                        x: -30,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: card,
                            containerAnimation: tl,
                            start: 'left right',
                            end: 'right left',
                            scrub: true
                        }
                    }
                );
            }
        });
    }
}


// ============================================================
// 7. HERO SLIDESHOW
// ============================================================
const slides = document.querySelectorAll('.image-split-rect .split-slide');
if (slides.length > 0) {
    let cur = 0;
    setInterval(() => {
        slides[cur].classList.remove('active');
        cur = (cur + 1) % slides.length;
        slides[cur].classList.add('active');
    }, 4000);
}

// ============================================================
// 8. FAQ
// ============================================================
document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
    });
});

// ============================================================
// 9. MOBILE MENU
// ============================================================
// Burger Menu Logic
const burgerBtn = document.getElementById('burger-btn');
const mobileNav = document.getElementById('mobile-nav');

if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
        burgerBtn.classList.toggle('active');
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            burgerBtn.classList.remove('active');
        });
    });
}

// Reveal Hero Overlap Card at end of scroll - DÉSACTIVÉ (Section 1 vidée)
/*
gsap.to('.hero-overlap-card', {
    opacity: 1,
...
    }
});
*/

// ============================================================
// 10. SERVICES DRAG SCROLL
// ============================================================
document.querySelectorAll('.drag-container').forEach(slider => {
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.style.cursor = 'grabbing';
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });
    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // Vitesse de défilement
        slider.scrollLeft = scrollLeft - walk;
    });
});

// ============================================================
// 11. SPLIT REVEAL ANIMATION
// ============================================================
const splitSection = document.querySelector('.split-reveal-section');
if (splitSection) {
    const doorLeft = splitSection.querySelector('.door-left');
    const doorRight = splitSection.querySelector('.door-right');
    const splitText = splitSection.querySelector('.reveal-text-overlay');
    const splitBg = splitSection.querySelector('.reveal-image-bg');

    const splitTl = gsap.timeline({
        scrollTrigger: {
            trigger: splitSection,
            start: 'top top',
            end: '+=100%',
            pin: true,
            scrub: 1,
            anticipatePin: 1
        }
    });

    splitTl.to(doorLeft, { xPercent: -100, ease: 'none', force3D: true }, 0)
           .to(doorRight, { xPercent: 100, ease: 'none', force3D: true }, 0)
           .fromTo(splitText, { scale: 0.8, opacity: 0, y: 50 }, { scale: 1, opacity: 1, y: 0, ease: 'power2.out' }, 0.1)
           .fromTo(splitBg, { scale: 1.2 }, { scale: 1, ease: 'power1.out' }, 0);
}

// ============================================================
// 10. GLOBAL SCROLL INDICATOR LOGIC
// ============================================================
const scrollIndicator = document.getElementById('global-scroll-indicator');
if (scrollIndicator) {
    let scrollTimeout;

    function handleScrollActivity() {
        // Hide immediately on scroll
        if (scrollIndicator.classList.contains('visible')) {
            scrollIndicator.classList.remove('visible');
        }
        
        clearTimeout(scrollTimeout);
        
        // Check if at the bottom (near footer)
        const scrollPosition = window.innerHeight + window.scrollY;
        const documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
        
        // If not at the bottom (allow 200px threshold for footer)
        if (scrollPosition < documentHeight - 200) {
            scrollTimeout = setTimeout(() => {
                scrollIndicator.classList.add('visible');
            }, 4000);
        }
    }

    // Initialize delay ONLY after preloader is gone
    window.addEventListener('preloaderFinished', () => {
        scrollTimeout = setTimeout(() => {
            if (window.scrollY < 100) {
                scrollIndicator.classList.add('visible');
            }
        }, 4000);
    });

    // Listen to native scroll
    window.addEventListener('scroll', handleScrollActivity, { passive: true });
}

// ============================================================
// 12. STATS COUNT ANIMATION
// ============================================================
const statNums = document.querySelectorAll('.stat-num');
if (statNums.length > 0) {
    statNums.forEach(num => {
        const target = parseInt(num.getAttribute('data-target'));
        gsap.to(num, {
            innerText: target,
            duration: 2.5,
            snap: { innerText: 1 },
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.sbpl-stats-container',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    });
}
// ============================================================
// 13. SHOP REDIRECTION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const shopItems = document.querySelectorAll('.shop-item');
    if (shopItems.length > 0) {
        shopItems.forEach(item => {
            item.addEventListener('click', () => {
                window.location.href = 'shop/boutique.html';
            });
        });
    }
});
