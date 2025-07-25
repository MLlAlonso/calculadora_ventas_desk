document.addEventListener('DOMContentLoaded', () => {
    const courseSelect = document.getElementById('course-select');
    const discountInput = document.getElementById('discount-input');
    const finalPriceDisplay = document.getElementById('final-price');
    const errorMessageDisplay = document.getElementById('error-message');

    const BACKEND_API_BASE_URL = 'http://localhost:3001'; 
    let courses = []; // Para almacenar los cursos obtenidos

    // Función para mostrar mensajes de error
    function showError(message) {
        errorMessageDisplay.textContent = message;
        errorMessageDisplay.style.display = 'block';
    }

    // Función para ocultar mensajes de error
    function hideError() {
        errorMessageDisplay.style.display = 'none';
    }

    // Cargar cursos
    async function fetchCourses() {
        hideError();
        courseSelect.innerHTML = '<option value="">-- Cargando cursos... --</option>'; // Muestra estado de carga
        try {
            const response = await fetch(`${BACKEND_API_BASE_URL}/api/courses`);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            courses = await response.json();

            // Limpiar y poblar el selector
            courseSelect.innerHTML = '<option value="">-- Selecciona un curso --</option>';
            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = `${course.name} - $${course.price.toFixed(2)}`;
                courseSelect.appendChild(option);
            });

            // Seleccionar el primer curso si hay (opcional)
            if (courses.length > 0) {
                courseSelect.value = courses[0].id;
                calculatePrice();
            }

        } catch (error) {
            console.error('Error al obtener cursos:', error);
            showError('No se pudieron cargar los cursos. Por favor, revisa tu conexión con el backend.');
            courseSelect.innerHTML = '<option value="">-- Error al cargar --</option>';
        }
    }

    // Calcular precio
    async function calculatePrice() {
        hideError();
        const selectedCourseId = courseSelect.value;
        const discount = parseFloat(discountInput.value) || 0;

        if (!selectedCourseId) {
            finalPriceDisplay.textContent = '$0.00';
            return;
        }

        // --- Lógica de cálculo offline / fallback (opcional pero bueno para Electron) ---
        const selectedCourse = courses.find(c => c.id === selectedCourseId);
        if (!selectedCourse) {
            finalPriceDisplay.textContent = '$0.00';
            console.warn('Curso no encontrado para cálculo offline.');
            return;
        }

        let calculatedOfflinePrice = selectedCourse.price;
        if (discount > 0) {
            calculatedOfflinePrice *= (1 - discount / 100);
        }
        finalPriceDisplay.textContent = `$${calculatedOfflinePrice.toFixed(2)}`; // Mostrar precio offline

        // Intentar llamar a la API para el cálculo exacto
        try {
            const response = await fetch(`${BACKEND_API_BASE_URL}/api/calculate-price`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quotationItems: [{ courseId: selectedCourseId, users: 1 }] }),
            });

            if (!response.ok) {
                // Si la API falla, ya estamos mostrando el cálculo offline, solo loguear la advertencia
                console.warn('API de cálculo no accesible o con error, usando cálculo offline.');
                return; 
            }

            const data = await response.json();
            finalPriceDisplay.textContent = `$${data.pvp}`; // Actualiza con el resultado del backend
        } catch (error) {
            console.error('Error al calcular el precio con la API:', error);
            // El cálculo offline ya está visible
        }
    }

    // Event Listeners
    courseSelect.addEventListener('change', calculatePrice);
    discountInput.addEventListener('input', calculatePrice); // 'input' para cambios en tiempo real

    // Cargar cursos al inicio
    fetchCourses();
});