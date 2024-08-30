/* Funciones de re-ruteo para paquetes OSC */

/* Lista de direcciones cuyo reruteo esta activado */
var rerouteEnabledArray = []; // en caso de no existir se considera falso // Purrdata same machine '127.0.0.1' 4559;

/* Cantidad de direcciones objetico dinamicas. */
const maxCount = 5;
const minCount = 1; // Cambiar de 1 no esta soportado
var cantidad_dir = 1;

const cantInput = document.getElementById('cant_direcciones');
const cantError = document.getElementById('cant_direcciones_error');

/* Inicializar todo lo que necesite en el index.htlml de redireccion */
document.addEventListener("DOMContentLoaded", function () {
    initialiceFiltros();
    initialiceTextosDinamicos();
    initialiceRerouteFunctionPosition1();
    initialiceMaxMinCount();
});

/* Filtros. Esta variable determina los filtros que pueden usarse. Si se cambian se puede agregar una implementacion en "filterBundle", funcion de main.js */
const filtros = [
    { value: 'none', text: 'Ninguno' },
    { value: 'raw_signals_only', text: 'Señales originales' },
    { value: 'env_signals_only', text: 'Señales envolventes' },
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

function initialiceRerouteFunctionPosition1() {
    const rerouteButton1 = document.getElementById('reroute_button_1');
    rerouteButton1.onclick = function () {
        habilitarReruteoPorPosicion(1);
    };
}

function initialiceMaxMinCount() {
    const cant_direcciones = document.getElementById('cant_direcciones');
    cant_direcciones.max = maxCount;
    cant_direcciones.min = minCount;
}

/* Textos dinamicos. Strings que se usan en la pagina y que se cargan dinamicamente. Con cambiar esto se cambia todas sus apariciones. */
const textosDinamicos = [

    // Errores
    { value: 'ipError', text: 'Dirección IP inválida. Debe consistir de 4 números separados por puntos, ejemplo: "x.x.x.x".' },
    { value: 'portError', text: 'Número de puerto inválido. Debe ser un número entre 0 y 65535.' },
    { value: 'filterError', text: 'Filtro no reconocido' },
    { value: 'pingError', text: 'La direccion ip especificada no se pudo alcanzar.' },

    // Botones
    { value: 'rerouteButtonON', text: 'Reroute ON' },
    { value: 'rerouteButtonOFF', text: 'Reroute OFF' }
];

function findText(value) {
    return textosDinamicos.find(texto => texto.value === value).text
}

function initialiceTextosDinamicos() {
    /* Esta funcion se encarga de que los campos por defecto tengan los mismos textos que los campos cargados dinamicamente */

    // Errores
    const firstIpErrorSpan = document.getElementById("ip_error_1");
    const firstPortErrorSpan = document.getElementById("port_error_1");
    const firstFilterErrorSpan = document.getElementById("filter_error_1");

    firstIpErrorSpan.textContent = findText('ipError');
    firstPortErrorSpan.textContent = findText('portError');
    firstFilterErrorSpan.textContent = findText('filterError');

    // Botones
    const firstRerouteButton = document.getElementById("reroute_button_1");
    firstRerouteButton.textContent = findText('rerouteButtonON');
}



/* Campos dinamicos. Funciones que se llaman para crear mas campos o eliminarlos. */
function updateFields() {
    /* Se encarga de actualizar la cantidad de campos para ingresar IP:Puerto. Se llama cada vez que cambia la cantidad. */
    const container = document.getElementById('ip_port_container');
    const count = parseInt(cantInput.value);

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

            rerouteEnabledArray[i] = false;

        }

        cantidad_dir = count;

    }

    // Cantidad aumento. Agregar inputs.
    if (count > cantidad_dir) {

        for (let i = cantidad_dir + 1; i <= count; i++) {

            // Nuevo Div
            const indexIpPortContainer = document.createElement('div');
            indexIpPortContainer.id = `ip_port_container_${i}`;
            indexIpPortContainer.className = 'container_reroute';

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

            // Reroute button add
            const rerouteButton = document.createElement('button');
            rerouteButton.id = `reroute_button_${i}`;
            rerouteButton.className = 'right-button';
            rerouteButton.textContent = findText('rerouteButtonON');

            // Agregar funcion on click para que el boton llame a la funcion de habilitar reruteo con su posicion correcta en la pagina.
            rerouteButton.onclick = function () {
                habilitarReruteoPorPosicion(i);
            };

            indexIpPortContainer.appendChild(rerouteButton);

            indexIpPortContainer.appendChild(document.createElement('br'));

            // Add to container
            container.appendChild(indexIpPortContainer);

            rerouteEnabledArray[i] = false;
        }

        // Actualizar valor de la cantidad de direcciones.
        cantidad_dir = count;
    }

}


