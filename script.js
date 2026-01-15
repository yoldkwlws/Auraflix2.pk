// script.js - Versión Final con Selector de Temporadas Corregido

let continueWatching = JSON.parse(localStorage.getItem('continueWatching')) || [];
let featuredList = [];
let currentHeroIndex = 0;
let autoSlideInterval;
let moviesListInternal = window.moviesList || [];
let seriesListInternal = window.seriesList || [];
let touchStartX = 0;
let touchEndX = 0;
let currentView = 'home'; 

document.addEventListener('DOMContentLoaded', () => {
    window.history.replaceState({ view: 'home', modal: false }, '');
    setTimeout(() => { initApp(); }, 200);
});

function initApp() {
    renderHomeView();
    // Ordenar Recientes: El último archivo cargado sale de primero
    if (window.allContentSequence && window.allContentSequence.length > 0) {
        const strictOrderList = [...window.allContentSequence].reverse();
        renderList('newlyAddedRow', strictOrderList.slice(0, 15));
    }
    renderContinueWatching();
    setupHero();
    setupEventListeners();
    switchView('home', false);
}

// --- NAVEGACIÓN Y BLOQUEO DE SALIDA ---
window.onpopstate = function(event) {
    const modal = document.getElementById('videoModal');
    const search = document.getElementById('searchOverlay');

    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
        document.getElementById('modalContentPlayer').innerHTML = '';
        return; 
    }
    if (search.style.display === 'block') {
        search.style.display = 'none';
        return;
    }
    if (event.state && event.state.view) {
        switchView(event.state.view, false);
    }
};

function switchView(viewName, pushToHistory = true) {
    document.querySelectorAll('.full-page-view, #view-home').forEach(v => v.classList.add('hidden'));
    document.getElementById('searchOverlay').style.display = 'none';
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) targetView.classList.remove('hidden');
    
    const navBtn = document.getElementById(`nav-${viewName}`);
    if (navBtn) navBtn.classList.add('active');

    currentView = viewName;
    if (pushToHistory) window.history.pushState({ view: viewName, modal: false }, '');
}

// --- MODAL Y TEMPORADAS (CORRECCIÓN AQUÍ) ---
function openModal(id, type) {
    window.history.pushState({ view: currentView, modal: true }, '');
    
    const allData = [...moviesListInternal, ...seriesListInternal];
    const item = allData.find(i => i.id === id);
    if (!item) return;

    const modal = document.getElementById('videoModal');
    document.getElementById('modalTitle').innerText = item.title;
    document.getElementById('modalYear').innerText = item.year;
    document.getElementById('modalType').innerText = item.seasons ? 'Serie' : 'Película';
    document.getElementById('modalDesc').innerText = item.info;
    
    const episodesDiv = document.getElementById('seriesEpisodeSelector');
    const actionBtn = document.getElementById('modalActionBtn');

    if (item.seasons) {
        // ES UNA SERIE
        episodesDiv.classList.remove('hidden');
        const select = document.getElementById('modalSeasonSelect');
        
        // Llenar el selector de temporadas
        select.innerHTML = item.seasons.map(s => `<option value="${s.season}">Temporada ${s.season}</option>`).join('');
        
        // Escuchar el cambio de temporada
        select.onchange = (e) => {
            const selectedSeason = item.seasons.find(s => s.season == e.target.value);
            renderEpisodes(selectedSeason, item);
        };

        // Cargar por defecto la primera temporada del objeto
        renderEpisodes(item.seasons[0], item);

        actionBtn.innerHTML = '<i class="fas fa-film"></i> Ver Tráiler';
        actionBtn.onclick = () => setPlayerVideo(item.trailer, "Tráiler");

    } else {
        // ES UNA PELÍCULA
        episodesDiv.classList.add('hidden');
        setPlayerVideo(item.video);
        actionBtn.innerHTML = '<i class="fas fa-film"></i> Ver Tráiler';
        actionBtn.onclick = () => setPlayerVideo(item.trailer, "Tráiler");
        addToContinueWatching(item, 'movies');
    }

    renderRecommendations(item.id);
    modal.style.display = 'flex';
}

