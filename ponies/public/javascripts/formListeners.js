
const otherEventTypeTextField = document.getElementById('other-event-type');
const eventTypeSelectField = document.getElementById('event-type-select');
const eventTypePlaceholder = document.getElementById('event-type-placeholder');
const resetOtherEventLabel = document.getElementById('event-type-reset-label');
const resetOtherEventBox = document.getElementById('event-type-reset-box');
const accessoriesSelectFields = document.querySelectorAll('[id^="accessories-select"]');
const ponyCheckboxes = document.querySelectorAll('input[id^="pony-checkbox"]');
const clearAllAccessoriesCheckboxes = document.querySelectorAll('input[id^="clear-accessories-input"]');
const clearOtherAccessoriesCheckboxes = document.querySelectorAll('input[id^="other-accessory-reset-box-input"]');
const submitButton = document.getElementById('submit-button');
const eventStartField = document.getElementById('event-start');
const eventEndField = document.getElementById('event-end');
const zipcodeInput = document.getElementById('zipcode');
const OtherEventDiv = document.getElementById('other-event-type-clear');
const eventLocationField = document.getElementById('event-location-select');
const yourDetailsDiv = document.getElementById('your-details-container');
const venueDetailsDiv = document.getElementById('venue-details-container');

//const homeCityInput = document.getElementById('home-city');
//const homeStateInput = document.getElementById('home-state');

let ponyDiv = {};
let allCurrentlySelected = {};
let otherAccessoryDiv = {};
let otherAccessoryLabel = {};
let otherAccessoryInput = {};
let otherAccessoryResetBox = {};
let selectField = {};
let selectFieldOtherOption = {};
let ponyRoleInput = {};
let allAccessoriesClearDiv = {};
let otherAccessoryClearDiv = {};

function getPony(event) {
    return event.target.id.split('-').pop();
}

/*
if( zipcodeInput && cityInput && stateInput ) {
    zipcodeInput.addEventListener('blur', async function(event) {
        const zipcode = event.target.value; //front end validates inputs
        console.log(`zipcodeInput event listener:  zipcode is ${zipcode}`)
        try {
            const zipParam = new URLSearchParams({ zipcode });
            const res = await fetch(`/api/city-address?${zipParam}`);
            if (!res.ok) {
                const errorText = await res.text();
                console.log(`Server returned ${res.status}: ${errorText}`);
                throw new Error(`Server returned ${res.status}`); // Check for 500 errors
            }
            const cityAddress = await res.json();
            cityAddress.forEach(({ stateId: { name: stateName }, cityId: { name: cityName } }) => {
                console.log(`city and state are ${cityName}//${stateName}`)
                stateInput.value = stateName;
                cityInput.value = cityName;
            });
            console.log(`fetch returned city address:  ${JSON.stringify(cityAddress)}`)
        } catch(e) { console.error("Error fetching city address", e); }


    })
}
*/
function activateAllPonyAccessoryElements(pony) {
    ponyDiv[pony].style.display = 'block';
    selectField[pony].style.display = 'block';
    allAccessoriesClearDiv[pony].style.display = 'flex';
    ponyRoleInput[pony].setAttribute('required', '');
    selectField[pony].setAttribute('required', '');
    selectField[pony].selectedIndex = -1;
    deactivateOtherAccessoryElements(pony)
}

function clearAllPonyAccessoryElements(pony) {
    selectField[pony].selectedIndex = -1;
    deactivateOtherAccessoryElements(pony)
}

/*
function deactivateAllPonyAccessoryElements(pony) {
    selectField[pony].style.display = 'none';
    allAccessoriesClearDiv[pony].style.display = 'none';
    ponyRoleInput[pony].removeAttribute('required');
    selectField[pony].removeAttribute('required');
    selectField[pony].selectedIndex = -1;
    deactivateOtherAccessoryElements(pony)
}
*/

function activateAllPonyElements(pony) {
    activateAllPonyAccessoryElements(pony);
    ponyRoleInput[pony].style.display = 'block';
    ponyRoleInput[pony].value = '';
}

function deactivateAllPonyElements(pony) {
    clearAllPonyAccessoryElements(pony);
    ponyDiv[pony].style.display = 'none';
    ponyRoleInput[pony].style.display = 'none';
    ponyRoleInput[pony].value = '';
}

function deactivateOtherAccessoryElements(pony) {
    otherAccessoryClearDiv[pony].style.display = 'none';
    otherAccessoryDiv[pony].style.display = 'none';
    otherAccessoryLabel[pony].style.display = 'none';
    otherAccessoryInput[pony].style.display = 'none';
    otherAccessoryResetBox[pony].style.display = 'none';
    otherAccessoryInput[pony].removeAttribute('required');
    otherAccessoryInput[pony].value = '';
    otherAccessoryResetBox[pony].checked = false;
}

function activateOtherAccessoryElements(pony) {
    otherAccessoryClearDiv[pony].style.display = 'flex';
    otherAccessoryClearDiv[pony].style.alignItems = 'center';
    otherAccessoryDiv[pony].style.display = 'flex';
    otherAccessoryInput[pony].focus();
    otherAccessoryLabel[pony].style.display = 'block';
    otherAccessoryInput[pony].style.display = 'block';
    otherAccessoryResetBox[pony].style.display = 'block';
    otherAccessoryInput[pony].setAttribute('required', '');
    otherAccessoryInput[pony].value = '';
    otherAccessoryResetBox[pony].checked = false;
}

