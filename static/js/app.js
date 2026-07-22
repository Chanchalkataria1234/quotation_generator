let configData = {};

document.addEventListener('DOMContentLoaded', () => {
    fetchConfig();
    setupEventListeners();
});

const DEFAULT_CONFIG = {
  "resort_info": {
    "name": "MEERA VALLEY RESORT",
    "subtitle": "By Nexottel - Udaipur",
    "footer": "Meera Valley Resort By Nexottel | Udaipur | Quotation subject to availability"
  },
  "included_meals": {
    "breakfast": true,
    "lunch": true,
    "hi_tea": true,
    "dinner": true
  },
  "included_packages": {
    "room_only": true,
    "cp": true,
    "map": true,
    "ap": true,
    "ap_hi_tea": true
  },
  "included_rooms": {
    "double": true,
    "triple": true,
    "quad": true
  },
  "booking_defaults": {
    "check_in": "2026-07-26T13:00",
    "check_out": "2026-07-27T10:00",
    "guests": 25,
    "guest_status": "Returning / Old Guest"
  },
  "rooms": {
    "triple": {
      "quantity": 7,
      "rate": 2000,
      "inclusion": "1 mattress included in each room"
    },
    "double": {
      "quantity": 2,
      "rate": 1800,
      "inclusion": "Double occupancy"
    },
    "quad": {
      "quantity": 0,
      "rate": 2400,
      "inclusion": "Quad occupancy"
    }
  },
  "meal_rates": {
    "cp": 250,
    "map": 600,
    "ap": 950,
    "ap_hi_tea": 1250
  },
  "menus": {
    "breakfast": [
      "Chole Bature",
      "Poha",
      "Bread Butter",
      "Tea & Coffee"
    ],
    "lunch": [
      "Dal Fry",
      "Paneer Lababdar",
      "Sev Tomato",
      "Jeera Rice",
      "Tawa Roti",
      "Papad",
      "Achar",
      "Green Salad",
      "Rasmalai"
    ],
    "hi_tea": [
      "Peanut Salad",
      "Paneer Chilli",
      "Mix Pakora",
      "Green Salad",
      "Biscuit",
      "Tea",
      "Coffee"
    ],
    "dinner": [
      "Dal Tadka",
      "Paneer Butter Masala",
      "Mix Veg",
      "Jeera Rice",
      "Tawa Roti",
      "Papad",
      "Achar",
      "Green Salad",
      "Gulab Jamun"
    ]
  },
  "important_notes": [
    "Mattress charges are already included in the quoted room rates.",
    "Check-in Time: 1:00 PM.",
    "Check-out Time: 10:00 AM.",
    "40% advance payment is required for booking confirmation.",
    "Remaining payment must be cleared before check-in.",
    "No refund will be applicable within 15 days of arrival.",
    "The special old-guest discount is already included in the above prices.",
    "Hi Tea rate is ₹300 per person, included in the AP + Hi Tea package total.",
    "Final booking is subject to room availability at the time of confirmation."
  ]
};

// Fetch current configuration from localStorage or fallback to defaults
function fetchConfig() {
    const localData = localStorage.getItem('resort_config');
    if (localData) {
        try {
            configData = JSON.parse(localData);
            initializeForm();
            updatePreview();
            return;
        } catch (e) {
            console.error('Error parsing localStorage config, falling back to defaults', e);
        }
    }
    // Fallback to embedded defaults
    configData = JSON.parse(JSON.stringify(DEFAULT_CONFIG)); // Deep copy defaults
    initializeForm();
    updatePreview();
}

// Save current configuration to localStorage
function saveConfig() {
    collectFormData();
    try {
        localStorage.setItem('resort_config', JSON.stringify(configData));
        alert('Configuration saved successfully in browser storage!');
        updatePreview();
    } catch (err) {
        console.error('Error saving config to localStorage:', err);
        alert('Failed to save configuration.');
    }
}

// Reset configuration to factory defaults
function resetConfig() {
    if (confirm('Are you sure you want to reset all configurations to default values?')) {
        localStorage.removeItem('resort_config');
        configData = JSON.parse(JSON.stringify(DEFAULT_CONFIG)); // Deep copy defaults
        initializeForm();
        updatePreview();
        alert('Configuration reset to defaults.');
    }
}

