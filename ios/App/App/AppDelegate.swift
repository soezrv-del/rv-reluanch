import UIKit
import AVFoundation
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // Create the Capacitor bridge window programmatically so we never
        // depend on UIMainStoryboardFile (mis-set Main Interface → LaunchScreen
        // causes: "Failed to instantiate … UIMainStoryboardFile 'LaunchScreen'").
        let window = UIWindow(frame: UIScreen.main.bounds)
        window.rootViewController = CAPBridgeViewController()
        window.makeKeyAndVisible()
        self.window = window

        // Live Grok Voice needs mic + speaker at the same time. WKWebView
        // defaults to playback-only, so getUserMedia succeeds but Grok is
        // silent or the earpiece is used. playAndRecord + voiceChat is the
        // closest iOS session to the real Grok app inside a WebView.
        configureVoiceAudioSession()
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleAudioInterruption),
            name: AVAudioSession.interruptionNotification,
            object: nil
        )
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {}

    func applicationDidEnterBackground(_ application: UIApplication) {}

    func applicationWillEnterForeground(_ application: UIApplication) {}

    func applicationDidBecomeActive(_ application: UIApplication) {
        configureVoiceAudioSession()
    }

    func applicationWillTerminate(_ application: UIApplication) {}

    func application(
        _ app: UIApplication,
        open url: URL,
        options: [UIApplication.OpenURLOptionsKey: Any] = [:]
    ) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(
        _ application: UIApplication,
        continue userActivity: NSUserActivity,
        restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
    ) -> Bool {
        return ApplicationDelegateProxy.shared.application(
            application,
            continue: userActivity,
            restorationHandler: restorationHandler
        )
    }

    private func configureVoiceAudioSession() {
        let session = AVAudioSession.sharedInstance()
        do {
            try session.setCategory(
                .playAndRecord,
                mode: .voiceChat,
                options: [.defaultToSpeaker, .allowBluetooth]
            )
            try session.setActive(true, options: [])
        } catch {
            NSLog("RVFAX AVAudioSession: \(error.localizedDescription)")
        }
    }

    @objc private func handleAudioInterruption(_ notification: Notification) {
        guard
            let info = notification.userInfo,
            let typeValue = info[AVAudioSessionInterruptionTypeKey] as? UInt,
            let type = AVAudioSession.InterruptionType(rawValue: typeValue)
        else { return }
        if type == .ended {
            configureVoiceAudioSession()
        }
    }
}
