"use client";

import React, { useState, FC, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaBold, FaItalic, FaLink, FaImage, FaListUl, FaListOl, FaQuoteLeft, FaCode } from "react-icons/fa";
import { LuHeading1, LuHeading2, LuHeading3 } from "react-icons/lu";

const ReactMde = dynamic(() => import("react-mde"), {
    ssr: false,
    loading: () => <div className="w-full h-40 flex items-center justify-center bg-gray-50 rounded-md">Loading editor...</div>,
});
const ReactMarkdown = dynamic(() => import("react-markdown"), {
    ssr: false,
    loading: () => <div className="w-full h-40 flex items-center justify-center bg-gray-50 rounded-md">Loading preview...</div>,
});

// Import React MDE styles
import "react-mde/lib/styles/css/react-mde-all.css";

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

// Format types for toolbar buttons
type FormatType = 
    | "h1" | "h2" | "h3" 
    | "bold" | "italic" 
    | "link" | "image" 
    | "ul" | "ol" 
    | "quote" | "code";

interface ToolbarButton {
    type: FormatType;
    icon: React.ReactElement;
    label: string;
    syntax: string | ((selection: string) => string);
}

const MarkdownEditor: FC<MarkdownEditorProps> = ({
    value,
    onChange,
    placeholder = "Start typing...",
}) => {
    const [content, setContent] = useState<string>(value);
    const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
    const [charCount, setCharCount] = useState<number>(0);

    const handleChange = (newValue: string) => {
        setContent(newValue);
        setCharCount(newValue.length);
        onChange(newValue);
    };

    // Update content if value prop changes externally
    useEffect(() => {
        if (value !== content) {
            setContent(value);
            setCharCount(value.length);
        }
    }, [value]);

    // Toolbar buttons configuration
    const toolbarButtons: ToolbarButton[] = [
        { 
            type: "h1", 
            icon: <LuHeading1 className="w-4 h-4" />, 
            label: "Heading 1", 
            syntax: (selection) => `# ${selection || "Heading 1"}`
        },
        { 
            type: "h2", 
            icon: <LuHeading2 className="w-4 h-4" />, 
            label: "Heading 2", 
            syntax: (selection) => `## ${selection || "Heading 2"}`
        },
        { 
            type: "h3", 
            icon: <LuHeading3 className="w-4 h-4" />, 
            label: "Heading 3", 
            syntax: (selection) => `### ${selection || "Heading 3"}`
        },
        { 
            type: "bold", 
            icon: <FaBold className="w-3.5 h-3.5" />, 
            label: "Bold", 
            syntax: (selection) => `**${selection || "bold text"}**`
        },
        { 
            type: "italic", 
            icon: <FaItalic className="w-3.5 h-3.5" />, 
            label: "Italic", 
            syntax: (selection) => `*${selection || "italic text"}*`
        },
        { 
            type: "link", 
            icon: <FaLink className="w-3.5 h-3.5" />, 
            label: "Link", 
            syntax: (selection) => `[${selection || "link text"}](url)`
        },
        { 
            type: "image", 
            icon: <FaImage className="w-3.5 h-3.5" />, 
            label: "Image", 
            syntax: (selection) => `![${selection || "alt text"}](image-url)`
        },
        { 
            type: "ul", 
            icon: <FaListUl className="w-3.5 h-3.5" />, 
            label: "Bullet List", 
            syntax: (selection) => selection ? selection.split('\n').map(line => `- ${line}`).join('\n') : "- List item"
        },
        { 
            type: "ol", 
            icon: <FaListOl className="w-3.5 h-3.5" />, 
            label: "Numbered List", 
            syntax: (selection) => selection ? selection.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n') : "1. List item"
        },
        { 
            type: "quote", 
            icon: <FaQuoteLeft className="w-3.5 h-3.5" />, 
            label: "Quote", 
            syntax: (selection) => `> ${selection || "Blockquote"}`
        },
        { 
            type: "code", 
            icon: <FaCode className="w-3.5 h-3.5" />, 
            label: "Code", 
            syntax: (selection) => selection ? `\`\`\`\n${selection}\n\`\`\`` : "```\ncode block\n```"
        },
    ];

    // Function to safely insert markdown syntax using a native DOM approach
    // rather than relying on the React-MDE internal functions that might trigger alerts
    const insertFormat = (event: React.MouseEvent, button: ToolbarButton) => {
        event.preventDefault(); // Prevent any default behavior
        event.stopPropagation(); // Stop event bubbling
        
        const textarea = document.querySelector('.mde-text') as HTMLTextAreaElement;
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        const textBefore = content.substring(0, start);
        const textAfter = content.substring(end);
        
        let newText = '';
        if (typeof button.syntax === 'function') {
            newText = button.syntax(selectedText);
        } else {
            newText = button.syntax;
        }
        
        const newValue = textBefore + newText + textAfter;
        
        // Update the textarea value manually
        textarea.value = newValue;
        
        // Trigger a native input event to ensure React state updates
        const inputEvent = new Event('input', { bubbles: true });
        textarea.dispatchEvent(inputEvent);
        
        // Update React state
        setContent(newValue);
        onChange(newValue);
        
        // Set cursor position
        setTimeout(() => {
            textarea.focus();
            const cursorPosition = typeof button.syntax === 'function' 
                ? start + newText.length 
                : start + button.syntax.length;
            textarea.setSelectionRange(cursorPosition, cursorPosition);
        }, 0);
    };

    return (
        <div className="h-full w-full bg-white rounded-md overflow-hidden border border-gray-200 shadow-sm">
            {/* Editor Tabs */}
            <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-200">
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault(); 
                            setSelectedTab("write");
                        }}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                            selectedTab === "write"
                                ? "bg-white text-blue-600 shadow-sm border border-gray-200"
                                : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        Write
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            setSelectedTab("preview");
                        }}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                            selectedTab === "preview"
                                ? "bg-white text-blue-600 shadow-sm border border-gray-200"
                                : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        Preview
                    </button>
                </div>
                <div className="text-xs text-gray-500">
                    {charCount} characters
                </div>
            </div>
            
            {/* Toolbar - only shown in write mode */}
            {selectedTab === "write" && (
                <div className="px-2 py-1.5 bg-white border-b border-gray-200 flex flex-wrap items-center gap-1">
                    <div className="flex items-center px-1 gap-1 border-r border-gray-200 mr-1">
                        {toolbarButtons.slice(0, 3).map((button) => (
                            <button
                                key={`format-${button.type}`}
                                type="button"
                                onClick={(e) => insertFormat(e, button)}
                                title={button.label}
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-700"
                            >
                                {button.icon}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center px-1 gap-1 border-r border-gray-200 mr-1">
                        {toolbarButtons.slice(3, 5).map((button) => (
                            <button
                                key={`format-${button.type}`}
                                type="button"
                                onClick={(e) => insertFormat(e, button)}
                                title={button.label}
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-700"
                            >
                                {button.icon}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center px-1 gap-1 border-r border-gray-200 mr-1">
                        {toolbarButtons.slice(5, 7).map((button) => (
                            <button
                                key={`format-${button.type}`}
                                type="button"
                                onClick={(e) => insertFormat(e, button)}
                                title={button.label}
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-700"
                            >
                                {button.icon}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center px-1 gap-1 border-r border-gray-200 mr-1">
                        {toolbarButtons.slice(7, 9).map((button) => (
                            <button
                                key={`format-${button.type}`}
                                type="button"
                                onClick={(e) => insertFormat(e, button)}
                                title={button.label}
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-700"
                            >
                                {button.icon}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center px-1 gap-1">
                        {toolbarButtons.slice(9).map((button) => (
                            <button
                                key={`format-${button.type}`}
                                type="button"
                                onClick={(e) => insertFormat(e, button)}
                                title={button.label}
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-700"
                            >
                                {button.icon}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Editor Area */}
            <ReactMde
                value={content}
                onChange={handleChange}
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
                generateMarkdownPreview={(markdown) =>
                    Promise.resolve(
                        <div className="markdown-preview p-4">
                            <ReactMarkdown>{markdown}</ReactMarkdown>
                        </div>
                    )
                }
                // placeholder={placeholder}
                childProps={{
                    writeButton: {
                        tabIndex: -1,
                        style: { display: "none" }
                    },
                    previewButton: {
                        tabIndex: -1,
                        style: { display: "none" }
                    },
                    textArea: {
                        autoComplete: "off",
                        spellCheck: false
                    }
                }}
            />

            {/* Markdown Help - collapsible panel at bottom */}
            {selectedTab === "write" && (
                <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-xs">
                    <details>
                        <summary className="cursor-pointer text-blue-600 font-medium">Markdown Cheat Sheet</summary>
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                            {toolbarButtons.map((button, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="flex items-center justify-center w-7 h-7 bg-gray-100 rounded">
                                        {button.icon}
                                    </div>
                                    <span className="text-gray-700">{button.label}</span>
                                </div>
                            ))}
                        </div>
                    </details>
                </div>
            )}
            
            <style jsx global>{`
                .mde-header {
                    display: none !important;
                }
                
                .mde-tabs {
                    display: none !important;
                }
                
                .mde-textarea-wrapper textarea {
                    min-height: 220px;
                    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
                    padding: 1rem;
                    font-size: 0.95rem;
                    line-height: 1.5;
                    resize: vertical;
                    border: none;
                    outline: none !important;
                    box-shadow: none !important;
                }
                
                .mde-preview {
                    min-height: 220px;
                    padding: 1rem;
                    font-family: inherit;
                }
                
                .react-mde {
                    border: none;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: none;
                }
                
                .markdown-preview h1, 
                .markdown-preview h2, 
                .markdown-preview h3, 
                .markdown-preview h4, 
                .markdown-preview h5, 
                .markdown-preview h6 {
                    font-weight: 600;
                    margin-top: 1.5rem;
                    margin-bottom: 1rem;
                    line-height: 1.25;
                }
                
                .markdown-preview h1 {
                    font-size: 2rem;
                    border-bottom: 1px solid #e5e7eb;
                    padding-bottom: 0.5rem;
                }
                
                .markdown-preview h2 {
                    font-size: 1.5rem;
                    border-bottom: 1px solid #e5e7eb;
                    padding-bottom: 0.5rem;
                }
                
                .markdown-preview h3 {
                    font-size: 1.25rem;
                }
                
                .markdown-preview p {
                    margin-bottom: 1rem;
                    line-height: 1.6;
                }
                
                .markdown-preview code {
                    background-color: #f3f4f6;
                    padding: 0.2rem 0.4rem;
                    border-radius: 0.25rem;
                    font-family: ui-monospace, monospace;
                    font-size: 0.9em;
                }
                
                .markdown-preview pre {
                    background-color: #f3f4f6;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    overflow-x: auto;
                    margin-bottom: 1rem;
                }
                
                .markdown-preview pre code {
                    background-color: transparent;
                    padding: 0;
                }
                
                .markdown-preview ul, .markdown-preview ol {
                    margin-left: 2rem;
                    margin-bottom: 1rem;
                }
                
                .markdown-preview a {
                    color: #3b82f6;
                    text-decoration: none;
                }
                
                .markdown-preview a:hover {
                    text-decoration: underline;
                }
                
                .markdown-preview blockquote {
                    border-left: 4px solid #e5e7eb;
                    padding-left: 1rem;
                    color: #6b7280;
                    margin-left: 0;
                    margin-right: 0;
                    margin-bottom: 1rem;
                }
                
                .markdown-preview img {
                    max-width: 100%;
                }
            `}</style>
        </div>
    );
};

export default MarkdownEditor;
