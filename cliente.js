const readline = require("node:readline");
const { WebSocket } = require("ws");

const socket = new WebSocket("ws://127.0.0.1:3000/ws");
let terminal;

socket.on("open", () => {
  terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("Escribe un mensaje y pulsa Enter. Para salir, escribe /salir.");

  terminal.on("line", (linea) => {
    const texto = linea.trim();
    if (!texto) return;

    if (texto === "/salir") {
      terminal.close();
      return;
    }

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(texto);
    }
  });

  terminal.on("close", () => socket.close());
});

socket.on("message", (datos) => {
  const mensaje = JSON.parse(datos.toString());

  if (mensaje.type === "aviso") {
    console.log(mensaje.texto);
  } else if (mensaje.type === "probe") {
    console.log(`[${mensaje.from}] ${mensaje.payload.text} (${mensaje.id})`);
  }
});

socket.on("error", (error) => {
  console.error(`Error de conexión: ${error.message}`);
});

socket.on("close", () => {
  console.log("Conexión cerrada.");
  terminal?.close();
});