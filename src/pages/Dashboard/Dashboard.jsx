import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useIsMobile } from "../../hooks/useIsMobile";
import { getMyVehicles, getMyListings, updateListing, deleteListing } from "../../services/api";

const s = {
  page: { maxWidth: 900, margin: "0 auto", padding: "40px 24px" },
  pageMobile: { padding: "20px 16px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 },
  headerMobile: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 800, color: "#111827", letterSpacing: "-.5px" },
  titleMobile: { fontSize: 20, fontWeight: 800, color: "#111827", letterSpacing: "-.5px" },
  sub: { color: "#6b7280", fontSize: 14, marginTop: 2 },
  btn: { padding: "10px 20px", background: "#1a4d2e", color: "#fff",
    border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnMobile: { padding: "8px 14px", background: "#1a4d2e", color: "#fff",
    border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  tabs: { display: "flex", gap: 4, marginBottom: 24, borderBottom: "2px solid #f3f4f6", overflowX: "auto" },
  tab: { padding: "10px 18px", fontSize: 14, fontWeight: 500, cursor: "pointer",
    border: "none", background: "transparent", color: "#6b7280",
    borderBottom: "3px solid transparent", whiteSpace: "nowrap" },
  tabMobile: { padding: "8px 12px", fontSize: 13, fontWeight: 500, cursor: "pointer",
    border: "none", background: "transparent", color: "#6b7280",
    borderBottom: "3px solid transparent", whiteSpace: "nowrap" },
  tabActive: { color: "#1a4d2e", borderBottom: "3px solid #1a4d2e" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 },
  statsRowMobile: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 20 },
  stat: { background: "#fff", borderRadius: 12, padding: "18px 20px",
    boxShadow: "0 1px 4px rgba(0,0,0,.06)", textAlign: "center", border: "1px solid #f3f4f6" },
  statMobile: { background: "#fff", borderRadius: 10, padding: "12px 8px",
    boxShadow: "0 1px 4px rgba(0,0,0,.06)", textAlign: "center", border: "1px solid #f3f4f6" },
  statNum: { fontSize: 28, fontWeight: 800, color: "#1a4d2e" },
  statNumMobile: { fontSize: 20, fontWeight: 800, color: "#1a4d2e" },
  statLabel: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  statLabelMobile: { fontSize: 10, color: "#6b7280", marginTop: 2 },
  card: { background: "#fff", borderRadius: 12, padding: 20,
    boxShadow: "0 1px 4px rgba(0,0,0,.06)", marginBottom: 14,
    display: "flex", justifyContent: "space-between", alignItems: "center",
    border: "1px solid #f3f4f6" },
  cardMobile: { background: "#fff", borderRadius: 12, padding: 14,
    boxShadow: "0 1px 4px rgba(0,0,0,.06)", marginBottom: 10, border: "1px solid #f3f4f6" },
  statusBadge: { display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  active: { background: "#dcfce7", color: "#166534" },
  draft: { background: "#fef9c3", color: "#854d0e" },
  paused: { background: "#f3f4f6", color: "#6b7280" },
  btnRow: { display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" },
  btnAction: { padding: "6px 14px", background: "transparent",
    border: "1.5px solid #e5e7eb", color: "#374151", borderRadius: 8, fontSize: 12, cursor: "pointer" },
  btnDanger: { padding: "6px 14px", background: "transparent",
    border: "1.5px solid #fecaca", color: "#dc2626", borderRadius: 8, fontSize: 12, cursor: "pointer" },
  empty: { textAlign: "center", padding: "40px 0", color: "#9ca3af" },
  spinner: { textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: 13 },
};

const STATUS_LABELS = { ACTIVE: "Activo", DRAFT: "Borrador", PAUSED: "Pausado", DELETED: "Eliminado" };
const STATUS_STYLES = { ACTIVE: s.active, DRAFT: s.draft, PAUSED: s.paused, DELETED: s.paused };

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const [tab, setTab] = useState("listings");
  const [vehicles, setVehicles] = useState([]);
  const [listings, setListings] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    getMyVehicles()
      .then(setVehicles)
      .catch(() => setVehicles([]))
      .finally(() => setLoadingVehicles(false));

    getMyListings()
      .then((data) => setListings(Array.isArray(data) ? data.filter((l) => l.status !== "DELETED") : []))
      .catch(() => setListings([]))
      .finally(() => setLoadingListings(false));
  }, []);

  const toggleListingStatus = async (listing) => {
    const newStatus = listing.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const updated = await updateListing(listing.id, { status: newStatus });
      setListings((prev) => prev.map((l) => (l.id === listing.id ? { ...l, status: updated.status } : l)));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm("¿Eliminar este listing?")) return;
    try {
      await deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={isMobile ? s.pageMobile : s.page}>
      <div style={isMobile ? s.headerMobile : s.header}>
        <div>
          <div style={isMobile ? s.titleMobile : s.title}>
            Hola, {user?.firstName || user?.name?.split(" ")[0] || ""}
          </div>
          <div style={s.sub}>Panel de control</div>
        </div>
        <button style={isMobile ? s.btnMobile : s.btn} onClick={() => navigate("/publish")}>
          + Publicar
        </button>
      </div>

      <div style={isMobile ? s.statsRowMobile : s.statsRow}>
        {[
          [vehicles.length, "Vehículos"],
          [listings.length, "Listings"],
          [listings.filter((l) => l.status === "ACTIVE").length, "Publicados"],
        ].map(([num, label]) => (
          <div key={label} style={isMobile ? s.statMobile : s.stat}>
            <div style={isMobile ? s.statNumMobile : s.statNum}>{num}</div>
            <div style={isMobile ? s.statLabelMobile : s.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      <div style={s.tabs}>
        {[["listings", "Mis listings"], ["vehicles", "Mis vehículos"]].map(([k, l]) => (
          <button key={k}
            style={{ ...(isMobile ? s.tabMobile : s.tab), ...(tab === k ? s.tabActive : {}) }}
            onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === "listings" && (
        loadingListings ? (
          <div style={s.spinner}>Cargando listings...</div>
        ) : listings.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 13, marginBottom: 16, color: "#9ca3af" }}>
              Todavía no publicaste ningún listing.
            </div>
            <button style={s.btn} onClick={() => navigate("/publish")}>
              Publicar mi primer auto
            </button>
          </div>
        ) : listings.map((listing) => (
          isMobile ? (
            <div key={listing.id} style={s.cardMobile}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                {listing.title}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                {listing.locationText} · ${Number(listing.pricePerDay).toLocaleString()}/día
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ ...s.statusBadge, ...(STATUS_STYLES[listing.status] || s.paused), fontSize: 11 }}>
                  {STATUS_LABELS[listing.status] || listing.status}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={s.btnAction} onClick={() => toggleListingStatus(listing)}>
                    {listing.status === "ACTIVE" ? "Pausar" : "Activar"}
                  </button>
                  <button style={s.btnDanger} onClick={() => handleDeleteListing(listing.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div key={listing.id} style={s.card}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                  {listing.title}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  {listing.locationText} · ${Number(listing.pricePerDay).toLocaleString()}/día
                </div>
                <div style={s.btnRow}>
                  <button style={s.btnAction} onClick={() => toggleListingStatus(listing)}>
                    {listing.status === "ACTIVE" ? "Pausar" : "Activar"}
                  </button>
                  <button style={s.btnDanger} onClick={() => handleDeleteListing(listing.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
              <span style={{ ...s.statusBadge, ...(STATUS_STYLES[listing.status] || s.paused) }}>
                {STATUS_LABELS[listing.status] || listing.status}
              </span>
            </div>
          )
        ))
      )}

      {tab === "vehicles" && (
        loadingVehicles ? (
          <div style={s.spinner}>Cargando vehículos...</div>
        ) : vehicles.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 13 }}>No tenés vehículos registrados.</div>
          </div>
        ) : vehicles.map((v) => (
          <div key={v.id} style={isMobile ? s.cardMobile : s.card}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: isMobile ? 14 : 15, marginBottom: 4 }}>
                {v.brand} {v.model} {v.year}
              </div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                {v.transmission} · {v.fuelType}
                {v.color && ` · ${v.color}`}
                {v.plate && ` · ${v.plate}`}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}