/* Funciones para habilitar reruteo */

// Valicdaciones
function isValidIP_ClientSide(ip) {
    /* Esta funcion compara la ip que se paso como parametro contra un patron que se asegura que tenga la forma esperada de una ip. */
    /* El patron comienza con "/^" y termina con "$/"; tiene cuatro partes iguales separadas por "\.", que significa que espera 4 expresiones separadas por puntos*/
    /* Las expresiones esperadas entre los puntos deben corresponder con un numero entre 250 y 255; o un numero entre 200 y 249; o un numero entre 0 o 00 o 000 y 199.*/
    const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipPattern.test(ip);
}

function isValidPort_ClientSide(port) {
    /* Valida que el numero de puerto este dentro de el rango de puertos. */
    const portNumber = parseInt(port, 10);
    return Number.isInteger(portNumber) && portNumber >= 0 && portNumber <= 65535;
}

function isValidFilter(filter) {
    /* Por seguridad antes de usar la variable de filtro que se selecciono, se confirma que sea una de las opciones posibles*/
    return filtros.some(filt => filt.value === filter);
}


// Funciones de html. Estas funciones se llaman desde otras funciones para cambiar el html, y reflejar actualizaciones.

// Botones
function disableButton(reroute_button) {
    reroute_button.style.backgroundColor = "red";
    reroute_button.innerText = "Reroute OFF";
}

function enableButton(reroute_button) {
    reroute_button.style.backgroundColor = ""; //original
    reroute_button.innerText = "Reroute ON";
}

// Inputs
function disableInputAvailability(ipInput, portInput, filterInput,) {
    /* Desactiva todos los inputs mientras el reruteos se este efectuando*/
    cantInput.disabled = true;

    console.log(`IP: ${ipInput}, Port: ${portInput}`);
    ipInput.disabled = true;
    portInput.disabled = true;
    filterInput.disabled = true;
}

function enableInputAvailability(ipInput, portInput, filterInput,) {
    /* Activa todos los inputs despues de que el reruteo termine. Y si es el ultimo tambien el cantInput */
    console.log(`IP: ${ipInput}, Port: ${portInput}`);
    ipInput.disabled = false;
    portInput.disabled = false;
    filterInput.disabled = false;

    enableCantInput();
}

function enableCantInput() {
    /* El campo para cambiar la cantidad de direcciones de reruteo solo deberia ser modificable si no hay ninguna direccion reruteando ahora mismo, eso puede cambiar en el futuro*/
    const allFalse = rerouteEnabledArray.every(element => element === false);

    if (allFalse) cantInput.disabled = false;
}

function showInputError(errorSpan, text) {

    errorSpan.textContent = text;
    errorSpan.style.display = 'inline'; // Mesaje de error IP

}

function hideInputError(errorSpan) {
    errorSpan.style.display = 'none';
}

// Mensaje de estado de reruteo en pantalla de Configuracion
function updateStateMessage() {
    /* Esta funcion actuaiza el estado de la seccion de redireccion en la pantalla de configuracion. */
    var state = "";
    var confirmation_message = "";

    var first = true;

    for (let i = 1; i <= maxCount; i++) {

        if (rerouteEnabledArray[i]) {

            if (first) {
                state = "Redirección configurada <br>";
                confirmation_message = "Redireccion activada.";
                first = false
            }

            const ip = document.getElementById(`reroute_ip_${i}`).value;
            const port = document.getElementById(`reroute_port_${i}`).value;
            const filter = document.getElementById(`filter_${i}`).value;

            state += `- Dirección objetivo ${i}: <mark>${ip}:${port}</mark> | Filtro: <mark>${filter}</mark> <br>`


        }

    }

    if (first) state = "- No hay Redireccion configurada actualmente.<br>"


    document.getElementById("estado_redireccion").innerHTML = state;
    document.getElementById("redireccion_activada").innerHTML = confirmation_message;
}

// Mensajes IPC. Estass funciones se usan para comunicarse con el main.
/*function ipcSend_toggleReroute(ipPortFilterInputs) {
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

}*/


function ipcSend_pingIP(ip, posicion) {
    /* Envia la señal a main para que haga un ping a la ip especificada. Despues de hacer el ping la funcion sigue en 'ping-result' */
    const data = {
        ip: ip,
        posicion: posicion
    };

    window.api.send('ping-ip', data);
}