clearAllAccessoriesCheckboxes.forEach(field => {
    field.addEventListener('change', function(event) {
        event.preventDefault();
        event.stopPropagation();
        let pony = getPony(event);
        if (event.target.checked) {
            clearAllPonyAccessoryElements(pony)
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
            deactivateOtherAccessoryElements(pony)
            selectFieldOtherOption[pony].selected = false;
            console.log(`last selected for ${pony} is ${lastSelectedAccessory[pony]}`)
        }
    });
});
ponyCheckboxes.forEach((checkbox) => {
    let pony = checkbox.id.split('-').pop();
    allCurrentlySelected[pony] = [];
    ponyDiv[pony] = document.querySelector(`.input-group[id="${pony}"]`);
    allAccessoriesClearDiv[pony] = document.getElementById(`clear-div-accessories-${pony}`);
    otherAccessoryClearDiv[pony] = document.getElementById(`clear-div-other-accessory-${pony}`); 
    otherAccessoryDiv[pony] = document.getElementById(`other-accessory-${pony}`);
    otherAccessoryLabel[pony] = document.querySelector(`label[for="other-accessory-input-${pony}"]`);
    otherAccessoryInput[pony] = document.getElementById(`other-accessory-input-${pony}`);
    otherAccessoryResetBox[pony] = document.getElementById(`other-accessory-reset-box-input-${pony}`);
    selectField[pony] = document.querySelector(`#accessories-select-${pony}`);
    selectFieldOtherOption[pony] = Array.from(document.querySelectorAll(`#accessories-select-${pony} option`)).find(opt => opt.textContent.trim() === 'Other');
    ponyRoleInput[pony] = document.getElementById(`role-input-${pony}`);
});

ponyCheckboxes.forEach(field => {
    field.addEventListener('change', function(event) {
        event.preventDefault();
        event.stopPropagation();
        let pony = getPony(event);
        console.log(`pony is checked:  ${event.target.checked}`)
        if (event.target.checked) {
            activateAllPonyElements(pony)
        } else {
            deactivateAllPonyElements(pony);
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
        if(allCurrentlySelected[pony].includes('Other') ) {
            activateOtherAccessoryElements(pony);
        } else if(!allCurrentlySelected[pony].includes('Other')) {
            deactivateOtherAccessoryElements(pony);
        }
    });
});

if( eventLocationField && yourDetailsDiv && venueDetailsDiv ) {
    eventLocationField.addEventListener('change', function(event) {
        event.preventDefault();
        event.stopPropagation();
        let eventLocation = event.target.value;
        let venueFields = document.querySelectorAll('input[id^="venue-"');
        let homeFields = document.querySelectorAll('input[id^="Event-Home-"');
        if( eventLocation === 'My Home' ) {
            console.log( 'setting state for My Home...' )
            yourDetailsDiv.style.display = 'block';
            venueFields.forEach((field) => {
                field.removeAttribute('required');
            });
            venueDetailsDiv.style.display = 'none';
            homeFields.forEach((field) => {
                field.setAttribute( 'required', '' );
            });
        } else if( eventLocation === 'Another Venue' ) {
            venueDetailsDiv.style.display = 'block';
            venueFields.forEach((field) => {
                field.setAttribute( 'required', '' );
            });
        }
    });
}

if( eventEndField ) {
    eventEndField.addEventListener('blur', function(event) {
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

if(eventTypeSelectField && otherEventTypeTextField && resetOtherEventBox && resetOtherEventLabel && OtherEventDiv ) {
    eventTypeSelectField.addEventListener('change', function(event) {
        console.log('event type selection field listener starting...');
        event.preventDefault();
        event.stopPropagation();
        const selectElement = event.target;
        const text = selectElement.options[selectElement.selectedIndex].text;
        console.log(`event type ${text} selected...`)
        if(text === 'Other') {
            selectElement.style.display = 'none';
            OtherEventDiv.style.display = 'block';
            otherEventTypeTextField.setAttribute('required', '');
            otherEventTypeTextField.style.display = 'block';
            otherEventTypeTextField.focus();
            resetOtherEventLabel.style.display = 'block';
            resetOtherEventBox.style.display = 'block';
            resetOtherEventBox.checked = false;
        } else {
            otherEventTypeTextField.removeAttribute('required');
            otherEventTypeTextField.style.display = 'none';
        }
    });
}


if(resetOtherEventBox && resetOtherEventLabel && eventTypeSelectField) {
    resetOtherEventBox.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        if(event.target.checked) {
            otherEventTypeTextField.removeAttribute('required');
            otherEventTypeTextField.style.display = 'none';
            otherEventTypeTextField.value = '';
            resetOtherEventLabel.style.display = 'none';
            resetOtherEventBox.style.display = 'none';
            eventTypeSelectField.style.display = 'block';
            eventTypeSelectField.selectedIndex = 0;
        }
    });
}
