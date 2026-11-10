const doctors = [
  { name: "Dr. Amina - General Doctor", spec: "General", phone: "0711 111 111", available: "Mon - Fri" },
  { name: "Nurse Kevin - Nurse", spec: "Nursing Care", phone: "0722 222 222", available: "Daily" },
  { name: "Dr. Otieno - Pediatrician", spec: "Children", phone: "0733 333 333", available: "Tue & Thu" },
  { name: "Dr. Fatuma - Gynecologist", spec: "Women Health", phone: "0744 444 444", available: "Mon, Wed, Fri" },
];

const storageKeys = { patients: "patients", appointments: "appointments" };

function readRecords(key) {
  try {
    const records = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

let patients = readRecords(storageKeys.patients);
let appointments = readRecords(storageKeys.appointments);

function saveRecords(key, records) {
  try {
    localStorage.setItem(key, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}

function showSection(id) {
  document.querySelectorAll(".view").forEach((section) => {
    const isActive = section.id === id;
    section.hidden = !isActive;
    section.classList.toggle("active", isActive);
  });
  document.querySelectorAll(".nav-link").forEach((button) => {
    const isActive = button.dataset.section === id;
    button.classList.toggle("active", isActive);
    if (isActive) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  if (id === "admin") updateAdmin();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function addTextElement(parent, tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function displayDoctors(list = doctors) {
  const doctorList = document.getElementById("doctorList");
  doctorList.replaceChildren();
  document.getElementById("doctorCount").textContent = `${list.length} ${list.length === 1 ? "clinician" : "clinicians"}`;

  if (list.length === 0) {
    addTextElement(doctorList, "p", "empty-state", "No clinicians match that search. Try another name or specialty.");
    return;
  }

  list.forEach((doctor) => {
    const card = document.createElement("article");
    card.className = "doctor-card";
    addTextElement(card, "span", "doctor-avatar", doctor.name.replace("Dr. ", "").replace("Nurse ", "").charAt(0));
    const info = document.createElement("div");
    info.className = "doctor-info";
    addTextElement(info, "h2", "", doctor.name);
    addTextElement(info, "p", "doctor-specialty", doctor.spec);
    const details = document.createElement("div");
    details.className = "doctor-details";
    addTextElement(details, "span", "", doctor.phone);
    addTextElement(details, "span", "", `Available: ${doctor.available}`);
    info.append(details);
    card.append(info);
    const bookButton = addTextElement(card, "button", "doctor-book", "Book →");
    bookButton.type = "button";
    bookButton.addEventListener("click", () => {
      document.getElementById("bDoctor").value = doctor.name;
      showSection("booking");
      document.getElementById("bName").focus();
    });
    doctorList.append(card);
  });
}

function renderLists() {
  const patientList = document.getElementById("patientList");
  const appointmentList = document.getElementById("appointmentList");
  patientList.replaceChildren();
  appointmentList.replaceChildren();

  if (patients.length === 0) {
    addTextElement(patientList, "li", "record-empty", "No patients registered yet.");
  } else {
    patients.forEach((patient) => {
      addTextElement(patientList, "li", "", `${patient.name} - ${patient.phone} - ${patient.location}`);
    });
  }

  if (appointments.length === 0) {
    addTextElement(appointmentList, "li", "record-empty", "No appointment requests yet.");
  } else {
    appointments.forEach((appointment) => {
      addTextElement(appointmentList, "li", "", `${appointment.name} with ${appointment.doctor} on ${appointment.date} at ${appointment.time}`);
    });
  }

  document.getElementById("patientCount").textContent = `${patients.length} ${patients.length === 1 ? "record" : "records"}`;
  document.getElementById("appointmentCount").textContent = `${appointments.length} ${appointments.length === 1 ? "record" : "records"}`;
}

function updateAdmin() {
  document.getElementById("totalPatients").textContent = patients.length;
  document.getElementById("totalAppointments").textContent = appointments.length;
  renderLists();
}

document.querySelectorAll("[data-section]").forEach((button) => {
  button.addEventListener("click", () => showSection(button.dataset.section));
});

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => showSection(button.dataset.go));
});

document.getElementById("searchDoctor").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  displayDoctors(doctors.filter((doctor) => `${doctor.name} ${doctor.spec}`.toLowerCase().includes(query)));
});

const doctorSelect = document.getElementById("bDoctor");
doctors.forEach((doctor) => {
  const option = document.createElement("option");
  option.value = doctor.name;
  option.textContent = doctor.name;
  doctorSelect.append(option);
});

const dateInput = document.getElementById("bDate");
dateInput.min = new Date().toISOString().slice(0, 10);

document.getElementById("patientForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const patient = {
    name: document.getElementById("pName").value.trim(),
    phone: document.getElementById("pPhone").value.trim(),
    location: document.getElementById("pLocation").value.trim(),
  };
  patients.push(patient);
  if (!saveRecords(storageKeys.patients, patients)) {
    patients.pop();
    document.getElementById("registerMsg").textContent = "Could not save this record in your browser. Check available storage and try again.";
    return;
  }
  document.getElementById("registerMsg").textContent = `Patient ${patient.name} registered in this demo.`;
  event.currentTarget.reset();
  updateAdmin();
});

document.getElementById("bookingForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const appointment = {
    name: document.getElementById("bName").value.trim(),
    doctor: doctorSelect.value,
    date: dateInput.value,
    time: document.getElementById("bTime").value,
  };
  appointments.push(appointment);
  if (!saveRecords(storageKeys.appointments, appointments)) {
    appointments.pop();
    document.getElementById("bookingMsg").textContent = "Could not save this request in your browser. Check available storage and try again.";
    return;
  }
  document.getElementById("bookingMsg").textContent = `Appointment request for ${appointment.name} saved in this demo. Call the clinic to confirm.`;
  event.currentTarget.reset();
  dateInput.min = new Date().toISOString().slice(0, 10);
  updateAdmin();
});

document.getElementById("consultForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("consultName").value.trim();
  const type = document.getElementById("consultType").value;
  document.getElementById("consultResult").textContent = `Thanks, ${name}. Your ${type.toLowerCase()} demo request was not sent to a clinic.`;
  event.currentTarget.reset();
});

document.getElementById("clearData").addEventListener("click", () => {
  if (!window.confirm("Clear all patient and appointment records saved by this demo in this browser?")) return;
  localStorage.removeItem(storageKeys.patients);
  localStorage.removeItem(storageKeys.appointments);
  patients = [];
  appointments = [];
  updateAdmin();
});

displayDoctors();
updateAdmin();