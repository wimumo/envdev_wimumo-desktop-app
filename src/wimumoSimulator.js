/* Simuladro de señales del WIMUMO */

const osc = require('node-osc');
const x = Math.random();

let client = null;

//const client = new osc.Client('127.0.0.1', 4560); //Es mala idea deberia buscar la constante

/*client.send('/test', 123, () => {
  console.log('Message sent!');
});*/

// /wimumo020/env/ch1
// /wimumo020/env/ch2
// /wimumo020/info

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const random = Array.from({ length: 5 }, () => randomInt(100, 1000));


function simulateWIMUMO(listeningPort, ip = 'IP', targetIP = 'IP-OBJETIVO', targetPort = 'PUERTO-OBJETIVO', battery = 50) {

  client = new osc.Client('127.0.0.1', listeningPort);

  const infoSignature = '/wimumo020/info';
  const sendingBundles = true;
  const channels = 4;
  const ch1Signature = '/wimumo020/env/ch1';
  const ch2Signature = '/wimumo020/env/ch2';
  const ch3Signature = '/wimumo020/raw/ch1';
  const ch4Signature = '/wimumo020/raw/ch2';

  // Mensaje de informacion
  setInterval(() => {
    client.send(infoSignature, ip, sendingBundles, targetIP, targetPort, battery, channels, ch1Signature, ch2Signature, ch3Signature, ch4Signature, () => {
      //console.log('OSC info sent!'); // DEBUG
    });
  }, 2000);

  // Bundle
  setInterval(() => {
    const bundle = new osc.Bundle(
      new osc.Message(ch1Signature, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10),
      new osc.Message(ch2Signature, 100, 200, 300, 400, 500, 600, 0, 0, 0, 0),
      new osc.Message(ch3Signature, ...random),
      new osc.Message(ch4Signature, ...random)
    );

    client.send(bundle, () => {
      //console.log('Bundle sent!'); // DEBUG
    });
  }, 500);

}

function closeClientSimulator() {
  if (client) {
    //client._sock.close(); // No es necesario, con close funciona
    client.close();
    console.log("Closing Simulation Client!");
  }

}

module.exports.simulateWIMUMO = simulateWIMUMO;
module.exports.closeClientSimulator = closeClientSimulator;