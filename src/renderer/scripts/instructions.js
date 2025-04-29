
// Conseguir IP Local
/*window.api.send('get-iplocal');*/

let ipLocal = "";

function getIpLocal() {
    return ipLocal;
}

function detectarIpLocal() {
    window.api.send('get-iplocal');
}

window.api.receive('iplocal', (data) => {
    ipLocal = data[0];
    document.getElementById('instrucciones_iplocal1').innerHTML = ipLocal;
    document.getElementById('instrucciones_iplocal2').innerHTML = ipLocal;
    document.getElementById('instrucciones_iplocal3').innerHTML = ipLocal;
    document.getElementById('IPparagraph1').removeAttribute('hidden');
    document.getElementById('IPparagraph2').removeAttribute('hidden');
    document.getElementById('IPparagraph3').removeAttribute('hidden');
})

/*
*   Funciones para ver guias. Usadas por el indice
*/

// divs
const guiasMainDiv = document.getElementById('guiasMainDiv');               // Pagina principal de guias
const configGuideDiv = document.getElementById('configGuideDiv');           // primera pantalla de congif wimumo
const phoneConfigGuideDiv = document.getElementById('phoneConfigGuideDiv'); // guia con celular
const compConfigGuideDiv = document.getElementById('compConfigGuideDiv');   // guia con misma maquina
const WIMUMOInfoDiv = document.getElementById('WIMUMOInfoDiv');             // Informacion del wimumo

const guideBackButtons = document.getElementById('guideBackButtons');       // Botones para volver atras de una guia
const guideFooter = document.getElementById('guideFooter');                 // footer

// buttons
const confCompuBtn = document.getElementById('confCompuBtn');
const confPhoneBtn = document.getElementById('confPhoneBtn');
const confBtn = document.getElementById('confBtn');


function hideAllGuides() {
    /* Antes de mostrar una guia siempre se necesita esconder el resto */
    guiasMainDiv.setAttribute('hidden', '');
    configGuideDiv.setAttribute('hidden', '');
    phoneConfigGuideDiv.setAttribute('hidden', '');
    compConfigGuideDiv.setAttribute('hidden', '');
    WIMUMOInfoDiv.setAttribute('hidden', '');
    guideBackButtons.setAttribute('hidden', '');
    guideFooter.setAttribute('hidden', '');

    confCompuBtn.setAttribute('hidden', '');
    confPhoneBtn.setAttribute('hidden', '');
    confBtn.setAttribute('hidden', '');
}

function homeGuia() {
    /* Muestra todas las guias */
    hideAllGuides();

    showElement([guiasMainDiv, guideFooter]);
}

function guiaConfig() {
    /* Primera pagina de la guia de configuracion, delega a guiaConfigPhone o guiaConfigComp */
    hideAllGuides();

    showElement([configGuideDiv]);
}
function guiaConfigPhone() {
    /* Guia de configuracion usando un telefono */
    hideAllGuides();

    showElement([phoneConfigGuideDiv, guideBackButtons, confCompuBtn, guideFooter]);

    setUpGuide(totalStepsPhone, stepIdsPhone, buttonIdsPhone, checkboxIdsPhone, buttonContainerIdsPhone);    // Preparar la guia dinamica
}
function guiaConfigComp() {
    /* Guia de configuracion usando la misma maquina */
    hideAllGuides();

    showElement([compConfigGuideDiv, guideBackButtons, confPhoneBtn, guideFooter]);

    // Preparar la guia dinamica
    setUpGuide(totalStepsComp, stepIdsComp, buttonIdsComp, checkboxIdsComp, buttonContainerIdsComp);        // Preparar la guia dinamica
}

function WIMUMOInfo() {
    /* Informacion sobre el dispositivo */
    hideAllGuides();

    showElement([WIMUMOInfoDiv, guideBackButtons, confBtn, guideFooter]);
}


document.getElementById('WIMUMOPageButton').addEventListener('click', function () {
    window.open('https://gibic.ing.unlp.edu.ar/wimumo', '_blank');
});

document.getElementById('WIMUMOPageButton1').addEventListener('click', function () {
    window.open('https://gibic.ing.unlp.edu.ar/wimumo', '_blank');
});

document.getElementById('configManualBtn').addEventListener('click', function () {
    window.open('https://github.com/wimumo/wimumo.github.io/blob/main/Documentacion/Manual.pdf', '_blank');
});



function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth" // Use "smooth" for a smooth scroll or "auto" for an instant scroll
    });
}

function showElement(ArrayOfElements) {
    ArrayOfElements.forEach((element) => {
        element.removeAttribute('hidden');
    });
    scrollToTop();
}

/* 
*   Logica para guias dinamicas 
*/

