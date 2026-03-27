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
  pickClockSeconds: number;
  warningSeconds: number;
};

export default function SettingsPage() {
  const [authorized, setAuthorized] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passcode, setPasscode] = useState("");

  const [settings, setSettings] = useState<Settings | null>(null);
  const [draftType, setDraftType] = useState("snake");
  const [rounds, setRounds] = useState(5);
  const [pickClockSeconds, setPickClockSeconds] = useState(60);
  const [warningSeconds, setWarningSeconds] = useState(15);

  const [owners, setOwners] = useState<Owner[]>([]);
  const [order, setOrder] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(false);

  // ============================
  // LOAD SETTINGS + PUBLIC DRAFT ORDER
  // ============================
  useEffect(() => {
    const loadSettings = async () => {
      const res = await fetch("/api/getSettings");
      const data = await res.json();

      setSettings(data.settings);
      setDraftType(data.settings.draftType);
      setRounds(data.settings.rounds);
      setPickClockSeconds(data.settings.pickClockSeconds);
      setWarningSeconds(data.settings.warningSeconds);

      // Load owners publicly (sorted by draftSlot)
      const ownersRes = await fetch("/api/getOwners");
      const ownersData = await ownersRes.json();

      const sorted = ownersData.owners.sort(
        (a: Owner, b: Owner) => a.draftSlot - b.draftSlot
      );

      setOwners(sorted); // visible to everyone
    };

    loadSettings();
  }, []);

  // ============================
  // LOAD OWNERS FOR EDITING
  // ============================
  const loadOwnersForEditing = async () => {
    const res = await fetch("/api/getOwners");
    const data = await res.json();

    const sorted = data.owners.sort(
      (a: Owner, b: Owner) => a.draftSlot - b.draftSlot
    );

    setOwners(sorted);
    setOrder(sorted);
  };

  const handleAuthorize = async () => {
    if (passcode === settings?.commissionerPassword) {
      setAuthorized(true);
      setShowPasswordPrompt(false);
      loadOwnersForEditing();
    } else {
      alert("Incorrect passcode");
    }
  };

  // ============================
  // SAVE SETTINGS
  // ============================
  const handleSaveSettings = async () => {
    if (!authorized) return;

    const res = await fetch("/api/updateSettings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        draftType,
        rounds,
        pickClockSeconds,
        warningSeconds
      })
    });

    if (!res.ok) {
      alert("Error saving settings");
      return;
    }

    alert("League settings saved!");
  };

  // ============================
  // RESET DRAFT
  // ============================
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

  // ============================
  // EDIT DRAFT ORDER
  // ============================
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
      {/* EDIT BUTTON */}
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
          PASSWORD PROMPT
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
          TWO-COLUMN LAYOUT
      ============================ */}
      <div
        style={{
          display: "flex",
          gap: "30px",
          alignItems: "flex-start",
          marginBottom: "40px",
          flexWrap: "wrap"
        }}
      >
        {/* LEFT COLUMN: Draft Configuration + Reset Draft */}
        <div
          style={{
            flex: "1",
            minWidth: "300px",
            maxWidth: "300px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}
        >
          {/* Draft Configuration */}
          <div
            className="card"
            style={{
              opacity: authorized ? 1 : 0.5,
              pointerEvents: authorized ? "auto" : "none"
            }}
          >
            <h2>Draft Configuration</h2>

            <label style={{ display: "block", marginTop: "10px", marginBottom: "0px" }}>
              <strong>Draft Type</strong>
            </label>
            <select
              value={draftType}
              onChange={(e) => setDraftType(e.target.value)}
              style={{ padding: "8px", width: "200px", marginBottom: "10px" }}
            >
              <option value="snake">Snake</option>
              <option value="linear">Linear</option>
            </select>

            <label style={{ display: "block", marginBottom: "0px" }}>
              <strong>Number of Rounds</strong>
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={rounds}
              onChange={(e) => setRounds(parseInt(e.target.value))}
              style={{ padding: "8px", width: "200px", marginBottom: "10px" }}
            />

            <label style={{ display: "block", marginBottom: "0px" }}>
              <strong>Pick Clock (seconds)</strong>
            </label>
            <input
              type="number"
              min={10}
              max={600}
              value={pickClockSeconds}
              onChange={(e) => setPickClockSeconds(parseInt(e.target.value))}
              style={{ padding: "8px", width: "200px", marginBottom: "10px" }}
            />

            <label style={{ display: "block", marginBottom: "0px" }}>
              <strong>Warning Threshold (seconds)</strong>
            </label>
            <input
              type="number"
              min={5}
              max={300}
              value={warningSeconds}
              onChange={(e) => setWarningSeconds(parseInt(e.target.value))}
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

          {/* Reset Draft (NOW DIRECTLY UNDER CONFIGURATION) */}
          <div
            className="card"
            style={{
              maxWidth: "300px",
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
        </div>

        {/* RIGHT COLUMN: Public Draft Order + Editable Draft Order */}
        <div
          style={{
            flex: "1",
            minWidth: "250px",
            maxWidth: "300px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}
        >
          {/* PUBLIC DRAFT ORDER */}
          <div className="card">
            <h2>Draft Order</h2>
            <p style={{ color: "#555", marginBottom: "10px" }}>
              This is the official draft order for Round 1.
            </p>

            <ol style={{ paddingLeft: "20px" }}>
              {owners.map((owner) => (
                <li key={owner.id} style={{ marginBottom: "4px" }}>
                  {owner.name}
                </li>
              ))}
            </ol>
          </div>

          {/* EDITABLE DRAFT ORDER */}
          <div
            className="card"
            style={{
              opacity: authorized ? 1 : 0.5,
              pointerEvents: authorized ? "auto" : "none"
            }}
          >
            <h2>Set Draft Order</h2>
            <p style={{ color: "#555", marginBottom: "10px" }}>
              Reorder owners for picks 1–N of the 1st round only. The rest of the draft will follow
              linear or snake logic based upon the selected Draft Type.
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
      </div>
    </div>
  );
}
