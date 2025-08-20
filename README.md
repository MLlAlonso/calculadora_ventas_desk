# CalculApp Electron

![Electron](https://img.shields.io/badge/Electron-22.x-47848F?style=for-the-badge&logo=electron&logoColor=white)
![REST API](https://img.shields.io/badge/REST%20API-Available-009688?style=for-the-badge&logo=api)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![SASS](https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

## Descripción

CalculApp es una aplicación de escritorio construida con **Electron**, diseñada para la gestión y cotización de cursos con precios escalonados según la cantidad de licencias. Incluye un backend en **Node.js** (Express + LowDB) y un frontend moderno y responsivo.

## Características

- **Gestión de cursos**: Alta, edición y eliminación de cursos desde la interfaz de administrador.
- **Cotización dinámica**: Calcula precios automáticamente aplicando descuentos por volumen.
- **Interfaz para vendedores**: Selección de cursos, cantidad de licencias y visualización de precios finales.
- **Base de datos local**: Persistencia de datos con LowDB (JSON).
- **Diseño responsivo**: Adaptado para escritorio y dispositivos móviles.
- **Separación de roles**: Acceso de administrador protegido por contraseña.

## Estructura del proyecto

```
.
├── backend/
│   ├── database.json
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── admin.html
│   ├── admin.js
│   ├── index.html
│   ├── sales.html
│   ├── sales.js
│   ├── script.js
│   ├── style.css
│   ├── style.css.map
│   └── style.scss
├── src/
│   ├── main.js
│   └── preload.js
├── .vscode/
│   └── settings.json
├── .gitignore
├── package.json
└── README.md
```

## Instalación

1. **Clona el repositorio**  
   ```sh
   git clone https://github.com/tuusuario/calculapp-electron.git
   cd calculapp-electron
   ```

2. **Instala dependencias del proyecto principal (Electron)**
   ```sh
   npm install
   ```

3. **Instala dependencias del backend**
   ```sh
   cd backend
   npm install
   cd ..
   ```

## Uso

1. **Inicia la aplicación**
   ```sh
   npm start
   ```
   Esto lanzará la app de escritorio y levantará el backend automáticamente.

2. **Acceso**
   - **Vendedor**: Selecciona "Soy Vendedor" en la pantalla principal para cotizar cursos.
   - **Administrador**: Selecciona "Soy Administrador" e ingresa la contraseña para gestionar cursos.

## Configuración

- **Base de datos**: Los datos se almacenan en `backend/database.json`.
- **Puerto del backend**: Por defecto, el backend corre en `http://localhost:3001`.

## Scripts útiles

- `npm start` — Inicia la app Electron.
- `npm run build` — Empaqueta la aplicación para distribución (requiere configuración adicional si se desea).

## Personalización

- **Contraseña de administrador**: Modifica la constante `ADMIN_PASSWORD` en [`frontend/admin.js`](frontend/admin.js).
- **Rangos de precios**: Edita el array `priceRanges` en [`backend/database.json`](backend/database.json) o mediante la API.

📌 **Desarrollado por Mikkel Llaven Alonso**  
✉️ [mikkel_03@outlook.com](mailto:mikkel_03@outlook.com)  
💼 [LinkedIn](https://www.linkedin.com/in/mikkel-llaven-alonso-5893b4280/)