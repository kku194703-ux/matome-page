
const menuToggle = document.getElementById("menuToggle");
const headerNav = document.getElementById("headerNav");

menuToggle.addEventListener("click", () => {
  headerNav.classList.toggle("active");
});

// メニューを選択したら閉じる
headerNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    headerNav.classList.remove("active");
  });
});


/* PARTNER PROJECTの文字を左から右へ流す */
.footer-message {
    animation: slideText 8s linear infinite;
    white-space: nowrap;
}

@keyframes slideText {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(100%);
    }
}
