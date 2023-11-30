// marcador verde
var greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// Marcador rojo
var redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });

// Punto y zoom donde se visualiza el mapa
let map = L.map('map', {
    center: [21.9800, -102.2966],
    zoom: 9.5,
    minZoom: 9,  // Establece el zoom mínimo permitido
    maxZoom: 18   // Establece el zoom máximo permitido
});


// imagen que se usa del mapa
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let data; // Declarar la variable data en el ámbito global

// Arreglo para almacenar todos los marcadores
let allMarkers = [];

// Función para agregar marcadores
function addMarker(lat, lng, popupText, fechaVencida, autorizado) {
    let icon = autorizado ? (fechaVencida ? redIcon : greenIcon) : redIcon;
    let marker = L.marker([lat, lng], { icon: icon });
    marker.bindPopup(popupText);
    allMarkers.push(marker);
    return marker; // Devuelve el marcador para poder agregarlo al mapa después
}


// Función para verificar si una fecha está en el pasado
function esFechaPasada(fecha) {
    const fechaActual = new Date();
    const partes = fecha.split('/'); // Dividir la fecha en día, mes y año
    const dia = parseInt(partes[0]);
    const mes = parseInt(partes[1]) - 1; // Restar 1 al mes para que sea compatible con el objeto Date (los meses empiezan en 0)
    const año = parseInt(partes[2]);

    const fechaVencimiento = new Date(año, mes, dia);

    // Compara las fechas
    return fechaActual > fechaVencimiento;
}

// Función para generar el contenido del marcador
function generarContenidoMarcador(markerInfo, fechaVencida) {
    const estadoCentro = fechaVencida ? 'Centro no autorizado' : 'Centro autorizado';

    return `
        <div class="marcador_nombre-centro">
            <b>${markerInfo['Nombre del proyecto o establecimiento']}</b>
        </div>
        <br>
        <b>Dirección:</b> ${markerInfo['Dirección']}<br>
        <b>Municipio:</b> ${markerInfo['Municipio']}<br>
        <b>Materiales:</b> ${markerInfo['Material']}<br>
        <b>Estado:</b> ${estadoCentro}<br> <!-- Agrega esta línea para mostrar el estado del centro -->
        <div class="container-button">
            <button class="button" onclick="abrirModal(
            '${markerInfo['Nombre del proyecto o establecimiento']}', 
            '${markerInfo['Dirección']}', '${markerInfo['Latitud']}', 
            '${markerInfo['Longitud']}', 
            '${markerInfo['Material específico']}')">Más información</button>
        </div>
    `;
}



// Función para abrir el modal y mostrar la información
function abrirModal(nombre, direccion, latitud, longitud, materialEspecifico) {
    const modal = document.getElementById('myModal');
    const modalContent = document.getElementById('modal-content');
    
    // Construye el contenido del modal
    const contenidoModal = `
        <br><h2 class="nombre-centro">${nombre}</h2><br>
      <p><b>Dirección:</b> ${direccion}</p><br>
      <p><b>Coordenadas:</b> Latitud: ${latitud}, Longitud: ${longitud}</p><br>
      <p><b>Material:</b> ${materialEspecifico}</p><br>
    `;
    modalContent.innerHTML = contenidoModal;
    modal.style.display = 'block';
  }
  
  // Función para cerrar el modal
  function cerrarModal() {
    const modal = document.getElementById('myModal');
    modal.style.display = 'none';
  }

// Cargar datos desde un archivo JSON
fetch('./js/datos.json')
    .then(response => response.json())
    .then(jsonData => {
        data = jsonData;
        // Procesar los datos y crear marcadores en base a la información cargada
        data.forEach(markerInfo => {
            let lat = parseFloat(markerInfo.Latitud);
            let lng = parseFloat(markerInfo.Longitud);
            let fechaVencida = esFechaPasada(markerInfo['Vencimiento ']);
            let autorizado = !fechaVencida;
            let texto = generarContenidoMarcador(markerInfo, fechaVencida);
            
            // Agrega los marcadores al mapa al inicio
            addMarker(lat, lng, texto, fechaVencida, autorizado).addTo(map);
        });
    });



// Evento para filtrar al cambiar el selector de municipio o material
document.getElementById('selector-municipio').addEventListener('change', actualizarFiltros);
document.getElementById('selector-material').addEventListener('change', actualizarFiltros);

// Función para actualizar los filtros
function actualizarFiltros() {
    let municipioSeleccionado = document.getElementById('selector-municipio').value;
    let materialSeleccionado = document.getElementById('selector-material').value;

    // Limpia todos los marcadores existentes en el mapa
    allMarkers.forEach(marker => {
        map.removeLayer(marker);
    });

    // Verificar si 'data' está definida antes de usarla
    if (data) {
        // Filtra y muestra los marcadores que cumplen con los criterios de municipio, material y fecha de vencimiento
        data.forEach(markerInfo => {
            let autorizado = !esFechaPasada(markerInfo['Vencimiento ']);
            let fechaVencida = !autorizado;
            
            if ((municipioSeleccionado === "-1" || markerInfo.Municipio === municipioSeleccionado) &&
                (materialSeleccionado === "-1" || markerInfo.Material.includes(materialSeleccionado))) {
                let lat = parseFloat(markerInfo.Latitud);
                let lng = parseFloat(markerInfo.Longitud);
                let texto = generarContenidoMarcador(markerInfo, fechaVencida);
                
                // Agrega los marcadores al mapa
                addMarker(lat, lng, texto, fechaVencida, autorizado).addTo(map);
            }
        });
    }
}



// Llamar a la función para mostrar todos los marcadores al inicio
actualizarFiltros();

// Agregar el evento de entrada de texto en el campo de búsqueda
document.getElementById('input-busqueda').addEventListener('input', actualizarBusqueda);

// Función para filtrar los marcadores según el campo de búsqueda
function actualizarBusqueda() {
    const textoBusqueda = document.getElementById('input-busqueda').value.toLowerCase();

    // Limpia todos los marcadores existentes en el mapa
    allMarkers.forEach(marker => {
        map.removeLayer(marker);
    });

    // Verificar si 'data' está definida antes de usarla
    if (data) {
        // Filtra y muestra los marcadores que contienen el texto de búsqueda en "Nombre del proyecto o establecimiento" o "Material específico"
        data.forEach(markerInfo => {
            const autorizado = !esFechaPasada(markerInfo['Vencimiento ']);
            const lat = parseFloat(markerInfo.Latitud);
            const lng = parseFloat(markerInfo.Longitud);
            const fechaVencida = !autorizado;
            const texto = generarContenidoMarcador(markerInfo, fechaVencida);

            // Verifica si el texto de búsqueda está en el nombre o material
            if (markerInfo['Nombre del proyecto o establecimiento'].toLowerCase().includes(textoBusqueda) ||
                markerInfo['Material específico'].toLowerCase().includes(textoBusqueda)) {
                let icon = autorizado ? (fechaVencida ? redIcon : greenIcon) : redIcon;
                addMarker(lat, lng, texto, fechaVencida, autorizado, icon).addTo(map);
            }
        });
    }
}
