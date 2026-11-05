
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