// constantes de la guia con telefono
const totalStepsPhone = 7;
const stepIdsPhone = ['stepP0', 'stepP1', 'stepP2', 'stepP3', 'stepP4', 'stepP5', 'stepP6'];
const buttonIdsPhone = ['nextButtonPh', 'prevButtonPh', 'IPButtonPhone-activeStep4'];
const checkboxIdsPhone = ['confCheckPh0', 'confCheckPh1', 'confCheckPh2', 'confCheckPh3', 'confCheckPh4', 'confCheckPh5', 'confCheckPh6'];
const buttonContainerIdsPhone = ['btn-container-P0', 'btn-container-P1', 'btn-container-P2', 'btn-container-P3', 'btn-container-P4', 'btn-container-P5', 'btn-container-P6'];

// constantes de la guia con la maquina
const totalStepsComp = 8;
const stepIdsComp = ['stepC_0', 'stepC_1', 'stepC_2', 'stepC_3', 'stepC_4', 'stepC_5', 'stepC_6', 'stepC_7'];
const buttonIdsComp = ['nextButtonComp', 'prevButtonComp', 'IPButtonComp-activeStep1'];
const checkboxIdsComp = ['confCheckCo0', 'confCheckCo1', 'confCheckCo2', 'confCheckCo3', 'confCheckCo4', 'confCheckCo5', 'confCheckCo6', 'confCheckCo7'];
const buttonContainerIdsComp = ['btn-container-C0', 'btn-container-C1', 'btn-container-C2', 'btn-container-C3', 'btn-container-C4', 'btn-container-C5', 'btn-container-C6', 'btn-container-C7'];

// variables dinamicas
let currentStep = 1;
let totalSteps;
let botonTerminarActivo = false;

// referencias a la pagina actual
const steps = [];
let nextButton;
let prevButton;
let ipButton;
const checkboxes = [];
const buttonContainers = [];


function setUpGuide(totalStp, stpIds, btnIds, chkboxIds, btnContainerIds) {
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
    ipButton = document.getElementById(btnIds[2]);
    toggleTerminarBtn(false);

    uncheckAllCheckboxes();
    checkboxes.length = 0;
    chkboxIds.forEach((id) => {
        checkboxes.push(document.getElementById(id));
    });

    // Agrega la funcionalidad a cada checkbox
    checkboxes.forEach((checkbox, index) => {
        checkbox.addEventListener('change', function () {
            onChange(this, index + 1);

        });
    });

    buttonContainers.length = 0;
    btnContainerIds.forEach((id) => {
        buttonContainers.push(document.getElementById(id));
    });


    // Inicializa la guia en el primer paso
    showStep(currentStep);
}

// Funciones utiles
function toggleTerminarBtn(bool) {
    if (bool) {
        botonTerminarActivo = true;
        nextButton.textContent = 'Terminar';
        nextButton.classList.add('terminar-active');
    } else {
        botonTerminarActivo = false;
        nextButton.textContent = 'Siguiente';
        nextButton.classList.remove('terminar-active');
    }
}

/*function togglePreviousBtn(bool) {
    if (bool) {
        prevButton.setAttribute('hidden', '');
    } else {
        prevButton.removeAttribute('hidden');
    }
}*/

function toggleDetectarIPBtn(index) {
    let idBtn = ipButton.id;
    let lastChar = idBtn.charAt(idBtn.length - 1);

    ipButton.classList.toggle('inactive', (index-1) != lastChar);
    //ipButton.textContent = lastChar;
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
    currentStepElement.setAttribute("aria-hidden", "false");

    currentStepElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center' // or 'start', 'end', or 'nearest' 
    });


    //togglePreviousBtn(step === 1);                          // Esconde el boton "previo" en el primer paso

    checkboxes.forEach((checkbox, index) => {
        if ((index + 1) < step) checkbox.checked = true;    // Checkea las checkboxes previas por si hubo un salto
    })

    toggleDetectarIPBtn(step);                        // Deja el boton gris o no

    hideAllBtnContainers();                                 // Mueve los botones prev y siguiente
    showBtnContainer(step - 1);

    currentStep = step;

}

// button handlers
function hideAllBtnContainers() {
    buttonContainers.forEach((btnC) => {
        btnC.setAttribute('hidden', '');
    });
}

function showBtnContainer(index) {
    buttonContainers[index].removeAttribute('hidden');
    if (index + 1 === totalSteps) toggleTerminarBtn(true);
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

function onChange(checkbox, checkboxId) {
    checkbox.setAttribute("aria-checked", !checkbox.checked ? "true" : "false"); // Screen reader lee las checkbox al reves, esto lo soluciona
    if (checkbox.checked) {
        onCheckCheckbox(checkboxId);
    } else {
        onUncheckCheckbox(checkboxId);
    }
}

// Button handlers

function nextButtonOnClick() {
    if (botonTerminarActivo) { body_exchange('HomePage') };                // Si es el ultimo paso entonces vuelve al inicio
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


// hidden paragraphs

// Select the "Problemas comunes" paragraph and hidden paragraphs
function verMas(id) {
    const verMasElements = document.querySelectorAll(`p[id^='${id}'], a[id^='${id}']`);

    verMasElements.forEach(element => {
        element.hidden = !element.hidden;
    });
}

//Fuerza al boton a amantenerse azul mientras esta abierta la ayuda
function toggleActive(button) {
    button.classList.toggle('active');
}