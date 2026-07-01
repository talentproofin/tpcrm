import "./globals.css";

export const metadata = {
  title: "TalentProof Sales CRM",
  description: "Internal Sales CRM for TalentProof",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
