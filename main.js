// functions
function r_e(id) {
  return document.querySelector(`#${id}`);
}

// message bar
function configure_messages_bar(msg) {
  r_e("messages").classList.remove("is-hidden");
  r_e("messages").innerHTML = msg;
  setTimeout(() => {
    r_e("messages").classList.add("is-hidden");
    r_e("messages").innerHTML = "";
  }, 3000);
}

// navbar button configuration
function configure_nav_bar(email) {
  let signedin = document.querySelectorAll(".signedIn");
  let signedout = document.querySelectorAll(".signedOut");
  if (email) {
    signedin.forEach((e) => e.classList.remove("is-hidden"));
    signedout.forEach((e) => e.classList.add("is-hidden"));
  } else {
    signedout.forEach((e) => e.classList.remove("is-hidden"));
    signedin.forEach((e) => e.classList.add("is-hidden"));
  }
}

function show_events() {
  db.collection("events")
    .get()
    .then((data) => {
      let html = ``;
      let html2 = ``;
      let html3 = ``;
      let mydata = data.docs;
      // if (auth.currentUser) {
      //   account = auth.currentUser.email;
      // } else {
      //   account = null;
      // }
      mydata.forEach((d) => {
        html += `<button onclick="del_doc('${d.id}')"
        class="button has-background-danger is-pulled-right">Delete Event</button>`;
        let ts = d.data().time; // Firestore Timestamp
        console.log(typeof ts);
        let time = ts.toDate();
        let formatted = time.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });
        html += `<div class="box" id="${d.data().id}">
          <div class="box">
            <h2 class="title is-5">${d.data().title}</h2>
            <h4><strong>${d.data().date}: ${formatted}</strong></h4>
            <p>
              ${d.data().desc}
            </p>
            <button id="rsvp${
              d.id
            }" class="button is-link rsvp is-hidden" onclick="find_rsvp('${
          d.id
        }')">
              RSVP
            </button>
            <button id="attend${
              d.id
            }" class="button is-link attend" onclick="showAttend('${d.id}')">
              View
              Attendees
            </button>
          </div>
        </div>`;

        html2 += `<div id="rsvpModal${d.id}" class="modal">
            <div class="modal-background"></div>
            <div class="modal-card">
              <header class="modal-card-head">
                <p class="modal-card-title">Would you like to RSVP?</p>
                <button
                  id="rsvpClose${d.id}"
                  class="delete"
                  aria-label="close" 
                  onclick="close_rsvp('${d.id}')"
                ></button>
              </header>
              <section class="modal-card-body">
                <p>
                  <button id="rsvpYes${d.id}" class="button is-link" onclick="yes_rsvp('${d.id}')" type="button">
                    Yes
                  </button>
                  <button id="rsvpNo${d.id}" class="button is-link" onclick="no_rsvp('${d.id}')" type="button">
                    No
                  </button>
                </p>
              </section>
            </div>
          </div>`;

        html3 += `<div id="attendModal${d.id}" class="modal">
          <div class="modal-background"></div>
          <div class="modal-card">
            <header class="modal-card-head">
              <p class="modal-card-title">Current Responses</p>
              <button
                id="attendClose${d.id}"
                class="delete"
                aria-label="close"
                onclick="close_attend('${d.id}')"
              ></button>
            </header>
            <section class="modal-card-body">
              <div class="columns">
                <div id="attendingBlock${d.id}" class="column">
                  <p>
                    <strong>Will Be Attending</strong>
                  </p>
                  <div id="attending${d.id}"></div>
                </div>
                <div id="notAttendingBlock${d.id}" class="column">
                  <p class="bold">
                    <strong>Will Not Be Attending</strong>
                  </p>
                  <div id="notAttending${d.id}"></div>
                </div>
              </div>
            </section>
          </div>
        </div>`;
      });
      r_e("eventContent").innerHTML = html;
      r_e("rsvpModals").innerHTML = html2;
      r_e("attendModals").innerHTML = html3;
    });
}

// delete event
function del_doc(id) {
  db.collection("events")
    .doc(id)
    .get()
    .then((d) => {
      db.collection("events")
        .doc(id)
        .delete()
        .then(() => {
          show_events();
          configure_messages_bar("Event deleted!");
        });
    });
}

