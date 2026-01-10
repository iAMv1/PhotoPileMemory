import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SystemNotificationProps {
    title: string;
    body: string;
    icon?: string;
    onDismiss?: () => void;
    duration?: number;
    variant?: "ios" | "android";
}

export function SystemNotification({
    title,
    body,
    icon = "⚠️",
    onDismiss,
    duration = 5000,
    variant = "ios",
}: SystemNotificationProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onDismiss?.();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onDismiss]);

    // Haptic on appear
    useEffect(() => {
        if (navigator.vibrate) {
            navigator.vibrate([50, 30, 50]);
        }
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="fixed top-4 left-4 right-4 z-[100] pointer-events-auto"
                    onClick={() => {
                        setIsVisible(false);
                        onDismiss?.();
                    }}
                >
                    {variant === "ios" ? (
                        // iOS Style
                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-4 flex gap-3 items-start max-w-md mx-auto border border-gray-200/50">
                            <div className="text-2xl">{icon}</div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">{title}</p>
                                <p className="text-gray-600 text-sm line-clamp-2">{body}</p>
                            </div>
                            <span className="text-xs text-gray-400">now</span>
                        </div>
                    ) : (
                        // Android Style
                        <div className="bg-neutral-800 rounded-xl shadow-2xl p-3 flex gap-3 items-center max-w-md mx-auto">
                            <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center text-xl">
                                {icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-white text-sm">{title}</p>
                                <p className="text-neutral-400 text-xs truncate">{body}</p>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Hook to trigger random notifications
export function useSystemOverride() {
    const [notifications, setNotifications] = useState<Array<{
        id: number;
        title: string;
        body: string;
        icon: string;
    }>>([]);

    const presetNotifications = [
        { title: "Age Alert", body: "Gray hair detected. Seek immediate moisturizer.", icon: "👴" },
        { title: "Mom", body: "Beta, khana kha liya? 🍛", icon: "📱" },
        { title: "System Warning", body: "Storage full: Too many memories accumulated.", icon: "💾" },
        { title: "Future You", body: "Invest in back support pillows. Trust me.", icon: "🔮" },
        { title: "Health App", body: "Reminder: Take your pills, old timer.", icon: "💊" },
        { title: "Calendar", body: "0 parties scheduled. As expected at your age.", icon: "📅" },
    ];

    const triggerRandom = () => {
        const preset = presetNotifications[Math.floor(Math.random() * presetNotifications.length)];
        const id = Date.now();
        setNotifications((prev) => [...prev, { ...preset, id }]);

        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 5000);
    };

    return { notifications, triggerRandom };
}
