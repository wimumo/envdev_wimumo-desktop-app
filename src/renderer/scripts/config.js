

/* Funciones de Config */

// Actualizar elementos cuando la conexion para

const noneConnectedMessage = ' - No hay ningún dispositivo conectado actualmente. ';

function onConnectionLostConfig(){
    document.getElementById("estado").innerHTML = noneConnectedMessage;
    document.getElementById("redireccion_activada").style.display = 'none';
    info_reported = false;
    
}

// Reportar estado del wimumo en config

var info_reported = false;

function reportInfo(data){

    // Primera vez que se comunica el wimumo
    if (info_reported == false && data[0] == base_route + "/info") {
        info_reported = true;
        var cad = "";

        cad += "WIMUMO " + data[0].substring(7, 10) + " " + "<mark>detectado</mark>! <br> En IP ";
        cad += data[1];

        if (data[2] == "false") {
          cad += '<br> NO está enviando datos (configure manualmente o presione "autoconfigurar")';
        }  else {
          cad += '<br> Enviando datos a: ';
          cad += data[3] + ":" + data[4];
        }

        cad += '<br> Nivel de batería aproximado: <span id="nivel_batt"></span>';

        document.getElementById("estado").innerHTML = cad;
  
        // Avisa si la redireccion esta activa mientras esten mandando datos.
        document.getElementById("redireccion_activada").style.display = 'inline';

      }

      // Conexion activa, actualiza informacion variable
      if (info_reported == true && data[0] == base_route + "/info" && typeof filt_batt !== 'undefined') {
        var nivel_batt = data[5];

        nivel_batt = filt_batt.nuevoDato(nivel_batt);

        if(nivel_batt<0) nivel_batt = 0;
        if(nivel_batt>100) nivel_batt = 100;

        var nivel_batt_pc = "";
        nivel_batt_pc += parseInt(nivel_batt) + "%";

        document.getElementById("nivel_batt").innerHTML = nivel_batt_pc;
      }
    
}