function find_rsvp(id) {
  let email = auth.currentUser.email;
  let docID = `${id}_${email}`;
  db.collection("rsvp")
    .doc(docID)
    .get()
    .then((d) => {
      if (r_e(`rsvp${id}`)) {
        r_e(`rsvpModal${id}`).classList.add("is-active");
      }
    });
}

function close_rsvp(id) {
  db.collection("rsvp")
    .doc(id)
    .get()
    .then((d) => {
      if (r_e(`rsvp${id}`)) {
        r_e(`rsvpModal${id}`).classList.remove("is-active");
      }
    });
}

function find_attend(id) {
  db.collection("rsvp")
    .doc(id)
    .get()
    .then((d) => {
      if (r_e(`attend${id}`)) {
        r_e(`attendModal${id}`).classList.add("is-active");
      }
    });
}

function close_attend(id) {
  db.collection("rsvp")
    .doc(id)
    .get()
    .then((d) => {
      if (r_e(`attend${id}`)) {
        r_e(`attendModal${id}`).classList.remove("is-active");
      }
    });
}

function yes_rsvp(id) {
  db.collection("rsvp")
    .doc(id)
    .get()
    .then((d) => {
      if (r_e(`rsvpYes${id}`)) {
        let rsvp_status = true;
        let user_email = auth.currentUser.email;
        let docID = `${id}_${user_email}`;
        let name3 = "";
        db.collection("user_profile")
          .where("user_email", "==", user_email)
          .get()
          .then((mydata) => {
            let mydocs = mydata.docs;
            mydocs.forEach((doc) => {
              name3 = `${doc.data().user_name}`;
            });
            let attend_name = name3;
            let rsvp = {
              user_email: user_email,
              user_name: attend_name,
              rsvp_status: rsvp_status,
              eventid: id,
            };
            return db
              .collection("rsvp")
              .doc(docID)
              .set(rsvp)
              .then(() => {});
          });
        r_e(`rsvpModal${id}`).classList.remove("is-active");
        r_e(`rsvp${id}`).classList.add("is-hidden");
      }
    });
}

function no_rsvp(id) {
  db.collection("rsvp")
    .doc(id)
    .get()
    .then((d) => {
      if (r_e(`rsvpNo${id}`)) {
        let rsvp_status = false;
        let user_email = auth.currentUser.email;
        let docID = `${id}_${user_email}`;
        let name4 = "";
        db.collection("user_profile")
          .where("user_email", "==", user_email)
          .get()
          .then((mydata) => {
            let mydocs = mydata.docs;
            mydocs.forEach((doc) => {
              name4 = `${doc.data().user_name}`;
            });
            let attend_name = name4;
            let rsvp = {
              user_email: user_email,
              user_name: attend_name,
              rsvp_status: rsvp_status,
              eventid: id,
            };
            return db
              .collection("rsvp")
              .doc(docID)
              .set(rsvp)
              .then(() => {});
          });
        r_e(`rsvpModal${id}`).classList.remove("is-active");
        r_e(`rsvp${id}`).classList.add("is-hidden");
      }
    });
}

function populateAttend(id) {
  // Clear previous content
  r_e(`attending${id}`).innerHTML = "";
  r_e(`notAttending${id}`).innerHTML = "";

  // Fetch RSVPs for this specific event and attending
  db.collection("rsvp")
    .where("eventid", "==", id) // only RSVPs for this event
    .where("rsvp_status", "==", true)
    .get()
    .then((e) => {
      let html = "";
      e.forEach((doc) => {
        html += `<p><br>Name: ${doc.data().user_name} <br>Email: ${
          doc.data().user_email
        }</p>`;
      });
      r_e(`attending${id}`).innerHTML = html;
    });

  // Fetch RSVPs for this specific event and not attending
  db.collection("rsvp")
    .where("eventid", "==", id)
    .where("rsvp_status", "==", false)
    .get()
    .then((e) => {
      let html = "";
      e.forEach((doc) => {
        html += `<p><br>Name: ${doc.data().user_name} <br>Email: ${
          doc.data().user_email
        }</p>`;
      });
      r_e(`notAttending${id}`).innerHTML = html;
    });
}

