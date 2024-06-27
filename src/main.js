const { app, BrowserWindow, ipcMain } = require('electron');
const { networkInterfaces } = require('os');
const http = require('http');
const WebSocketServer = require('websocket').server;
const osc = require('node-osc');
const path = require('path');

// Puerto que escucha
const listeningPort = 4560; //4560;

// Reroute
//var targetPort = 0;                 // 4559 purrdata
//var targetAddress = '127.0.0.1';    // 127.0.0.1 loopback

const rerouteAddresses = []; // ej = { ipAddress: '127.0.0.1', port: 4559 }
var redirectOSC = false;

// Clientes para redireccion
//var oscClient = null; //new osc.Client(targetAddress, targetPort);
var oscClients = [];
function closeOscClients() {
  oscClients.forEach(client => {
    client.close();
  })
}

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
    closeOscClients();
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
    const { activate, ipPortPairs } = data;

    if (activate === true) {
      
      console.log(`Toggle reroute ON. Direcciones objetivo:`);

      ipPortPairs.forEach(pair => {
        console.log(` - ${pair.ip}:${pair.port}. Filtro: ${pair.filter}`);
        rerouteAddresses.push({ ipAddress: pair.ip, port: pair.port, filter: pair.filter });
      })

      for (let i = 0; i < rerouteAddresses.length; i++) {

        oscClients[i] = new osc.Client(rerouteAddresses[i].ipAddress, rerouteAddresses[i].port);
        console.log('OscClient ' + i + ' created for ip:ports: ' + rerouteAddresses[i].ipAddress + ':' + rerouteAddresses[i].port);

      }

      redirectOSC = true;
      console.log('OSC redirection started.');

    } else {

      console.log(`Toggle reroute OFF.`);

      redirectOSC = false;

      // Vaciar array de direcciones.
      rerouteAddresses.length = 0;

      // Cerrar clientes y eliminarlos del array.
      closeOscClients();
      oscClients.length = 0;

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
    if (redirectOSC) {
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
    try {

      if (message.oscType === 'bundle') { // Los mensajes tienen "osctype = undefined"

        try {

          var bundle = new osc.Bundle(message.timetag);

          message.elements.forEach(element => {
            bundle.append(element);
          });

          rerouteAddresses.forEach((pair, index) => {
            console.log(`Index: ${index}, IP Address: ${pair.ipAddress}, Port: ${pair.port}, Filter: ${pair.filter}`);

            const bundleCopy = deepCopy(bundle); // Create a deep copy of the bundle

            
            filterBundle(bundleCopy, pair.filter);
            console.log(bundleCopy);
            console.log('-----------');

            oscClients[index].send(bundleCopy);

          });
          
          //console.log('Forwarded OSC bundle:', message);

        } catch (error) {
          console.error('Error Bundling:', error.message);
        }

      } else {

        try {

          rerouteAddresses.forEach((pair, index) => {
            //console.log(`Index: ${index}, IP Address: ${pair.ipAddress}, Port: ${pair.port}`);

            let modifiedMessage = [...message]; // Se modifica y manda una copia del mensaje original

            modifiedMessage[3] = pair.ipAddress;
            modifiedMessage[4] = pair.port;

            oscClients[index].send(modifiedMessage); //el message no tiene address o args. Es un array de strgings.

            //console.log('Forwarded OSC message:', message);
          });

        } catch (error) {
          console.error('Error Messaging:', error.message);
        }

      }

    } catch (error) {
      console.error('Error forwarding message:', error.message);
    }
  }

  function deepCopy(obj) {
    /* Se envia una copia del bundle a cada cliente, porque el cliente podria modificar la copia al enviarla. */
    return JSON.parse(JSON.stringify(obj));
  }

  function filterBundle(bundle, filter) {
    //bundle.elements.forEach(element => console.log(String(element.address) + ' / type: ' + element.address.type))
    switch (filter) {
      case 'raw_signals_only':
        bundle.elements = bundle.elements.filter(element => !String(element.address).includes('/env/'));
        break;

      case 'env_signals_only':
        bundle.elements = bundle.elements.filter(element => !String(element.address).includes('/raw/'));
        break;
      
      case 'channel_1_only':
        bundle.elements = bundle.elements.filter(element => !String(element.address).includes('/ch2'));
        break;

      case 'channel_2_only':
        bundle.elements = bundle.elements.filter(element => !String(element.address).includes('/ch1'));
        break;

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



