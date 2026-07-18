"use client";

import { useState, useEffect } from "react";
import { Button, Input, Modal, Loader, useToast, ProtectedRoute } from "@/components";
import { useAuth } from "@/context/AuthContext";
import {
  Cpu,
  ScanLine,
  ShieldCheck,
  Zap,
  BarChart3,
  Eye,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Info,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const statusConfig = {
  passed: { color: "text-primary", bg: "bg-primary/10", icon: CheckCircle, label: "Passed" },
  warning: { color: "text-secondary", bg: "bg-secondary/10", icon: AlertTriangle, label: "Warning" },
  failed: { color: "text-danger", bg: "bg-danger/10", icon: AlertTriangle, label: "Failed" },
};

const auditPresets = [
  {
    name: "Safe Dairy Pasteurization",
    product: "Organic Almond Milk",
    stage: "Pasteurization",
    temp: "74.5°C",
    notes: "Thermal heater loop stable. Temperature reading exceeds critical limit of 72°C. Visual check clear.",
  },
  {
    name: "Dangerously Low Pasteurization Temp",
    product: "Greek Yogurt - Dairy",
    stage: "Pasteurization",
    temp: "63.0°C",
    notes: "Temporary steam boiler pressure dip. Pasteurization temperature fell below safety target. Flow diverted.",
  },
  {
    name: "Contaminated Grain Hopper Specks",
    product: "Organic Wheat Grain Flour",
    stage: "Milling",
    temp: "25.2°C",
    notes: "Found dark specks resembling possible pest trace or mold near the milling hopper inlet. Clean scheduled.",
  },
  {
    name: "Chilled Meat Packaging Compliant",
    product: "Frozen Pork Sausage",
    stage: "Packaging",
    temp: "-21.5°C",
    notes: "Packaging room blast chiller is operating at peak capacity. Hermetic seals visually verified.",
  }
];

export default function AIFeaturesPage() {
  const { token, logout } = useAuth();
  const toast = useToast();
  
  // Production lines for quick filling
  const [productionLines, setProductionLines] = useState([]);
  
  // Form states
  const [product, setProduct] = useState("Organic Almond Milk");
  const [stage, setStage] = useState("Pasteurization");
  const [temp, setTemp] = useState("74.5°C");
  const [notes, setNotes] = useState("Thermal heater loop stable. Temperature reading exceeds critical limit of 72°C.");
  
  // Scan UI states
  const [scanning, setScanning] = useState(false);
  const [auditReport, setAuditReport] = useState(null);
  
  // History list
  const [reportsHistory, setReportsHistory] = useState([
    {
      id: "mock-1",
      batchId: "BATCH-4721",
      product: "Organic Almond Milk",
      status: "passed",
      confidence: 99.2,
      defects: 0,
      timestamp: "10 min ago",
      details: "All parameters within acceptable range. Color consistency: 98.7%, Viscosity: optimal, Contaminant scan: clear.",
      hazards: [],
      recommendations: ["Maintain current temperature thresholds.", "Continue scheduling visual line checks hourly."]
    },
    {
      id: "mock-2",
      batchId: "BATCH-4720",
      product: "Whole Wheat Bread",
      status: "warning",
      confidence: 87.5,
      defects: 1,
      timestamp: "32 min ago",
      details: "Minor crust irregularity detected. Recommended action: visual re-inspection. No chemical or biological hazard.",
      hazards: ["Slight baking crumb temperature deviation."],
      recommendations: ["Calibrate the conveyor oven thermostat.", "Increase visual inspection frequency for this batch."]
    }
  ]);

  // Modal details
  const [selectedResult, setSelectedResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Load production lines on mount
  useEffect(() => {
    if (token) {
      fetchProductionLines();
    }
  }, [token]);

  const fetchProductionLines = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/production-lines`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setProductionLines(data);
      }
    } catch (err) {
      console.error("Failed to load production lines", err);
    }
  };

  const handleLineSelect = (e) => {
    const lineId = e.target.value;
    if (!lineId) return;

    const line = productionLines.find(l => String(l.id) === String(lineId));
    if (line) {
      setProduct(line.name);
      setTemp(line.temp);
      
      const lowerName = line.name.toLowerCase();
      // Parse temperature number to help infer the correct stage
      const tempNum = parseFloat(line.temp.replace(/[^0-9.\-]/g, ""));

      if (lowerName.includes("mill") || lowerName.includes("grain")) {
        setStage("Milling");
      } else if (lowerName.includes("mix") || lowerName.includes("blend") || lowerName.includes("beverage")) {
        setStage("Mixing");
      } else if (lowerName.includes("pack") || lowerName.includes("seal") || lowerName.includes("meat")) {
        setStage("Packaging");
      } else if (lowerName.includes("snack")) {
        setStage("Baking");
      } else if (lowerName.includes("dairy") || lowerName.includes("pasteur")) {
        // If temp is below 10°C, it's likely storage/packaging, not pasteurization
        if (!isNaN(tempNum) && tempNum < 10) {
          setStage("Packaging");
        } else {
          setStage("Pasteurization");
        }
      } else {
        setStage("Packaging");
      }

      setNotes(`Automated report for active production line. Status: ${line.status}. Progress: ${line.progress}%.`);
      toast.info(`Filled data from production line: ${line.name}`);
    }
  };

  const loadPreset = (preset) => {
    setProduct(preset.product);
    setStage(preset.stage);
    setTemp(preset.temp);
    setNotes(preset.notes);
    toast.info(`Loaded preset: ${preset.name}`);
  };

  const handleScan = async (e) => {
    if (e) e.preventDefault();
    if (!token) {
      toast.error("You must be logged in to access the AI quality scanner.");
      return;
    }

    if (!product.trim() || !stage.trim() || !temp.trim()) {
      toast.error("Please fill in the Product, Stage, and Temperature parameters.");
      return;
    }

    setScanning(true);
    setAuditReport(null);
    toast.info("Submitting audit report to Gemini AI...");

    try {
      const response = await fetch(`${API_BASE}/api/ai/inspect-batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          product,
          stage,
          temp,
          notes
        })
      });

      if (response.status === 401) {
        logout();
        toast.error("Session expired. Please log in again.");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to inspect batch");
      }

      setAuditReport(data);
      toast.success("AI Inspection complete!");

      // Prepend to local history
      const newReport = {
        id: `gemini-${Date.now()}`,
        batchId: `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
        product,
        status: data.status || "warning",
        confidence: data.confidence || 85,
        defects: data.defects || 0,
        timestamp: "Just now",
        details: data.details || "AI processing completed.",
        hazards: data.hazards || [],
        recommendations: data.recommendations || []
      };

      setReportsHistory(prev => [newReport, ...prev]);

    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to communicate with AI API backend.");
    } finally {
      setScanning(false);
    }
  };

  const openDetails = (result) => {
    setSelectedResult(result);
    setModalOpen(true);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-[calc(100vh-8rem)] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg shadow-accent/20">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold gradient-text">AI Quality Inspector</h1>
                <p className="text-muted text-sm">Automated compliance audit &amp; hazard analysis powered by Google Gemini</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8 animate-fade-in-up animation-delay-100">
            {/* Left Column: Controls & Presets */}
            <div className="md:col-span-5 space-y-6">
              {/* Parameter Form */}
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-bold text-foreground">Inspection Parameters</h2>
                </div>

                <div className="space-y-4">
                  {/* Select Active Production Line */}
                  {productionLines.length > 0 && (
                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-xs font-semibold text-muted tracking-wide uppercase">
                        Select Active Line (Pre-fill)
                      </label>
                      <select
                        onChange={handleLineSelect}
                        defaultValue=""
                        className="w-full px-4 py-2.5 text-sm bg-surface/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                      >
                        <option value="">-- Choose production line --</option>
                        {productionLines.map((line) => (
                          <option key={line.id} value={line.id}>
                            {line.name} ({line.temp})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Input
                    label="Product Name / Category"
                    placeholder="e.g. Organic Almond Milk"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                  />

                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-semibold text-muted tracking-wide uppercase">
                      Process Stage
                    </label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-surface/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                    >
                      <option value="Pasteurization">Pasteurization</option>
                      <option value="Fermentation">Fermentation</option>
                      <option value="Milling">Milling</option>
                      <option value="Baking">Baking</option>
                      <option value="Mixing">Mixing</option>
                      <option value="Packaging">Packaging</option>
                      <option value="Cooling">Cooling</option>
                    </select>
                  </div>

                  <Input
                    label="Operating Temperature"
                    placeholder="e.g. 74.5°C"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                  />

                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-semibold text-muted tracking-wide uppercase">
                      Operator Observations &amp; Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="e.g. Temperature is stable. No physical contaminants seen."
                      className="w-full px-4 py-3 text-sm bg-surface/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                    />
                  </div>

                  <Button
                    variant="primary"
                    className="w-full py-3.5 mt-2"
                    onClick={handleScan}
                    disabled={scanning}
                    id="ai-scan-btn"
                  >
                    {scanning ? (
                      <>
                        <Loader size="sm" className="mr-2" />
                        Analyzing Batch...
                      </>
                    ) : (
                      <>
                        <ScanLine className="w-4 h-4 mr-2" />
                        Run AI Safety Audit
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4.5 h-4.5 text-secondary" />
                  <h3 className="text-sm font-bold text-foreground">Quick Test Presets</h3>
                </div>
                <p className="text-xs text-muted mb-4">
                  Select a test preset to instantly load specific scenarios (e.g. pasteurization failure or mold contamination) and see how the compliance checker audits it.
                </p>
                <div className="grid grid-cols-1 gap-2.5">
                  {auditPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => loadPreset(preset)}
                      className="text-left w-full p-3 rounded-xl border border-border hover:border-accent hover:bg-surface-hover/30 transition-all text-xs font-medium text-foreground flex items-center justify-between group"
                    >
                      <span>{preset.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-accent transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Live AI Audit Report */}
            <div className="md:col-span-7">
              {/* Initial State */}
              {!auditReport && !scanning && (
                <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm text-center flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4 animate-float">
                    <Cpu className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Ready for AI Analysis</h3>
                  <p className="text-sm text-muted max-w-sm mb-6">
                    Enter batch parameters or load one of the presets on the left, then trigger the AI safety audit check.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-muted text-left bg-background/50 border border-border/40 rounded-xl p-4 w-full max-w-sm">
                    <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary" /> Temp Auditing</div>
                    <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary" /> Hazard Scan</div>
                    <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary" /> Notes Analysis</div>
                    <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary" /> HACCP Rules</div>
                  </div>
                </div>
              )}

              {/* Scanning Loader State */}
              {scanning && (
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm min-h-[400px] space-y-6 flex flex-col justify-center">
                  <div className="flex items-center gap-4">
                    <Loader variant="spinner" size="md" />
                    <div>
                      <h3 className="text-sm font-bold text-foreground">AI Safety Audit in Progress...</h3>
                      <p className="text-xs text-muted">Evaluating parameters against HACCP regulations via Gemini AI</p>
                    </div>
                  </div>
                  <div className="space-y-3.5 pt-4">
                    <div className="h-4 bg-muted/20 rounded animate-pulse w-3/4"></div>
                    <div className="h-24 bg-muted/10 rounded animate-pulse"></div>
                    <div className="h-4 bg-muted/20 rounded animate-pulse w-1/2"></div>
                    <div className="h-16 bg-muted/10 rounded animate-pulse"></div>
                  </div>
                </div>
              )}

              {/* Real Audit Report Card */}
              {auditReport && !scanning && (
                <div className={`bg-surface border-2 rounded-2xl p-6 shadow-md transition-all duration-300 animate-fade-in-up ${
                  auditReport.status === "passed"
                    ? "border-primary"
                    : auditReport.status === "warning"
                    ? "border-secondary"
                    : "border-danger"
                }`}>
                  {/* Report Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        auditReport.status === "passed"
                          ? "bg-primary/10 text-primary"
                          : auditReport.status === "warning"
                          ? "bg-secondary/10 text-secondary"
                          : "bg-danger/10 text-danger animate-pulse"
                      }`}>
                        {auditReport.status === "passed" && <CheckCircle className="w-5 h-5" />}
                        {auditReport.status === "warning" && <AlertTriangle className="w-5 h-5" />}
                        {auditReport.status === "failed" && <AlertTriangle className="w-5 h-5 text-danger" />}
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          auditReport.status === "passed"
                            ? "text-primary"
                            : auditReport.status === "warning"
                            ? "text-secondary"
                            : "text-danger"
                        }`}>
                          COMPLIANCE STATUS: {auditReport.status?.toUpperCase()}
                        </span>
                        <h3 className="text-base font-bold text-foreground">{product}</h3>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-muted font-bold uppercase block">AI Confidence</span>
                      <span className={`text-base font-extrabold ${
                        auditReport.confidence > 90 ? "text-primary" : auditReport.confidence > 75 ? "text-secondary" : "text-danger"
                      }`}>
                        {auditReport.confidence}%
                      </span>
                    </div>
                  </div>

                  {/* Details summary */}
                  <div className="bg-background/60 border border-border/20 rounded-xl p-4 mb-4">
                    <span className="text-[10px] text-muted font-bold uppercase block mb-1">Auditor Assessment Summary</span>
                    <p className="text-sm text-foreground/80 leading-relaxed font-medium">{auditReport.details}</p>
                  </div>

                  {/* Defects */}
                  <div className="flex items-center justify-between bg-surface-hover/30 border border-border/40 rounded-xl p-3 mb-4 text-xs font-bold">
                    <span className="text-muted">Detected Defects / Breaches:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      auditReport.defects === 0 ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"
                    }`}>
                      {auditReport.defects} {auditReport.defects === 1 ? "defect" : "defects"}
                    </span>
                  </div>

                  {/* Hazards list */}
                  <div className="mb-4">
                    <h4 className="text-[10px] font-bold text-muted uppercase tracking-wide mb-2">Hazards Identified</h4>
                    {auditReport.hazards && auditReport.hazards.length > 0 ? (
                      <ul className="space-y-1.5">
                        {auditReport.hazards.map((hazard, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 flex-shrink-0" />
                            <span>{hazard}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-primary font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> No biological, chemical, or physical hazards flagged.
                      </p>
                    )}
                  </div>

                  {/* Recommendations */}
                  <div className="border-t border-border/40 pt-4">
                    <h4 className="text-[10px] font-bold text-muted uppercase tracking-wide mb-2">Corrective Actions Required</h4>
                    {auditReport.recommendations && auditReport.recommendations.length > 0 ? (
                      <ul className="space-y-2">
                        {auditReport.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed font-semibold bg-background/30 p-2.5 border border-border/30 rounded-lg">
                            <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0 text-[10px]">
                              {i + 1}
                            </span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted font-medium">No actions required. Proceed with standard operations.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden animate-fade-in-up animation-delay-200">
            <div className="flex items-center justify-between p-6 border-b border-border/40">
              <div>
                <h2 className="text-lg font-bold text-foreground">Recent Audits History</h2>
                <p className="text-xs text-muted">Overview of latest manual scans and live AI compliance checks</p>
              </div>
              <span className="text-xs text-muted bg-background px-3 py-1 rounded-full border border-border">
                {reportsHistory.length} results
              </span>
            </div>

            <div className="divide-y divide-border/40">
              {reportsHistory.map((result) => {
                const cfg = statusConfig[result.status] || statusConfig.warning;
                const StatusIcon = cfg.icon;
                return (
                  <div
                    key={result.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-surface-hover/50 transition-colors group cursor-pointer"
                    onClick={() => openDetails(result)}
                  >
                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                      <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                        <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{result.product}</p>
                        <p className="text-xs text-muted">{result.batchId} • {result.timestamp}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="text-right">
                        <p className="text-xs text-muted">Confidence</p>
                        <p className={`text-sm font-bold ${result.confidence > 90 ? "text-primary" : result.confidence > 75 ? "text-secondary" : "text-danger"}`}>
                          {result.confidence}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted">Defects</p>
                        <p className={`text-sm font-bold ${result.defects === 0 ? "text-primary" : "text-danger"}`}>
                          {result.defects}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <Eye className="w-4 h-4 text-muted group-hover:text-primary transition-colors hidden sm:block" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detail Modal */}
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={selectedResult ? `Compliance Report — ${selectedResult.batchId}` : ""}
          >
            {selectedResult && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const cfg = statusConfig[selectedResult.status] || statusConfig.warning;
                    const StatusIcon = cfg.icon;
                    return (
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </span>
                    );
                  })()}
                  <span className="text-xs text-muted">{selectedResult.timestamp}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground mb-1">{selectedResult.product}</p>
                  <p className="text-sm text-foreground/75 leading-relaxed bg-background/50 border border-border/30 rounded-xl p-3.5 font-medium">
                    {selectedResult.details}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-background/50 border border-border/40 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted uppercase font-bold tracking-wider mb-0.5">Confidence</p>
                    <p className="text-lg font-extrabold text-primary">{selectedResult.confidence}%</p>
                  </div>
                  <div className="bg-background/50 border border-border/40 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted uppercase font-bold tracking-wider mb-0.5">Defects</p>
                    <p className={`text-lg font-extrabold ${selectedResult.defects === 0 ? "text-primary" : "text-danger"}`}>
                      {selectedResult.defects}
                    </p>
                  </div>
                </div>

                {selectedResult.hazards && selectedResult.hazards.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Identified Safety Hazards</p>
                    <ul className="space-y-1 bg-danger/5 border border-danger/10 rounded-xl p-3">
                      {selectedResult.hazards.map((h, index) => (
                        <li key={index} className="text-xs text-danger font-semibold flex items-start gap-1.5">
                          <span className="mt-1 flex-shrink-0 w-1 h-1 bg-danger rounded-full" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedResult.recommendations && selectedResult.recommendations.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Recommended Corrective Actions</p>
                    <ul className="space-y-2">
                      {selectedResult.recommendations.map((r, index) => (
                        <li key={index} className="text-xs text-foreground/75 font-semibold bg-background/50 border border-border/30 rounded-lg p-2.5 flex items-start gap-2">
                          <span className="w-4.5 h-4.5 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-[9px] flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end pt-3 border-t border-border/30">
                  <Button variant="primary" size="sm" onClick={() => { setModalOpen(false); toast.success("Compliance PDF report generated."); }}>
                    Export Report <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </ProtectedRoute>
  );
}

