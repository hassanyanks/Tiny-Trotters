// Client-side calendar script engine
// Pass the initial server date via payload string interpolation safely
let currentMonth = new Date();

const viewport = document.getElementById('viewport');
const monthLabel = document.getElementById('monthLabel');

// Event Listeners for scrolling navigation buttons
document.getElementById('prevBtn').addEventListener('click', () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderMonth(new Date(currentMonth), 'prev');
});

document.getElementById('nextBtn').addEventListener('click', () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderMonth(new Date(currentMonth), 'next');
});

// Initial Mount Call
document.addEventListener('DOMContentLoaded', () => {
    renderMonth(currentMonth);
});

function getLocalTime( isoStringFormattedTime ) {
    const localTime = new Date(isoStringFormattedTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true // Set to true for AM/PM format
    });
    return localTime;    
}

// Fetch and build the calendar grid DOM programmatically
async function renderMonth(targetDate, direction = 'none') {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    // 1. Format text title label header
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthLabel.textContent = `${monthNames[month]} ${year}`;

    // 2. Compute date boundaries for backend API payload call
    const startOfGrid = new Date(year, month, 1);

    // Roll back to Sunday
    startOfGrid.setDate(startOfGrid.getDate() - startOfGrid.getDay());       
    const endOfGrid = new Date(year, month + 1, 0);

    // Extend to Saturday
    endOfGrid.setDate(endOfGrid.getDate() + (6 - endOfGrid.getDay())); 

    // 3. Fetch Event documents from Express API endpoint
    const params = new URLSearchParams({ start: startOfGrid.toISOString(), end: endOfGrid.toISOString() });
    let events = [];

    try {
        const res = await fetch(`/api/events?${params}`);
        if (!res.ok) {
            const errorText = await res.text();
            console.log(`Server returned ${res.status}: ${errorText}`);
            throw new Error(`Server returned ${res.status}`); // Check for 500 errors
        }
        events = await res.json();
        console.log(`fetch returned:  ${JSON.stringify(events)}`)
    } catch(e) { console.error("Error fetching calendar elements", e); }

    // 4. Construct new visual DOM grid element slice
    const newGrid = document.createElement('div');
    newGrid.className = 'calendar-grid';

    // Prepare slide placement positions for smooth CSS transition loops
    if (direction === 'next') newGrid.style.transform = 'translateX(100%)';
    if (direction === 'prev') newGrid.style.transform = 'translateX(-100%)';

    // Loop over the full days interval block
    let loopDay = new Date(startOfGrid);
    //console.log(`start day:  ${loopDay}`)

    while (loopDay <= endOfGrid) {
        const isCurrentMonth = loopDay.getMonth() === month;
        const dayCell = document.createElement('div');
        dayCell.className = `day-cell ${isCurrentMonth ? '' : 'outside-month'}`;

        dayCell.innerHTML = `<span class="day-number">${loopDay.getDate()}</span>`;

        // Match and append corresponding day events pill elements
        const loopDayStr = loopDay.toDateString();
        //console.log(`loopDay:  ${loopDay.toDateString()}`)
        
        //events.forEach((evt) =>
        //    console.log(`event day start:  ${JSON.stringify(new Date(evt.start).toDateString())}`)
        //);

        const dayEvents = events.filter(e => new Date(e.start).toDateString() === loopDay.toDateString());

        const eventList = document.createElement('div');
        eventList.className = 'event-list';
        dayEvents.forEach(evt => {
            const pill = document.createElement('div');
            pill.className = 'event-pill';
            pill.title = evt.type;
            pill.textContent = `${evt.type}: ${getLocalTime(evt.start)}-${getLocalTime(evt.end)}`;
            eventList.appendChild(pill);
        });

        dayCell.appendChild(eventList);
        newGrid.appendChild(dayCell);
        loopDay.setDate(loopDay.getDate() + 1);
    }

// 5. Append and animate slide transition swaps
const oldGrid = viewport.querySelector('.calendar-grid');
viewport.appendChild(newGrid);

// Force a DOM layout reflow execution block to register initial position transform
newGrid.getBoundingClientRect();

if (oldGrid) {
oldGrid.style.transform = direction === 'next' ? 'translateX(-100%)' : 'translateX(100%)';
oldGrid.style.opacity = '0';
// Clean old view elements out of memory context after animation loops finish
setTimeout(() => oldGrid.remove(), 300);
}

newGrid.style.transform = 'translateX(0)';
}
