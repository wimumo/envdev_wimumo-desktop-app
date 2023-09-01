/* Manu principal */

function openMenu() {
    document.getElementById('menu').setAttribute('shown','');
    document.getElementById("overlay").setAttribute('shown','');
  }
  
function closeMenu() {
    document.getElementById('menu').removeAttribute('shown');
    document.getElementById('overlay').removeAttribute('shown');
}

/* Pestañas */

categoryList = ['instructions', 'connection', 'graph', 'calibration', 'music', 'rerouter'];
category = categoryList[0];

function exchangeBody (categorySelected) {

  document.getElementById(category).setAttribute('hiden','');
  document.getElementById(categorySelected).removeAttribute('hiden');

  category = categorySelected;

  closeMenu();
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


var infoReceived = false;
var infoReported = false;
var baseRoute = "/wimumo020";
var channelList = [];
var channels = [];
var nChannels = 0;
var batteryFilter = new MovAvg(15);

window.api.receive('osc', (data) => {

  if (data == 'undefined') return;

  if (infoReceived == false && data[0].substring(11, 15) == "info") {
    infoReceived = true;
    baseRoute = data[0].substring(0, 10);
    for (let i = 0; i < parseInt(data[6]); i++) {
      channels.push(data[7 + i].substring(10));
    }
    listGraphChannels(channels);
  }

  /* Graficador */
  if(infoReceived == true && category == categoryList[2]) {
    /* Acá se hace el filtado para graficar */
    for (let i = 0; i < channels.length; i++){
      if (data[0] == (baseRoute + channels[i].channel)) {
        var sample = [];
        for (let i = 1; i < data.length; i++) {
          sample.push(parseInt(data[i]));
        }
        plot(channels[i].channel, sample);
      }
    } 
  }
  /* Música */
  else if (infoReceived == true && category == categoryList[4]) {
    if (data[0] == baseRoute + "/env/ch1" && audioEnabled == true) {
      actualizarValor(1, parseInt(data[1]));
    }
    if (data[0] == baseRoute + "/env/ch2" && audioEnabled == true) {
      actualizarValor(2, parseInt(data[1]));
    }
  }
  /* Conexión */
  else if (infoReceived == true && category == categoryList[1]) {
  
    if (infoReported == false && data[0] == baseRoute + "/info") {
      infoReported = true;
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
      string += '<br> Nivel de batería aproximado: <span id="batteryLevel"></span>';
      document.getElementById("status").innerHTML = string;
    }
    if (infoReported == true && data[0] == baseRoute + "/info" && typeof batteryFilter !== 'undefined') {
      var batteryLevel = data[5];
      batteryLevel = batteryFilter.nuevoDato(batteryLevel);
      if(batteryLevel<0) batteryLevel = 0;
      if(batteryLevel>100) batteryLevel = 100;
      document.getElementById("batteryLevel").innerHTML = parseInt(batteryLevel) + "%";
    }
  }

});

