/**
 * =================================================================
 * SCRIPT GÉNÉRATEUR V2.0 - OPÉRATION CAPITAL (AVEC APERÇU PLEIN ÉCRAN)
 * =================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    new PortfolioGenerator();
});

class PortfolioGenerator {
    constructor() {
        // --- SÉLECTION DES ÉLÉMENTS DU DOM ---
        this.iframe = document.querySelector('#preview-panel iframe');
        this.formContainer = document.querySelector('.form-container');
        this.downloadBtn = document.getElementById('download-btn');
        this.successModal = document.getElementById('success-modal');
        this.previewBtn = document.getElementById('preview-btn'); // Bouton "Aperçu"
        this.editBtn = document.getElementById('edit-btn');       // Bouton "Éditer"
        this.allInputs = this.formContainer.querySelectorAll('input, textarea');

        // Conteneurs pour les blocs dynamiques
        this.skillsRepeater = document.getElementById('skills-repeater');
        this.projectsRepeater = document.getElementById('projects-repeater');
        this.testimonialsRepeater = document.getElementById('testimonials-repeater');
        
        // --- GESTION DE L'ÉTAT ---
        this.portfolioData = this.getInitialData();
        this.isPristine = true;
        this.templateHTML = ''; // Pour stocker le HTML du template

        // --- INITIALISATION ---
        this.init();
    }

    async init() {
        await this.fetchTemplate(); // On charge le template HTML d'abord
        this.setupEventListeners();
        this.updatePreview(); // Premier aperçu avec les données initiales
        this.checkFormValidity();
    }
    
    /**
     * Récupère le contenu du template pour l'injecter dans l'iframe.
     * C'est la clé pour un aperçu fiable et autonome.
     */
    async fetchTemplate() {
        try {
            // IMPORTANT : Assurez-vous que 'template-prestige.html' est accessible
            // depuis 'index-generateur.html'. Il doit être dans le même dossier
            // ou vous devez fournir le bon chemin.
            const response = await fetch('template-prestige.html');
            if (!response.ok) throw new Error('Le fichier template est introuvable.');
            this.templateHTML = await response.text();
        } catch (error) {
            console.error("Erreur critique:", error);
            this.iframe.srcdoc = `<p style="color:red; font-family:sans-serif; padding:1rem;"><b>Erreur de chargement :</b> Impossible de trouver le fichier <code>template-prestige.html</code>. Assurez-vous qu'il est bien placé à côté du générateur.</p>`;
        }
    }

    setupEventListeners() {
        this.formContainer.addEventListener('input', this.handleFormInteraction.bind(this));
        this.formContainer.addEventListener('blur', this.handleBlurValidation.bind(this), true);
        
        document.getElementById('add-skill').addEventListener('click', () => this.addRepeaterItem('skills'));
        document.getElementById('add-project').addEventListener('click', () => this.addRepeaterItem('projects'));
        document.getElementById('add-testimonial').addEventListener('click', () => this.addRepeaterItem('testimonials'));
        this.formContainer.addEventListener('click', this.handleRemoveRepeaterItem.bind(this));
        
        this.downloadBtn.addEventListener('click', this.handleDownloadClick.bind(this));
        
        // NOUVELLE LOGIQUE POUR L'APERÇU
        this.previewBtn.addEventListener('click', this.enterFullscreenPreview.bind(this));
        this.editBtn.addEventListener('click', this.exitFullscreenPreview.bind(this));

        this.successModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('close-modal') || e.target.classList.contains('btn-primary-modal')) {
                this.successModal.style.display = 'none';
            }
        });
    }

    // --- NOUVELLES FONCTIONS POUR GÉRER L'APERÇU ---

    enterFullscreenPreview() {
        document.body.classList.add('fullscreen-preview');
    }

    exitFullscreenPreview() {
        document.body.classList.remove('fullscreen-preview');
    }
    
    // --- LE RESTE DE LA LOGIQUE (légèrement adapté) ---

    handleFormInteraction(e) {
        if (this.isPristine) {
            this.resetToBlankSlate();
            this.isPristine = false;
        }
        this.collectAllData();
        this.updatePreview();
        this.checkFormValidity();
    }
    
    handleBlurValidation(e) {
        const target = e.target;
        if (target.matches('input, textarea')) {
             this.validateField(target);
             this.checkFormValidity();
        }
    }

    collectAllData() {
        const data = this.getBlankData();
        // ... (la collecte reste identique)
        data.nomComplet = document.getElementById('nomComplet').value;
        data.titre = document.getElementById('titre').value;
        data.accroche = document.getElementById('accroche').value;
        data.logo = document.getElementById('logo').value;
        data.photoProfil = document.getElementById('photoProfil').value;
        data.aboutTitre = document.getElementById('aboutTitre').value;
        data.aboutP = document.getElementById('aboutP').value;
        data.contactIntro = document.getElementById('contactIntro').value;
        data.whatsapp = document.getElementById('whatsapp').value;
        data.email = document.getElementById('email').value;
        data.facebook = document.getElementById('facebook').value;
        data.instagram = document.getElementById('instagram').value;
        data.linkedin = document.getElementById('linkedin').value;
        data.tiktok = document.getElementById('tiktok').value;
        data.titrePage = document.getElementById('titrePage').value;
        data.metaDescription = document.getElementById('metaDescription').value;
        data.ogImage = document.getElementById('ogImage').value;
        data.skills = this.collectRepeaterData(this.skillsRepeater, ['title', 'item1', 'item2', 'item3']);
        data.projects = this.collectRepeaterData(this.projectsRepeater, ['title', 'description', 'image', 'link']);
        data.testimonials = this.collectRepeaterData(this.testimonialsRepeater, ['text', 'authorName', 'authorTitle', 'authorPhoto']);
        this.portfolioData = data;
    }
    
    collectRepeaterData(container, fields) {
        const items = [];
        container.querySelectorAll('.repeater-item').forEach(item => {
            const itemData = {};
            fields.forEach(field => {
                const input = item.querySelector(`[data-field="${field}"]`);
                if(input) itemData[field] = input.value;
            });
            items.push(itemData);
        });
        return items;
    }

    updatePreview() {
        // On injecte le HTML de base dans l'iframe
        this.iframe.srcdoc = this.templateHTML;

        // On attend que l'iframe soit chargé pour envoyer les données
        this.iframe.onload = () => {
            this.iframe.contentWindow.postMessage({
                type: 'MISE_A_JOUR_PORTFOLIO',
                valeur: this.portfolioData
            }, '*');
        };
    }

    checkFormValidity() {
        let isFormValid = true;
        this.allInputs.forEach(input => {
            if (input.offsetParent !== null) {
                 const isFieldValid = this.validateField(input);
                 if (!isFieldValid) isFormValid = false;
            }
        });
        this.downloadBtn.disabled = !isFormValid;
    }
    
    validateField(input) {
        const formGroup = input.closest('.form-group, .repeater-item');
        if (!formGroup) return true;
        const errorMsgElement = formGroup.querySelector('.error-message');
        let isValid = true;
        let errorMessage = "";

        if (input.required && input.value.trim() === '') {
            isValid = false;
            errorMessage = "Ce champ est obligatoire.";
        }
        else if (input.type === 'url' && input.value.trim() !== '') {
            try { new URL(input.value); } 
            catch (e) { isValid = false; errorMessage = "Veuillez entrer une URL valide."; }
        }
        else if (input.type === 'email' && input.value.trim() !== '') {
            if (!/^\S+@\S+\.\S+$/.test(input.value)) {
                isValid = false;
                errorMessage = "Veuillez entrer une adresse email valide.";
            }
        }

        if (!isValid) {
            formGroup.classList.add('has-error');
            if (errorMsgElement) errorMsgElement.textContent = errorMessage;
        } else {
            formGroup.classList.remove('has-error');
            if (errorMsgElement) errorMsgElement.textContent = "";
        }
        return isValid;
    }
    
    handleDownloadClick() {
        this.checkFormValidity();
        if (this.downloadBtn.disabled) {
            const firstErrorField = this.formContainer.querySelector('.has-error');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            this.generateAndDownloadFile();
        }
    }
    
    generateAndDownloadFile() {
        const finalHtmlContent = this.iframe.contentWindow.document.documentElement.outerHTML;
        const blob = new Blob([finalHtmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.successModal.style.display = 'flex';
    }

    addRepeaterItem(type) {
        // ... (cette fonction reste identique)
        const item = document.createElement('div');
        item.className = 'repeater-item';
        let htmlContent = '';
        const removeButton = `<button type="button" class="remove-btn" data-remove-type="${type}" aria-label="Supprimer ce bloc">&times;</button>`;
        switch (type) {
            case 'skills':
                htmlContent = `${removeButton}<div class="form-group"><label>Titre de la catégorie</label><input type="text" data-field="title" placeholder="Ex: Stratégie & Contenu"></div><div class="form-group"><label>Compétence 1</label><input type="text" data-field="item1" placeholder="Ex: Calendrier Éditorial"></div><div class="form-group"><label>Compétence 2</label><input type="text" data-field="item2" placeholder="Ex: Copywriting"></div><div class="form-group"><label>Compétence 3</label><input type="text" data-field="item3" placeholder="Ex: SEO"></div>`;
                this.skillsRepeater.appendChild(item);
                break;
            case 'projects':
                htmlContent = `${removeButton}<div class="form-group"><label>Titre du projet</label><input type="text" data-field="title" placeholder="Ex: Refonte 'Trésors d'Afrique'"></div><div class="form-group"><label>Description</label><textarea data-field="description" rows="3" placeholder="Décrivez le projet et les résultats"></textarea></div><div class="form-group"><label>URL de l'image du projet</label><input type="url" data-field="image" placeholder="https://..."></div><div class="form-group"><label>Lien du projet (optionnel)</label><input type="url" data-field="link" placeholder="https://..."></div>`;
                this.projectsRepeater.appendChild(item);
                break;
            case 'testimonials':
                htmlContent = `${removeButton}<div class="form-group"><label>Texte du témoignage</label><textarea data-field="text" rows="4" placeholder="Ex: 'Amina a transformé notre présence...'"></textarea></div><div class="form-group"><label>Nom de l'auteur</label><input type="text" data-field="authorName" placeholder="Ex: Mariam A."></div><div class="form-group"><label>Poste de l'auteur</label><input type="text" data-field="authorTitle" placeholder="Ex: Gérante, Trésors d'Afrique"></div><div class="form-group"><label>URL de la photo de l'auteur</label><input type="url" data-field="authorPhoto" placeholder="https://..."></div>`;
                this.testimonialsRepeater.appendChild(item);
                break;
        }
        item.innerHTML = htmlContent;
        this.allInputs = this.formContainer.querySelectorAll('input, textarea');
    }
    
    handleRemoveRepeaterItem(e){
        if(e.target && e.target.classList.contains('remove-btn')){
            e.target.closest('.repeater-item')?.remove();
            this.handleFormInteraction();
        }
    }

    resetToBlankSlate() {
        this.portfolioData = this.getBlankData();
    }
    
    getBlankData() {
        return {
            nomComplet: '', titre: '', accroche: '', logo: '', photoProfil: '',
            aboutTitre: '', aboutP: '', contactIntro: '', whatsapp: '', email: '',
            facebook: '', instagram: '', linkedin: '', tiktok: '',
            titrePage: '', metaDescription: '', ogImage: '',
            skills: [], projects: [], testimonials: []
        };
    }

    getInitialData() {
        // ... (cette fonction reste identique)
        return {
            nomComplet: 'Amina Koné',
            titre: 'Stratège en Contenu Digital',
            accroche: "Je construis des ponts entre votre savoir-faire artisanal et votre public digital.",
            logo: 'https://i.postimg.cc/0yvG60sL/file-00000000848c61f8a4258e05177b8d23.png',
            photoProfil: 'https://i.postimg.cc/cCmxFWv7/ghjj.png',
            aboutTitre: "Votre histoire mérite d'être bien racontée.",
            aboutP: "Passionnée par les trésors de notre culture locale...",
            contactIntro: "Un projet, une question, une opportunité ?",
            whatsapp: '22891234567',
            email: 'contact@aminakone.com',
            facebook: '#', instagram: '#', linkedin: '#', tiktok: '#',
            titrePage: 'Portfolio | Amina Koné',
            metaDescription: "Je construis des ponts...",
            ogImage: 'https://i.postimg.cc/DZbLWMNQ/file-000000000870623092ddda64044457d7.png',
            skills: [{ title: 'Stratégie & Contenu', item1: 'Calendrier Éditorial', item2: 'Copywriting', item3: 'Gestion de Communauté' }],
            projects: [{ title: "\"Trésors d'Afrique\" - Bijoux", description: "Refonte de la page Instagram...", image: 'https://i.postimg.cc/QxNtgZT8/file-00000000cbe462309cfa73d75f72a3ed.png', link: '#' }],
            testimonials: [{ text: "Amina a transformé notre présence en ligne...", authorName: 'Jean Dupont', authorTitle: "Gérant, Trésors d'Afrique", authorPhoto: 'https://i.postimg.cc/TwBgTr0N/202fb21b3b1567ac1714898f04cc541e-1.jpg' }]
        };
    }
}
