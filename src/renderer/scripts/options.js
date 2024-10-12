// Get the link element for the theme
const themeStyle = document.getElementById('theme-style');
const themes = ['ligth', 'dark']
const themeStylesheets = ['stylesheets/wimumoLight.css', 'stylesheets/wimumoDark.css']
let currentTheme = themes[0];

// Function to switch theme
function switchTheme(theme) {

  themes.forEach((auxTheme, index) => {  
    if (auxTheme === theme) {
      themeStyle.setAttribute('href', themeStylesheets[index]);
      currentTheme = themes[index];
    }
  });

}

// Dar funcionalidad a los botones
const ligthButton = document.getElementById('light-mode-btn');
const darkButton = document.getElementById('dark-mode-btn');

ligthButton.addEventListener('click', () => { switchTheme(themes[0]) });
darkButton.addEventListener('click', () => { switchTheme(themes[1]) });


// Function para cambiar fuente
const themeFontSize = document.getElementById('theme-font-size');
const fontSizes = ['small', 'medium', 'large'];
const fontStylesheets = ['stylesheets/wimumoFontSize1.css', 'stylesheets/wimumoFontSize2.css', 'stylesheets/wimumoFontSize3.css'];
let currentFontSize = fontSizes[1]; // por defecto medium

function switchFontSize(fontSize) {

  fontSizes.forEach((auxFontSize, index) => {  
    if( auxFontSize ==  fontSize) {
      themeFontSize.setAttribute('href', fontStylesheets[index]);
      currentFontSize = fontSizes[index];
      highligthFontButton(index);
    }
  })

}

// Dar funcionalidad a los botones
const smallFontButton = document.getElementById('font-change-1');
const mediumFontButton = document.getElementById('font-change-2');
const largeFontButton = document.getElementById('font-change-3');
const fontButtons = [smallFontButton, mediumFontButton, largeFontButton]

smallFontButton.addEventListener('click', () => { switchFontSize(fontSizes[0]) });
mediumFontButton.addEventListener('click', () => { switchFontSize(fontSizes[1]) });
largeFontButton.addEventListener('click', () => { switchFontSize(fontSizes[2]) });

function highligthFontButton( buttonIndex ) {
  fontButtons.forEach((button, index) => {  
    if ( buttonIndex === index ) {
      button.classList.add('selected');
    } else button.classList.remove('selected');
  });
}

// Recuperar opciones guardadas

window.api.receive('savedOptions', (data) => {
  configData = JSON.stringify(data);

  try {
      // Parsea el JSON string a un JavaScript array
      const dataArray = JSON.parse(configData);

      // Accede al primer elemento del array para encontrar el valor previo
      const theme = dataArray[0].theme;
      if ( !(themes.includes(theme)) ) { return }
      switchTheme(theme);

      // Repite el mismo proceso con la siguiente opcion
      const fontSize = dataArray[1].fontSize;
      if ( !(fontSizes.includes(fontSize)) ) { return }
      switchFontSize(fontSize);


  } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
  }

});


//Enviar a guardar opciones
window.addEventListener('beforeunload', (event) => {
  /* Antes de cerrar la app se deberia nguardar las direcciones objetivo que se hayan escrito. */
  ipcSend_saveOptions();
})

//Guardar opciones antes de cerrar la aplicacion
function ipcSend_saveOptions() {
  /* Esta funcion se encarga de guardar la configuracion de opciones en un archivo.  */
  /* Esta funcion se deberia llamar antes de cerrar la pagina.  */

  const options = [];

  options.push({ theme: currentTheme });
  options.push({ fontSize: currentFontSize });

  const data = options;
  window.api.send('save-options', data);
}