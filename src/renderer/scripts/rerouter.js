/* Funciones de reroute */

/* Cantidad de direcciones objetico dinamicas. */
const maxCount = 10;
const minCount = 1;
var cantidad_dir = 1;

const cantInput = document.getElementById('cant_direcciones');
const cantError = document.getElementById('cant_direcciones_error');

function updateFields() {
    /* Se encarga de actuslizar la cantidad de campos para ingresar IP:Puerto. Se llama cada vez que cambia la cantidad. */
    const container = document.getElementById('ip_port_container');
    const count = parseInt(cantInput.value);

    // Clear previous input fields
    //container.innerHTML = '';

    // Valor incorrecto
    if (isNaN(count) || count < minCount || count > maxCount) {
        cantError.style.display = 'inline';
        return;
    } else {
        cantError.style.display = 'none';
    }

    // Cantidad no cambio
    if (count === cantidad_dir) return;

    // Cantidad disnminuyo. Eliminar extras.
    if (count < cantidad_dir) {

        for (let i = count + 1; i <= cantidad_dir; i++) {

            const indexIpPortContainer = document.getElementById(`ip_port_container_${i}`);
            indexIpPortContainer.innerHTML = '';
            container.removeChild(indexIpPortContainer);

        }

        cantidad_dir = count;

    }

    // Cantidad aumento. Agregar inputs.
    if (count > cantidad_dir) {

        for (let i = cantidad_dir + 1; i <= count; i++) {

            // Nuevo Div
            const indexIpPortContainer = document.createElement('div');
            indexIpPortContainer.id = `ip_port_container_${i}`;

            // Separator add
            const separator = document.createElement('hr');
            separator.className = "separator";
            indexIpPortContainer.appendChild(separator);

            // Title add
            const title = document.createElement('em');
            title.innerText = `Direccion objetivo ${i}`;
            indexIpPortContainer.appendChild(title);

            indexIpPortContainer.appendChild(document.createElement('br'));
            indexIpPortContainer.appendChild(document.createElement('br'));

            // IP label add
            const ipLabel = document.createElement('label');
            ipLabel.setAttribute('for', `reroute_ip_${i}`);
            ipLabel.innerText = 'IP:';
            ipLabel.className = "inputLabel";
            indexIpPortContainer.appendChild(ipLabel);

            const ipInput = document.createElement('input');
            ipInput.type = 'text';
            ipInput.id = `reroute_ip_${i}`;
            ipInput.name = `ip_${i}`;
            ipInput.placeholder = 'Ingresar dirección IP';
            indexIpPortContainer.appendChild(ipInput);

            const ipError = document.createElement('span');
            ipError.id = `ip_error_${i}`//ip_error_1
            ipError.className = 'inputError';
            ipError.innerText = 'Dirección IP invalida.';
            indexIpPortContainer.appendChild(ipError);

            indexIpPortContainer.appendChild(document.createElement('br'));
            indexIpPortContainer.appendChild(document.createElement('br'));

            // Port label add
            const portLabel = document.createElement('label');
            portLabel.setAttribute('for', `reroute_port_${i}`);
            portLabel.innerText = 'Port:';
            portLabel.className = "inputLabel";
            indexIpPortContainer.appendChild(portLabel);

            const portInput = document.createElement('input');
            portInput.type = 'text';
            portInput.id = `reroute_port_${i}`;
            portInput.name = `port_${i}`;
            portInput.placeholder = 'Ingresar numero de puerto';
            indexIpPortContainer.appendChild(portInput);

            const portError = document.createElement('span');
            portError.id = `port_error_${i}` //port_error_1
            portError.className = 'inputError';
            portError.innerText = 'Numero de puerto invalido.';
            indexIpPortContainer.appendChild(portError);

            indexIpPortContainer.appendChild(document.createElement('br'));
            indexIpPortContainer.appendChild(document.createElement('br'));

            // Add to container
            container.appendChild(indexIpPortContainer);
        }

        // Actualizar valor de la cantidad de direcciones
        cantidad_dir = count;

    }

}

/* --------------------------------------------------------------------*/
// Funciones para habilitar reruteo 

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