function renderEpisodes(seasonData, serieItem) {
    const container = document.getElementById('modalEpisodesContainer');
    if (!seasonData) return;

    container.innerHTML = seasonData.episodes.map(ep => `
        <button class="episode-button" data-video="${ep.video}">
            ${ep.episode}
        </button>
    `).join('');

    // Agregar eventos a los nuevos botones de capítulos
    const buttons = container.querySelectorAll('.episode-button');
    buttons.forEach(btn => {
        btn.onclick = function() {
            buttons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            setPlayerVideo(this.dataset.video, `T${seasonData.season}: Cap ${this.innerText}`);
            addToContinueWatching(serieItem, 'series');
        };
    });
}

function setPlayerVideo(url, label = null) {
    const playerDiv = document.getElementById('modalContentPlayer');
    playerDiv.innerHTML = `
        <div class="video-container">
            ${label ? `<div class="video-overlay-label">${label}</div>` : ''}
            <iframe src="${url}" allowfullscreen></iframe>
        </div>`;
}

// --- UTILIDADES ---
function renderHomeView() {
    renderList('homeMoviesRow', [...moviesListInternal].sort(() => 0.5 - Math.random()).slice(0, 9));
    renderList('homeSeriesRow', [...seriesListInternal].sort(() => 0.5 - Math.random()).slice(0, 9));
}

function renderList(containerId, list) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = list.map(item => `
        <div class="item" onclick="openModal(${item.id}, '${item.seasons ? 'series' : 'movies'}')">
            <img src="${item.image}" alt="${item.title}">
            <div class="item-title">${item.title}</div>
        </div>
    `).join('');
}

function renderRecommendations(currentId) {
    const all = [...moviesListInternal, ...seriesListInternal].filter(i => i.id !== currentId);
    renderList('modalRecommendations', all.sort(() => 0.5 - Math.random()).slice(0, 6));
}

function setupHero() {
    featuredList = [...moviesListInternal, ...seriesListInternal].filter(i => i.featured).slice(0, 5);
    const container = document.querySelector('.carousel-container');
    const dots = document.getElementById('heroDots');
    if (!container) return;

    container.innerHTML = featuredList.map((item, i) => `
        <div class="carousel-slide ${i === 0 ? 'active' : ''}" onclick="openModal(${item.id}, '${item.seasons ? 'series' : 'movies'}')">
            <img src="${item.image}">
        </div>`).join('');
    dots.innerHTML = featuredList.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}"></span>`).join('');
    startAutoSlide();
}

function startAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => {
        const slides = document.querySelectorAll('.carousel-slide');
        const dots = document.querySelectorAll('.dot');
        if (!slides.length) return;
        slides[currentHeroIndex].classList.remove('active');
        dots[currentHeroIndex].classList.remove('active');
        currentHeroIndex = (currentHeroIndex + 1) % slides.length;
        slides[currentHeroIndex].classList.add('active');
        dots[currentHeroIndex].classList.add('active');
    }, 5000);
}

function addToContinueWatching(item, type) {
    continueWatching = continueWatching.filter(i => i.id !== item.id);
    continueWatching.unshift({ ...item, type });
    localStorage.setItem('continueWatching', JSON.stringify(continueWatching.slice(0, 10)));
    renderContinueWatching();
}

function renderContinueWatching() {
    const container = document.getElementById('continueWatchingContainer');
    if (continueWatching.length > 0) {
        container.classList.remove('hidden');
        renderList('continueWatching', continueWatching);
    } else {
        container.classList.add('hidden');
    }
}

function setupEventListeners() {
    document.getElementById('closeModal').onclick = () => window.history.back();
    document.getElementById('nav-home').onclick = () => switchView('home');
    document.getElementById('nav-movies').onclick = () => switchView('movies');
    document.getElementById('nav-series').onclick = () => switchView('series');
    document.getElementById('nav-search').onclick = () => {
        document.getElementById('searchOverlay').style.display = 'block';
        document.getElementById('searchInput').focus();
    };
    document.getElementById('closeSearch').onclick = () => document.getElementById('searchOverlay').style.display = 'none';
    
    document.getElementById('searchInput').oninput = (e) => {
        const q = e.target.value.toLowerCase();
        const results = [...moviesListInternal, ...seriesListInternal].filter(i => i.title.toLowerCase().includes(q));
        renderList('searchResults', results);
    };
}
