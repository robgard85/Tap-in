import "./globals.css"

export const metadata = {
  title: "Tap-In",
  description: "Realtime social matching",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
