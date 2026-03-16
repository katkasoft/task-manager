const { invoke } = window.__TAURI__.core;
const { listen } = window.__TAURI__.event;
let selectedPid = null;

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
                row.addEventListener('click', () => {
                    document.querySelectorAll('tr.selected').forEach(r => r.classList.remove('selected'));
                    row.classList.add('selected');
                    selectedPid = proc.pid;
                    console.log('Selected PID:', selectedPid);
                });

            });
        table.appendChild(tbody);
        if (selectedPid !== null) {
            Array.from(tbody.rows).forEach(row => {
                const pidCell = row.cells[1];
                if (pidCell && parseInt(pidCell.textContent) === selectedPid) {
                    row.classList.add('selected');
                }
            });
        }
    } catch (err) {
        console.error("Error getting processes:", err);
        document.body.innerHTML += `<p style="color:red; text-align:center;">Error getting processes: ${err}</p>`;
    }
}

async function init() {
    await loadTasks();
    setInterval(loadTasks, 5000);
    await listen('kill', async (event) => {
        if (!selectedPid) return;
        try {
            await invoke('kill', { pid: selectedPid }); 
            loadTasks();
        } catch (e) {
            alert(e);
        }
    });
    await listen('info', async (event) => {
        if (!selectedPid) return;
        try {
            await invoke('info', { pid: selectedPid }); 
        } catch (e) {
            alert(e);
        }
    });
    await listen('find', async (event) => {
        const searchTerm = prompt("Enter process name to find:").trim();
        if (!searchTerm || searchTerm.trim() == "") return;
        const tbody = document.querySelector('#tasks-list tbody');
        const rows = Array.from(tbody.rows);
        const targetRow = rows.find(row => 
            row.cells[0].textContent.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (targetRow) {
            document.querySelectorAll('tr.selected').forEach(r => r.classList.remove('selected'));
            targetRow.classList.add('selected');
            selectedPid = parseInt(targetRow.cells[1].textContent);
            targetRow.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        } else {
            alert("Process not found:", searchTerm);
        }
    });
}

window.addEventListener('DOMContentLoaded', init);