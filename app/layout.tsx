import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Invisible Borders - Share Your Story Anonymously',
    description: 'A safe, anonymous platform to share experiences and receive support. Breaking down invisible borders through human connection.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    )
}
