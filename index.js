const app = document.querySelector("#app");

const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "2601-ftb-ct-web-pt";

const EVENTS_API = BASE + "/" + COHORT + "/events";
const GUESTS_API = BASE + "/" + COHORT + "/guests";
const RSVPS_API = BASE + "/" + COHORT + "/rsvps";

let events = [];
let guests = [];
let selectedEvent = null;
let selectedGuests = [];

async function getEvents() {
  try {
    
    const guestResponse = await fetch(GUESTS_API);

    if (!guestResponse.ok) {
      throw new Error("Failed to fetch guests.");
    }

    const guestResult = await guestResponse.json();
    guests = guestResult.data; // ✅ FIX

    // GET EVENTS
    const eventResponse = await fetch(EVENTS_API);

    if (!eventResponse.ok) {
      throw new Error("Failed to fetch events.");
    }

    const eventResult = await eventResponse.json();
    events = eventResult.data; // ✅ FIX

    render();
  } catch (error) {
    console.error(error);
    app.textContent = "Failed to load data.";
  }
}

async function getEvent(id) {
  try {
    const response = await fetch(EVENTS_API + "/" + id);

    if (!response.ok) {
      throw new Error("Failed to fetch selected event.");
    }

    const result = await response.json();
    selectedEvent = result.data; // ✅ FIX
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getGuestsForSelectedEvent(eventId) {
  try {
    const response = await fetch(RSVPS_API);

    if (!response.ok) {
      throw new Error("Failed to fetch RSVPs.");
    }

    const result = await response.json();
    const rsvps = result.data; // ✅ FIX

    const eventRsvps = rsvps.filter(function (rsvp) {
      return rsvp.eventId === eventId;
    });

    selectedGuests = guests.filter(function (guest) {
      return eventRsvps.some(function (rsvp) {
        return rsvp.guestId === guest.id;
      });
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function selectEvent(id) {
  try {
    await getEvent(id);
    await getGuestsForSelectedEvent(id);
    render();
  } catch (error) {
    console.error(error);
    app.textContent = "Failed to load selected party.";
  }
}

function render() {
  app.innerHTML = "";

  const title = document.createElement("h1");
  title.textContent = "Party Planner";
  app.appendChild(title);

  const container = document.createElement("div");
  container.className = "container";

  // LEFT SIDE
  const left = document.createElement("section");
  left.className = "left-column";

  const listTitle = document.createElement("h2");
  listTitle.textContent = "Upcoming Parties";
  left.appendChild(listTitle);

  const list = document.createElement("ul");
  list.className = "party-list";

  events.forEach(function (event) {
    const item = document.createElement("li");
    item.className = "party-item";
    item.textContent = event.name;

    if (selectedEvent && selectedEvent.id === event.id) {
      item.classList.add("selected");
    }

    item.addEventListener("click", function () {
      selectEvent(event.id);
    });

    list.appendChild(item);
  });

  left.appendChild(list);

  
  const right = document.createElement("section");
  right.className = "right-column";

  const detailsTitle = document.createElement("h2");
  detailsTitle.textContent = "Party Details";
  right.appendChild(detailsTitle);

  if (!selectedEvent) {
    const message = document.createElement("p");
    message.textContent = "Please select a party.";
    right.appendChild(message);
  } else {
    const name = document.createElement("h3");
    name.textContent = selectedEvent.name + " #" + selectedEvent.id;
    right.appendChild(name);

    const date = document.createElement("p");
    date.className = "date";
    date.textContent = selectedEvent.date.slice(0, 10);
    right.appendChild(date);

    const location = document.createElement("p");
    location.className = "location";
    location.textContent = selectedEvent.location;
    right.appendChild(location);

    const description = document.createElement("p");
    description.className = "description";
    description.textContent = selectedEvent.description;
    right.appendChild(description);

    if (selectedGuests.length === 0) {
      const noGuests = document.createElement("p");
      noGuests.textContent = "No guests have RSVP'd yet.";
      right.appendChild(noGuests);
    } else {
      const guestList = document.createElement("ul");
      guestList.className = "guest-list";

      selectedGuests.forEach(function (guest) {
        const guestItem = document.createElement("li");
        guestItem.textContent = guest.name;
        guestList.appendChild(guestItem);
      });

      right.appendChild(guestList);
    }
  }

  container.append(left, right);
  app.appendChild(container);
}


getEvents();