"use client";

import { useState, useEffect } from "react";
import {
    CardRoot,
    CardHeader,
    CardContent,
    Button,
    TextFieldRoot,
    Label,
    Input,
    Switch,
    Chip,
    Table,
    TableContent,
    TableHeader,
    TableBody,
    TableCell,
    TableColumn,
    TableRow,
    TabsRoot,
    TabList,
    Tab,
    TabPanel,
} from "@heroui/react";
import {
    Cloud,
    Settings,
    Play,
    Send,
    MessageSquare,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

function formatTimeAgo(timestamp: number) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
}

export default function DashboardPage() {
    const user = useQuery(api.users.getCurrentUser);
    const preferences = useQuery(api.users.getPreferences);
    const stats = useQuery(api.posting.getStats);
    const history = useQuery(api.posting.getPostHistory);
    const updatePrefs = useMutation(api.users.updatePreferences);

    const [isSaving, setIsSaving] = useState(false);
    const [topicsStr, setTopicsStr] = useState("");
    const [localPrefs, setLocalPrefs] = useState({
        tone: "professional",
        frequency: 24
    });

    useEffect(() => {
        if (preferences) {
            setTopicsStr(preferences.topics.join(", "));
            setLocalPrefs({
                tone: preferences.tone,
                frequency: preferences.frequency
            });
        }
    }, [preferences]);

    const handleSavePreferences = async () => {
        setIsSaving(true);
        try {
            await updatePrefs({
                topics: topicsStr.split(",").map(t => t.trim()).filter(Boolean),
                tone: localPrefs.tone,
                frequency: localPrefs.frequency,
            });
        } catch (error) {
            console.error("Failed to save preferences:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (user === undefined || preferences === undefined) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const nextScheduledDate = preferences?.lastPostTime
        ? new Date(preferences.lastPostTime + (preferences.frequency * 60 * 60 * 1000))
        : null;

    return (
        <div className="flex flex-col gap-8 pb-12">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Dashboard</h1>
                    <p className="text-default-500">Manage your automated BlueSky presence</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="font-bold" isDisabled={!user?.isActive}>
                        <Play size={18} className="mr-2" />
                        {user?.isActive ? "Pause Posting" : "Resume Posting"}
                    </Button>
                    <Button variant="primary" className="font-bold">
                        <Send size={18} className="mr-2" />
                        Post Now
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Connection Status */}
                <CardRoot className="bg-surface border border-divider/50">
                    <CardContent className="flex flex-row items-center gap-4 p-6">
                        <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center flex-shrink-0">
                            <Cloud className="text-success" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-default-500 font-black uppercase tracking-widest text-[9px] mb-1 opacity-70">Account Connection</p>
                            <div className="flex flex-col gap-0.5">
                                <span className="font-black text-xl tracking-tight break-all leading-tight">
                                    {user?.handle || "Not Connected"}
                                </span>
                                <div className="mt-1">
                                    <Chip
                                        variant="soft"
                                        color={user?.isActive ? "success" : "default"}
                                        size="sm"
                                        className="text-[9px] uppercase font-bold tracking-[0.1em] px-2 h-5 min-h-0"
                                    >
                                        {user?.isActive ? "Active" : "Inactive"}
                                    </Chip>
                                </div>
                            </div>
                        </div>
                        <Button size="sm" variant="ghost" className="w-8 h-8 min-w-0 p-0" onPress={() => window.location.href = "/settings"}>
                            <Settings size={18} className="text-default-400" />
                        </Button>
                    </CardContent>
                </CardRoot>

                {/* Post Stats */}
                <CardRoot className="bg-surface border border-divider/50">
                    <CardContent className="flex flex-row items-center gap-4 p-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-default-500 font-medium uppercase tracking-wider text-[10px] mb-1">Total Posts Made</p>
                            <p className="text-3xl font-black text-primary leading-tight">{stats?.totalPosts || 0}</p>
                        </div>
                    </CardContent>
                </CardRoot>

                {/* Next Scheduled */}
                <CardRoot className="bg-surface border border-divider/50">
                    <CardContent className="flex flex-row items-center gap-4 p-6">
                        <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center flex-shrink-0">
                            <Clock className="text-warning" />
                        </div>
                        <div>
                            <p className="text-sm text-default-500 font-medium uppercase tracking-wider text-[10px] mb-1">Next Scheduled</p>
                            <p className="text-xl font-bold tracking-tight leading-tight">
                                {nextScheduledDate
                                    ? nextScheduledDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                    : "Not Scheduled"}
                            </p>
                        </div>
                    </CardContent>
                </CardRoot>
            </div>

            <TabsRoot aria-label="Dashboard Tabs" className="w-full">
                <TabList className="gap-6 w-full relative rounded-none p-0 border-b border-divider mb-6">
                    <Tab id="preferences" className="font-bold text-lg px-0 pb-3 h-auto data-[selected=true]:text-primary data-[selected=true]:border-b-2 data-[selected=true]:border-primary transition-all rounded-none bg-transparent">
                        Posting Preferences
                    </Tab>
                    <Tab id="history" className="font-bold text-lg px-0 pb-3 h-auto data-[selected=true]:text-primary data-[selected=true]:border-b-2 data-[selected=true]:border-primary transition-all rounded-none bg-transparent">
                        Post History
                    </Tab>
                </TabList>

                <TabPanel id="preferences">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <CardRoot className="p-4 bg-surface border-divider border">
                            <CardHeader className="flex gap-3 pb-4">
                                <Cloud className="text-primary" />
                                <div className="flex flex-col">
                                    <p className="text-md font-bold">Content Strategy</p>
                                    <p className="text-small text-default-500 uppercase tracking-tighter text-[10px]">Refine your AI's writing style</p>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-6 pt-4">
                                <TextFieldRoot className="flex flex-col gap-2">
                                    <Label className="text-sm font-semibold">Topics (comma separated)</Label>
                                    <Input
                                        placeholder="Tech, Philosophy, AI"
                                        value={topicsStr}
                                        onChange={(e) => setTopicsStr(e.target.value)}
                                        className="px-3 py-2 bg-default-100 rounded-lg text-sm border border-transparent focus:border-primary outline-none transition-colors"
                                    />
                                </TextFieldRoot>
                                <TextFieldRoot className="flex flex-col gap-2">
                                    <Label className="text-sm font-semibold">Writing Tone</Label>
                                    <Input
                                        placeholder="Professional yet witty"
                                        value={localPrefs.tone}
                                        onChange={(e) => setLocalPrefs({ ...localPrefs, tone: e.target.value })}
                                        className="px-3 py-2 bg-default-100 rounded-lg text-sm border border-transparent focus:border-primary outline-none transition-colors"
                                    />
                                </TextFieldRoot>
                                <TextFieldRoot className="flex flex-col gap-2">
                                    <Label className="text-sm font-semibold">Posting Frequency (Hours)</Label>
                                    <Input
                                        placeholder="24"
                                        type="number"
                                        value={localPrefs.frequency.toString()}
                                        onChange={(e) => setLocalPrefs({ ...localPrefs, frequency: parseInt(e.target.value) || 1 })}
                                        className="px-3 py-2 bg-default-100 rounded-lg text-sm border border-transparent focus:border-primary outline-none transition-colors"
                                    />
                                </TextFieldRoot>
                                <Button
                                    variant="primary"
                                    className="mt-4 font-bold"
                                    onPress={handleSavePreferences}
                                    isDisabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Preferences"
                                    )}
                                </Button>
                            </CardContent>
                        </CardRoot>

                        <div className="flex flex-col gap-8">
                            <CardRoot className="p-4 bg-surface border-divider border">
                                <CardContent className="flex flex-row items-center justify-between p-2">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-md font-bold">Automated Posting</p>
                                        <p className="text-small text-default-500 lowercase">Toggle entire automation system</p>
                                    </div>
                                    <Switch isSelected={user?.isActive} />
                                </CardContent>
                            </CardRoot>
                        </div>
                    </div>
                </TabPanel>

                <TabPanel id="history">
                    <CardRoot className="bg-surface border-divider border">
                        <CardContent className="p-0 overflow-x-auto">
                            <Table aria-label="Post History Table" className="min-w-full">
                                <TableContent>
                                    <TableHeader className="bg-default-50 border-b border-divider">
                                        <TableColumn className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-default-400">Content</TableColumn>
                                        <TableColumn className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-default-400">Timestamp</TableColumn>
                                        <TableColumn className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-default-400">Status</TableColumn>
                                        <TableColumn className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-widest text-default-400">Action</TableColumn>
                                    </TableHeader>
                                    <TableBody items={history || []}>
                                        {(post: any) => (
                                            <TableRow key={post._id} className="border-b border-divider/50 last:border-0 hover:bg-default-50 transition-colors">
                                                <TableCell className="px-6 py-4">
                                                    <p className="line-clamp-1 text-sm font-medium">{post.content || post.error || "No content"}</p>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 text-default-500 text-xs">
                                                    {formatTimeAgo(post.timestamp)}
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <Chip
                                                        color={post.status === "success" ? "success" : "danger"}
                                                        size="sm"
                                                        className={cn(
                                                            "border-none",
                                                            post.status === "success" ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                                                        )}
                                                    >
                                                        {post.status}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 text-right">
                                                    {post.blueskyUri ? (
                                                        <a
                                                            href={`https://bsky.app/profile/${user?.handle}/post/${post.blueskyUri.split('/').pop()}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-primary font-bold hover:underline"
                                                        >
                                                            View
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-zinc-600">N/A</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </TableContent>
                            </Table>
                        </CardContent>
                    </CardRoot>
                </TabPanel>
            </TabsRoot>
        </div >
    );
}
