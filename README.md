# Mensajero WebRTC en Contenedores Docker o Máquinas Virtuales

Repositorio del laboratorio práctico de la asignatura **Sistemas Distribuidos** — Programa de Ingeniería de Sistemas y Computación, Facultad de Ingenierías, **Universidad Tecnológica de Pereira (UTP)**.

- **David Leonardo Aguirre Sanchez**

---

## Descripción del proyecto

Sistema de mensajería distribuido desplegado en **dos nodos conectados entre sí** (contenedores Docker o máquinas virtuales en una red virtual). Permite que dos usuarios se conecten desde una interfaz web sencilla para realizar videollamadas en tiempo real e intercambiar texto, audio, video y archivos mediante **WebRTC** y señalización por **WebSocket**.

Siguiendo la metodología del laboratorio, el repositorio registra primero la investigación y el diseño de arquitectura antes de incorporar el código fuente de la aplicación.

---

## Estado del proyecto

- [x] **Fase 1: Investigación y arquitectura** — Informe técnico en PDF, justificación de tecnologías y diagramas UML.
- [ ] **Fase 2: Primer avance sin interfaz** — Despliegue reproducible de los dos nodos, red virtual con resolución por nombre y señalización demostrable desde consola.
- [ ] **Fase 3: Interfaz, medios y archivos** — Interfaz web con chat, videollamada bidireccional, control de micrófono/cámara, transferencia de archivos (≥ 20 MB) y manejo de errores.
- [ ] **RETO (Opcional):** Videollamada grupal (≥ 4 participantes) y compartir pantalla.

---

## Estructura del repositorio

```text
.
├── docs/
│   ├── Fase_1_Mensajero_WebRTC.pdf   # Informe de investigación (Fase 1)
│   ├── Fase_1_Mensajero_WebRTC.tex   # Código fuente LaTeX del informe
│   └── uml/                          # Fuentes de los diagramas UML (componentes, despliegue, secuencia)
├── BITACORA.md                       # Registro cronológico de sesiones, problemas y soluciones
└── README.md                         # Documentación general del repositorio
