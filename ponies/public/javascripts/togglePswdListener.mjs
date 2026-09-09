
var displayToggles = document.querySelectorAll('.toggle-password');
var pswdFlds = document.querySelectorAll('.password-fld');

displayToggles.forEach((toggle, index) => {
        toggle.addEventListener('click', function(event) {
                event.preventDefault();
                const type = pswdFlds[index].getAttribute('type') === 'password' ? 'text' : 'password';
                console.log(`***********************event listener:  type is ${type}`);
                const text = toggle.innerText === 'Show' ? 'Hide' : 'Show';
                console.log(`***********************event listener:  text is ${text}`);
                pswdFlds[index].setAttribute('type', type);
                toggle.innerText = text;
        });    
});

