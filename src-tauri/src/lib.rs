use tauri::menu::MenuBuilder;
use tauri::{Manager, Emitter};

mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![commands::tasks_list, commands::kill, commands::info, commands::get_process_info])
        .setup(|app| {
            let menu = MenuBuilder::new(app)
                .text("kill", "Kill")
                .text("info", "Info")
                .text("find", "Find")
                .build()?;
            let window = app.get_webview_window("main")
                .expect("main window not found");
            window.set_menu(menu)?;
            app.on_menu_event(move |app, event| {
                match event.id().as_ref() {
                    "kill" => {
                        if let Err(e) = app.emit("kill", "") {
                            eprintln!("Failed to emit: {}", e);
                        }
                    }
                    "info" => {
                        if let Err(e) = app.emit("info", "") {
                            eprintln!("Failed to emit: {}", e);
                        }
                    }
                    "find" => {
                        if let Err(e) = app.emit("find", "") {
                            eprintln!("Failed to emit: {}", e);
                        }
                    }
                    _ => {}
                }
            });


            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}