use sysinfo::{Pid, System};
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

#[derive(serde::Serialize)]
pub struct ProcessData {
    name: String,
    pid: u32,
    memory_mb: u64,
    cpu_percent: f32,
    status: String,
}

#[derive(serde::Serialize, Clone)]
pub struct DetailedProcessData {
    name: String,
    pid: u32,
    parent_pid: Option<u32>,
    exe: String,
    args: Vec<String>,
    memory_mb: u64,
    virtual_memory_mb: u64,
    cpu_percent: f32,
    start_time: u64,
    run_time: u64,
    status: String,
    user_id: String,
}

#[tauri::command]
pub fn tasks_list() -> Result<Vec<ProcessData>, String> {
    let mut sys = System::new_all();
    sys.refresh_all();
    let processes: Vec<ProcessData> = sys.processes()
        .values()
        .map(|p| {
            let name = p.name().to_string_lossy().into_owned();
            ProcessData {
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

#[tauri::command]
pub fn kill(pid: u32) -> Result<(), String> {
    let mut s = System::new_all();
    s.refresh_processes(sysinfo::ProcessesToUpdate::All, true);
    if let Some(process) = s.process(Pid::from(pid as usize)) {
        if process.kill() {
            Ok(())
        } else {
            Err(format!("Error killing process with PID {}. Permission denied", pid))
        }
    } else {
        Err(format!("Process with PID {} not found", pid))
    }
}

#[tauri::command]
pub fn get_process_info(pid: u32) -> Result<DetailedProcessData, String> {
    let mut sys = System::new_all();
    sys.refresh_all();
    sys.process(Pid::from(pid as usize))
        .map(|p| DetailedProcessData {
            name: p.name().to_string_lossy().into_owned(),
            pid: p.pid().as_u32(),
            parent_pid: p.parent().map(|id| id.as_u32()),
            exe: p.exe().map(|path| path.to_string_lossy().into_owned()).unwrap_or_default(),
            args: p.cmd().iter().map(|s| s.to_string_lossy().into_owned()).collect(),
            memory_mb: p.memory() / 1024 / 1024,
            virtual_memory_mb: p.virtual_memory() / 1024 / 1024,
            cpu_percent: p.cpu_usage(),
            start_time: p.start_time(),
            run_time: p.run_time(),
            status: format!("{:?}", p.status()).to_lowercase(),
            user_id: p.user_id().map(|u| u.to_string()).unwrap_or_else(|| "N/A".into()),
        })
        .ok_or_else(|| "Process not found".to_string())
}

#[tauri::command]
pub fn info(pid: u32, handle: AppHandle) -> Result<(), String> {
    if let Some(existing_window) = handle.get_webview_window("info_window") {
        let _ = existing_window.close();
    }
    let url = format!("info.html?pid={}", pid);
    let _webview_window = WebviewWindowBuilder::new(&handle, "info_window", WebviewUrl::App(url.into()))
        .title(format!("Process Info"))
        .inner_size(500.0, 650.0)
        .resizable(true)
        .build()
        .map_err(|e| e.to_string())?;
    Ok(())
}