// Set up UI event listeners
function setupEventListeners() {
    // Save, Reset, Download buttons
    document.getElementById('btn-save').addEventListener('click', saveConfig);
    document.getElementById('btn-reset').addEventListener('click', resetConfig);
    document.getElementById('btn-download-pdf').addEventListener('click', downloadPDF);

    // Inputs that trigger live preview update
    const liveInputs = [
        'resort_name', 'resort_subtitle', 'resort_footer',
        'check_in', 'check_out', 'guests', 'guest_status',
        'triple_qty', 'triple_rate', 'triple_inclusion', 'include_room_triple',
        'double_qty', 'double_rate', 'double_inclusion', 'include_room_double',
        'quad_qty', 'quad_rate', 'quad_inclusion', 'include_room_quad',
        'rate_cp', 'rate_map', 'rate_ap', 'rate_ap_hi_tea',
        'include_breakfast', 'include_lunch', 'include_hi_tea', 'include_dinner',
        'include_pkg_room_only', 'include_pkg_cp', 'include_pkg_map', 'include_pkg_ap', 'include_pkg_ap_hi_tea'
    ];

    liveInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const eventType = el.type === 'checkbox' ? 'change' : 'input';
            el.addEventListener(eventType, () => {
                collectFormData();
                updatePreview();
            });
        }
    });

    // Menu Add Item buttons
    document.getElementById('add-breakfast-item').addEventListener('click', () => addMenuInput('breakfast', ''));
    document.getElementById('add-lunch-item').addEventListener('click', () => addMenuInput('lunch', ''));
    document.getElementById('add-hi_tea-item').addEventListener('click', () => addMenuInput('hi_tea', ''));
    document.getElementById('add-dinner-item').addEventListener('click', () => addMenuInput('dinner', ''));

    // Note Add Item button
    document.getElementById('add-note-item').addEventListener('click', () => addNoteInput(''));
}

// Initialize input fields in form with configuration data
function initializeForm() {
    // Resort Info
    document.getElementById('resort_name').value = configData.resort_info.name;
    document.getElementById('resort_subtitle').value = configData.resort_info.subtitle;
    document.getElementById('resort_footer').value = configData.resort_info.footer;

    // Booking Details
    document.getElementById('check_in').value = configData.booking_defaults.check_in;
    document.getElementById('check_out').value = configData.booking_defaults.check_out;
    document.getElementById('guests').value = configData.booking_defaults.guests;
    document.getElementById('guest_status').value = configData.booking_defaults.guest_status;

    // Room Arrangements
    document.getElementById('triple_qty').value = configData.rooms.triple.quantity;
    document.getElementById('triple_rate').value = configData.rooms.triple.rate;
    document.getElementById('triple_inclusion').value = configData.rooms.triple.inclusion;
    
    document.getElementById('double_qty').value = configData.rooms.double.quantity;
    document.getElementById('double_rate').value = configData.rooms.double.rate;
    document.getElementById('double_inclusion').value = configData.rooms.double.inclusion;

    // Meal Rates
    document.getElementById('rate_cp').value = configData.meal_rates.cp;
    document.getElementById('rate_map').value = configData.meal_rates.map;
    document.getElementById('rate_ap').value = configData.meal_rates.ap;
    document.getElementById('rate_ap_hi_tea').value = configData.meal_rates.ap_hi_tea;

    // Initialize Quad Occupancy
    if (configData.rooms.quad) {
        document.getElementById('quad_qty').value = configData.rooms.quad.quantity;
        document.getElementById('quad_rate').value = configData.rooms.quad.rate;
        document.getElementById('quad_inclusion').value = configData.rooms.quad.inclusion;
    }

    // Initialize checkboxes for included rooms
    if (configData.included_rooms) {
        document.getElementById('include_room_triple').checked = configData.included_rooms.triple;
        document.getElementById('include_room_double').checked = configData.included_rooms.double;
        document.getElementById('include_room_quad').checked = configData.included_rooms.quad;
    }

    // Initialize checkboxes for included meals
    if (configData.included_meals) {
        document.getElementById('include_breakfast').checked = configData.included_meals.breakfast;
        document.getElementById('include_lunch').checked = configData.included_meals.lunch;
        document.getElementById('include_hi_tea').checked = configData.included_meals.hi_tea;
        document.getElementById('include_dinner').checked = configData.included_meals.dinner;
    }

    // Initialize checkboxes for included packages
    if (configData.included_packages) {
        document.getElementById('include_pkg_room_only').checked = configData.included_packages.room_only;
        document.getElementById('include_pkg_cp').checked = configData.included_packages.cp;
        document.getElementById('include_pkg_map').checked = configData.included_packages.map;
        document.getElementById('include_pkg_ap').checked = configData.included_packages.ap;
        document.getElementById('include_pkg_ap_hi_tea').checked = configData.included_packages.ap_hi_tea;
    }

    // Initialize Menu lists
    initializeMenuList('breakfast', configData.menus.breakfast);
    initializeMenuList('lunch', configData.menus.lunch);
    initializeMenuList('hi_tea', configData.menus.hi_tea);
    initializeMenuList('dinner', configData.menus.dinner);

    // Initialize Notes
    initializeNotesList(configData.important_notes);
}

