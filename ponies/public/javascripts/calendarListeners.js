// 1. Initial State & Configuration
let eventsData = [];
const MAX_EVENTS = 4;
const today = new Date();
const state = {
    year: today.getFullYear(),
    month: today.getMonth()
};

// Navigation Controls
function changeMonth(direction) {
    const transitionalDate = new Date(state.year, state.month + direction, 1);
    state.year = transitionalDate.getFullYear();
    state.month = transitionalDate.getMonth();
    renderCalendar();
}

function getLocalTime( isoStringFormattedTime ) {
    const localTime = new Date(isoStringFormattedTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true // Set to true for AM/PM format
    });
    return localTime;    
}

// 2. Main Render Layout
async function renderCalendar() {
    const gridContainer = document.getElementById("calendar-grid");
    const monthHeader = document.getElementById("month-header");

    gridContainer.innerHTML = "";
    //hidePopover(); // Hide popover on transition

    const monthLabels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthHeader.innerText = `${monthLabels[state.month]} ${state.year}`;

    const startOfGrid = new Date(state.year, state.month, 1, 12, 0, 0);
    startOfGrid.setDate(startOfGrid.getDate() - startOfGrid.getDay());
    const endOfGrid = new Date(state.year, state.month + 1, 0, 12, 0, 0);
    endOfGrid.setDate(endOfGrid.getDate() + (6 - endOfGrid.getDay()));

    const runner = new Date(startOfGrid);
    const params = new URLSearchParams({ start: new Date(startOfGrid).getTime(), end: new Date(endOfGrid).getTime() });

    try {
        const res = await fetch(`/api/calendar?${params}`);
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Error-server returned: ${res.status}`); // Check for 500 errors
        }
        eventsData = await res.json();
    } catch(e) { console.error("Error fetching calendar elements", e); }

    while (runner <= endOfGrid) {

        const dateKey = runner.toDateString();

        const dayCell = document.createElement("div");
        
        runner.getMonth() === state.month ? dayCell.classList.add("calendar-day") : dayCell.classList.add("adjacent-month");
        if (dateKey === today.toDateString()) dayCell.classList.add("today");

        // Day Number
        const numberLabel = document.createElement("span");
        numberLabel.classList.add("day-number");
        numberLabel.innerText = runner.getDate();
        dayCell.appendChild(numberLabel);

        // Inject Events List
        const dayEvents = eventsData.eventDetails !== null ? eventsData.filter(e => new Date(e.eventDetails['Event-Start']).toDateString() === dateKey) : [];

        if (dayEvents && dayEvents.length > 0) {
            const list = document.createElement("ul");
            list.classList.add("event-list");

            //RESERVED FOR FUTURE USE - Display only up to MAX_EVENTS: const visibleEvents = dayEvents.slice(0, MAX_EVENTS);
            dayEvents.forEach(evt => {
                const li = document.createElement("li");
                console.log(`setting li data-event-id to ${evt._id}...`)
                li.setAttribute('data-event-id', evt._id );
                li.classList.add("event-badge");
                li.innerText = getLocalTime(evt.eventDetails['Event-Start']);
                list.appendChild(li);
            });

            // THIS RESERVED FOR FUTURE USE
            // If there are more than MAX_EVENTS, add an interactive indicator button
            //if (dayEvents.length > MAX_EVENTS) {
            //const moreIndicator = document.createElement("li");
            //moreIndicator.classList.add("more-events");
            //moreIndicator.innerText = `+${dayEvents.length - MAX_EVENTS} more`;
            // Attach data attributes so the single event listener can read it
            //moreIndicator.dataset.dateString = dateKey;
            //list.appendChild(moreIndicator);
            //}

            dayCell.appendChild(list);
            //configureMoreEventsFeatures(dayEvents);

        }

        gridContainer.appendChild(dayCell);
        runner.setDate(runner.getDate() + 1);
    }
}

function formatFieldName(fieldName) {
    let tmp = fieldName.replace(/^(Event-)|(Your)|(Venue)|-/g, (m, p1) => p1 ? '' : ' ')
    return tmp.charAt(0).toUpperCase() + tmp.slice(1);;
}

function addDetails(title, eventContainer, details) {
    const fieldsContainer = document.createElement('div');
    const h3El = document.createElement('h3');
    h3El.classList.add('standard-underline');
    h3El.textContent = title;
    fieldsContainer.classList.add('fields-parent-container');
    fieldsContainer.appendChild(h3El);

    for(const[key,value] of Object.entries(details).filter(([key]) => key !== '_id')) {
        const fieldName = formatFieldName(key) + ":" 
        const fieldValue = value;           
        const fieldsDiv = document.createElement('div');
        fieldsDiv.classList.add('field');
        fieldsDiv.classList.add('styled-border');
        const fieldNameEl = document.createElement('span');
        fieldNameEl.classList.add('expander-fieldname');
        fieldNameEl.textContent = fieldName;
        const fieldValueEl = document.createElement('span');
        fieldValueEl.classList.add('expander-fieldvalue');
        fieldValueEl.textContent = fieldName.includes('Start') || fieldName.includes('End') ? getLocalTime(fieldValue) : fieldValue;
        fieldsDiv.appendChild(fieldNameEl);
        fieldsDiv.appendChild(fieldValueEl);
        fieldsContainer.appendChild(fieldsDiv);
    }
    eventContainer.appendChild(fieldsContainer)
}

document.addEventListener("DOMContentLoaded", () => {
    const expander = document.getElementById("expander-panel");
    const backdrop = document.getElementById("panel-backdrop");
    const closeBtn = document.getElementById("close-expander");
    const calendarGrid = document.getElementById("calendar-grid");

    // 1. Open and Populate function
    function openEventPanel(eventData) {
        const eventDetails = eventData.eventDetails;
        const customerDetails = eventData.yourDetails;
        const venueDetails = eventData.venueDetails;
        const ponyDetails = eventData.ponies;
        const eventContainer = document.querySelector('.event-meta');

        addDetails('Event Details', eventContainer, eventDetails);
        ponyDetails.forEach((pony) => {
            addDetails('Pony & Accessories', eventContainer, pony );
        });
        addDetails('Customer Details', eventContainer, customerDetails);
        if( eventDetails['Event-Location'] === 'Another Venue' ) {
            addDetails('Venue Details', eventContainer, venueDetails);
        }

        // Slide in panel and fade in backdrop
        expander.classList.add("open");
        backdrop.classList.add("active");
    }

    // 2. Close function
    function closeEventPanel() {
        expander.classList.remove("open");
        backdrop.classList.remove("active");
        const eventFieldsContainers = document.querySelectorAll('.fields-parent-container');
        eventFieldsContainers.forEach((c) => { c.remove(); });
    }

    calendarGrid.addEventListener("click", (e) => {
        // Pinpoint the specific event element clicked
        const clickedEventNode = e.target.closest(".event-badge");
        
        if (clickedEventNode) {
            const eventId = clickedEventNode.dataset.eventId;
            
            // Find matching data from your local pre-fetched array/object
            const targetEvent = eventsData.find(evt => evt.id === eventId);
            console.log(`found event ${JSON.stringify(targetEvent)}`);            
            if (targetEvent) {
                // Optional: If panel is already open, gently flash content or just update it
                if (expander.classList.contains("open")) {
                    expanderContentContainer.style.opacity = 0;
                    
                    setTimeout(() => {
                        openEventPanel(targetEvent);
                        expanderContentContainer.style.opacity = 1;
                    }, 150); // Matches up with a quick content swap animation
                } else {
                    openEventPanel(targetEvent);
                }
            }
        }
    });

    closeBtn.addEventListener("click", closeEventPanel);
    backdrop.addEventListener("click", closeEventPanel); // Clicking outside closes it
});

// Event Listeners for scrolling navigation buttons
document.getElementById('previous-month-button').addEventListener('click', () => {
    changeMonth(-1);
});

document.getElementById('next-month-button').addEventListener('click', () => {
    changeMonth(1);
});


// Kickoff layout initialization
renderCalendar();



// Client-side calendar script engine
// Pass the initial server date via payload string interpolation safely
/*
function hidePopover() {
    document.getElementById("event-popover").style.display = "none";
}

// Close popover when clicking anywhere else
window.addEventListener("click", hidePopover);



let currentMonth = new Date();
const viewport = document.getElementById('viewport');
const monthLabel = document.getElementById('monthLabel');


// Initial Mount Call
document.addEventListener('DOMContentLoaded', () => {
    renderMonth(currentMonth);
});
*/

/*
function showEventDataPopover(badgeElement, dayEvents) {
    // Remove any existing popover first to prevent duplicates
    const existingPopover = document.querySelector('.calendar-events-popover');
    if (existingPopover) existingPopover.remove();

    // 1. Create the popover container
    const popover = document.createElement('div');
    popover.className = 'calendar-events-popover';

    // 2. Add a header with the human-readable date
    const formattedDate = new Date(dateString).toLocaleDateString(undefined, { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
    });
    const header = document.createElement('div');
    header.className = 'popover-header';
    header.textContent = formattedDate;
    popover.appendChild(header);

    // 3. Render ALL events inside the popover
    allEvents.forEach(event => {
        let start = event.eventDetails['Event-Start'];
        let end = event.eventDetails['Event-End'];
        let customerName = event.yourDetails['Your-Name'];
        const eventEl = document.createElement('div');
        eventEl.className = 'calendar-event';
        eventEl.textContent = `${customerName}: ${getLocalTime(start)}-${getLocalTime(end)}`;
        popover.appendChild(eventEl);
    });

    // 4. Append to body to bypass any parent container 'overflow: hidden' restrictions
    document.body.appendChild(popover);

    // 5. Position the popover dynamically relative to the clicked badge
    const rect = badgeElement.getBoundingClientRect();
    
    // Align with the left edge of the badge, slightly below it (adding window scroll offset)
    popover.style.left = `${rect.left + window.scrollX}px`;
    popover.style.top = `${rect.bottom + window.scrollY + 4}px`;

    // 6. Dismiss listener: Close popover when clicking outside of it
    const closePopover = (e) => {
        if (!popover.contains(e.target) && e.target !== badgeElement) {
            popover.remove();
            document.removeEventListener('click', closePopover);
        }
    };
    
    // Timeout prevents the current click event from immediately closing the popover
    setTimeout(() => document.addEventListener('click', closePopover), 0);
}

function configureMoreEventsFeatures(dayEvents) {

    // 3. Optimized Event Delegation Listener for Popover
    document.getElementById("calendar-grid").addEventListener("click", function(e) {
        const moreBtn = e.target.closest(".more-events");
        if (!moreBtn) return;

        e.stopPropagation(); // Avoid immediately closing via window-click listener
        const dateKey = moreBtn.dataset.dateString;
        //const allEvents = eventsData[dateKey];
        const popover = document.getElementById("event-popover");

        // Dynamic Content Generation
        popover.innerHTML = `
        <h4>Events for ${dateKey.substring(0, 10)}</h4>
        <ul>${dayEvents.map(evt => `<li>${JSON.stringify(evt)}</li>`).join('')}</ul>
        `;

        // Absolute Coordinate Placement
        const rect = moreBtn.getBoundingClientRect();
        const containerRect = document.querySelector(".calendar-container").getBoundingClientRect();
        
        popover.style.left = `${rect.left - containerRect.left - 50}px`;
        popover.style.top = `${rect.top - containerRect.top + 20}px`;
        popover.style.display = "block";
    });

}



*/
/*
// Fetch and build the calendar grid DOM programmatically
async function renderMonth(targetDate, direction = 'none') {
    const MAX_VISIBLE_EVENTS = 4;
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    viewport.innterHTML = '';

    // 1. Format text title label header
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthLabel.textContent = `${monthNames[month]} ${year}`;

    // 2. Compute date boundaries for backend API payload call
    const startOfGrid = new Date(year, month, 1, 12, 0, 0);

    // Roll back to Sunday
    startOfGrid.setDate(startOfGrid.getDate() - startOfGrid.getDay());       
    const endOfGrid = new Date(year, month + 1, 0, 12, 0, 0);

    // Extend to Saturday
    endOfGrid.setDate(endOfGrid.getDate() + (6 - endOfGrid.getDay())); 





    // 3. Fetch Event documents from Express API endpoint
    const params = new URLSearchParams({ start: new Date(startOfGrid).getTime(), end: new Date(endOfGrid).getTime() });
    let events = [];

    try {
        const res = await fetch(`/api/calendar?${params}`);
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Error-server returned: ${res.status}`); // Check for 500 errors
        }
        events = await res.json();
        console.log(`raw res returned: ${JSON.stringify(res)}`);
    } catch(e) { console.error("Error fetching calendar elements", e); }

    console.log(`events returned: ${JSON.stringify(events)}`);

    // 4. Construct new visual DOM grid element slice
    const newGrid = document.createElement('div');
    newGrid.className = 'calendar-grid';

    // Prepare slide placement positions for smooth CSS transition loops
    if (direction === 'next') newGrid.style.transform = 'translateX(100%)';
    if (direction === 'prev') newGrid.style.transform = 'translateX(-100%)';

    // Loop over the full days interval block
    let loopDay = new Date(startOfGrid);

    while (loopDay <= endOfGrid) {
        const isCurrentMonth = loopDay.getMonth() === month;
        const dayCell = document.createElement('div');

        dayCell.className = `day-cell ${isCurrentMonth ? '' : 'outside-month'}`;

        dayCell.innerHTML = `<span class="day-number">${loopDay.getDate()}</span>`;

        // Match and append corresponding day events pill elements
        const loopDayStr = loopDay.toDateString();

        //console.log(`event start date: ${loopDayStr}`)
        const dayEvents = events.filter(e => new Date(e.eventDetails['Event-Start']).toDateString() === loopDayStr);

        const eventList = document.createElement('div');
        eventList.className = 'event-list';

        const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
        const extraCount = dayEvents.length - MAX_VISIBLE_EVENTS;

        visibleEvents.forEach(evt => {
            let start = evt.eventDetails['Event-Start'];
            let end = evt.eventDetails['Event-End'];
            let customerName = evt.yourDetails['Your-Name'];
            const pill = document.createElement('div');
            pill.className = 'event-pill';
            pill.title = customerName;
            pill.textContent = `${getLocalTime(start)}-${getLocalTime(end)}`;
            eventList.appendChild(pill);
        });

        if (extraCount > 0) {
            const moreEl = document.createElement('div');
            moreEl.className = 'day-more-items';
            moreEl.textContent = `+ ${extraCount} more`;
            
            // Optional: Add a click event to show a modal or expand the day
            moreEl.addEventListener('click', (e) => {
                e.stopPropagation();
                showEventsPopover(e.target, dayEvents, loopDayStr);
            });

            dayCell.appendChild(moreEl);
        }
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
*/
