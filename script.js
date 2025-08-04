// =================================================================
// SCRIPT UNIFIÉ V3.0 (FINAL, STABLE, PERFORMANT)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------------------
    // PARTIE 1 : LOGIQUE D'INTERACTIVITÉ DU SITE (CLIENT FINAL)
    // ----------------------------------------------------------------

    // 1. Initialisation des animations au scroll (AOS)
    try {
        AOS.init({ duration: 800, once: true, offset: 100 });
    } catch (e) {
        console.warn("AOS library not found.");
    }

    // 2. Logique du menu mobile
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.main-nav');
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => nav.classList.toggle('active'));
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => nav.classList.remove('active'));
        });
    }

    // 3. Logique du sélecteur de thème (Dark/Light Mode)
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const applyTheme = (theme) => {
            document.body.classList.toggle('dark-mode', theme === 'dark');
            themeToggle.checked = (theme === 'dark');
        };
        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);
        themeToggle.addEventListener('change', function() {
            const newTheme = this.checked ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }

    // 4. Logique du bouton "Retour en Haut"
    const backToTopButton = document.querySelector('.back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
    }
    
    // 5. Logique de la navigation active au défilement (Scrollspy)
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.main-nav a');
    if (sections.length > 0 && navLinks.length > 0) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${entry.target.id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { rootMargin: '-50% 0px -50% 0px' });

        sections.forEach(section => {
            observer.observe(section);
        });
    }


    // -------------------------------------------------------------------
    // PARTIE 2 : LOGIQUE "MARIONNETTE" (ÉCOUTE DES ORDRES DU GÉNÉRATEUR)
    // -------------------------------------------------------------------
    window.addEventListener('message', function(event) {
        if (!event.data || !event.data.type) return;
        const { type, valeur } = event.data;

        // --- GESTIONNAIRE D'ORDRES ---
        switch (type) {
            case 'UPDATE_THEME':
                if (valeur) {
                    for (const key in valeur) {
                        document.documentElement.style.setProperty(key, valeur[key]);
                    }
                }
                break;

            case 'SCROLL_TO_SECTION':
                const sectionElement = document.getElementById(valeur);
                if (sectionElement) {
                    sectionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                break;

            case 'MICRO_UPDATE':
                handleMicroUpdate(valeur);
                break;

            case 'MISE_A_JOUR_PORTFOLIO':
                handleFullUpdate(valeur);
                break;
        }
    });

    // --- FONCTIONS DE MISE À JOUR ---
    
    const updateText = (selector, value, parent = document) => { const el = parent.querySelector(selector); if (el && value !== undefined) el.textContent = value; };
    const updateAttr = (selector, attr, value, parent = document) => { const el = parent.querySelector(selector); if (el && value !== undefined) el[attr] = value; };

    function handleMicroUpdate(valeur) {
        const { section, index, field, content } = valeur;
        let parentElement;

        if (section === 'skills') parentElement = document.querySelector(`#skills .skills-container .skill-category:nth-child(${index + 1})`);
        if (section === 'projects') parentElement = document.querySelector(`#projects .projects-grid .project-card:nth-child(${index + 1})`);
        if (section === 'testimonials') parentElement = document.querySelector(`#testimonials .testimonials-grid .testimonial-card:nth-child(${index + 1})`);

        if (!parentElement) return;

        const targets = {
            skills: { title: 'h3', item1: 'li:nth-child(1)', item2: 'li:nth-child(2)', item3: 'li:nth-child(3)'},
            projects: { title: 'h3', description: 'p', image: '.project-img img', link: '.project-links a'},
            testimonials: { text: '.testimonial-text', authorName: '.author-name', authorTitle: '.author-title', authorPhoto: '.author-photo' }
        };

        const selector = targets[section][field];
        if (!selector) return;

        if (field === 'image' || field === 'authorPhoto') updateAttr(selector, 'src', content, parentElement);
        else if (field === 'link') updateAttr(selector, 'href', content, parentElement);
        else updateText(selector, content, parentElement);
    }

    function handleFullUpdate(data) {
        if (!data) return;

        // Mise à jour des champs statiques & SEO
        updateText('head title', data.titrePage);
        updateAttr('head meta[name="description"]', 'content', data.metaDescription);
        // ... (tous les autres champs statiques comme avant) ...
        updateAttr('.logo-prestige img', 'src', data.logo);
        updateText('.logo-prestige span', data.nomComplet);
        updateText('.hero-intro', data.titre);
        updateText('.hero-text h1', data.nomComplet);
        updateText('.hero-description', data.accroche);
        updateAttr('.hero-image img', 'src', data.photoProfil);
        updateText('#about .about-text h3', data.aboutTitre);
        updateText('#about .about-text p', data.aboutP);
        updateText('#contact .section-intro-portfolio', data.contactIntro);
        updateAttr('.contact-buttons-container a[href*="wa.me"]', 'href', `https://wa.me/${data.whatsapp || ''}`);
        updateAttr('.contact-buttons-container a[href*="mailto"]', 'href', `mailto:${data.email || ''}`);
        updateAttr('.social-icons a[aria-label="Facebook"]', 'href', data.facebook || '#');
        updateAttr('.social-icons a[aria-label="Instagram"]', 'href', data.instagram || '#');
        updateAttr('.social-icons a[aria-label="LinkedIn"]', 'href', data.linkedin || '#');
        updateAttr('.social-icons a[aria-label="TikTok"]', 'href', data.tiktok || '#');
        updateText('.copyright', `© 2025 ${data.nomComplet || 'Votre Nom'} - Tous droits réservés`);

        // Reconstruction des sections dynamiques
        const skillsContainer = document.querySelector('#skills .skills-container');
        if (skillsContainer) { skillsContainer.innerHTML = ''; if (data.skills && data.skills.length > 0) { data.skills.forEach(skill => { if (skill.title) { const items = [skill.item1, skill.item2, skill.item3].filter(i => i && i.trim() !== ''); const itemsHTML = items.map(item => `<li>${item.trim()}</li>`).join(''); skillsContainer.innerHTML += `<div class="skill-category" data-aos="fade-up"><h3>${skill.title}</h3><ul>${itemsHTML}</ul></div>`; } }); } }
        
        const projectsGrid = document.querySelector('#projects .projects-grid');
        if (projectsGrid) { projectsGrid.innerHTML = ''; if (data.projects && data.projects.length > 0) { data.projects.forEach(project => { if (project.title) { projectsGrid.innerHTML += `<article class="project-card" data-aos="fade-up"><div class="project-img"><img src="${project.image || ''}" alt="${project.title}"></div><div class="project-info"><h3>${project.title}</h3><p>${project.description || ''}</p><div class="project-links"><a href="${project.link || '#'}" target="_blank" class="btn btn-secondary">En Savoir Plus</a></div></div></article>`; } }); } }
        
        const testimonialsGrid = document.querySelector('#testimonials .testimonials-grid');
        if (testimonialsGrid) { testimonialsGrid.innerHTML = ''; if (data.testimonials && data.testimonials.length > 0) { data.testimonials.forEach(testimonial => { if (testimonial.text && testimonial.authorName) { testimonialsGrid.innerHTML += `<figure class="testimonial-card" data-aos="fade-up"><blockquote class="testimonial-text">${testimonial.text}</blockquote><figcaption class="testimonial-author"><img src="${testimonial.authorPhoto || 'https://i.pravatar.cc/100'}" alt="Photo de ${testimonial.authorName}" class="author-photo"><div class="author-info"><p class="author-name">${testimonial.authorName}</p><cite class="author-title">${testimonial.authorTitle || ''}</cite></div></figcaption></figure>`; } }); } }

        if (typeof AOS !== 'undefined') { AOS.refresh(); }
    }
});

