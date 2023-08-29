
// Usando https://www.arc.id.au/CanvasLayers.html

var graphs = [];
var updateTime = 1000;

var width = 400;
var height = 300;

var recording = false;

class Graph {
  /* Características */
  fsps;
  fspsList = [];  // Arreglo para promedio de Fps dinámico
  samples = []; // Buffer para almacenar las muestras que deben graficarse
  nSamples;
  tGraphMS; // Período de graficación en milisegundos
  samplesPerGraph;

  tTick;
  tWidth;
  dx;
  x;
  xPrev;
  e;
  ePrev;
  /* Límites graficos */
  width;
  height;
  scale;
  offset;
  /* Componentes gráficos */
  canvas;
  title;
  info;
  ctx;    // context
  cursor;
  /* Diseño */
  lineColor;
  cursorColor;
  /* Estado */
  channel;
  ready;


  constructor(canvas, title, info) {
    // Componentes gráficos
    this.canvas = canvas;
    this.title = title;
    this.info = info;
    this.width = width;
    this.height = height;
    this.scale = 32;
    this.offset = Math.floor(this.height / 2);

    // Características
    this.fsps = 100; // Fps supuesto al comienzo, luego se actualiza solo
    this.fspsArr = [100, 100, 100, 100, 100];
    this.samples = [];
    this.nSamples = 100;
    this.tGraphMS = 50;
    this.samplesPerGraph = Math.ceil(this.fsps / (1000 / this.tGraphMS));

    this.tTick = this.tGraphMS / 1000;
    this.tWidth = 5;
    this.dx = this.tTick / this.tWidth * this.width;
    this.x = 0;
    this.xPrev = 0;
    this.s = 0;
    this.sPrev = 0;

    // Estado
    this.channel = "null";
    this.ready = false;

    // Diseño
    this.lineColor = 'darkOrchid';
    this.cursorColor = 'red';

    this.setCanvas();

    setInterval(this.updateFsps.bind(this), updateTime); // bind() establece el contexto del this
    setInterval(this.plotSigs.bind(this), this.tGraphMS);
  }

  setCanvas() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = this.lineColor;
    this.cursor = new Cursor(this.canvas, this.cursorColor);
    this.canvas.addEventListener("mousedown", (e) => this.getMousePosition(e));
  }

  updateFsps() {
    this.fspsList.push(this.nSamples);
    this.fspsList.shift();
    let Nd = this.fspsList.length;
    this.fsps = this.fspsList[0];
    for (let di = 1; di < Nd; di++) {
      this.fsps += this.fspsList[di];
    }
    this.fsps /= Nd;
    this.nSamples = 0;
  }

  /*
  *   Funcion graficarSigs
  *   Grafica lo que encuentra en el arreglo samples
  *   ajustandose segun fsps, t_tick, dx, width
  *   almacena memoria en x_prev y e_prev
  */
  plotSigs() {

    var Ne = this.samples.length;
    //console.log(Ne); //<- Un muy buen debug del estado de los buffers

    if (Ne == 0) return;      // Nada para graficar

    var spg = Ne; //Math.ceil(fsps * t_tick); // Cuantas muestras debo graficar en cada ventana m/s * s = m

    var dx_pix = this.dx / spg;  // Si tengo que graficar lim puntos en dx pixeles, cuanto avanza c/u

    this.ctx.beginPath();
    this.ctx.strokeStyle = this.lineColor;
    this.ctx.moveTo(this.x_prev, this.s_prev);

    for (let j = 0; j < spg; j++) {
      this.s = this.samples.shift();
      this.s = (-this.s * 1.0 / this.scale + this.offset);
      this.x = this.x + dx_pix;

      this.ctx.lineTo((this.x), this.s);

      if (this.x > this.width) {
        this.ctx.stroke();
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.cursor.refresh();
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color;
        this.x = 0;
        this.xPrev = 0;
        this.ctx.moveTo(0, this.sPrev);
      }
    }
    this.x_prev = this.x;
    this.s_prev = this.s;

    this.ctx.stroke();
    this.cursor.updatePosition();
  }

  getMousePosition(e) {
    let rect = this.canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    this.cursor.setNewPosition(y);
    this.info.innerHTML = "Información: y = " + String((y - this.offset) * this.scale * -1);
  }


  scaleDown() {
    this.scale = this.scale * 2;
  }
  scaleUp() {
    this.scale = this.scale / 2;
  }
}
class Cursor {
  ctx;
  width;
  pos;
  newPos;
  color;

  constructor(canvas, color) {
    this.ctx = canvas.getContext("2d");
    this.width = canvas.width;
    this.pos = 0;
    this.color = color;
    this.newPos = 0;

  }

  refresh() {
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.color;
    this.ctx.moveTo(0, this.pos);
    this.ctx.lineTo(this.width, this.pos);
    this.ctx.stroke();
  }

