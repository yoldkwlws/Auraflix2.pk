// CONFIGURACIÓN DE NOVEDADES
// Instrucciones:
// Reemplaza 'X1' con el ID de la película o serie.
// Reemplaza 'X2' con 'season' (para Nueva Temporada) o 'episode' (para Nuevo Episodio).

const NEW_CONTENT_CONFIG = [
    { id: 's12', type: 'episode' },
    { id: 's19', type: 'season' },
    //{ id: 'X1', type: 'X2' },
   // { id: 'X1', type: 'X2' },
    //{ id: 'X1', type: 'X2' },
   // { id: 'X1', type: 'X2' },
  //  { id: 'X1', type: 'X2' },
   // { id: 'X1', type: 'X2' },
  //  { id: 'X1', type: 'X2' },
  //  { id: 'X1', type: 'X2' }
];

// Lógica para inyectar las etiquetas
(function() {
    function applyNewBadges() {
        if (!NEW_CONTENT_CONFIG || NEW_CONTENT_CONFIG.length === 0) return;

        NEW_CONTENT_CONFIG.forEach(config => {
            // Ignorar los placeholders X1 si no se han editado
            if (config.id === 'X1') return;

            // Buscamos elementos que tengan el onclick con ese ID
            const selector = `.item[onclick*="'${config.id}'"]`;
            const items = document.querySelectorAll(selector);

            items.forEach(item => {
                // Verificar si ya tiene el badge para no repetir
                if (!item.querySelector('.new-content-badge')) {
                    const badge = document.createElement('div');
                    badge.className = 'new-content-badge';
                    
                    // Definir texto según tipo
                    let labelText = '';
                    if (config.type === 'season') labelText = 'Nueva Temporada';
                    else if (config.type === 'episode') labelText = 'Nuevo Episodio';
                    else labelText = 'Nuevo'; // Fallback

                    badge.innerText = labelText;
                    item.appendChild(badge);
                }
            });
        });
    }

    // Ejecutar al cargar
    window.addEventListener('load', () => {
        setTimeout(applyNewBadges, 500); 
    });

    // Observador para cambios dinámicos (scroll infinito, filtros, etc.)
    const observer = new MutationObserver((mutations) => {
        applyNewBadges();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();