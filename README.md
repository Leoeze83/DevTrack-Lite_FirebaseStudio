
# 🚀 DevTrack Lite: Tu Asistente Inteligente para Tickets de Soporte チケット 🎫

[![Next.js](https://img.shields.io/badge/Next.js-15.x-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.x-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ShadCN UI](https://img.shields.io/badge/ShadCN_UI-Jazmín-black?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![Genkit](https://img.shields.io/badge/Genkit_AI-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/docs/genkit)

**DevTrack Lite** es una aplicación web moderna y ágil, diseñada para simplificar la gestión de tickets de soporte y el seguimiento del tiempo. Potenciada con Inteligencia Artificial para la categorización automática, ofrece una experiencia de usuario fluida y eficiente, con un sistema de autenticación y gestión de perfiles.

## 🌟 Características Principales

*   🎫 **Gestión Intuitiva de Tickets:** Crea, visualiza (en formato de tarjeta o lista), edita y actualiza el estado de tus tickets de soporte.
*   ✨ **Categorización IA:** Sugerencias automáticas de categoría y prioridad para nuevos tickets gracias a la IA de Genkit (Google Gemini).
*   ⏱️ **Registro de Tiempo:** Registra fácilmente el tiempo dedicado a cada ticket.
*   📊 **Informes Gráficos Detallados:**
    *   Visualiza tickets por estado, prioridad, tendencias de creación y tiempo registrado.
    *   Filtra los datos para análisis específicos.
    *   Exporta informes a PDF y Excel.
*   🔑 **Autenticación (Simulada):**
    *   Página de inicio de sesión con validación de email y contraseña.
    *   Creación de usuarios con nombre, email y contraseña.
    *   Funcionalidad de "Cerrar Sesión" desde el menú de perfil en la barra lateral.
    *   Protección básica de rutas.
*   👤 **Gestión de Perfil de Usuario:**
    *   Página "Mi Perfil" (`/profile`).
    *   Permite al usuario autenticado ver y editar su nombre.
    *   Permite subir y cambiar la imagen de perfil (guardada como Data URL).
    *   Muestra el email (solo lectura).
*   🌓 **Tema Claro y Oscuro:** Cambia entre un tema visual claro y oscuro para mayor comodidad, con un interruptor accesible en la cabecera y en la página de configuración.
*   👥 **Gestión de Usuarios (Admin):** Crea y visualiza usuarios en el sistema desde una sección de administración.
*   🇪🇸 **Interfaz en Español:** Toda la aplicación está diseñada pensando en el usuario de habla hispana.
*   📱 **Diseño Responsivo:** Adaptable a diferentes tamaños de pantalla.

## 🛠️ Tecnologías y Arquitectura

Este proyecto está construido con un stack tecnológico moderno y eficiente:

*   **Frontend & Framework:**
    *   **Next.js 15+:** App Router, Server Components, Server Actions (para IA).
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
    *   **`localStorage` del Navegador:** Para simular la persistencia de tickets, usuarios, sesión de usuario e imágenes de perfil (como Data URLs).
    *   **Usuarios Predeterminados (Seed):** Para la versión desplegada (ej. en Vercel), la aplicación se inicializa con usuarios predeterminados desde un archivo JSON (`src/lib/data/seed-users.json`) si `localStorage` está vacío. Esto permite probar el login en entornos sin estado.
*   **Exportación de Datos:**
    *   **`jspdf` y `jspdf-autotable`:** Para la generación de informes en PDF.
    *   **`xlsx` (SheetJS):** Para la generación de informes en formato Excel.

### 🏗️ Estructura del Proyecto (Simplificada)
\`\`\`
/src
├── ai/             # Lógica de IA con Genkit
├── app/            # Rutas (incluyendo /login, /admin, /reports, /profile, etc.)
├── components/     # Componentes React (UI, layout, formularios, gráficos, auth, perfil)
├── lib/
│   ├── data/       # Datos semilla (ej. seed-users.json)
│   ├── hooks/      # Hooks de estado (useTicketStore, useUserStore, useAuthStore)
│   ├── types.ts    # Definiciones TypeScript
│   └── utils.ts    # Utilidades generales
└── ... (otros archivos de configuración)
\`\`\`

## ✨ Funcionalidades Detalladas

### 🔑 Autenticación (Simulada)
*   **Página de Login (`/login`):** Permite a los usuarios "iniciar sesión" usando un email y contraseña. La validación se hace contra los usuarios almacenados en `localStorage` (gestidos por `useUserStore`).
    *   **Usuarios Predeterminados para Despliegue:** En entornos como Vercel, si no hay usuarios en `localStorage`, se cargarán usuarios de demostración (ej. `demo@example.com` / `password123`) desde un archivo `seed-users.json` para permitir el inicio de sesión.
*   **Creación de Usuarios:** Desde `/admin/users/create`, se pueden crear nuevos usuarios especificando nombre, email y contraseña. Estos usuarios se guardan en `localStorage`. En un entorno desplegado, estos usuarios creados solo existirán en el navegador del visitante actual.
*   **Cerrar Sesión:** Un botón en el menú de perfil (ubicado en el pie de la barra lateral) permite al usuario "cerrar sesión", limpiando el estado de autenticación y redirigiendo a la página de login.
*   **Protección de Rutas:** Un componente `AuthGuard` redirige a los usuarios no autenticados a la página de login si intentan acceder a rutas protegidas.

### 👤 Gestión de Perfil de Usuario
*   **Menú de Perfil en Barra Lateral:** Un avatar en el pie de la barra lateral despliega un menú con el nombre/email del usuario, y enlaces a "Mi Perfil", "Configuración" y "Cerrar Sesión".
*   **Página "Mi Perfil" (`/profile`):** Accesible desde el menú de perfil.
    *   **Visualización y Edición:** Muestra el nombre, correo electrónico y avatar del usuario actual.
    *   **Cambio de Nombre:** Permite editar el nombre del usuario.
    *   **Cambio de Avatar:** Permite al usuario seleccionar un archivo de imagen (PNG, JPG, GIF). La imagen se convierte a Data URL, se muestra una vista previa y se guarda en `localStorage`.
    *   **Email (Solo Lectura):** El correo electrónico no se puede modificar desde esta interfaz.
*   **Persistencia:** Los cambios en el nombre y avatar se guardan en `localStorage` a través de `useUserStore` y se reflejan en el estado de `useAuthStore`.

### 🎫 Gestión de Tickets
*   **Dashboard Principal (`/`):** Muestra una lista/grilla de todos los tickets (requiere inicio de sesión). Filtros por término, estado y prioridad. Permite cambiar entre vista de grilla y lista.
*   **Creación de Tickets (`/tickets/create`):** Formulario con asistencia IA para categoría/prioridad.
*   **Edición de Tickets (`/tickets/[id]/edit`):** Permite modificar los detalles de un ticket haciendo clic en su ID (visible en vistas de tarjeta y lista).

### 📊 Informes
*   **Página de Informes (`/reports`):** Dashboard con gráficos interactivos sobre tickets. Permite filtrar por estado y prioridad, cambiar vistas de gráficos y exportar datos a PDF/Excel.

### 👥 Gestión de Usuarios (Admin)
*   **Listado de Usuarios (`/admin/users`):** Tabla con usuarios registrados.
*   **Creación de Usuarios (`/admin/users/create`):** Formulario para añadir usuarios con nombre, email y contraseña.

### ⚙️ Configuración
*   **Página de Configuración (`/settings`):** Muestra el nombre del usuario actual (solo lectura). Permite cambiar el tema de la aplicación (claro/oscuro) y gestionar (simuladamente) preferencias de notificación.
*   **Cabecera Principal:** Incluye un interruptor rápido para el tema claro/oscuro.

### 🤖 Flujo de IA con Genkit
*   **`categorizeTicket`:** Analiza la descripción de un ticket para sugerir categoría y prioridad.

## 🚀 Primeros Pasos

1.  **Clonar el Repositorio:**
    \`\`\`bash
    git clone https://github.com/TU_USUARIO/NOMBRE_DE_TU_REPO.git
    cd NOMBRE_DE_TU_REPO
    \`\`\`
2.  **Instalar Dependencias:**
    \`\`\`bash
    npm install
    \`\`\`
3.  **Configurar Variables de Entorno (IA - Genkit):**
    *   Crea un archivo `.env.local` si necesitas una `GOOGLE_API_KEY` para usar Genkit con los modelos de Google.
        \`\`\`
        GOOGLE_API_KEY=TU_API_KEY_DE_GOOGLE_AI
        \`\`\`
4.  **Ejecutar el Servidor de Desarrollo:**
    \`\`\`bash
    npm run dev
    \`\`\`
    La aplicación estará en `http://localhost:9002` (o el puerto que tengas configurado).
5.  **Ejecutar el Inspector de Genkit (Opcional, para depurar flujos IA):**
    \`\`\`bash
    npm run genkit:dev
    \`\`\`
    El inspector estará en `http://localhost:4000`.

---
¡Disfruta de DevTrack Lite!
