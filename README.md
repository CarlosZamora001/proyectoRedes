# 🌐 Portal de Simulaciones de Redes · OpenStack Identity (Keystone v3)
### Universidad Pedagógica y Tecnológica de Colombia (UPTC)
**Facultad de Ingeniería · Escuela de Ingeniería de Sistemas y Computación**  
**Asignatura:** Redes de Datos & Computación en la Nube / Nube Privada · Tunja, 2026  
**Autor:** Carlos Albeiro Zamora Buitrago  

---

## 📋 Índice
1. [Descripción General](#-descripción-general)
2. [Arquitectura y Jerarquía de Roles OpenStack](#-arquitectura-y-jerarquía-de-roles-openstack)
3. [Ecosistema de Simulaciones (Los 2 Botones)](#-ecosistema-de-simulaciones-los-2-botones)
4. [Flujo de Funcionamiento Paso a Paso](#-flujo-de-funcionamiento-paso-a-paso)
5. [Estructura de Archivos del Repositorio](#-estructura-de-archivos-del-repositorio)
6. [Credenciales Demo Preconfiguradas](#-credenciales-demo-preconfiguradas)
7. [Guía de Puesta en Marcha (Local y OpenStack)](#-guía-de-puesta-en-marcha-local-y-openstack)
8. [Sistema de Diseño Visual](#-sistema-de-diseño-visual)

---

## 📖 Descripción General

Este proyecto consiste en una **plataforma web integral** orientada a la enseñanza e investigación práctica de redes de datos y entornos de nube privada. 

Integra un sistema de autenticación centralizado que establece desde el primer momento una **jerarquía estricta de perfiles (Profesor y Alumno)** compatible de manera nativa con las especificaciones del servicio de identidad **Keystone v3 de OpenStack**, con políticas de control de acceso basado en roles (RBAC) y generación de tokens criptográficos `X-Subject-Token`.

Tras autenticarse, el usuario accede a una **Ventana Principal** con monitoreo de su sesión OpenStack, botón de cierre de sesión (`Logout`) y **dos botones centrales** que redirigen a los entornos de simulación interactiva, compartiendo un estilo visual unificado **Apple Human Interface Guidelines (Dark Glassmorphism)**.

```
                  ┌───────────────────────────────────────────────┐
                  │    Login / Registro con Jerarquía OpenStack   │
                  │        (Profesor Nivel 1 / Alumno Nivel 2)    │
                  └───────────────────────┬───────────────────────┘
                                          │ Autenticación Keystone v3
                                          ▼
                  ┌───────────────────────────────────────────────┐
                  │     VENTANA PRINCIPAL (Dashboard Unificado)   │
                  │   - Identidad & Nivel Jerárquico del Usuario  │
                  │   - Token Inspector & Descargador openrc.sh   │
                  │   - Botón de Logout (Cierre de Sesión)        │
                  └──────────────┬─────────────────┬──────────────┘
                                 │                 │
                ┌────────────────┴───┐         ┌───┴────────────────┐
                ▼                    ▼         ▼                    ▼
     ┌──────────────────────┐  ┌──────────────────────────────────────────┐
     │   BOTÓN 1: Simulación 1  │  │           BOTÓN 2: Simulación 2          │
     │  Network Packet Flow │  │ Protocol Explorer: How the Internet Works│
     │ Simulator (OSI L2-L7)│  │ (DNS, TLS, HTTP, TCP, Vercel & SDK Local)│
     └──────────────────────┘  └──────────────────────────────────────────┘
```

---

## 🏛️ Arquitectura y Jerarquía de Roles OpenStack

La plataforma implementa el estándar **OpenStack Identity API v3 (Keystone)** mediante los módulos `js/openstack-auth.js` y `openstack-policy.json`:

### 1. Perfil Profesor (Docente / Instructor)
* **Nivel Jerárquico:** **Nivel 1 (Jerarquía Superior / Administrador)**.
* **Mapeo OpenStack:** Rol equivalente a `admin`.
* **Inferencia de Roles (`role_inferences`):** Al ser `profesor`, el motor le infiere automáticamente los roles `instructor`, `member` y `reader`.
* **Alcance del Proyecto (`project_scope`):** `Laboratorio-Redes-UPTC` en dominio `Default`.
* **Capacidades Operativas:**
  * `identity:list_users`, `identity:get_project`
  * `compute:manage_instances` (Orquestación Nova)
  * `network:manage_topologies` (Orquestación Neutron)
  * `simulation:all_access` (Control total y supervisión de simulaciones)
  * `simulation:inject_faults` (Inyección de caídas de enlace, drop de paquetes en firewall y congestión)
  * `telemetry:audit_logs` (Auditoría de prácticas y métricas de estudiantes)

### 2. Perfil Alumno (Estudiante)
* **Nivel Jerárquico:** **Nivel 2 (Operativo / Restringido)**.
* **Mapeo OpenStack:** Rol equivalente a `member`.
* **Inferencia de Roles:** Infiere `student` y `reader`.
* **Alcance del Proyecto:** `Laboratorio-Redes-UPTC` en dominio `Default`.
* **Capacidades Operativas:**
  * `compute:view_instances`, `network:view_topology`
  * `simulation:run_practice` (Ejecución guiada de laboratorios)
  * `simulation:view_packets` (Inspección y captura de paquetes)
  * `simulation:export_results` (Exportación de reportes de prácticas)

### 3. Artefactos de Integración OpenStack
* **Token Keystone v3:** Toda sesión emite un token con identificador `X-Subject-Token`, marcas de tiempo `issued_at` y `expires_at` (24 horas), información del usuario y el catálogo completo de endpoints de servicios (`keystone`, `nova`, `neutron`, `simulation`).
* **Matriz de Políticas RBAC (`openstack-policy.json`):** Define reglas de acceso como `profesor_required` y `alumno_or_profesor` para validación de permisos en servicios y microservicios.
* **Exportador `openrc.sh`:** Botón en la ventana principal que compila dinámicamente el archivo de variables de entorno oficiales de OpenStack (`OS_AUTH_URL`, `OS_PROJECT_NAME`, `OS_USERNAME`, `OS_ROLE`, `OS_IDENTITY_API_VERSION`) listo para ejecutar en terminales Ubuntu/Linux.

---

## 🕹️ Ecosistema de Simulaciones (Los 2 Botones)

La ventana principal expone dos botones principales diseñados como tarjetas interactivas de cristal líquido (`apple-card-interactive`):

### 1. Botón 1 · Simulación 1: Network Packet Flow Simulator
* **Ruta Local:** `network-packet-flow-simulator-main/index.html`
* **Enlace Cloud:** [Launch NetSim Online](https://netsim.networkershome.com)
* **Qué simula:**
  * Animación en tiempo real del tránsito de paquetes IP sobre un lienzo Canvas interactivo.
  * Recorrido nodo a nodo: **PC Cliente (192.168.1.10)** → **Switch L2 (VLAN 10 / Tabla CAM)** → **Router Gateway L3 (Traducción NAT a IP pública `203.0.113.5:52410`)** → **Firewall SPI (Inspección con estado y opción de inyección de bloqueo)** → **Servidor Web Destino (93.184.216.34:443)**.
  * **Inspector de Encapsulación OSI:** Muestra la transformación de cabeceras en Capa 7 (HTTP/TLS), Capa 4 (TCP), Capa 3 (IPv4), Capa 2 (Ethernet MAC) y Capa 1 (1000BASE-T).
  * Panel de métricas con contador de paquetes enviados, entregados, descartados en firewall y traducciones NAT.

### 2. Botón 2 · Simulación 2: Protocol Explorer
* **Enlace Oficial Vercel:** [Protocol Explorer · Learn how the internet works](https://protocol-explorer-alpha.vercel.app/)
* **Ruta Local de Respaldo:** `protocol-explorer-app/index.html`
* **Qué simula:**
  * Entorno interactivo para entender cómo funciona la arquitectura de protocolos de Internet a bajo nivel:
    * **Resolución jerárquica DNS:** Consultas a servidores Root, TLD y autoritativos.
    * **Negociación TLS/SSL Handshake:** Intercambio de llaves criptográficas y cifrado simétrico.
    * **Peticiones HTTP/HTTPS:** Métodos GET/POST, cabeceras y códigos de respuesta.
    * **Encapsulación TCP/IP:** Segmentación, control de flujo y números de secuencia.
  * La tarjeta permite abrir directamente la aplicación en Vercel o ingresar a la consola local con simulación de transacciones y llamadas al SDK (Read & Write).

### 3. Módulo Complementario: Dispositivos de Interconexión UPTC
* **Ruta:** `simulacion-redes/index.html`
* **Contenido:** Concentradores (Hubs) con simulación física de colisiones CSMA/CD, temporizador de backoff exponencial, osciloscopio interactivo de repetidores 3R y pasarela de traducción semántica VoIP (H.323 a SIP).

---

## 🔄 Flujo de Funcionamiento Paso a Paso

1. **Carga Inicial:**
   * La aplicación verifica si existe una sesión activa y un token Keystone válido en el almacenamiento local (`localStorage`).
   * Si no hay sesión, muestra el panel de autenticación.

2. **Inicio de Sesión (Login):**
   * El usuario introduce su correo y contraseña (o hace clic en los botones de acceso rápido *Profesor Demo* / *Alumno Demo*).
   * El motor `OpenStackAuth.login()` verifica las credenciales, genera el token Keystone v3 con los permisos asociados y almacena la sesión.

3. **Registro de Nueva Cuenta:**
   * Si no posee cuenta, el usuario pasa a la pestaña **Registrarse**.
   * Diligencia su nombre, correo y contraseña, y selecciona obligatoriamente su perfil:
     * **Profesor:** Se le asigna Nivel 1 (`admin`).
     * **Alumno:** Se le asigna Nivel 2 (`member`).
   * Al hacer clic en «Crear Cuenta y Conectar», el sistema crea el registro persistente, genera el token y entra directamente a la plataforma.

4. **Navegación en la Ventana Principal:**
   * El encabezado muestra el nombre del usuario y su insignia jerárquica (`Profesor · Nivel 1` en azul o `Alumno · Nivel 2` en verde).
   * El usuario puede:
     * Pulsar **«Ingresar al Simulador de Flujo de Paquetes»** para abrir la Simulación 1.
     * Pulsar **«Protocol Explorer · Learn how the internet works»** para abrir la Simulación 2.
     * Pulsar **«Inspeccionar Token Keystone»** para examinar la estructura JSON del token.
     * Pulsar **«Descargar openrc.sh»** para obtener su script de entorno OpenStack.
     * En cualquier simulación, puede usar el botón **`← Volver al Portal`** para retornar sin perder su sesión.

5. **Cierre de Sesión (Logout):**
   * Al pulsar el botón rojo **«Cerrar Sesión»** en el encabezado, el sistema invoca `OpenStackAuth.logout()`, elimina las claves de sesión del navegador y transiciona suavemente de nuevo a la pantalla de login.

---

## 📁 Estructura de Archivos del Repositorio

```text
proyecto/
│
├── index.html                               # Aplicación principal: Login, Registro, Jerarquía y Ventana Principal
├── openstack-policy.json                    # Matriz formal de políticas RBAC para OpenStack Keystone v3
├── server.py                                # Servidor HTTP en Python con soporte CORS y headers modernos
├── iniciar_portal.bat                       # Script de ejecución en Windows (servidor + apertura de navegador)
├── abrir_directo.bat                        # Script para apertura directa en navegador sin servidor
├── README.md                                # Documentación técnica y guía de funcionamiento
│
├── css/
│   └── styles.css                           # Sistema de diseño unificado Apple HIG (Dark Glassmorphism)
│
├── js/
│   ├── openstack-auth.js                    # Motor de autenticación, roles, jerarquía y generador de tokens v3
│   └── portal-ui.js                         # Controlador de eventos del DOM, vistas, alertas y modales
│
├── network-packet-flow-simulator-main/      # SIMULACIÓN 1: Flujo de paquetes en red
│   ├── index.html                           # Simulador interactivo en Canvas con capas OSI, NAT y Firewall
│   └── README.md                            # Documentación y referencia de NetSim
│
├── protocol-explorer-app/                   # SIMULACIÓN 2: Protocol Explorer
│   ├── index.html                           # Consola interactiva local con enlace a Vercel Live
│   ├── package.json                         # Dependencias del proyecto Next.js / TypeScript
│   ├── app/                                 # Rutas y componentes Next.js
│   ├── components/                          # Componentes de UI (tarjetas, tablas, diagramas)
│   └── mocks/                               # Datos simulados de protocolos y transacciones
│
└── simulacion-redes/                        # Módulo complementario de interconexión UPTC
    ├── index.html                           # Simulador de Hubs (CSMA/CD), Repetidores (3R) y Gateways
    ├── css/styles.css                       # Hoja de estilos original de la simulación UPTC
    └── js/                                  # Motores de simulación física de señales y colisiones
```

---

## 🔑 Credenciales Demo Preconfiguradas

Para pruebas y demostraciones inmediatas sin necesidad de diligenciar el registro:

| Perfil | Nivel Jerárquico | Rol OpenStack | Correo | Contraseña |
|---|---|---|---|---|
| **Profesor** | **Nivel 1 (Superior / Admin)** | `admin` | `profesor@uptc.edu.co` | `profesor123` |
| **Alumno** | **Nivel 2 (Estudiante / Member)** | `member` | `alumno@uptc.edu.co` | `alumno123` |

---

## 🚀 Guía de Puesta en Marcha (Local y OpenStack)

### Opción A: Ejecución Local en Windows (Recomendada)
1. Haga doble clic en el archivo `iniciar_portal.bat`.
2. El script arrancará el servidor en el puerto 8000 y abrirá automáticamente en su navegador:
   ```
   http://localhost:8000
   ```

### Opción B: Ejecución por Terminal
```powershell
# En PowerShell o CMD dentro de la carpeta del proyecto:
python server.py
```

### Opción C: Despliegue en Máquina Virtual OpenStack (Ubuntu 22.04 / 24.04 LTS)
1. Copie los archivos del proyecto a su instancia OpenStack mediante SCP o Git:
   ```bash
   scp -i ~/.ssh/openstack -r proyecto/ ubuntu@<IP-FLOTANTE-OPENSTACK>:/var/www/html/
   ```
2. Configure Nginx para servir el directorio `/var/www/html/proyecto/`:
   ```nginx
   server {
       listen 80;
       server_name _;
       root /var/www/html/proyecto;
       index index.html;
       location / {
           try_files $uri $uri/ =404;
       }
   }
   ```
3. Reinicie el servicio: `sudo systemctl restart nginx`.
4. El portal quedará accesible públicamente a través de la IP flotante asignada por OpenStack Neutron.

---

## 🎨 Sistema de Diseño Visual

La interfaz está construida siguiendo los lineamientos de **Apple Human Interface Guidelines (HIG 2025/2026)** en modo oscuro profundo:
* **Fondo:** Negro espacial absoluto (`#000000` / `#09090D`) con superficies jerárquicas elevadas.
* **Efecto Liquid Glass:** Tarjetas translúcidas con `backdrop-filter: blur(24px)` y bordes sutiles con iluminación blanca (`border-white/10`).
* **Paleta Semántica:**
  * 🔵 **Apple Blue (`#0A84FF`):** Nivel 1, botones primarios y protocolos de transporte.
  * 🟣 **Apple Purple (`#BF5AF2`):** Protocol Explorer, activos IP y transacciones criptográficas.
  * 🟢 **Apple Green (`#30D158`):** Nivel 2, estado de tokens activos y paquetes confirmados.
  * 🟠 **Apple Orange (`#FF9F0A`):** Traducciones NAT y métricas de tráfico.
  * 🔴 **Apple Red (`#FF453A`):** Bloqueos de Firewall, alertas y botón de Logout.
* **Tipografía:** SF Pro Display / SF Pro Text / Inter con fuentes monoespaciadas para parámetros técnicos (`SF Mono`, `Fira Code`).
