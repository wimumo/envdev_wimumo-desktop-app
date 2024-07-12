/* Funciones de reroute */

/* Cantidad de direcciones objetico dinamicas. */
const maxCount = 5;
const minCount = 1;
var cantidad_dir = 1;

const cantInput = document.getElementById('cant_direcciones');
const cantError = document.getElementById('cant_direcciones_error');

/* Initialice everything */
document.addEventListener("DOMContentLoaded", function () {
    initialiceFiltros();
    initialiceTextosDinamicos();
});

/* Filtros. */
const filtros = [
    { value: 'none', text: 'Ninguno' },
    { value: 'raw_signals_only', text: 'Señales crudas' },
    { value: 'env_signals_only', text: 'Envolventes' },
    { value: 'channel_1_only', text: 'Solo canal 1' },
    { value: 'channel_2_only', text: 'Solo canal 2' }
];

function initialiceFiltros() {
    // Get the select element
    const firstSelectElement = document.getElementById('filter_1');

    // Add each option to the select element
    filtros.forEach(function (option) {
        var newOption = document.createElement('option');
        newOption.value = option.value;
        newOption.text = option.text;
        firstSelectElement.appendChild(newOption);
    });
}

/* Textos dinamicos */
const errorTexts = [
    { value: 'ipError', text: 'Dirección IP inválida. Debe consistir de 4 números separados por puntos, ejemplo: "x.x.x.x".' },
    { value: 'portError', text: 'Número de puerto inválido. Debe ser un número entre 0 y 65535.' },
    { value: 'filterError', text: 'Filtro no reconocido' }
];

function findText(value) {
    return errorTexts.find(error => error.value === value).text
}

function initialiceTextosDinamicos() {
    const firstIpErrorSpan = document.getElementById("ip_error_1");
    const firstPortErrorSpan = document.getElementById("port_error_1");
    const firstFilterErrorSpan = document.getElementById("filter_error_1");

    firstIpErrorSpan.textContent = findText('ipError');
    firstPortErrorSpan.textContent = findText('portError');
    firstFilterErrorSpan.textContent = findText('filterError');
}


/* Campos dinamicos. */
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

            // Select Filter Add
            let label = document.createElement('label');
            label.setAttribute('for', `filter_${i}`);
            label.classList.add('inputLabel');
            label.textContent = 'Filtro: ';

            let select = document.createElement('select');
            select.classList.add('select');
            select.id = `filter_${i}`;
            select.name = `filter ${i}`;

            filtros.forEach(function (optionData) {
                let option = document.createElement('option');
                option.value = optionData.value;
                option.textContent = optionData.text;
                select.appendChild(option);
            });

            // Errpr filter span
            const filterError = document.createElement('span');
            filterError.id = `filter_error_${i}`//ip_error_1
            filterError.className = 'inputError';
            filterError.innerText = ' ' + findText('filterError');

            indexIpPortContainer.appendChild(label);
            indexIpPortContainer.appendChild(select);
            indexIpPortContainer.appendChild(filterError);

            indexIpPortContainer.appendChild(document.createElement('br'));
            indexIpPortContainer.appendChild(document.createElement('br'));

            // IP label add
            const ipLabel = document.createElement('label');
            ipLabel.setAttribute('for', `reroute_ip_${i}`);
            ipLabel.innerText = 'IP: ';
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
            ipError.innerText = ' ' + findText('ipError');
            indexIpPortContainer.appendChild(ipError);

            indexIpPortContainer.appendChild(document.createElement('br'));
            indexIpPortContainer.appendChild(document.createElement('br'));

            // Port label add
            const portLabel = document.createElement('label');
            portLabel.setAttribute('for', `reroute_port_${i}`);
            portLabel.innerText = 'Port: ';
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
            portError.innerText = ' ' + findText('portError');;
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

// Valicdaciones
function isValidIP_ClientSide(ip) {
    // 
    const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipPattern.test(ip);
}

function isValidPort_ClientSide(port) {
    const portNumber = parseInt(port, 10);
    return Number.isInteger(portNumber) && portNumber >= 0 && portNumber <= 65535;
}

function isValidFilter(filter) {
    return filtros.some(filt => filt.value === filter);
}


// Funciones de html
const reroute_button = document.getElementById("rerouteEN");
function toggleButton() {
    if (reruteoEnabled) {
        reroute_button.style.backgroundColor = "red";
        reroute_button.innerText = "Reroute OFF";
    } else {
        reroute_button.style.backgroundColor = ""; //original
        reroute_button.innerText = "Reroute ON";
    }

}

function toggleInputAvailability(ipPortFilterInputs) {
    cantInput.disabled = reruteoEnabled;

    ipPortFilterInputs.forEach(inputs => {
        console.log(`IP: ${inputs.ipInput}, Port: ${inputs.portInput}`);
        inputs.ipInput.disabled = reruteoEnabled;
        inputs.portInput.disabled = reruteoEnabled;
        inputs.filterInput.disabled = reruteoEnabled;
    });
}

