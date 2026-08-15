const otherEventTypeTextField = document.getElementById('other-event-type');
const eventTypeSelectField = document.getElementById('event-type-select');
const eventTypePlaceholder = document.getElementById('event-type-placeholder');
const resetOtherEventLabel = document.getElementById('event-type-reset-label');
const resetOtherEventBox = document.getElementById('event-type-reset-box');
const accessoriesSelectFields = document.querySelectorAll('[id^="accessories-select"]');
const clearOtherAccessoriesCheckboxes = document.querySelectorAll('[id^="other-accessory-reset-box"]');
const clearAllAccessoriesCheckboxes = document.querySelectorAll('input[id^="clear-accessories"]');
const ponyCheckboxes = document.querySelectorAll('input[id^="pony-checkbox"]');
const submitButton = document.getElementById('submit-button');
const eventStartField = document.getElementById('event-start');
const eventEndField = document.getElementById('event-end');
const canvas = document.getElementById('sig-canvas');
const sigClearButton = document.getElementById('sig-clear-btn');
const sigSubmitButton = document.getElementById('sig-submit-btn');

let allCurrentlySelected = {};
let otherAccessoryDiv = {};
let otherAccessoryLabel = {};
let otherAccessoryInput = {};
let otherAccessoryResetBox = {};
let selectField = {};
let selectFieldOtherOption = {};
let ponyRoleInput = {};

function getPony(event) {
    return event.target.id.split('-').pop();
}

if(canvas && sigClearButton && sigSubmitButton) {

    const ctx = canvas.getContext('2d');
    let isDrawing = false;

    // Configure drawing style
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Canvas drawing event listeners
    canvas.addEventListener('mousedown', (e) => { isDrawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); });
    canvas.addEventListener('mousemove', (e) => { if (isDrawing) { ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); } });
    window.addEventListener('mouseup', () => isDrawing = false);

    // Clear signature canvas
    sigClearButton.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Package data and submit to server
    sigSubmitButton.addEventListener('click', async () => {
        const nameInput = document.getElementById('name').value;
        if (!nameInput) return alert('Please enter your name.');

        // Convert canvas drawing to base64 encoded PDF
        const signatureImage = canvas.toDataURL('images/png');
        const response = await fetch('/sign-waiver', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: nameInput, signatureImage })
        });

        if (response.ok) {
            // Trigger automatic file download of the server-generated PDF blob
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'signed_document.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            alert('Error processing signature.');
        }
    });

} else {
    console.log('no canvas object');
}

if( eventEndField ) {
    eventEndField.addEventListener('blur', function(event) {
        event.preventDefault();
        event.stopPropagation();
        let eventStartDate = document.getElementById('event-start').value;
        let eventEndDate = event.target.value;
        if (eventStartDate && eventEndDate) {
            // Convert string inputs to Date objects
            const startDateTime = new Date(eventStartDate);
            const endDateTime = new Date(eventEndDate);

            // Extract numerical millisecond values for precise comparison
            const startTime = startDateTime.getTime();
            const endTime = endDateTime.getTime();

            if (startTime > endTime) {
                console.log("Start time is later than end time.");
                alert("end date/time is before start date/time")
            }
        }
    });
}

ponyCheckboxes.forEach((checkbox) => {
    let pony = checkbox.id.split('-').pop();
    allCurrentlySelected[pony] = [];
    otherAccessoryDiv[pony] = document.getElementById(`other-accessory-div-${pony}`);
    otherAccessoryLabel[pony] = document.getElementById(`other-accessory-label-${pony}`);
    otherAccessoryInput[pony] = document.getElementById(`other-accessory-input-${pony}`);
    otherAccessoryResetBox[pony] = document.getElementById(`other-accessory-reset-box-${pony}`);
    selectField[pony] = document.querySelector(`#accessories-select-${pony}`);
    selectFieldOtherOption[pony] = Array.from(document.querySelectorAll(`#accessories-select-${pony} option`)).find(opt => opt.textContent.trim() === 'Other');
    ponyRoleInput[pony] = document.getElementById(`pony-role-input-${pony}`);
});