function showAttend(id) {
  r_e(`attendModal${id}`).classList.add("is-active");

  populateAttend(id);
}

show_events();

// update navbar based on auth state

setTimeout(() => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      const current_email = auth.currentUser.email;

      // All RSVP buttons
      let rsvpButtons = document.querySelectorAll(".rsvp");

      configure_nav_bar(current_email);
      r_e("userEmail").innerHTML = current_email;

      // Get user profile
      db.collection("user_profile")
        .where("user_email", "==", current_email)
        .get()
        .then((mydata) => {
          let mydocs = mydata.docs;
          let profileName = "";
          mydocs.forEach((doc) => {
            profileName = doc.data().user_name; // assuming one doc per user
          });
          r_e("profileName").innerHTML = profileName;
        });

      // Get RSVPs for this user
      db.collection("rsvp")
        .where("user_email", "==", current_email)
        .get()
        .then((e) => {
          let rsvpedEventIds = new Set();

          e.forEach((doc) => {
            const eventId = doc.data().eventid; // <-- read event ID field
            rsvpedEventIds.add(eventId.toString());
          });

          // Loop through all RSVP buttons
          rsvpButtons.forEach((btn) => {
            let eventId = btn.id.replace("rsvp", "");

            if (!rsvpedEventIds.has(eventId)) {
              btn.classList.remove("is-hidden");
            }
          });
        });
    } else {
      // User logged out
      configure_nav_bar();
      r_e("userEmail").innerHTML = "";
      r_e("profileName").innerHTML = "";

      // Optionally hide all RSVP buttons
      document.querySelectorAll(".rsvp").forEach((btn) => {
        btn.classList.add("is-hidden");
      });
    }
  });
}, 1000);

// Sign-up
r_e("signUpForm").addEventListener("submit", (e) => {
  e.preventDefault();
  let email = r_e("signUpEmail").value;
  let password = r_e("signUpPassword").value;
  let name = r_e("userName").value;
  let user = {
    user_email: email,
    user_name: name,
  };
  auth.createUserWithEmailAndPassword(email, password).then(() => {
    r_e("signUpModal").classList.remove("is-active");
    r_e("signUpForm").reset();
    db.collection("user_profile")
      .where("user_email", "==", email)
      .get()
      .then((mydata) => {
        let mydocs = mydata.docs;
        console.log(mydocs);

        mydocs.forEach((doc) => {
          name = `${doc.data().user_name}`;
        });
        configure_messages_bar(`Welcome ${name}!`);
      });
  });
  db.collection("user_profile")
    .doc(email)
    .set(user)
    .then(() => {});
});

// sign in user
r_e("signInForm").addEventListener("submit", (e) => {
  e.preventDefault();
  let email = r_e("signInEmail").value;
  let password = r_e("signInPassword").value;
  auth.signInWithEmailAndPassword(email, password).then(() => {
    db.collection("user_profile")
      .where("user_email", "==", email)
      .get()
      .then((mydata) => {
        let mydocs = mydata.docs;
        console.log(mydocs);

        mydocs.forEach((doc) => {
          name2 = `${doc.data().user_name}`;
        });
        configure_messages_bar(`Welcome back ${name2}!`);
      });
    r_e("signInModal").classList.remove("is-active");
    r_e("signInForm").reset();
  });
});

// sign out user
r_e(`signOutBtn`).addEventListener("click", () => {
  auth.signOut().then(() => {
    configure_messages_bar(`Goodbye!`);
  });
});

/* =========================
   Navbar Burger (Mobile)
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const navbarBurgers = Array.prototype.slice.call(
    document.querySelectorAll(".navbar-burger"),
    0
  );

  if (navbarBurgers.length > 0) {
    navbarBurgers.forEach((el) => {
      el.addEventListener("click", () => {
        const target = el.dataset.target;
        const $target = document.getElementById(target);

        el.classList.toggle("is-active");
        $target.classList.toggle("is-active");
      });
    });
  }
});

// Sign-Up Modal

// Open modal
r_e("signUpBtn").addEventListener("click", () => {
  r_e("signUpModal").classList.add("is-active");
});

// Close modal
r_e("signUpClose").addEventListener("click", () => {
  r_e("signUpModal").classList.remove("is-active");
});

//Profile Modal

// Open modal
r_e("profileBtn").addEventListener("click", () => {
  r_e("profileModal").classList.add("is-active");
});

// Close modal
r_e("profileClose").addEventListener("click", () => {
  r_e("profileModal").classList.remove("is-active");
});

/* =========================
     Sign-In Modal
  ========================= */

