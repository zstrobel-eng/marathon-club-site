// functions
function r_e(id) {
  return document.querySelector(`#${id}`);
}

// message bar
function configure_messages_bar(msg) {
  if (r_e("messages")) {
    r_e("messages").classList.remove("is-hidden");
    r_e("messages").innerHTML = msg;
    setTimeout(() => {
      if (r_e("messages")) {
        r_e("messages").classList.add("is-hidden");
        r_e("messages").innerHTML = "";
      }
    }, 3000);
  }
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

// Sign up
const signUpForm = r_e("signUpForm");
const signUpError = r_e("signUpError");

function showSignUpError(msg) {
  if (signUpError) {
    signUpError.textContent = msg;
    signUpError.style.display = "block";
  } else {
    alert(msg);
  }
}

if (signUpForm) {
  signUpForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (signUpError) {
      signUpError.textContent = "";
      signUpError.style.display = "none";
    }

    let email = r_e("signUpEmail").value.trim();
    let password = r_e("signUpPassword").value;
    let name = r_e("userName").value.trim();

    if (!name || !email || !password) {
      showSignUpError("Please fill out all fields.");
      return;
    }

    if (password.length < 6) {
      showSignUpError("Password must be at least 6 characters long.");
      return;
    }

    let user = {
      user_email: email,
      user_name: name,
    };

    auth
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        return db.collection("user_profile").doc(email).set(user);
      })
      .then(() => {
        return db
          .collection("user_profile")
          .where("user_email", "==", email)
          .get();
      })
      .then((mydata) => {
        let mydocs = mydata.docs;
        console.log(mydocs);

        mydocs.forEach((doc) => {
          name = `${doc.data().user_name}`;
        });

        configure_messages_bar(`Welcome ${name}!`);

        if (r_e("signUpModal")) {
          r_e("signUpModal").classList.remove("is-active");
        }
        signUpForm.reset();
      })
      .catch((error) => {
        console.error(error);

        let message = "Something went wrong. Please try again.";

        switch (error.code) {
          case "auth/email-already-in-use":
            message =
              "This email is already registered. Try logging in instead.";
            break;
          case "auth/invalid-email":
            message = "Please enter a valid email address.";
            break;
          case "auth/weak-password":
            message = "Your password is too weak. Use at least 6 characters.";
            break;
          case "auth/operation-not-allowed":
            message =
              "Sign up is currently disabled. Please contact support if this continues.";
            break;
          case "permission-denied":
            message =
              "You do not have permission to create this account. Please contact support.";
            break;
          default:
            if (error.message) {
              message = error.message;
            }
        }

        showSignUpError(message);
      });
  });
}

// SIGN IN USER
if (r_e("signInForm")) {
  r_e("signInForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const errorBox = r_e("signInError");
    if (errorBox) {
      errorBox.textContent = "";
      errorBox.style.display = "none";
    }

    const email = r_e("signInEmail").value.trim();
    const password = r_e("signInPassword").value;

    if (!email || !password) {
      if (errorBox) {
        errorBox.textContent = "Please enter both email and password.";
        errorBox.style.display = "block";
      }
      return;
    }

    auth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        // get the user's name from Firestore
        return db
          .collection("user_profile")
          .where("user_email", "==", email)
          .get();
      })
      .then((snapshot) => {
        let name2 = "User";
        snapshot.docs.forEach((doc) => {
          name2 = doc.data().user_name;
        });

        configure_messages_bar(`Welcome back ${name2}!`);

        if (r_e("signInModal")) {
          r_e("signInModal").classList.remove("is-active");
        }
        r_e("signInForm").reset();
      })
      .catch((error) => {
        console.log("SIGN IN ERROR RAW:", error);
        const errorBox = r_e("signInError");

        let message = "Unable to sign in. Please try again.";

        const code = error.code || "";
        const raw = error && error.message ? String(error.message) : "";

        // check firebase codes first
        if (code === "auth/user-not-found" || raw.includes("USER_NOT_FOUND")) {
          message = "No account found with that email.";
        } else if (
          code === "auth/wrong-password" ||
          raw.includes("INVALID_LOGIN_CREDENTIALS") ||
          raw.includes("WRONG_PASSWORD")
        ) {
          message = "Incorrect email or password. Please try again.";
        } else if (
          code === "auth/invalid-email" ||
          raw.includes("INVALID_EMAIL")
        ) {
          message = "Please enter a valid email address.";
        } else if (
          code === "auth/too-many-requests" ||
          raw.includes("TOO_MANY_ATTEMPTS")
        ) {
          message =
            "Too many failed attempts. Please wait a moment and try again.";
        } else if (
          code === "auth/user-disabled" ||
          raw.includes("USER_DISABLED")
        ) {
          message = "This account has been disabled. Please contact support.";
        }

        if (errorBox) {
          errorBox.textContent = message;
          errorBox.style.display = "block";
        } else {
          alert(message);
        }
      });
  });
}

