// Cargar el archivo JSON con la información de materiales
fetch('./js/material.json')
    .then(response => response.json())
    .then(data => {
        // Guarda estos datos en una variable global para acceder a ellos posteriormente
        window.materialesJSON = data;
    })

 //Abre la ventana emergente (modal)
function abrirVentana(tipoMaterial) {
    const materiales = obtenerMateriales(tipoMaterial);

    const modal = document.getElementById('myModal');
    const modalContent = document.getElementById('material_modal-content');

    // Construye el contenido del modal
    const contenidoModal = `
        <h2 class="nombre-material">${tipoMaterial}</h2><br>
        <ul>
            ${materiales.map(material => `<li>${material}</li>`).join('')}
        </ul>
    `;
    modalContent.innerHTML = contenidoModal;
    modal.style.display = 'block';
}

function obtenerMateriales(tipoMaterial) {
    // Accede a la variable global que contiene los datos del archivo JSON
    const materialesPorTipo = window.materialesJSON;

    return materialesPorTipo[tipoMaterial] || [];
}

// Función para cerrar el modal
function cerrarModal() {
    const modal = document.getElementById('myModal');
    modal.style.display = 'none';
}
