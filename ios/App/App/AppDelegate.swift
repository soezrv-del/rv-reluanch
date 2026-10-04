import UIKit
import AVFoundation
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    /// Options the voice session must keep. defaultToSpeaker is what keeps
    /// Live Voice on the loudspeaker instead of the quiet earpiece.
    private static let voiceCategoryOptions: AVAudioSession.CategoryOptions = [
        .defaultToSpeaker, .allowBluetooth, .allowBluetoothA2DP,
    ]
    /// Route-change handling: main queue only, coalesced, never re-entrant.
    private var routeChangeWork: DispatchWorkItem?
    private var reapplyingVoiceSession = false
    private var lastVoiceSessionReapply = Date.distantPast

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
        // WebKit (getUserMedia start/stop) and headset plug/unplug can move
        // the session off playAndRecord+defaultToSpeaker, which leaves her
        // on the earpiece / call volume. Put it back when that happens.
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleAudioRouteChange),
            name: AVAudioSession.routeChangeNotification,
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
                options: AppDelegate.voiceCategoryOptions
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

    /// Posted on an arbitrary thread, often in bursts (setCategory itself
    /// posts one). Hop to main and coalesce into one check 250 ms later.
    @objc private func handleAudioRouteChange(_ notification: Notification) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.routeChangeWork?.cancel()
            let work = DispatchWorkItem { [weak self] in
                self?.reapplyVoiceSessionIfDrifted()
            }
            self.routeChangeWork = work
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.25, execute: work)
        }
    }

    /// Re-apply only when something actually drifted, so the route change
    /// our own setCategory posts finds nothing to do (no loop). Never
    /// deactivates the session and never touches the mic.
    private func reapplyVoiceSessionIfDrifted() {
        guard !reapplyingVoiceSession else { return }
        reapplyingVoiceSession = true
        defer { reapplyingVoiceSession = false }

        let session = AVAudioSession.sharedInstance()
        let drifted =
            session.category != .playAndRecord
            || session.mode != .default
            || !session.categoryOptions.isSuperset(of: AppDelegate.voiceCategoryOptions)
        let onReceiver = session.currentRoute.outputs.contains {
            $0.portType == .builtInReceiver
        }
        guard drifted || onReceiver else { return }

        // Cooldown: if WebKit keeps changing the category back, do not
        // fight it more than once a second.
        if drifted, Date().timeIntervalSince(lastVoiceSessionReapply) > 1.0 {
            lastVoiceSessionReapply = Date()
            NSLog("RVFAX AVAudioSession: route change, re-applying voice session")
            configureVoiceAudioSession()
        }

        let stillOnReceiver = session.currentRoute.outputs.contains {
            $0.portType == .builtInReceiver
        }
        if stillOnReceiver {
            do {
                try session.overrideOutputAudioPort(.speaker)
            } catch {
                NSLog("RVFAX AVAudioSession speaker override: \(error.localizedDescription)")
            }
        }
    }
}