  delete() {
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(0, this.pos - 1, this.width, 2);
  }

  updatePosition() {
    if (this.newPos != this.pos) {
      this.ctx.save();
      this.ctx.globalCompositeOperation = "destination-out";
      this.delete();
      this.ctx.restore();
      this.pos = this.newPos;
      this.refresh();
    }
  }

  setNewPosition(newPos) {
    this.newPos = newPos;
  }
}

function listGraphChannels(chs) {
  for (let i = 0; i < graphs.length; i++) {
    if (graphs[i].ready == false && channels.length != 0){
      graphs[i].ready = true;
      for (let k = 0; k < chs.length; k++) {
        let c = document.createElement("option");
        c.innerHTML = chs[k];
        c.value = chs[k];
        graphs[i].title.appendChild(c);
      }
    }
  }
}

//
// Se recibe el arreglo para graficar. 
//
function plot(channel, samples) {
  for (let i = 0; i < graphs.length; i++) {
    if (graphs[i].channel == channel){
      // Para calculo de FPS dinámico 
      graphs[i].nSamples += samples.length;

      if (graphs[i].samples.length > 10 * graphs[i].fsps) {
        graphs[i].samples = [];
        console.log("Sobrellenado de buffer");
      }
      graphs[i].samples.push(...samples); // el operador ... convierte un arreglo en una lista de parámetros
    }
  }
  if (recording == true) {
    content.push(...samples);
  }


}

function addGraph(){
  let n = graphs.length + 1;

  let div = document.createElement('div');
  div.id = "graph" + n;
  div.classList.add('graph');

  let title = document.createElement('select');
  title.for = "canvas" + n;
  title.id = "titleCanvas" + n;
  let nullC = document.createElement("option");
  nullC.innerHTML = "Seleccione canal";
  nullC.value = "null";
  title.appendChild(nullC);
  div.appendChild(title);

  let buttonZOut = document.createElement('button');
  buttonZOut.id = "zOutButton" + n;
  buttonZOut.classList.add('zoomOut');
  div.appendChild(buttonZOut);
  let buttonZIn = document.createElement('button');
  buttonZIn.id = "zInButton" + n;
  buttonZIn.classList.add('zoomIn');
  div.appendChild(buttonZIn);

  let canvas = document.createElement('canvas');
  canvas.id = "canvas" + n;
  canvas.width = width;
  canvas.height = height;
  div.appendChild(canvas);

  let info = document.createElement('p');
  info.id = "infoCanvas" + n;
  info.innerHTML = "Información:"
  div.appendChild(info);

  document.getElementById('graph').insertBefore(div, document.getElementById('graphButtons'));

  graphs.push(new Graph(document.getElementById("canvas"+n), document.getElementById("titleCanvas"+n), document.getElementById("infoCanvas"+n)));

  document.getElementById("zInButton" + n).onclick = () => graphs[n-1].scaleUp();
  document.getElementById("zOutButton" + n).onclick = () => graphs[n-1].scaleDown();

  document.getElementById("titleCanvas" + n).onchange = function () {
    let indexC;
    /* Previous channel */
    if (graphs[n-1].channel == "null") this.removeChild(this.options[0]);
    else {
      indexC = channels.findIndex(channel => channel.channel == graphs[n-1].channel);
      if (indexC > -1 && channels[indexC].n == 1) channels.splice(indexC, 1);
      else if(indexC > -1) channels[indexC].n--;
    }
    /* New channel */
    graphs[n-1].channel = this.value;
    indexC = channels.findIndex(channel => channel.channel == this.value);
    if (indexC > -1) channels[indexC].n++;
    else channels.push({'channel': this.value, 'n': 1});
  };

  listGraphChannels(channels);
}

function removeGraph(){
  document.getElementById('graph').removeChild(document.getElementById("graph" + graphs.length));
  graphs.pop();
}

addGraph();

/* 
* Pendiente: translado del almacenamiento de datos al main.js 
*/

var time;
var content = [];

/* Funcionalidad del botón: Grabar */
function button_toggleRecord() {
  if (recording == false) {
    time = new Date();
    recording = true;
    content = [];
    document.getElementById("rec").style.backgroundColor = "red";
    document.getElementById("rec").innerText = "recording";
  }
  else if (recording == true) {
    recording = false;
    document.getElementById("rec").style.backgroundColor = "darkred";
    document.getElementById("rec").innerText = "Grabar";
  }
}

/* Funcionalidad del botón: Descargar */
function button_download() {
  let stamp = time.getFullYear() + (time.getMonth() + 1) + time.getDate() + "-";
  stamp += time.getHours() + time.getMinutes() + time.getSeconds();
  filename = "datos-" + stamp + ".txt";
  var blob = new Blob([JSON.stringify(content)], {
    type: "text/plain;charset=utf-8"
  });

  saveAs(blob, filename);
}