function updateStateMessage(ipPortFilterInputs) {
    var state = "";
    var confirmation_message = "";

    if (reruteoEnabled) {
        state = "Redirección configurada <br>"

        ipPortFilterInputs.forEach((pair, index) => {
            const ip = pair.ipInput.value;
            const port = pair.portInput.value;
            const filter = pair.filterInput.options[pair.filterInput.selectedIndex].text;

            state += `- Dirección objetivo ${index + 1}: <mark>${ip}:${port}</mark> | Filtro: <mark>${filter}</mark> <br>`
        });

        confirmation_message = "Redireccion activada."

    } else {
        state = "- No hay Redireccion configurada actualmente.<br>"
    }


    document.getElementById("estado_redireccion").innerHTML = state;
    document.getElementById("redireccion_activada").innerHTML = confirmation_message;
}

// Ping check
/*
async function pingIp(ip) {
    const response = await fetch('/ping', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ip: ip })
    });

    const result = await response.json();
    return result.alive;
}

async function checkIpAvailability(ip) {
    const isAlive = await pingIp(ip);

    if (isAlive) {
        console.log(`IP ${ip} is alive. Sending OSC message...`);
        return true;

    } else {
        console.log(`IP ${ip} is not reachable.`);
        return false;
    }
}
*/

// IPC
function ipcSend_toggleReroute(ipPortFilterInputs) {
    const ipPortPairs = [];
    ipPortFilterInputs.forEach(pair => {
        const ip = pair.ipInput.value;
        const port = pair.portInput.value;
        const filter = pair.filterInput.value;
        ipPortPairs.push({ ip, port, filter });
    });

    const data = {
        activate: reruteoEnabled,
        ipPortPairs: ipPortPairs
        //ip: ip,
        //port: port
    };

    window.api.send('toggle-reruteo', data);

}

function ipcSend_pingIP(ip) {
    /* Envia la señal a main para que haga un ping a la ip especificada. Despues de hacer el ping la funcion sigue en ipcRecieve_pingIP */
    window.api.send('ping-ip', ip);
}

window.api.receive('ping-ip', (res) => {
    /* Recive la señal del main y activa la redireccion si la ip que se ingreso esta habilitada. */
})


/* --------------------------------------------------------------------*/
// Habilitar reruteo

var reruteoEnabled = false; // Purrdata same machine '127.0.0.1' 4559;

async function habilitarReruteo() {
    /* Llamada por el boton de activar rerouting. Si esta activado lo detine, si no entonces lo activa con los parametros dados. */

    // Primero consigue todos inputs actuales IP y Port
    const ipPortFilterInputs = []; // [{ipInput, portInput, ipError, portError}] comienza en 1!

    for (let i = 1; i <= cantidad_dir; i++) {
        const ipInput = document.getElementById(`reroute_ip_${i}`);
        const portInput = document.getElementById(`reroute_port_${i}`);
        const ipError = document.getElementById(`ip_error_${i}`);
        const portError = document.getElementById(`port_error_${i}`);
        const filterInput = document.getElementById(`filter_${i}`);
        const filterError = document.getElementById(`filter_error_${i}`);
        ipPortFilterInputs.push({ ipInput, portInput, ipError, portError, filterInput, filterError });
    }

    // En caso de que el reroute ya este activado, entonces se desactiva
    if (reruteoEnabled) {

        reruteoEnabled = false;
        ipcSend_toggleReroute([]);

        toggleInputAvailability(ipPortFilterInputs)
        toggleButton();

        updateStateMessage(ipPortFilterInputs);
        document.getElementById("rerouter_dialog_p").textContent = "Reroute OFF"
        return;
    }

    // De otra manera se pasa a las validaciones
    var message = "";
    var valid = true;

    // validaciones
    ipPortFilterInputs.forEach(pair => {

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

        if (isValidFilter(pair.filterInput.value)) {
            message += "Filtro valido. "
            pair.filterError.style.display = 'none';
        } else {
            message += "Filtro no reconocido. "
            valid = false;
            pair.filterError.style.display = 'inline'; // Mesaje de error Filtro
        }
        /*
                // Check IP avalilability via PING
                const isAvailable = await checkIpAvailability(pair.ipInput.value);
        
                if (isAvailable) {
                    message += "IP habilitada. "
                    pair.filterError.style.display = 'none';
                } else {
                    message += "IP NO ESTA HABILITADA. "
                    valid = false;
                    pair.filterError.style.display = 'inline'; // Mesaje de error CAMBIARRRRRRRRRR
                }
        */

    });


    if (valid) {



        reruteoEnabled = true;
        ipcSend_toggleReroute(ipPortFilterInputs);

        toggleInputAvailability(ipPortFilterInputs)
        toggleButton()

        updateStateMessage(ipPortFilterInputs);
        message += "Reroute: " + reruteoEnabled;

    }


    document.getElementById("rerouter_dialog_p").textContent = message // Para DEBUG, Eliminar despues
}


module.exports = { habilitarReruteo, updateFields }