// authenticate admin user

function configureAdminNav(email) {
  if (!email) {
    // Hide admin link if no user signed in
    document.querySelectorAll(".adminNav").forEach((el) => {
      el.classList.add("is-hidden");
    });
    return;
  }

  // Check if this user is in the admins collection
  db.collection("admins")
    .doc(email)
    .get()
    .then((doc) => {
      const isAdmin = doc.exists;
      document.querySelectorAll(".adminNav").forEach((el) => {
        if (isAdmin) {
          el.classList.remove("is-hidden");
        } else {
          el.classList.add("is-hidden");
        }
      });
    })
    .catch((err) => console.error("Error checking admin status:", err));
}

auth.onAuthStateChanged((user) => {
  const email = user ? user.email : null;
  configureAdminNav(email);
});

// ===== Forgot Password Feature =====

const forgotLink = r_e("forgotPasswordLink");
const forgotModal = r_e("forgotPasswordModal");
const forgotClose = r_e("forgotPasswordClose");
const forgotForm = r_e("forgotPasswordForm");
const forgotEmailInput = r_e("forgotPasswordEmail");
const forgotError = r_e("forgotPasswordError");
const forgotSuccess = r_e("forgotPasswordSuccess");

function openForgotPasswordModal() {
  if (forgotModal) {
    // pre-fill with email from sign in form if present
    const signInEmailEl = r_e("signInEmail");
    if (signInEmailEl && signInEmailEl.value) {
      forgotEmailInput.value = signInEmailEl.value.trim();
    }
    forgotError.textContent = "";
    forgotSuccess.textContent = "";
    forgotError.style.display = "none";
    forgotSuccess.style.display = "none";
    forgotModal.classList.add("is-active");
  }
}

function closeForgotPasswordModal() {
  if (forgotModal) {
    forgotModal.classList.remove("is-active");
  }
}

// open modal when link is clicked
if (forgotLink) {
  forgotLink.addEventListener("click", (e) => {
    e.preventDefault();
    openForgotPasswordModal();
  });
}

// close button
if (forgotClose) {
  forgotClose.addEventListener("click", (e) => {
    e.preventDefault();
    closeForgotPasswordModal();
  });
}

// optional: close when clicking background
if (forgotModal) {
  const bg = forgotModal.querySelector(".modal-background");
  if (bg) {
    bg.addEventListener("click", closeForgotPasswordModal);
  }
}

// submit handler: send reset email
if (forgotForm) {
  forgotForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // clear old messages
    forgotError.textContent = "";
    forgotSuccess.textContent = "";
    forgotError.style.display = "none";
    forgotSuccess.style.display = "none";

    const email = forgotEmailInput.value.trim();

    if (!email) {
      forgotError.textContent = "Please enter your email.";
      forgotError.style.display = "block";
      return;
    }

    auth
      .sendPasswordResetEmail(email)
      .then(() => {
        // IMPORTANT: we keep the message generic
        forgotSuccess.textContent =
          "If an account exists with that email, a reset link has been sent. Remember to check spam folder as well.";
        forgotSuccess.style.display = "block";
      })
      .catch((error) => {
        console.error("Forgot password error:", error);

        // still keep it generic for security
        if (error.code === "auth/invalid-email") {
          forgotError.textContent = "Please enter a valid email address.";
        } else {
          forgotError.textContent =
            "Unable to send reset email right now. Please try again later.";
        }
        forgotError.style.display = "block";
      });
  });
}

// sign out user
if (r_e(`signOutBtn`)) {
  r_e(`signOutBtn`).addEventListener("click", () => {
    auth.signOut().then(() => {
      configure_messages_bar(`Goodbye!`);
      window.location.href = "index.html";
    });
  });
}

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

