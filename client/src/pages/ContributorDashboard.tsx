import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { Loader2, Upload, Send, HelpCircle, MessageSquare, Settings, Check } from "lucide-react";

type RiddleType = "text" | "mcq";

export default function ContributorDashboard() {
    const { toast } = useToast();
    const [name, setName] = useState("");
    const [clue, setClue] = useState("");
    const [photo, setPhoto] = useState<string | null>(null);
    const [voiceNote, setVoiceNote] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Event Config state
    const [birthdayAge, setBirthdayAge] = useState("");
    const [birthdayName, setBirthdayName] = useState("");
    const [isSavingConfig, setIsSavingConfig] = useState(false);

    // Riddle state
    const [hasRiddle, setHasRiddle] = useState(false);
    const [riddleType, setRiddleType] = useState<RiddleType>("text");
    const [riddleQuestion, setRiddleQuestion] = useState("");
    const [riddleAnswer, setRiddleAnswer] = useState("");
    const [riddleOptions, setRiddleOptions] = useState<string[]>(["", "", "", ""]);

    // Wish state
    const [wishMessage, setWishMessage] = useState("");

    // Load existing config
    useEffect(() => {
        fetch("/api/event-config")
            .then(r => r.json())
            .then(data => {
                const age = data.config?.find((c: any) => c.key === "birthday_person_age")?.value;
                const name = data.config?.find((c: any) => c.key === "birthday_person_name")?.value;
                if (age) setBirthdayAge(age);
                if (name) setBirthdayName(name);
            })
            .catch(() => { });
    }, []);

    const saveConfig = async () => {
        if (!birthdayAge.trim()) {
            toast({ title: "Age Required", description: "Enter the birthday person's age.", variant: "destructive" });
            return;
        }
        setIsSavingConfig(true);
        try {
            await fetch("/api/event-config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: "birthday_person_age", value: birthdayAge.trim() }),
            });
            if (birthdayName.trim()) {
                await fetch("/api/event-config", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key: "birthday_person_name", value: birthdayName.trim() }),
                });
            }
            toast({ title: "Settings Saved!", description: "Birthday person's age is now the key to enter." });
        } catch {
            toast({ title: "Error", description: "Could not save settings.", variant: "destructive" });
        } finally {
            setIsSavingConfig(false);
        }
    };

    const photoMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", "/api/user-photos", data);
        },
        onSuccess: () => {
            toast({ title: "Memory Uploaded!", description: "Thanks for contributing to the maze." });
            resetPhotoForm();
        },
        onError: () => {
            toast({ title: "Upload Failed", description: "Something went wrong.", variant: "destructive" });
            setIsSubmitting(false);
        },
    });

    const wishMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", "/api/wishes", data);
        },
        onSuccess: () => {
            toast({ title: "Wish Sent!", description: "Your message has been added." });
            setWishMessage("");
        },
        onError: () => {
            toast({ title: "Failed", description: "Could not send wish.", variant: "destructive" });
        },
    });

    const resetPhotoForm = () => {
        setName("");
        setClue("");
        setPhoto(null);
        setVoiceNote(null);
        setHasRiddle(false);
        setRiddleQuestion("");
        setRiddleAnswer("");
        setRiddleOptions(["", "", "", ""]);
        setIsSubmitting(false);
    };

    // Time Capsule state
    const [capsuleMessage, setCapsuleMessage] = useState("");
    const [capsuleHour, setCapsuleHour] = useState("12");
    const [isSendingCapsule, setIsSendingCapsule] = useState(false);

    const handleSubmitCapsule = async () => {
        if (!capsuleMessage.trim()) {
            toast({ title: "Message Required", variant: "destructive" });
            return;
        }
        setIsSendingCapsule(true);
        try {
            await apiRequest("POST", "/api/time-capsule-messages", {
                hour: parseInt(capsuleHour),
                message: capsuleMessage,
                authorName: name || "A Friend",
            });
            toast({ title: "Time Capsule Sent!", description: `Message will unlock at ${capsuleHour}:00` });
            setCapsuleMessage("");
        } catch {
            toast({ title: "Failed", description: "Could not send time capsule.", variant: "destructive" });
        } finally {
            setIsSendingCapsule(false);
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast({ title: "File too large", description: "Max 10MB", variant: "destructive" });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => setPhoto(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleVoiceRecording = (blob: Blob) => {
        const reader = new FileReader();
        reader.onloadend = () => setVoiceNote(reader.result as string);
        reader.readAsDataURL(blob);
    };

    const handleSubmitPhoto = () => {
        if (!photo) {
            toast({ title: "Photo Required", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        photoMutation.mutate({
            src: photo,
            x: Math.floor(Math.random() * 50),
            y: Math.floor(Math.random() * 50),
            rotation: Math.floor(Math.random() * 20) - 10,
            zIndex: 1,
            comment: "",
            memoryClue: clue || null,
            voiceNote: voiceNote,
            contributorName: name || "Anonymous Friend",
            isGlitched: true,
            riddleQuestion: hasRiddle ? riddleQuestion : null,
            riddleOptions: hasRiddle && riddleType === "mcq" ? JSON.stringify(riddleOptions.filter(o => o.trim())) : null,
            riddleAnswer: hasRiddle ? riddleAnswer : null,
            riddleType: hasRiddle ? riddleType : null,
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-red-950/20 to-neutral-950 text-neutral-100 p-4">
            <div className="max-w-md mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2 mt-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                        🎭 The Guest Pass
                    </h1>
                    <p className="text-neutral-400 text-sm">
                        Add memories, riddles, and wishes to the celebration.
                    </p>
                </div>

                {/* EVENT SETTINGS - Set Birthday Person's Age */}
                <Card className="bg-neutral-900/80 border-yellow-900/50 backdrop-blur">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-yellow-500">
                            <Settings className="h-5 w-5" />
                            Event Settings
                        </CardTitle>
                        <CardDescription>Set the "key" to enter the maze</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Birthday Person's Name</Label>
                                <Input
                                    placeholder="Name"
                                    value={birthdayName}
                                    onChange={(e) => setBirthdayName(e.target.value)}
                                    className="bg-neutral-800 border-neutral-700"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Their Age (The Key)</Label>
                                <Input
                                    type="number"
                                    placeholder="25"
                                    value={birthdayAge}
                                    onChange={(e) => setBirthdayAge(e.target.value)}
                                    className="bg-neutral-800 border-neutral-700"
                                />
                            </div>
                        </div>
                        <Button
                            onClick={saveConfig}
                            disabled={isSavingConfig}
                            className="w-full bg-yellow-600 hover:bg-yellow-700"
                            size="sm"
                        >
                            {isSavingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" /> Save Settings</>}
                        </Button>
                        <p className="text-xs text-neutral-500 text-center">
                            ⚠️ Only they can enter the maze by guessing this age correctly.
                        </p>
                    </CardContent>
                </Card>

                {/* SECTION 1: Photo + Riddle */}
                <Card className="bg-neutral-900/80 border-red-900/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-red-500" />
                            Upload Memory
                        </CardTitle>
                        <CardDescription>Photo + Optional Riddle</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label>Your Name</Label>
                            <Input
                                placeholder="Who are you?"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-neutral-800 border-neutral-700"
                            />
                        </div>

                        {/* Photo Upload */}
                        <div className="space-y-2">
                            <Label>The Photo</Label>
                            <div className="border-2 border-dashed border-red-900/50 rounded-lg p-4 text-center hover:bg-red-900/10 transition cursor-pointer relative overflow-hidden">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handlePhotoUpload}
                                />
                                {photo ? (
                                    <img src={photo} alt="Preview" className="max-h-48 mx-auto rounded shadow-lg" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-neutral-500 py-4">
                                        <Upload className="h-10 w-10" />
                                        <span className="text-sm">Tap to select photo</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Memory Clue */}
                        <div className="space-y-2">
                            <Label>Memory Clue (Optional)</Label>
                            <Textarea
                                placeholder="A hint about this photo..."
                                value={clue}
                                onChange={(e) => setClue(e.target.value)}
                                className="bg-neutral-800 border-neutral-700 resize-none"
                            />
                        </div>

                        {/* Voice Note */}
                        <div className="space-y-2">
                            <Label>Voice Note (Optional)</Label>
                            <VoiceRecorder
                                onRecordingComplete={handleVoiceRecording}
                                onClear={() => setVoiceNote(null)}
                            />
                        </div>

                        {/* Riddle Toggle */}
                        <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg border border-neutral-700">
                            <div className="flex items-center gap-2">
                                <HelpCircle className="h-5 w-5 text-orange-500" />
                                <span className="text-sm font-medium">Add a Riddle?</span>
                            </div>
                            <Switch checked={hasRiddle} onCheckedChange={setHasRiddle} />
                        </div>

                        {/* Riddle Form */}
                        {hasRiddle && (
                            <div className="space-y-4 p-4 bg-orange-900/20 rounded-lg border border-orange-900/50">
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

                                <div className="space-y-2">
                                    <Label>Riddle Question</Label>
                                    <Textarea
                                        placeholder="Ask a tricky question about this memory..."
                                        value={riddleQuestion}
                                        onChange={(e) => setRiddleQuestion(e.target.value)}
                                        className="bg-neutral-800 border-neutral-700"
                                    />
                                </div>

                                {riddleType === "mcq" ? (
                                    <div className="space-y-2">
                                        <Label>Options (Mark correct answer)</Label>
                                        {riddleOptions.map((opt, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <input
                                                    type="radio"
                                                    name="correctAnswer"
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
                                                    className="bg-neutral-800 border-neutral-700 flex-1"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label>Correct Answer</Label>
                                        <Input
                                            placeholder="The answer to your riddle..."
                                            value={riddleAnswer}
                                            onChange={(e) => setRiddleAnswer(e.target.value)}
                                            className="bg-neutral-800 border-neutral-700"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <Button
                            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-6"
                            onClick={handleSubmitPhoto}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : <><Send className="mr-2 h-4 w-4" /> Add to Maze</>}
                        </Button>
                    </CardContent>
                </Card>

                {/* SECTION 2: Write a Wish */}
                <Card className="bg-neutral-900/80 border-purple-900/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-purple-500" />
                            Write a Wish
                        </CardTitle>
                        <CardDescription>Leave a birthday message</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            placeholder="Happy birthday! May all your dreams come true..."
                            value={wishMessage}
                            onChange={(e) => setWishMessage(e.target.value)}
                            className="bg-neutral-800 border-neutral-700 resize-none min-h-[100px]"
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

                {/* SECTION 3: Time Capsule */}
                <Card className="bg-neutral-900/80 border-amber-900/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="text-2xl">⏰</span>
                            Time Capsule Message
                        </CardTitle>
                        <CardDescription>Schedule a message that unlocks at a specific hour</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Unlock Hour (24-hour format)</Label>
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
                            className="bg-neutral-800 border-neutral-700 resize-none min-h-[100px]"
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
