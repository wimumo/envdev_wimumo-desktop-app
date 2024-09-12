// Get the theme toggle checkbox and the link element for the theme
const themeToggle = document.getElementById('theme-toggle');
const themeStyle = document.getElementById('theme-style');

// Function to switch theme
function switchTheme(isDark) {
  if (isDark) {
    themeStyle.setAttribute('href', 'stylesheets/wimumoDark.css');
    //localStorage.setItem('theme', 'dark');
  } else {
    themeStyle.setAttribute('href', 'stylesheets/wimumoLight.css');
    //localStorage.setItem('theme', 'light');
  }
}


// Function para cambiar fuente
const inputFontSize = document.getElementById("font-size-input");
const themeFontSize = document.getElementById('theme-font-size');
function switchFontSize(fontSize) {
  if (fontSize == 1) {
    themeFontSize.setAttribute('href', 'stylesheets/wimumoFontSize1.css');
    //localStorage.setItem('theme', 'dark');
  } else if (fontSize == 2) {
    themeFontSize.setAttribute('href', 'stylesheets/wimumoFontSize2.css');
    //localStorage.setItem('theme', 'light');
  }
}

// Load the saved theme preference on startup
/*const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  themeToggle.checked = true;
  switchTheme(true);
} else {
  switchTheme(false);
}*/

// Add event listener to toggle switch
themeToggle.addEventListener('change', (event) => {
  switchTheme(event.target.checked);
});


inputFontSize.addEventListener("change", (event) => {
  switchFontSize(event.target.value);
});