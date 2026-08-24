const addressInput = document.getElementById('address-input');
const suggestionsList = document.getElementById('suggestions-list');

let debounceTimer;

// 1. Listen for user typing input
addressInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();

  // Clear previous timers on every keystroke
  clearTimeout(debounceTimer);

  // Hide dropdown if the input is too short
  if (query.length < 3) {
    clearSuggestions();
    return;
  }

  // Wait 300ms after the last keystroke before hitting the server
  debounceTimer = setTimeout(() => {
    fetchAddressSuggestions(query);
  }, 300);
});

// 2. Fetch data from your backend proxy endpoint
async function fetchAddressSuggestions(query) {
  try {
    // Points to your backend proxy to hide your Geocodio API key safely
    const response = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (!response.ok) throw new Error('Network error fetching suggestions');
    
    console.log(`fetch results:  ${JSON.stringify(data)}`)
    
    // Geocodio Autocomplete returns results inside a .results array
    renderSuggestions(data || []);
  } catch (error) {
    console.error('Autocomplete error:', error);
  }
}

// 3. Render the dynamic dropdown items
function renderSuggestions(results) {
  clearSuggestions();

  if (results.length === 0) return;

  suggestionsList.classList.remove('suggestions-hidden');

  results.forEach((item) => {
    const li = document.createElement('li');
    // Geocodio formatted single-string address output
    li.textContent = item.formatted_address; 
    
    // Click event to auto-select the option
    li.addEventListener('click', () => {
      addressInput.value = item.formatted_address;
      clearSuggestions();
      
      // OPTIONAL: Call a function here if you need to use the selected item's 
      // location coordinate metrics (item.location.lat / item.location.lng)
      console.log('Selected item payload:', item);
    });

    suggestionsList.appendChild(li);
  });
}

// 4. Utility helper to clear and close dropdown menu
function clearSuggestions() {
  suggestionsList.innerHTML = '';
  suggestionsList.classList.add('suggestions-hidden');
}

// Close list if user clicks anywhere outside the autocomplete widget box
document.addEventListener('click', (e) => {
  if (!e.target.closest('.autocomplete-container')) {
    clearSuggestions();
  }
});


/*
const addressInput = document.getElementById('address-input');
const suggestionsList = document.getElementById('suggestions-list');

let debounceTimer;

// 1. Listen for user typing input
addressInput.addEventListener('keydown', (e) => {
  const query = e.target.value.trim();

  // Clear previous timers on every keystroke
  clearTimeout(debounceTimer);

  // Hide dropdown if the input is too short
  if (query.length < 3) {
    clearSuggestions();
    return;
  }

  // Wait 300ms after the last keystroke before hitting the server
  debounceTimer = setTimeout(() => {
    fetchAddressSuggestions(query);
  }, 300);
});

// 2. Fetch data from your backend proxy endpoint
async function fetchAddressSuggestions(query) {
  try {
    console.log(`fetchAddressSuggestions() for query string:  ${query}`)
    // Points to your backend proxy to hide your Geocodio API key safely
    const response = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Network error fetching suggestions');
    
    const data = await response.json();
    console.log(`data returned:  ${JSON.stringify(data)}`)
    
    // Geocodio Autocomplete returns results inside a .results array
    renderSuggestions(data.results || []);
  } catch (error) {
    console.error('Autocomplete error:', error);
  }
}

// 3. Render the dynamic dropdown items
function renderSuggestions(results) {
  clearSuggestions();

  if (results.length === 0) return;
  console.log(`rendering suggestions for query string:  ${JSON.stringify(results)}`)

  suggestionsList.classList.remove('suggestions-hidden');

  results.forEach((item) => {
    const li = document.createElement('li');
    // Geocodio formatted single-string address output
    li.textContent = item.formatted_address; 
    
    // Click event to auto-select the option
    li.addEventListener('click', () => {
      addressInput.value = item.formatted_address;
      clearSuggestions();
      
      // OPTIONAL: Call a function here if you need to use the selected item's 
      // location coordinate metrics (item.location.lat / item.location.lng)
      console.log('Selected item payload:', item);
    });

    suggestionsList.appendChild(li);
  });
}

// 4. Utility helper to clear and close dropdown menu
function clearSuggestions() {
  suggestionsList.innerHTML = '';
  suggestionsList.classList.add('suggestions-hidden');
}

// Close list if user clicks anywhere outside the autocomplete widget box
document.addEventListener('click', (e) => {
  if (!e.target.closest('.autocomplete-container')) {
    clearSuggestions();
  }
});
*/