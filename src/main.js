/* Proceso Main de la aplicacion WIMUMO DESKTOP.

Este proceso se encarga de crear la ventana de Electron y trata con la logica para cerrarla correctamente.
Tambien se definen en este proceso todos los servidores y clientes OSC que reciven y mandan señales del 
dispositivo WIMUMO, y se mantiene una comunicacion con la ventana de Electron para poder mostrar y tratar las señales. */

const { app, BrowserWindow, ipcMain, Menu  } = require('electron');
const { networkInterfaces } = require('os');
const http = require('http');
const WebSocketServer = require('websocket').server;
const fs = require('fs'); // file system
const ping = require('ping');
const osc = require('node-osc');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line global-require
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Path para guardar datos de configuracion en Disco
const userDataPath = app.getPath('userData');
const configFilePath = userDataPath + "/configRedireccion.txt"
const optionsFilePath = userDataPath + "/options.txt"

// Puerto en el que se esperan los daztos del dispositivo WIMUMO. Por defecto [ 4560 ]
const listeningPort = 4560;

// Variables para detener el proceso cuando se dejan de recibir mensajes
const TIMEOUT_THRESHOLD = 3000; // 3 segundos que espera entre mensajes antes de asumir que se desconecto
let lastReceivedTime = null;
let oscConnectionInProgress = false;
let checkDataIntervalId = null;

// -- GUARDAR CONFIGURACION
// Variable que guarda el estado de las direccion de redireccion, para despues guardarlo en Disco.
let dataRedirectConfig = [];
// Variable que guarda las opciones
let dataOptions = [];


// Reroute // Comunmente usadas [ 4559 purrdata ]  [ 127.0.0.1 loopback ]
const rerouteAddresses = []; // ejemplo = [{ ipAddress: '127.0.0.1', port: 4559 }]
var redirectOSC = false;

// Array de clientes para redireccion. Se definen y usan segun sea necesario.
var oscClients = [];


/* 
*   Leer archivos de configuracion en startup
*/

function readFileAtStartup() {

  // Leer opciones guardadas
  fs.readFile(optionsFilePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Un error ocurrio leyendo el archivo:', err);
      return;
    }

    // Do something with the file data
    console.log('File data:', data);

    // JSON file parseado
    try {
      const options = JSON.parse(data);
      dataOptions = options; // Guardar datos parseados
      console.log('Parsed config:', dataOptions);
    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
    }

  } )

  // Leer configuracion de redireccion
  fs.readFile(configFilePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Un error ocurrio leyendo el archivo:', err);
      return;
    }

    // Do something with the file data
    console.log('File data:', data);
    
    // JSON file parseado
    try {
      const config = JSON.parse(data);
      dataRedirectConfig = config; // Guardar datos parseados
      console.log('Parsed config:', dataRedirectConfig);
    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
    }


  });

}




/* 
*   Mantenimiento de coneccion OSC
*/

// Funcion que se llama cada vez que hay una conexion con el servidor
function oscConnectionAlive() {
  // Guarda el tiempo en que se recive
  lastReceivedTime = Date.now();

  // Si es el primer mensaje recivido entonces debe empezar el timer para terminr conexion
  if (!oscConnectionInProgress) {
    checkDataIntervalId = setInterval(checkForStoppedData, 1000); // Checkea si se dejo de recivir mensajes cada segundo
    oscConnectionInProgress = true;
  }
}

// Funcion que checkea si se han dejado de recibir mensajes
function checkForStoppedData() {
  const currentTime = Date.now();

  if (lastReceivedTime === null) {
    console.log("No se han recivido datos todavia.");
  } else {
    const timeSinceLastMessage = currentTime - lastReceivedTime;

    if (timeSinceLastMessage >= TIMEOUT_THRESHOLD) {

      oscConnectionInProgress = false
      console.log("Se ha dejado de recivir datos de la conexion OSC.");
      clearInterval(checkDataIntervalId); // detiene la funcion de ser llamada mas veces

      mainWindow.webContents.send('osc', 'CONNECTION LOST');

    } else {
      console.log(`Last message received ${timeSinceLastMessage / 1000} seconds ago.`);
    }

  }
}

function closeOscClients() {

  oscClients.forEach(client => {
    if( client ) {
      client.close();
    }
  })
  
}




