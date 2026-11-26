# Bitácora del mensajero WebRTC

## 19 de noviembre de 2026

**Fase.** Investigación y diseño de arquitectura.

**Tiempo dedicado.** 5 horas

**Trabajo de la sesión.** Todo lo referente a investigación y analisis del proyecto.Elegí concentrar el proyecto en el mensajero de dos personas. Para el avance se propongo usar dos nodos Docker en el Mac. Para la videollamada se planteo añadir un celular en la misma red Wi-Fi.

**Duda y decisión pendiente.** Tenía la duda de si hacían falta dos equipos físicos. El diseño distingue los dos servidores, que pueden ejecutarse en el Mac, de los dos clientes que se utilizarán en la demostración. La disponibilidad del segundo dispositivo y de una red adecuada queda por comprobar.

**Uso de IA.** Utilicé un asistente para interpretar la guía, contrastar fuentes, comparar opciones de demostración y elaborar un borrador del informe y de los diagramas.

## 21 de noviembre de 2026

**Tiempo dedicado.** 1 hora

**Trabajo realizado.** Edición de borrador de informe


**Uso de IA.** Solucionar problemas tecnicos con la edición en formato LaTeX local.

## 26 de noviembre de 2026

**Tiempo dedicado.** 3 horas

**Trabajo realizado.** Ejecucion de fase 2.
Contruccion y comprobacion de los dos servidores Node.js en una red Docker llamada `red-mensajero`. El servicio `nodo-a` abre una conexión WebSocket hacia `ws://nodo-b:3000/peer`. Ambos servidores usan esa conexión para intercambiar mensajes con identificador para verificar su correcto funcionamiento. Todo a traves de consola.

**Uso de IA.** Ayuda en la construccion de cliente.js y servidor.js