window.api.receive('ping-result', (data) => {
    /* Recive la señal del main y activa la redireccion si la ip que se ingreso esta habilitada. */

    if (data.resultado.alive) {
        // Si el ping fue exitoso
        //document.getElementById("rerouter_dialog_p").textContent = "LES GOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO";

        const ipInput = document.getElementById(`reroute_ip_${data.posicion}`);
        const portInput = document.getElementById(`reroute_port_${data.posicion}`);
        const filterInput = document.getElementById(`filter_${data.posicion}`);
        const rerouteButton = document.getElementById(`reroute_button_${data.posicion}`)


        // Actualizar variable y enviar mensaje a main para activar el reruteo
        rerouteEnabledArray[data.posicion] = true;
        //ipcSend_toggleReroute(ipPortFilterInputs); // Cambiar por uno especifico
        ipcSend_addReroute(data.posicion, ipInput.value, portInput.value, filterInput.value);

        // Actualizar front end
        disableInputAvailability(ipInput, portInput, filterInput)
        disableButton(rerouteButton)

        // Actualizar Estado de configuracion
        updateStateMessage();

    } else {
        // Si el ping fallo
        const ipError = document.getElementById(`ip_error_${data.posicion}`);

        showInputError(ipError, findText('pingError'));

        document.getElementById("rerouter_dialog_p").textContent = "PING FAILEDDDDDDDDDDDDDDDD";

    }
})


function ipcSend_addReroute(posicion, ip, port, filter) {

    const data = {
        posicion: posicion,
        ip: ip,
        port: port,
        filter: filter
    };

    window.api.send('Add-RerouteAddress', data);

}

function ipcSend_removeRoute(posicion, ip, port, filter) {

    const data = {
        posicion: posicion,
        ip: ip,
        port: port,
        filter: filter
    };

    window.api.send('Remove-RerouteAddress', data);

}

//Guardar datos de las redirecciones ip antes de cerrar la aplicacion
function ipcSend_saveConfig() {
    /* Esta funcion se encarga de guardar la configuracion de redirecciones ip en un archivo.  */
    /* Esta funcion se deberia llamar antes de cerrar la pagina.  */

    const ipPortArray = [];

    ipPortArray.push({ cantidad_dir: cantidad_dir });

    for (let posicion = minCount; posicion <= cantidad_dir; posicion++) {
        const ipInputId = `reroute_ip_${posicion}`;
        const portInputId = `reroute_port_${posicion}`;
        const FilterInputId = `filter_${posicion}`;

        // Se obtienen todos los inputs necesarios para guardar sus valores
        const ipInput = document.getElementById(ipInputId);
        const portInput = document.getElementById(portInputId);
        const FilterInput = document.getElementById(FilterInputId);


        if (ipInput.value && portInput.value && FilterInput.value) {
            ipPortArray.push({
                id: posicion,
                ip: ipInput.value,
                port: portInput.value,
                filter: FilterInput.value
            });

            console.log(`Posicion "${posicion}" guardada. ${ipInput.value}:${portInput.value} filtro ${ipInput.value}`);
        } /*else {
            console.warn(`Element with ID "${posicion}" not found.`);
        }*/
    }

    document.getElementById("rerouter_dialog_p").textContent = JSON.stringify(ipPortArray, null, 2);

    const data = ipPortArray;
    window.api.send('save-config', data);
}

window.addEventListener('beforeunload', (event) => {
    /* Antes de cerrar la app se deberia nguardar las direcciones objetivo que se hayan escrito. */
    ipcSend_saveConfig();
})


