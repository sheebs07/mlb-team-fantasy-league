import Link from "next/link";
import "../app/globals.css"; // keep your global styles

export default function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
        <Link href="/" style={{ marginRight: "15px" }}>Home</Link>
        <Link href="/draft" style={{ marginRight: "15px" }}>Draft</Link>
        <Link href="/standings" style={{ marginRight: "15px" }}>Standings</Link>
        <Link href="/owners" style={{ marginRight: "15px" }}>Owners</Link>
        <Link href="/teams">Teams</Link>
      </nav>

      <main style={{ padding: "20px" }}>
        <Component {...pageProps} />
      </main>
    </div>
  );
}
