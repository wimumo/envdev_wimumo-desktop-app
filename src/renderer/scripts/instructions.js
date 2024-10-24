// Conseguir IP Local
window.api.send('get-iplocal');

window.api.receive('iplocal', (data) => {
    document.getElementById('instrucciones_iplocal').innerHTML =
        //"(si la autodetección funciona puede ser: <mark>" + data[0] + "</mark>)";
        data[0];
});

/*
*   Funciones para ver guias. Usadas por el indice
*/

const guiasMainDiv = document.getElementById('guiasMainDiv');               // Pagina principal de guias
const configGuideDiv = document.getElementById('configGuideDiv');           // primera pantalla de congif wimumo
const phoneConfigGuideDiv = document.getElementById('phoneConfigGuideDiv'); // guia con celular
const compConfigGuideDiv = document.getElementById('compConfigGuideDiv');   // guia con misma maquina
const WIMUMOInfoDiv = document.getElementById('WIMUMOInfoDiv');             // Informacion del wimumo

const guideBackButtons = document.getElementById('guideBackButtons');       // Botones para volver atras de una guia
const guideFooter = document.getElementById('guideFooter');                 // footer

function hideAllGuides() {
    /* Antes de mostrar una guia siempre se necesita esconder el resto */
    guiasMainDiv.setAttribute('hidden', '');
    configGuideDiv.setAttribute('hidden', '');
    phoneConfigGuideDiv.setAttribute('hidden', '');
    compConfigGuideDiv.setAttribute('hidden', '');
    WIMUMOInfoDiv.setAttribute('hidden', '');
    guideBackButtons.setAttribute('hidden', '');
    guideFooter.setAttribute('hidden', '');
}

function homeGuia() {
    /* Muestra todas las guias */
    hideAllGuides();

    guiasMainDiv.removeAttribute('hidden');
    guideFooter.removeAttribute('hidden');
}

function guiaConfig() {
    /* Primera pagina de la guia de configuracion, delega a guiaConfigPhone o guiaConfigComp */
    hideAllGuides();

    configGuideDiv.removeAttribute('hidden');
}
function guiaConfigPhone() {
    /* Guia de configuracion usando un telefono */
    hideAllGuides();

    phoneConfigGuideDiv.removeAttribute('hidden');
    guideBackButtons.removeAttribute('hidden');

    setUpGuide(totalStepsPhone, stepIdsPhone, buttonIdsPhone, checkboxIdsPhone);    // Preparar la guia dinamica
}
function guiaConfigComp() {
    /* Guia de configuracion usando la misma maquina */
    hideAllGuides();

    compConfigGuideDiv.removeAttribute('hidden');
    guideBackButtons.removeAttribute('hidden');

    // Preparar la guia dinamica
    setUpGuide(totalStepsComp, stepIdsComp, buttonIdsComp, checkboxIdsComp);        // Preparar la guia dinamica
}

function WIMUMOInfo() {
    /* Informacion sobre el dispositivo */
    hideAllGuides();

    WIMUMOInfoDiv.removeAttribute('hidden');
    guideBackButtons.removeAttribute('hidden');
}


document.getElementById('WIMUMOPageButton').addEventListener('click', function () {
    window.open('https://gibic.ing.unlp.edu.ar/wimumo', '_blank');
});


/* 
*   Logica para guias dinamicas 
*/

// constantes de la guia con telefono
const totalStepsPhone = 5;
const stepIdsPhone = ['stepP1', 'stepP2', 'stepP3', 'stepP4', 'stepP5'];
const buttonIdsPhone = ['nextButtonPh', 'prevButtonPh'];
const checkboxIdsPhone = ['confCheckPh1', 'confCheckPh2', 'confCheckPh3', 'confCheckPh4', 'confCheckPh5'];

// constantes de la guia con la maquina
const totalStepsComp = 5;
const stepIdsComp = ['stepC1', 'stepC2', 'stepC3', 'stepC4', 'stepC5'];
const buttonIdsComp = ['nextButtonComp', 'prevButtonComp'];
const checkboxIdsComp = ['confCheckCo1', 'confCheckCo2', 'confCheckCo3', 'confCheckCo4', 'confCheckCo5'];

