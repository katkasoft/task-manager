const { invoke } = window.__TAURI__.core;
const root = document.getElementById("root");

async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const pid = parseInt(urlParams.get('pid'));
    if (!pid) {
        root.innerHTML = '<p style="color:red;">No PID provided</p>';
        return;
    }
    try {
        const data = await invoke('get_process_info', { pid: pid });
        root.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } catch (err) {
        root.innerHTML = `<p style="color:red;">Error: ${err}</p>`;
    }
}

window.addEventListener('DOMContentLoaded', init);