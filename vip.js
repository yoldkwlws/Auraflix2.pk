// --- CONFIGURACIÓN DE ENLACES Y CÓDIGOS VIP ---
const VIP_CONFIG = {
    // 1. Enlace del video tutorial (Debe ser tipo Embed de YouTube, Vimeo, etc.)
    // Ejemplo: "https://www.youtube.com/embed/VIDEO_ID"
    tutorialVideo: "https://www.youtube.com/embed/TU_ID_DE_VIDEO", 

    // 2. Configuración por Días (3 Días)
    // El sistema revisará la fecha de hoy. Si coincide con alguna, usará ese código y enlace.
    // Formato de fecha: "YYYY-MM-DD" (Año-Mes-Dia)
    days: [
        {
            date: "2026-01-25", // FECHA DEL DÍA 1
            code: "A2008", // Código para desbloquear
            link: "https://direct-link.net/3053707/9vmp7JlZpW15" // Link al acortador o web
        },
        {
            date: "2025-10-25", // FECHA DEL DÍA 2
            code: "CODIGO_DIA_2",
            link: "ENLACE_PARA_CONSEGUIR_CODIGO_2"
        },
        {
            date: "2025-10-26", // FECHA DEL DÍA 3
            code: "CODIGO_DIA_3",
            link: "ENLACE_PARA_CONSEGUIR_CODIGO_3"
        }
    ],

    // 3. Configuración por Defecto (Fallback)
    // Se usa si la fecha de hoy NO coincide con ninguna de las fechas de arriba.
    default: {
        code: "AURA2025", 
        link: "https://google.com"
    }
};

// --- LÓGICA DEL SISTEMA (NO MODIFICAR ABAJO A MENOS QUE SEPAS JS) ---

let vipInterval;

document.addEventListener('DOMContentLoaded', () => {
    setupVipEvents();
    checkVipTimerUI(); // Verificar estado al cargar la página
});

function setupVipEvents() {
    // 1. Botón "Ser VIP" en el perfil (Abre el modal)
    const btnBecome = document.getElementById('btnBecomeVip');
    if (btnBecome) {
        btnBecome.onclick = () => {
            document.getElementById('vipModal').style.display = 'flex';
        };
    }

    // 2. Botón Cerrar Modal VIP
    const btnCloseVip = document.getElementById('closeVipModal');
    if (btnCloseVip) btnCloseVip.onclick = () => document.getElementById('vipModal').style.display = 'none';

    // 3. Botón Tutorial (Abre modal de video)
    const btnTutorial = document.getElementById('btnVipTutorial');
    if (btnTutorial) {
        btnTutorial.onclick = () => {
            const container = document.getElementById('tutorialVideoContainer');
            if (container) {
                container.innerHTML = `<iframe src="${VIP_CONFIG.tutorialVideo}" allowfullscreen frameborder="0" style="width:100%; height:100%; position:absolute; top:0; left:0;"></iframe>`;
                document.getElementById('tutorialModal').style.display = 'flex';
            }
        };
    }

    // 4. Cerrar Tutorial
    const btnCloseTutorial = document.getElementById('closeTutorialBtn');
    if (btnCloseTutorial) {
        btnCloseTutorial.onclick = () => {
            document.getElementById('tutorialModal').style.display = 'none';
            const container = document.getElementById('tutorialVideoContainer');
            if(container) container.innerHTML = ''; // Limpiar video para que deje de sonar
        };
    }

    // 5. Botón Conseguir Código (Redirige al link correspondiente)
    const btnGetCode = document.getElementById('btnGetVipCode');
    if (btnGetCode) {
        btnGetCode.onclick = () => {
            const activeData = getActiveVipData();
            if (activeData && activeData.link) {
                window.open(activeData.link, '_blank');
            } else {
                alert("Error: Enlace no configurado.");
            }
        };
    }

    // 6. Botón Activar VIP (Valida el código)
    const btnActivate = document.getElementById('activateVipBtn');
    if (btnActivate) {
        btnActivate.onclick = () => {
            const input = document.getElementById('vipCodeInput');
            const codeWritten = input.value.trim();
            const activeData = getActiveVipData();

            if (!codeWritten) {
                alert("Por favor escribe un código.");
                return;
            }

            // Normalización básica para comparar sin importar mayúsculas/minúsculas
            const inputClean = codeWritten.toLowerCase();
            const correctClean = activeData.code.toLowerCase();

            if (inputClean === correctClean) {
                activateVipMode();
                document.getElementById('vipModal').style.display = 'none';
                input.value = '';
                alert("¡Felicidades! Ahora eres VIP por 24 horas.");
            } else {
                alert("Código incorrecto. Verifica e inténtalo de nuevo.");
            }
        };
    }
}

