# Mensajero WebRTC de dos personas

Laboratorio de Sistemas Distribuidos de la Universidad Tecnológica de Pereira. Dos personas pueden conversar por texto, hacer una videollamada y enviarse archivos desde el navegador. El despliegue probado usa un Mac como anfitrión y un teléfono Android conectado a la misma Wi-Fi.

- **David Leonardo Aguirre Sanchez**

---

## Cómo funciona

Cada participante abre una ruta distinta. Caddy dirige `/a/` al servicio `nodo-a` y `/b/` a `nodo-b`. Ambos ejecutan el mismo servidor Node.js. A inicia el enlace WebSocket hacia `ws://nodo-b:3000/peer` y B responde por esa misma conexión. Así los nodos anuncian la presencia de cada navegador y reenvían las ofertas, respuestas y candidatos ICE.

Cuando se establece la conexión WebRTC, los navegadores intercambian audio y video, texto por el canal `chat` y archivos por el canal `archivos`. La llamada se inicia después de conectar el chat. Al colgar se liberan la cámara y el micrófono y se puede seguir escribiendo.

---

## Estado del proyecto

- [x] **Fase 1: Investigación y arquitectura** — Informe técnico en PDF, justificación de tecnologías y diagramas UML.
- [x] **Fase 2: Primer avance sin interfaz** — Despliegue reproducible de los dos nodos, red virtual con resolución por nombre y señalización demostrable desde consola.
- [x] **Fase 3: Interfaz, medios y archivos** — Interfaz web con chat, videollamada bidireccional, control de micrófono/cámara, transferencia de archivos (≥ 20 MB) y manejo de errores.
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
```
---

## Requisitos y puertos

- Docker Desktop en ejecución y Docker Compose disponible. La imagen instala Node.js y las dependencias a partir de `package-lock.json`.
- Para la prueba entre dispositivos, ambos deben estar en una Wi-Fi que permita la comunicación entre sus clientes. Para la llamada se requieren cámara, micrófono y permiso del navegador.
- Ejecutar los comandos desde la carpeta que contiene `docker-compose.yml`.

| Acceso | Puerto y función |
|---|---|
| Navegador del anfitrión | `127.0.0.1:8080` → `proxy:80`. Entrada HTTP local. |
| Navegador en la Wi-Fi | `8443` → `proxy:443`. Entrada HTTPS verificada en Android, incluida la señalización WSS. También se configuró el puerto 443 del anfitrión. |
| Servicios Docker | TCP 3000 dentro de la red bridge. Caddy y los nodos se encuentran por nombre de servicio. |
| Tráfico entre navegadores | ICE selecciona los puertos del enlace WebRTC para medios y datos. |

---

## Arranque y acceso

1. Consultar la dirección IPv4 de la Wi-Fi del Mac y asignarla a `LAN_IP` en el servicio `proxy` de `docker-compose.yml`. La prueba documentada usó `192.168.101.7`. Si se cambia de red, actualizar el valor.
2. Construir la imagen y arrancar los servicios:

   ```bash
   docker compose up --build -d
   docker compose ps
   ```

   Deben aparecer `nodo-a`, `nodo-b` y `proxy` en ejecución.

3. **Para probar en un solo Mac**, abrir `http://localhost:8080/a/` y `http://localhost:8080/b/` en dos pestañas.
4. **Para probar con Android**, abrir A en el Mac. Exportar desde el Mac el certificado raíz público de la instancia de Caddy y validar la ruta de B:

   ```bash
   docker compose cp proxy:/data/caddy/pki/authorities/local/root.crt ~/Downloads/mensajero-root.crt
   IP_MENSAJERO=$(docker compose exec -T proxy printenv LAN_IP)
   curl --noproxy '*' --cacert ~/Downloads/mensajero-root.crt -sS -o /dev/null -w 'HTTP %{http_code}\n' "https://$IP_MENSAJERO:8443/b/"
   ```

   El resultado esperado es `HTTP 200`. Transferir únicamente `mensajero-root.crt` desde el Mac al teléfono. En Ajustes de Android, buscar **Instalar un certificado → Certificado de CA** e instalar la raíz del laboratorio en el perfil que usa Chrome. Caddy conserva la autoridad en el volumen `caddy_data`.