// // Sign-Up Modal

// Open modal
if (r_e("signUpBtn")) {
  r_e("signUpBtn").addEventListener("click", () => {
    r_e("signUpModal").classList.add("is-active");
  });
}

// Close modal
if (r_e("signUpClose")) {
  r_e("signUpClose").addEventListener("click", () => {
    r_e("signUpModal").classList.remove("is-active");
  });
}

//Profile Modal

// Open modal
if (r_e("profileBtn")) {
  r_e("profileBtn").addEventListener("click", () => {
    r_e("profileModal").classList.add("is-active");
  });
}

// Close modal
if (r_e("profileClose")) {
  r_e("profileClose").addEventListener("click", () => {
    r_e("profileModal").classList.remove("is-active");
  });
}

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
// const routeLinks = document.querySelectorAll(".route-link");
// const routeModals = document.querySelectorAll(".route-modal");
// const modalCloses = document.querySelectorAll(
//   ".modal-close, .modal-background"
// );

// routeLinks.forEach((link) => {
//   link.addEventListener("click", (e) => {
//     e.preventDefault();
//     const target = link.dataset.target;
//     const modal = document.getElementById(target);
//     if (modal) modal.classList.add("is-active");
//   });
// });

// modalCloses.forEach((close) => {
//   close.addEventListener("click", () => {
//     close.closest(".modal").classList.remove("is-active");
//   });
// });

// // Modal open/close
// document.querySelectorAll(".modal-trigger").forEach((trigger) => {
//   trigger.addEventListener("click", () => {
//     const target = trigger.getAttribute("data-target");
//     document.getElementById(target).classList.add("is-active");
//   });
// });
// document.querySelectorAll(".close-modal, .modal-background").forEach((el) => {
//   el.addEventListener("click", () => {
//     el.closest(".modal").classList.remove("is-active");
//   });
// });

// Accordion toggle behavior
document.querySelectorAll(".accordion-header").forEach((header) => {
  header.addEventListener("click", () => {
    const body = header.parentElement.querySelector(".accordion-body");
    body.classList.toggle("is-hidden");
    const icon = header.querySelector(".icon");
    icon.textContent = body.classList.contains("is-hidden") ? "+" : "–";
  });
});

// ************************** Route Data **************************

// configuring routes page to pull content from firestore

// Only run on routes.html
/* =========================
     Route Modals (Static — Only for pages OTHER than routes)
  ========================= */

// Only run this static modal code if NOT on routes.html
if (!window.location.pathname.includes("routes.html")) {
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
      const modal = close.closest(".modal");
      if (modal) modal.classList.remove("is-active");
    });
  });

  // Generic modal triggers (Bulma)
  document.querySelectorAll(".modal-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const target = trigger.getAttribute("data-target");
      document.getElementById(target).classList.add("is-active");
    });
  });

  document.querySelectorAll(".close-modal, .modal-background").forEach((el) => {
    el.addEventListener("click", () => {
      const modal = el.closest(".modal");
      if (modal) modal.classList.remove("is-active");
    });
  });
}

/* =========================
     Firestore Dynamic Routes
  ========================= */

if (window.location.pathname.includes("routes.html")) {
  loadRoutes();
}

function loadRoutes() {
  db.collection("routes")
    .orderBy("route_distance")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        const route = doc.data();

        const distance = route.route_distance;
        const title = route.route_title;
        const modalContent = route.strava_info;
        const modalId = `routeModal-${doc.id}`;

        // Determine group list based on distance
        const groupId = getGroupId(distance);
        const list = document.getElementById(groupId);
        if (!list) return;

        // Create list item
        const li = document.createElement("li");
        li.innerHTML = `<a href="#" class="route-link" data-target="${modalId}">${title}</a>`;
        list.appendChild(li);

        // Create modal
        createModal(modalId, modalContent);
      });

      // After insert, attach modal handlers
      attachModalHandlers();
    })
    .catch((err) => console.error("Error loading routes:", err));
}

function getGroupId(distance) {
  if (distance >= 2 && distance < 4) return "group-2-4";
  if (distance >= 4 && distance < 6) return "group-4-6";
  if (distance >= 6 && distance < 10) return "group-6-10";
  if (distance >= 10 && distance < 15) return "group-10-15";
  if (distance >= 15 && distance < 20) return "group-15-20";
  return "group-20-28";
}

