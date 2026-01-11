import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { Loader2, Upload, Send, HelpCircle, MessageSquare, Image, Lock, Camera } from "lucide-react";

type RiddleType = "text" | "mcq";

export default function ContributorDashboard() {
    const { toast } = useToast();
    const [match, params] = useRoute("/e/:slug/contribute");
    const slug = params?.slug;

    // Fetch Event Details
    const { data: event, isLoading: isEventLoading } = useQuery({
        queryKey: ['/api/events', slug],
        queryFn: async () => {
            if (!slug) throw new Error("No event specified");
            const res = await fetch(`/api/events/${slug}`);
            if (!res.ok) throw new Error("Event not found");
            return (await res.json()).event;
        },
        enabled: !!slug
    });

    // === SHARED STATE ===
    const [name, setName] = useState("");

    // === MEMORY MAZE STATE (Riddle Photos) ===
    const [mazePhoto, setMazePhoto] = useState<string | null>(null);
    const [mazeClue, setMazeClue] = useState("");
    const [riddleType, setRiddleType] = useState<RiddleType>("text");
    const [riddleQuestion, setRiddleQuestion] = useState("");
    const [riddleAnswer, setRiddleAnswer] = useState("");
    const [riddleOptions, setRiddleOptions] = useState<string[]>(["", "", "", ""]);
    const [isMazeSubmitting, setIsMazeSubmitting] = useState(false);

    // === PHOTO GALLERY STATE (Home Page Photos) ===
    const [galleryPhoto, setGalleryPhoto] = useState<string | null>(null);
    const [galleryCaption, setGalleryCaption] = useState("");
    const [voiceNote, setVoiceNote] = useState<string | null>(null);
    const [isGallerySubmitting, setIsGallerySubmitting] = useState(false);

    // === WISH STATE ===
    const [wishMessage, setWishMessage] = useState("");

    // === TIME CAPSULE STATE ===
    const [capsuleMessage, setCapsuleMessage] = useState("");
    const [capsuleHour, setCapsuleHour] = useState("12");
    const [isSendingCapsule, setIsSendingCapsule] = useState(false);

    // === MUTATIONS ===
    const mazeMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("/api/user-photos", { method: "POST", body: { ...data, eventId: event?.id } });
        },
        onSuccess: () => {
            toast({ title: "🔐 Maze Photo Added!", description: "It will be locked until the riddle is solved." });
            resetMazeForm();
        },
        onError: () => {
            toast({ title: "Upload Failed", variant: "destructive" });
            setIsMazeSubmitting(false);
        },
    });

    const galleryMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("/api/user-photos", { method: "POST", body: { ...data, eventId: event?.id } });
        },
        onSuccess: () => {
            toast({ title: "📸 Memory Added!", description: "It will appear on the celebration page." });
            resetGalleryForm();
        },
        onError: () => {
            toast({ title: "Upload Failed", variant: "destructive" });
            setIsGallerySubmitting(false);
        },
    });

    const wishMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("/api/wishes", { method: "POST", body: { ...data, eventId: event?.id } });
        },
        onSuccess: () => {
            toast({ title: "Wish Sent!", description: "Your message has been added." });
            setWishMessage("");
        },
        onError: () => {
            toast({ title: "Failed", variant: "destructive" });
        },
    });

    // === HELPER FUNCTIONS ===
    const resetMazeForm = () => {
        setMazePhoto(null);
        setMazeClue("");
        setRiddleQuestion("");
        setRiddleAnswer("");
        setRiddleOptions(["", "", "", ""]);
        setIsMazeSubmitting(false);
    };

    const resetGalleryForm = () => {
        setGalleryPhoto(null);
        setGalleryCaption("");
        setVoiceNote(null);
        setIsGallerySubmitting(false);
    };

    const handlePhotoUpload = (setter: (url: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast({ title: "File too large", description: "Max 10MB", variant: "destructive" });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => setter(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleVoiceRecording = (blob: Blob) => {
        const reader = new FileReader();
        reader.onloadend = () => setVoiceNote(reader.result as string);
        reader.readAsDataURL(blob);
    };

    const handleSubmitMaze = () => {
        if (!mazePhoto || !riddleQuestion || !riddleAnswer) {
            toast({ title: "Riddle Required", description: "Add a question and answer to lock the photo.", variant: "destructive" });
            return;
        }
        setIsMazeSubmitting(true);
        mazeMutation.mutate({
            src: mazePhoto,
            x: Math.floor(Math.random() * 50),
            y: Math.floor(Math.random() * 50),
            rotation: Math.floor(Math.random() * 20) - 10,
            zIndex: 1,
            comment: "",
            memoryClue: mazeClue || null,
            voiceNote: null,
            contributorName: name || "Anonymous Friend",
            isGlitched: true, // KEY: This goes to Memory Maze
            riddleQuestion: riddleQuestion,
            riddleOptions: riddleType === "mcq" ? JSON.stringify(riddleOptions.filter(o => o.trim())) : null,
            riddleAnswer: riddleAnswer,
            riddleType: riddleType,
        });
    };

    const handleSubmitGallery = () => {
        if (!galleryPhoto) {
            toast({ title: "Photo Required", variant: "destructive" });
            return;
        }
        setIsGallerySubmitting(true);
        galleryMutation.mutate({
            src: galleryPhoto,
            x: Math.floor(Math.random() * 50),
            y: Math.floor(Math.random() * 50),
            rotation: Math.floor(Math.random() * 20) - 10,
            zIndex: 1,
            comment: "",
            memoryClue: galleryCaption || null,
            voiceNote: voiceNote,
            contributorName: name || "Anonymous Friend",
            isGlitched: false, // KEY: This goes to Home Gallery
            riddleQuestion: null,
            riddleOptions: null,
            riddleAnswer: null,
            riddleType: null,
        });
    };

    const handleSubmitWish = () => {
        if (!wishMessage.trim()) return;
        const styles = ["bg-yellow-200", "bg-pink-200", "bg-blue-200", "bg-green-200", "bg-purple-200"];
        wishMutation.mutate({
            text: wishMessage,
            name: name || "Anonymous",
            style: styles[Math.floor(Math.random() * styles.length)],
            topPosition: Math.floor(Math.random() * 60) + 10,
            leftPosition: Math.floor(Math.random() * 60) + 10,
            rotation: Math.floor(Math.random() * 20) - 10,
            fontSize: "text-sm",
            shape: "square",
        });
    };

    const handleSubmitCapsule = async () => {
        if (!capsuleMessage.trim() || !event) {
            toast({ title: "Message Required", variant: "destructive" });
            return;
        }
        setIsSendingCapsule(true);
        try {
            await apiRequest("/api/time-capsule-messages", {
                method: "POST",
                body: {
                    hour: parseInt(capsuleHour),
                    message: capsuleMessage,
                    authorName: name || "A Friend",
                    eventId: event.id
                }
            });
            toast({ title: "Time Capsule Sent!", description: `Message will unlock at ${capsuleHour}:00` });
            setCapsuleMessage("");
        } catch {
            toast({ title: "Failed", variant: "destructive" });
        } finally {
            setIsSendingCapsule(false);
        }
    };

    // === EARLY RETURNS (after all hooks) ===
    if (isEventLoading) return <div className="text-white text-center py-20"><Loader2 className="animate-spin h-8 w-8 mx-auto" /> Loading Event...</div>;
    if (!event) return <div className="text-white text-center py-20">Event not found</div>;

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-red-950/20 to-neutral-950 text-neutral-100 p-4">
            <div className="max-w-md mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2 mt-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                        For {event.birthdayPersonName}'s Birthday 🎂
                    </h1>
                    <p className="text-neutral-400 text-sm">
                        Add memories, riddles, and wishes to the celebration.
                    </p>
                </div>

                {/* Your Name (shared) */}
                <Card className="bg-neutral-900/80 border-neutral-700 backdrop-blur">
                    <CardContent className="pt-4">
                        <div className="space-y-2">
                            <Label className="text-neutral-200 font-medium">Your Name (used for all contributions)</Label>
                            <Input
                                placeholder="Who are you?"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-neutral-800 border-neutral-600 text-white placeholder:text-neutral-400"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* ==================== SECTION 1: MEMORY MAZE ==================== */}
                <Card className="bg-neutral-900/80 border-red-800/60 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Lock className="h-5 w-5 text-red-400" />
                            Add to Memory Maze
                        </CardTitle>
                        <CardDescription className="text-red-200">
                            🔒 This photo will be LOCKED. They must solve your riddle to see it!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Photo Upload */}
                        <div className="space-y-2">
                            <Label className="text-neutral-200 font-medium">The Photo (will be blurred until unlocked)</Label>
                            <div className="border-2 border-dashed border-red-900/50 rounded-lg p-4 text-center hover:bg-red-900/10 transition cursor-pointer relative overflow-hidden">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handlePhotoUpload(setMazePhoto)}
                                />
                                {mazePhoto ? (
                                    <img src={mazePhoto} alt="Preview" className="max-h-48 mx-auto rounded shadow-lg filter blur-sm" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-neutral-500 py-4">
                                        <Upload className="h-10 w-10" />
                                        <span className="text-sm">Tap to select photo</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Riddle Question (REQUIRED) */}
                        <div className="space-y-2">
                            <Label className="text-red-300 font-medium">Riddle Question *</Label>
                            <Textarea
                                placeholder="Ask something only they would know about this memory..."
                                value={riddleQuestion}
                                onChange={(e) => setRiddleQuestion(e.target.value)}
                                className="bg-neutral-800 border-red-800/60 text-white placeholder:text-neutral-400"
                            />
                        </div>

                        {/* Riddle Type Toggle */}
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={riddleType === "text" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setRiddleType("text")}
                                className="flex-1"
                            >
                                Text Answer
                            </Button>
                            <Button
                                type="button"
                                variant={riddleType === "mcq" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setRiddleType("mcq")}
                                className="flex-1"
                            >
                                Multiple Choice
                            </Button>
                        </div>

                        {/* Answer Input */}
                        {riddleType === "mcq" ? (
                            <div className="space-y-2">
                                <Label className="text-neutral-200 font-medium">Options (select the correct one)</Label>
                                {riddleOptions.map((opt, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input
                                            type="radio"
                                            name="correctMazeAnswer"
                                            checked={riddleAnswer === opt && opt !== ""}
                                            onChange={() => setRiddleAnswer(opt)}
                                            className="accent-green-500"
                                        />
                                        <Input
                                            placeholder={`Option ${idx + 1}`}
                                            value={opt}
                                            onChange={(e) => {
                                                const newOpts = [...riddleOptions];
                                                newOpts[idx] = e.target.value;
                                                setRiddleOptions(newOpts);
                                            }}
                                            className="bg-neutral-800 border-neutral-600 text-white placeholder:text-neutral-400 flex-1"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label className="text-red-300 font-medium">Correct Answer *</Label>
                                <Input
                                    placeholder="The answer to unlock this photo..."
                                    value={riddleAnswer}
                                    onChange={(e) => setRiddleAnswer(e.target.value)}
                                    className="bg-neutral-800 border-red-800/60 text-white placeholder:text-neutral-400"
                                />
                            </div>
                        )}

                        <Button
                            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                            onClick={handleSubmitMaze}
                            disabled={isMazeSubmitting}
                        >
                            {isMazeSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : <><Lock className="mr-2 h-4 w-4" /> Lock in Maze</>}
                        </Button>
                    </CardContent>
                </Card>

                {/* ==================== SECTION 2: PHOTO GALLERY ==================== */}
                <Card className="bg-neutral-900/80 border-blue-800/60 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Camera className="h-5 w-5 text-blue-400" />
                            Add to Photo Gallery
                        </CardTitle>
                        <CardDescription className="text-blue-200">
                            📸 This photo will appear on the celebration page. Add a voice message!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Photo Upload */}
                        <div className="space-y-2">
                            <Label className="text-neutral-200 font-medium">The Photo</Label>
                            <div className="border-2 border-dashed border-blue-900/50 rounded-lg p-4 text-center hover:bg-blue-900/10 transition cursor-pointer relative overflow-hidden">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handlePhotoUpload(setGalleryPhoto)}
                                />
                                {galleryPhoto ? (
                                    <img src={galleryPhoto} alt="Preview" className="max-h-48 mx-auto rounded shadow-lg" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-neutral-500 py-4">
                                        <Image className="h-10 w-10" />
                                        <span className="text-sm">Tap to select photo</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Caption */}
                        <div className="space-y-2">
                            <Label className="text-neutral-200 font-medium">Caption (optional)</Label>
                            <Textarea
                                placeholder="Add a sweet message about this memory..."
                                value={galleryCaption}
                                onChange={(e) => setGalleryCaption(e.target.value)}
                                className="bg-neutral-800 border-neutral-600 text-white placeholder:text-neutral-400"
                            />
                        </div>

                        {/* Voice Note */}
                        <div className="space-y-2">
                            <Label className="text-neutral-200 font-medium">Voice Message (optional)</Label>
                            <VoiceRecorder
                                onRecordingComplete={handleVoiceRecording}
                                onClear={() => setVoiceNote(null)}
                            />
                        </div>

                        <Button
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            onClick={handleSubmitGallery}
                            disabled={isGallerySubmitting}
                        >
                            {isGallerySubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : <><Camera className="mr-2 h-4 w-4" /> Add to Gallery</>}
                        </Button>
                    </CardContent>
                </Card>

                {/* ==================== SECTION 3: WISHES ==================== */}
                <Card className="bg-neutral-900/80 border-purple-800/60 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <MessageSquare className="h-5 w-5 text-purple-400" />
                            Write a Wish
                        </CardTitle>
                        <CardDescription className="text-purple-200">Leave a birthday message</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            placeholder="Happy birthday! May all your dreams come true..."
                            value={wishMessage}
                            onChange={(e) => setWishMessage(e.target.value)}
                            className="bg-neutral-800 border-neutral-600 text-white placeholder:text-neutral-400 resize-none min-h-[100px]"
                        />
                        <Button
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                            onClick={handleSubmitWish}
                            disabled={!wishMessage.trim()}
                        >
                            <Send className="mr-2 h-4 w-4" /> Send Wish
                        </Button>
                    </CardContent>
                </Card>

                {/* ==================== SECTION 4: TIME CAPSULE ==================== */}
                <Card className="bg-neutral-900/80 border-amber-800/60 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <span className="text-2xl">⏰</span>
                            Time Capsule Message
                        </CardTitle>
                        <CardDescription className="text-amber-200">Schedule a message that unlocks at a specific hour</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-neutral-200 font-medium">Unlock Hour</Label>
                            <select
                                value={capsuleHour}
                                onChange={(e) => setCapsuleHour(e.target.value)}
                                className="w-full bg-neutral-800 border border-neutral-700 text-white p-2 rounded-md"
                            >
                                {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={i}>
                                        {i === 0 ? "12:00 AM (Midnight)" :
                                            i < 12 ? `${i}:00 AM` :
                                                i === 12 ? "12:00 PM (Noon)" :
                                                    `${i - 12}:00 PM`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Textarea
                            placeholder="Write a time-locked surprise message..."
                            value={capsuleMessage}
                            onChange={(e) => setCapsuleMessage(e.target.value)}
                            className="bg-neutral-800 border-neutral-600 text-white placeholder:text-neutral-400 resize-none min-h-[100px]"
                        />
                        <Button
                            className="w-full bg-gradient-to-r from-amber-600 to-orange-600"
                            onClick={handleSubmitCapsule}
                            disabled={!capsuleMessage.trim() || isSendingCapsule}
                        >
                            {isSendingCapsule ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                            ) : (
                                <><span className="mr-2">🔒</span> Lock Message</>
                            )}
                        </Button>
                        <p className="text-xs text-neutral-500 text-center">
                            ⏳ Message stays locked until the selected hour on party day
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
