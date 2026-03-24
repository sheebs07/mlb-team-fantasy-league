import { useState, useEffect } from "react";

type Owner = {
  id: number;
  name: string;
  draftSlot: number;
};

export default function CommissionerPage() {
  const [passcode, setPasscode] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);

  const [owners, setOwners] = useState<Owner[]>([]);
  const [order, setOrder] = useState<Owner[]>([]);

  const correctPasscode = "commissioner123"; // change this anytime

  const handleAuthorize = async () => {
    if (passcode === correctPasscode) {
      setAuthorized(true);

      // Load owners once authorized
      const res = await fetch("/api/getOwners");
      const data = await res.json();

      // Sort by draftSlot
      const sorted = data.owners.sort((a: any, b: any) => a.draftSlot - b.draftSlot);
      setOwners(sorted);
      setOrder(sorted);
    } else {
      alert("Incorrect passcode");
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset the draft?")) return;

    setLoading(true);
    const res = await fetch("/api/resetDraft", { method: "POST" });
    setLoading(false);

    if (!res.ok) {
      alert("Error resetting draft");
      return;
    }

    alert("Draft has been reset");
    window.location.reload();
  };

  // Move owner up/down in draft order
  const move = (index: any, direction: any) => {
    const newOrder = [...order];
    const target = index + direction;

    if (target < 0 || target >= newOrder.length) return;

    [newOrder[index], newOrder[target]] = [
      newOrder[target],
      newOrder[index]
    ];

    setOrder(newOrder);
  };

  const saveOrder = async () => {
    await fetch("/api/setDraftOrder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: order.map((o, i) => ({
          ownerId: o.id,
          draftSlot: i + 1
        }))
      })
    });

    alert("Draft order saved!");
  };

  return (
    <div>
      <h1 style={{ marginBottom: "20px" }}>Commissioner Tools</h1>

      {!authorized ? (
        <div className="card" style={{ maxWidth: "400px" }}>
          <h2>Enter Commissioner Passcode</h2>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Passcode"
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "10px",
              marginBottom: "10px"
            }}
          />
          <button onClick={handleAuthorize} style={{ padding: "8px 12px" }}>
            Unlock
          </button>
        </div>
      ) : (
        <>
          {/* RESET DRAFT CARD */}
          <div className="card" style={{ maxWidth: "400px", marginBottom: "30px" }}>
            <h2>Reset Draft</h2>
            <p style={{ color: "#555" }}>
              This will delete all draft picks and restart the draft from Pick 1.
            </p>

            <button
              onClick={handleReset}
              disabled={loading}
              style={{
                padding: "10px 14px",
                background: "#b00020",
                color: "white",
                borderRadius: "6px",
                cursor: "pointer",
                marginTop: "10px"
              }}
            >
              {loading ? "Resetting…" : "Reset Draft"}
            </button>
          </div>

          {/* SET DRAFT ORDER CARD */}
          <div className="card" style={{ maxWidth: "400px" }}>
            <h2>Set Draft Order (First 6 Picks)</h2>
            <p style={{ color: "#555", marginBottom: "10px" }}>
              Reorder owners for picks 1–6. The rest of the draft will follow snake logic.
            </p>

            {order.map((owner, index) => (
              <div
                key={owner.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "8px"
                }}
              >
                <strong>{index + 1}.</strong>
                <span style={{ width: "200px" }}>{owner.name}</span>

                <button onClick={() => move(index, -1)}>↑</button>
                <button onClick={() => move(index, 1)}>↓</button>
              </div>
            ))}

            <button
              onClick={saveOrder}
              style={{
                marginTop: "15px",
                padding: "8px 12px",
                background: "#0070f3",
                color: "white",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Save Draft Order
            </button>
          </div>
        </>
      )}
    </div>
  );
}
