export const metadata = {
  title: "GHRI",
  description: "Transforming Healthcare in the world",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div>{children}</div>
      </body>
    </html>
  );
}
