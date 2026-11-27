# Bitácora del mensajero WebRTC

**David Leonardo Aguirre Sanchez** · Sistemas Distribuidos · Universidad Tecnológica de Pereira

## 19 de noviembre de 2026 · Investigación y diseño

**Tiempo dedicado** — 5 h 

Elegí desarrollar el mensajero para dos personas.

Preparé el informe de los bloques A a G con el diseño de componentes, despliegue e intercambio de mensajes. Distinguí dos recorridos que después pude demostrar por separado: el texto de prueba que atraviesa los servidores y el chat final que viaja por WebRTC.

## 24 de noviembre de 2026 · Aprobación y preparación del entorno

**Tiempo dedicado** — 30 min

Con la investigación aprobada, revisé cómo construir el avance por consola. Me faltaba Docker Desktop. Identifiqué la edición para Apple silicon a partir del chip M4 de mi Mac y preparé la instalación. La comprobación del entorno fue ejecutar un contenedor de prueba y obtener el mensaje `Hello from Docker!`, resultado que confirmé el 26 de noviembre.

## 26 de noviembre de 2026 · Dos nodos y prueba por consola

**Tiempo dedicado** — 1 h 30 min

Comprobé Docker Compose y localicé el informe en el commit `6d9b29c`. La rama local y la remota tenían un commit propio cada una. Sincronicé ambas antes de registrar el código del mensajero.

Preparé `package.json` y su archivo de bloqueo, el servidor y el cliente de consola. Verifiqué la sintaxis con Node.js en Docker. Definí una imagen común y una red bridge en Compose. A abrió una conexión hacia B por su nombre de servicio. Desde dos terminales envié un mensaje y su respuesta. Los registros mostraron el mismo identificador en el envío y la recepción de cada mensaje.

## 26 de noviembre de 2026 · Interfaz, chat, videollamada y archivos

**Tiempo dedicado** — 1 h 30 min

Abrí las rutas `/a/` y `/b/` en el Mac y comprobé, por el título de cada pestaña, a qué nodo había llegado. Primero probé el intercambio por los servidores. Después usé ese recorrido para reenviar ofertas, respuestas y candidatos ICE. Una vez abierto el canal de datos, envié mensajes de chat en ambos sentidos.

Incorporé invitación, aceptación y finalización de llamadas, junto con los controles de cámara y micrófono. La implementación reservó las pistas durante la negociación inicial. Las órdenes de llamada se enviaron por el canal de datos ya abierto. Esto permitió colgar y seguir escribiendo en el chat.

Para los archivos añadí un segundo canal, fragmentos de hasta 16 KiB, control del búfer y confirmación por tamaño y SHA-256. Probé una imagen y un archivo de 20 MiB. Separé el progreso de envío de la confirmación final, puesto que el emisor puede terminar de encolar datos antes de que el receptor verifique la copia.

## Noche del 26 al 27 de noviembre de 2026 · HTTPS entre el Mac y Android

**Tiempo dedicado** — 6 h 

Al pasar de dos pestañas a dos dispositivos, el acceso HTTP local respondía, pero la petición HTTPS a la IP Wi-Fi del Mac por el puerto 443 se reiniciaba durante la negociación TLS. Revisé los registros de Caddy y comprobé que había emitido un certificado para `192.168.101.7`. Al dirigir la conexión a `127.0.0.1` y seguir verificando el certificado para esa IP Wi-Fi, obtuve HTTP 200.

Publiqué un segundo puerto con `8443:443`. La prueba por la dirección Wi-Fi devolvió HTTP 200. En Android, Chrome mostró `ERR_CERT_AUTHORITY_INVALID`. Revisé la raíz pública de Caddy y configuré su confianza en el teléfono. Chrome abrió el nodo B sin la advertencia. No determiné la causa exacta del reinicio en 443. El puerto externo verificado para la demostración fue 8443.

Con el nodo A en el Mac y B en Android comprobé el chat, la llamada entre cámaras y micrófonos independientes y la transferencia del archivo de 20 MiB. El receptor indicó **20 971 520 bytes verificados**.

## 27 de noviembre de 2026 · Interrupción de archivos, presencia y permisos

**Tiempo dedicado** — 1 h 40 min

El archivo de 20 MiB llegaba demasiado rápido para interrumpirlo manualmente. Intenté usar el instalador de Docker de unos 500 MB, pero el porcentaje se quedó en 0 % encolado y el envío siguió ocupado. Para reproducir la interrupción de forma controlada, añadí una opción de envío lento con pausas de 250 ms cada 256 KiB.

Al cerrar la pestaña emisora, Android mostraba un fallo general de conexión y la barra quedaba congelada. Unifiqué la actualización del estado de transferencia para el cierre del canal y el fallo de la conexión WebRTC. Repetí la prueba y comprobé que el receptor mostraba la interrupción junto al porcentaje alcanzado.

Añadí avisos de presencia entre los servidores. Comprobé la transición de desconectado a conectado al abrir B, la salida al cerrar su pestaña y el regreso al abrirla de nuevo, antes de iniciar el chat. También confirmé el manejo del permiso denegado y pude reproducir los archivos de música y video directamente en el navegador.

## Apoyo de inteligencia artificial

Utilicé un asistente de IA para interpretar la guía, preparar el borrador de investigación y los diagramas, ayuda en el desarrollo de la lógica y fragmentos de código. Tambien para desarrollar hipótesis sobre el fallo HTTPS. Del mismo modo, tambien me ha ayudado para pulir mis redacciones en la bitacora y el readme
