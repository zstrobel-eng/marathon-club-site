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

// update navbar
auth.onAuthStateChanged((user) => {
  if (user) {
    const email = auth.currentUser.email;
    configure_nav_bar(auth.currentUser.email);
    r_e("userEmail").innerHTML = auth.currentUser.email;
    r_e("profileName").innerHTML = user_profile.email.user_name;
    r_e("rsvp1").classList.remove("is-hidden");
  } else {
    configure_nav_bar();
    r_e("userEmail").innerHTML = "";
    r_e("profileName").innerHTML = "";
    r_e("rsvp1").classList.add("is-hidden");
  }
});

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
    configure_messages_bar(`Welcome ${auth.currentUser.email}!`);
  });
  console.log(user);
  db.collection("user_profile")
    .doc(email)
    .set(user)
    .then(() => {
      console.log("John added");
    });
});

// sign in user
r_e("signInForm").addEventListener("submit", (e) => {
  e.preventDefault();
  let email = r_e("signInEmail").value;
  let password = r_e("signInPassword").value;
  auth.signInWithEmailAndPassword(email, password).then(() => {
    configure_messages_bar(`Welcome back ${auth.currentUser.email}!`);
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
    let user_name = auth.currentUser.displayName || "Anonymous";
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
