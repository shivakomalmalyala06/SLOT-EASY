const hamburger = document.querySelector("[data-hamburger]");
const mobileMenu = document.querySelector("[data-mobile-menu]");

if (hamburger && mobileMenu) {
  hamburger.addEventListener("click", () => {
    const isOpen = mobileMenu.style.display === "flex";
    mobileMenu.style.display = isOpen ? "none" : "flex";
  });
}

const SUPABASE_CONFIG = window.__SUPABASE_CONFIG || {
  url: "YOUR_SUPABASE_URL",
  anonKey: "YOUR_SUPABASE_ANON_KEY",
};

function getSupabaseClient() {
  if (!window.supabase || !window.supabase.createClient) {
    return null;
  }
  if (!SUPABASE_CONFIG.url || SUPABASE_CONFIG.url === "YOUR_SUPABASE_URL") {
    return null;
  }
  if (!SUPABASE_CONFIG.anonKey || SUPABASE_CONFIG.anonKey === "YOUR_SUPABASE_ANON_KEY") {
    return null;
  }
  return window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}

function setStatus(node, message, type) {
  if (!node) return;
  node.textContent = message || "";
  node.classList.remove("hidden", "status-info", "status-error", "status-success");
  if (!message) {
    node.classList.add("hidden");
    return;
  }
  node.classList.add(type === "error" ? "status-error" : type === "success" ? "status-success" : "status-info");
}

function setFieldError(fieldId, errorText) {
  const errorNode = document.querySelector(`#${fieldId}Error`);
  if (errorNode) errorNode.textContent = errorText || "";
}

function setLoading(button, isLoading, loadingText, defaultText) {
  if (!button) return;
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : defaultText;
}

function validateBooking(data) {
  let valid = true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = data.appointment_date ? new Date(data.appointment_date) : null;

  setFieldError("fullName", "");
  setFieldError("phone", "");
  setFieldError("email", "");
  setFieldError("service", "");
  setFieldError("date", "");
  setFieldError("slot", "");

  if (!data.full_name || data.full_name.trim().length < 3) {
    setFieldError("fullName", "Please enter at least 3 characters.");
    valid = false;
  }
  if (!/^[6-9]\d{9}$/.test((data.phone_number || "").replace(/\s+/g, ""))) {
    setFieldError("phone", "Enter a valid 10-digit Indian mobile number.");
    valid = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || "")) {
    setFieldError("email", "Please enter a valid email address.");
    valid = false;
  }
  if (!data.service) {
    setFieldError("service", "Please select a service.");
    valid = false;
  }
  if (!selectedDate || Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
    setFieldError("date", "Please choose today or a future date.");
    valid = false;
  }
  if (!data.appointment_time) {
    setFieldError("slot", "Please choose a time slot.");
    valid = false;
  }

  return valid;
}

async function saveBooking(payload) {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: true, mode: "fallback" };

  const { data, error } = await supabase
    .from("appointments")
    .insert([
      {
        full_name: payload.full_name,
        phone_number: payload.phone_number,
        email: payload.email,
        service: payload.service,
        appointment_date: payload.appointment_date,
        appointment_time: payload.appointment_time,
        message: payload.message || null,
        status: payload.status || "pending",
      },
    ])
    .select(
      "id, full_name, phone_number, email, service, appointment_date, appointment_time, message, status, created_at",
    )
    .single();

  if (error) return { ok: false, message: error.message };
  return { ok: true, mode: "supabase", booking: data };
}

async function triggerConfirmationEmail(booking) {
  try {
    const response = await fetch("http://localhost:3001/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(booking)
    });

    if (response.ok) {
      return { ok: true, message: "Confirmation email sent successfully!" };
    } else {
      const errorData = await response.json();
      return { ok: false, message: errorData.message || "Email sending failed" };
    }
  } catch (error) {
    return { ok: false, message: error.message };
  }
}
async function loginAdmin(email, password) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    if (email === "admin@sloteasy.in" && password === "admin123") {
      localStorage.setItem("slotEasyAdminAuth", "demo");
      return { ok: true, mode: "fallback" };
    }
    return { ok: false, message: "Invalid credentials for demo login." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: error.message };
  localStorage.setItem("slotEasyAdminAuth", "supabase");
  return { ok: true, mode: "supabase" };
}