ponyCheckboxes.forEach(field => {
    field.addEventListener('change', function(event) {
        event.preventDefault();
        event.stopPropagation();
        let pony = getPony(event);
        let ponyDiv = document.querySelector(`.field[id="${pony}"]`);
        console.log(`pony is checked:  ${event.target.checked}`)
        if (event.target.checked) {
            ponyDiv.style.display = 'block';
        } else {
            ponyDiv.style.display = 'none';
            selectField[pony].selectedIndex = -1;
            ponyRoleInput[pony].value = '';
        }
    });
});

accessoriesSelectFields.forEach(field => {
    field.addEventListener('change', function(event) {
        event.preventDefault();
        event.stopPropagation();
        let pony = getPony(event);
        allCurrentlySelected[pony] = Array.from(event.target.selectedOptions).map(opt => opt.text);
        console.log(`pony ${pony}, currently selected:  ${allCurrentlySelected[pony]}`)
        if(allCurrentlySelected[pony].includes('Other') && otherAccessoryDiv[pony].style.display === 'none') {
            otherAccessoryDiv[pony].style.display = 'block';
            otherAccessoryInput[pony].focus();
            otherAccessoryInput[pony].setAttribute('required', '');
            otherAccessoryInput[pony].value = '';
            otherAccessoryResetBox[pony].checked = false;
        } else if(!allCurrentlySelected[pony].includes('Other')) {
            otherAccessoryDiv[pony].style.display = 'none';
            otherAccessoryInput[pony].removeAttribute('required');
            otherAccessoryInput[pony].value = '';
            otherAccessoryResetBox[pony].checked = false;
        }
    });
});

clearAllAccessoriesCheckboxes.forEach(field => {
    field.addEventListener('change', function(event) {
        event.preventDefault();
        event.stopPropagation();
        let pony = getPony(event);
        if (event.target.checked) {
            selectField[pony].selectedIndex = -1;
            otherAccessoryInput[pony].removeAttribute('required');
            otherAccessoryInput[pony].value = '';
            otherAccessoryResetBox[pony].checked = false;
            otherAccessoryDiv[pony].style.display = 'none';
            setTimeout(() => { event.target.checked = false; }, 2000);
        }
    });
});


clearOtherAccessoriesCheckboxes.forEach(field => {
    field.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        let pony = event.target.id.split('-').pop();
        if (event.target.checked) {
            otherAccessoryInput[pony].removeAttribute('required');
            otherAccessoryInput[pony].value = '';
            selectFieldOtherOption[pony].selected = false;
            otherAccessoryDiv[pony].style.display = 'none';
            console.log(`last selected for ${pony} is ${lastSelectedAccessory[pony]}`)
        }
    });
});

if(otherEventTypeTextField && eventTypeSelectField && resetOtherEventBox && resetOtherEventLabel) {
    eventTypeSelectField.addEventListener('change', function(event) {
        console.log('event type selection field listener starting...');
        event.preventDefault();
        event.stopPropagation();
        const selectElement = event.target;
        const text = selectElement.options[selectElement.selectedIndex].text;
        console.log(`event type ${text} selected...`)
        if(text === 'Other') {
            selectElement.style.display = 'none';
            otherEventTypeTextField.setAttribute('required', '');
            otherEventTypeTextField.style.display = 'block';
            otherEventTypeTextField.focus();
            resetOtherEventLabel.style.display = 'block';
            resetOtherEventBox.style.display = 'block';
        }
    });
}

if(resetOtherEventBox && resetOtherEventLabel && eventTypeSelectField) {
    resetOtherEventBox.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        if(event.target.checked) {
            otherEventTypeTextField.removeAttribute('required');
            resetOtherEventLabel.style.display = 'none';
            resetOtherEventBox.style.display = 'none';
            eventTypeSelectField.style.display = 'block';
            otherEventTypeTextField.style.display = 'none';
            otherEventTypeTextField.value = '';
            eventTypeSelectField.selectedIndex = -1;
        }
    });
}
