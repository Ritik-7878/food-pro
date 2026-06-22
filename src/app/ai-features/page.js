"use client";

import { useState } from "react";
import { Button, Modal, Loader, useToast } from "@/components";
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
} from "lucide-react";

const inspectionResults = [
  {
    id: 1,
    batchId: "BATCH-4721",
    product: "Organic Almond Milk",
    status: "passed",
    confidence: 99.2,
    defects: 0,
    timestamp: "2 min ago",
    details: "All parameters within acceptable range. Color consistency: 98.7%, Viscosity: optimal, Contaminant scan: clear.",
  },
  {
    id: 2,
    batchId: "BATCH-4720",
    product: "Whole Wheat Bread",
    status: "warning",
    confidence: 87.5,
    defects: 2,
    timestamp: "15 min ago",
    details: "Minor crust irregularity detected on 2 units. Recommended action: visual re-inspection. No contamination found.",
  },
  {
    id: 3,
    batchId: "BATCH-4719",
    product: "Greek Yogurt — Vanilla",
    status: "passed",
    confidence: 97.8,
    defects: 0,
    timestamp: "32 min ago",
    details: "pH level: 4.2 (optimal). Texture score: 96.4%. Packaging seal integrity verified.",
  },
  {
    id: 4,
    batchId: "BATCH-4718",
    product: "Fresh Orange Juice",
    status: "failed",
    confidence: 62.1,
    defects: 5,
    timestamp: "1 hr ago",
    details: "Elevated particulate matter detected. Sugar content deviation: +8.2%. Batch flagged for manual review and potential recall.",
  },
];

const statusConfig = {
  passed: { color: "text-primary", bg: "bg-primary/10", icon: CheckCircle, label: "Passed" },
  warning: { color: "text-secondary", bg: "bg-secondary/10", icon: AlertTriangle, label: "Warning" },
  failed: { color: "text-danger", bg: "bg-danger/10", icon: AlertTriangle, label: "Failed" },
};

export default function AIFeaturesPage() {
  const toast = useToast();
  const [scanning, setScanning] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleScan = () => {
    setScanning(true);
    toast.info("AI inspection scan initiated...");
    setTimeout(() => {
      setScanning(false);
      toast.success("Scan complete. 4 batches analyzed.");
    }, 2500);
  };

  const openDetails = (result) => {
    setSelectedResult(result);
    setModalOpen(true);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg shadow-accent/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold gradient-text">AI Quality Inspector</h1>
              <p className="text-muted text-sm">Automated defect detection &amp; compliance analysis</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 animate-fade-in-up animation-delay-100">
          {[
            { icon: ScanLine, label: "Scans Today", value: "142", color: "text-primary", bg: "bg-primary/10" },
            { icon: ShieldCheck, label: "Pass Rate", value: "96.3%", color: "text-primary", bg: "bg-primary/10" },
            { icon: AlertTriangle, label: "Defects Found", value: "7", color: "text-secondary", bg: "bg-secondary/10" },
            { icon: Zap, label: "Avg Speed", value: "1.2s", color: "text-accent", bg: "bg-accent/10" },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Scan Control */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm mb-8 animate-fade-in-up animation-delay-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-accent" />
              <div>
                <h2 className="text-lg font-bold text-foreground">Production Line Scanner</h2>
                <p className="text-sm text-muted">Run AI-powered quality inspection on active batches</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleScan}
              disabled={scanning}
              id="ai-scan-btn"
            >
              {scanning ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Scanning...
                </>
              ) : (
                <>
                  <ScanLine className="w-4 h-4 mr-2" />
                  Run Inspection
                </>
              )}
            </Button>
          </div>

          {/* Scanning Animation */}
          {scanning && (
            <div className="mt-6 space-y-3">
              <Loader variant="skeleton" className="h-12" />
              <Loader variant="skeleton" className="h-12" />
              <Loader variant="skeleton" className="h-12" />
            </div>
          )}
        </div>

        {/* Results Table */}
        {!scanning && (
          <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden animate-fade-in-up animation-delay-300">
            <div className="flex items-center justify-between p-6 border-b border-border/40">
              <h2 className="text-lg font-bold text-foreground">Recent Inspections</h2>
              <span className="text-xs text-muted bg-background px-3 py-1 rounded-full border border-border">{inspectionResults.length} results</span>
            </div>

            <div className="divide-y divide-border/40">
              {inspectionResults.map((result) => {
                const cfg = statusConfig[result.status];
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
        )}

        {/* Detail Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={selectedResult ? `Inspection — ${selectedResult.batchId}` : ""}
        >
          {selectedResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const cfg = statusConfig[selectedResult.status];
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
                <p className="text-sm text-foreground/70 leading-relaxed">{selectedResult.details}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-background/50 border border-border/40 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted">Confidence</p>
                  <p className="text-lg font-extrabold text-primary">{selectedResult.confidence}%</p>
                </div>
                <div className="bg-background/50 border border-border/40 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted">Defects</p>
                  <p className={`text-lg font-extrabold ${selectedResult.defects === 0 ? "text-primary" : "text-danger"}`}>{selectedResult.defects}</p>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="primary" size="sm" onClick={() => { setModalOpen(false); toast.success("Report exported."); }}>
                  Export Report <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