const slots = document.querySelectorAll(".slot");
const selectedSlotInput = document.querySelector("#selectedSlot");
slots.forEach((slotBtn) => {
  slotBtn.addEventListener("click", () => {
    slots.forEach((s) => s.classList.remove("active"));
    slotBtn.classList.add("active");
    if (selectedSlotInput) selectedSlotInput.value = slotBtn.textContent.trim();
  });
});

const bookingForm = document.querySelector("#bookingForm");
if (bookingForm) {
  const bookingStatus = document.querySelector("#bookingStatus");
  const bookingSubmitBtn = document.querySelector("#bookingSubmitBtn");

  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus(bookingStatus, "", "info");

    const formData = new FormData(bookingForm);
    const bookingData = {
      full_name: String(formData.get("full_name") || "").trim(),
      phone_number: String(formData.get("phone_number") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      service: String(formData.get("service") || "").trim(),
      appointment_date: String(formData.get("appointment_date") || "").trim(),
      appointment_time: String(formData.get("appointment_time") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      status: "pending",
    };

    if (!validateBooking(bookingData)) {
      setStatus(bookingStatus, "Please fix the highlighted fields.", "error");
      return;
    }

    setLoading(bookingSubmitBtn, true, "Confirming...", "Confirm My Appointment");
    setStatus(bookingStatus, "Submitting your appointment...", "info");

    try {
      const result = await saveBooking(bookingData);
      if (!result.ok) {
        setStatus(bookingStatus, result.message || "Failed to confirm appointment. Please try again.", "error");
        return;
      }

      const bookingSnapshot =
        result.mode === "supabase" && result.booking
          ? result.booking
          : {
              id: null,
              full_name: bookingData.full_name,
              phone_number: bookingData.phone_number,
              email: bookingData.email,
              service: bookingData.service,
              appointment_date: bookingData.appointment_date,
              appointment_time: bookingData.appointment_time,
              message: bookingData.message,
              status: bookingData.status,
              created_at: new Date().toISOString(),
            };

      localStorage.setItem("slotEasyBooking", JSON.stringify(bookingSnapshot));
      const emailResult = await triggerConfirmationEmail(bookingSnapshot);
      localStorage.setItem("slotEasyEmailStatus", JSON.stringify(emailResult));
      setStatus(
        bookingStatus,
        result.mode === "supabase" ? "Appointment confirmed and synced." : "Appointment saved in demo mode.",
        "success",
      );
      window.location.href = "confirmation.html";
    } catch (error) {
      setStatus(bookingStatus, error.message || "Unexpected error. Please try again.", "error");
    } finally {
      setLoading(bookingSubmitBtn, false, "Confirming...", "Confirm My Appointment");
    }
  });
}

const loginForm = document.querySelector("#loginForm");
if (loginForm) {
  const loginStatus = document.querySelector("#loginStatus");
  const loginSubmitBtn = document.querySelector("#loginSubmitBtn");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFieldError("loginEmail", "");
    setFieldError("loginPassword", "");
    setStatus(loginStatus, "", "info");

    const formData = new FormData(loginForm);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    let valid = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("loginEmail", "Enter a valid email address.");
      valid = false;
    }
    if (password.length < 6) {
      setFieldError("loginPassword", "Password must be at least 6 characters.");
      valid = false;
    }
    if (!valid) {
      setStatus(loginStatus, "Please correct the highlighted fields.", "error");
      return;
    }

    setLoading(loginSubmitBtn, true, "Signing in...", "Login");
    setStatus(loginStatus, "Signing you in...", "info");

    try {
      const result = await loginAdmin(email, password);
      if (!result.ok) {
        setStatus(loginStatus, result.message || "Login failed.", "error");
        return;
      }
      setStatus(loginStatus, "Login successful. Redirecting...", "success");
      window.location.href = "dashboard.html";
    } catch (error) {
      setStatus(loginStatus, error.message || "Unexpected error. Please try again.", "error");
    } finally {
      setLoading(loginSubmitBtn, false, "Signing in...", "Login");
    }
  });
}