// Determina qué configuración usar según la fecha actual
function getActiveVipData() {
    const today = new Date().toISOString().split('T')[0]; // Obtiene fecha actual YYYY-MM-DD
    const dayConfig = VIP_CONFIG.days.find(d => d.date === today);
    return dayConfig ? dayConfig : VIP_CONFIG.default;
}

// Activa el modo VIP guardando la hora de expiración
function activateVipMode() {
    const now = new Date().getTime();
    const expiry = now + (24 * 60 * 60 * 1000); // 24 horas exactas en milisegundos
    localStorage.setItem('auraflixVipExpiry', expiry);
    checkVipTimerUI();
    
    // Si estamos en la vista de perfil, recargamos la lista para actualizar UI si es necesario
    if (typeof loadUserDataInUI === 'function') {
        loadUserDataInUI();
    }
}

// Verifica si el usuario sigue siendo VIP
function isUserVip() {
    const expiry = localStorage.getItem('auraflixVipExpiry');
    if (!expiry) return false;
    
    const now = new Date().getTime();
    if (now < parseInt(expiry)) {
        return true; // Aún es válido
    } else {
        localStorage.removeItem('auraflixVipExpiry'); // Expiró
        return false;
    }
}

// Actualiza la interfaz del perfil (Botón vs Reloj vs Badge)
function checkVipTimerUI() {
    const isVip = isUserVip();
    
    const btnBecome = document.getElementById('btnBecomeVip');
    const timerContainer = document.getElementById('vipTimerContainer');
    const badge = document.getElementById('profileBadge');

    if (isVip) {
        // --- ESTADO VIP ACTIVO ---
        if (btnBecome) btnBecome.style.display = 'none'; // Ocultar botón "Ser VIP"
        if (timerContainer) timerContainer.classList.remove('hidden'); // Mostrar Reloj
        
        if (badge) {
            badge.innerText = "VIP";
            badge.classList.add('vip-active'); // Color morado/neón
        }

        startTimerInterval(); // Iniciar cuenta regresiva visual
    } else {
        // --- ESTADO NO VIP ---
        if (btnBecome) btnBecome.style.display = 'inline-block'; // Mostrar botón
        if (timerContainer) timerContainer.classList.add('hidden'); // Ocultar Reloj
        
        if (badge) {
            badge.innerText = "Miembro";
            badge.classList.remove('vip-active');
        }
        
        clearInterval(vipInterval);
    }
}

// Manejo del intervalo del reloj
function startTimerInterval() {
    clearInterval(vipInterval);
    updateTimerDisplay(); // Ejecutar una vez inmediatamente
    vipInterval = setInterval(updateTimerDisplay, 1000);
}

// Cálculo visual del tiempo restante
function updateTimerDisplay() {
    const expiry = localStorage.getItem('auraflixVipExpiry');
    if (!expiry) {
        checkVipTimerUI(); // Si se borró el storage, actualizar UI
        return;
    }

    const now = new Date().getTime();
    const distance = parseInt(expiry) - now;

    if (distance < 0) {
        checkVipTimerUI(); // Se acabó el tiempo, resetear UI
        return;
    }

    // Matemáticas para formato HH:MM:SS
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const display = document.getElementById('vipTimerDisplay');
    if (display) {
        display.innerText = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}