// Habilitar Reruteo
function habilitarReruteoPorPosicion(posicion) {
    /* Llamada por el boton de activar rerouting especifico para una de las direcciones entre 1 y 5. */
    /* Si esta activado lo detine, si no entonces lo activa con los parametros dados. */

    // Primero consigue todos inputs para la posicion requerida 

    const ipInput = document.getElementById(`reroute_ip_${posicion}`);
    const portInput = document.getElementById(`reroute_port_${posicion}`);
    const ipError = document.getElementById(`ip_error_${posicion}`);
    const portError = document.getElementById(`port_error_${posicion}`);
    const filterInput = document.getElementById(`filter_${posicion}`);
    const filterError = document.getElementById(`filter_error_${posicion}`);

    const rerouteButton = document.getElementById(`reroute_button_${posicion}`)

    // En caso de que el reroute ya este activado, entonces se desactiva. Si la posicion no existe entonces sera undefined, false, por defecto
    if (rerouteEnabledArray[posicion]) {

        // Actualizar variable y enviar mensaje a main para desactivar el reruteo
        rerouteEnabledArray[posicion] = false;
        //ipcSend_toggleReroute([]); // Crear un toggle especifico
        ipcSend_removeRoute(posicion, ipInput.value, portInput.value, filterInput.value);

        // Actualizar front end
        enableInputAvailability(ipInput, portInput, filterInput)
        enableButton(rerouteButton);

        // Actualizar Estado de configuracion
        updateStateMessage();

        // Debug
        //document.getElementById("rerouter_dialog_p").textContent = "reruteo apagado"

        return;
    }

    // De otra manera se pasa a las validaciones

    //var message = "";
    var valid = true;


    // validaciones

    if (isValidIP_ClientSide(ipInput.value)) {
        hideInputError(ipError)
    } else {
        valid = false;
        showInputError(ipError, findText('ipError')) // Mesaje de error IP
    }

    if (isValidPort_ClientSide(portInput.value)) {
        hideInputError(portError)
    } else {
        valid = false;
        showInputError(portError, findText('portError')) // Mesaje de error Puerto
    }

    if (isValidFilter(filterInput.value)) {
        hideInputError(filterError)
    } else {
        valid = false;
        showInputError(filterError, findText('filterError')) // Mesaje de error Filtro
    }


    // Resultados

    if (valid) {

        //ipcSend_saveConfig(); // Esto no deberia de ocurrir aca, deberia de ocurrir cuando se va a cerrar la app
        // Si el resto de las validaciones son correctas, entonces hace un Ping a la ip objetivo para asegurarse de que esta disponible
        ipcSend_pingIP(ipInput.value, posicion);

    }

}

window.api.receive('savedRedirectConfig', (data) => {
    configData = JSON.stringify(data);

    document.getElementById("rerouter_dialog_p").textContent = "FUNCIONO " + configData;

    //const dataArray = JSON.parse(jsonString); // Forma [{cantidad_dir},{id,ip,port,filter},{id,ip,port,filter}...]
    //cantInput.value = dataArray[0].cantidad_dir;

    try {
        // Parsea el JSON string a un JavaScript array
        const dataArray = JSON.parse(configData);

        // Accede al primer elemento del array para encontrar el valor previo de cantidad_dir
        const cantidadDirValue = dataArray[0].cantidad_dir;
        console.log('Value of cantidad_dir:', cantidadDirValue); // Output the value

        // SEGURIDAD se asegura que el valor de cantidadDir sea uno posible, si no detiene la ejecucion.
        if (cantidadDirValue > maxCount || cantidadDirValue < minCount) { return }

        // Cambiar la cantidad de fields y actualiza antes de continuar
        //cantidad_dir = dataArray[0].cantidad_dir;
        cantInput.value = dataArray[0].cantidad_dir;
        updateFields();

        // For each element, por cada elemento que se guardo se itera para recuperar los datos
        dataArray.forEach((element) => {
            const pos = element.id;
            const ip = element.ip
            const port = element.port
            const filter = element.filter

            // En caso de que este filtro no sea correcto se sigue con la siguiente iteracion. No se detiene la ejecucion.
            if (isValidFilter(filter)) {
                const ipInputId = `reroute_ip_${pos}`;
                const portInputId = `reroute_port_${pos}`;
                const FilterInputId = `filter_${pos}`;

                const ipInput = document.getElementById(ipInputId);
                const portInput = document.getElementById(portInputId);
                const FilterInput = document.getElementById(FilterInputId);

                // Se asignan los valores guardados a cada input
                ipInput.value = ip;
                portInput.value = port;
                FilterInput.value = filter;
            };


        });

        /* for (let pos = 1; pos <= cantidad_dir; pos++) {
            const ip = dataArray[pos].ip // pos siempre es un valor entre 1 y max
            const port = dataArray[pos].port
            const filter = dataArray[pos].filter

            // En caso de que este filtro no sea correcto se sigue con la siguiente iteracion. No se detiene la ejecucion.
            if (!isValidFilter(filter)) { continue };

            const ipInputId = `reroute_ip_${pos}`;
            const portInputId = `reroute_port_${pos}`;
            const FilterInputId = `filter_${pos}`;

            const ipInput = document.getElementById(ipInputId);
            const portInput = document.getElementById(portInputId);
            const FilterInput = document.getElementById(FilterInputId);

            // Se asignan los valores guardados a cada input
            ipInput.value = ip;
            portInput.value = port;
            FilterInput.value = filter;

        }*/

    } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
    }

});



//module.exports = { habilitarReruteoPorPosicion, updateFields }