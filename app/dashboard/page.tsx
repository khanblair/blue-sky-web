"use client";

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
    TableRoot,
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
    XCircle
} from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="flex flex-col gap-8 pb-12">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Dashboard</h1>
                    <p className="text-default-500">Manage your automated BlueSky presence</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="font-bold">
                        <Play size={18} className="mr-2" />
                        Resume Posting
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
                        <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
                            <Cloud className="text-success" />
                        </div>
                        <div>
                            <p className="text-sm text-default-500 font-medium">Account Connection</p>
                            <div className="flex items-center gap-2">
                                <span className="font-bold">@yourname.bsky.social</span>
                                <Chip variant="primary" size="sm" className="text-[10px] uppercase font-bold tracking-wider px-2">Active</Chip>
                            </div>
                        </div>
                        <Button size="sm" variant="ghost" className="ml-auto w-8 h-8 min-w-0 p-0">
                            <Settings size={18} className="text-default-400" />
                        </Button>
                    </CardContent>
                </CardRoot>

                {/* Post Stats */}
                <CardRoot className="bg-surface border border-divider/50">
                    <CardContent className="flex flex-row items-center gap-4 p-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <MessageSquare className="text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-default-500 font-medium lowercase">Total Posts Made</p>
                            <p className="text-2xl font-black text-primary">124</p>
                        </div>
                    </CardContent>
                </CardRoot>

                {/* Next Scheduled */}
                <CardRoot className="bg-surface border border-divider/50">
                    <CardContent className="flex flex-row items-center gap-4 p-6">
                        <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center">
                            <Clock className="text-warning" />
                        </div>
                        <div>
                            <p className="text-sm text-default-500 font-medium lowercase">Next Scheduled</p>
                            <p className="text-lg font-bold">Today, 4:00 PM</p>
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
                                    <Label className="text-sm font-semibold">Topics</Label>
                                    <Input
                                        placeholder="Tech, Philosophy, AI"
                                        className="px-3 py-2 bg-default-100 rounded-lg text-sm border border-transparent focus:border-primary outline-none transition-colors"
                                    />
                                </TextFieldRoot>
                                <TextFieldRoot className="flex flex-col gap-2">
                                    <Label className="text-sm font-semibold">Writing Tone</Label>
                                    <Input
                                        placeholder="Professional yet witty"
                                        className="px-3 py-2 bg-default-100 rounded-lg text-sm border border-transparent focus:border-primary outline-none transition-colors"
                                    />
                                </TextFieldRoot>
                                <TextFieldRoot className="flex flex-col gap-2">
                                    <Label className="text-sm font-semibold">Posting Frequency (Hours)</Label>
                                    <Input
                                        placeholder="4"
                                        className="px-3 py-2 bg-default-100 rounded-lg text-sm border border-transparent focus:border-primary outline-none transition-colors"
                                    />
                                </TextFieldRoot>
                                <Button variant="primary" className="mt-4 font-bold">Save Preferences</Button>
                            </CardContent>
                        </CardRoot>

                        <div className="flex flex-col gap-8">
                            <CardRoot className="p-4 bg-surface border-divider border">
                                <CardContent className="flex flex-row items-center justify-between p-2">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-md font-bold">Automated Posting</p>
                                        <p className="text-small text-default-500 lowercase">Toggle entire automation system</p>
                                    </div>
                                    <Switch defaultSelected />
                                </CardContent>
                            </CardRoot>
                        </div>
                    </div>
                </TabPanel>

                <TabPanel id="history">
                    <CardRoot className="bg-surface border-divider border">
                        <CardContent className="p-0 overflow-x-auto">
                            <TableRoot aria-label="Post History Table" className="min-w-full">
                                <TableHeader className="bg-default-50 border-b border-divider">
                                    <TableColumn isRowHeader className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-default-400">Content</TableColumn>
                                    <TableColumn className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-default-400">Timestamp</TableColumn>
                                    <TableColumn className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-default-400">Status</TableColumn>
                                    <TableColumn className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-widest text-default-400">Action</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    <TableRow className="border-b border-divider/50 hover:bg-default-50 transition-colors">
                                        <TableCell className="px-6 py-4">
                                            <p className="line-clamp-1 text-sm font-medium">Just finished a deep dive into vector databases...</p>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-default-500 text-xs">2 hours ago</TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Chip color="success" size="sm" className="bg-success/20 text-success border-none">Success</Chip>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <Button size="sm" variant="ghost" className="text-primary font-bold">View</Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </TableRoot>
                        </CardContent>
                    </CardRoot>
                </TabPanel>
            </TabsRoot>
        </div>
    );
}
