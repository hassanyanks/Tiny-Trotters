const canvas = document.querySelector('.signature-canvas');
const sigClearButton = document.getElementById('sig-clear-btn');
const sigSubmitButton = document.getElementById('sig-submit-btn');

let isDrawing = false;
let ctx = null;

if(canvas) {
    ctx = canvas.getContext('2d');
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
        if (!customerAddress) return alert('Please enter the venue address.');
        if (!customerPhone) return alert('Please enter your phone.');
        if (!customerChildData) return alert('Please enter your child data.');

        // Convert canvas drawing to base64 encoded PDF
        const signatureImage = canvas.toDataURL('images/png');
        const response = await fetch('/waiver', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerName,
                                   venueAddress,
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
