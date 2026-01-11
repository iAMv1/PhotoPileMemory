import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, ExternalLink, QrCode, Camera, MessageSquare, Clock, Lock, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContributorEntry {
    name: string;
    mazePhoto: boolean;
    galleryPhoto: boolean;
    wish: boolean;
    timeCapsule: boolean;
    riddleAnswer?: string;
}

export default function EventDashboard() {
    const [match, params] = useRoute("/dashboard/:slug");
    const slug = params?.slug;
    const { toast } = useToast();
    const [visibleAnswers, setVisibleAnswers] = useState<Set<string>>(new Set());

    const { data: event, isLoading, error } = useQuery({
        queryKey: ['/api/events', slug],
        queryFn: async () => {
            const res = await fetch(`/api/events/${slug}`);
            if (!res.ok) throw new Error("Event not found");
            return (await res.json()).event;
        },
        enabled: !!slug
    });

    // Fetch photos to get contributors
    const { data: photosData } = useQuery({
        queryKey: ['/api/user-photos', event?.id],
        queryFn: async () => {
            const res = await fetch(`/api/user-photos?eventId=${event.id}`);
            if (!res.ok) return { photos: [] };
            return res.json();
        },
        enabled: !!event?.id
    });

    // Fetch wishes
    const { data: wishesData } = useQuery({
        queryKey: ['/api/wishes', event?.id],
        queryFn: async () => {
            const res = await fetch(`/api/wishes?eventId=${event.id}`);
            if (!res.ok) return { wishes: [] };
            return res.json();
        },
        enabled: !!event?.id
    });

    // Fetch time capsule messages
    const { data: capsuleData } = useQuery({
        queryKey: ['/api/time-capsule-messages', event?.id],
        queryFn: async () => {
            const res = await fetch(`/api/time-capsule-messages?eventId=${event.id}`);
            if (!res.ok) return { messages: [] };
            return res.json();
        },
        enabled: !!event?.id
    });

    // Build contributor stats
    const buildContributorStats = (): ContributorEntry[] => {
        const contributors = new Map<string, ContributorEntry>();

        // Process photos
        (photosData?.photos || []).forEach((p: any) => {
            const name = p.contributorName || "Anonymous";
            if (!contributors.has(name)) {
                contributors.set(name, { name, mazePhoto: false, galleryPhoto: false, wish: false, timeCapsule: false });
            }
            const entry = contributors.get(name)!;
            if (p.isGlitched) {
                entry.mazePhoto = true;
                if (p.riddleAnswer) {
                    entry.riddleAnswer = p.riddleAnswer;
                }
            } else {
                entry.galleryPhoto = true;
            }
        });

        // Process wishes
        (wishesData?.wishes || []).forEach((w: any) => {
            const name = w.name || "Anonymous";
            if (!contributors.has(name)) {
                contributors.set(name, { name, mazePhoto: false, galleryPhoto: false, wish: false, timeCapsule: false });
            }
            contributors.get(name)!.wish = true;
        });

        // Process time capsule messages
        (capsuleData?.messages || []).forEach((m: any) => {
            const name = m.authorName || "Anonymous";
            if (!contributors.has(name)) {
                contributors.set(name, { name, mazePhoto: false, galleryPhoto: false, wish: false, timeCapsule: false });
            }
            contributors.get(name)!.timeCapsule = true;
        });

        return Array.from(contributors.values());
    };

    const contributorStats = event ? buildContributorStats() : [];
    const totalMazePhotos = (photosData?.photos || []).filter((p: any) => p.isGlitched).length;
    const totalGalleryPhotos = (photosData?.photos || []).filter((p: any) => !p.isGlitched).length;
    const totalWishes = (wishesData?.wishes || []).length;
    const totalCapsules = (capsuleData?.messages || []).length;

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-black text-white"><Loader2 className="animate-spin h-8 w-8 text-pink-500" /></div>;
    }

    if (error || !event) {
        return <div className="min-h-screen flex items-center justify-center bg-black text-white">Event not found</div>;
    }

    const baseUrl = window.location.origin;
    const contributeUrl = `${baseUrl}/e/${slug}/contribute`;
    const accessUrl = `${baseUrl}/e/${slug}/access`;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: "Link copied to clipboard" });
    };

    const StatusIcon = ({ filled }: { filled: boolean }) => (
        filled
            ? <CheckCircle className="w-4 h-4 text-green-400" />
            : <XCircle className="w-4 h-4 text-neutral-600" />
    );

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12">
            <div className="max-w-5xl mx-auto space-y-8">
                <header className="border-b border-gray-800 pb-6">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                        {event.birthdayPersonName}'s {event.birthdayPersonAge}th Birthday
                    </h1>
                    <p className="text-gray-400 mt-2">Event Dashboard</p>
                </header>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-xl p-4 border border-red-500/30">
                        <div className="flex items-center gap-2 mb-2">
                            <Lock className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 text-sm">Maze Photos</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{totalMazePhotos}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl p-4 border border-blue-500/30">
                        <div className="flex items-center gap-2 mb-2">
                            <Camera className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-400 text-sm">Gallery Photos</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{totalGalleryPhotos}</p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 rounded-xl p-4 border border-pink-500/30">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-4 h-4 text-pink-400" />
                            <span className="text-pink-400 text-sm">Wishes</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{totalWishes}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-xl p-4 border border-amber-500/30">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-400 text-sm">Time Capsules</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{totalCapsules}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contributor Card */}
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-400">
                                <QrCode className="w-5 h-5" /> Contributor Link
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                Send this to friends & family to collect wishes and photos.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-white p-4 rounded-lg w-fit mx-auto">
                                <QRCodeSVG value={contributeUrl} size={180} />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 bg-gray-800 border-gray-700 hover:bg-gray-700" onClick={() => copyToClipboard(contributeUrl)}>
                                    <Copy className="w-4 h-4 mr-2" /> Copy Link
                                </Button>
                                <Button variant="outline" className="bg-gray-800 border-gray-700 hover:bg-gray-700" onClick={() => window.open(contributeUrl, '_blank')}>
                                    <ExternalLink className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Access Card */}
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-pink-400">
                                <QrCode className="w-5 h-5" /> Birthday Star Link
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                Give this to {event.birthdayPersonName} on their birthday.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-white p-4 rounded-lg w-fit mx-auto">
                                <QRCodeSVG value={accessUrl} size={180} />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 bg-gray-800 border-gray-700 hover:bg-gray-700" onClick={() => copyToClipboard(accessUrl)}>
                                    <Copy className="w-4 h-4 mr-2" /> Copy Link
                                </Button>
                                <Button variant="outline" className="bg-gray-800 border-gray-700 hover:bg-gray-700" onClick={() => window.open(accessUrl, '_blank')}>
                                    <ExternalLink className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contributor Stats Table */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white">Contributor Entries</CardTitle>
                        <CardDescription className="text-gray-400">
                            Track who has submitted what
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {contributorStats.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No contributions yet. Share the contributor link to get started!
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-800">
                                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Contributor</th>
                                            <th className="text-center py-3 px-4 text-red-400 font-medium">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Lock className="w-3 h-3" /> Maze
                                                </div>
                                            </th>
                                            <th className="text-center py-3 px-4 text-blue-400 font-medium">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Camera className="w-3 h-3" /> Gallery
                                                </div>
                                            </th>
                                            <th className="text-center py-3 px-4 text-pink-400 font-medium">
                                                <div className="flex items-center justify-center gap-1">
                                                    <MessageSquare className="w-3 h-3" /> Wish
                                                </div>
                                            </th>
                                            <th className="text-center py-3 px-4 text-amber-400 font-medium">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Clock className="w-3 h-3" /> Capsule
                                                </div>
                                            </th>
                                            <th className="text-center py-3 px-4 text-green-400 font-medium">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Eye className="w-3 h-3" /> Riddle Answer
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contributorStats.map((entry, idx) => (
                                            <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                                                <td className="py-3 px-4 text-white font-medium">{entry.name}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex justify-center">
                                                        <StatusIcon filled={entry.mazePhoto} />
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex justify-center">
                                                        <StatusIcon filled={entry.galleryPhoto} />
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex justify-center">
                                                        <StatusIcon filled={entry.wish} />
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex justify-center">
                                                        <StatusIcon filled={entry.timeCapsule} />
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {entry.riddleAnswer ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="text-green-400 font-mono text-sm">
                                                                {visibleAnswers.has(entry.name) ? entry.riddleAnswer : '••••••'}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    const newSet = new Set(visibleAnswers);
                                                                    if (newSet.has(entry.name)) {
                                                                        newSet.delete(entry.name);
                                                                    } else {
                                                                        newSet.add(entry.name);
                                                                    }
                                                                    setVisibleAnswers(newSet);
                                                                }}
                                                                className="p-1 rounded hover:bg-gray-700 transition"
                                                            >
                                                                {visibleAnswers.has(entry.name)
                                                                    ? <EyeOff className="w-4 h-4 text-gray-400" />
                                                                    : <Eye className="w-4 h-4 text-gray-400" />}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-600">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
