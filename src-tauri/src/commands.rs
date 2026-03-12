use sysinfo::System;

#[derive(serde::Serialize)]
pub struct ProcessInfo {
    name: String,
    pid: u32,
    memory_mb: u64,
    cpu_percent: f32,
    status: String,
}

#[tauri::command]
pub fn tasks_list() -> Result<Vec<ProcessInfo>, String> {
    let mut sys = System::new_all();
    sys.refresh_all();
    let processes: Vec<ProcessInfo> = sys.processes()
        .values()
        .map(|p| {
            let name = p.name().to_string_lossy().into_owned();
            ProcessInfo {
                name,
                pid: p.pid().as_u32(),
                memory_mb: p.memory() / 1024 / 1024,
                cpu_percent: p.cpu_usage(),
                status: match p.status() {
                    sysinfo::ProcessStatus::Run      => "running".to_string(),
                    sysinfo::ProcessStatus::Sleep    => "sleeping".to_string(),
                    sysinfo::ProcessStatus::Idle     => "idle".to_string(),
                    sysinfo::ProcessStatus::Zombie   => "zombie".to_string(),
                    sysinfo::ProcessStatus::Stop     => "stopped".to_string(),
                    sysinfo::ProcessStatus::Dead     => "dead".to_string(),
                    sysinfo::ProcessStatus::Parked   => "parked".to_string(),
                    _ => format!("{:?}", p.status()).to_lowercase(),
                },
            }
        })
        .collect();

    Ok(processes)
}