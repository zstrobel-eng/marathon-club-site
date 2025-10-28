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

/* =========================
     Sign-In Modal
  ========================= */
const signInButton = document.getElementById("signInBtn");
const signInModal = document.getElementById("signInModal");
const signInClose = document.getElementById("signInClose");
const adminToggle = document.getElementById("adminToggle");
const adminCodeField = document.getElementById("adminCodeField");

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
