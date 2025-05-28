
# 🚀 DevTrack Lite: Tu Asistente Inteligente para Tickets de Soporte チケット 🎫

[![Next.js](https://img.shields.io/badge/Next.js-15.x-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.x-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ShadCN UI](https://img.shields.io/badge/ShadCN_UI-Jazmín-black?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![Genkit](https://img.shields.io/badge/Genkit_AI-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/docs/genkit)

**DevTrack Lite** es una aplicación web moderna y ágil, diseñada para simplificar la gestión de tickets de soporte y el seguimiento del tiempo. Potenciada con Inteligencia Artificial para la categorización automática, ofrece una experiencia de usuario fluida y eficiente, ahora con un sistema básico de autenticación.

## 🌟 Características Principales

*   🎫 **Gestión Intuitiva de Tickets:** Crea, visualiza (en formato de tarjeta o lista), edita y actualiza el estado de tus tickets de soporte.
*   ✨ **Categorización IA:** Sugerencias automáticas de categoría y prioridad para nuevos tickets gracias a la IA de Genkit (Google Gemini).
*   ⏱️ **Registro de Tiempo:** Registra fácilmente el tiempo dedicado a cada ticket.
*   📊 **Informes Gráficos Detallados:**
    *   Visualiza tickets por estado, prioridad, tendencias de creación y tiempo registrado.
    *   Filtra los datos para análisis específicos.
    *   Exporta informes a PDF y Excel.
*   🔑 **Autenticación (Simulada):**
    *   Página de inicio de sesión.
    *   Creación de usuarios con contraseña.
    *   Funcionalidad de "Cerrar Sesión".
    *   Protección básica de rutas.
*   🌓 **Tema Claro y Oscuro:** Cambia entre un tema visual claro y oscuro para mayor comodidad, con un interruptor accesible en la cabecera.
*   👥 **Gestión de Usuarios:** Crea y visualiza usuarios en el sistema, ahora con campo de contraseña.
*   🇪🇸 **Interfaz en Español:** Toda la aplicación está diseñada pensando en el usuario de habla hispana.
*   📱 **Diseño Responsivo:** Adaptable a diferentes tamaños de pantalla.

## 🛠️ Tecnologías y Arquitectura

Este proyecto está construido con un stack tecnológico moderno y eficiente:

*   **Frontend & Framework:**
    *   **Next.js 15+:** App Router, Server Components, Server Actions.
    *   **React 18+:** Para la construcción de interfaces de usuario interactivas.
    *   **TypeScript:** Para un desarrollo robusto y tipado seguro.
*   **Estilos:**
    *   **Tailwind CSS:** Framework CSS utility-first para un diseño rápido y personalizable.
    *   **ShadCN UI:** Colección de componentes de UI reutilizables.
*   **Inteligencia Artificial:**
    *   **Genkit (con Google Gemini):** Para la categorización y priorización automática de tickets.
*   **Gestión de Estado:**
    *   **Zustand:** Para la gestión del estado global (tickets, usuarios, autenticación).
*   **Iconografía:**
    *   **Lucide React:** Librería de iconos SVG ligeros y personalizables.
*   **Gráficos:**
    *   **Recharts:** Librería de gráficos para React.
*   **Validación de Datos:**
    *   **Zod:** Validación de esquemas para formularios y datos.
*   **Persistencia de Datos (Prototipo):**
    *   **`localStorage` del Navegador:** Para simular la persistencia de tickets, usuarios y sesión de usuario.
*   **Exportación de Datos:**
    *   **`jspdf` y `jspdf-autotable`:** Para la generación de informes en PDF.
    *   **`xlsx` (SheetJS):** Para la generación de informes en formato Excel.

### 🏗️ Estructura del Proyecto (Simplificada)
```
/src
├── ai/             # Lógica de IA con Genkit
├── app/            # Rutas (incluyendo /login, /admin, /reports, etc.)
├── components/     # Componentes React (UI, layout, formularios, gráficos, auth)
├── lib/
│   ├── hooks/      # Hooks de estado (useTicketStore, useUserStore, useAuthStore)
│   ├── types.ts    # Definiciones TypeScript
│   └── utils.ts    # Utilidades generales
└── ... (otros archivos de configuración)
```

## ✨ Funcionalidades Detalladas

### 🔑 Autenticación (Simulada)
*   **Página de Login (`/login`):** Permite a los usuarios "iniciar sesión" usando un email y contraseña. La validación se hace contra los usuarios almacenados en `localStorage`.
*   **Creación de Usuarios:** Desde `/admin/users/create`, se pueden crear nuevos usuarios especificando nombre, email y contraseña.
*   **Cierre de Sesión:** Un botón en la barra lateral permite al usuario "cerrar sesión", limpiando el estado de autenticación y redirigiendo a la página de login.
*   **Protección de Rutas:** Un componente `AuthGuard` redirige a los usuarios no autenticados a la página de login si intentan acceder a rutas protegidas.

### 🎫 Gestión de Tickets
*   **Dashboard Principal (`/`):** Muestra una lista/grilla de todos los tickets (requiere inicio de sesión). Filtros por término, estado y prioridad.
*   **Creación de Tickets (`/tickets/create`):** Formulario con asistencia IA para categoría/prioridad.
*   **Edición de Tickets (`/tickets/[id]/edit`):** Permite modificar los detalles de un ticket haciendo clic en su ID.

### 📊 Informes
*   **Página de Informes (`/reports`):** Dashboard con gráficos interactivos sobre tickets. Permite filtrar y exportar datos a PDF/Excel.

### 👥 Gestión de Usuarios
*   **Listado de Usuarios (`/admin/users`):** Tabla con usuarios registrados.
*   **Creación de Usuarios (`/admin/users/create`):** Formulario para añadir usuarios con nombre, email y contraseña.

### ⚙️ Configuración
*   **Página de Configuración (`/settings`):** Permite cambiar el tema de la aplicación (claro/oscuro).
*   **Cabecera Principal:** Incluye un interruptor rápido para el tema claro/oscuro.

### 🤖 Flujo de IA con Genkit
*   **`categorizeTicket`:** Analiza la descripción de un ticket para sugerir categoría y prioridad.

## 🚀 Primeros Pasos

1.  **Clonar el Repositorio:**
    ```bash
    git clone https://github.com/TU_USUARIO/NOMBRE_DE_TU_REPO.git
    cd NOMBRE_DE_TU_REPO
    ```
2.  **Instalar Dependencias:**
    ```bash
    npm install
    ```
3.  **Configurar Variables de Entorno (IA - Genkit):**
    *   Crea un archivo `.env.local` si necesitas una `GOOGLE_API_KEY`.
4.  **Ejecutar el Servidor de Desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará en `http://localhost:9002`.
5.  **Ejecutar el Inspector de Genkit (Opcional):**
    ```bash
    npm run genkit:dev
    ```

---
¡Disfruta de DevTrack Lite!
