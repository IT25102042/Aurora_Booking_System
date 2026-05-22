// ========== INITIALIZE THEME ==========
const savedTheme = localStorage.getItem('selectedTheme') || 'female';
document.body.classList.remove('female-theme', 'male-theme');
document.body.classList.add(`${savedTheme}-theme`);

// ========== THREE.JS BACKGROUND ==========
const canvas = document.getElementById('canvas-3d');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);
const colorArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i += 3) {
  posArray[i]   = (Math.random() - 0.5) * 30;
  posArray[i+1] = (Math.random() - 0.5) * 30;
  posArray[i+2] = (Math.random() - 0.5) * 30;
  const theme = document.body.classList.contains('female-theme') ? '#b92c62' : '#00d0ff';
  const color = new THREE.Color(theme);
  colorArray[i]   = color.r;
  colorArray[i+1] = color.g;
  colorArray[i+2] = color.b;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.02,
  vertexColors: true,
  transparent: true,
  blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);
camera.position.z = 15;

function animateParticles() {
  requestAnimationFrame(animateParticles);
  particlesMesh.rotation.y += 0.0002;
  particlesMesh.rotation.x += 0.0001;
  renderer.render(scene, camera);
}
animateParticles();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ========== CUSTOM CURSOR ==========
const cursor = document.querySelector('.custom-cursor');
const cursorDot = document.querySelector('.cursor-dot');
let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
});

function animateCursor() {
  cursorX += (mouseX - cursorX) * 0.2;
  cursorY += (mouseY - cursorY) * 0.2;
  cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

// ========== SCROLL PROGRESS ==========
window.addEventListener('scroll', () => {
  const winScroll = document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  document.getElementById('scrollProgress').style.width = scrolled + '%';
});

// ========== NAVBAR SCROLL EFFECT ==========
window.addEventListener('scroll', () => {
  const nav = document.getElementById('mainNav');
  if (window.scrollY > 50) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

// ========== BACK TO TOP ==========
const backBtn = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) backBtn.classList.add('active');
  else backBtn.classList.remove('active');
});

backBtn.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ========== UI INTERACTIONS ==========
const dateTimeCard   = document.getElementById('dateTimeCard');
const summaryStylist = document.getElementById('summaryStylist');
const summaryDate    = document.getElementById('summaryDate');
const summaryTime    = document.getElementById('summaryTime');
const datePicker     = document.getElementById('bookingDate');
const bookedDateSearch = document.getElementById('bookedDateSearch');

// Initialization moved to DOMContentLoaded

const API_BASE = "/api";

// Get serviceId from URL
const urlParams = new URLSearchParams(window.location.search);
const serviceId = urlParams.get('serviceId') || 1;
let currentServicePrice = 0; // raw price (no conversion)
let currentServiceDuration = 0;

function formatNumberWithCommas(num) {
  return Number(num).toLocaleString('en-US', {maximumFractionDigits: 0});
}

