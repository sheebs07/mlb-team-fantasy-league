import { useState, useEffect } from "react";

type Owner = {
  id: number;
  name: string;
  draftSlot: number;
};

type Settings = {
  id: number;
  draftType: string;
  rounds: number;
  commissionerPassword: string;
};

export default function SettingsPage() {
  const [authorized, setAuthorized] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passcode, setPasscode] = useState("");

  const [settings, setSettings] = useState<Settings | null>(null);
  const [draftType, setDraftType] = useState("snake");
  const [rounds, setRounds] = useState(5);

  const [owners, setOwners] = useState<Owner[]>([]);
  const [order, setOrder] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(false);

  // Load settings immediately (public visibility)
  useEffect(() => {
    const loadSettings = async () => {
      const res = await fetch("/api/getSettings");
      const data = await res.json();
      setSettings(data.settings);
      setDraftType(data.settings.draftType);
      setRounds(data.settings.rounds);
    };

    loadSettings();
  }, []);

  // Load owners only after authorization
  const loadOwners = async () => {
    const res = await fetch("/api/getOwners");
    const data = await res.json();

    const sorted = data.owners.sort(
      (a: any, b: any) => a.draftSlot - b.draftSlot
    );

    setOwners(sorted);
    setOrder(sorted);
  };

  const handleAuthorize = async () => {
    if (passcode === settings?.commissionerPassword) {
      setAuthorized(true);
      setShowPasswordPrompt(false);
      loadOwners();
    } else {
      alert("Incorrect passcode");
    }
  };

  const handleSaveSettings = async () => {
    if (!authorized) return;

    const res = await fetch("/api/updateSettings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        draftType,
        rounds
      })
    });

    if (!res.ok) {
      alert("Error saving settings");
      return;
    }

    alert("League settings saved!");
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

  const move = (index: number, direction: number) => {
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
    <div style={{ position: "relative" }}>
      {/* EDIT BUTTON (always visible) */}
      <button
        onClick={() => setShowPasswordPrompt(true)}
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          padding: "8px 12px",
          background: authorized ? "#4caf50" : "#0070f3",
          color: "white",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        {authorized ? "Editing Enabled" : "Edit"}
      </button>

      <h1 style={{ marginBottom: "20px" }}>Settings</h1>

      {/* ============================
          PASSWORD PROMPT MODAL
      ============================ */}
      {showPasswordPrompt && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
          }}
        >
          <div
            className="card"
            style={{
              padding: "20px",
              width: "350px",
              background: "white",
              borderRadius: "8px"
            }}
          >
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

            <button
              onClick={handleAuthorize}
              style={{
                padding: "8px 12px",
                background: "#0070f3",
                color: "white",
                borderRadius: "6px",
                cursor: "pointer",
                width: "100%"
              }}
            >
              Unlock
            </button>

            <button
              onClick={() => setShowPasswordPrompt(false)}
              style={{
                marginTop: "10px",
                padding: "6px 10px",
                width: "100%",
                background: "#ccc",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ============================
          EDITABLE SETTINGS (LOCKED UNTIL AUTHORIZED)
      ============================ */}
      <div
        className="card"
        style={{
          maxWidth: "500px",
          marginBottom: "30px",
          opacity: authorized ? 1 : 0.5,
          pointerEvents: authorized ? "auto" : "none"
        }}
      >
        <h2>Draft Configuration</h2>

        <label style={{ display: "block", marginBottom: "10px" }}>
          <strong>Draft Type</strong>
        </label>
        <select
          value={draftType}
          onChange={(e) => setDraftType(e.target.value)}
          style={{ padding: "8px", width: "200px", marginBottom: "20px" }}
        >
          <option value="snake">Snake</option>
          <option value="linear">Linear</option>
        </select>

        <label style={{ display: "block", marginBottom: "10px" }}>
          <strong>Number of Rounds</strong>
        </label>
        <input
          type="number"
          min={1}
          max={50}
          value={rounds}
          onChange={(e) => setRounds(parseInt(e.target.value))}
          style={{ padding: "8px", width: "200px" }}
        />

        <button
          onClick={handleSaveSettings}
          style={{
            marginTop: "20px",
            padding: "8px 12px",
            background: "#0070f3",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Save Settings
        </button>
      </div>

      {/* ============================
          RESET DRAFT (VISIBLE TO ALL, EDITABLE ONLY IF AUTHORIZED)
      ============================ */}
      <div
        className="card"
        style={{
          maxWidth: "400px",
          marginBottom: "30px",
          opacity: authorized ? 1 : 0.5,
          pointerEvents: authorized ? "auto" : "none"
        }}
      >
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

      {/* ============================
          DRAFT ORDER (VISIBLE TO ALL, EDITABLE ONLY IF AUTHORIZED)
      ============================ */}
      <div
        className="card"
        style={{
          maxWidth: "400px",
          opacity: authorized ? 1 : 0.5,
          pointerEvents: authorized ? "auto" : "none"
        }}
      >
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
    </div>
  );
}
