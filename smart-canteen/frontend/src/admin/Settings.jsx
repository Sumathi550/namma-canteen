import React, { useState, useEffect } from "react";
import { Clock, Volume2, Save, LoaderCircle, CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";

export default function Settings({ settings, onSaveSettings, loading }) {
  const [isOpen, setIsOpen] = useState(true);
  const [orderAcceptance, setOrderAcceptance] = useState(true);
  const [openingTime, setOpeningTime] = useState("08:00 AM");
  const [closingTime, setClosingTime] = useState("06:30 PM");
  const [announcement, setAnnouncement] = useState("");
  const [pickupSlots, setPickupSlots] = useState([]);
  const [newSlot, setNewSlot] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setIsOpen(settings.isOpen !== false);
      setOrderAcceptance(settings.orderAcceptance !== false);
      setOpeningTime(settings.openingTime || "08:00 AM");
      setClosingTime(settings.closingTime || "06:30 PM");
      setAnnouncement(settings.announcement || "");
      setPickupSlots(settings.pickupSlots || []);
    }
  }, [settings]);

  function handleAddSlot() {
    if (!newSlot.trim()) return;
    setPickupSlots((prev) => [...prev, newSlot.trim()]);
    setNewSlot("");
  }

  function handleRemoveSlot(index) {
    setPickupSlots((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaveSuccess(false);

    await onSaveSettings({
      isOpen,
      orderAcceptance,
      openingTime,
      closingTime,
      announcement: announcement.trim(),
      pickupSlots,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  return (
    <div className="admin-settings-view">
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Canteen Operational Controls</h3>
            <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
              Configure live operating hours, order acceptance and announcements
            </span>
          </div>

          {saveSuccess && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#16a34a", fontSize: "0.85rem", fontWeight: 600 }}>
              <CheckCircle2 size={16} />
              <span>Settings updated successfully!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Master Order Switches */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", padding: "1.25rem", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <strong style={{ fontSize: "0.95rem" }}>Canteen Kitchen Status</strong>
                  <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#64748b" }}>
                    Toggle overall kitchen open or closed for the day
                  </p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={isOpen}
                    onChange={(e) => setIsOpen(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <strong style={{ fontSize: "0.95rem" }}>Online Pre-Order Acceptance</strong>
                  <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#64748b" }}>
                    Pause incoming orders during kitchen rush
                  </p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={orderAcceptance}
                    onChange={(e) => setOrderAcceptance(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            {/* Operating Times */}
            <div className="form-grid-2">
              <div className="admin-form-group">
                <label>Opening Time</label>
                <input
                  type="text"
                  placeholder="08:00 AM"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Closing Time</label>
                <input
                  type="text"
                  placeholder="06:30 PM"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                />
              </div>
            </div>

            {/* Announcement Banner Editor */}
            <div className="admin-form-group">
              <label>Campus Announcement Banner</label>
              <textarea
                rows={3}
                placeholder="Message shown at top of the student menu..."
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
              />
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                This message appears dynamically on all students' screens.
              </span>
            </div>

            {/* Pickup Slots Management */}
            <div className="admin-form-group">
              <label>Available Pickup Time Slots</label>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <input
                  type="text"
                  placeholder="e.g. 02:00 PM - 02:30 PM (Afternoon)"
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn-sm primary"
                  onClick={handleAddSlot}
                >
                  <Plus size={15} />
                  <span>Add Slot</span>
                </button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {pickupSlots.map((slot, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#f1f5f9",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                    }}
                  >
                    <span>{slot}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(index)}
                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                className="btn-sm primary"
                style={{ padding: "0.65rem 1.5rem", fontSize: "0.95rem" }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoaderCircle size={16} className="spin" />
                    <span>Saving Settings...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Apply Operational Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
