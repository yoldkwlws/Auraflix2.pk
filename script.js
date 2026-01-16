let moviesListInternal = window.moviesList || [];
let seriesListInternal = window.seriesList || [];

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    renderHero();
    renderNewlyAdded();
    renderHomeGrids();
    setupEventListeners();
}

function renderHero() {
    const container = document.querySelector('.carousel-container');
    const featured = [...moviesListInternal, ...seriesListInternal].filter(i => i.featured).slice(0, 5);
    if (!container || featured.length === 0) return;

    container.innerHTML = featured.map((item, i) => `
        <div class="carousel-slide ${i === 0 ? 'active' : ''}">
            <img src="${item.image}">
        </div>
    `).join('');
}

function renderNewlyAdded() {
    const container = document.getElementById('newlyAddedRow');
    const all = [...moviesListInternal, ...seriesListInternal].reverse().slice(0, 15);
    if (container) container.innerHTML = all.map(item => createItemHTML(item)).join('');
}

// ESTA FUNCIÓN CREA LAS 3 FILAS DE 10
function renderHomeGrids() {
    const movieContainer = document.getElementById('homeMoviesRow');
    const seriesContainer = document.getElementById('homeSeriesRow');

    if (movieContainer) {
        const movies = [...moviesListInternal];
        shuffleArray(movies);
        renderTripleRowLogic(movieContainer, movies.slice(0, 30));
    }

    if (seriesContainer) {
        const series = [...seriesListInternal];
        shuffleArray(series);
        renderTripleRowLogic(seriesContainer, series.slice(0, 30));
    }
}

function renderTripleRowLogic(container, items) {
    container.innerHTML = '';
    // Creamos 3 contenedores horizontales dentro del vertical
    for (let i = 0; i < 3; i++) {
        const group = items.slice(i * 10, (i + 1) * 10);
        if (group.length > 0) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'sub-row-10';
            rowDiv.innerHTML = group.map(item => createItemHTML(item)).join('');
            container.appendChild(rowDiv);
        }
    }
}

function createItemHTML(item) {
    const type = item.seasons ? 'series' : 'movies';
    return `
        <div class="item" onclick="openModal('${item.id}', '${type}')">
            <img src="${item.image}" loading="lazy">
            <div class="item-title">${item.title}</div>
        </div>
    `;
}

function openModal(id, type) {
    const list = type === 'movies' ? moviesListInternal : seriesListInternal;
    const item = list.find(i => String(i.id) === String(id));
    if (!item) return;

    const modal = document.getElementById('videoModal');
    document.getElementById('modalTitle').innerText = item.title;
    document.getElementById('modalDesc').innerText = item.info;
    document.getElementById('modalContentPlayer').innerHTML = `<iframe src="${item.video}" allowfullscreen></iframe>`;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function setupEventListeners() {
    document.getElementById('closeModal').onclick = () => {
        document.getElementById('videoModal').style.display = 'none';
        document.getElementById('modalContentPlayer').innerHTML = '';
        document.body.style.overflow = 'auto';
    };

    // Navegación básica
    document.getElementById('nav-home').onclick = () => switchView('home');
    document.getElementById('nav-movies').onclick = () => switchView('movies');
    document.getElementById('nav-series').onclick = () => switchView('series');
}

function switchView(view) {
    document.getElementById('view-home').classList.add('hidden');
    document.getElementById('view-movies').classList.add('hidden');
    document.getElementById('view-series').classList.add('hidden');
    document.getElementById('view-' + view).classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById('nav-' + view).classList.add('active');
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

