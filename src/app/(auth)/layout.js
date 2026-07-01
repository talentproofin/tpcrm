export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 sm:p-6">
      {children}
    </div>
  );
}
