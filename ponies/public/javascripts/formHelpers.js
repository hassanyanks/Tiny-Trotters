var clearAccessoriesCheckbox = document.getElementById('clear-accessories');
var accessoriesSelectField = document.getElementById('accessories-select');
var otherEventTypeTextField = document.getElementById('other-event-type');
var eventTypeSelectField = document.getElementById('event-type-select');
var eventTypePlaceholder = document.getElementById('event-type-placeholder');
var resetLabel = document.getElementById('event-type-reset-label');
var resetBox = document.getElementById('event-type-reset-box');

if(clearAccessoriesCheckbox && accessoriesSelectField) {
    clearAccessoriesCheckbox.addEventListener('change', function(event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.target.checked) {
            console.log('Checkbox is checked! ✅');
            accessoriesSelectField.selectedIndex = -1;
        }
    });
}

if(accessoriesSelectField && clearAccessoriesCheckbox) {
    accessoriesSelectField.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        clearAccessoriesCheckbox.checked = false;
    });
}

if(otherEventTypeTextField && eventTypeSelectField && resetBox && resetLabel) {
    eventTypeSelectField.addEventListener('change', function(event) {
        event.preventDefault();
        event.stopPropagation();
        const selectElement = event.target;
        const text = selectElement.options[selectElement.selectedIndex].text;
        if(text === 'Other') {
            selectElement.style.display = 'none';
            otherEventTypeTextField.style.display = 'block';
            otherEventTypeTextField.focus();
            resetLabel.style.display = 'block';
            resetBox.style.display = 'block';
        }
    });
}

if(resetBox && resetLabel && eventTypeSelectField) {
    resetBox.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        if(event.target.checked) {
            resetLabel.style.display = 'none';
            resetBox.style.display = 'none';
            eventTypeSelectField.style.display = 'block';
            otherEventTypeTextField.style.display = 'none';
            otherEventTypeTextField.value = '';
            eventTypeSelectField.selectedIndex = -1;
        }
    });
}
