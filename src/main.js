const { app, BrowserWindow, ipcMain } = require('electron');
const { networkInterfaces } = require('os');
const http = require('http');
const WebSocketServer = require('websocket').server;
const osc = require('node-osc');
const path = require('path');

// Puerto que escucha
const listeningPort = 4560; //4560;

// Puerto de redireccion
var targetPort = 0; // 4559 ELIMINAR DESPUES
var targetAddress = '127.0.0.1'; // ELIMINAR DESPUES
var redirectOSC = false; // ELIMINAR DESPUES

// Cliente para redireccion
var oscClient = null; //new osc.Client(targetAddress, targetPort);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line global-require
if (require('electron-squirrel-startup')) {
  app.quit();
}


/*
*    Ventana Electron 
*/

var mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // DEBUG
  //mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  app.on('window-all-closed', () => {
      oscServer.close();
      if (oscClient) oscClient.close(); // NEW. Elimina el cliente que redirecciona los mensajes OSC si fue usado.
      if (process.platform !== 'darwin') {
        app.quit();
      }
    }
  );


  /*
  *   IPC messages 
  */

  ipcMain.on('get-iplocal', (event, arg) => {
    /* Notificación de IP local a página */

    const nets = networkInterfaces();
    const results = [];

    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          results.push(net.address);
        }
      }
    }
    mainWindow.webContents.send('iplocal', results);
  });

  ipcMain.on('toggle-reruteo', (event, data) => {
    /* Activa y desactiva el reruteo de los mensajes OSC a otra direccion. */

    const { activate, ip, port} = data;

    if (activate === true) {

      console.log(`Toggle reruteo ON. Direccion objetivo: ${ip}:${port}.`);

      targetAddress = ip;
      targetPort = port;

      if ( oscClient === null ) {
        oscClient = new osc.Client(targetAddress, targetPort);
      }

      redirectOSC = true;
      console.log('OSC redirection started.');

    } else {

      console.log(`Toggle reruteo OFF.`);

      redirectOSC = false;
      console.log('OSC redirection stopped.');

    }

  });


  /*
  *   OSC 
  */

  var nClients = 0;

  const oscServer = new osc.Server(listeningPort, '0.0.0.0', () => {
    console.log('OSC Server is listening');
  });

  oscServer.on('bundle', function (bundle) {

    //------------------------------------------------------------------- Redireccion Bundles
    if (redirectOSC) {
      //console.log('Received OSC bundle:', bundle);
      forwardMessage(bundle);
    }
    //-------------------------------------------------------------------


    bundle.elements.forEach((element, i) => {
      mainWindow.webContents.send('osc', element);

      /* Envío de datos a través de WS */
      if (element[0].substring(10, 18) == "/env/ch1" && element.length == 2) {
        var s = "1," + element[1];
        if (wsServer != null && wsServer.connections.length > 0) {
          wsServer.connections[0].sendUTF(s)
          nClients++
        }
      }
      if (element[0].substring(10, 18) == "/env/ch2" && element.length == 2) {
        var s = "2," + element[1];
        if (wsServer != null && wsServer.connections.length > 0) {
          wsServer.connections[0].sendUTF(s)
          nClients++
        }
      }

      

    });

  });

  oscServer.on('message', function (msg) {

    //------------------------------------------------------------------- Redireccion Mensajes
    if ( redirectOSC ) {
      /*console.log('Received OSC message:'); // , msg
      for (let i = 0; i < msg.length; i++) {
        console.log(`Index: ${i}, Value: ${msg[i]}`);
      }*/
      forwardMessage(msg);
    }
    //------------------------------------------------------------------- 

    mainWindow.webContents.send('osc', msg);
  });

  function forwardMessage(message) {
    /* Funcion que rerutea los mensajes y bundles. Solo deberia ser llamada cuando la redireccion esta activada. */

    if (message.oscType === 'bundle') { // Los mensajes tienen "osctype = undefined"

      var bundle = new osc.Bundle(message.timetag);
  
      message.elements.forEach(element => {
        bundle.append(element);
      });
  
      oscClient.send(bundle);
      //console.log('Forwarded OSC bundle:', message);
  
    } else {
      
      // El mensaje incluye la direccion a la que se dirigia. Se intercambia por la nueva.
      message[3] = targetAddress; 
      message[4] = targetPort;  

      console.log('Forwarded OSC message:', message);
      oscClient.send(message); // message no tiene address o args. Es un array de strgings.
      
    }
  }


  /*
  *   Websockets 
  */

  var server = http.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
  });

  server.listen(80, function () {
    console.log((new Date()) + ' Server is listening on port 80');
  });

  const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
  });

  function originIsAllowed(origin) {
    return true;
  }

  wsServer.on('request', function (request) {
    /* Maneja todos los mensajes que van desde el main server hasta el web server. */

    if (!originIsAllowed(request.origin)) {
      // Nos aseguramos de solo aceptar conexiones de origenes permitidos.
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    let connection = request.accept(request.requestedProtocols[0], request.origin);
    
    console.log((new Date()) + ' Connection accepted.');
    
    connection.on('message', function (message) {
      if (message.type === 'utf8') {
        //console.log('Received Message: ' + message.utf8Data);
        connection.sendUTF(message.utf8Data);
      }
      else if (message.type === 'binary') {
        //console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        connection.sendBytes(message.binaryData);
      }
    });

    connection.on('close', function (reasonCode, description) {
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });

  });

});