function createModal(id, html) {
  const container = document.getElementById("modalContainer");
  if (!container) return;

  // Create modal div
  const modal = document.createElement("div");
  modal.id = id;
  modal.classList.add("modal", "route-modal");

  // Background
  const background = document.createElement("div");
  background.classList.add("modal-background");
  modal.appendChild(background);

  // Content wrapper
  const contentDiv = document.createElement("div");
  contentDiv.classList.add("modal-content");
  modal.appendChild(contentDiv);

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.classList.add("modal-close", "is-large");
  closeBtn.setAttribute("aria-label", "close");
  modal.appendChild(closeBtn);

  // Parse HTML string
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // Append any divs
  tempDiv.querySelectorAll("div").forEach((el) => {
    contentDiv.appendChild(el);
  });

  // Append script tags properly
  tempDiv.querySelectorAll("script").forEach((scriptEl) => {
    const newScript = document.createElement("script");
    if (scriptEl.src) newScript.src = scriptEl.src;
    if (scriptEl.textContent) newScript.textContent = scriptEl.textContent;
    document.body.appendChild(newScript); // append to body to execute
  });

  container.appendChild(modal);
}

function attachModalHandlers() {
  const openButtons = document.querySelectorAll(".route-link");
  const closeButtons = document.querySelectorAll(
    ".modal-close, .modal-background"
  );

  openButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const modalId = btn.dataset.target;
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.add("is-active");
    });
  });

  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal");
      if (modal) modal.classList.remove("is-active");
    });
  });
}

// ************************** Admin Managing Routes **************************

// Load routes into manageRoutesModal
function loadManageRoutes() {
  const modalBody = document.querySelector(
    "#manageRoutesModal .modal-card-body"
  );
  if (!modalBody) return;

  // Clear existing list
  modalBody.innerHTML = "";

  db.collection("routes")
    .orderBy("route_distance")
    .get()
    .then((snapshot) => {
      // Sort by route_distance
      const routes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      routes.sort((a, b) => a.route_distance - b.route_distance);

      if (routes.length === 0) {
        modalBody.innerHTML = "<p>No routes found.</p>";
        return;
      }

      // Create list
      const ul = document.createElement("ul");
      routes.forEach((route) => {
        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.alignItems = "center";
        li.style.marginBottom = "5px";

        const nameSpan = document.createElement("span");
        nameSpan.textContent = route.route_title;
        nameSpan.style.flex = "1";

        // Rename button
        const renameBtn = document.createElement("button");
        renameBtn.textContent = "Rename";
        renameBtn.classList.add("button", "is-small", "is-info", "mr-2");
        renameBtn.addEventListener("click", () => {
          const newName = prompt("Enter new route name:", route.route_title);
          if (newName && newName.trim() !== "") {
            db.collection("routes")
              .doc(route.id)
              .update({ route_title: newName.trim() })
              .then(() => loadManageRoutes()) // refresh list
              .catch((err) => console.error("Error renaming route:", err));
          }
        });

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("button", "is-small", "is-danger");
        deleteBtn.addEventListener("click", () => {
          if (
            confirm(`Are you sure you want to delete "${route.route_title}"?`)
          ) {
            db.collection("routes")
              .doc(route.id)
              .delete()
              .then(() => loadManageRoutes()) // refresh list
              .catch((err) => console.error("Error deleting route:", err));
          }
        });

        li.appendChild(nameSpan);
        li.appendChild(renameBtn);
        li.appendChild(deleteBtn);
        ul.appendChild(li);
      });

      modalBody.appendChild(ul);
    })
    .catch((err) => console.error("Error loading routes:", err));
}

// Attach listener to open modal and load routes
const manageRoutesBtn = document.querySelector(
  '[data-target="manageRoutesModal"]'
);
if (manageRoutesBtn) {
  manageRoutesBtn.addEventListener("click", () => {
    const modal = document.getElementById("manageRoutesModal");
    if (modal) modal.classList.add("is-active");
    loadManageRoutes();
  });
}

// Close modal
const manageRoutesClose = document.querySelector(
  "#manageRoutesModal .close-modal"
);
if (manageRoutesClose) {
  manageRoutesClose.addEventListener("click", () => {
    const modal = document.getElementById("manageRoutesModal");
    if (modal) modal.classList.remove("is-active");
  });
}
// ************************** Admin Add New Route **************************

