"use client";

import React, { useState, FC } from "react";
import dynamic from "next/dynamic";

const ReactMde = dynamic(() => import("react-mde"), {
    ssr: false,
    loading: () => <div>Loading editor...</div>,
});
const ReactMarkdown = dynamic(() => import("react-markdown"), {
    ssr: false,
    loading: () => <div>Loading preview...</div>,
});

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const MarkdownEditor: FC<MarkdownEditorProps> = ({
    value,
    onChange,
    placeholder = "Start typing...",
}) => {
    const [content, setContent] = useState<string>(value);
    const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");

    const handleChange = (newValue: string) => {
        setContent(newValue);
        onChange(newValue);
    };

    return (
        <div className="h-full w-full bg-white rounded-md p-2 overflow-auto">
            <ReactMde
                value={content}
                onChange={handleChange}
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
                generateMarkdownPreview={(markdown) =>
                    Promise.resolve(<ReactMarkdown>{markdown}</ReactMarkdown>)
                }
            // placeholder={String(placeholder)}
            />
        </div>
    );
};

export default MarkdownEditor;
