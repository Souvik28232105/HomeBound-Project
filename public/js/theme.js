const themeMenuToggle = document.getElementById("themeMenuToggle");

function updateThemeButton() {
    const isDark = document.documentElement.dataset.theme === "dark";

    if (themeMenuToggle) {
        themeMenuToggle.textContent = isDark ? "Light mode" : "Dark mode";
        themeMenuToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }
}

if (themeMenuToggle) {
    updateThemeButton();
    themeMenuToggle.addEventListener("click", () => {
        const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        if (nextTheme === "dark") {
            document.documentElement.dataset.theme = "dark";
        } else {
            delete document.documentElement.dataset.theme;
        }
        localStorage.setItem("homebound-theme", nextTheme);
        updateThemeButton();
    });
}
