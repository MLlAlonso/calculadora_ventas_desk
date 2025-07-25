document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const adminSection = document.getElementById('admin-section');
    const passwordInput = document.getElementById('password-input');
    const loginButton = document.getElementById('login-button');
    const authErrorMessage = document.getElementById('auth-error-message');
    const courseNameInput = document.getElementById('course-name-input');
    const coursePriceInput = document.getElementById('course-price-input');
    const addUpdateButton = document.getElementById('add-update-button');
    const cancelEditButton = document.getElementById('cancel-edit-button');
    const formTitle = document.getElementById('form-title');
    const adminErrorMessage = document.getElementById('admin-error-message');
    const coursesTableBody = document.getElementById('courses-table-body');
    const coursesTable = document.getElementById('courses-table');
    const coursesCountSpan = document.getElementById('courses-count');
    const noCoursesMessage = document.getElementById('no-courses-message');

    const backToIndexButtonAdmin = document.createElement('button');
    backToIndexButtonAdmin.textContent = 'Volver al Inicio';
    backToIndexButtonAdmin.className = 'btn-secondary'; 
    backToIndexButtonAdmin.style.marginTop = '20px';
    backToIndexButtonAdmin.onclick = () => window.location.href = 'index.html';
    adminSection.appendChild(backToIndexButtonAdmin);


    const BACKEND_API_BASE_URL = 'http://localhost:3001';
    const ADMIN_PASSWORD = 'hub2025';

    let editingCourseId = null; 
    let allCourses = []; // Para almacenar todos los cursos y poder buscar por ID al editar


    function showAdminError(message) {
        adminErrorMessage.textContent = message;
        adminErrorMessage.style.display = 'block';
    }

    function hideAdminError() {
        adminErrorMessage.textContent = '';
        adminErrorMessage.style.display = 'none';
    }

    function showAuthError(message) {
        authErrorMessage.textContent = message;
        authErrorMessage.style.display = 'block';
    }

    function hideAuthError() {
        authErrorMessage.textContent = '';
        authErrorMessage.style.display = 'none';
    }

    // --- Autenticación ---
    const handleLogin = () => {
        if (passwordInput.value === ADMIN_PASSWORD) {
            loginSection.style.display = 'none';
            adminSection.style.display = 'block';
            hideAuthError();
            fetchCourses(); 
        } else {
            showAuthError('Contraseña incorrecta. Inténtalo de nuevo.');
            passwordInput.value = '';
        }
    };

    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
    loginButton.addEventListener('click', handleLogin);

    // --- CRUD de Cursos ---
    async function fetchCourses() {
        hideAdminError();
        try {
            const response = await fetch(`${BACKEND_API_BASE_URL}/api/courses`);
            if (!response.ok) {
                throw new Error('Error al obtener la lista de cursos.');
            }
            allCourses = await response.json(); // Almacenar todos los cursos
            renderCoursesTable(allCourses);
        } catch (err) {
            showAdminError(err.message);
        }
    }

    function renderCoursesTable(coursesList) {
        coursesTableBody.innerHTML = ''; 
        coursesCountSpan.textContent = coursesList.length;

        if (coursesList.length === 0) {
            noCoursesMessage.style.display = 'block';
            coursesTable.style.display = 'none';
        } else {
            noCoursesMessage.style.display = 'none';
            coursesTable.style.display = 'table';
            coursesList.forEach(course => {
                const row = coursesTableBody.insertRow();
                row.innerHTML = `
                    <td>${course.id}</td>
                    <td>${course.name}</td>
                    <td>$${course.price.toFixed(2)}</td>
                    <td style="text-align: center;">
                        <button class="btn-warning edit-btn" data-id="${course.id}" style="margin-right: 5px;">Editar</button>
                        <button class="btn-danger delete-btn" data-id="${course.id}">Eliminar</button>
                    </td>
                `;
            });

            // --- ESTO ES CRUCIAL: ADJUNTAR LISTENERS DESPUÉS DE QUE LOS BOTONES EXISTAN ---
            coursesTableBody.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = String(e.target.dataset.id);
                    console.log('Clic en Editar para ID:', id);
                    const courseToEdit = allCourses.find(c => String(c.id) === id);
                    if (courseToEdit) {
                        handleEditClick(courseToEdit);
                    } else {
                        console.error('Curso no encontrado para edición:', id);
                    }
                });
            });

            coursesTableBody.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    console.log('Clic en Eliminar para ID:', id);
                    handleDeleteCourse(id);
                });
            });
        }
    }
   
    const handleAddOrUpdateCourse = async () => {
        hideAdminError();
        const name = courseNameInput.value.trim();
        const price = parseFloat(coursePriceInput.value);

        if (!name || isNaN(price)) {
            showAdminError('Por favor, ingresa un nombre y un precio válido (numérico) para el curso.');
            return;
        }

        try {
            const method = editingCourseId ? 'PUT' : 'POST';
            const url = editingCourseId
                ? `${BACKEND_API_BASE_URL}/api/courses/${editingCourseId}`
                : `${BACKEND_API_BASE_URL}/api/courses`;

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, price }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error al ${editingCourseId ? 'actualizar' : 'añadir'} el curso.`);
            }

            // Limpiar formulario y resetear estado de edición
            resetForm();
            fetchCourses(); 
        } catch (err) {
            showAdminError(err.message);
        }
    };

    addUpdateButton.addEventListener('click', handleAddOrUpdateCourse);

    const handleEditClick = (course) => {
        editingCourseId = course.id; 
        courseNameInput.value = course.name;
        coursePriceInput.value = course.price.toString();
        formTitle.textContent = 'Editar Curso';
        addUpdateButton.className = 'btn-warning'; 
        addUpdateButton.textContent = 'Actualizar Curso';
        cancelEditButton.style.display = 'inline-block';
        courseNameInput.focus();
    };

    const resetForm = () => {
        editingCourseId = null;
        courseNameInput.value = '';
        coursePriceInput.value = '';
        formTitle.textContent = 'Añadir Nuevo Curso';
        addUpdateButton.className = 'btn-success';
        addUpdateButton.textContent = 'Guardar Curso';
        cancelEditButton.style.display = 'none';
        hideAdminError(); 
    };

    cancelEditButton.addEventListener('click', resetForm);

    const handleDeleteCourse = async (id) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este curso? Esta acción es irreversible.')) {
            return;
        }

        hideAdminError();
        try {
            const response = await fetch(`${BACKEND_API_BASE_URL}/api/courses/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar el curso.');
            }

            fetchCourses(); 
        } catch (err) {
            showAdminError(err.message);
        }
    };
});