const summaryTarget = document.querySelector("#bookingSummary");
if (summaryTarget) {
  const booking = JSON.parse(localStorage.getItem("slotEasyBooking") || "{}");
  const emailStatus = JSON.parse(localStorage.getItem("slotEasyEmailStatus") || "{}");
  const confirmationMeta = document.querySelector("#confirmationMeta");
  summaryTarget.innerHTML = `
    <p><strong>Name:</strong> ${booking.full_name || "Guest User"}</p>
    <p><strong>Service:</strong> ${booking.service || "ENT Consultation"}</p>
    <p><strong>Date:</strong> ${booking.appointment_date || "Not selected"}</p>
    <p><strong>Time:</strong> ${booking.appointment_time || "Not selected"}</p>
    <p><strong>Status:</strong> ${booking.status || "pending"}</p>
  `;
  if (confirmationMeta) {
    if (emailStatus.ok) {
      confirmationMeta.textContent =
        emailStatus.mode === "supabase"
          ? emailStatus.message || "Confirmation email has been sent."
          : "Demo mode active: email delivery hook is ready for Supabase Edge Function.";
    } else {
      confirmationMeta.textContent = `Booking saved, but email trigger failed: ${
        emailStatus.message || "Unknown error"
      }`;
    }
  }
}

const tableSearch = document.querySelector("#tableSearch");
const tableBody = document.querySelector("#bookingsTableBody");

function getStatusBadgeClass(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "confirmed") return "confirmed";
  if (normalized === "cancelled") return "cancelled";
  return "pending";
}

function toLocalDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

function renderBookingsRows(bookings) {
  if (!tableBody) return;
  if (!bookings.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="11">No bookings found.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = bookings
    .map((b) => {
      const status = b.status || "pending";
      const badgeClass = getStatusBadgeClass(status);
      return `
        <tr>
          <td>${b.id ?? "-"}</td>
          <td>${b.full_name || "-"}</td>
          <td>${b.phone_number || "-"}</td>
          <td>${b.email || "-"}</td>
          <td>${b.service || "-"}</td>
          <td>${b.appointment_date || "-"}</td>
          <td>${b.appointment_time || "-"}</td>
          <td>${b.message || "-"}</td>
          <td><span class="badge ${badgeClass}">${status}</span></td>
          <td>${toLocalDateTime(b.created_at)}</td>
          <td><button class="btn btn-outline">View</button></td>
        </tr>
      `;
    })
    .join("");
}

function updateDashboardStats(bookings) {
  const todayCount = document.querySelector("#todayCount");
  const weekCount = document.querySelector("#weekCount");
  const pendingCount = document.querySelector("#pendingCount");
  if (!todayCount || !weekCount || !pendingCount) return;

  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - diff);
  weekStart.setHours(0, 0, 0, 0);

  const todayBookings = bookings.filter((b) => b.appointment_date === todayIso).length;
  const thisWeekBookings = bookings.filter((b) => {
    if (!b.appointment_date) return false;
    const date = new Date(`${b.appointment_date}T00:00:00`);
    return !Number.isNaN(date.getTime()) && date >= weekStart;
  }).length;
  const pendingBookings = bookings.filter((b) => String(b.status || "").toLowerCase() === "pending").length;

  todayCount.textContent = String(todayBookings);
  weekCount.textContent = String(thisWeekBookings);
  pendingCount.textContent = String(pendingBookings);
}

async function requireDashboardAuth() {
  if (!tableBody) return true;

  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.auth.getSession();
    const session = data?.session || null;
    if (error || !session) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  }

  const demoAuth = localStorage.getItem("slotEasyAdminAuth");
  if (demoAuth !== "demo") {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

async function handleLogout() {
  const logoutBtn = document.querySelector("#logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("slotEasyAdminAuth");
    window.location.href = "login.html";
  });
}

