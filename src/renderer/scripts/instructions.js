window.api.send('get-iplocal');

window.api.receive('iplocal', (data) => {
    document.getElementById('instrucciones_iplocal').innerHTML =
        //"(si la autodetección funciona puede ser: <mark>" + data[0] + "</mark>)";
        data[0];
});

const guiasMainDiv = document.getElementById('guiasMainDiv');
const configGuideDiv = document.getElementById('configGuideDiv');

function guiaConfig() {
    guiasMainDiv.setAttribute('hidden', '');
    configGuideDiv.removeAttribute('hidden');
}

function homeGuia() {
    configGuideDiv.setAttribute('hidden', '');
    guiasMainDiv.removeAttribute('hidden');
}

let currentStep = 1;
const totalSteps = 5; // Adjust this number according to the total number of steps
const nextButton = document.getElementById('nextButton');

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));

    // Show the current step
    const currentStepElement = document.getElementById(`step${step}`);
    currentStepElement.classList.add('active');

    // Update the button text when on the last step
    if (step === totalSteps) {
        nextButton.textContent = 'Terminar';
    } else {
        nextButton.textContent = 'Siguiente';
    }

    // Hide the button
    if (step === 1) {
        prevButton.setAttribute('hidden', '');
    } else {
        prevButton.removeAttribute('hidden');
    }
}

nextButton.addEventListener('click', () => {
    if (currentStep < totalSteps) { currentStep++ }
    showStep(currentStep);
});

prevButton.addEventListener('click', () => {
    if (currentStep > 1) { currentStep-- }
    showStep(currentStep);
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
        // Update the button text when on the last step
        if (step === totalSteps) {
            showStep(totalSteps);
            nextButton.textContent = 'Terminar';
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
