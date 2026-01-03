<template>
  <div class="home-view">
   
    <section class="hero-section">
      <div class="container">
        <div class="row align-items-center min-vh-70">
          <div class="col-lg-6">
            <h1 class="display-4 fw-bold mb-4">
              Gérez vos projets efficacement avec
              <span class="gradient-text">Kanban Manager</span>
            </h1>
            <p class="lead mb-5 text-muted">
              Une application simple et intuitive pour organiser vos tâches, 
              suivre votre progression et booster votre productivité.
            </p>
            <div class="d-flex gap-3">
              <router-link 
                v-if="!authStore.user"
                to="/auth"
                class="btn btn-primary btn-lg px-4"
              >
                <i class="bi bi-rocket-takeoff me-2"></i>
                Commencer gratuitement
              </router-link>
              <router-link 
                v-else
                to="/dashboard"
                class="btn btn-primary btn-lg px-4"
              >
                <i class="bi bi-speedometer2 me-2"></i>
                Aller au tableau de bord
              </router-link>
              <a href="#features" class="btn btn-outline-primary btn-lg px-4">
                <i class="bi bi-info-circle me-2"></i>
                En savoir plus
              </a>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="hero-image">
              <img 
                src="https://cdn.pixabay.com/photo/2021/08/04/13/06/software-developer-6521720_1280.jpg" 
                alt="Kanban Dashboard"
                class="img-fluid rounded-3 shadow-lg"
              >
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="features" class="features-section py-5 bg-light">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="fw-bold">Fonctionnalités principales</h2>
          <p class="text-muted">Tout ce dont vous avez besoin pour gérer vos projets</p>
        </div>
        
        <div class="row g-4">
          <div class="col-md-4">
            <div class="feature-card text-center p-4 h-100">
              <div class="feature-icon mb-3">
                <i class="bi bi-kanban fs-1 text-primary"></i>
              </div>
              <h4 class="fw-bold">Tableau Kanban</h4>
              <p class="text-muted">
                Organisez vos tâches en colonnes (À faire, En cours, Terminé) 
                pour une vue claire de votre progression.
              </p>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="feature-card text-center p-4 h-100">
              <div class="feature-icon mb-3">
                <i class="bi bi-cloud-arrow-up fs-1 text-primary"></i>
              </div>
              <h4 class="fw-bold">Synchronisation temps réel</h4>
              <p class="text-muted">
                Tous vos changements sont synchronisés instantanément 
                sur tous vos appareils grâce à Firebase.
              </p>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="feature-card text-center p-4 h-100">
              <div class="feature-icon mb-3">
                <i class="bi bi-shield-lock fs-1 text-primary"></i>
              </div>
              <h4 class="fw-bold">Sécurité garantie</h4>
              <p class="text-muted">
                Authentification sécurisée avec email/password ou Google. 
                Vos données sont protégées et privées.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

   
    <section class="how-it-works py-5">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="fw-bold">Comment ça marche ?</h2>
          <p class="text-muted">3 étapes simples pour commencer</p>
        </div>
        
        <div class="row g-4">
          <div class="col-md-4">
            <div class="step-card text-center p-4">
              <div class="step-number">1</div>
              <h4 class="fw-bold mt-3">Créez un compte</h4>
              <p class="text-muted">
                Inscrivez-vous gratuitement avec votre email ou votre compte Google.
              </p>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="step-card text-center p-4">
              <div class="step-number">2</div>
              <h4 class="fw-bold mt-3">Ajoutez vos projets</h4>
              <p class="text-muted">
                Créez vos projets avec un nom, une description et une couleur distinctive.
              </p>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="step-card text-center p-4">
              <div class="step-number">3</div>
              <h4 class="fw-bold mt-3">Organisez vos tâches</h4>
              <p class="text-muted">
                Ajoutez des tâches et déplacez-les entre les colonnes pour suivre votre avancement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

  
    <section class="cta-section py-5 bg-primary text-white">
      <div class="container text-center">
        <h2 class="fw-bold mb-4">Prêt à booster votre productivité ?</h2>
        <p class="lead mb-5">
          Rejoignez des milliers d'utilisateurs qui organisent déjà leurs projets avec Kanban Manager.
        </p>
        <router-link 
          to="/auth"
          class="btn btn-light btn-lg px-5"
        >
          <i class="bi bi-rocket-takeoff me-2"></i>
          Commencer maintenant
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import '@/assets/css/HomeView.css'
const authStore = useAuthStore()
</script>

