import { useState } from "react";
import { HealthCheck } from "../types";
import { postMessage } from "../hooks/useVsCodeApi";

interface Props {
  checks: HealthCheck[];
}

function HealthPanel({ checks }: Props) {
  const [expanded, setExpanded] = useState(false);

  const statusIcon = (s: string) => {
    if (s === "ok") return <span className="health-ok">&#x2714;</span>;
    if (s === "warning") return <span className="health-warn">&#x26A0;</span>;
    return <span className="health-error">&#x2718;</span>;
  };

  const okCount = checks.filter((c) => c.status === "ok").length;
  const warnCount = checks.filter((c) => c.status === "warning").length;
  const errCount = checks.filter((c) => c.status === "error").length;

  return (
    <div className="panel-section">
      <div className="search-panel-header" onClick={() => setExpanded(!expanded)}>
        <span className="search-panel-toggle">{expanded ? "\u25BC" : "\u25B6"}</span>
        <span className="search-panel-title">
          Project Health
          {checks.length > 0 && (
            <span className="health-summary">
              {okCount > 0 && <span className="health-ok">{okCount} &#x2714;</span>}
              {warnCount > 0 && <span className="health-warn" style={{ marginLeft: 6 }}>{warnCount} &#x26A0;</span>}
              {errCount > 0 && <span className="health-error" style={{ marginLeft: 6 }}>{errCount} &#x2718;</span>}
            </span>
          )}
        </span>
      </div>
      {expanded && (
        <div className="panel-body">
          <div className="panel-actions-row" style={{ padding: "10px 14px", borderBottom: "1px solid var(--vscode-panel-border, #333)" }}>
            <button className="btn btn-primary btn-sm" onClick={() => postMessage({ type: "runValidate" })}>Validate</button>
            <button className="btn btn-secondary btn-sm" onClick={() => postMessage({ type: "runDiagnose" })}>Diagnose</button>
          </div>
          <div className="panel-content">
            {checks.length === 0 && (
              <div className="scripts-empty">Click Validate or Diagnose to check project health.</div>
            )}
            {checks.map((check, i) => (
              <div key={i} className={`health-row health-${check.status}`}>
                <span className="health-icon">{statusIcon(check.status)}</span>
                <div className="health-info">
                  <span className="health-label">{check.label}</span>
                  <span className="health-message">{check.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default HealthPanel;