// Helper to initialize menu inputs
function initializeMenuList(mealType, items) {
    const container = document.getElementById(`${mealType}-list-container`);
    container.innerHTML = '';
    items.forEach(item => addMenuInput(mealType, item));
}

function addMenuInput(mealType, value) {
    const container = document.getElementById(`${mealType}-list-container`);
    const div = document.createElement('div');
    div.className = 'item-list-row';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.placeholder = `Add ${mealType} item`;
    input.addEventListener('input', () => {
        collectFormData();
        updatePreview();
    });

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-remove';
    btn.innerHTML = '&times;';
    btn.addEventListener('click', () => {
        div.remove();
        collectFormData();
        updatePreview();
    });

    div.appendChild(input);
    div.appendChild(btn);
    container.appendChild(div);
}

// Helper to initialize notes inputs
function initializeNotesList(notes) {
    const container = document.getElementById('notes-list-container');
    container.innerHTML = '';
    notes.forEach(note => addNoteInput(note));
}

function addNoteInput(value) {
    const container = document.getElementById('notes-list-container');
    const div = document.createElement('div');
    div.className = 'item-list-row';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.placeholder = 'Add important note';
    input.addEventListener('input', () => {
        collectFormData();
        updatePreview();
    });

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-remove';
    btn.innerHTML = '&times;';
    btn.addEventListener('click', () => {
        div.remove();
        collectFormData();
        updatePreview();
    });

    div.appendChild(input);
    div.appendChild(btn);
    container.appendChild(div);
}

