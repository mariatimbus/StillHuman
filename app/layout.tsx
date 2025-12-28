import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Still Human - Share Your Story Anonymously',
    description: 'A safe, anonymous platform to share experiences of harassment and receive support.',
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
