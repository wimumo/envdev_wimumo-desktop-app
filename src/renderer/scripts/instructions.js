// Conseguir IP Local
window.api.send('get-iplocal');

window.api.receive('iplocal', (data) => {
    document.getElementById('instrucciones_iplocal').innerHTML =
        //"(si la autodetección funciona puede ser: <mark>" + data[0] + "</mark>)";
        data[0];
});

// funciones de uso por el index
const guiasMainDiv = document.getElementById('guiasMainDiv');
const configGuideDiv = document.getElementById('configGuideDiv');
const phoneConfigGuideDiv = document.getElementById('phoneConfigGuideDiv');
const compConfigGuideDiv = document.getElementById('compConfigGuideDiv');
const WIMUMOInfoDiv = document.getElementById('WIMUMOInfoDiv');

const guideBackButtons = document.getElementById('guideBackButtons');
const guideFooter = document.getElementById('guideFooter');

function hideAllGuides() {
    guiasMainDiv.setAttribute('hidden', '');
    configGuideDiv.setAttribute('hidden', '');
    phoneConfigGuideDiv.setAttribute('hidden', '');
    compConfigGuideDiv.setAttribute('hidden', '');
    WIMUMOInfoDiv.setAttribute('hidden', '');
    guideBackButtons.setAttribute('hidden', '');
    guideFooter.setAttribute('hidden', '');
}

// Gias de configuracion
function guiaConfig() {
    hideAllGuides();

    configGuideDiv.removeAttribute('hidden');
}
function guiaConfigPhone() {
    hideAllGuides();

    phoneConfigGuideDiv.removeAttribute('hidden');
    guideBackButtons.removeAttribute('hidden');

    // logica de los pasos
    ///showStep(1);
    setUpGuide(totalStepsPhone, stepIdsPhone, buttonIdsPhone, checkboxIdsPhone);
    showStep(currentStep);
}
function guiaConfigComp() {
    hideAllGuides();

    compConfigGuideDiv.removeAttribute('hidden');
    guideBackButtons.removeAttribute('hidden');

    // logica de los pasos
    ///showStep(1);
    setUpGuide(totalStepsComp, stepIdsComp, buttonIdsComp, checkboxIdsComp);
    showStep(currentStep);
}

// Que es wimumo
function WIMUMOInfo() {
    hideAllGuides();

    WIMUMOInfoDiv.removeAttribute('hidden');
    guideBackButtons.removeAttribute('hidden');
}

// Lista de guias
function homeGuia() {
    hideAllGuides();

    guiasMainDiv.removeAttribute('hidden');
    guideFooter.removeAttribute('hidden');
}

document.getElementById('WIMUMOPageButton').addEventListener('click', function () {
    window.open('https://gibic.ing.unlp.edu.ar/wimumo', '_blank');
});


/* 
*   Logica guias de Configuracion de dispositivo 
*/

// constantes de la guia con telefono
const totalStepsPhone = 5;
const stepIdsPhone = ['stepP1', 'stepP2', 'stepP3', 'stepP4', 'stepP5'];
const buttonIdsPhone = ['nextButtonPh', 'prevButtonPh'];
const checkboxIdsPhone = [
    'confCheckPh1',
    'confCheckPh2',
    'confCheckPh3',
    'confCheckPh4',
    'confCheckPh5'
];
///const nextButtonPhone = document.getElementById('nextButtonPh');
///const prevButtonPhone = document.getElementById('prevButtonPh');

// constantes de la guia con la maquina
const totalStepsComp = 5;
const stepIdsComp = ['stepC1', 'stepC2', 'stepC3', 'stepC4', 'stepC5'];
const buttonIdsComp = ['nextButtonComp', 'prevButtonComp'];
const checkboxIdsComp = [
    'confCheckCo1',
    'confCheckCo2',
    'confCheckCo3',
    'confCheckCo4',
    'confCheckCo5'
];
///const nextButtonComp = document.getElementById('nextButtonComp');
///const prevButtonComp = document.getElementById('prevButtonComp');

// variables
let currentStep = 1;
let totalSteps; // se inicializa antes de usarse
let botonTerminarActivo = false;

const steps = [];
let nextButton;
let prevButton;
const checkboxes = [];


function setUpGuide(totalStp, stpIds, btnIds, chkboxIds) {
    currentStep = 1;
    totalSteps = totalStp;

    steps.length = 0;
    stpIds.forEach((id) => {
        steps.push(document.getElementById(id));
    });

    nextButton = document.getElementById(btnIds[0]);
    prevButton = document.getElementById(btnIds[1]);
    toggleTerminarBtn(false);

    uncheckAllCheckboxes();
    checkboxes.length = 0;
    chkboxIds.forEach((id) => {
        checkboxes.push(document.getElementById(id));
    });

    checkboxes.forEach((checkbox, index) => {
        // Agrega la funcionalidad a cada checkbox
        checkbox.addEventListener('change', function () {
            onChange(this.checked, index + 1);  // Pass checked state and index (1-based)
        });
    });
}

function toggleTerminarBtn(bool) {
    if (bool) {
        botonTerminarActivo = true;
        nextButton.textContent = 'Terminar';
    } else {
        botonTerminarActivo = false;
        nextButton.textContent = 'Siguiente';
    }
}

function toggleVisibilityPreviousBtn(bool) {
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


function showStep(step) {
    /* Se encarga de mostrar el paso activo en un guia, toma como parametro un String que determina la guia*/
    // Esconder todos los pasos
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));

    // Show the current step
    //const currentStepElement = document.getElementById(`step${step}`);
    const currentStepElement = steps[step - 1];
    currentStepElement.classList.add('active');

    // Hide the "previous" button if it is the first step
    toggleVisibilityPreviousBtn(step === 1);

    currentStep = step;
}

function nextButtonOnClick() {
    if (botonTerminarActivo) { homeGuia() };
    if (currentStep <= totalSteps) {
        checkboxes[(currentStep - 1)].checked = true;
        checkCheckbox(currentStep);
    }
}

function prevButtonOnClick() {
    if (currentStep > 1) { currentStep-- }
    checkboxes[currentStep - 1].checked = false;
    uncheckCheckbox(currentStep);
}


// Checkbox handling

function checkCheckbox(step) {
    if ((step + 1) <= totalSteps) {
        showStep(step + 1);
    } else {
        // Actualizar en el ultimo paso
        if (step === totalSteps) {
            showStep(totalSteps);
            toggleTerminarBtn(true);
        }
    }

    // Permite checkear varias checkboxes al mismo tiempo o ir varios pasos para atras
    checkboxes.forEach((checkbox, index) => {
        if ((index + 1) < step) checkbox.checked = true;
    })
}

function uncheckCheckbox(step) {
    showStep(step);

    // Permite ir varios pasos para atras
    checkboxes.forEach((checkbox, index) => {
        if ((index + 1) > step) checkbox.checked = false;
    })

    // Volver del ultimo paso
    if (botonTerminarActivo) {
        toggleTerminarBtn(false)
    }
}

function onChange(checked, checkboxId) {
    if (checked) {
        checkCheckbox(checkboxId);  // Call the function for checked state
    } else {
        uncheckCheckbox(checkboxId);  // Call the function for unchecked state
    }
}