// Collect all form input values and update local configData state
function collectFormData() {
    // Resort Info
    configData.resort_info.name = document.getElementById('resort_name').value;
    configData.resort_info.subtitle = document.getElementById('resort_subtitle').value;
    configData.resort_info.footer = document.getElementById('resort_footer').value;

    // Booking Details
    configData.booking_defaults.check_in = document.getElementById('check_in').value;
    configData.booking_defaults.check_out = document.getElementById('check_out').value;
    configData.booking_defaults.guests = parseInt(document.getElementById('guests').value) || 0;
    configData.booking_defaults.guest_status = document.getElementById('guest_status').value;

    // Room Arrangements
    configData.rooms.triple.quantity = parseInt(document.getElementById('triple_qty').value) || 0;
    configData.rooms.triple.rate = parseFloat(document.getElementById('triple_rate').value) || 0;
    configData.rooms.triple.inclusion = document.getElementById('triple_inclusion').value;

    configData.rooms.double.quantity = parseInt(document.getElementById('double_qty').value) || 0;
    configData.rooms.double.rate = parseFloat(document.getElementById('double_rate').value) || 0;
    configData.rooms.double.inclusion = document.getElementById('double_inclusion').value;

    if (!configData.rooms.quad) {
        configData.rooms.quad = {};
    }
    configData.rooms.quad.quantity = parseInt(document.getElementById('quad_qty').value) || 0;
    configData.rooms.quad.rate = parseFloat(document.getElementById('quad_rate').value) || 0;
    configData.rooms.quad.inclusion = document.getElementById('quad_inclusion').value;

    // Included rooms checkboxes
    if (!configData.included_rooms) {
        configData.included_rooms = {};
    }
    configData.included_rooms.triple = document.getElementById('include_room_triple').checked;
    configData.included_rooms.double = document.getElementById('include_room_double').checked;
    configData.included_rooms.quad = document.getElementById('include_room_quad').checked;

    // Meal Rates
    configData.meal_rates.cp = parseFloat(document.getElementById('rate_cp').value) || 0;
    configData.meal_rates.map = parseFloat(document.getElementById('rate_map').value) || 0;
    configData.meal_rates.ap = parseFloat(document.getElementById('rate_ap').value) || 0;
    configData.meal_rates.ap_hi_tea = parseFloat(document.getElementById('rate_ap_hi_tea').value) || 0;

    // Included meals checkboxes
    if (!configData.included_meals) {
        configData.included_meals = {};
    }
    configData.included_meals.breakfast = document.getElementById('include_breakfast').checked;
    configData.included_meals.lunch = document.getElementById('include_lunch').checked;
    configData.included_meals.hi_tea = document.getElementById('include_hi_tea').checked;
    configData.included_meals.dinner = document.getElementById('include_dinner').checked;

    // Included packages checkboxes
    if (!configData.included_packages) {
        configData.included_packages = {};
    }
    configData.included_packages.room_only = document.getElementById('include_pkg_room_only').checked;
    configData.included_packages.cp = document.getElementById('include_pkg_cp').checked;
    configData.included_packages.map = document.getElementById('include_pkg_map').checked;
    configData.included_packages.ap = document.getElementById('include_pkg_ap').checked;
    configData.included_packages.ap_hi_tea = document.getElementById('include_pkg_ap_hi_tea').checked;

    // Menus
    const meals = ['breakfast', 'lunch', 'hi_tea', 'dinner'];
    meals.forEach(meal => {
        const inputs = document.querySelectorAll(`#${meal}-list-container input`);
        configData.menus[meal] = Array.from(inputs).map(inp => inp.value.trim()).filter(val => val !== '');
    });

    // Notes
    const noteInputs = document.querySelectorAll('#notes-list-container input');
    configData.important_notes = Array.from(noteInputs).map(inp => inp.value.trim()).filter(val => val !== '');
}

// Format date time helper
function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '';
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return dateTimeStr;
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 hour should be 12
    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

// Format Currency
function formatCurrency(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
}

