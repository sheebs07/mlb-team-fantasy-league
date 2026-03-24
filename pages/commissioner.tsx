import { useState } from "react";

export default function CommissionerPage() {
  const [passcode, setPasscode] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);

  const correctPasscode = "commissioner123"; // change this anytime

  const handleAuthorize = () => {
    if (passcode === correctPasscode) {
      setAuthorized(true);
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
        <div className="card" style={{ maxWidth: "400px" }}>
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
      )}
    </div>
  );
}
