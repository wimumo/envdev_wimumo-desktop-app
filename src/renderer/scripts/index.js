/* Manu principal */

function menu_open() {
    document.getElementById('menu').setAttribute('shown','');
    document.getElementById("overlay").setAttribute('shown','');
  }
  
function menu_close() {
    document.getElementById('menu').removeAttribute('shown');
    document.getElementById('overlay').removeAttribute('shown');
}

/* Pestañas */

categories = ['instrucciones', 'configuracion', 'graficador', 'musica', 'rerouter', 'HomePage'];
starting_category = categories[5]; // Home Page deberia ser la categoria con la que se inicia
document.getElementById(starting_category).removeAttribute('hidden');
category_active = starting_category;

function body_exchange (category_selected) {

  document.getElementById(category_active).setAttribute('hidden','');
  document.getElementById(category_selected).removeAttribute('hidden');

  category_active = category_selected;

  menu_close();
}

function shortcut (shortcutName) {
  if (shortcutName === "configGuide" ) {
    body_exchange('instrucciones2');
    guiaConfig();
  }
}

/* Datos */

class Movprom {
  constructor(n) {
    this.arr = [];
    this.N = n;
  }

  nuevoDato(dat) {
    this.arr.push(dat);
    if (this.arr.length > this.N) {
      this.arr.shift();
    }
    
    var acc = 0.0;
    for (var i = 0; i < this.arr.length; i++) {
      acc += parseFloat(this.arr[i]);
    }
    acc /= this.arr.length;
    return acc;
  }
}


var info_received = false;

var base_route = "/wimumo020";
var numch = 0;
var filt_batt = new Movprom(15);

window.api.receive('osc', (data) => {

  if (data == 'undefined') return;

  // Si la conexion se pierde, se actualizan los datos
  if (data == 'CONNECTION LOST') {

    onConnectionLostConfig(); // Reset config
    onConnectionLostGraph(); // Clear channels

    info_received = false;
    updateConnectionIndicator(false);

    return;
  }

  // Se activa con la primera señal, crea los canales del graficador
  if (info_received == false && data[0].substring(11, 15) == "info") {
    info_received = true;
    base_route = data[0].substring(0, 10);

    updateConnectionIndicator(true); // actualiza el indicador del menu

    addChannels(data);
    enableChannels();
  }

  /* Graficador */
  if(info_received == true && category_active == categories[2]) {

    filterAndGraph(data);

  }

  /* Musica */
  else if (info_received == true && category_active == categories[3]) {
    if (data[0] == base_route + "/env/ch1" && audioEnabled == true) {
      actualizarValor(1, parseInt(data[1]));
    }
    if (data[0] == base_route + "/env/ch2" && audioEnabled == true) {
      actualizarValor(2, parseInt(data[1]));
    }
  }

  /* Configuración */
  else if (info_received == true && category_active == categories[1]) {

    reportInfo(data);

  }

});

// Actualizar indicador
function updateConnectionIndicator(bool) {
  if (bool) {
    // Indicador de conexion del menu
    const indicator = document.getElementById('connection-indicator');
    const statusText = document.getElementById('status-text');

    indicator.className = "connection_indicator_ON";
    statusText.textContent = 'WIMUMO Conectado';
    statusText.className = "connection_indicator_text_ON";
  } else {
    // Indicador de conexion del menu
    const indicator = document.getElementById('connection-indicator');
    const statusText = document.getElementById('status-text');

    indicator.className = "connection_indicator_OFF";
    statusText.textContent = 'WIMUMO Desconectado';
    statusText.className = "connection_indicator_text_OFF";
  }
}