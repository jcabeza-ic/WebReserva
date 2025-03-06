document.addEventListener("DOMContentLoaded", () => {
    checkSession();
    loadReservationList();
});

const userColors = {
    "celia": "#ffadad",
    "paco": "#caffbf",
    "mama": "#fdffb6",
    "papa": "#9bf6ff"
};

function login() {
    const username = document.getElementById("username").value.trim().toLowerCase();

    if (!username) {
        alert("Introduce un nombre de usuario.");
        return;
    }

    localStorage.setItem("currentUser", username);
    checkSession();
}

function checkSession() {
    const user = localStorage.getItem("currentUser");

    if (user) {
        document.getElementById("login-container").classList.add("hidden");
        document.getElementById("app-container").classList.remove("hidden");
        loadReservationList();
    } else {
        document.getElementById("login-container").classList.remove("hidden");
        document.getElementById("app-container").classList.add("hidden");
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    location.reload();
}

let startDate = new Date();

function loadReservationList() {
    let reservations = JSON.parse(localStorage.getItem("reservations")) || [];
    let reservationListHTML = "";

    for (let i = 0; i < 7; i++) {
        let date = new Date(startDate);
        date.setDate(date.getDate() + i);

        const day = date.toLocaleString('es-ES', { weekday: 'long' });
        const dayFormatted = date.toLocaleDateString('es-ES');

        const dayReservations = reservations.filter(res => res.date === dayFormatted);

        reservationListHTML += `<div class="date-item">
            <h3>${day} ${dayFormatted}</h3>`;

        if (dayReservations.length > 0) {
            reservationListHTML += `<ul>`;
            dayReservations.forEach(res => {
                const color = userColors[res.user] || "#f8f9fa";
                const currentUser = localStorage.getItem("currentUser");
                reservationListHTML += `
                    <li class="reserved" style="background: ${color}; padding: 10px; border-radius: 5px; margin-top: 5px;">
                        ${res.startTime} - ${res.endTime} → ${res.user} 
                        ${res.user === currentUser ? `<button onclick="cancelReservation(${res.id})" class="cancel-btn">Cancelar</button>` : ""}
                    </li>`;
            });
            reservationListHTML += `</ul>`;
        }

        reservationListHTML += `<button onclick="showReservationForm('${dayFormatted}')">Hacer reserva</button>`;
        reservationListHTML += `</div>`;
    }

    document.getElementById("reservation-list").innerHTML = reservationListHTML;
    document.getElementById("prev-week-btn").style.display = startDate > new Date() ? "block" : "none";
}

function nextWeek() {
    startDate.setDate(startDate.getDate() + 7);
    loadReservationList();
}

function prevWeek() {
    startDate.setDate(startDate.getDate() - 7);
    loadReservationList();
}

function showReservationForm(date) {
    localStorage.setItem("selectedDate", date);
    window.location.href = "reservar.html";
}

function timeToMinutes(hhmm) {
    const [hours, minutes] = hhmm.split(":").map(Number);
    return hours * 60 + minutes;
}

function confirmReservation() {
    const user = localStorage.getItem("currentUser");
    const date = document.getElementById("reservation-form").getAttribute('data-date');
    const startTime = document.getElementById("start-time").value;
    const endTime = document.getElementById("end-time").value;

    if (!startTime || !endTime) {
        alert("Por favor, selecciona ambas horas.");
        return;
    }

    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
        alert("La hora de inicio debe ser antes de la hora de fin.");
        return;
    }

    let reservations = JSON.parse(localStorage.getItem("reservations")) || [];

    let conflict = reservations.some(res => 
        res.date === date &&
        (
            (timeToMinutes(startTime) < timeToMinutes(res.endTime) && timeToMinutes(endTime) > timeToMinutes(res.startTime))
        )
    );

    if (conflict) {
        alert("⛔ Ya existe una reserva en ese horario. Por favor, elige otro.");
        return;
    }

    const newReservation = {
        id: Date.now(),
        user: user,
        date: date,
        startTime: startTime,
        endTime: endTime
    };

    reservations.push(newReservation);
    localStorage.setItem("reservations", JSON.stringify(reservations));

    loadReservationList();
    closeReservationForm();
}

function cancelReservation(reservationId) {
    let reservations = JSON.parse(localStorage.getItem("reservations")) || [];
    reservations = reservations.filter(res => res.id !== reservationId);
    localStorage.setItem("reservations", JSON.stringify(reservations));
    loadReservationList();
}

function closeReservationForm() {
    document.getElementById("reservation-form").classList.add("hidden");
}

document.body.insertAdjacentHTML('beforeend', '<button onclick="nextWeek()" style="position: fixed; bottom: 20px; right: 20px; padding: 10px; background:#218838; color: white;">➡ Siguientes 7 días</button>');
document.body.insertAdjacentHTML('beforeend', '<button id="prev-week-btn" onclick="prevWeek()" style="position: fixed; bottom: 20px; left: 20px; padding: 10px; background:#218838; display: none; color: white;">⬅ Semana Anterior</button>');