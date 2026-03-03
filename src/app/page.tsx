export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-bg text-text px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-4xl font-bold">Tap-In</h1>
        <p className="text-muted">
          Real-time social matching. Signal. Connect. Move.
        </p>

        <div className="space-y-3 pt-6">
          <a
            href="/signup"
            className="block w-full bg-accent text-white py-3 rounded-xl"
          >
            Create Account
          </a>

          <a
            href="/login"
            className="block w-full border border-line py-3 rounded-xl"
          >
            Log In
          </a>
        </div>
      </div>
    </main>
  );
}
