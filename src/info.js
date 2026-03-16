const { listen } = window.__TAURI__.event;
const root = document.getElementById("root");

async function init() {
    await listen('info', async (event) => {
        root.innerHTML = event.payload;
    });
}

window.addEventListener('DOMContentLoaded', init);