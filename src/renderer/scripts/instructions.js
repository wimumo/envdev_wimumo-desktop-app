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
}
function guiaConfigComp() {
    hideAllGuides();
    
    compConfigGuideDiv.removeAttribute('hidden');
    guideBackButtons.removeAttribute('hidden');
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

document.getElementById('WIMUMOPageButton').addEventListener('click', function() {
    window.open('https://gibic.ing.unlp.edu.ar/wimumo', '_blank');
});

// Guia de Configuracion de dispositivo

/*const pasos = [
    "",
    "",
    "",
    "",
    ""
]*/

let currentStep = 1;
const totalSteps = 5; // Adjust this number according to the total number of steps
const nextButton = document.getElementById('nextButton');

let botonTerminarActivo = false;

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));

    // Show the current step
    const currentStepElement = document.getElementById(`step${step}`);
    currentStepElement.classList.add('active');

    // Hide the button
    if (step === 1) {
        prevButton.setAttribute('hidden', '');
    } else {
        prevButton.removeAttribute('hidden');
    }
}

nextButton.addEventListener('click', () => {
    if (currentStep <= totalSteps) {
        checkboxes[(currentStep - 1)].checked = true;
        checkCheckbox(currentStep);
        currentStep++;
    } else if (botonTerminarActivo) { homeGuia() }
    

});

prevButton.addEventListener('click', () => {
    if (currentStep > 1) { currentStep-- }
    checkboxes[currentStep-1].checked = false;
    uncheckCheckbox(currentStep);
});




// Checkbox handling

const checkboxIds = [
    'configCheck1',
    'configCheck2',
    'configCheck3',
    'configCheck4',
    'configCheck5'
];

const checkboxes = [];
checkboxIds.forEach((id, index) => {
    checkboxes.push(document.getElementById(id));
});


function checkCheckbox(step) {
    if ((step + 1) <= totalSteps) {
        showStep(step + 1);
    } else {
        // Actualizar en el ultimo paso
        if (step === totalSteps) {
            showStep(totalSteps);
            nextButton.textContent = 'Terminar';
            botonTerminarActivo = true;
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
        botonTerminarActivo = false;
        nextButton.textContent = 'Siguiente';
    }
}

function onChange(checked, checkboxId) {
    if (checked) {
        checkCheckbox(checkboxId);  // Call the function for checked state
    } else {
        uncheckCheckbox(checkboxId);  // Call the function for unchecked state
    }
}

// initialize checkboxes
checkboxes.forEach((checkbox, index) => {
    // Agrega la funcionalidad a cada checkbox
    checkbox.addEventListener('change', function () {
        onChange(this.checked, index + 1);  // Pass checked state and index (1-based)
    });
});

// Initialize the first step
showStep(currentStep);