// Add Route functionality (with auto-refresh)
document.addEventListener("DOMContentLoaded", () => {
  const addRouteBtn = document.querySelector(
    "#addRouteModal .button.is-primary"
  );
  const addRouteModal = document.getElementById("addRouteModal");
  const closeBtns = addRouteModal.querySelectorAll(
    ".delete, .modal-background"
  );

  if (addRouteBtn && addRouteModal) {
    addRouteBtn.addEventListener("click", () => {
      const routeTitleInput = document.getElementById("route_title");
      const stravaInfoInput = document.getElementById("strava_info");
      const routeDistanceInput = document.getElementById("route_distance");

      const routeTitle = routeTitleInput.value.trim();
      const stravaInfo = stravaInfoInput.value.trim();
      const routeDistance = parseFloat(routeDistanceInput.value.trim());

      // Validate input
      if (!routeTitle || !stravaInfo || isNaN(routeDistance)) {
        configure_messages_bar("Please fill out all fields correctly.");
        return;
      }

      // Add route to Firestore
      db.collection("routes")
        .add({
          route_title: routeTitle,
          strava_info: stravaInfo,
          route_distance: routeDistance,
        })
        .then(() => {
          // Close modal
          addRouteModal.classList.remove("is-active");

          // Clear input fields
          routeTitleInput.value = "";
          stravaInfoInput.value = "";
          routeDistanceInput.value = "";

          // Show success message
          configure_messages_bar(`Route "${routeTitle}" added successfully!`);

          // Refresh Manage Routes modal content
          if (typeof loadManageRoutes === "function") {
            loadManageRoutes();
          }

          // Refresh routes page if currently on routes.html
          if (window.location.pathname.includes("routes.html")) {
            if (typeof loadRoutes === "function") {
              loadRoutes(true); // use true to denote "refresh"
            }
          }
        })
        .catch((error) => {
          console.error("Error adding route: ", error);
          configure_messages_bar("Error adding route. Please try again.");
        });
    });

    // Close modal when clicking close button or background
    closeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        addRouteModal.classList.remove("is-active");

        // Clear fields on close
        document.getElementById("route_title").value = "";
        document.getElementById("strava_info").value = "";
        document.getElementById("route_distance").value = "";
      });
    });
  }
});

// ******************** ADMIN USER MANAGEMENT ******************