5. Cerrar cualquier pestaña o consola que esté usando B en el Mac. En Android, abrir `https://IP-DEL-MAC:8443/b/`, sustituyendo el marcador por la IP real. Mantener la barra final en ambas rutas. Cada nodo admite un cliente a la vez.

---

## Uso y verificación

| Función | Procedimiento y resultado esperado |
|---|---|
| Presencia | Abrir A y después B. Ambos muestran al otro participante conectado antes de iniciar el chat. Al cerrar B, A indica que se desconectó. |
| Chat | Pulsar **Conectar chat WebRTC** en un extremo. Cuando el canal esté abierto en ambos, enviar un texto desde A y responder desde B. |
| Videollamada | Pulsar **Llamar** en A y **Aceptar** en B. Autorizar cámara y micrófono. Probar silenciar, apagar cámara y colgar. El chat permite seguir conversando. |
| Permiso denegado | Denegar el permiso al intentar llamar. La interfaz informa del problema. Para repetir la llamada, volver a habilitar el permiso en el sitio. |
| Archivos | Elegir un archivo y pulsar **Enviar archivo**. El emisor muestra bytes encolados. El receptor compara tamaño y SHA-256 antes de habilitar la descarga y confirmar la entrega. El audio y video compatibles se reproducen en la página. |
| Interrupción | Marcar **Ralentizar el envío** y enviar un archivo de 20 MiB. Cerrar la pestaña emisora mientras aumenta el porcentaje en el receptor. Debe aparecer **Recepción interrumpida** con el porcentaje alcanzado. Recargar ambos extremos y reconectar para repetir. |

Para crear el archivo de prueba en macOS:

```bash
mkfile 20m ~/Downloads/prueba-mensajero-20MiB.bin
```

La recepción completa de ese archivo debe indicar **20 971 520 bytes verificados**. El 100 % encolado en el emisor precede a la confirmación de integridad que envía el receptor.

---

## Demostración por consola

Cerrar las pestañas del mensajero y abrir dos terminales. Ejecutar en la primera:

```bash
docker compose exec nodo-a node cliente.js
```

Ejecutar en la segunda:

```bash
docker compose exec nodo-b node cliente.js
```

Enviar un texto desde A y responder desde B. En una tercera terminal, ejecutar `docker compose logs nodo-a nodo-b`. El identificador de un mismo mensaje aparece como **enviado** en origen y **recibido** en destino. Esta prueba recorre el enlace entre servidores. Escribir `/salir` en ambas consolas para liberar los nodos.

---

## Incidencias conocidas y cierre

- **Reinicio de conexión en el puerto 443.** En la red probada, el acceso por IP a 443 falló. En 8443 se obtuvo HTTP 200 y Android pudo conectarse. Para consultar Caddy en tiempo real, ejecutar `docker compose logs --tail=30 -f proxy`.
- **Chrome muestra ERR_CERT_AUTHORITY_INVALID.** Verificar que Android confía en la raíz exportada del proxy activo. Para identificarla en el Mac, ejecutar `openssl x509 -in ~/Downloads/mensajero-root.crt -noout -subject -fingerprint -sha256`.
- **Archivos grandes.** La implementación calcula SHA-256 en memoria. En una prueba con un instalador de unos 500 MB, el emisor permaneció en 0 % encolado. La transferencia verificada fue la de 20 MiB.
- **Cierre del laboratorio.** Ejecutar `docker compose down`. El volumen de Caddy conserva los datos necesarios para volver a usar la misma autoridad local.