async function loadDashboardBookings() {
  if (!tableBody) return;

  const dashboardStatus = document.querySelector("#dashboardStatus");
  setStatus(dashboardStatus, "Loading bookings...", "info");

  const supabase = getSupabaseClient();
  if (!supabase) {
    const fallbackBookings = [
      {
        id: 1,
        full_name: "Priya Menon",
        phone_number: "9876543210",
        email: "priya@example.com",
        service: "Ear Checkup",
        appointment_date: "2026-05-08",
        appointment_time: "10:00 AM",
        message: "Follow-up visit",
        status: "confirmed",
        created_at: "2026-05-07T09:40:00.000Z",
      },
      {
        id: 2,
        full_name: "Rahul Kumar",
        phone_number: "9123456789",
        email: "rahul@example.com",
        service: "Nose Allergy Care",
        appointment_date: "2026-05-08",
        appointment_time: "11:30 AM",
        message: "First-time patient",
        status: "pending",
        created_at: "2026-05-07T10:05:00.000Z",
      },
    ];
    renderBookingsRows(fallbackBookings);
    updateDashboardStats(fallbackBookings);
    setStatus(dashboardStatus, "Showing demo data. Add Supabase config to load live bookings.", "info");
    return;
  }

  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, full_name, phone_number, email, service, appointment_date, appointment_time, message, status, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    renderBookingsRows([]);
    updateDashboardStats([]);
    setStatus(dashboardStatus, error.message || "Failed to load bookings.", "error");
    return;
  }

  const bookings = data || [];
  renderBookingsRows(bookings);
  updateDashboardStats(bookings);
  setStatus(dashboardStatus, `Loaded ${bookings.length} booking(s).`, "success");
}

if (tableSearch && tableBody) {
  tableSearch.addEventListener("input", () => {
    const query = tableSearch.value.toLowerCase().trim();
    const tableRows = tableBody.querySelectorAll("tr");
    tableRows.forEach((row) => {
      row.style.display = row.textContent.toLowerCase().includes(query) ? "" : "none";
    });
  });
}

if (tableBody) {
  requireDashboardAuth().then((isAuthed) => {
    if (!isAuthed) return;
    handleLogout();
    loadDashboardBookings();
  });
}

// ==================== GEMINI AI CHATBOT ====================

const chatWidget = document.querySelector("#chatWidget");
const chatMessages = document.querySelector("#chatMessages");
const chatInput = document.querySelector("#chatInput");
const chatSendBtn = document.querySelector("#chatSendBtn");
const chatClose = document.querySelector("#chatClose");

if (chatWidget && chatMessages && chatInput && chatSendBtn) {
  // Add initial welcome message
  function addMessage(text, sender = "bot") {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message chat-${sender}`;
    messageDiv.innerHTML = sender === "bot" 
      ? `<div class="chat-bubble bot-bubble">${text}</div>` 
      : `<div class="chat-bubble user-bubble">${text}</div>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Show loading dots
  function showLoadingDots() {
    const messageDiv = document.createElement("div");
    messageDiv.className = "chat-message chat-bot";
    messageDiv.innerHTML = '<div class="chat-bubble bot-bubble loading-dots"><span></span><span></span><span></span></div>';
    messageDiv.id = "loading-message";
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Remove loading dots
  function removeLoadingDots() {
    const loadingMsg = document.querySelector("#loading-message");
    if (loadingMsg) loadingMsg.remove();
  }

  // Send message to AI chatbot
  async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage(message, "user");
    chatInput.value = "";

    // Show loading dots
    showLoadingDots();

    try {
      const response = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      removeLoadingDots();

      if (response.ok) {
        const data = await response.json();
        addMessage(data.message, "bot");
      } else {
        const errorData = await response.json();
        addMessage(
          errorData.message || "Sorry, I couldn't generate a response. Please try again.",
          "bot"
        );
      }
    } catch (error) {
      removeLoadingDots();
      addMessage(
        "I'm having trouble connecting to the server. Please make sure the backend is running on port 3001.",
        "bot"
      );
    }
  }

  // Event listeners
  chatSendBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // Close button
  if (chatClose) {
    chatClose.addEventListener("click", () => {
      chatWidget.style.display = "none";
    });
  }

  // Add initial welcome message
  addMessage("Hello! 👋 Welcome to SLOT EASY ENT Hospital. How can I help you today?", "bot");
}
