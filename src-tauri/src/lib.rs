use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager,
};

fn setup_tray(app: &AppHandle) -> tauri::Result<()> {
    let show = MenuItem::with_id(app, "show", "Show Photo", true, None::<&str>)?;
    let controls = MenuItem::with_id(app, "controls", "Show Settings", true, None::<&str>)?;
    let pick = MenuItem::with_id(app, "pick", "Pick Photo", true, None::<&str>)?;
    let click_through =
        MenuItem::with_id(app, "click-through", "Toggle Pass Clicks", true, None::<&str>)?;
    let theme = MenuItem::with_id(app, "theme", "Toggle Theme", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(
        app,
        &[&show, &controls, &pick, &click_through, &theme, &quit],
    )?;

    let icon = app
        .default_window_icon()
        .expect("missing default window icon")
        .clone();

    let _tray = TrayIconBuilder::with_id("main-tray")
        .icon(icon)
        .menu(&menu)
        .tooltip("Pngup")
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| {
            let id = event.id.as_ref();
            if id == "quit" {
                app.exit(0);
                return;
            }

            match id {
                "show" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                    let _ = app.emit("tray-action", "show");
                }
                "controls" => {
                    if let Some(controls) = app.get_webview_window("controls") {
                        let _ = controls.show();
                        let _ = controls.set_focus();
                    }
                    let _ = app.emit("tray-action", "show-controls");
                }
                "pick" => {
                    let _ = app.emit("tray-action", "pick-photo");
                }
                "click-through" => {
                    let _ = app.emit("tray-action", "toggle-click-through");
                }
                "theme" => {
                    let _ = app.emit("tray-action", "toggle-theme");
                }
                _ => {}
            }
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(controls) = app.get_webview_window("controls") {
                    let _ = controls.show();
                    let _ = controls.set_focus();
                }
                let _ = app.emit("tray-action", "show-controls");
            }
        })
        .build(app)?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            setup_tray(app.handle())?;

            if let Some(controls) = app.get_webview_window("controls") {
                let _ = controls.set_position(tauri::Position::Physical(
                    tauri::PhysicalPosition::new(1200, 80),
                ));
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
