var clearAccessoriesCheckbox = document.getElementById('clear-accessories');
var accessoriesSelectField = document.getElementById('accessories-select');

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

