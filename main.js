// --- Configuration & Initialization ---
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; 
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY'; 
let supabase = null;

// Global state
let currentView = 'list';
let map = null;
let markers = [];
let viewContainer, tabItems, syncBtn;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Avisomap: DOM cargado, iniciando...');
    
    // UI Elements
    viewContainer = document.getElementById('view-container');
    tabItems = document.querySelectorAll('.tab-item');
    syncBtn = document.getElementById('sync-btn');

    if (!viewContainer) {
        console.error('Error: No se encontró el contenedor principal.');
        return;
    }

    // Supabase init
    try {
        if (SUPABASE_URL !== 'YOUR_SUPABASE_URL' && window.supabase) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        }
    } catch (e) {
        console.error('Error Supabase:', e);
    }

    // Navigation setup
    if (tabItems) {
        tabItems.forEach(item => {
            item.addEventListener('click', () => {
                switchView(item.dataset.view);
            });
        });
    }

    // Start with List View
    switchView('list');
    console.log('Avisomap: Vista inicial cargada.');
});

// --- Navigation ---
function switchView(view) {
    currentView = view;
    renderView(view);
    
    tabItems.forEach(item => {
        if (item.dataset.view === view) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function renderView(view) {
    switch (view) {
        case 'list':
            renderListView();
            break;
        case 'form':
            renderFormView();
            break;
        case 'map':
            renderMapView();
            break;
    }
}

// --- List View ---
function renderListView() {
    viewContainer.innerHTML = `
        <div class="view-header">
            <h2>Mis Avisos</h2>
            <p class="subtitle">Organizados por fecha</p>
        </div>
        <div id="avisos-list" class="list-container">
            <div class="loading-screen">
                <div class="spinner"></div>
                <p>Cargando lista...</p>
            </div>
        </div>
    `;
    
    // Fetch and display items
    loadAvisos();
}

function loadAvisos() {
    const listEl = document.getElementById('avisos-list');
    
    // Mockup data for design preview
    const mockupData = [
        {
            direccion: 'Calle Uria 12, Oviedo',
            localidad: 'Oviedo',
            plaga: 'Cucarachas',
            fecha_hora: '2026-03-30T10:00:00',
            tipo_contacto: 'Presencial',
            notas: 'Tratamiento en portales y sótanos.'
        },
        {
            direccion: 'Avenida de Galicia 45, Gijón',
            localidad: 'Gijón',
            plaga: 'Ratones',
            fecha_hora: '2026-03-29T16:30:00',
            tipo_contacto: 'Teléfono',
            notas: 'Pide presupuesto para garaje.'
        },
        {
            direccion: 'Calle Real 5, Avilés',
            localidad: 'Avilés',
            plaga: 'Hormigas',
            fecha_hora: '2026-02-15T11:00:00',
            tipo_contacto: 'Presencial',
            notas: 'Plaga recurrente en cocina.'
        }
    ];

    // Grouping logic
    const groups = {};
    mockupData.forEach(aviso => {
        const date = new Date(aviso.fecha_hora);
        const year = date.getFullYear();
        const month = date.toLocaleString('es-ES', { month: 'long' });
        const key = `${month} ${year}`;
        
        if (!groups[key]) groups[key] = [];
        groups[key].push(aviso);
    });

    listEl.innerHTML = Object.keys(groups).map(groupKey => `
        <div class="month-group">
            <h4 class="group-title">${groupKey}</h4>
            ${groups[groupKey].map(aviso => `
                <div class="card aviso-card animate-in">
                    <div class="card-header">
                        <div class="pest-icon ${aviso.plaga.toLowerCase()}">
                            ${getPestIcon(aviso.plaga)}
                        </div>
                        <div class="card-title">
                            <h3>${aviso.direccion}</h3>
                            <span class="badge locality">${aviso.localidad}</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="info-row">
                            <i class="far fa-calendar"></i>
                            <span>${formatDate(aviso.fecha_hora)}</span>
                        </div>
                        <div class="info-row">
                            <i class="fas fa-phone-alt"></i>
                            <span>${aviso.tipo_contacto}</span>
                        </div>
                        <p class="card-notes">${aviso.notas}</p>
                    </div>
                    <div class="card-footer">
                        <button class="btn-detail" onclick="showOnMap('${aviso.direccion}')">
                            <i class="fas fa-map-location-dot"></i> Ver en Mapa
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');
}

window.showOnMap = (direccion) => {
    switchView('map');
    // In a real app, we would geocode the address and fly to it
    alert('Buscando: ' + direccion);
};

// --- Form View ---
function renderFormView() {
    viewContainer.innerHTML = `
        <div class="view-header">
            <h2>Nuevo Aviso</h2>
            <p class="subtitle">Completa los datos del trabajo</p>
        </div>
        <form id="aviso-form" class="form-container animate-in">
            <div class="form-group">
                <label>Dirección Exacta</label>
                <div class="input-with-icon">
                    <i class="fas fa-location-dot"></i>
                    <input type="text" id="direccion" class="form-input" placeholder="Ej: Calle Real 5, Oviedo" required>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Localidad</label>
                    <input type="text" id="localidad" class="form-input" placeholder="Oviedo, Gijón..." required>
                </div>
                <div class="form-group">
                    <label>Hora</label>
                    <input type="time" id="hora" class="form-input" required>
                </div>
            </div>

            <div class="form-group">
                <label>Tipo de Plaga</label>
                <select id="plaga" class="form-input" required>
                    <option value="Ratones">Ratones</option>
                    <option value="Ratas">Ratas</option>
                    <option value="Cucarachas">Cucarachas</option>
                    <option value="Pulgas">Pulgas</option>
                    <option value="Hormigas">Hormigas</option>
                    <option value="Otras">Otras plagas urbanas</option>
                </select>
            </div>

            <div class="form-group">
                <label>Forma de Aviso</label>
                <div class="toggle-group">
                    <input type="radio" name="contacto" value="Presencial" id="presencial" checked>
                    <label for="presencial">Presencial</label>
                    <input type="radio" name="contacto" value="Teléfono" id="telefono">
                    <label for="telefono">Teléfono</label>
                </div>
            </div>

            <div class="form-group">
                <label>Notas</label>
                <textarea id="notas" class="form-input" rows="4" placeholder="Escribe aquí cualquier detalle..."></textarea>
            </div>

            <div class="form-group">
                <label>Adjuntar Foto / Albarán (Opcional)</label>
                <div class="file-upload">
                    <i class="fas fa-paperclip"></i>
                    <span>Toca para subir un archivo</span>
                    <input type="file" id="archivo" accept="image/*,.pdf">
                </div>
            </div>

            <button type="submit" class="btn-primary">Guardar Aviso</button>
        </form>
    `;

    document.getElementById('aviso-form').addEventListener('submit', handleFormSubmit);
}

// --- Map View ---
function renderMapView() {
    viewContainer.innerHTML = `
        <div id="map-container">
            <div id="map"></div>
        </div>
    `;
    
    setTimeout(() => {
        initMap();
    }, 100);
}

function initMap() {
    if (map) map.remove();
    
    // Default center (e.g. Oviedo)
    map = L.map('map').setView([43.3603, -5.8448], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);
}

// --- Helpers ---
function getPestIcon(plaga) {
    const icons = {
        'Ratones': '<i class="fas fa-mouse"></i>',
        'Ratas': '<i class="fas fa-rat"></i>',
        'Cucarachas': '<i class="fas fa-bug"></i>',
        'Pulgas': '<i class="fas fa-virus"></i>',
        'Hormigas': '<i class="fas fa-ant"></i>',
        'Otras': '<i class="fas fa-warning"></i>'
    };
    return icons[plaga] || '<i class="fas fa-circle-info"></i>';
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    alert('¡Aviso guardado correctamente! (Mockup)');
    switchView('list');
}

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW registrado'))
            .catch(err => console.log('SW error', err));
    });
}