// variables dinamicas
let currentStep = 1;
let totalSteps;
let botonTerminarActivo = false;

// referencias a la pagina actual
const steps = [];
let nextButton;
let prevButton;
const checkboxes = [];


function setUpGuide(totalStp, stpIds, btnIds, chkboxIds) {
    /* Esta funcion existe para reiniciar e inicilizar todas las variables de una guia dinamica cuando se abre. */

    // Pasos de la guia
    currentStep = 1;
    totalSteps = totalStp;

    steps.length = 0;
    stpIds.forEach((id) => {
        steps.push(document.getElementById(id));
    });

    // Referencias a botones de la guia
    nextButton = document.getElementById(btnIds[0]);
    prevButton = document.getElementById(btnIds[1]);
    toggleTerminarBtn(false);

    uncheckAllCheckboxes();
    checkboxes.length = 0;
    chkboxIds.forEach((id) => {
        checkboxes.push(document.getElementById(id));
    });

    // Agrega la funcionalidad a cada checkbox
    checkboxes.forEach((checkbox, index) => {
        checkbox.addEventListener('change', function () {
            onChange(this.checked, index + 1);
        });
    });

    // Inicializa la guia en el primer paso
    showStep(currentStep);
}

// Funciones utiles
function toggleTerminarBtn(bool) {
    if (bool) {
        botonTerminarActivo = true;
        nextButton.textContent = 'Terminar';
    } else {
        botonTerminarActivo = false;
        nextButton.textContent = 'Siguiente';
    }
}

function togglePreviousBtn(bool) {
    if (bool) {
        prevButton.setAttribute('hidden', '');
    } else {
        prevButton.removeAttribute('hidden');
    }
}

function uncheckAllCheckboxes() {
    checkboxes.forEach((chk) => {
        chk.checked = false;
    });
}

// Funcion para mostrar pasos
function showStep(step) {
    /* Se encarga de mostrar el paso activo en un guia, toma como parametro un String que determina la guia*/

    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));    // Esconder todos los pasos

    const currentStepElement = steps[step - 1];
    currentStepElement.classList.add('active');             // Muestra el paso actual

    togglePreviousBtn(step === 1);                          // Esconde el boton "previo" en el primer paso

    checkboxes.forEach((checkbox, index) => {
        if ((index + 1) < step) checkbox.checked = true;    // Checkea las checkboxes previas por si hubo un salto
    })

    currentStep = step;
}

// Checkbox handlers

function onCheckCheckbox(step) {
    if ((step + 1) <= totalSteps) {
        showStep(step + 1);
    } else if (step === totalSteps) {
        showStep(totalSteps);
        toggleTerminarBtn(true);                            // Muestra el boton Terminar en el ultimo paso
    }
}

function onUncheckCheckbox(step) {
    showStep(step);

    checkboxes.forEach((checkbox, index) => {
        if ((index + 1) > step) checkbox.checked = false;   // Permite ir varios pasos para atras si hubo un salto
    })

    if (botonTerminarActivo) {                              
        toggleTerminarBtn(false);                            // Permite volver desde el ultimo paso
    }
}

function onChange(checked, checkboxId) {
    if (checked) {
        onCheckCheckbox(checkboxId);
    } else {
        onUncheckCheckbox(checkboxId);
    }
}

// Button handlers

function nextButtonOnClick() {
    if (botonTerminarActivo) { homeGuia() };                // Si es el ultimo paso entonces vuelve al inicio
    if (currentStep <= totalSteps) {
        checkboxes[(currentStep - 1)].checked = true;
        onCheckCheckbox(currentStep);
    }
}

function prevButtonOnClick() {
    if (currentStep > 1) {
        currentStep--;
        checkboxes[currentStep - 1].checked = false;
        onUncheckCheckbox(currentStep);
    }
}
