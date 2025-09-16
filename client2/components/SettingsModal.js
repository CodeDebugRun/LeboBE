import React from 'react';

const SettingsModal = ({
  showSettings,
  darkMode,
  showIdentnrColumn,
  onToggleDarkMode,
  onToggleIdentnrColumn,
  onClose
}) => {
  if (!showSettings) {
    return null;
  }

  return (
    <section className="settings-section">
      <h3>⚙️ Einstellungen</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={onToggleDarkMode}
              className="setting-checkbox"
            />
            <span className="setting-text">
              {darkMode ? '🌙' : '☀️'} Dark Mode
            </span>
          </label>
        </div>
        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={showIdentnrColumn}
              onChange={onToggleIdentnrColumn}
              className="setting-checkbox"
            />
            <span className="setting-text">
              👁️ Ident-Nr. Spalte anzeigen
            </span>
          </label>
        </div>
      </div>
      <div className="settings-actions">
        <button
          className="btn btn-secondary"
          onClick={onClose}
        >
          ✅ Schließen
        </button>
      </div>
    </section>
  );
};

export default SettingsModal;