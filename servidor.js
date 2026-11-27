const http = require("node:http");
const { randomUUID } = require("node:crypto");
const { WebSocket, WebSocketServer } = require("ws");

const { readFileSync } = require("node:fs");
const path = require("node:path");

const nodo = process.env.NODE_ID;
const destino = process.env.REMOTE_ID;
const urlVecino = process.env.PEER_URL;

const tiposDeSenal = new Set(["data-request", "offer", "answer", "ice"]);
const protocoloWeb = "mensajero-webrtc";

let cliente = null;
let vecino = null;
let participanteRemoto = false;

function informarAlNavegador() {
  if (estaAbierto(cliente) && cliente.protocol === protocoloWeb) {
    cliente.send(JSON.stringify({
      type: "presence",
      payload: { conectado: participanteRemoto }
    }));
  }
}

function anunciarPresencia() {
  if (estaAbierto(vecino)) {
    vecino.send(JSON.stringify({
      type: "presence",
      from: nodo,
      to: destino,
      payload: {
        conectado: estaAbierto(cliente) && cliente.protocol === protocoloWeb
      }
    }));
  }
}

let esperaMs = 1000;

function estaAbierto(socket) {
  return socket?.readyState === WebSocket.OPEN;
}

function avisar(texto) {
  if (estaAbierto(cliente)) {
    cliente.send(JSON.stringify({ type: "aviso", texto }));
  }
}

function registrar(evento, mensaje) {
  console.log(JSON.stringify({
    nodo,
    evento,
    id: mensaje.id,
    texto: mensaje.payload.text
  }));
}

// Conexión de la consola con su propio nodo.
function conectarCliente(socket) {
  if (estaAbierto(cliente)) {
    socket.close(1008, "Este nodo ya tiene una consola conectada");
    return;
  }

  cliente = socket;
  avisar(`Consola conectada a ${nodo}`);
  informarAlNavegador();
  anunciarPresencia();


  socket.on("message", (datos) => {
    const texto = datos.toString().trim();
    if (!texto) return;

    if (!estaAbierto(vecino)) {
      avisar("El otro nodo está desconectado. Reintenta en un momento.");
      return;
    }
    
    if (socket.protocol === protocoloWeb) {
      let senal;
      try {
        senal = JSON.parse(texto);
      } catch {
        avisar("La señal recibida tiene un formato incorrecto.");
        return;
      }
      
      if (!senal || !tiposDeSenal.has(senal.type)) return;
      
      vecino.send(JSON.stringify({
        v: 1,
        id: randomUUID(),
        room: "lab",
        from: nodo,
        to: destino,
        type: senal.type,
        payload: senal.payload
      }));
      
      console.log(`[${nodo}] Señal enviada: ${senal.type}`);
      return;
    }

    const mensaje = {
      v: 1,
      id: randomUUID(),
      type: "probe",
      room: "lab",
      from: nodo,
      to: destino,
      payload: { text: texto }
    };

    vecino.send(JSON.stringify(mensaje));
    registrar("enviado", mensaje);
  });

  socket.on("close", () => {
    if (cliente !== socket) return;
    cliente = null;
    anunciarPresencia();
  });
}

// Enlace entre A y B. Ambos nodos usan esta misma función.
function conectarVecino(socket) {
  if (estaAbierto(vecino)) {
    socket.close(1008, "Ya existe un enlace entre nodos");
    return;
  }

  vecino = socket;
  anunciarPresencia();
  console.log(`[${nodo}] Enlace activo con ${destino}`);

  socket.on("message", (datos) => {
    let mensaje;
    try {
      mensaje = JSON.parse(datos.toString());
    } catch {
      return;
    }

    if (!mensaje || mensaje.from !== destino || mensaje.to !== nodo) return;
    if (mensaje.type === "presence") {
  participanteRemoto = mensaje.payload?.conectado === true;
  informarAlNavegador();
  return;
}


    if (tiposDeSenal.has(mensaje.type)) {
      if (estaAbierto(cliente) && cliente.protocol === protocoloWeb) {
        cliente.send(JSON.stringify(mensaje));
        console.log(`[${nodo}] Señal recibida: ${mensaje.type}`);
      } else {
        socket.send(JSON.stringify({
          ...mensaje,
          type: "error",
          from: nodo,
          to: destino,
          payload: { text: "Abre la pestaña del otro nodo antes de conectar." }
        }));
      }
      return;
    }

    if (mensaje.type === "error") {
      avisar(`Mensaje ${mensaje.id}: ${mensaje.payload?.text}`);
      return;
    }

    if (mensaje.type !== "probe" || typeof mensaje.payload?.text !== "string") {
      return;
    }

    registrar("recibido", mensaje);

    if (estaAbierto(cliente)) {
      cliente.send(JSON.stringify(mensaje));
    } else {
      socket.send(JSON.stringify({
        ...mensaje,
        type: "error",
        from: nodo,
        to: destino,
        payload: { text: "El nodo recibió el mensaje, pero su consola está cerrada." }
      }));
    }
  });

  socket.on("close", () => {
    if (vecino !== socket) return;
    vecino = null;
    participanteRemoto = false;
    informarAlNavegador();
    console.log(`[${nodo}] Enlace cerrado con ${destino}`);
  });
}

// Solo el nodo que tenga PEER_URL iniciará y reintentará la conexión.
function llamarAlVecino() {
  const socket = new WebSocket(urlVecino);

  socket.on("open", () => {
    esperaMs = 1000;
    conectarVecino(socket);
  });

  socket.on("error", (error) => {
    console.log(`[${nodo}] ${error.message}`);
  });

  socket.on("close", () => {
    setTimeout(llamarAlVecino, esperaMs);
    esperaMs = Math.min(esperaMs * 2, 8000);
  });
}

const pagina = readFileSync(path.join(__dirname, "public", "index.html"));

const servidor = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(pagina);
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Ruta desconocida");
});

const conexiones = new WebSocketServer({ noServer: true, maxPayload: 65536 });

servidor.on("upgrade", (req, socket, head) => {
  const esCliente = req.url === "/ws";
  const esVecino = req.url === "/peer" && !urlVecino;

  if (!esCliente && !esVecino) {
    socket.destroy();
    return;
  }

  conexiones.handleUpgrade(req, socket, head, (ws) => {
    ws.on("error", (error) => console.log(`[${nodo}] ${error.message}`));
    if (esCliente) conectarCliente(ws);
    else conectarVecino(ws);
  });
});

servidor.listen(3000, "0.0.0.0", () => {
  console.log(`[${nodo}] Escuchando en el puerto 3000`);
  if (urlVecino) llamarAlVecino();
});