const routes = {
    "/": "test.html",
    "/room": "room.html",
    "/game": "game.html"
};

function loadPage(route) {
    const appContainer = document.getElementById("app");
    const filename = routes[route];
    
    if (!filename) {
        // Handle route not found
        return;
    }

    fetch(filename)
        .then(response => response.text())
        .then(content => {
            appContainer.innerHTML = content;
        })
        .catch(error => {
            console.error("Error loading page:", error);
        });
}

function navigateTo(route) {
    history.pushState(null, null, route);
    loadPage(route);
}

// Handle initial page load
window.addEventListener("load", () => {
    const currentRoute = window.location.pathname;
    loadPage(currentRoute);
});

// Handle navigation when using browser back/forward buttons
window.addEventListener("popstate", () => {
    const currentRoute = window.location.pathname;
    loadPage(currentRoute);
});
