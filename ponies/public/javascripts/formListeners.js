
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
const canvas = document.querySelector('.signature-canvas');
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
let isDrawing = false;
let ctx = null;

if(canvas) {
    ctx = canvas.getContext('2d');
}

function getPony(event) {
    return event.target.id.split('-').pop();
}

function startDrawing(e) {
  isDrawing = true;
  const { x, y } = getCoordinates(e);
  ctx.beginPath();
  ctx.moveTo(x, y);
  e.preventDefault(); // Suppresses default scrolling behavior
}

function draw(e) {
  if (!isDrawing) return;
  const { x, y } = getCoordinates(e);
  ctx.lineTo(x, y);
  ctx.stroke();
  e.preventDefault();
}

function stopDrawing() {
  isDrawing = false;
  ctx.closePath();
}

// Helper: Extract actual X/Y coordinates relative to the canvas container
function getCoordinates(e) {
  const rect = canvas.getBoundingClientRect();
  
  // Use changedTouches for touch devices, otherwise fallback to mouse client coordinates
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function handleResize() {
  // 1. Back up existing signature paths if needed before the wipe
  
  // 2. Sync internal resolution to the new responsive CSS dimensions
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  
  // 3. Optional: Reconfigure context styles after canvas wipe
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
}

if(canvas && sigClearButton && sigSubmitButton) {

    // Configure drawing style
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';


    // Listen for window size shifts and mobile orientation flips
    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize on load

    // Desktop Mouse Event Listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Mobile/Tablet Touch Event Listeners 
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    // Clear signature canvas
    sigClearButton.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Package data and submit to server
    sigSubmitButton.addEventListener('click', async () => {
        //all these preceded by event are actually customer data--they are programmtically named for thus for efficiency
        const iframe = document.getElementById('waiver-form-iframe');
        const customerName = document.getElementById('customerName').value;
        const customerAddress = document.getElementById('customerAddress').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const customerChildData = document.getElementById('customerChildData').value;
        const iframeSrcElements = iframe.src.split('/');
        const waiverForm = iframeSrcElements[iframeSrcElements.length-1];
        if (!customerName) return alert('Please enter your name.');
        if (!customerAddress) return alert('Please enter your address.');
        if (!customerPhone) return alert('Please enter your phone.');
        if (!customerChildData) return alert('Please enter your child data.');

        // Convert canvas drawing to base64 encoded PDF
        const signatureImage = canvas.toDataURL('images/png');
        const response = await fetch('/sign-waiver', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerName,
                                   customerAddress,
                                   customerPhone,
                                   waiverForm,
                                   customerChildData,
                                   signatureImage })
        });

        if (!response.ok) {
            throw new Error('Download failed');
        } else if (response.ok) {
            // Trigger automatic file download of the server-generated PDF blob
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'signed_document.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

            const redirectUrl = response.headers.get('X-Redirect-To');            
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
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
