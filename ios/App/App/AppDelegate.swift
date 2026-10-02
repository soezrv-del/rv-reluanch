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
        // SceneDelegate owns the window and the single CAPBridgeViewController.
        // Live Grok Voice needs mic + speaker at the same time. WKWebView
        // defaults to playback-only, so getUserMedia succeeds but Grok is
        // silent or the earpiece is used, hence playAndRecord.
        // Mode is .default, not .voiceChat: voiceChat adds a second voice
        // processing unit (AEC/AGC, narrow-band output, lower playback level)
        // on top of the one WebKit already runs for getUserMedia
        // (echoCancellation: true); suspected cause of squeaky/crackly audio.
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

    func applicationWillTerminate(_ application: UIApplication) {}

    func application(
        _ application: UIApplication,
        configurationForConnecting connectingSceneSession: UISceneSession,
        options: UIScene.ConnectionOptions
    ) -> UISceneConfiguration {
        let config = UISceneConfiguration(
            name: "Default Configuration",
            sessionRole: connectingSceneSession.role
        )
        config.delegateClass = SceneDelegate.self
        return config
    }

    func configureVoiceAudioSession() {
        let session = AVAudioSession.sharedInstance()
        do {
            try session.setCategory(
                .playAndRecord,
                mode: .default,
                options: [.defaultToSpeaker, .allowBluetooth, .allowBluetoothA2DP]
            )
            // 48 kHz / ~20 ms IO buffer: matches the Web Audio context and
            // gives the renderer headroom. Preferences only; iOS may refuse.
            try? session.setPreferredSampleRate(48_000)
            try? session.setPreferredIOBufferDuration(0.02)
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
