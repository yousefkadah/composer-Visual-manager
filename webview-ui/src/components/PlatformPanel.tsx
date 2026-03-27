import { useState, useEffect } from "react";
import { PlatformRequirement } from "../types";
import { postMessage } from "../hooks/useVsCodeApi";

const COMMON_EXTENSIONS = [
  "ext-mbstring", "ext-json", "ext-openssl", "ext-pdo", "ext-curl",
  "ext-gd", "ext-xml", "ext-zip", "ext-intl", "ext-bcmath",
  "ext-ctype", "ext-fileinfo", "ext-tokenizer", "ext-dom", "ext-redis",
];

interface Props {
  requirements: PlatformRequirement[];
}

function PlatformPanel({ requirements }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addConstraint, setAddConstraint] = useState("*");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (expanded) postMessage({ type: "requestPlatform" });
  }, [expanded]);

  const handleAdd = () => {
    if (!addName.trim()) return;
    postMessage({ type: "addPlatformReq", name: addName.trim(), constraint: addConstraint.trim() || "*" });
    setAddName("");
    setAddConstraint("*");
    setShowAdd(false);
  };

  const handleCheck = () => {
    setChecked(true);
    postMessage({ type: "checkPlatformReqs" });
  };

  const existingNames = new Set(requirements.map((r) => r.name));
  const suggestableExts = COMMON_EXTENSIONS.filter((e) => !existingNames.has(e));

  const statusIcon = (s?: string) => {
    if (s === "ok") return <span className="security-ok">&#x2714;</span>;
    if (s === "missing") return <span className="security-issue">&#x2718; Missing</span>;
    if (s === "mismatch") return <span style={{ color: "#f57c00" }}>&#x26A0; Mismatch</span>;
    return null;
  };

  return (
    <div className="panel-section">
      <div className="search-panel-header" onClick={() => setExpanded(!expanded)}>
        <span className="search-panel-toggle">{expanded ? "\u25BC" : "\u25B6"}</span>
        <span className="search-panel-title">
          Platform Requirements
          {requirements.length > 0 && <span className="scripts-count">{requirements.length}</span>}
        </span>
      </div>
      {expanded && (
        <div className="panel-body">
          <div className="panel-content">
            {requirements.length === 0 && (
              <div className="scripts-empty">No PHP or ext-* requirements defined.</div>
            )}
            {requirements.map((req) => (
              <div key={req.name} className="script-row">
                <div className="script-info">
                  <span className="script-name">{req.name}</span>
                  <code className="script-command">{req.constraint}</code>
                  {checked && req.status && (
                    <span style={{ marginLeft: 8 }}>
                      {statusIcon(req.status)}
                      {req.installed && <span className="form-hint" style={{ marginLeft: 4 }}>installed: {req.installed}</span>}
                    </span>
                  )}
                </div>
                <div className="script-actions">
                  <button className="action-btn action-uninstall" onClick={() => postMessage({ type: "removePlatformReq", name: req.name })} title="Remove">&#x1F5D1;</button>
                </div>
              </div>
            ))}

            <div className="panel-actions-row">
              <button className="btn btn-primary btn-sm" onClick={handleCheck}>Check Platform Reqs</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(!showAdd)}>+ Add Requirement</button>
            </div>

            {showAdd && (
              <div className="add-script-form" style={{ padding: "10px 0" }}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="search-input" placeholder="php or ext-mbstring" value={addName} onChange={(e) => setAddName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Constraint</label>
                  <input className="search-input" placeholder="^8.1 or *" value={addConstraint} onChange={(e) => setAddConstraint(e.target.value)} />
                </div>
                <div className="add-script-actions">
                  <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={!addName.trim()}>Add</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
                </div>
                {suggestableExts.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <span className="form-hint">Quick add:</span>
                    <div className="suggestion-scripts-preview" style={{ marginTop: 4 }}>
                      {suggestableExts.slice(0, 8).map((ext) => (
                        <code key={ext} className="suggestion-script-name" style={{ cursor: "pointer" }}
                          onClick={() => { setAddName(ext); setAddConstraint("*"); }}>
                          {ext}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PlatformPanel;
