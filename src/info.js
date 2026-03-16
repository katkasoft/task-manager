async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const pid = parseInt(urlParams.get('pid'));
    if (!pid) {
        root.innerHTML = '<p style="color:red;">No PID provided</p>';
        return;
    }
    try {
        const data = await invoke('get_process_info', { pid: pid });
        root.innerHTML = `
            <h2>Process Details: ${data.name}</h2>
            <table style="width: 100%; border-collapse: collapse;">
                ${Object.entries(data).map(([key, value]) => `
                    <tr style="border-bottom: 1px solid #ddd;">
                        <th style="text-align: left; padding: 8px; text-transform: capitalize;">
                            ${key.replace(/_/g, ' ')}
                        </th>
                        <td style="padding: 8px; font-family: monospace; word-break: break-all;">
                            ${formatValue(key, value)}
                        </td>
                    </tr>
                `).join('')}
            </table>
            <button onclick="window.close()" style="margin-top: 20px;">Close Window</button>
        `;
    } catch (err) {
        root.innerHTML = `<p style="color:red;">Error fetching process info: ${err}</p>`;
    }
}

function formatValue(key, value) {
    if (value === null || value === undefined) return '<i>null</i>';
    if (key === 'args') {
        return value.length > 0 ? `<code>${value.join(' ')}</code>` : '<em>None</em>';
    }
    if (key.includes('memory')) {
        return `${value} MB`;
    }
    if (key === 'cpu_percent') {
        return `${value.toFixed(2)}%`;
    }
    if (key === 'start_time') {
        return new Date(value * 1000).toLocaleString();
    }
    if (key === 'run_time') {
        const hours = Math.floor(value / 3600);
        const minutes = Math.floor((value % 3600) / 60);
        const seconds = value % 60;
        return `${hours}h ${minutes}m ${seconds}s`;
    }
    return value;
}