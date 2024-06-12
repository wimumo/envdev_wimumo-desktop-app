/* Funciones de reroute */

var reruteoEnabled = false;
//var targetIP = '127.0.0.1';
//var targetPort = 4559;

function isValidIP_ClientSide(ip) {
    const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipPattern.test(ip);
}

function isValidPort_ClientSide(port) {
    const portNumber = parseInt(port, 10);
    return Number.isInteger(portNumber) && portNumber >= 0 && portNumber <= 65535;
}

function toggleButton(bool){
    if(bool){
        document.getElementById("rerouteEN").style.backgroundColor = "red";
        document.getElementById("rerouteEN").innerText = "Reroute OFF";
    } else {
        document.getElementById("rerouteEN").style.backgroundColor = ""; //original
        document.getElementById("rerouteEN").innerText = "Reroute ON";
    }
    
}

function ipcSend_toggleReroute(ip, port){
    const data = {
        activate: reruteoEnabled,
        ip: ip,
        port: port
    };
    
    window.api.send('toggle-reruteo', data);

}

//Constantes de index.html
const ipInput = document.getElementById("reroute_ip");
const portInput = document.getElementById("reroute_port");

const ipError = document.getElementById('ip_error');
const portError = document.getElementById('port_error');


function habilitarReruteo() {

    // En caso de que el reroute ya este activado, entonces se desactiva
    if (reruteoEnabled) { 

        reruteoEnabled = false;
        ipcSend_toggleReroute("0.0.0.0", 0);

        ipInput.disabled = false; 
        portInput.disabled = false;
        toggleButton(reruteoEnabled);

        document.getElementById("rerouter_dialog_p").textContent = "Reroute OFF"
        return;
    }

    //De otra manera se decide si activar el reroute
    var message = "";
    var valid = true;

    var ip = ipInput.value;
    var port = portInput.value;

    if (isValidIP_ClientSide(ip)) {
        message += "IP valida. "
        ipError.style.display = 'none';
    } else {
        message += "IP Invalida. "
        valid = false;
        ipError.style.display = 'inline'; // Mesaje de error IP
    }

    if (isValidPort_ClientSide(port)) {
        message += "Puerto valido. "
        portError.style.display = 'none';
    } else {
        message += "Puerto Invalido. "
        valid = false;
        portError.style.display = 'inline'; // Mesaje de error Puerto
    }

    if (valid) {

        reruteoEnabled = true;
        ipcSend_toggleReroute(ip, port);

        ipInput.disabled = true; 
        portInput.disabled = true;
        toggleButton(reruteoEnabled)

        message += "Reroute: " + reruteoEnabled;

    } 
    
    document.getElementById("rerouter_dialog_p").textContent = message // Para DEBUG, Eliminar despues
}


module.exports = {habilitarReruteo}