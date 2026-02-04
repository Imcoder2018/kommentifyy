export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Admin Login</title>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
