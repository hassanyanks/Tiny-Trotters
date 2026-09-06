import { Calendar } from 'fullcalendar';
//import themePlugin from 'fullcalendar/themes/monarch'; // YOUR THEME
//import dayGridPlugin from 'fullcalendar/daygrid';
//import timeGridPlugin from 'fullcalendar/timegrid';
//import listPlugin from 'fullcalendar/list';

// stylesheets
//import 'fullcalendar/skeleton.css'; // ALWAYS NEED SKELETON
//import 'fullcalendar/themes/monarch/theme.css'; // YOUR THEME
//import 'fullcalendar/themes/monarch/palettes/purple.css'; // YOUR THEME'S PALETTE

  const schedule_event_calendar = new Calendar(calendarEl, {
    initialView: 'timeGridWeek', // Displays a weekly view with hourly time slots
    allDaySlot: false,           // Hides the "all-day" section at the top
    slotMinTime: '08:00:00',     // Start the calendar day at 8 AM
    slotMaxTime: '18:00:00',     // End the calendar day at 6 PM
    
    // FullCalendar automatically fetches from this endpoint and appends ?start=...&end=... parameters
    events: '/api/available-slots', 
    
    // Trigger action when a user clicks an open slot
    eventClick: function(info) {
      const confirmBooking = confirm(`Do you want to book this slot: ${info.event.start.toLocaleTimeString()}?`);
      if (confirmBooking) {
        // Send a POST request to your backend to book the slot
        console.log('Booking slot ID:', info.event.id);
      }
    }
  });

  schedule_event_calendar.render();
