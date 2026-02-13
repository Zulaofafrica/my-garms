"use client";

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Send, Paperclip, Image as ImageIcon, FileText, CheckCircle, AlertCircle, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SimpleImageUpload } from "@/components/ui/simple-image-upload";

interface FeedbackLogEntry {
    id: string;
    userId: string;
    userName: string;
    action: string;
    comment: string;
    attachmentUrl?: string;
    timestamp: string;
}

interface ChatInterfaceProps {
    currentUserId: string; // To determine alignment (right for me, left for others)
    feedbackLog: FeedbackLogEntry[];
    onSendMessage: (message: string, attachmentUrl?: string) => Promise<void>;
    isSending: boolean;
    placeholder?: string;
    title?: string;
    variant?: 'dark' | 'light';
}

export function ChatInterface({
    currentUserId,
    feedbackLog,
    onSendMessage,
    isSending,
    placeholder = "Type a message...",
    title = "Design Feedback",
    variant = 'dark'
}: ChatInterfaceProps) {
    const [message, setMessage] = useState("");
    const [attachment, setAttachment] = useState("");
    const [showUpload, setShowUpload] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isDark = variant === 'dark';

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [feedbackLog]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!message.trim() && !attachment) || isSending) return;

        await onSendMessage(message, attachment);
        setMessage("");
        setAttachment("");
        setShowUpload(false);
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'approve': return <CheckCircle className="w-4 h-4" />;
            case 'request_change': return <AlertCircle className="w-4 h-4" />;
            case 'set_price': return <DollarSign className="w-4 h-4" />;
            default: return null;
        }
    };

    const getActionClass = (action: string) => {
        switch (action) {
            case 'approve': return "bg-green-500/10 text-green-400 border-green-500/20";
            case 'request_change': return "bg-red-500/10 text-red-500 border-red-500/20";
            case 'set_price': return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
            default: return isDark ? "bg-white/5 text-slate-300 border-white/10" : "bg-slate-100 text-slate-600 border-slate-200";
        }
    };

    // Style configs
    const containerClass = isDark
        ? "bg-slate-900/50 border-white/10 text-white"
        : "bg-white border-slate-200 text-slate-900 shadow-sm";

    const headerClass = isDark
        ? "border-white/10 bg-slate-900/80"
        : "border-slate-100 bg-white/80";

    const headerTitleClass = isDark ? "text-white" : "text-slate-900";

    const emptyStateIconClass = isDark ? "bg-white/5" : "bg-slate-100";
    const emptyStateTextClass = isDark ? "text-slate-500" : "text-slate-400";

    const messageTimeClass = isDark ? "text-slate-600" : "text-slate-400";
    const messageUserClass = isDark ? "text-slate-400" : "text-slate-600";

    const myMessageBubbleClass = isDark
        ? "bg-indigo-600 text-white border-indigo-500"
        : "bg-indigo-600 text-white border-indigo-600"; // Keep my messages colorful

    const otherMessageBubbleClass = isDark
        ? "bg-slate-800 text-slate-200 border-white/5"
        : "bg-slate-100 text-slate-800 border-slate-200";

    const inputAreaClass = isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-100";
    const inputWrapperClass = isDark ? "bg-slate-950 border-white/10" : "bg-slate-50 border-slate-200";
    const inputTextClass = isDark ? "text-white placeholder:text-slate-500" : "text-slate-900 placeholder:text-slate-400";
    const inputButtonDisabledClass = isDark ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-300";
    const attachmentButtonClass = isDark
        ? "text-slate-400 hover:bg-white/5 hover:text-white"
        : "text-slate-400 hover:bg-slate-200 hover:text-slate-600";

    return (
        <div className={`flex flex-col h-[600px] border rounded-2xl overflow-hidden backdrop-blur-sm ${containerClass}`}>
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between ${headerClass}`}>
                <h3 className={`font-semibold flex items-center gap-2 ${headerTitleClass}`}>
                    <FileText className="w-5 h-5 text-indigo-500" />
                    {title}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'text-slate-400 bg-white/5' : 'text-slate-500 bg-slate-100'}`}>
                    {feedbackLog.length} messages
                </span>
            </div>

            {/* Messages Area */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {feedbackLog.length === 0 ? (
                    <div className={`h-full flex flex-col items-center justify-center space-y-4 ${emptyStateTextClass}`}>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${emptyStateIconClass}`}>
                            <MessageIcon className="w-8 h-8 opacity-50" />
                        </div>
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    feedbackLog.map((msg, idx) => {
                        const isMe = msg.userId === currentUserId;

                        return (
                            <motion.div
                                key={msg.id || idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                                <div className="flex items-center gap-2 mb-1 px-1">
                                    <span className={`text-xs font-medium ${messageUserClass}`}>{msg.userName}</span>
                                    <span className={`text-[10px] ${messageTimeClass}`}>
                                        {format(new Date(msg.timestamp), 'h:mm a')}
                                    </span>
                                </div>

                                <div className={`max-w-[80%] relative group`}>
                                    {/* Action Badge */}
                                    {msg.action !== 'reply' && (
                                        <div className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 px-3 py-1 rounded-full w-fit border ${getActionClass(msg.action)}`}>
                                            {getActionIcon(msg.action)}
                                            <span className="uppercase tracking-wider">{msg.action.replace('_', ' ')}</span>
                                        </div>
                                    )}

                                    <div className={`p-4 rounded-2xl shadow-sm border ${isMe ? `${myMessageBubbleClass} rounded-tr-sm` : `${otherMessageBubbleClass} rounded-tl-sm`
                                        }`}>
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.comment}</p>
                                    </div>

                                    {msg.attachmentUrl && (
                                        <div className={`mt-2 rounded-xl overflow-hidden border ${isMe ? 'border-indigo-500/30' : (isDark ? 'border-white/10' : 'border-slate-200')} max-w-[200px]`}>
                                            <img
                                                src={msg.attachmentUrl}
                                                alt="Attachment"
                                                className="w-full h-auto object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t ${inputAreaClass}`}>
                <AnimatePresence>
                    {showUpload && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mb-4 overflow-hidden"
                        >
                            <div className={`rounded-xl p-3 border ${isDark ? 'bg-slate-800/50 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Attach Image</span>
                                    <button
                                        onClick={() => setShowUpload(false)}
                                        className={`text-xs ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        Cancel
                                    </button>
                                </div>
                                <SimpleImageUpload
                                    onUpload={setAttachment}
                                    value={attachment}
                                    label="Click to upload"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className={`flex gap-2 items-end p-2 rounded-xl border focus-within:border-indigo-500/50 transition-colors ${inputWrapperClass}`}>
                    <button
                        type="button"
                        onClick={() => setShowUpload(!showUpload)}
                        className={`p-2.5 rounded-lg transition-colors ${attachment || showUpload
                                ? 'bg-indigo-500/20 text-indigo-500'
                                : attachmentButtonClass
                            }`}
                        title="Add Attachment"
                    >
                        {attachment ? <ImageIcon size={20} /> : <Paperclip size={20} />}
                    </button>

                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={placeholder}
                        className={`flex-1 bg-transparent border-0 focus:ring-0 p-2.5 max-h-32 min-h-[44px] resize-none text-sm custom-scrollbar ${inputTextClass}`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />

                    <button
                        type="submit"
                        disabled={(!message.trim() && !attachment) || isSending}
                        className={`p-2.5 rounded-lg transition-all ${(!message.trim() && !attachment) || isSending
                                ? `${inputButtonDisabledClass} cursor-not-allowed`
                                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 hover:scale-105 active:scale-95'
                            }`}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}

function MessageIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
    )
}
