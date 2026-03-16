const { listen } = window.__TAURI__.event;
const root = document.getElementById("root");

async function init() {
    await listen('info', (event) => {
        const data = event.payload;
        root.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    });
}

window.addEventListener('DOMContentLoaded', init);