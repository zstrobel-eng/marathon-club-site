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

// Get elements
const signInButton = document.getElementById("signInBtn");
const signInModal = document.getElementById("signInModal");
const signInClose = document.getElementById("signInClose");
const adminToggle = document.getElementById("adminToggle");
const adminCodeField = document.getElementById("adminCodeField");

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
    configure_nav_bar(auth.currentUser.email);
  } else {
    configure_nav_bar();
  }
});

// Sign-up
r_e("signUpForm").addEventListener("submit", (e) => {
  e.preventDefault();
  let email = r_e("userEmail").value;
  let password = r_e("userPassword").value;
  auth.createUserWithEmailAndPassword(email, password).then(() => {
    r_e("signUpModal").classList.remove("is-active");
    r_e("signUpForm").reset();
    configure_messages_bar(`Welcome ${auth.currentUser.email}!`);
  });
});

// // Log-in
// document.getElementById("login").addEventListener("submit", (e) => {
//   const email = document.getElementById("email").value;
//   const password = document.getElementById("password").value;

//   auth
//     .signInWithEmailAndPassword(email, password)
//     .then((userCredential) => {
//       document.getElementById("message").innerText = "✅ Logged in!";
//     })
//     .catch((error) => {
//       document.getElementById("message").innerText = "Error: " + error.message;
//     });
// });

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
  signUpModal.classList.add("is-active");
});

// Close modal
r_e("signUpClose").addEventListener("click", () => {
  signUpModal.classList.remove("is-active");
});

/* =========================
     Sign-In Modal
  ========================= */

if (signInButton) {
  signInButton.addEventListener("click", () => {
    signInModal.classList.add("is-active");
  });
}

if (signInClose) {
  signInClose.addEventListener("click", () => {
    signInModal.classList.remove("is-active");
  });
}

if (adminToggle) {
  adminToggle.addEventListener("click", () => {
    adminCodeField.classList.toggle("is-hidden");
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
