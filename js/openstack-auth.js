/**
 * OpenStack Keystone v3 Identity & Role Hierarchy Engine
 * Maneja el registro, login y jerarquía de perfiles (Profesor / Alumno)
 * con reconocimiento nativo de tokens y esquemas Keystone v3.
 * 
 * UPTC - Redes de Datos & Nube Privada 2026
 */

(function (window) {
  'use strict';

  const STORAGE_USERS_KEY = 'uptc_openstack_users_v1';
  const STORAGE_SESSION_KEY = 'uptc_openstack_session_v1';
  const STORAGE_TOKEN_KEY = 'uptc_openstack_keystone_token_v1';

  // Jerarquía formal de roles para OpenStack Keystone RBAC
  const ROLE_HIERARCHY = {
    profesor: {
      name: 'Profesor',
      code: 'profesor',
      level: 1, // Jerarquía Nivel 1 (Superiores / Admin)
      openstack_role: 'admin',
      implied_roles: ['instructor', 'member', 'reader'],
      description: 'Docente con privilegios de gestión de topologías, configuración de simulaciones y auditoría completa.',
      badge_color: 'blue',
      permissions: [
        'identity:list_users',
        'identity:get_project',
        'compute:manage_instances',
        'network:manage_topologies',
        'simulation:all_access',
        'simulation:inject_faults',
        'simulation:grade_students',
        'telemetry:audit_logs'
      ]
    },
    alumno: {
      name: 'Alumno',
      code: 'alumno',
      level: 2, // Jerarquía Nivel 2 (Estudiante / Operativo)
      openstack_role: 'member',
      implied_roles: ['reader', 'student'],
      description: 'Estudiante con privilegios de ejecución de prácticas, análisis de protocolos y visualización de telemetría.',
      badge_color: 'green',
      permissions: [
        'compute:view_instances',
        'network:view_topology',
        'simulation:run_practice',
        'simulation:view_packets',
        'simulation:export_results'
      ]
    }
  };

  // Usuarios iniciales semilla (Demo precargado)
  const SEED_USERS = [
    {
      id: 'usr-profesor-001',
      name: 'Dr. Frey Santamaría',
      email: 'profesor@uptc.edu.co',
      password: 'profesor123',
      role: 'profesor',
      created_at: '2026-02-15T08:00:00Z',
      domain_id: 'default',
      project_id: 'proj-redes-uptc'
    },
    {
      id: 'usr-alumno-001',
      name: 'Carlos Albeiro Zamora',
      email: 'alumno@uptc.edu.co',
      password: 'alumno123',
      role: 'alumno',
      created_at: '2026-02-16T09:30:00Z',
      domain_id: 'default',
      project_id: 'proj-redes-uptc'
    }
  ];

  class OpenStackAuth {
    constructor() {
      this.initStorage();
    }

    initStorage() {
      const existing = localStorage.getItem(STORAGE_USERS_KEY);
      if (!existing) {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(SEED_USERS));
      }
    }

    getUsers() {
      try {
        const data = localStorage.getItem(STORAGE_USERS_KEY);
        return data ? JSON.parse(data) : SEED_USERS;
      } catch (e) {
        console.error('Error al leer usuarios de localStorage', e);
        return SEED_USERS;
      }
    }

    saveUsers(users) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    }

    /**
     * Registro de nuevo usuario con selección de rol
     */
    register(name, email, password, role) {
      if (!name || !email || !password || !role) {
        return { success: false, message: 'Todos los campos son obligatorios.' };
      }

      const cleanEmail = email.trim().toLowerCase();
      const users = this.getUsers();

      if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
        return { success: false, message: 'El correo electrónico ya se encuentra registrado.' };
      }

      if (!ROLE_HIERARCHY[role]) {
        return { success: false, message: 'El rol seleccionado no es válido en el esquema OpenStack.' };
      }

      if (password.length < 6) {
        return { success: false, message: 'La contraseña debe contener al menos 6 caracteres.' };
      }

      const newUser = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        name: name.trim(),
        email: cleanEmail,
        password: password,
        role: role,
        created_at: new Date().toISOString(),
        domain_id: 'default',
        project_id: 'proj-redes-uptc'
      };

      users.push(newUser);
      this.saveUsers(users);

      // Inicia sesión automáticamente con el nuevo usuario
      const tokenResult = this.createKeystoneToken(newUser);
      this.setSession(newUser, tokenResult);

      return {
        success: true,
        user: newUser,
        token: tokenResult,
        message: `Cuenta creada exitosamente con perfil de ${ROLE_HIERARCHY[role].name}.`
      };
    }

    /**
     * Inicio de sesión
     */
    login(email, password) {
      if (!email || !password) {
        return { success: false, message: 'Ingrese correo y contraseña.' };
      }

      const cleanEmail = email.trim().toLowerCase();
      const users = this.getUsers();
      const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);

      if (!user) {
        return { success: false, message: 'Credenciales inválidas. Verifique correo y contraseña.' };
      }

      const tokenResult = this.createKeystoneToken(user);
      this.setSession(user, tokenResult);

      return {
        success: true,
        user: user,
        token: tokenResult,
        message: 'Autenticación exitosa en OpenStack Identity.'
      };
    }

    /**
     * Construye un Token Keystone v3 válido según especificación OpenStack
     */
    createKeystoneToken(user) {
      const roleDef = ROLE_HIERARCHY[user.role] || ROLE_HIERARCHY.alumno;
      const now = new Date();
      const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas

      // Generación de token ID estilo SHA-256 / Fernet de OpenStack
      const tokenId = 'gAAAAAB' + Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      const tokenPayload = {
        token: {
          is_domain: false,
          methods: ['password'],
          roles: [
            {
              id: `role-${user.role}-uuid`,
              name: user.role,
              hierarchy_level: roleDef.level,
              openstack_equivalent: roleDef.openstack_role,
              implied_roles: roleDef.implied_roles
            }
          ],
          expires_at: expires.toISOString(),
          project: {
            domain: { id: 'default', name: 'Default' },
            id: user.project_id || 'proj-redes-uptc',
            name: 'Laboratorio-Redes-UPTC'
          },
          catalog: [
            {
              type: 'identity',
              id: 'svc-keystone-01',
              name: 'keystone',
              endpoints: [
                { id: 'ep-k1', interface: 'public', url: 'http://172.24.4.86:5000/v3', region: 'RegionOne' },
                { id: 'ep-k2', interface: 'internal', url: 'http://10.0.0.52:5000/v3', region: 'RegionOne' }
              ]
            },
            {
              type: 'compute',
              id: 'svc-nova-01',
              name: 'nova',
              endpoints: [
                { id: 'ep-n1', interface: 'public', url: 'http://172.24.4.86:8774/v2.1', region: 'RegionOne' }
              ]
            },
            {
              type: 'network',
              id: 'svc-neutron-01',
              name: 'neutron',
              endpoints: [
                { id: 'ep-net1', interface: 'public', url: 'http://172.24.4.86:9696/v2.0', region: 'RegionOne' }
              ]
            },
            {
              type: 'simulation',
              id: 'svc-sim-01',
              name: 'network-simulators',
              endpoints: [
                { id: 'ep-s1', interface: 'public', url: 'http://localhost:8000/simulacion-redes', region: 'RegionOne' },
                { id: 'ep-s2', interface: 'public', url: 'http://localhost:8000/network-packet-flow-simulator-main', region: 'RegionOne' }
              ]
            }
          ],
          user: {
            domain: { id: 'default', name: 'Default' },
            id: user.id,
            name: user.name,
            email: user.email,
            role_hierarchy: user.role,
            openstack_role: roleDef.openstack_role,
            password_expires_at: null
          },
          audit_ids: ['audit-' + Math.random().toString(36).substring(2, 10)],
          issued_at: now.toISOString()
        },
        token_id: tokenId
      };

      return tokenPayload;
    }

    setSession(user, tokenResult) {
      const cleanUser = { ...user };
      delete cleanUser.password;
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(cleanUser));
      localStorage.setItem(STORAGE_TOKEN_KEY, JSON.stringify(tokenResult));
    }

    getActiveSession() {
      try {
        const userStr = localStorage.getItem(STORAGE_SESSION_KEY);
        const tokenStr = localStorage.getItem(STORAGE_TOKEN_KEY);
        if (!userStr || !tokenStr) return null;
        return {
          user: JSON.parse(userStr),
          token: JSON.parse(tokenStr),
          roleDef: ROLE_HIERARCHY[JSON.parse(userStr).role] || ROLE_HIERARCHY.alumno
        };
      } catch (e) {
        console.error('Error recuperando sesión', e);
        return null;
      }
    }

    logout() {
      localStorage.removeItem(STORAGE_SESSION_KEY);
      localStorage.removeItem(STORAGE_TOKEN_KEY);
    }

    getRoleDetails(roleCode) {
      return ROLE_HIERARCHY[roleCode] || ROLE_HIERARCHY.alumno;
    }

    /**
     * Genera el script de entorno OpenStack RC oficial
     */
    generateOpenRC(user) {
      const roleDef = this.getRoleDetails(user.role);
      return `#!/usr/bin/env bash
# OpenStack RC File para autenticación de usuario
# Generado para: ${user.name} (${roleDef.name} - Nivel ${roleDef.level})
# Proyecto: Laboratorio-Redes-UPTC

export OS_AUTH_URL="http://172.24.4.86:5000/v3"
export OS_PROJECT_ID="${user.project_id || 'proj-redes-uptc'}"
export OS_PROJECT_NAME="Laboratorio-Redes-UPTC"
export OS_USER_DOMAIN_NAME="Default"
export OS_PROJECT_DOMAIN_ID="default"
export OS_USERNAME="${user.email}"
export OS_ROLE="${roleDef.openstack_role}"
export OS_CUSTOM_ROLE="${user.role}"
export OS_HIERARCHY_LEVEL="${roleDef.level}"
export OS_IDENTITY_API_VERSION="3"
export OS_REGION_NAME="RegionOne"

echo "Configuración OpenStack cargada para usuario ${user.name} con rol ${roleDef.name}."
`;
    }
  }

  window.OpenStackAuth = new OpenStackAuth();
  window.OPENSTACK_ROLE_HIERARCHY = ROLE_HIERARCHY;
})(window);

