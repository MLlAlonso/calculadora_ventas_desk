document.addEventListener('DOMContentLoaded', () => {
    const courseSelect = document.getElementById('course-select');
    const addCourseButton = document.getElementById('add-course-to-table');
    const selectedCoursesTableBody = document.getElementById('selected-courses-table-body');
    const totalLicensesGlobalDisplay = document.getElementById('total-licenses-global');
    const totalSubtotalGlobalDisplay = document.getElementById('total-subtotal-global');
    const discountAppliedGlobalDisplay = document.getElementById('discount-applied-global');
    const pvpDisplay = document.getElementById('pvp-display');
    const unitPriceGlobalDisplay = document.getElementById('unit-price-global');
    const errorMessageDisplay = document.getElementById('error-message');
    const backToIndexButton = document.getElementById('back-to-index-button');

    const BACKEND_API_BASE_URL = 'http://localhost:3001';

    let allAvailableCourses = []; // Cursos disponibles del backend
    let currentSelectedCourses = []; // Cursos actualmente en la tabla del presupuesto

    function showError(message) {
        errorMessageDisplay.textContent = message;
        errorMessageDisplay.style.display = 'block';
    }

    function hideError() {
        errorMessageDisplay.textContent = '';
        errorMessageDisplay.style.display = 'none';
    }

    // Cargar cursos desde el backend
    async function fetchCourses() {
        hideError();
        courseSelect.innerHTML = '<option value="">-- Cargando cursos... --</option>';
        try {
            const response = await fetch(`${BACKEND_API_BASE_URL}/api/courses`);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            allAvailableCourses = await response.json();
            
            courseSelect.innerHTML = '<option value="">-- Selecciona un curso --</option>';
            allAvailableCourses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = `${course.name} - $${course.price.toFixed(2)}`;
                courseSelect.appendChild(option);
            });
            renderSelectedCoursesTable(); // Renderizar la tabla inicial (vacía o con cursos existentes si hubiere)
            calculateGlobalPrice(); // Calcular al cargar
        } catch (error) {
            console.error('Error al obtener cursos:', error);
            showError('No se pudieron cargar los cursos. Por favor, revisa tu conexión con el backend.');
            courseSelect.innerHTML = '<option value="">-- Error al cargar --</option>';
        }
    }

    // Renderizar la tabla de cursos seleccionados
    function renderSelectedCoursesTable() {
        selectedCoursesTableBody.innerHTML = ''; // Limpiar tabla

        if (currentSelectedCourses.length === 0) {
            selectedCoursesTableBody.innerHTML = '<tr><td colspan="5">No hay cursos seleccionados.</td></tr>';
        } else {
            currentSelectedCourses.forEach(item => {
                const row = selectedCoursesTableBody.insertRow();
                const subtotalItem = item.course.price * item.licenses;
                row.innerHTML = `
                    <td>${item.course.name}</td>
                    <td><input type="number" class="licenses-input-item" data-id="${item.course.id}" value="${item.licenses}" min="1"></td>
                    <td>$${item.course.price.toFixed(2)}</td>
                    <td>$${subtotalItem.toFixed(2)}</td>
                    <td><button class="btn-danger remove-item-btn" data-id="${item.course.id}">X</button></td>
                `;
            });

            // Adjuntar event listeners para cambios en licencias y eliminar
            selectedCoursesTableBody.querySelectorAll('.licenses-input-item').forEach(input => {
                input.addEventListener('input', updateLicensesInTable);
            });
            selectedCoursesTableBody.querySelectorAll('.remove-item-btn').forEach(button => {
                button.addEventListener('click', removeItemFromTable);
            });
        }
        calculateGlobalPrice();
    }

    // Añadir curso a la tabla de seleccionados
    addCourseButton.addEventListener('click', () => {
        hideError();
        const selectedCourseId = courseSelect.value;
        if (!selectedCourseId) {
            showError('Por favor, selecciona un curso para añadir.');
            return;
        }

        const courseToAdd = allAvailableCourses.find(c => String(c.id) === selectedCourseId);
        if (!courseToAdd) {
            showError('Curso no encontrado en la lista disponible.');
            return;
        }

        // Verificar si el curso ya está en la tabla
        const existingItem = currentSelectedCourses.find(item => String(item.course.id) === String(courseToAdd.id));
        if (existingItem) {
            showError('Este curso ya ha sido añadido a la lista.');
            return;
        }

        currentSelectedCourses.push({ course: courseToAdd, licenses: 1 });
        renderSelectedCoursesTable();
        courseSelect.value = "";
    });

    // Actualizar licencias de un curso en la tabla
    function updateLicensesInTable(event) {
        hideError();
        const courseId = event.target.dataset.id;
        const newLicenses = parseInt(event.target.value);

        if (isNaN(newLicenses) || newLicenses <= 0) {
            showError('La cantidad de licencias debe ser un número positivo.');
            event.target.value = 1;
            const itemToUpdate = currentSelectedCourses.find(item => String(item.course.id) === String(courseId));
            if (itemToUpdate) itemToUpdate.licenses = 1;

        } else {
            const itemToUpdate = currentSelectedCourses.find(item => String(item.course.id) === String(courseId));
            if (itemToUpdate) {
                itemToUpdate.licenses = newLicenses;
            }
        }
        renderSelectedCoursesTable();
    }

    // Eliminar curso de la tabla
    function removeItemFromTable(event) {
        hideError();
        const courseIdToRemove = event.target.dataset.id;
        currentSelectedCourses = currentSelectedCourses.filter(item => String(item.course.id) !== String(courseIdToRemove));
        renderSelectedCoursesTable();
    }

    // Función principal para calcular el precio global
    function calculateGlobalPrice() {
        let totalLicenciasGlobal = 0;
        let totalSubtotalGlobal = 0;

        currentSelectedCourses.forEach(item => {
            totalLicenciasGlobal += item.licenses;
            totalSubtotalGlobal += item.course.price * item.licenses;
        });

        totalLicensesGlobalDisplay.textContent = totalLicenciasGlobal;
        totalSubtotalGlobalDisplay.textContent = `$${totalSubtotalGlobal.toFixed(2)}`;

        // Si no hay licencias o cursos seleccionados, resetear y salir
        if (totalLicenciasGlobal === 0) {
            discountAppliedGlobalDisplay.textContent = '0.00%';
            pvpDisplay.textContent = '$0.00';
            unitPriceGlobalDisplay.textContent = '$0.00';
            return;
        }

        // Calcular descuento según la fórmula provista
        // =SI(licencias<=0,0,SI(licencias>=10000,0.6,MIN(LOG10(licencias)*0.075,0.6)))
        let discountRate = 0;
        if (totalLicenciasGlobal <= 0) {
            discountRate = 0;
        } else if (totalLicenciasGlobal >= 10000) {
            discountRate = 0.6; // 60%
        } else {
            discountRate = Math.min(Math.log10(totalLicenciasGlobal) * 0.075, 0.6);
        }
        discountAppliedGlobalDisplay.textContent = `${(discountRate * 100).toFixed(2)}%`;

        // Calcular Precio de Venta al Público (PVP)
        const pvp = totalSubtotalGlobal * (1 - discountRate);
        pvpDisplay.textContent = `$${pvp.toFixed(2)}`;

        // Calcular Precio Unitario por Licencia Global
        const precioUnitarioGlobal = totalLicenciasGlobal > 0 ? pvp / totalLicenciasGlobal : 0;
        unitPriceGlobalDisplay.textContent = `$${precioUnitarioGlobal.toFixed(2)}`;
    }

    // Event listener para el botón de volver al índice
    backToIndexButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Cargar cursos al inicio
    fetchCourses();
});