/*
*    Ventana Electron, maneja todo el comportamiento dependiente en la ventana
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

  // Esconder el menu de opciones de la pantalla Electron. "File", "Edit", etc
  Menu.setApplicationMenu(null);

  // Manda los datos por defecto 
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('savedRedirectConfig', dataRedirectConfig);
    mainWindow.webContents.send('savedOptions', dataOptions);
  });

  // DEBUG //mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  // Antes de compenzar la app lee los datos de configuracion guardados si hay
  readFileAtStartup();

  // Crea la pantalla principal
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  app.on('window-all-closed', () => {
    oscServer.close();
    closeOscClients();

    // Guardar configuracion de redirecciones en disco
    fs.writeFileSync(configFilePath, JSON.stringify(dataRedirectConfig)); 
    fs.writeFileSync(optionsFilePath, JSON.stringify(dataOptions)); 
    // --------------------------------------

    if (process.platform !== 'darwin') {
      app.quit();
    }
  }
  );


  /*
  *   IPC messages 
  */

  // Get Ip Local
  ipcMain.on('get-iplocal', (event, arg) => {
    /* Notificación de IP local a página, se utiliza en la seccion de intruccion/guia de uso. */

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

  // Guardar Configuracion de señales de redireccion
  ipcMain.on('save-config', async(event, data) => {
    /* Funcion que se encarga de guardar la configuracion del rerouter */ 
    /* El parametro Data es un array de diccionarios [ {cantidad_dir}, { ip, port, filter }, { ip, port, filter } ... ] */
    
    dataRedirectConfig = data;
    console.log(`Configuracion de redireccion guardada.`)

  });

  // Guardar Opciones
  ipcMain.on('save-options', async(event, data) => {
    /* Funcion que se encarga de guardar la configuracion de las opciones */ 
   
    dataOptions = data;
    console.log(`Configuracion de opciones guardada.`)

  });

  // Ping IP
  ipcMain.on('ping-ip', async (event, data) => {
    /* Manda un ping a una ip para asegurarse de que esta disponible para la redireccion. */
    /* Se utiliza en la seccion de redireccion, como parte del proceso de validacion de una direccion IP. */
    /* Parametro data se define como {ip: ip, posicion: posicion}; */

    console.log(`Ping ip ${data.ip} - Checkear si la ip esta disponible `);

    try {

      await ping.promise.probe(data.ip).then(function (res) {
        const result = `Ping to ${res.host} [${res.alive ? 'Success' : 'Fail'}]
        Time: ${res.time}ms
        Packets: sent = ${res.packetLoss}, received = ${res.numericHost}, loss = ${res.packetLossPercentage}%`;

        console.log(result);

        const newData = {
          resultado: res,
          posicion: data.posicion
        };

        mainWindow.webContents.send('ping-result', newData);
      })


    } catch (error) {

      console.error('Ping error:', error);

      const data = {
        resultado: 'Ping failed',
        posicion: posicion
      };

      mainWindow.webContents.send('ping-result', data); // { error: 'Ping failed' }

    }
  });

  // DEPRECATED // Activa la funcion de reruteo para todas las direcciones configuradas la mismo tiempo
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

  // Activa el reruteo a UNA direccion espeifica de redireccion
  ipcMain.on('Add-RerouteAddress', (event, data) => {
    /* Activa el reruteo de los mensajes OSC a otra direccion. */
    const { posicion, ip, port, filter } = data;

    if (!rerouteAddresses[posicion]) { // Se asegura de que no este activada ya esta direccion de redireccion.

      console.log(`Agregar direccion objetivo:`);
      console.log(` - ${ip}:${port}. Filtro: ${filter}`);

      rerouteAddresses[posicion] = ({ ipAddress: ip, port: port, filter: filter });

      oscClients[posicion] = new osc.Client(rerouteAddresses[posicion].ipAddress, rerouteAddresses[posicion].port);
      console.log('OscClient ' + posicion + ' created for ip:ports: ' + rerouteAddresses[posicion].ipAddress + ':' + rerouteAddresses[posicion].port);

      redirectOSC = true;
      console.log('OSC redirection started.');

    } else {
      console.log(`La posicion de redireccion ya esta ocupada. Esto no deberia de poder ocurrir.`);
    }

  });

  // Desactiva el reruteo a UNA direccion espeifica de redireccion
  ipcMain.on('Remove-RerouteAddress', (event, data) => {
    /* Desactiva el reruteo de los mensajes OSC a otra direccion. */
    const { posicion, ip, port, filter } = data;

    console.log(`Remove direccion objetivo.`);
    console.log(` - ${ip}:${port}. Filtro: ${filter}`);

    if (rerouteAddresses[posicion].ipAddress == ip && rerouteAddresses[posicion].port == port && rerouteAddresses[posicion].filter == filter) {

      rerouteAddresses[posicion] = null;
      oscClients[posicion].close();
      oscClients[posicion] = null;

      console.log('Direccion removida.');
    } else console.log('Hubo un error para remover direccion de redireccion.');

    const allNull = rerouteAddresses.every(item => !item);
    if (allNull) {
      redirectOSC = false;
      console.log('OSC redirection stopped.');
    }

  });




  /*
  *   OSC mensajes
  */

  var nClients = 0; // Cantidad de clientes de redireccion

  const oscServer = new osc.Server(listeningPort, '0.0.0.0', () => {
    console.log('OSC Server is listening');
  });

  oscServer.on('bundle', function (bundle) {

    oscConnectionAlive();

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

    oscConnectionAlive();

    //------------------------------------------------------------------- Redireccion Mensajes
    if (redirectOSC) {
      forwardMessage(msg);
    }
    //------------------------------------------------------------------- 

    mainWindow.webContents.send('osc', msg);
  });

  // Redireccion
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

            // DEBUG // console.log('Forwarded OSC message:', message);
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
    // Estos filtros ser deberian cambiar si es que lo que manda el WIMUMO cambis en algun monmento
    // Raw simplemente elimina los mensajes env. Y ch1 solo elimina los mensajes ch2.
    switch (filter) {
      case 'raw_signals_only':
        // Manda todos los mensajes, menos los que incluyan "/env/"
        bundle.elements = bundle.elements.filter(element => !String(element.address).includes('/env/'));
        break;

      case 'env_signals_only':
        // Manda todos los mensajes, menos los que incluyan "/raw/"
        bundle.elements = bundle.elements.filter(element => !String(element.address).includes('/raw/'));
        break;

      case 'channel_1_only':
        // Manda todos los mensajes, menos los que incluyan "/ch2"
        bundle.elements = bundle.elements.filter(element => !String(element.address).includes('/ch2'));
        break;

      case 'channel_2_only':
        // Manda todos los mensajes, menos los que incluyan "/ch1"
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



