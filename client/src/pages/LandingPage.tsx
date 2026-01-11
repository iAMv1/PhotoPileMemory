import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function LandingPage() {
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [birthdayDate, setBirthdayDate] = useState("");
    const [eventName, setEventName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !age || !eventName) return;

        setIsLoading(true);
        try {
            const slug = eventName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

            await apiRequest("/api/events", {
                method: "POST",
                body: {
                    slug,
                    birthdayPersonName: name,
                    birthdayPersonAge: parseInt(age),
                    birthdayDate: birthdayDate || null,
                    themeColor: "#ec4899"
                }
            });

            toast({
                title: "Event Created! 🎉",
                description: "Redirecting to your dashboard...",
            });

            // Redirect to dashboard
            setLocation(`/dashboard/${slug}`);
        } catch (error) {
            toast({
                title: "Error creating event",
                description: "That event name might be taken or something went wrong.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-4 text-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center"
            >
                <div className="space-y-6">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
                        PhotoPile Memory
                    </h1>
                    <p className="text-xl text-gray-300">
                        Create an immersive, interactive digital birthday experience.
                        Collect wishes, photos, and voice notes in a "Memory Maze" before the big reveal.
                    </p>
                    <div className="flex gap-4">
                        <Button variant="outline" className="border-pink-500 text-pink-400 hover:bg-pink-950" onClick={() => document.getElementById('create-form')?.scrollIntoView({ behavior: 'smooth' })}>
                            Start for Free
                        </Button>
                        <Link href="/demo/access">
                            <Button className="bg-white/10 hover:bg-white/20">View Demo</Button>
                        </Link>
                    </div>
                </div>

                <Card className="bg-black/40 border-purple-500/30 backdrop-blur-md shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl text-white">Create Your Event</CardTitle>
                        <CardDescription className="text-gray-400">Get started in seconds. No account needed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form id="create-form" onSubmit={handleCreateEvent} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Birthday Person's Name</label>
                                <Input
                                    placeholder="e.g. Rahul"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-white/5 border-purple-500/30 text-white placeholder:text-gray-600 focus:border-pink-500"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Age Turning</label>
                                <Input
                                    type="number"
                                    placeholder="25"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="bg-white/5 border-purple-500/30 text-white placeholder:text-gray-600 focus:border-pink-500"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Birthday Date (locks access until this date)</label>
                                <Input
                                    type="date"
                                    value={birthdayDate}
                                    onChange={(e) => setBirthdayDate(e.target.value)}
                                    className="bg-white/5 border-purple-500/30 text-white placeholder:text-gray-600 focus:border-pink-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Event Slug (URL)</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500 text-sm">/event/</span>
                                    <Input
                                        placeholder="rahul-25th"
                                        value={eventName}
                                        onChange={(e) => setEventName(e.target.value)}
                                        className="bg-white/5 border-purple-500/30 text-white placeholder:text-gray-600 focus:border-pink-500"
                                        required
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                Create Event
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Features Grid */}
            <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-6xl w-full">
                <FeatureCard
                    icon="🕵️‍♂️"
                    title="Memory Maze"
                    desc="Friends upload photos with clues. The birthday person must answer riddles to unlock memories."
                />
                <FeatureCard
                    icon="🧧"
                    title="Digital Envelope"
                    desc="A beautiful 3D envelope reveal animation with confetti and personalized greeting."
                />
                <FeatureCard
                    icon="⏰"
                    title="Time Capsules"
                    desc="Leave messages that only unlock at specific hours during their special day."
                />
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
    return (
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/50 transition-colors">
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400">{desc}</p>
        </div>
    );
}
