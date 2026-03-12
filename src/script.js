// script.js
const { invoke } = window.__TAURI__.core;

async function loadTasks() {
    try {
        const processes = await invoke('tasks_list');
        const table = document.getElementById('tasks-list');
        table.innerHTML = '';
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Name</th>
                <th>PID</th>
                <th>Memory (MB)</th>
                <th>CPU %</th>
                <th>Status</th>
            </tr>
        `;
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        processes
            .sort((a, b) => b.memory_mb - a.memory_mb)
            .forEach(proc => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td title="${proc.name}">${proc.name.slice(0, 40)}${proc.name.length > 40 ? '...' : ''}</td>
                    <td>${proc.pid}</td>
                    <td>${proc.memory_mb.toLocaleString()}</td>
                    <td>${proc.cpu_percent.toFixed(1)}</td>
                    <td>${proc.status}</td>
                `;
                tbody.appendChild(row);
            });
        table.appendChild(tbody);
    } catch (err) {
        console.error("Error getting processes:", err);
        document.body.innerHTML += `<p style="color:red; text-align:center;">Error getting processes: ${err}</p>`;
    }
}

async function init() {
    await loadTasks();
    setInterval(loadTasks, 5000);
}

window.addEventListener('DOMContentLoaded', init);