const reroute_button = document.getElementById("rerouteEN");
function toggleButton(bool) {
    if (bool) {
        reroute_button.style.backgroundColor = "red";
        reroute_button.innerText = "Reroute OFF";
    } else {
        reroute_button.style.backgroundColor = ""; //original
        reroute_button.innerText = "Reroute ON";
    }

}

function toggleInputAvailability(ipPortPairs, bool){
    cantInput.disabled = bool;

    ipPortPairs.forEach(pair => {
        console.log(`IP: ${pair.ipInput}, Port: ${pair.portInput}`);
        pair.ipInput.disabled = bool;
        pair.portInput.disabled = bool;
    });
}

function ipcSend_toggleReroute(ipPortPairsInputs) {
    const ipPortPairs = [];
    ipPortPairsInputs.forEach(pair => {
        const ip = pair.ipInput.value;
        const port = pair.portInput.value;
        ipPortPairs.push({ ip, port });
    })

    const data = {
        activate: reruteoEnabled,
        ipPortPairs: ipPortPairs
        //ip: ip,
        //port: port
    };

    window.api.send('toggle-reruteo', data);

}

/* --------------------------------------------------------------------*/
// Habilitar reruteo

//Constantes de index.html
//const ipInput = document.getElementById("reroute_ip");
//const portInput = document.getElementById("reroute_port");

//const ipError = document.getElementById('ip_error');
//const portError = document.getElementById('port_error');

function habilitarReruteo() {

    // Get all IP:Port pairs
    const ipPortPairsInputs = []; // [{ipInput, portInput, ipError, portError},{ipInput, portInput, ipError, portError}] comienza en 1!

    for (let i = 1; i <= cantidad_dir; i++) {
        const ipInput = document.getElementById(`reroute_ip_${i}`);
        const portInput = document.getElementById(`reroute_port_${i}`);
        const ipError = document.getElementById(`ip_error_${i}`);
        const portError = document.getElementById(`port_error_${i}`);
        ipPortPairsInputs.push({ ipInput, portInput, ipError, portError });
    }


    // En caso de que el reroute ya este activado, entonces se desactiva
    if (reruteoEnabled) {

        reruteoEnabled = false;
        ipcSend_toggleReroute([]);

        //ipInput.disabled = false;
        //portInput.disabled = false;
        toggleInputAvailability(ipPortPairsInputs, false)

        toggleButton(reruteoEnabled);

        document.getElementById("rerouter_dialog_p").textContent = "Reroute OFF"
        return;
    }

    //De otra manera se decide si activar el reroute
    var message = "";
    var valid = true;

    //var ip = ipInput.value;
    //var port = portInput.value;

    //validaciones
    ipPortPairsInputs.forEach(pair => {

        if (isValidIP_ClientSide(pair.ipInput.value)) {
            message += "IP valida. "
            pair.ipError.style.display = 'none';
        } else {
            message += "IP Invalida. "
            valid = false;
            pair.ipError.style.display = 'inline'; // Mesaje de error IP
        }

        if (isValidPort_ClientSide(pair.portInput.value)) {
            message += "Puerto valido. "
            pair.portError.style.display = 'none';
        } else {
            message += "Puerto Invalido. "
            valid = false;
            pair.portError.style.display = 'inline'; // Mesaje de error Puerto
        }


    });

    /*if (isValidIP_ClientSide(ip)) {
        message += "IP valida. "
        ipError.style.display = 'none';
    } else {
        message += "IP Invalida. "
        valid = false;
        ipError.style.display = 'inline'; // Mesaje de error IP
    }*/

    /*if (isValidPort_ClientSide(port)) {
        message += "Puerto valido. "
        portError.style.display = 'none';
    } else {
        message += "Puerto Invalido. "
        valid = false;
        portError.style.display = 'inline'; // Mesaje de error Puerto
    }*/

    if (valid) {

        reruteoEnabled = true;

        //ipcSend_toggleReroute(ip, port);
        ipcSend_toggleReroute(ipPortPairsInputs);

        //ipInput.disabled = true;
        //portInput.disabled = true;
        toggleInputAvailability(ipPortPairsInputs, true)

        toggleButton(reruteoEnabled)

        message += "Reroute: " + reruteoEnabled;

    }

    document.getElementById("rerouter_dialog_p").textContent = message // Para DEBUG, Eliminar despues
}


module.exports = { habilitarReruteo, updateFields }