if (r_e("signInBtn")) {
  r_e("signInBtn").addEventListener("click", () => {
    signInModal.classList.add("is-active");
  });
}

if (r_e("signInClose")) {
  r_e("signInClose").addEventListener("click", () => {
    signInModal.classList.remove("is-active");
  });
}

if (r_e("adminToggle")) {
  r_e("adminToggle").addEventListener("click", () => {
    adminCodeField.classList.toggle("is-hidden");
  });
}

/* =========================
     Attendees Modal
  ========================= */

if (r_e("attend1")) {
  r_e("attend1").addEventListener("click", () => {
    r_e("attendModal").classList.add("is-active");
  });
}

if (r_e("attendClose")) {
  r_e("attendClose").addEventListener("click", () => {
    r_e("attendModal").classList.remove("is-active");
  });
}

/* =========================
    Create Event Modal
  ========================= */

if (r_e("createEvent")) {
  r_e("createEvent").addEventListener("click", () => {
    r_e("createEventModal").classList.add("is-active");
  });
}

if (r_e("createEventClose")) {
  r_e("createEventClose").addEventListener("click", () => {
    r_e("createEventModal").classList.remove("is-active");
  });
}

setTimeout(() => {
  // submit button
  r_e("submitEvent").addEventListener("click", (e) => {
    e.preventDefault();
    let title = r_e("eventTitle").value;
    let desc = r_e("eventDescription").value;
    let date = r_e("eventDate").value;
    let id = r_e("eventID").value;
    let timeStr = document.getElementById("eventTime").value;
    let [hours, minutes] = timeStr.split(":").map(Number);
    let time = new Date();
    time.setHours(hours);
    time.setMinutes(minutes);
    time.setSeconds(0);
    time.setMilliseconds(0);
    let event = {
      title: title,
      desc: desc,
      date: date,
      time: time,
      id: id,
    };
    if (title && desc && date && time && id) {
      db.collection("events")
        .doc(id)
        .set(event)
        .then(() => {
          r_e("eventTitle").value = "";
          r_e("eventDescription").value = "";
          r_e("eventDate").value = "";
          r_e("eventID").value = "";
          r_e("eventTime").value = "";
        });
      configure_messages_bar("Posted!");
      r_e("createEventModal").classList.remove("is-active");
      show_events();
    } else {
      alert("Please fill in all fields");
    }
  });
}, 1000);

/* =========================
     Route Modals (Strava)
  ========================= */
const routeLinks = document.querySelectorAll(".route-link");
const routeModals = document.querySelectorAll(".route-modal");
const modalCloses = document.querySelectorAll(
  ".modal-close, .modal-background"
);

routeLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.dataset.target;
    const modal = document.getElementById(target);
    if (modal) modal.classList.add("is-active");
  });
});

modalCloses.forEach((close) => {
  close.addEventListener("click", () => {
    close.closest(".modal").classList.remove("is-active");
  });
});

// Modal open/close
document.querySelectorAll(".modal-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const target = trigger.getAttribute("data-target");
    document.getElementById(target).classList.add("is-active");
  });
});
document.querySelectorAll(".close-modal, .modal-background").forEach((el) => {
  el.addEventListener("click", () => {
    el.closest(".modal").classList.remove("is-active");
  });
});

// Accordion toggle behavior
document.querySelectorAll(".accordion-header").forEach((header) => {
  header.addEventListener("click", () => {
    const body = header.parentElement.querySelector(".accordion-body");
    body.classList.toggle("is-hidden");
    const icon = header.querySelector(".icon");
    icon.textContent = body.classList.contains("is-hidden") ? "+" : "–";
  });
});
