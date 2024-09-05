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

// Initialize the first step
showStep(currentStep);