// 6. Logique du Carrousel de Témoignages (Version Corrigée)
try {
    const swiper = new Swiper('.testimonial-swiper', {
        // **LA SOLUTION** : Le carrousel s'adapte à la hauteur de chaque slide
        autoHeight: true, 
        
        // Activer la boucle infinie
        loop: true,
        // Centrer les slides
        centeredSlides: true,
        // Pagination (les points en bas)
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        // Flèches de navigation
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        // Configuration responsive
        breakpoints: {
            // quand la largeur de la fenêtre est >= 320px
            320: {
                slidesPerView: 1,
                spaceBetween: 20
            },
            // quand la largeur de la fenêtre est >= 992px
            992: {
                slidesPerView: 2,
                spaceBetween: 30
            }
        }
    });
} catch (e) {
    console.warn("Swiper library not found or failed to initialize.");
}
    // ... (le début de ton script reste inchangé) ...

    // --- FONCTIONS DE MISE À JOUR ---
    
    // ... (les fonctions updateText et updateAttr restent inchangées) ...

    // Variable pour garder une référence à notre instance Swiper
    let testimonialSwiperInstance = null;

    function handleFullUpdate(data) {
        if (!data) return;
        
        // ... (toute la partie "Mise à jour des champs statiques & SEO" reste inchangée) ...
        // Depuis updateText('head title', ...) jusqu'à updateText('.copyright', ...)
        updateText('head title', data.titrePage);
        updateAttr('head meta[name="description"]', 'content', data.metaDescription);
        updateAttr('.logo-prestige img', 'src', data.logo);
        updateText('.logo-prestige span', data.nomComplet);
        updateText('.hero-intro', data.titre);
        updateText('.hero-text h1', data.nomComplet);
        updateText('.hero-description', data.accroche);
        updateAttr('.hero-image img', 'src', data.photoProfil);
        updateText('#about .about-text h3', data.aboutTitre);
        updateText('#about .about-text p', data.aboutP);
        updateText('#contact .section-intro-portfolio', data.contactIntro);
        updateAttr('.contact-buttons-container a[href*="wa.me"]', 'href', `https://wa.me/${data.whatsapp || ''}`);
        updateAttr('.contact-buttons-container a[href*="mailto"]', 'href', `mailto:${data.email || ''}`);
        updateAttr('.social-icons a[aria-label="Facebook"]', 'href', data.facebook || '#');
        updateAttr('.social-icons a[aria-label="Instagram"]', 'href', data.instagram || '#');
        updateAttr('.social-icons a[aria-label="LinkedIn"]', 'href', data.linkedin || '#');
        updateAttr('.social-icons a[aria-label="TikTok"]', 'href', data.tiktok || '#');
        updateText('.copyright', `© 2025 ${data.nomComplet || 'Votre Nom'} - Tous droits réservés`);

        // Reconstruction des sections Compétences et Projets (reste inchangée)
        const skillsContainer = document.querySelector('#skills .skills-container');
        if (skillsContainer) { /* ... (code de la reconstruction des skills) ... */ }
        const projectsGrid = document.querySelector('#projects .projects-grid');
        if (projectsGrid) { /* ... (code de la reconstruction des projets) ... */ }

        // LOGIQUE DE MISE À JOUR INTELLIGENTE DES TÉMOIGNAGES
        const testimonialsWrapper = document.querySelector('#testimonials .swiper-wrapper');
        if (testimonialsWrapper) {
            testimonialsWrapper.innerHTML = ''; // On vide les anciens témoignages
            if (data.testimonials && data.testimonials.length > 0) {
                data.testimonials.forEach(testimonial => {
                    if (testimonial.text && testimonial.authorName) {
                        const slide = document.createElement('div');
                        slide.className = 'swiper-slide';
                        slide.innerHTML = `<figure class="testimonial-card">
                            <blockquote class="testimonial-text">${testimonial.text}</blockquote>
                            <figcaption class="testimonial-author">
                                <img src="${testimonial.authorPhoto || 'https://i.pravatar.cc/100'}" alt="Photo de ${testimonial.authorName}" class="author-photo">
                                <div class="author-info">
                                    <p class="author-name">${testimonial.authorName}</p>
                                    <cite class="author-title">${testimonial.authorTitle || ''}</cite>
                                </div>
                            </figcaption>
                        </figure>`;
                        testimonialsWrapper.appendChild(slide);
                    }
                });
            }
            // On met à jour ou on initialise le carrousel après avoir ajouté les témoignages
            initOrUpdateTestimonialSwiper();
        }

        if (typeof AOS !== 'undefined') { AOS.refresh(); }
    }

    // 6. Logique du Carrousel de Témoignages (Maintenant Intelligente)
    function initOrUpdateTestimonialSwiper() {
        const swiperContainer = document.querySelector('.testimonial-swiper');
        const slides = swiperContainer.querySelectorAll('.swiper-slide');

        // S'il y a plus d'un témoignage, on active le carrousel
        if (slides.length > 1) {
            swiperContainer.classList.add('active'); // Classe pour afficher les flèches/points si besoin
            if (testimonialSwiperInstance) {
                testimonialSwiperInstance.update(); // On met juste à jour l'instance existante
            } else {
                // On crée l'instance si elle n'existe pas
                try {
                    testimonialSwiperInstance = new Swiper('.testimonial-swiper', {
                        autoHeight: true,
                        loop: true,
                        centeredSlides: true,
                        pagination: { el: '.swiper-pagination', clickable: true },
                        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                        breakpoints: {
                            320: { slidesPerView: 1, spaceBetween: 20 },
                            992: { slidesPerView: 2, spaceBetween: 30 }
                        }
                    });
                } catch (e) { console.warn("Swiper library not found or failed to initialize."); }
            }
        } else {
            // S'il n'y a qu'un seul (ou zéro) témoignage, on désactive le carrousel
            swiperContainer.classList.remove('active');
            if (testimonialSwiperInstance) {
                testimonialSwiperInstance.destroy(true, true); // On détruit l'instance
                testimonialSwiperInstance = null;
            }
        }
    }
    
    // Initialisation au chargement de la page
    initOrUpdateTestimonialSwiper();
    