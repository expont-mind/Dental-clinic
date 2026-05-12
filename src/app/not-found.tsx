import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <html lang="mn">
      <body
        style={{
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          margin: 0,
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #ecf5f3 0%, #e3eeeb 50%, #f1f7f5 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: "560px",
            textAlign: "center",
            color: "#0a1714",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.22em",
              color: "#1a8478",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            ◦ 404
          </p>
          <h1
            style={{
              fontSize: "44px",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              margin: "12px 0 0",
            }}
          >
            Хуудас олдсонгүй
          </h1>
          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.6,
              color: "#5b6c66",
              marginTop: "20px",
              marginBottom: "32px",
            }}
          >
            Таны хайсан хуудас байхгүй эсвэл хаягийг шилжүүлсэн байж магадгүй.
          </p>
          <Link
            href="/mn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "9999px",
              background: "#1a8478",
              color: "white",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Нүүр хуудас →
          </Link>
        </div>
      </body>
    </html>
  );
}
