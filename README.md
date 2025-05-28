
# 🚀 DevTrack Lite: Tu Asistente Inteligente para Tickets de Soporte チケット 🎫

[![Next.js](https://img.shields.io/badge/Next.js-15.x-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.x-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ShadCN UI](https://img.shields.io/badge/ShadCN_UI-Jazmín-black?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![Genkit](https://img.shields.io/badge/Genkit_AI-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/docs/genkit)

**DevTrack Lite** es una aplicación web moderna y ágil, diseñada para simplificar la gestión de tickets de soporte y el seguimiento del tiempo. Potenciada con Inteligencia Artificial para la categorización automática, ofrece una experiencia de usuario fluida y eficiente.

## 🌟 Características Principales

*   🎫 **Gestión Intuitiva de Tickets:** Crea, visualiza (en formato de tarjeta o lista), edita y actualiza el estado de tus tickets de soporte.
*   ✨ **Categorización IA:** Sugerencias automáticas de categoría y prioridad para nuevos tickets gracias a la IA de Genkit (Google Gemini).
*   ⏱️ **Registro de Tiempo:** Registra fácilmente el tiempo dedicado a cada ticket.
*   📊 **Informes Gráficos Detallados:**
    *   Visualiza tickets por estado, prioridad, tendencias de creación y tiempo registrado.
    *   Filtra los datos para análisis específicos.
    *   Exporta informes a PDF y Excel.
*   🌓 **Tema Claro y Oscuro:** Cambia entre un tema visual claro y oscuro para mayor comodidad.
*   👥 **Gestión Básica de Usuarios:** Crea y visualiza usuarios en el sistema.
*   🇪🇸 **Interfaz en Español:** Toda la aplicación está diseñada pensando en el usuario de habla hispana.
*   📱 **Diseño Responsivo:** Adaptable a diferentes tamaños de pantalla, desde móviles hasta escritorio.

## 🛠️ Tecnologías y Arquitectura

Este proyecto está construido con un stack tecnológico moderno y eficiente:

*   **Frontend & Framework:**
    *   **Next.js 15+:** App Router, Server Components, Server Actions.
    *   **React 18+:** Para la construcción de interfaces de usuario interactivas.
    *   **TypeScript:** Para un desarrollo robusto y tipado seguro.
*   **Estilos:**
    *   **Tailwind CSS:** Framework CSS utility-first para un diseño rápido y personalizable.
    *   **ShadCN UI:** Colección de componentes de UI reutilizables, construidos sobre Radix UI y Tailwind CSS.
*   **Inteligencia Artificial:**
    *   **Genkit (con Google Gemini):** Para la categorización y priorización automática de tickets.
*   **Iconografía:**
    *   **Lucide React:** Librería de iconos SVG ligeros y personalizables.
*   **Gráficos:**
    *   **Recharts:** Librería de gráficos para React.
*   **Validación de Datos:**
    *   **Zod:** Validación de esquemas para formularios y datos.
*   **Persistencia de Datos (Prototipo):**
    *   **`localStorage` del Navegador:** Para simular la persistencia de tickets y usuarios durante la fase de prototipado.
*   **Exportación de Datos:**
    *   **`jspdf` y `jspdf-autotable`:** Para la generación de informes en PDF.
    *   **`xlsx` (SheetJS):** Para la generación de informes en formato Excel.
*   **Testing:**
    *   **Jest:** Framework de pruebas de JavaScript.
    *   **React Testing Library:** Para probar componentes React de forma centrada en el usuario.

### 🏗️ Estructura del Proyecto

La aplicación sigue una estructura organizada para facilitar el desarrollo y mantenimiento:

```
/
├── public/             # Archivos estáticos (favicon, etc.)
├── src/
│   ├── ai/             # Lógica de Inteligencia Artificial con Genkit
│   │   ├── flows/      # Flujos de Genkit (ej. categorizar ticket)
│   │   └── genkit.ts   # Configuración de Genkit
│   ├── app/            # Rutas, páginas y layouts del App Router de Next.js
│   │   ├── admin/      # Sección de administración (ej. gestión de usuarios)
│   │   ├── reports/    # Página de informes
│   │   ├── settings/   # Página de configuración
│   │   ├── tickets/    # Páginas relacionadas con tickets (crear, editar)
│   │   ├── globals.css # Estilos globales y variables de tema (Tailwind)
│   │   ├── layout.tsx  # Layout principal de la aplicación
│   │   └── page.tsx    # Página de inicio (dashboard de tickets)
│   ├── components/     # Componentes React reutilizables
│   │   ├── charts/     # Componentes específicos para gráficos
│   │   ├── layout/     # Componentes de estructura (header, sidebar)
│   │   └── ui/         # Componentes de UI de ShadCN (button, card, etc.)
│   ├── hooks/          # Hooks personalizados (ej. useToast, useMobile)
│   ├── lib/            # Utilidades, tipos y lógica de datos compartida
│   │   ├── hooks/      # Hooks de estado global (useTicketStore, useUserStore)
│   │   ├── types.ts    # Definiciones de tipos TypeScript
│   │   └── utils.ts    # Funciones de utilidad (ej. cn para classnames)
│   ├── tests/          # (Opcional, si se mueven fuera de __tests__)
│   └── __mocks__/      # Mocks para Jest (ej. lucide-react)
├── .env                # Variables de entorno (no versionadas)
├── .gitignore          # Archivos ignorados por Git
├── components.json     # Configuración de ShadCN UI
├── jest.config.js      # Configuración de Jest
├── jest.setup.js       # Configuración adicional para Jest
├── next.config.ts      # Configuración de Next.js
├── package.json        # Dependencias y scripts del proyecto
├── tailwind.config.ts  # Configuración de Tailwind CSS
├── tsconfig.json       # Configuración de TypeScript
└── README.md           # ¡Este archivo!
```

## ✨ Funcionalidades Detalladas

### 🎫 Gestión de Tickets
*   **Dashboard Principal (`/`):** Muestra una lista de todos los tickets. Permite cambiar entre vista de tarjetas (grid) y vista de tabla (list). Incluye filtros por término de búsqueda, estado y prioridad.
*   **Creación de Tickets (`/tickets/create`):** Formulario intuitivo para crear nuevos tickets. Incluye campos para título, descripción, categoría y prioridad.
    *   **Asistencia IA:** Botón "IA Auto-Categorizar y Priorizar" que utiliza Genkit para sugerir categoría y prioridad basado en la descripción.
*   **Edición de Tickets (`/tickets/[id]/edit`):** Permite modificar los detalles de un ticket existente. Se accede haciendo clic en el ID del ticket.
*   **Registro de Tiempo:** Cada ticket permite registrar el tiempo dedicado. Un diálogo modal facilita la entrada de duración y notas.
*   **Cambio de Estado:** Se puede cambiar el estado de un ticket (Abierto, En Progreso, Pendiente, Resuelto, Cerrado) directamente desde la lista o tarjeta del ticket.

### 📊 Informes
*   **Página de Informes (`/reports`):** Un dashboard dedicado a la visualización de métricas de tickets.
    *   **Gráficos Interactivos:**
        *   Tickets por Estado (Gráfico de Torta o Barras)
        *   Tickets por Prioridad (Gráfico de Barras)
        *   Tendencia de Creación de Tickets (Gráfico de Líneas, agrupable por día/semana/mes)
        *   Resumen de Tiempo Registrado (Gráfico de Barras, agrupable por categoría/prioridad/estado)
    *   **Filtros:** Permite filtrar los datos de los gráficos por estado y prioridad del ticket.
    *   **Exportación:**
        *   Descarga los datos de los tickets filtrados en formato **PDF**.
        *   Descarga los datos de los tickets filtrados en formato **Excel (.xlsx)**.
    *   **Vistas Detalladas:** Opción para enfocar en un gráfico específico y verlo en un tamaño mayor con más detalles/opciones.

### 👥 Gestión de Usuarios
*   **Listado de Usuarios (`/admin/users`):** Muestra una tabla con los usuarios registrados (nombre, email, fecha de creación).
*   **Creación de Usuarios (`/admin/users/create`):** Formulario para añadir nuevos usuarios al sistema.

### ⚙️ Configuración
*   **Página de Configuración (`/settings`):**
    *   **Cambio de Tema:** Interruptor para alternar entre el tema claro y oscuro de la aplicación. La preferencia se guarda en `localStorage`.
    *   (Placeholder para futuras configuraciones como notificaciones, perfil de usuario, etc.)

### 🤖 Flujo de IA con Genkit
*   **`categorizeTicket`:**
    *   **Archivo:** `src/ai/flows/categorize-ticket.ts`
    *   **Propósito:** Recibe el contenido (descripción) de un ticket y utiliza un modelo de lenguaje (Gemini a través de Google AI) para determinar y sugerir:
        *   `tags`: Etiquetas relevantes para el ticket.
        *   `category`: La categoría más apropiada (ej. "Bug", "Mejora").
        *   `priority`: La prioridad sugerida (`low`, `medium`, `high`).
    *   **Integración:** Se invoca desde el formulario de creación de tickets para asistir al usuario.

## 🚀 Primeros Pasos

Para poner en marcha este proyecto en tu entorno local:

1.  **Clonar el Repositorio:**
    ```bash
    git clone https://github.com/TU_USUARIO/NOMBRE_DE_TU_REPO.git
    cd NOMBRE_DE_TU_REPO
    ```

2.  **Instalar Dependencias:**
    Asegúrate de tener Node.js (v18 o superior) y npm/yarn instalados.
    ```bash
    npm install
    # o
    # yarn install
    ```

3.  **Configurar Variables de Entorno (IA - Genkit):**
    *   Crea un archivo `.env.local` en la raíz del proyecto.
    *   Añade tu clave API de Google AI Studio para Genkit (si es necesario para el modelo que estés usando):
        ```env
        GOOGLE_API_KEY=TU_API_KEY_DE_GOOGLE_AI
        ```
    *   *Nota: El modelo `gemini-2.0-flash` configurado actualmente puede funcionar sin API key explícita en ciertos entornos de Firebase/Google Cloud, pero es buena práctica tenerla configurada si se desarrolla localmente o se despliega fuera de estos ecosistemas.*

4.  **Ejecutar el Servidor de Desarrollo de Next.js:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:9002` (o el puerto que hayas configurado).

5.  **Ejecutar el Servidor de Desarrollo de Genkit (para probar flujos de IA):**
    En una terminal separada, ejecuta:
    ```bash
    npm run genkit:dev
    # o si quieres que se reinicie con los cambios:
    # npm run genkit:watch
    ```
    Esto iniciará el inspector de Genkit, usualmente en `http://localhost:4000`.

---

¡Esperamos que disfrutes usando y explorando DevTrack Lite! Si tienes ideas o encuentras algún problema, no dudes en abrir un "Issue".
```