document.addEventListener("DOMContentLoaded", () => {
  if (!window.location.pathname.includes("admin.html")) return;

  // Elements
  const searchInput = document.getElementById("userSearch");
  const suggestionsBox = document.getElementById("userSuggestions");
  const editSection = document.getElementById("editUserSection");
  const editNameInput = document.getElementById("editUserName");
  const editEmailInput = document.getElementById("editUserEmail"); // read-only in UI
  const editIsAdminCheckbox = document.getElementById("editIsAdmin");
  const saveUserBtn = document.getElementById("saveUserChanges");
  const deleteUserBtn = document.getElementById("deleteUser");

  const newNameInput = document.getElementById("newUserName");
  const newEmailInput = document.getElementById("newUserEmail");
  const newPasswordInput = document.getElementById("newUserPassword");
  const newIsAdminCheckbox = document.getElementById("newIsAdmin");
  const createNewUserBtn = document.getElementById("createNewUser");

  if (!searchInput || !suggestionsBox || !editSection) {
    console.warn("Admin user management: missing required DOM elements.");
    return;
  }

  // State
  let suggestionResults = []; // array of { id: email, ...data }
  let selectedUserEmail = null;

  // Debounce helper
  function debounce(fn, wait = 250) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // ==========================================
  // GLOBAL USER CACHE (for substring searching)
  // ==========================================
  let allUsersCache = [];

  // Load all users into cache once
  async function loadAllUsers() {
    const snap = await db.collection("user_profile").get();
    allUsersCache = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  // Substring search across user_name + user_email
  async function fetchUserSuggestions(queryText) {
    if (!queryText || queryText.trim().length === 0) return [];

    const q = queryText.trim().toLowerCase();

    // load cache only once
    if (allUsersCache.length === 0) {
      await loadAllUsers();
    }

    // filter for ANY substring match
    const matches = allUsersCache.filter((user) => {
      const name = (user.user_name || "").toLowerCase();
      const email = (user.user_email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });

    // sort alphabetically by name
    matches.sort((a, b) =>
      (a.user_name || "").localeCompare(b.user_name || "")
    );

    return matches;
  }

  // Load full user data by email (doc ID)
  async function loadUserByEmail(email) {
    if (!email) return null;
    const doc = await db.collection("user_profile").doc(email).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  // Check admin status by admins/{email}
  async function getAdminStatus(email) {
    const doc = await db.collection("admins").doc(email).get();
    return doc.exists;
  }

  function renderSuggestions(items) {
    suggestionsBox.innerHTML = "";
    if (!items || items.length === 0) {
      suggestionsBox.innerHTML = `<p class="has-text-grey">No matching users</p>`;
      return;
    }

    const ul = document.createElement("ul");
    ul.style.listStyle = "none";
    ul.style.padding = "0";
    ul.style.margin = "0";

    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "box suggestion-item";
      li.style.cursor = "pointer";
      li.style.marginBottom = "0.5rem";
      // display "Name — email"
      const name = document.createElement("div");
      name.textContent = `${item.user_name || "(no name)"} — ${
        item.user_email
      }`;
      li.appendChild(name);

      // click -> select user for editing
      li.addEventListener("click", async () => {
        await selectUser(item.user_email);
      });

      ul.appendChild(li);
    });

    suggestionsBox.appendChild(ul);
  }

  // Select a user and populate edit form
  async function selectUser(email) {
    const user = await loadUserByEmail(email);
    if (!user) {
      configure_messages_bar("User not found.");
      return;
    }
    selectedUserEmail = email;
    editSection.classList.remove("is-hidden");
    editNameInput.value = user.user_name || "";
    editEmailInput.value = user.user_email || ""; // read-only
    // read current admin status
    const isAdmin = await getAdminStatus(email);
    editIsAdminCheckbox.checked = !!isAdmin;

    // scroll suggestions box a bit so admin sees edit section
    editSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Save changes (only name and admin status)
  async function saveSelectedUser() {
    if (!selectedUserEmail) return configure_messages_bar("No user selected.");

    const newName = (editNameInput.value || "").trim();
    const wantAdmin = !!editIsAdminCheckbox.checked;
    if (!newName) return configure_messages_bar("Name cannot be empty.");

    try {
      // Update user_profile document (doc ID = email)
      await db.collection("user_profile").doc(selectedUserEmail).update({
        user_name: newName,
      });

      // Update admins collection
      const adminRef = db.collection("admins").doc(selectedUserEmail);
      if (wantAdmin) {
        await adminRef.set({ is_admin: true });
      } else {
        // remove admin if exists
        const doc = await adminRef.get();
        if (doc.exists) await adminRef.delete();
      }

      await loadAllUsers();
      configure_messages_bar("User updated.");
      // refresh suggestions and re-select to refresh UI
      await refreshSuggestionsAndSelection();

      // Close manageUsersModal after successful update
      const manageUsersModal = document.getElementById("manageUsersModal");
      if (manageUsersModal) {
        manageUsersModal.classList.remove("is-active");
      }
    } catch (err) {
      console.error("Error saving user", err);
      configure_messages_bar("Error updating user.");
    }
  }

  // Delete user (Firestore only)
  async function deleteSelectedUser() {
    if (!selectedUserEmail) return configure_messages_bar("No user selected.");

    if (
      !confirm(
        `Delete user ${selectedUserEmail}? This removes user_profile and admin record (Auth account NOT deleted).`
      )
    )
      return;

    try {
      await db.collection("user_profile").doc(selectedUserEmail).delete();
      // delete admin doc if exists
      const adminRef = db.collection("admins").doc(selectedUserEmail);
      const adminDoc = await adminRef.get();
      if (adminDoc.exists) await adminRef.delete();
      await loadAllUsers();
      configure_messages_bar("User removed (Firestore).");

      // Clear selection and refresh
      selectedUserEmail = null;
      editSection.classList.add("is-hidden");
      editNameInput.value = "";
      editEmailInput.value = "";

      // Refresh suggestions
      await refreshSuggestionsAndSelection();

      // Close manageUsersModal after successful deletion
      const manageUsersModal = document.getElementById("manageUsersModal");
      if (manageUsersModal) {
        manageUsersModal.classList.remove("is-active");
      }
    } catch (err) {
      console.error("Error deleting user", err);
      configure_messages_bar("Error deleting user.");
    }
  }

  // Create new user: creates user_profile doc, then admin doc if needed
  async function createNewUser() {
    const name = (newNameInput.value || "").trim();
    const email = (newEmailInput.value || "").trim();
    const password = newPasswordInput.value || ""; // this will NOT be used for Auth
    const makeAdmin = !!newIsAdminCheckbox.checked;

    if (!name || !email) {
      return configure_messages_bar("Name and email are required.");
    }

    // Basic email pattern check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return configure_messages_bar("Enter a valid email address.");
    }

    try {
      // Only create Firestore user_profile
      await db.collection("user_profile").doc(email).set({
        user_email: email,
        user_name: name,
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
      });

      // Optionally add to admin collection
      if (makeAdmin) {
        await db.collection("admins").doc(email).set({ is_admin: true });
      }
      await loadAllUsers();
      // Clear fields
      newNameInput.value = "";
      newEmailInput.value = "";
      newPasswordInput.value = "";
      newIsAdminCheckbox.checked = false;

      configure_messages_bar("User created in Firestore.");

      await refreshSuggestionsAndSelection();
    } catch (err) {
      console.error("Error creating user", err);
      configure_messages_bar("Error creating user. Check console for details.");
    }
  }

  // Utility: refresh suggestions (for current search input), optionally reselect current user
  async function refreshSuggestionsAndSelection() {
    const q = searchInput.value.trim();
    const items = q ? await fetchUserSuggestions(q) : [];
    suggestionResults = items;
    renderSuggestions(items);

    // If still have selectedUserEmail, try to reselect to refresh displayed values.
    if (selectedUserEmail) {
      const stillExists = await db
        .collection("user_profile")
        .doc(selectedUserEmail)
        .get();
      if (stillExists.exists) {
        await selectUser(selectedUserEmail);
      } else {
        // If it was deleted, clear selection UI
        selectedUserEmail = null;
        editSection.classList.add("is-hidden");
        editNameInput.value = "";
        editEmailInput.value = "";
      }
    }
  }

  // Debounced search
  const onSearchChange = debounce(async (ev) => {
    const q = ev.target.value || "";
    if (!q) {
      suggestionsBox.innerHTML =
        "<p class='has-text-grey'>Enter name or email to search</p>";
      return;
    }
    const items = await fetchUserSuggestions(q);
    suggestionResults = items;
    renderSuggestions(items);
  }, 200);

  searchInput.addEventListener("input", onSearchChange);

  // Save & delete buttons
  if (saveUserBtn) saveUserBtn.addEventListener("click", saveSelectedUser);
  if (deleteUserBtn)
    deleteUserBtn.addEventListener("click", deleteSelectedUser);

  // Create new user
  if (createNewUserBtn)
    createNewUserBtn.addEventListener("click", createNewUser);

  // When modal opens, clear previous state
  const manageUsersModal = document.getElementById("manageUsersModal");
  if (manageUsersModal) {
    const triggers = document.querySelectorAll(
      '[data-target="manageUsersModal"]'
    );
    triggers.forEach((t) => {
      t.addEventListener("click", () => {
        // reset UI
        searchInput.value = "";
        suggestionsBox.innerHTML =
          "<p class='has-text-grey'>Enter name or email to search</p>";
        editSection.classList.add("is-hidden");
        selectedUserEmail = null;
      });
    });
  }

  // Initial suggestion placeholder
  suggestionsBox.innerHTML =
    "<p class='has-text-grey'>Enter name or email to search</p>";
});

// count number of user_profile documents and display in admin dashboard
function updateMemberCount() {
  db.collection("user_profile").onSnapshot(
    (snapshot) => {
      const count = snapshot.size;
      const memberCountEl = document.getElementById("memberCount");
      if (memberCountEl) {
        memberCountEl.innerHTML = `Total Users Accounts: ${count}`;
      }
    },
    (err) => {
      console.error("Error counting users:", err);
    }
  );
}

document.addEventListener("DOMContentLoaded", () => {
  updateMemberCount();
});

document.addEventListener("DOMContentLoaded", () => {
  updateMemberCount();

  loadAllUsers();
});
