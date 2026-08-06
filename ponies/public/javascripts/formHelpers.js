var clearAccessoriesCheckbox = document.getElementById('clear-accessories');
var accessoriesSelectField = document.getElementById('accessories-select');
var otherEventTypeTextField = document.getElementById('other-event-type');
var eventTypeSelectField = document.getElementById('event-type-select');
var eventTypePlaceholder = document.getElementById('event-type-placeholder');
var resetOtherEventLabel = document.getElementById('event-type-reset-label');
var resetOtherEventBox = document.getElementById('event-type-reset-box');
var resetOtherAccessoryLabel = document.getElementById('other-accessory-reset-label');
var resetOtherAccessoryBox = document.getElementById('other-accessory-reset-box');
var otherAccessoryTextLabel = document.getElementById('other-accessory-label');
var otherAccessoryTextField = document.getElementById('other-accessory');
let lastSelectedAccessory = [];

function hideOtherAccessoryElements() {
    otherAccessoryTextLabel.style.display = 'none';
    otherAccessoryTextField.style.display = 'none';
    otherAccessoryTextField.value = '';
}

if(accessoriesSelectField && otherAccessoryTextLabel && otherAccessoryTextField) {
    accessoriesSelectField.addEventListener('change', function(event) {
        event.preventDefault();
        event.stopPropagation();
        const currentSelected = Array.from(event.target.selectedOptions).map(opt => opt.text);
        const newlySelected = currentSelected.find(text => !lastSelectedAccessory.includes(text));
        console.log(`current selected:  ${currentSelected}, newly selected: ${newlySelected}`)
        if(newlySelected === 'Other') {
            otherAccessoryTextLabel.style.display = 'block';
            otherAccessoryTextField.style.display = 'block';
            otherAccessoryTextField.focus();
        } else if(!currentSelected.includes('Other')) {
            hideOtherAccessoryElements();
        }
        lastSelectedAccessory = currentSelected;
    });
}

if(clearAccessoriesCheckbox && accessoriesSelectField && otherAccessoryTextLabel && otherAccessoryTextField) {
    clearAccessoriesCheckbox.addEventListener('change', function(event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.target.checked) {
            console.log('Checkbox is checked! ✅');
            accessoriesSelectField.selectedIndex = -1;
            hideOtherAccessoryElements();
            lastSelectedAccessory = [];
            setTimeout(() => { event.target.checked = false; }, 2000);
        }
    });
}

if(accessoriesSelectField && clearAccessoriesCheckbox) {
    accessoriesSelectField.addEventListener('change', function(event) {
        event.preventDefault();
        event.stopPropagation();
        clearAccessoriesCheckbox.checked = false;
    });
}

if(otherEventTypeTextField && eventTypeSelectField && resetOtherEventBox && resetOtherEventLabel) {
    eventTypeSelectField.addEventListener('change', function(event) {
        event.preventDefault();
        event.stopPropagation();
        const selectElement = event.target;
        const text = selectElement.options[selectElement.selectedIndex].text;
        if(text === 'Other') {
            selectElement.style.display = 'none';
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
            resetOtherEventLabel.style.display = 'none';
            resetOtherEventBox.style.display = 'none';
            eventTypeSelectField.style.display = 'block';
            otherEventTypeTextField.style.display = 'none';
            otherEventTypeTextField.value = '';
            eventTypeSelectField.selectedIndex = -1;
        }
    });
}

