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

// update navbar
auth.onAuthStateChanged((user) => {
  if (user) {
    const current_email = auth.currentUser.email;
    configure_nav_bar(auth.currentUser.email);
    if (r_e("userEmail")) r_e("userEmail").innerHTML = auth.currentUser.email;
    db.collection("user_profile")
      .where("user_email", "==", current_email)
      .get()
      .then((mydata) => {
        let mydocs = mydata.docs;
        console.log(mydocs);

        // loop through the mydocs array
        let html = "";
        mydocs.forEach((doc) => {
          html = `${doc.data().user_name}`;
        });
        console.log(html);
        if (r_e("profileName")) r_e("profileName").innerHTML = html;
      });
    if (r_e("rsvp1")) r_e("rsvp1").classList.remove("is-hidden");
  } else {
    configure_nav_bar();
    if (r_e("userEmail")) r_e("userEmail").innerHTML = "";
    if (r_e("profileName")) r_e("profileName").innerHTML = "";
    if (r_e("rsvp1")) r_e("rsvp1").classList.add("is-hidden");
  }
});

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

// document.addEventListener("DOMContentLoaded", () => {
//   // Sign-Up Modal
//   if (r_e("signUpBtn") && r_e("signUpModal")) {
//     r_e("signUpBtn").addEventListener("click", () => {
//       r_e("signUpModal").classList.add("is-active");
//     });
//   }

//   if (r_e("signUpClose") && r_e("signUpModal")) {
//     r_e("signUpClose").addEventListener("click", () => {
//       r_e("signUpModal").classList.remove("is-active");
//     });
//   }

//   // Sign-In Modal
//   if (r_e("signInBtn") && r_e("signInModal")) {
//     r_e("signInBtn").addEventListener("click", () => {
//       r_e("signInModal").classList.add("is-active");
//     });
//   }

//   if (r_e("signInClose") && r_e("signInModal")) {
//     r_e("signInClose").addEventListener("click", () => {
//       r_e("signInModal").classList.remove("is-active");
//     });
//   }

//   // Profile Modal (if needed)
//   if (r_e("profileBtn") && r_e("profileModal")) {
//     r_e("profileBtn").addEventListener("click", () => {
//       r_e("profileModal").classList.add("is-active");
//     });
//   }

//   if (r_e("profileClose") && r_e("profileModal")) {
//     r_e("profileClose").addEventListener("click", () => {
//       r_e("profileModal").classList.remove("is-active");
//     });
//   }
// });

/* =========================
     RSVP Modal
  ========================= */

if (r_e("rsvp1")) {
  r_e("rsvp1").addEventListener("click", () => {
    r_e("rsvpModal").classList.add("is-active");
  });
}

if (r_e("rsvpClose")) {
  r_e("rsvpClose").addEventListener("click", () => {
    r_e("rsvpModal").classList.remove("is-active");
  });
}

if (r_e("rsvpYes")) {
  r_e("rsvpYes").addEventListener("click", () => {
    let rsvp_status = true;
    let user_email = auth.currentUser.email;
    db.collection("rsvp").add;
    // r_e("attending").innerHTML += `<p>${auth.currentUser.email}</p>`;
    r_e("rsvpModal").classList.remove("is-active");
    r_e("rsvp1").classList.add("is-hidden");
  });
}

if (r_e("rsvpNo")) {
  r_e("rsvpNo").addEventListener("click", () => {
    // r_e("not_attending").innerHTML += `<p>${auth.currentUser.email}</p>`;
    r_e("rsvpModal").classList.remove("is-active");
    r_e("rsvp1").classList.add("is-hidden");
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

// // Accordion toggle behavior
// document.querySelectorAll(".accordion-header").forEach((header) => {
//   header.addEventListener("click", () => {
//     const body = header.parentElement.querySelector(".accordion-body");
//     body.classList.toggle("is-hidden");
//     const icon = header.querySelector(".icon");
//     icon.textContent = body.classList.contains("is-hidden") ? "+" : "–";
//   });
// });

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

// Add Route functionality
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
        // Optionally clear fields on close
        document.getElementById("route_title").value = "";
        document.getElementById("strava_info").value = "";
        document.getElementById("route_distance").value = "";
      });
    });
  }
});
