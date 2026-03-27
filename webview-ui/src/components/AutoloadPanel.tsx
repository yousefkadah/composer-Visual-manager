import { useState, useEffect } from "react";
import { AutoloadData, AutoloadConfig, MessageToWebview } from "../types";
import { postMessage } from "../hooks/useVsCodeApi";

interface Props {
  autoloadData: AutoloadData | null;
}

function AutoloadPanel({ autoloadData }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<"autoload" | "autoload-dev">("autoload");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addType, setAddType] = useState<"psr-4" | "classmap" | "files">("psr-4");
  const [addNamespace, setAddNamespace] = useState("");
  const [addPath, setAddPath] = useState("");

  useEffect(() => {
    if (expanded) postMessage({ type: "requestAutoload" });
  }, [expanded]);

  const data: AutoloadConfig | undefined =
    activeSection === "autoload" ? autoloadData?.autoload : autoloadData?.autoloadDev;

  const handleAdd = () => {
    if (!addPath.trim()) return;
    postMessage({
      type: "addAutoloadEntry",
      section: activeSection,
      entryType: addType,
      namespace: addType === "psr-4" ? addNamespace : undefined,
      path: addPath.trim(),
    });
    setAddNamespace("");
    setAddPath("");
    setShowAddForm(false);
  };

  const handleRemove = (entryType: "psr-4" | "classmap" | "files", ns: string | undefined, p: string) => {
    postMessage({ type: "removeAutoloadEntry", section: activeSection, entryType, namespace: ns, path: p });
  };

  const handleDump = (optimize: "none" | "classmap" | "authoritative" | "apcu") => {
    postMessage({ type: "dumpAutoload", optimize });
  };

  const totalEntries = autoloadData
    ? (autoloadData.autoload.psr4.length + autoloadData.autoload.classmap.length + autoloadData.autoload.files.length +
       autoloadData.autoloadDev.psr4.length + autoloadData.autoloadDev.classmap.length + autoloadData.autoloadDev.files.length)
    : 0;

  return (
    <div className="panel-section">
      <div className="search-panel-header" onClick={() => setExpanded(!expanded)}>
        <span className="search-panel-toggle">{expanded ? "\u25BC" : "\u25B6"}</span>
        <span className="search-panel-title">
          Autoload
          {totalEntries > 0 && <span className="scripts-count">{totalEntries}</span>}
        </span>
      </div>
      {expanded && (
        <div className="panel-body">
          <div className="source-tabs">
            <button className={`source-tab ${activeSection === "autoload" ? "active" : ""}`} onClick={() => setActiveSection("autoload")}>autoload</button>
            <button className={`source-tab ${activeSection === "autoload-dev" ? "active" : ""}`} onClick={() => setActiveSection("autoload-dev")}>autoload-dev</button>
          </div>

          <div className="panel-content">
            {/* PSR-4 */}
            {data && data.psr4.length > 0 && (
              <div className="autoload-group">
                <div className="autoload-group-title">PSR-4</div>
                {data.psr4.map((e) => (
                  <div key={e.namespace} className="autoload-row">
                    <code className="autoload-ns">{e.namespace}</code>
                    <span className="autoload-arrow">{"\u2192"}</span>
                    <code className="autoload-path">{e.path}</code>
                    <button className="action-btn action-uninstall" onClick={() => handleRemove("psr-4", e.namespace, e.path)} title="Remove">&#x1F5D1;</button>
                  </div>
                ))}
              </div>
            )}

            {/* Classmap */}
            {data && data.classmap.length > 0 && (
              <div className="autoload-group">
                <div className="autoload-group-title">Classmap</div>
                {data.classmap.map((p) => (
                  <div key={p} className="autoload-row">
                    <code className="autoload-path">{p}</code>
                    <button className="action-btn action-uninstall" onClick={() => handleRemove("classmap", undefined, p)} title="Remove">&#x1F5D1;</button>
                  </div>
                ))}
              </div>
            )}

            {/* Files */}
            {data && data.files.length > 0 && (
              <div className="autoload-group">
                <div className="autoload-group-title">Files</div>
                {data.files.map((p) => (
                  <div key={p} className="autoload-row">
                    <code className="autoload-path">{p}</code>
                    <button className="action-btn action-uninstall" onClick={() => handleRemove("files", undefined, p)} title="Remove">&#x1F5D1;</button>
                  </div>
                ))}
              </div>
            )}

            {data && data.psr4.length === 0 && data.classmap.length === 0 && data.files.length === 0 && (
              <div className="scripts-empty">No autoload entries in {activeSection}.</div>
            )}

            {/* Add entry */}
            {!showAddForm ? (
              <div className="panel-actions-row">
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAddForm(true)}>+ Add Entry</button>
              </div>
            ) : (
              <div className="add-script-form" style={{ padding: "10px 0" }}>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="filter-select" value={addType} onChange={(e) => setAddType(e.target.value as any)}>
                    <option value="psr-4">PSR-4</option>
                    <option value="classmap">Classmap</option>
                    <option value="files">Files</option>
                  </select>
                </div>
                {addType === "psr-4" && (
                  <div className="form-group">
                    <label className="form-label">Namespace <span className="form-optional">(must end with \\)</span></label>
                    <input className="search-input" placeholder='App\\' value={addNamespace} onChange={(e) => setAddNamespace(e.target.value)} />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">{addType === "files" ? "File Path" : "Directory Path"}</label>
                  <input className="search-input" placeholder={addType === "files" ? "src/helpers.php" : "src/"} value={addPath} onChange={(e) => setAddPath(e.target.value)} />
                </div>
                <div className="add-script-actions">
                  <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={!addPath.trim()}>Add</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowAddForm(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* Dump Autoload */}
          <div className="dump-autoload-section">
            <span className="autoload-group-title">Dump Autoload</span>
            <div className="dump-buttons">
              <button className="btn btn-secondary btn-sm" onClick={() => handleDump("none")}>Normal</button>
              <button className="btn btn-secondary btn-sm" onClick={() => handleDump("classmap")}>Optimized (-o)</button>
              <button className="btn btn-secondary btn-sm" onClick={() => handleDump("authoritative")}>Authoritative (-a)</button>
              <button className="btn btn-secondary btn-sm" onClick={() => handleDump("apcu")}>APCu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AutoloadPanel;