// Live Update the A4 Preview
function updatePreview() {
    if (!configData || !configData.resort_info) return;

    // Calculate dates & nights
    const checkInDate = new Date(configData.booking_defaults.check_in);
    const checkOutDate = new Date(configData.booking_defaults.check_out);
    let nights = 0;
    if (!isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime())) {
        const timeDiff = checkOutDate - checkInDate;
        nights = Math.max(1, Math.round(timeDiff / (1000 * 60 * 60 * 24)));
    }

    const guests = configData.booking_defaults.guests;

    // 1. Update Resort info on both pages (in case other texts need updates)
    document.querySelectorAll('.pdf-footer-text').forEach(el => el.textContent = configData.resort_info.footer);

    // 2. Update Details Table
    document.getElementById('pv-check-in').textContent = formatDateTime(configData.booking_defaults.check_in);
    document.getElementById('pv-check-out').textContent = formatDateTime(configData.booking_defaults.check_out);
    document.getElementById('pv-stay').textContent = `${nights} ${nights === 1 ? 'Night' : 'Nights'}`;
    document.getElementById('pv-guests').textContent = `${guests} ${guests === 1 ? 'Guest' : 'Guests'}`;
    document.getElementById('pv-guest-status').textContent = configData.booking_defaults.guest_status;

    // 3. Special Discount Banner Visibility
    const discountBanner = document.getElementById('pv-discount-banner');
    if (discountBanner) {
        if (configData.booking_defaults.guest_status === 'Returning / Old Guest') {
            discountBanner.style.display = 'block';
        } else {
            discountBanner.style.display = 'none';
        }
    }

    // 4. Room arrangement calculations dynamically populated
    const roomBody = document.getElementById('pv-room-body');
    roomBody.innerHTML = '';

    const allRooms = [
        { key: 'triple', label: 'Triple Occupancy' },
        { key: 'double', label: 'Double Occupancy' },
        { key: 'quad', label: 'Quad Occupancy (4 Occupancy)' }
    ];

    let totalRoomsCount = 0;
    let roomOnlyTotalVal = 0;

    allRooms.forEach(room => {
        const isIncluded = configData.included_rooms ? configData.included_rooms[room.key] : true;
        if (isIncluded) {
            const data = configData.rooms[room.key] || { quantity: 0, rate: 0, inclusion: '' };
            const rowTotal = data.quantity * data.rate * nights;
            totalRoomsCount += data.quantity;
            roomOnlyTotalVal += rowTotal;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 600;">${room.label}</td>
                <td>${data.quantity} ${data.quantity === 1 ? 'Room' : 'Rooms'}</td>
                <td>${data.inclusion}</td>
                <td>${formatCurrency(data.rate)}</td>
                <td class="text-right">${formatCurrency(rowTotal)}</td>
            `;
            roomBody.appendChild(tr);
        }
    });

    // Append total row
    const totalTr = document.createElement('tr');
    totalTr.className = 'total-row';
    totalTr.innerHTML = `
        <td></td>
        <td></td>
        <td></td>
        <td style="font-weight: 700;">Room Only Total</td>
        <td id="pv-room-only-total" class="text-right" style="font-weight: 700;">${formatCurrency(roomOnlyTotalVal)}</td>
    `;
    roomBody.appendChild(totalTr);

    const totalRooms = totalRoomsCount;
    document.getElementById('pv-rooms').textContent = `${totalRooms} ${totalRooms === 1 ? 'Room' : 'Rooms'}`;
    // No need to set pv-room-only-total again since it is set in innerHTML above

    // 5. Available Package Options calculations
    const allPackages = [
        { key: 'room_only', plan: 'Room Only', includes: 'Stay only', rate: '-', calc: 'Room total', total: roomOnlyTotalVal },
        { key: 'cp', plan: 'CP', includes: 'Room + Breakfast', rate: configData.meal_rates.cp, total: roomOnlyTotalVal + (guests * configData.meal_rates.cp * nights) },
        { key: 'map', plan: 'MAP', includes: 'Room + Breakfast + Dinner', rate: configData.meal_rates.map, total: roomOnlyTotalVal + (guests * configData.meal_rates.map * nights) },
        { key: 'ap', plan: 'AP', includes: 'Room + Breakfast + Lunch + Dinner', rate: configData.meal_rates.ap, total: roomOnlyTotalVal + (guests * configData.meal_rates.ap * nights) },
        { key: 'ap_hi_tea', plan: 'AP + Hi Tea', includes: 'Room + Breakfast + Lunch + Hi Tea + Dinner', rate: configData.meal_rates.ap_hi_tea, total: roomOnlyTotalVal + (guests * configData.meal_rates.ap_hi_tea * nights) }
    ];

    const packages = allPackages.filter(pkg => {
        return configData.included_packages ? configData.included_packages[pkg.key] : true;
    });

    const packageBody = document.getElementById('pv-package-body');
    packageBody.innerHTML = '';
    packages.forEach(pkg => {
        const tr = document.createElement('tr');
        
        // Setup calculation text
        let calcText = '';
        if (pkg.plan === 'Room Only') {
            calcText = 'Room total';
        } else {
            const multSign = '×';
            const formattedTotal = Number(roomOnlyTotalVal).toLocaleString('en-IN');
            const formattedRate = Number(pkg.rate).toLocaleString('en-IN');
            if (nights === 1) {
                calcText = `₹${formattedTotal} + ${guests} ${multSign} ₹${formattedRate}`;
            } else {
                calcText = `₹${formattedTotal} + ${guests} ${multSign} ${nights} ${multSign} ₹${formattedRate}`;
            }
        }

        const formattedMealRate = pkg.rate === '-' ? '-' : `₹${pkg.rate}/person`;

        tr.innerHTML = `
            <td style="font-weight: 700;">${pkg.plan}</td>
            <td>${pkg.includes}</td>
            <td>${formattedMealRate}</td>
            <td>${calcText}</td>
            <td style="font-weight: 700;" class="text-right">${formatCurrency(pkg.total)}</td>
        `;
        packageBody.appendChild(tr);
    });

    // 6. Page 2 Meal Grid items (dynamic column count)
    const mealGrid = document.querySelector('.meal-grid');
    mealGrid.innerHTML = '';

    const mealConfig = [
        { key: 'breakfast', label: 'Breakfast' },
        { key: 'lunch', label: 'Lunch' },
        { key: 'hi_tea', label: 'Hi Tea' },
        { key: 'dinner', label: 'Dinner' }
    ];

    let activeMealsCount = 0;

    mealConfig.forEach(meal => {
        const isIncluded = configData.included_meals ? configData.included_meals[meal.key] : true;
        if (isIncluded) {
            activeMealsCount++;
            
            // Create meal column container
            const col = document.createElement('div');
            col.className = 'meal-col';
            
            // Create header
            const header = document.createElement('div');
            header.className = 'meal-header';
            header.textContent = meal.label;
            col.appendChild(header);
            
            // Create list
            const ul = document.createElement('ul');
            ul.className = 'meal-items';
            ul.id = `pv-menu-${meal.key}`;
            
            // Populate list items
            const items = configData.menus[meal.key] || [];
            items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                ul.appendChild(li);
            });
            
            col.appendChild(ul);
            mealGrid.appendChild(col);
        }
    });

    // Set grid columns template dynamically or hide entirely if no meals selected
    if (activeMealsCount > 0) {
        mealGrid.style.display = 'grid';
        mealGrid.style.gridTemplateColumns = `repeat(${activeMealsCount}, 1fr)`;
    } else {
        mealGrid.style.display = 'none';
    }

    // 7. Page 2 Important Notes list
    // Calculate Hi Tea rate difference dynamically if notes contain a statement about Hi Tea
    const hiTeaDiff = configData.meal_rates.ap_hi_tea - configData.meal_rates.ap;
    const notesListEl = document.getElementById('pv-notes-list');
    notesListEl.innerHTML = '';
    configData.important_notes.forEach(note => {
        const li = document.createElement('li');
        
        // Dynamically replace the Hi Tea rate statement if it matches the text pattern
        let formattedNote = note;
        if (formattedNote.includes('Hi Tea rate is')) {
            formattedNote = `Hi Tea rate is ₹${hiTeaDiff} per person, included in the AP + Hi Tea package total.`;
        }
        
        li.textContent = formattedNote;
        notesListEl.appendChild(li);
    });
}

// Generate & Download/Preview PDF
function downloadPDF() {
    // Collect latest form data first to ensure it's up to date
    collectFormData();

    const element = document.getElementById('preview-workspace');
    const resortName = configData.resort_info.name || 'Resort';
    const filename = `Quotation_${resortName.replace(/\s+/g, '_')}.pdf`;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Set html2pdf options
    const opt = {
        margin:       0,
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.95 },
        html2canvas:  { 
            scale: 1.8, // Safe scale for mobile canvas memory limits
            useCORS: true,
            logging: false,
            letterRendering: true
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] }
    };

    // Add loading feedback
    const btn = document.getElementById('btn-download-pdf');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Generating PDF...';
    btn.disabled = true;

    // Apply generation class to temporarily disable CSS scaling transforms
    document.body.classList.add('is-generating-pdf');

    if (isMobile) {
        // Pre-open a blank window synchronously to bypass iOS Safari pop-up blocker
        const newWindow = window.open("", "_blank");
        if (newWindow) {
            newWindow.document.title = "Generating PDF...";
            newWindow.document.body.innerHTML = "<h2 style='font-family:sans-serif; text-align:center; margin-top:20%; color:#157366;'>Generating your PDF. Please wait...</h2>";
        }

    html2pdf().set(opt).from(element).toPdf().outputPdf('blob').then(blob => {
            const url = URL.createObjectURL(blob);
            if (newWindow) {
                newWindow.location.href = url;
            } else {
                window.location.href = url;
            }
            document.body.classList.remove('is-generating-pdf');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }).catch(err => {
            console.error('PDF generation error:', err);
            alert('Failed to generate PDF. Check console logs.');
            if (newWindow) newWindow.close();
            document.body.classList.remove('is-generating-pdf');
            btn.innerHTML = originalText;
            btn.disabled = false;
        });
    } else {
        // Desktop: Direct download using html2pdf's save method
        html2pdf().set(opt).from(element).save().then(() => {
            document.body.classList.remove('is-generating-pdf');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }).catch(err => {
            console.error('PDF generation error:', err);
            alert('Failed to generate PDF. Check console logs.');
            document.body.classList.remove('is-generating-pdf');
            btn.innerHTML = originalText;
            btn.disabled = false;
        });
    }
}
