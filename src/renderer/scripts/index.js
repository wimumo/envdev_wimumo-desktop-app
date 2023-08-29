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

categories = ['instructions', 'connection', 'graph', 'calibration', 'music', 'rerouter'];
category_active = categories[0];

function body_exchange (category_selected) {

  document.getElementById(category_active).setAttribute('hiden','');
  document.getElementById(category_selected).removeAttribute('hiden');

  category_active = category_selected;

  menu_close();
}

/* Datos */

class MovAvg {
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
var info_reported = false;
var base_route = "/wimumo020";
var channels = [];
var channels_active = [];
var numch = 0;
var batery_filter = new MovAvg(15);

window.api.receive('osc', (data) => {

  if (data == 'undefined') return;

  if (info_received == false && data[0].substring(11, 15) == "info") {
    info_received = true;
    base_route = data[0].substring(0, 10);
    for (let i = 0; i < parseInt(data[6]); i++) {
      channels.push(data[7 + i].substring(10));
    }
    enableChannels(channels);
  }

  /* Graficador */
  if(info_received == true && category_active == categories[2]) {
    /* Acá se hace el filtado para graficar */
    for (let i = 0; i < channels_active.length; i++){
      if (data[0] == (base_route + channels_active[i].channel)) {
        var sample = [];
        for (let i = 1; i < data.length; i++) {
          sample.push(parseInt(data[i]));
        }
        plot(channels_active[i].channel, sample);
      }
    } 
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
  
    if (info_reported == false && data[0] == base_route + "/info") {
      info_reported = true;
      var string = "";
      string += "WIMUMO " + data[0].substring(7, 10) + " " + "<mark>detectado</mark>! <br> en IP ";
      string += data[1];
      if (data[2] == "false") {
        string += '<br> NO está enviando datos (configure manualmente o presione "autoconfigurar")';
      }
      else {
        string += '<br> Enviando datos a: ';
        string += data[3] + ":" + data[4];
      }
      string += '<br> Nivel de batería aproximado: <span id="batery_level"></span>';
      document.getElementById("status").innerHTML = string;
    }
    if (info_reported == true && data[0] == base_route + "/info" && typeof batery_filter !== 'undefined') {
      var batery_level = data[5];
      batery_level = batery_filter.nuevoDato(batery_level);
      if(batery_level<0) batery_level = 0;
      if(batery_level>100) batery_level = 100;
      var nivel_batt_pc = "";
      nivel_batt_pc += parseInt(batery_level) + "%";
      document.getElementById("batery_level").innerHTML = nivel_batt_pc;
    }
  }

});

