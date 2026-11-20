/**
 * Controlador de Interfaz de Usuario para el Portal de Simulaciones
 * Maneja eventos de login, registro con jerarquía OpenStack, redirecciones y modales.
 * 
 * UPTC 2026
 */

(function () {
  'use strict';

  // Elementos DOM
  const authSection = document.getElementById('authSection');
  const mainSection = document.getElementById('mainSection');
  const headerUserZone = document.getElementById('headerUserZone');
  
  const tabBtnLogin = document.getElementById('tabBtnLogin');
  const tabBtnRegister = document.getElementById('tabBtnRegister');
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');
  const authAlert = document.getElementById('authAlert');

  // Inputs Login
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const toggleLoginPassword = document.getElementById('toggleLoginPassword');

  // Inputs Register
  const regName = document.getElementById('regName');
  const regEmail = document.getElementById('regEmail');
  const regPassword = document.getElementById('regPassword');
  const regConfirmPassword = document.getElementById('regConfirmPassword');
  const cardRoleProfesor = document.getElementById('cardRoleProfesor');
  const cardRoleAlumno = document.getElementById('cardRoleAlumno');
  const roleDescriptionText = document.getElementById('roleDescriptionText');

  // Demo buttons
  const btnFillProfesor = document.getElementById('btnFillProfesor');
  const btnFillAlumno = document.getElementById('btnFillAlumno');

  // Header and Main Zone Elements
  const headerUserName = document.getElementById('headerUserName');
  const headerUserEmail = document.getElementById('headerUserEmail');
  const headerRoleBadge = document.getElementById('headerRoleBadge');
  const btnLogout = document.getElementById('btnLogout');

  const welcomeRoleBadge = document.getElementById('welcomeRoleBadge');
  const welcomeTitle = document.getElementById('welcomeTitle');
  const welcomeDescription = document.getElementById('welcomeDescription');

  // Modal Keystone Elements
  const btnViewKeystoneToken = document.getElementById('btnViewKeystoneToken');
  const btnDownloadOpenRC = document.getElementById('btnDownloadOpenRC');
  const modalKeystone = document.getElementById('modalKeystone');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const jsonTokenViewer = document.getElementById('jsonTokenViewer');
  const btnCopyTokenJson = document.getElementById('btnCopyTokenJson');

  let selectedRole = 'alumno'; // Default role

  function showAlert(msg, isError = true) {
    authAlert.textContent = msg;
    authAlert.className = isError
      ? 'p-3 rounded-xl text-xs font-medium border border-[#FF453A]/40 bg-[#FF453A]/10 text-[#FF453A] block'
      : 'p-3 rounded-xl text-xs font-medium border border-[#30D158]/40 bg-[#30D158]/10 text-[#30D158] block';
  }

  function hideAlert() {
    authAlert.className = 'hidden';
  }

  // Cambio de pestañas Login / Register
  function switchTab(toTab) {
    hideAlert();
    if (toTab === 'login') {
      tabBtnLogin.className = 'nav-tab-btn tab-active flex-1 py-1.5 text-xs font-semibold text-center transition';
      tabBtnRegister.className = 'nav-tab-btn tab-inactive flex-1 py-1.5 text-xs font-medium text-center transition';
      formLogin.classList.remove('hidden');
      formRegister.classList.add('hidden');
    } else {
      tabBtnLogin.className = 'nav-tab-btn tab-inactive flex-1 py-1.5 text-xs font-medium text-center transition';
      tabBtnRegister.className = 'nav-tab-btn tab-active flex-1 py-1.5 text-xs font-semibold text-center transition';
      formLogin.classList.add('hidden');
      formRegister.classList.remove('hidden');
    }
  }

  tabBtnLogin.addEventListener('click', () => switchTab('login'));
  tabBtnRegister.addEventListener('click', () => switchTab('register'));

  // Selección de Rol en Registro
  cardRoleProfesor.addEventListener('click', () => {
    selectedRole = 'profesor';
    cardRoleProfesor.classList.add('role-card-selected');
    cardRoleAlumno.classList.remove('role-card-selected');
    roleDescriptionText.textContent = '* Profesor: Nivel 1. Privilegios elevados de administración y auditoría en OpenStack.';
  });

  cardRoleAlumno.addEventListener('click', () => {
    selectedRole = 'alumno';
    cardRoleAlumno.classList.add('role-card-selected');
    cardRoleProfesor.classList.remove('role-card-selected');
    roleDescriptionText.textContent = '* Alumno: Nivel 2. Privilegios de ejecución de prácticas y análisis en el proyecto de laboratorio.';
  });

  // Mostrar / ocultar contraseña
  toggleLoginPassword.addEventListener('click', () => {
    if (loginPassword.type === 'password') {
      loginPassword.type = 'text';
      toggleLoginPassword.textContent = 'Ocultar';
    } else {
      loginPassword.type = 'password';
      toggleLoginPassword.textContent = 'Mostrar';
    }
  });

  // Rellenar demos
  btnFillProfesor.addEventListener('click', () => {
    loginEmail.value = 'profesor@uptc.edu.co';
    loginPassword.value = 'profesor123';
    hideAlert();
  });

  btnFillAlumno.addEventListener('click', () => {
    loginEmail.value = 'alumno@uptc.edu.co';
    loginPassword.value = 'alumno123';
    hideAlert();
  });

  // Manejo de Login
  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert();

    const email = loginEmail.value;
    const password = loginPassword.value;

    const res = window.OpenStackAuth.login(email, password);
    if (!res.success) {
      showAlert(res.message, true);
    } else {
      showAlert(res.message, false);
      setTimeout(() => renderMainView(res.user), 300);
    }
  });

  // Manejo de Registro
  formRegister.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert();

    const name = regName.value;
    const email = regEmail.value;
    const password = regPassword.value;
    const confirm = regConfirmPassword.value;

    if (password !== confirm) {
      showAlert('Las contraseñas no coinciden.', true);
      return;
    }

    const res = window.OpenStackAuth.register(name, email, password, selectedRole);
    if (!res.success) {
      showAlert(res.message, true);
    } else {
      showAlert(res.message, false);
      setTimeout(() => renderMainView(res.user), 400);
    }
  });

  // Renderizar la Vista Principal
  function renderMainView(user) {
    const roleDef = window.OpenStackAuth.getRoleDetails(user.role);

    // Actualizar Encabezado
    headerUserName.textContent = user.name;
    headerUserEmail.textContent = user.email;
    headerRoleBadge.textContent = `${roleDef.name} · Nivel ${roleDef.level}`;
    headerRoleBadge.className = user.role === 'profesor'
      ? 'apple-badge apple-badge-blue text-[11px] font-mono font-medium'
      : 'apple-badge apple-badge-green text-[11px] font-mono font-medium';
    headerUserZone.classList.remove('hidden');

    // Actualizar Panel de Bienvenida
    welcomeRoleBadge.textContent = `Jerarquía: ${roleDef.name} (Nivel ${roleDef.level})`;
    welcomeRoleBadge.className = user.role === 'profesor'
      ? 'apple-badge apple-badge-blue text-xs font-mono'
      : 'apple-badge apple-badge-green text-xs font-mono';

    welcomeTitle.textContent = `Bienvenido, ${user.name}`;
    welcomeDescription.textContent = user.role === 'profesor'
      ? `Ha ingresado con credenciales de Docente / Instructor (Rol OpenStack: ${roleDef.openstack_role}). Cuenta con privilegios completos de gestión sobre el tenant de simulación, telemetría y supervisión de actividades.`
      : `Ha ingresado con credenciales de Estudiante (Rol OpenStack: ${roleDef.openstack_role}). Puede explorar las simulaciones, ejecutar transferencias de paquetes y analizar la interacción de capas y dispositivos de red.`;

    // Transición de vistas
    authSection.classList.add('hidden');
    mainSection.classList.remove('hidden');
  }

  // Logout (Cerrar Sesión)
  btnLogout.addEventListener('click', () => {
    window.OpenStackAuth.logout();
    headerUserZone.classList.add('hidden');
    mainSection.classList.add('hidden');
    authSection.classList.remove('hidden');
    formLogin.reset();
    formRegister.reset();
    switchTab('login');
    showAlert('Sesión cerrada correctamente.', false);
  });

  // Modal Inspección Token Keystone
  btnViewKeystoneToken.addEventListener('click', () => {
    const session = window.OpenStackAuth.getActiveSession();
    if (!session) return;
    jsonTokenViewer.textContent = JSON.stringify(session.token, null, 2);
    modalKeystone.classList.remove('hidden');
  });

  btnCloseModal.addEventListener('click', () => {
    modalKeystone.classList.add('hidden');
  });

  modalKeystone.addEventListener('click', (e) => {
    if (e.target === modalKeystone) {
      modalKeystone.classList.add('hidden');
    }
  });

  btnCopyTokenJson.addEventListener('click', () => {
    const text = jsonTokenViewer.textContent;
    navigator.clipboard.writeText(text).then(() => {
      btnCopyTokenJson.textContent = '¡Copiado!';
      setTimeout(() => {
        btnCopyTokenJson.textContent = 'Copiar JSON';
      }, 1800);
    });
  });

  // Descarga de archivo openrc.sh
  btnDownloadOpenRC.addEventListener('click', () => {
    const session = window.OpenStackAuth.getActiveSession();
    if (!session) return;
    const rcContent = window.OpenStackAuth.generateOpenRC(session.user);
    const blob = new Blob([rcContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openrc-${session.user.role}.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Comprobar sesión al cargar
  const activeSession = window.OpenStackAuth.getActiveSession();
  if (activeSession && activeSession.user) {
    renderMainView(activeSession.user);
  } else {
    switchTab('login');
  }

})();

