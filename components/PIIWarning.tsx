'use client';

import { useState, useEffect } from 'react';
import { detectPII } from '@/lib/redaction';

interface PIIWarningProps {
    text: string;
}

export default function PIIWarning({ text }: PIIWarningProps) {
    const [warnings, setWarnings] = useState<string[]>([]);

    useEffect(() => {
        if (text && text.length > 0) {
            const detected = detectPII(text);
            setWarnings(detected);
        } else {
            setWarnings([]);
        }
    }, [text]);

    if (warnings.length === 0) {
        return null;
    }

    return (
        <div className="safety-warning rounded-lg">
            <div className="flex items-start">
                <svg
                    className="w-5 h-5 text-warning mr-3 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                    />
                </svg>
                <div>
                    <h4 className="font-semibold text-warning mb-1">
                        Potential Identifying Information Detected
                    </h4>
                    <ul className="text-sm text-text-primary list-disc list-inside">
                        {warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                        ))}
                    </ul>
                    <p className="text-sm text-text-primary mt-2">
                        We&apos;ve detected potential personal information in your story: please review your story before submitting.
                    </p>
                </div>
            </div>
        </div>
    );
}