async function loadServiceDetails() {
    console.log("Fetching service details for ID:", serviceId);
    try {
        const response = await fetch(`${API_BASE}/appointments/service-details/${serviceId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const service = await response.json();
        console.log("Service data received:", service);

        document.getElementById('serviceName').innerText = service.serviceName;
        // Show the raw numeric price but label it as LKR (no conversion)
        const usdPrice = Number(service.price) || 0;
        const displayValue = Math.round(usdPrice);
        document.getElementById('servicePrice').innerText = formatNumberWithCommas(displayValue);
        document.getElementById('serviceDescription').innerText = service.specialRequests;
        document.getElementById('serviceDuration').innerText = `${service.durationMinutes || 0} min`;
        document.getElementById('summaryitem').innerText = service.serviceName;
        document.getElementById('summaryitemprice').innerText = `LKR ${formatNumberWithCommas(displayValue)}`;
        document.getElementById('summaryTotal').innerText = `LKR ${formatNumberWithCommas(displayValue)}`;
        document.getElementById('summaryDate').innerText = datePicker.value;

        currentServicePrice = displayValue; // keep original numeric value (no conversion)
        currentServiceDuration = service.durationMinutes || 0;
    } catch (error) {
        console.error('Failed to load service details:', error);
    }
}

async function loadStylists() {
    console.log("Fetching stylists for service ID:", serviceId);
    const container = document.getElementById('stylistSelector');
    if (!container) {
        console.error("Could not find element #stylistSelector");
        return;
    }

    container.innerHTML = '<p class="text-secondary">Loading stylists...</p>';

    try {
        const response = await fetch(`${API_BASE}/appointments/stylists-for-service/${serviceId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const stylists = await response.json();
        console.log("Stylists data received:", stylists);

        container.innerHTML = '';

        if (!stylists || stylists.length === 0) {
            console.warn("No stylists returned from backend.");
            container.innerHTML = '<p class="text-secondary">Our experts for this service are currently unavailable. Please try another service.</p>';
            return;
        }

        stylists.forEach(stylist => {
            console.log("Rendering stylist card for:", stylist.stylistName);
            const card = document.createElement('div');
            card.className = 'stylist-card';
            card.dataset.id = stylist.stylistProfileId;
            card.dataset.name = stylist.stylistName;
            card.innerHTML = `
                <div class="stylist-img">
                    <i class="bi bi-person-fill" style="font-size: 2rem;"></i>
                </div>
                <div class="stylist-info">
                    <h5>${stylist.stylistName}</h5>
                    <p>Expert Stylist</p>
                </div>
            `;

            card.addEventListener('click', function() {
                document.querySelectorAll('.stylist-card').forEach(c => c.classList.remove('active'));

                this.classList.add('active');

                document.getElementById('summaryStylist').innerText = this.dataset.name;
                document.getElementById('dateTimeCard').classList.remove('hidden-card');

                loadBookedTimes(this.dataset.id);

                const selectedDate = datePicker.value;
                if (selectedDate) {
                    loadAvailableSlots(this.dataset.id, selectedDate);
                }
            });

            container.appendChild(card);
        });
    } catch (error) {
        console.error('Failed to load stylists:', error);
        container.innerHTML = '<p class="text-danger">Error connecting to server. Check console (F12).</p>';
    }
}

async function loadBookedTimes(stylistId) {
    const bookedCard = document.getElementById('bookedTimesCard');
    const container = document.getElementById('bookedTimesContainer');

    // Always get the latest value from the input
    const filterInput = document.getElementById('bookedDateSearch');
    const filterDate = filterInput ? filterInput.value : null;

    console.log("Filtering booked times by date:", filterDate);

    bookedCard.classList.remove('hidden-card');
    container.innerHTML = '<p>Loading booked times...</p>';

    try {
        const response = await fetch(`${API_BASE}/appointments/stylist/${stylistId}`);
        const appointments = await response.json();

        container.innerHTML = '';

        if (!appointments || appointments.length === 0) {
            container.innerHTML = '<p>No bookings for this stylist.</p>';
            return;
        }

        // Strict filtering: only show if date matches EXACTLY what is in the picker
        // AND only show Confirmed appointments (Status ID 2)
        const filtered = appointments.filter(app => {
            if (!filterDate) return false;
            
            // Only show Confirmed (ID 2 or string 'Confirmed')
            if (app.appointmentStatusId !== 2 && app.appointmentStatus !== 'Confirmed') return false;

            let appDateStr = "";
            const rawDate = app.appointmentDate;

            if (Array.isArray(rawDate)) {
                const [y, m, d] = rawDate;
                appDateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            } else if (rawDate) {
                const d = new Date(rawDate);
                if (!isNaN(d.getTime())) {
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    appDateStr = `${y}-${m}-${day}`;
                } else {
                    appDateStr = String(rawDate).substring(0, 10);
                }
            }

            return appDateStr === filterDate;
        });

        if (filtered.length === 0) {
            container.innerHTML = `<p class="text-secondary">No bookings found for ${filterDate}.</p>`;
            return;
        }

        const grouped = {};

        filtered.forEach(app => {
            let dateKey = "";
            const rawDate = app.appointmentDate;

            if (Array.isArray(rawDate)) {
                const [y, m, d] = rawDate;
                dateKey = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            } else if (rawDate) {
                const d = new Date(rawDate);
                if (!isNaN(d.getTime())) {
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    dateKey = `${y}-${m}-${day}`;
                } else {
                    dateKey = String(rawDate).substring(0, 10);
                }
            }

            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }

            grouped[dateKey].push({
                start: app.startTime,
                end: app.endTime
            });
        });

        Object.keys(grouped).sort().forEach(date => {
            const dateBlock = document.createElement('div');
            dateBlock.className = 'booked-date-block';

            const title = document.createElement('h4');
            title.textContent = date;

            const timeGrid = document.createElement('div');
            timeGrid.className = 'booked-times-grid';

            grouped[date].forEach(slot => {
                const timeBox = document.createElement('div');
                timeBox.className = 'booked-time-box';
                timeBox.textContent = `${slot.start} - ${slot.end}`;
                timeGrid.appendChild(timeBox);
            });

            dateBlock.appendChild(title);
            dateBlock.appendChild(timeGrid);

            container.appendChild(dateBlock);
        });

    } catch (error) {
        console.error("Error loading booked times:", error);
        container.innerHTML = '<p>Failed to load booked times.</p>';
    }
}

const searchBookedBtn = document.getElementById('searchBookedBtn');
if (searchBookedBtn) {
    searchBookedBtn.addEventListener('click', function() {
        const activeStylist = document.querySelector('.stylist-card.active');
        if (activeStylist) {
            loadBookedTimes(activeStylist.dataset.id);
        } else {
            alert("Please select a stylist first.");
        }
    });
}

async function loadAvailableSlots(stylistId, selectedDate) {
        const container = document.getElementById('timeSlots');
        container.innerHTML = '<p class="text-secondary small">Loading slots...</p>';
    
        try {
            const response = await fetch(
                `${API_BASE}/appointments/available-slots/${stylistId}/${selectedDate}?serviceId=${serviceId}`
            );
    
            const slots = await response.json();
    
            container.innerHTML = '';
    
            if (!slots || slots.length === 0) {
                container.innerHTML = '<p class="text-secondary small">No available slots for this date.</p>';
                return;
            }
    
            slots.forEach(time => {
            const span = document.createElement('span');
            span.className = 'time-slot';
            span.innerText = time;

            span.addEventListener('click', function () {
                document.querySelectorAll('.time-slot')
                    .forEach(s => s.classList.remove('active'));

                this.classList.add('active');
                summaryTime.innerText = time;
            });

            container.appendChild(span);
        });

    } catch (error) {
        console.error('Failed loading slots:', error);
    }
}

async function loadPaymentMethods() {
  const container = document.getElementById('paymentMethodsContainer');

  try {
    const response = await fetch(`${API_BASE}/payment-methods`);
    const paymentMethods = await response.json();

    container.innerHTML = '';

    paymentMethods.forEach((method, index) => {
      const div = document.createElement('div');
      div.className = 'form-check mb-2';

      div.innerHTML = `
        <input
          class="form-check-input"
          type="radio"
          name="payment"
          id="payment-${method.id}"
          value="${method.id}"
        >
        <label class="form-check-label" for="payment-${method.id}">
          ${method.paymentMethod}
        </label>
      `;

      container.appendChild(div);
    });

  } catch (error) {
    console.error('Failed to load payment methods:', error);
  }
}

// Initial data loading removed from here, moved to DOMContentLoaded

// Update summary date when date picker changes
datePicker.addEventListener('change', function() {
    const activeStylist = document.querySelector('.stylist-card.active');

    if (!activeStylist) return;

    const stylistId = activeStylist.dataset.id;
    const selectedDate = this.value;
    summaryDate.innerText = selectedDate;

    console.log("Selected Date:", selectedDate);

    loadBookedTimes(stylistId);
    loadAvailableSlots(stylistId, selectedDate);
});

// Confirm booking button (demo only)
const confirmBtn = document.getElementById('confirmBooking');

function showFieldError(id, message) {
  const element = document.getElementById(id);
  if (element) {
    element.innerText = message;
    element.classList.remove('d-none');
  }
}

function clearFieldError(id) {
  const element = document.getElementById(id);
  if (element) {
    element.classList.add('d-none');
  }
}

if (confirmBtn) {
  confirmBtn.addEventListener('click', async () => {
    clearFieldError('fullNameError');
    clearFieldError('contactNoError');
    clearFieldError('formError');

    const activeStylist = document.querySelector('.stylist-card.active');
    const activeTimeSlot = document.querySelector('.time-slot.active');
    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    const fullName = document.getElementById('fullName').value.trim();
    const contactNo = document.getElementById('contactNo').value.trim();
    const specialRequests = document.getElementById('specialRequests').value.trim();
    const selectedDate = datePicker ? datePicker.value : '';
    const todayDate = new Date().toISOString().split('T')[0];

    let hasError = false;

    if (!activeStylist) {
      showFieldError('formError', 'Please select a stylist.');
      hasError = true;
    }

    if (!selectedDate) {
      showFieldError('formError', 'Please select a date.');
      hasError = true;
    } else if (selectedDate < todayDate) {
      showFieldError('formError', 'Selected date cannot be in the past.');
      hasError = true;
    }

    if (!activeTimeSlot) {
      showFieldError('formError', 'Please select a time slot.');
      hasError = true;
    }

    if (!fullName || fullName.length < 2) {
      showFieldError('fullNameError', 'Please enter your full name (2+ characters).');
      hasError = true;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(contactNo)) {
      showFieldError('contactNoError', 'Contact number must be exactly 10 digits.');
      hasError = true;
    }

    if (!selectedPayment) {
      showFieldError('formError', 'Please select a payment method.');
      hasError = true;
    }

    if (hasError) {
      const firstError = document.querySelector('.text-danger:not(.d-none)');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const userId = loggedInUserId;
    const stylistId = activeStylist.dataset.id;
    const paymentMethodId = selectedPayment.value;
    const startTime = activeTimeSlot.innerText;

    let gapHours = 1;
    if (currentServiceDuration >= 60 && currentServiceDuration <= 120) {
      gapHours = 2;
    }

    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = startHour + gapHours;
    const endTime = `${endHour.toString().padStart(2, '0')}:00`;
    const bookingData = {
      userId,
      fullName,
      contactNo,
      serviceId: parseInt(serviceId),
      stylistProfileId: parseInt(stylistId),
      appointmentDate: selectedDate,
      startTime,
      endTime,
      specialRequests,
      total: currentServicePrice,
      paymentMethodId: parseInt(paymentMethodId),
      appointmentStatusId: 1
    };

    confirmBtn.disabled = true;
    const originalText = confirmBtn.innerHTML;
    confirmBtn.innerHTML = '<i class="bi bi-clock"></i> Booking...';

    try {
      const response = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Booking failed.');
        throw new Error(errorText || 'Booking failed.');
      }

      window.alert('Booking created successfully!');
      window.location.reload();
      window.location.href = "home.html";
    } catch (error) {
      console.error(error);
      showFieldError('formError', 'Failed to create booking. Please try again.');
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = originalText;
    }
  });
}

let loggedInUserId = null;

// Initial load
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check Session First
    try {
        const sessionResp = await fetch('/api/users/check-session', { credentials: 'include' });
        const sessionData = await sessionResp.json();
        if (sessionData.status && sessionData.user) {
            loggedInUserId = sessionData.user.id;
        } else {
            // Not logged in, redirect to login page
            const redirectUrlTarget = `/appointment.html?serviceId=${serviceId}`;
            sessionStorage.setItem('postLoginRedirect', redirectUrlTarget);
            const redirectParams = encodeURIComponent(redirectUrlTarget);
            window.location.href = `signIn.html?redirect=${redirectParams}`;
            return;
        }
    } catch (e) {
        console.error("Session check failed", e);
        window.location.href = "signIn.html";
        return;
    }

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayDate = `${yyyy}-${mm}-${dd}`;

  if (datePicker) {
      datePicker.value = todayDate;
      datePicker.min = todayDate;
  }

  if (bookedDateSearch) {
      bookedDateSearch.value = todayDate;
      bookedDateSearch.min = todayDate;
  }


  const contactNoField = document.getElementById('contactNo');
  const contactNoError = document.getElementById('contactNoError');
  
    if (contactNoField) {
      // Prevent non-numeric characters and enforce max length of 10
      contactNoField.addEventListener('keypress', function(e) {
        if (!/[0-9]/.test(e.key) || this.value.length >= 10) {
          e.preventDefault();
          contactNoError.classList.remove('d-none');
          setTimeout(() => { contactNoError.classList.add('d-none'); }, 2000);
        }
      });

      // Handle paste events and truncate to 10 digits
      contactNoField.addEventListener('paste', function(e) {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        const numericOnly = pastedText.replace(/[^0-9]/g, '').slice(0, 10);

        if (numericOnly.length !== pastedText.replace(/\s/g, '').length) {
          contactNoError.classList.remove('d-none');
          setTimeout(() => { contactNoError.classList.add('d-none'); }, 2000);
        }

        this.value = numericOnly;
      });

      // Optional: trim extra digits on input (in case of autofill)
      contactNoField.addEventListener('input', function() {
        if (this.value.length > 10) this.value = this.value.slice(0, 10);
      });
    }

  loadServiceDetails();
  loadStylists();
  loadPaymentMethods();
});
