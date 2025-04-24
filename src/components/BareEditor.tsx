"use client";

import React, { Suspense } from "react";
import type { FC } from "react";

const ReactQuill = React.lazy(() => import("react-quill-new"));

interface BareEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const BareEditor: FC<BareEditorProps> = ({
    value,
    onChange,
    placeholder = "Start typing...",
}) => {
    const handleChange = (newValue: string, _delta: any, source: string) => {
        if (source === "user") {
            onChange(newValue);
        }
    };

    return (
        <Suspense fallback={<div>Loading editor...</div>}>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="h-full w-full bg-white rounded-md p-2 overflow-auto"
            />
        </Suspense>
    );
};

export default BareEditor;
