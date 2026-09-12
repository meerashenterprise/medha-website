// React, useState, useMemo, useEffect, XLSX, and all icon components
// are provided as globals by index.html (see <script> tags) before
// this file loads. No import statements needed in a no-build setup.
const { useState, useMemo, useEffect } = React;

/* ---------------------------------------------------------
   MEDHAAN — Task Manager & Project Tracker (EPC / Pipeline)
   Single-file composition. Sections map to the modular files:
   Sidebar / SpreadProgress / DPRFormModal / PipeBookTable /
   FinancialOverview / TaskBoard / ExcelExport
--------------------------------------------------------- */

// ---------- Mock domain data ----------

const NAV = [
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "overview", label: "Project overview", icon: LayoutDashboard },
  { id: "lmcdaily", label: "LMC daily update", icon: Zap },
  { id: "lmcdpr", label: "LMC DPR", icon: ClipboardList },
  { id: "dailyprogress", label: "Daily work progress", icon: ClipboardList },
  { id: "tasks", label: "Task manager", icon: ListTodo },
  { id: "dpr", label: "Linear progress & DPR", icon: ClipboardList },
  { id: "pipebook", label: "Digital pipe book", icon: FlaskConical },
  { id: "precomm", label: "Pre-commissioning", icon: Gauge },
  { id: "budget", label: "Budget & financials", icon: Wallet },
  { id: "boq", label: "BOQ item tracker", icon: FileCheck2 },
  { id: "resources", label: "Resource rate tracker", icon: PackageSearch },
  { id: "checklists", label: "Checklists", icon: ListChecks },
  { id: "workforce", label: "Workforce & equipment", icon: Users },
  { id: "billing", label: "JMS & client billing", icon: FileCheck2 },
];

// ---------- Projects (client / location wise) ----------

const PROJECTS_SEED = [
  {
    id: "bpcl-erode-01",
    name: "Laying & construction of 3LPE coated CS underground pipeline (CGD)",
    client: "BPCL", location: "Erode, Tamil Nadu", length: "25.4 km", status: "Active",
    contract: "PMC: M/s Tractebel Engineering — Vichitra Constructions",
    startDate: "", finishDate: "", value: "",
  },
  {
    id: "gail-varanasi-lmc",
    name: "Last Mile Connectivity (LMC) works",
    client: "GAIL", location: "Varanasi, Uttar Pradesh", length: "", status: "Active",
    contract: "BANDR/GAIL/71150/EOI-01/LMC/VARANASI/FOA/26-27/40",
    startDate: "", finishDate: "", value: "",
  },
  {
    id: "gail-patna-lmc",
    name: "Last Mile Connectivity (LMC) works",
    client: "GAIL", location: "Patna, Bihar", length: "", status: "Active",
    contract: "BANDR/GAIL/71150/EOI-01/LMC/PATNA/FOA/26-27/72",
    startDate: "", finishDate: "", value: "",
  },
  {
    id: "ofc-laying-01",
    name: "Laying of Optical Fibre Cable",
    client: "—", location: "", length: "", status: "Active",
    contract: "",
    startDate: "", finishDate: "", value: "",
  },
  {
    id: "bgcl-kolkata-01",
    name: 'Execution of laying of steel pipeline of 12" diameter x 2.20 km section length from Larica Building to Hela Battala',
    client: "Bengal Gas Company Limited", location: "Kolkata GA, West Bengal", length: "2.20 km", status: "Active",
    contract: "",
    startDate: "", finishDate: "", value: "",
  },
];

// ---------- BPCL Erode — daily work progress (from site DPR sheet) ----------
// Simplified vs the raw sheet: one cumulative figure per activity (summed
// across 12"/6"/4" diameters) plus a short daily log so a trend can be charted.

const BPCL_ACTIVITIES_SEED = [
  { id: "act-survey", name: "Survey", unit: "Mtr", target: 41000, cumulative: 41000 },
  { id: "act-pipe", name: "Pipe received", unit: "Mtr", target: 21000, cumulative: 19681.61 },
  { id: "act-string", name: "Stringing", unit: "Mtr", target: 20000, cumulative: 18492.58 },
  { id: "act-mlw", name: "Main line welding", unit: "Nos", target: 1400, cumulative: 1279 },
  { id: "act-tiein", name: "Tie-in welding", unit: "Nos", target: 130, cumulative: 98 },
  { id: "act-rt", name: "RT taken", unit: "Nos", target: 1400, cumulative: 1283 },
  { id: "act-rtaccept", name: "RT accept", unit: "Nos", target: 1400, cumulative: 1113 },
  { id: "act-repairrt", name: "Repair RT taken", unit: "Nos", target: 60, cumulative: 47 },
  { id: "act-coating", name: "Joint coating", unit: "Nos", target: 1400, cumulative: 542 },
  { id: "act-trench", name: "Trenching", unit: "Mtr", target: 20000, cumulative: 3997.66 },
  { id: "act-lower", name: "Lowering", unit: "Mtr", target: 20000, cumulative: 3978.20 },
  { id: "act-backfill", name: "Backfilling", unit: "Mtr", target: 20000, cumulative: 3962.48 },
  { id: "act-hydro", name: "Pre-hydrotesting", unit: "Mtr", target: 20000, cumulative: 3755.31 },
  { id: "act-hdd", name: "HDD crossing", unit: "Mtr", target: 3000, cumulative: 1868.25 },
];

const BPCL_DAILY_LOG_SEED = [
  { date: "2026-08-28", trenching: 3820, lowering: 3790, welding: 1240 },
  { date: "2026-08-29", trenching: 3860, lowering: 3830, welding: 1252 },
  { date: "2026-08-30", trenching: 3890, lowering: 3865, welding: 1259 },
  { date: "2026-08-31", trenching: 3910, lowering: 3895, welding: 1264 },
  { date: "2026-09-01", trenching: 3940, lowering: 3920, welding: 1268 },
  { date: "2026-09-02", trenching: 3966, lowering: 3945, welding: 1273 },
  { date: "2026-09-03", trenching: 3998, lowering: 3978, welding: 1279 },
];

const SEGMENT_STATES = {
  survey: { label: "Survey / RoW", short: "Survey", color: "#94a3b8" },
  trenched: { label: "Trenching", short: "Trenching", color: "#eab308" },
  welded: { label: "Welding", short: "Welding", color: "#ff6b1a" },
  ndt: { label: "NDT & coating", short: "NDT", color: "#10b981" },
  lowered: { label: "Lowered & backfilled", short: "Lowered", color: "#1d5a8a" },
  commissioned: { label: "Commissioned", short: "Done", color: "#0f2942" },
};

// Real construction stages a segment of pipe passes through, in order.
const STAGE_ORDER = ["survey", "trenched", "welded", "ndt", "lowered", "commissioned"];

// Named spreads (how a PM actually thinks about the pipeline) instead of
// 254 anonymous 100m slivers. Each spread has a current stage and how far
// through that stage it is — this reads in one glance.
const SPREADS = [
  { id: "sp1", name: "Spread 1", range: "Ch 0+000 – 6+350", length: 6.35, stage: "commissioned", stagePct: 100, gang: "Gang A", inspector: "NDT-1" },
  { id: "sp2", name: "Spread 2", range: "Ch 6+350 – 12+700", length: 6.35, stage: "lowered", stagePct: 72, gang: "Gang B", inspector: "NDT-2" },
  { id: "sp3", name: "Spread 3", range: "Ch 12+700 – 19+050", length: 6.35, stage: "welded", stagePct: 58, gang: "Gang C", inspector: "NDT-3" },
  { id: "sp4", name: "Spread 4", range: "Ch 19+050 – 25+400", length: 6.35, stage: "trenched", stagePct: 34, gang: "Gang D", inspector: "NDT-1" },
  { id: "hdd1", name: "HDD Crossing 3", range: "River crossing, Ch 14+100", length: 0.42, stage: "ndt", stagePct: 90, gang: "Gang E (HDD)", inspector: "NDT-4" },
  { id: "hdd2", name: "HDD Crossing 4", range: "Highway crossing, Ch 21+800", length: 0.31, stage: "survey", stagePct: 15, gang: "Gang E (HDD)", inspector: "NDT-4" },
];

// Overall length-weighted mix across every completed stage, for the
// top-level "where is the pipeline as a whole" stacked bar.
function computeStageMix(spreads) {
  const totalLen = spreads.reduce((s, sp) => s + sp.length, 0);
  const mix = Object.fromEntries(STAGE_ORDER.map((s) => [s, 0]));
  spreads.forEach((sp) => {
    const stageIdx = STAGE_ORDER.indexOf(sp.stage);
    // full credit for every completed stage behind the current one
    for (let i = 0; i < stageIdx; i++) {
      mix[STAGE_ORDER[i]] += sp.length;
    }
    // partial credit for the stage in progress
    mix[sp.stage] += sp.length * (sp.stagePct / 100);
  });
  return STAGE_ORDER.map((s) => ({ stage: s, length: mix[s], pct: (mix[s] / totalLen) * 100 }));
}

const TASKS_SEED = [
  { id: "T-241", title: "Repair NDT rejection at Ch 8+400 (root defect)", persona: "Site Engineer", priority: "High", status: "todo", due: "2026-09-06", assignee: "R. Meshram", tag: "QA/QC" },
  { id: "T-240", title: "Submit RA Bill 14 draft JMS to client PMC", persona: "Billing Lead", priority: "High", status: "inprogress", due: "2026-09-05", assignee: "A. Kulkarni", tag: "Billing" },
  { id: "T-239", title: "Mobilize additional lowering crew — Spread 3", persona: "Project Manager", priority: "Medium", status: "todo", due: "2026-09-10", assignee: "S. Rathi", tag: "Workforce" },
  { id: "T-238", title: "Hydrotest package for Ch 0+000–5+000", persona: "Site Engineer", priority: "High", status: "inprogress", due: "2026-09-08", assignee: "V. Nair", tag: "Pre-comm" },
  { id: "T-237", title: "Reconcile pipe heat number register vs mill TCs", persona: "Site Engineer", priority: "Medium", status: "done", due: "2026-09-02", assignee: "R. Meshram", tag: "QA/QC" },
  { id: "T-236", title: "Review HDD pull-through report — Crossing 4", persona: "Project Manager", priority: "Medium", status: "review", due: "2026-09-07", assignee: "S. Rathi", tag: "HDD" },
  { id: "T-235", title: "Fuel log reconciliation — heavy equipment, Aug", persona: "Project Manager", priority: "Low", status: "done", due: "2026-08-31", assignee: "P. Iyer", tag: "Equipment" },
  { id: "T-234", title: "Client review comments on Retention schedule", persona: "Billing Lead", priority: "Medium", status: "review", due: "2026-09-09", assignee: "A. Kulkarni", tag: "Billing" },
  { id: "T-233", title: "RoW liaison — farmer compensation Ch 18+000", persona: "Project Manager", priority: "High", status: "todo", due: "2026-09-06", assignee: "N. Deshpande", tag: "RoW" },
  { id: "T-232", title: "Toolbox talk log upload — Spread 2 (3 days pending)", persona: "Site Engineer", priority: "Low", status: "todo", due: "2026-09-05", assignee: "V. Nair", tag: "HSE" },
];

const PIPE_JOINTS = [
  { joint: "J-1042", chainage: "12+400", up: "HN-88213", down: "HN-88214", welder: "W-07 / W-11", date: "2026-09-02", method: "RT", result: "Pass", coating: "2026-09-03", holiday: "Pass" },
  { joint: "J-1043", chainage: "12+500", up: "HN-88214", down: "HN-88215", welder: "W-07 / W-11", date: "2026-09-02", method: "RT", result: "Repair", coating: "-", holiday: "-" },
  { joint: "J-1044", chainage: "12+600", up: "HN-88215", down: "HN-88216", welder: "W-03 / W-09", date: "2026-09-02", method: "UT", result: "Pass", coating: "2026-09-03", holiday: "Pass" },
  { joint: "J-1045", chainage: "12+700", up: "HN-88216", down: "HN-88217", welder: "W-03 / W-09", date: "2026-09-03", method: "RT", result: "Cut-Out", coating: "-", holiday: "-" },
  { joint: "J-1046", chainage: "12+800", up: "HN-88217", down: "HN-88218", welder: "W-05 / W-02", date: "2026-09-03", method: "RT", result: "Pass", coating: "2026-09-04", holiday: "Pass" },
  { joint: "J-1047", chainage: "12+900", up: "HN-88218", down: "HN-88219", welder: "W-05 / W-02", date: "2026-09-03", method: "UT", result: "Pass", coating: "2026-09-04", holiday: "Fail" },
  { joint: "J-1048", chainage: "13+000", up: "HN-88219", down: "HN-88220", welder: "W-07 / W-11", date: "2026-09-04", method: "RT", result: "Pass", coating: "-", holiday: "-" },
];

const COST_HEADS = [
  { head: "RoW liaison", budget: 42000000, committed: 39800000, incurred: 37200000 },
  { head: "Pipe procurement", budget: 310000000, committed: 305000000, incurred: 298000000 },
  { head: "Civil trenching", budget: 128000000, committed: 121000000, incurred: 96500000 },
  { head: "HDD crossings", budget: 64000000, committed: 58000000, incurred: 41000000 },
  { head: "Welding consumables", budget: 27000000, committed: 24500000, incurred: 19800000 },
  { head: "Hydrotesting", budget: 15000000, committed: 9000000, incurred: 4200000 },
  { head: "Plant / equipment fuel", budget: 21000000, committed: 20200000, incurred: 18600000 },
];

const RESOURCE_CATEGORIES_SEED = [
  {
    id: "welding", name: "Welding", icon: "flame",
    items: [
      { id: "w1", item: "Manual metal arc welding — root pass", unit: "joint", rate: 850, qty: 620, budgeted: 561000, actual: 527000 },
      { id: "w2", item: "Automatic welding — fill & cap", unit: "joint", rate: 1450, qty: 590, budgeted: 895500, actual: 855500 },
      { id: "w3", item: "Tie-in / golden weld", unit: "joint", rate: 6200, qty: 14, budgeted: 92800, actual: 86800 },
    ],
  },
  {
    id: "radiography", name: "Radiography (NDT)", icon: "radio",
    items: [
      { id: "r1", item: "Radiographic testing (RT) — line pipe joint", unit: "joint", rate: 620, qty: 540, budgeted: 334800, actual: 318200 },
      { id: "r2", item: "Ultrasonic testing (UT)", unit: "joint", rate: 480, qty: 210, budgeted: 100800, actual: 92400 },
      { id: "r3", item: "Film interpretation & reporting", unit: "joint", rate: 90, qty: 750, budgeted: 67500, actual: 67500 },
    ],
  },
  {
    id: "diesel", name: "Diesel / fuel", icon: "fuel",
    items: [
      { id: "d1", item: "HSD — side boom cranes", unit: "litre", rate: 92, qty: 18400, budgeted: 1692800, actual: 1655200 },
      { id: "d2", item: "HSD — HDD rig", unit: "litre", rate: 92, qty: 9200, budgeted: 846400, actual: 812000 },
      { id: "d3", item: "HSD — DG sets (site office)", unit: "litre", rate: 92, qty: 3100, budgeted: 285200, actual: 268400 },
    ],
  },
  {
    id: "consumables", name: "Consumable items", icon: "hammer",
    items: [
      { id: "c1", item: "Welding electrodes (E7018)", unit: "kg", rate: 340, qty: 4200, budgeted: 1428000, actual: 1362000 },
      { id: "c2", item: "Field joint coating sleeves", unit: "nos", rate: 1150, qty: 610, budgeted: 701500, actual: 683500 },
      { id: "c3", item: "Grinding discs & consumables", unit: "nos", rate: 180, qty: 1850, budgeted: 333000, actual: 316800 },
    ],
  },
  {
    id: "imprest", name: "Site imprest", unit: "lot", icon: "wallet",
    items: [
      { id: "i1", item: "Site office running expenses", unit: "month", rate: 185000, qty: 8, budgeted: 1480000, actual: 1392000 },
      { id: "i2", item: "Local transport & logistics", unit: "month", rate: 96000, qty: 8, budgeted: 768000, actual: 741600 },
      { id: "i3", item: "Contingency / petty cash", unit: "month", rate: 42000, qty: 8, budgeted: 336000, actual: 289400 },
    ],
  },
  {
    id: "restorations", name: "Restorations", icon: "shield",
    items: [
      { id: "re1", item: "Road / crossing restoration", unit: "sqm", rate: 420, qty: 3200, budgeted: 1344000, actual: 1198400 },
      { id: "re2", item: "Agricultural land restoration", unit: "km", rate: 185000, qty: 22, budgeted: 4070000, actual: 3612000 },
      { id: "re3", item: "Drainage / culvert reinstatement", unit: "nos", rate: 28500, qty: 18, budgeted: 513000, actual: 439800 },
    ],
  },
];

// ---------- BOQ Item Tracker (mirrors the client projection sheet) ----------
// Structure: RFQ line item (pipe size / method) -> milestone steps with
// weightage %, per-unit step rate, and a monthly Qty/Amount actuals ledger,
// same as the CGD projection-sheet format (Expenses side).

const BOQ_ITEMS_SEED = [
  {
    id: "boq-1", sr: 1, rfqNo: "00010", serviceCode: "9031550",
    desc: '4" x 6.4 mm — Laying by O/E method', uom: "M", qty: 4000, rate: 685.49,
    steps: [
      { id: "s1a", label: "a", desc: "After cleaning & grading", pct: 0.05, rate: 34.27, doneQty: 2000 },
      { id: "s1b", label: "b", desc: "Up to joint coating", pct: 0.15, rate: 102.82, doneQty: 1400 },
      { id: "s1c", label: "c", desc: "Trenching excavation / blasting", pct: 0.10, rate: 68.55, doneQty: 1800 },
      { id: "s1d", label: "d", desc: "Lowering & backfilling", pct: 0.25, rate: 171.37, doneQty: 900 },
      { id: "s1e", label: "e", desc: "Tie-in TCP", pct: 0.05, rate: 34.27, doneQty: 300 },
      { id: "s1f", label: "f", desc: "Hydrotesting & swabbing", pct: 0.10, rate: 68.55, doneQty: 200 },
      { id: "s1g", label: "g", desc: "Clean up, restoration and marker", pct: 0.05, rate: 34.27, doneQty: 150 },
      { id: "s1h", label: "h", desc: "Up to nitrogen purging", pct: 0.10, rate: 68.55, doneQty: 0 },
      { id: "s1i", label: "i", desc: "Commissioning & NOC from authorities", pct: 0.05, rate: 34.27, doneQty: 0 },
      { id: "s1j", label: "j", desc: "Final documents handover", pct: 0.10, rate: 68.55, doneQty: 0 },
    ],
  },
  {
    id: "boq-3", sr: 3, rfqNo: "00010", serviceCode: "9031551",
    desc: '8" x 6.4 mm — Laying by O/E method', uom: "M", qty: 1000, rate: 1098.29,
    steps: [
      { id: "s3a", label: "a", desc: "After cleaning & grading", pct: 0.05, rate: 54.91, doneQty: 500 },
      { id: "s3b", label: "b", desc: "Up to joint coating", pct: 0.15, rate: 164.74, doneQty: 300 },
      { id: "s3c", label: "c", desc: "Trenching excavation / blasting", pct: 0.10, rate: 109.83, doneQty: 400 },
      { id: "s3d", label: "d", desc: "Lowering & backfilling", pct: 0.25, rate: 274.57, doneQty: 150 },
      { id: "s3e", label: "e", desc: "Tie-in TCP", pct: 0.05, rate: 54.91, doneQty: 0 },
      { id: "s3f", label: "f", desc: "Hydrotesting & swabbing", pct: 0.10, rate: 109.83, doneQty: 0 },
      { id: "s3g", label: "g", desc: "Clean up, restoration and marker", pct: 0.05, rate: 54.91, doneQty: 0 },
      { id: "s3h", label: "h", desc: "Up to nitrogen purging", pct: 0.10, rate: 109.83, doneQty: 0 },
      { id: "s3i", label: "i", desc: "Commissioning & NOC from authorities", pct: 0.05, rate: 54.91, doneQty: 0 },
      { id: "s3j", label: "j", desc: "Final documents handover", pct: 0.10, rate: 109.83, doneQty: 0 },
    ],
  },
  {
    id: "boq-12", sr: 12, rfqNo: "00010", serviceCode: "9031338",
    desc: "4NB — By HDD method", uom: "M", qty: 15000, rate: 3108.61,
    steps: [
      { id: "s12a", label: "a", desc: "Design & profile approval", pct: 0.05, rate: 155.43, doneQty: 15000 },
      { id: "s12b", label: "b", desc: "Pre-hydrotesting", pct: 0.20, rate: 621.72, doneQty: 9000 },
      { id: "s12c", label: "c", desc: "Completion of pilot", pct: 0.10, rate: 310.86, doneQty: 8200 },
      { id: "s12d", label: "d", desc: "Pulling & post hydrotesting", pct: 0.35, rate: 1088.01, doneQty: 4600 },
      { id: "s12e", label: "e", desc: "Tie-in & restoration of site", pct: 0.10, rate: 310.86, doneQty: 2000 },
      { id: "s12f", label: "f", desc: "EGP & nitrogen purging", pct: 0.10, rate: 310.86, doneQty: 0 },
      { id: "s12g", label: "g", desc: "Final documents handover", pct: 0.10, rate: 310.86, doneQty: 0 },
    ],
  },
  {
    id: "boq-155", sr: 155, rfqNo: "00010", serviceCode: "9031643",
    desc: "Design & detailed engineering of TCP system", uom: "LS", qty: 1, rate: 31825.80,
    steps: [
      { id: "s155a", label: "a", desc: "Approval of design documents", pct: 0.90, rate: 28643.22, doneQty: 1 },
      { id: "s155b", label: "b", desc: "Completion of all work", pct: 0.10, rate: 3182.58, doneQty: 0 },
    ],
  },
  {
    id: "boq-184", sr: 184, rfqNo: "00010", serviceCode: "—",
    desc: "Development of the storage yard", uom: "LS", qty: 1, rate: 107360.00,
    steps: [
      { id: "s184a", label: "a", desc: "Signing & submission of yard lease agreement", pct: 0.40, rate: 42944.00, doneQty: 1 },
      { id: "s184b", label: "b", desc: "Development of the storage yard", pct: 0.30, rate: 32208.00, doneQty: 1 },
      { id: "s184c", label: "c", desc: "On mechanical completion", pct: 0.25, rate: 26840.00, doneQty: 0 },
      { id: "s184d", label: "d", desc: "Completion of all work", pct: 0.05, rate: 5368.00, doneQty: 0 },
    ],
  },
  {
    id: "boq-200", sr: 200, rfqNo: "00010", serviceCode: "9031338",
    desc: "Supply & permanent lubricant — HDPE duct", uom: "M", qty: 72450, rate: 51.53,
    steps: [
      { id: "s200a", label: "a", desc: "Acceptance of material at project site / yard", pct: 0.80, rate: 41.23, doneQty: 40000 },
      { id: "s200b", label: "b", desc: "Testing after laying", pct: 0.10, rate: 5.15, doneQty: 0 },
      { id: "s200c", label: "c", desc: "Completion of all work", pct: 0.10, rate: 5.15, doneQty: 0 },
    ],
  },
];

const OVERHEADS_SEED = [
  { id: "oh1", head: "Salary", monthly: 4320000 },
  { id: "oh2", head: "Imprest", monthly: 900000 },
  { id: "oh3", head: "Deptt. overheads", monthly: 7373168 },
  { id: "oh4", head: "Guest house + vehicle", monthly: 2520000 },
  { id: "oh5", head: "Interest", monthly: 7200000 },
];

const RA_STAGES = ["Draft JMS", "Under client review", "RA certified", "Retention withheld", "Payment disbursed"];
const RA_BILLS = [
  { id: "RA-11", value: 84500000, stage: 4 },
  { id: "RA-12", value: 91200000, stage: 3 },
  { id: "RA-13", value: 77800000, stage: 2 },
  { id: "RA-14", value: 68000000, stage: 1 },
  { id: "RA-15", value: 52000000, stage: 0 },
];

const CHECKLISTS_SEED = [
  {
    id: "cl-mat", title: "Material requirement — Spread 3", context: "Material list",
    items: [
      { id: "m1", label: "Line pipe 24\" API 5L X70 — 2.4 km balance", done: false },
      { id: "m2", label: "Field joint coating sleeves — 400 nos", done: false },
      { id: "m3", label: "Warning-cum-indicator tape — 6 rolls", done: true },
      { id: "m4", label: "Marker posts (KM/valve) — 12 nos", done: false },
    ],
  },
  {
    id: "cl-mob", title: "HDD crossing 4 — mobilization", context: "Equipment",
    items: [
      { id: "h1", label: "HDD rig transport & rig-up", done: true },
      { id: "h2", label: "Drilling fluid (bentonite) stock", done: true },
      { id: "h3", label: "Pull-back head & swivel inspection", done: false },
    ],
  },
];

// ---------- LMC (Last Mile Connectivity) daily update & DPR ----------
// Modeled on the field team's actual WhatsApp-style daily update and DPR
// formats for domestic PNG connections (GI/MDPE last-mile work).

const LMC_DAILY_UPDATES_SEED = [
  {
    id: "ldu-1",
    date: "2026-09-12",
    location: "Pandey Mahal",
    contractor: "Medhaan Engineering",
    activities: [
      "GI work in progress — Pandey Mahal",
      "GC work in progress",
      "GI pipeline testing work in progress",
    ],
    giTeam: 4,
    ngTeam: 0,
    mdpeTeam: 0,
  },
];

// Each LMC DPR entry captures one day's Today/Total/Scope figures,
// broken down location-wise, matching the field team's WhatsApp format.
const LMC_DPR_SEED = [
  {
    id: "ldpr-1",
    date: "2026-09-11",
    foaNo: "40",
    // Overall scope-level rollup for the day (Today / Total / Scope)
    connection: { today: 7, total: 82, scope: 200 },
    meterInstallation: { today: 7, total: 82, scope: 200 },
    conversion: { today: 2, total: 2, scope: 200 },
    jmrTd: { today: 2, total: 2, scope: 3 },
    giHalfInch: { today: 75, total: 1120, scope: 1980 },
    giThreeQuarterInch: { today: 0, total: 0, scope: 0 },
    retesting: { today: 0, total: 0, scope: 0 },
    mdpe20mm: { today: 5, total: 5, scope: 100 },
    mdpe32mm: { today: 0, total: 0, scope: 500 },
    mainlineTF: { today: 1, total: 1, scope: 1 },
    upto1_5mtr: { today: 0, total: 0, scope: 0 },
    mt1_5mtr: { today: 0, total: 0, scope: 0 },
    rccMarker: { today: 0, total: 0, scope: 0 },
    poleMark: { today: 0, total: 0, scope: 0 },
    platMark: { today: 1, total: 1, scope: 1 },
    valveChamber: { today: 0, total: 0, scope: 0 },
    commissioning32mm: { today: 0, total: 0 },
    commissioning20mm: { today: 5, total: 5 },
    giTeamCount: 4,
    labourCount: 0,
    // Location-wise breakdown (Today / Total only, per the field format)
    locations: [
      { name: "Pandey Mahal", connection: { today: 82, total: 200 }, meterInstallation: { today: 82, total: 200 }, giHalfInch: { today: 1120, total: 1980 }, conversion: { today: 0, total: 0 }, td: { today: 0, total: 0 } },
      { name: "Pandey Mahal", connection: { today: 0, total: 0 }, meterInstallation: { today: 82, total: 0 }, giHalfInch: { today: 1120, total: 1980 }, conversion: { today: 0, total: 0 }, td: { today: 2, total: 3 }, mdpe20mm: { today: 5, total: 5 }, mainlineTF: { today: 1, total: 1 } },
      { name: "Pandey Mahal", connection: { today: 82, total: 0 }, meterInstallation: { today: 82, total: 200 }, giHalfInch: { today: 1120, total: 1980 }, conversion: { today: 5, total: 5 }, td: { today: 2, total: 3 } },
    ],
  },
];


// ---------- Formatting helpers ----------

const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const inrCr = (n) => `₹${(n / 10000000).toFixed(2)} Cr`;
const chainageFmt = (m) => {
  const km = Math.floor(m / 1000);
  const rem = Math.round(m % 1000).toString().padStart(3, "0");
  return `${km}+${rem}`;
};
const pct = (n) => `${n.toFixed(1)}%`;

// ---------- Google Sheets data layer ----------
// Read+write bridge to Google Sheets via a Google Apps Script Web App.
// This artifact preview cannot reach external network addresses, so this
// stays inert (falls back to local seed/mock data) until deployed
// somewhere with real internet access and a script URL is saved below.
//
// SETUP (one-time, no server needed):
// 1. Open your Google Sheet -> Extensions -> Apps Script.
// 2. Paste the contents of `sheets-apps-script.gs` (provided separately)
//    into the script editor.
// 3. Deploy -> New deployment -> type "Web app" -> Execute as "Me" ->
//    Who has access "Anyone with the link". Copy the deployment URL.
// 4. Paste that URL into Settings inside this app (gear icon in sidebar
//    footer, or the "Connect Google Sheets" card on the Projects page).
//
// Sheet tabs expected (one per section), each with a header row:
//   Projects   | id, name, client, location, length, status, contract
//   Tasks      | id, title, persona, priority, status, due, assignee, tag
//   DPR        | date, spread, weather, supervisor, trenching, welding, lowering, backfilling
//   BOQItems   | id, sr, rfqNo, desc, uom, qty, rate
//   BOQSteps   | itemId, label, desc, pct, rate, doneQty
//   Resources  | category, item, unit, rate, qty, budgeted, actual
//   Checklists | listId, title, context, itemLabel, done

const SHEETS_CONFIG_KEY = "medhaan_sheets_config";

function getSheetsConfig() {
  try {
    const raw = window.__medhaanSheetsConfig;
    return raw || { webAppUrl: "", connected: false };
  } catch {
    return { webAppUrl: "", connected: false };
  }
}

function setSheetsConfig(cfg) {
  window.__medhaanSheetsConfig = cfg;
}

// Reads a named tab from the connected sheet. Returns rows as an array of
// objects (first row = headers). Falls back to `fallbackRows` if no sheet
// is connected or the request fails, so every screen keeps working today.
async function readSheetTab(tabName, fallbackRows) {
  const cfg = getSheetsConfig();
  if (!cfg.webAppUrl) return fallbackRows;
  try {
    const res = await fetch(`${cfg.webAppUrl}?action=read&tab=${encodeURIComponent(tabName)}`);
    if (!res.ok) throw new Error(`Sheet read failed: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.rows) ? data.rows : fallbackRows;
  } catch (err) {
    console.warn(`Sheets read fallback for ${tabName}:`, err.message);
    return fallbackRows;
  }
}

// Appends or updates a row in a named tab. `keyField` identifies the row
// to update (e.g. "id"); if not found, a new row is appended.
async function writeSheetRow(tabName, row, keyField = "id") {
  const cfg = getSheetsConfig();
  if (!cfg.webAppUrl) return { ok: false, reason: "not_connected" };
  try {
    const res = await fetch(cfg.webAppUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" }, // avoids CORS preflight on Apps Script
      body: JSON.stringify({ action: "write", tab: tabName, keyField, row }),
    });
    if (!res.ok) throw new Error(`Sheet write failed: ${res.status}`);
    return { ok: true };
  } catch (err) {
    console.warn(`Sheets write failed for ${tabName}:`, err.message);
    return { ok: false, reason: err.message };
  }
}

async function deleteSheetRow(tabName, keyField, keyValue) {
  const cfg = getSheetsConfig();
  if (!cfg.webAppUrl) return { ok: false, reason: "not_connected" };
  try {
    const res = await fetch(cfg.webAppUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "delete", tab: tabName, keyField, keyValue }),
    });
    if (!res.ok) throw new Error(`Sheet delete failed: ${res.status}`);
    return { ok: true };
  } catch (err) {
    console.warn(`Sheets delete failed for ${tabName}:`, err.message);
    return { ok: false, reason: err.message };
  }
}

// Uploads a file (image or document) to the Drive folder managed by the
// connected Apps Script. Returns { ok, url, fileName } — `url` is a
// shareable "anyone with the link can view" Drive link, safe to store in
// a sheet cell or show as a link in the tracker.
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result is a data: URL like "data:image/jpeg;base64,....";
      // strip the prefix, Apps Script only wants the raw base64 payload.
      const commaIdx = reader.result.indexOf(",");
      resolve(commaIdx >= 0 ? reader.result.slice(commaIdx + 1) : reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadFileToDrive(file, { tab, recordId } = {}) {
  const cfg = getSheetsConfig();
  if (!cfg.webAppUrl) return { ok: false, reason: "not_connected" };

  // A rough size guard — Apps Script web app requests have practical
  // payload limits well under this, so warn early rather than let a
  // large file silently fail partway through.
  const MAX_BYTES = 8 * 1024 * 1024; // 8MB
  if (file.size > MAX_BYTES) {
    return { ok: false, reason: `File is ${(file.size / 1024 / 1024).toFixed(1)}MB — please keep uploads under 8MB` };
  }

  try {
    const base64Data = await readFileAsBase64(file);
    const res = await fetch(cfg.webAppUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        action: "uploadFile",
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        base64Data,
        tab: tab || "General",
        recordId: recordId || "",
      }),
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Upload failed");
    return { ok: true, url: data.url, downloadUrl: data.downloadUrl, fileName: data.fileName };
  } catch (err) {
    console.warn("Drive upload failed:", err.message);
    return { ok: false, reason: err.message };
  }
}

// ---------- Excel export utility ----------
// Builds a real, multi-sheet .xlsx client-side via SheetJS. Every export
// screen supplies { filename, sheets: [{ name, rows: [{...}] }] }.

function exportToExcel({ filename, sheets }) {
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, rows }) => {
    if (!rows || rows.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(rows);
    // Auto-size columns roughly based on content length
    const colWidths = Object.keys(rows[0]).map((key) => {
      const maxLen = Math.max(key.length, ...rows.map((r) => String(r[key] ?? "").length));
      return { wch: Math.min(Math.max(maxLen + 2, 10), 45) };
    });
    ws["!cols"] = colWidths;
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  });
  XLSX.writeFile(wb, filename);
}

function ExportButton({ onClick, label = "Export to Excel" }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100"
    >
      <FileSpreadsheet size={15} /> {label}
    </button>
  );
}

// ---------- File / image uploader (saves to Drive via the connected sheet) ----------
// Reusable across DPR, Daily Update, LMC DPR, JMS/billing — anywhere an
// attachment makes sense. `tab` tags which section's Drive subfolder the
// file lands in; `recordId` (optional) is prefixed onto the filename so
// it's traceable back to the row it belongs to.
// `attachments` / `onChange` follow the standard controlled-list pattern:
// pass the current array of {url, fileName} objects, get the updated
// array back after an upload or removal.

function FileUploader({ tab, recordId, attachments = [], onChange, accept, label = "Attach files" }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const sheetsConnected = getSheetsConfig().connected;

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    if (!sheetsConnected) {
      setError("Connect Google Sheets first (Projects page) — uploads save into your connected Drive.");
      return;
    }

    setError("");
    setUploading(true);
    setProgress({ done: 0, total: files.length });

    const uploaded = [];
    for (let i = 0; i < files.length; i++) {
      const result = await uploadFileToDrive(files[i], { tab, recordId });
      if (result.ok) {
        uploaded.push({ url: result.url, downloadUrl: result.downloadUrl, fileName: result.fileName });
      } else {
        setError(`"${files[i].name}" failed: ${result.reason}`);
      }
      setProgress({ done: i + 1, total: files.length });
    }

    if (uploaded.length > 0 && onChange) {
      onChange([...attachments, ...uploaded]);
    }
    setUploading(false);
  };

  const removeAttachment = (idx) => {
    if (!onChange) return;
    onChange(attachments.filter((_, i) => i !== idx));
  };

  const isImage = (fileName) => /\.(jpe?g|png|gif|webp|heic)$/i.test(fileName || "");

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed py-6 text-center transition-colors ${
          dragOver ? "border-orange-400 bg-orange-50/40" : "border-slate-300"
        }`}
      >
        {uploading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            <p className="text-xs text-slate-600">Uploading {progress.done}/{progress.total}…</p>
          </>
        ) : (
          <>
            <Camera size={20} className="text-slate-500" />
            <p className="text-xs text-slate-600">Drag files here, or click to browse</p>
            <label className="mt-1 flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:border-slate-400">
              <Paperclip size={13} /> {label}
              <input
                type="file"
                multiple
                accept={accept}
                className="hidden"
                onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
              />
            </label>
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-600">
          <AlertTriangle size={12} /> {error}
        </p>
      )}

      {attachments.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {attachments.map((a, i) => (
            <div key={i} className="group relative overflow-hidden rounded-md border border-slate-200 bg-slate-50">
              <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex h-20 flex-col items-center justify-center gap-1 p-2 text-center">
                {isImage(a.fileName) ? (
                  <FileImage size={20} className="text-slate-400" />
                ) : (
                  <FileText size={20} className="text-slate-400" />
                )}
                <span className="line-clamp-2 text-[10px] text-slate-600">{a.fileName}</span>
              </a>
              <button
                onClick={() => removeAttachment(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-400 opacity-0 shadow-sm transition-opacity hover:text-rose-600 group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Small shared UI atoms ----------

function StatusPill({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-slate-200 text-slate-700 border-slate-300",
    success: "bg-emerald-100 text-emerald-800 border-emerald-300",
    warning: "bg-orange-100 text-orange-800 border-orange-300",
    danger: "bg-rose-100 text-rose-800 border-rose-300",
    active: "bg-sky-100 text-sky-800 border-sky-300",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function MetricCard({ label, value, sub, trend, trendTone = "success", icon: Icon }) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderColor: "#dbe4ee", background: "linear-gradient(180deg, #ffffff, #f8fafc)" }}
    >
      <div className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-orange-500 to-orange-400 transition-transform group-hover:scale-x-100" />
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-slate-600">{label}</p>
        {Icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-orange-100 group-hover:text-orange-600">
            <Icon size={14} />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
      {sub && (
        <div className="mt-1.5 flex items-center gap-1 text-xs">
          {trend && (
            <span className={`flex items-center gap-0.5 font-semibold ${trendTone === "success" ? "text-emerald-700" : trendTone === "danger" ? "text-rose-700" : "text-slate-600"}`}>
              {trendTone === "success" ? <ArrowUpRight size={12} /> : trendTone === "danger" ? <ArrowDownRight size={12} /> : null}
              {trend}
            </span>
          )}
          <span className="text-slate-600">{sub}</span>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, description, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="h-5 w-1 rounded-full" style={{ backgroundColor: "#ff6b1a" }} />
          <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h1>
        </div>
        {description && <p className="mt-1.5 pl-3.5 text-sm text-slate-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// ---------- Sidebar ----------

function Sidebar({ active, onSelect, collapsed, setCollapsed }) {
  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col transition-all duration-200 ${collapsed ? "w-[68px]" : "w-64"}`}
      style={{ background: "linear-gradient(180deg, #0f2942, #0b1f33)" }}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-4">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow-lg"
          style={{ background: "linear-gradient(135deg, #ff8a3d, #ff6b1a)", boxShadow: "0 4px 12px rgba(255,107,26,0.35)" }}
        >
          <Flame size={18} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Medhaan</p>
            <p className="truncate text-[11px] text-slate-300">Pipeline EPC operations</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              title={collapsed ? item.label : undefined}
              className={`group relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/12 text-white"
                  : "text-slate-300 hover:bg-white/8 hover:text-white"
              }`}
            >
              {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full" style={{ backgroundColor: "#ff6b1a" }} />}
              <Icon size={17} className={`shrink-0 ${isActive ? "text-orange-400" : "text-slate-400 group-hover:text-orange-300"}`} />
              {!collapsed && <span className="truncate text-left">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/8 hover:text-white"
        >
          {collapsed ? <ChevronRight size={15} /> : <><ChevronLeft size={15} /> Collapse</>}
        </button>
      </div>
    </aside>
  );
}

// ---------- Spread Progress ----------

function StageBadge({ stage, pct }) {
  const s = SEGMENT_STATES[stage];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: `${s.color}1a`, color: s.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {s.label}{pct != null && pct < 100 ? ` · ${pct}%` : ""}
    </span>
  );
}

function SpreadProgress({ spreads }) {
  const [selected, setSelected] = useState(null);
  const stageMix = useMemo(() => computeStageMix(spreads), [spreads]);
  const totalLen = spreads.reduce((s, sp) => s + sp.length, 0);
  const active = spreads.find((sp) => sp.id === selected);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Pipeline progress by stage</h3>
            <p className="mt-0.5 text-xs text-slate-600">{totalLen.toFixed(1)} km across {spreads.length} spreads · length-weighted</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4">
        {/* Overall stacked bar: at-a-glance, no per-100m noise */}
        <div className="flex h-8 w-full overflow-hidden rounded-full bg-slate-100">
          {stageMix.filter((m) => m.pct > 0.3).map((m) => (
            <div
              key={m.stage}
              style={{ width: `${m.pct}%`, backgroundColor: SEGMENT_STATES[m.stage].color }}
              className="h-full first:rounded-l-full last:rounded-r-full"
              title={`${SEGMENT_STATES[m.stage].label}: ${m.pct.toFixed(0)}%`}
            />
          ))}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
          {stageMix.map((m) => (
            <span key={m.stage} className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: SEGMENT_STATES[m.stage].color }} />
              {SEGMENT_STATES[m.stage].short} <span className="tabular-nums text-slate-600">{m.pct.toFixed(0)}%</span>
            </span>
          ))}
        </div>
      </div>

      {/* Spread cards: named, clickable, one glance per spread */}
      <div className="grid grid-cols-1 gap-2.5 p-5 sm:grid-cols-2 xl:grid-cols-3">
        {spreads.map((sp) => {
          const isSelected = selected === sp.id;
          const isHDD = sp.name.includes("HDD");
          return (
            <button
              key={sp.id}
              onClick={() => setSelected(isSelected ? null : sp.id)}
              className={`rounded-lg border p-3.5 text-left transition-colors ${
                isSelected ? "border-orange-400 bg-orange-50/60" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {isHDD ? <Waves size={13} className="text-slate-500" /> : <Route size={13} className="text-slate-500" />}
                  <p className="text-sm font-semibold text-slate-800">{sp.name}</p>
                </div>
                <span className="shrink-0 text-[11px] tabular-nums text-slate-600">{sp.length} km</span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-600">{sp.range}</p>
              <div className="mt-2.5">
                <StageBadge stage={sp.stage} pct={sp.stagePct} />
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${sp.stagePct}%`, backgroundColor: SEGMENT_STATES[sp.stage].color }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="mx-5 mb-5 flex flex-wrap items-center gap-x-8 gap-y-2 rounded-lg border border-orange-200 bg-orange-50/60 px-4 py-3 text-sm">
          <div>
            <p className="text-[11px] text-slate-600">Spread</p>
            <p className="font-medium text-slate-900">{active.name} <span className="text-slate-600">· {active.range}</span></p>
          </div>
          <div>
            <p className="text-[11px] text-slate-600">Assigned gang</p>
            <p className="text-slate-800">{active.gang}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-600">Inspection ref</p>
            <p className="text-slate-800">{active.inspector}</p>
          </div>
          <button onClick={() => setSelected(null)} className="ml-auto text-slate-600 hover:text-slate-700">
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- Project Overview ----------

// ---------- Daily Work Progress (BPCL Erode DPR tracker) ----------

function DailyWorkProgress({ activeProjectId }) {
  const [activities, setActivities] = useState(BPCL_ACTIVITIES_SEED);
  const [log, setLog] = useState(BPCL_DAILY_LOG_SEED);
  const [editingId, setEditingId] = useState(null);
  const [draftVal, setDraftVal] = useState("");
  const [addingLog, setAddingLog] = useState(false);
  const [newLog, setNewLog] = useState({ date: "", trenching: "", lowering: "", welding: "" });

  const isBpcl = activeProjectId === "bpcl-erode-01";

  // Hooks must run unconditionally (before any early return), so the sheet
  // load happens regardless of which project is active; it's a no-op if
  // the DPR tab is empty or the project doesn't match.
  useEffect(() => {
    if (!isBpcl) return;
    let cancelled = false;
    (async () => {
      const rows = await readSheetTab("DPR", null);
      if (!cancelled && rows && rows.length > 0) {
        setLog(rows.map((r) => ({
          date: r.date,
          trenching: parseFloat(r.trenching) || 0,
          lowering: parseFloat(r.lowering) || 0,
          welding: parseFloat(r.welding) || 0,
        })));
      }
    })();
    return () => { cancelled = true; };
  }, [isBpcl]);

  if (!isBpcl) {
    return (
      <div>
        <SectionHeader title="Daily work progress" description="Real-numbers DPR tracker with progress charts" />
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <ClipboardList size={22} className="mx-auto text-slate-500" />
          <p className="mt-2 text-sm font-medium text-slate-700">This daily tracker is set up for the BPCL Erode project</p>
          <p className="mt-1 text-xs text-slate-600">Switch to the BPCL Erode project from the Projects page to see its live DPR numbers and progress charts.</p>
        </div>
      </div>
    );
  }

  const startEdit = (act) => {
    setEditingId(act.id);
    setDraftVal(String(act.cumulative));
  };

  const saveEdit = (id) => {
    const val = parseFloat(draftVal);
    if (isNaN(val) || val < 0) return;
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, cumulative: val } : a)));
    setEditingId(null);
  };

  const addLogEntry = () => {
    if (!newLog.date || !newLog.trenching) return;
    const entry = {
      date: newLog.date,
      trenching: parseFloat(newLog.trenching) || 0,
      lowering: parseFloat(newLog.lowering) || 0,
      welding: parseFloat(newLog.welding) || 0,
    };
    setLog((prev) => [...prev, entry]);
    setNewLog({ date: "", trenching: "", lowering: "", welding: "" });
    setAddingLog(false);
    writeSheetRow("DPR", { ...entry, spread: "Spread 3", weather: "", supervisor: "" }, "date");
  };

  const totalTarget = activities.reduce((s, a) => s + a.target, 0);
  const totalDone = activities.reduce((s, a) => s + a.cumulative, 0);
  const overallPct = (totalDone / totalTarget) * 100;

  const lineChartSeries = [
    { name: "Trenching", values: log.map((d) => d.trenching) },
    { name: "Lowering", values: log.map((d) => d.lowering) },
    { name: "Main line welding", values: log.map((d) => d.welding) },
  ];
  const lineChartLabels = log.map((d) => d.date.slice(5));

  const barChartActivities = activities.slice(0, 8);

  const handleExport = () => {
    exportToExcel({
      filename: `Medhaan_BPCL_Erode_DailyProgress_${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheets: [
        {
          name: "Activity Progress",
          rows: activities.map((a) => ({
            Activity: a.name, Unit: a.unit, Target: a.target, Cumulative: a.cumulative,
            "% Complete": ((a.cumulative / a.target) * 100).toFixed(1),
          })),
        },
        {
          name: "Daily Log",
          rows: log.map((d) => ({
            Date: d.date, "Trenching (m)": d.trenching, "Lowering (m)": d.lowering, "Main line welding (joints)": d.welding,
          })),
        },
      ],
    });
  };

  return (
    <div>
      <SectionHeader
        title="Daily work progress — BPCL Erode"
        description="From site DPR · shared daily by the field team · cumulative figures across 12″ / 6″ / 4″ lines"
        action={
          <div className="flex gap-2">
            <ExportButton onClick={handleExport} />
            <button onClick={() => setAddingLog(true)} className="flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-orange-400">
              <Plus size={15} /> Log today's numbers
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Overall completion" value={pct(overallPct)} sub={`${totalDone.toLocaleString("en-IN")} of ${totalTarget.toLocaleString("en-IN")} target units`} icon={Gauge} />
        <MetricCard label="Activities tracked" value={activities.length} icon={ListChecks} />
        <MetricCard label="Trenching (latest)" value={`${log[log.length - 1].trenching.toLocaleString("en-IN")} m`} trend={`+${(log[log.length - 1].trenching - log[log.length - 2].trenching).toFixed(0)} m today`} trendTone="success" />
        <MetricCard label="Main line welding (latest)" value={`${log[log.length - 1].welding.toLocaleString("en-IN")} joints`} trend={`+${(log[log.length - 1].welding - log[log.length - 2].welding).toFixed(0)} today`} trendTone="success" />
      </div>

      {addingLog && (
        <div className="mt-4 rounded-lg border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-4">
          <p className="mb-2.5 text-sm font-semibold text-slate-800">Log today's cumulative numbers</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <input type="date" value={newLog.date} onChange={(e) => setNewLog((d) => ({ ...d, date: e.target.value }))} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-800 focus:border-orange-500/50 focus:outline-none" />
            <input type="number" value={newLog.trenching} onChange={(e) => setNewLog((d) => ({ ...d, trenching: e.target.value }))} placeholder="Trenching (m)" className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm tabular-nums text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none" />
            <input type="number" value={newLog.lowering} onChange={(e) => setNewLog((d) => ({ ...d, lowering: e.target.value }))} placeholder="Lowering (m)" className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm tabular-nums text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none" />
            <input type="number" value={newLog.welding} onChange={(e) => setNewLog((d) => ({ ...d, welding: e.target.value }))} placeholder="Welding (joints)" className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm tabular-nums text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none" />
          </div>
          <div className="mt-2.5 flex gap-2">
            <button onClick={addLogEntry} className="rounded-md bg-orange-500 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-orange-400">Save entry</button>
            <button onClick={() => setAddingLog(false)} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-slate-300">Cancel</button>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Daily progress trend</h3>
          <ChartMiniLine series={lineChartSeries} labels={lineChartLabels} />
        </div>
        <div className="rounded-lg border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Activity-wise completion vs target</h3>
          <ChartMiniBar activities={barChartActivities} />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-white text-[11px] uppercase tracking-wide text-slate-600">
              <th className="px-3 py-2.5 font-medium">Activity</th>
              <th className="px-3 py-2.5 font-medium">Unit</th>
              <th className="px-3 py-2.5 text-right font-medium">Target</th>
              <th className="px-3 py-2.5 text-right font-medium">Cumulative</th>
              <th className="px-3 py-2.5 font-medium">Progress</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a) => {
              const p = Math.min((a.cumulative / a.target) * 100, 100);
              const isEditing = editingId === a.id;
              return (
                <tr key={a.id} className="border-b border-slate-200/60 last:border-0 hover:bg-slate-50">
                  <td className="px-3 py-2.5 text-slate-800">{a.name}</td>
                  <td className="px-3 py-2.5 text-slate-600">{a.unit}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-600">{a.target.toLocaleString("en-IN")}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <input
                          autoFocus
                          type="number"
                          value={draftVal}
                          onChange={(e) => setDraftVal(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit(a.id)}
                          className="w-24 rounded border border-slate-300 bg-slate-50 px-2 py-1 text-right text-xs tabular-nums text-slate-800 focus:border-orange-500/50 focus:outline-none"
                        />
                        <button onClick={() => saveEdit(a.id)} className="text-emerald-600 hover:text-emerald-700"><Check size={14} /></button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(a)} className="text-slate-700 hover:text-orange-600">{a.cumulative.toLocaleString("en-IN")}</button>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${p >= 100 ? "bg-emerald-500" : "bg-orange-500"}`} style={{ width: `${p}%` }} />
                      </div>
                      <span className="text-[11px] tabular-nums text-slate-600">{p.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-slate-600">Click a cumulative value to update it with today's figure from the field DPR.</p>
    </div>
  );
}

// ---------- Small inline chart primitives (SVG, no external chart lib) ----------

function ChartMiniLine({ series, labels }) {
  const width = 520, height = 200, padL = 40, padR = 12, padT = 10, padB = 24;
  const innerW = width - padL - padR, innerH = height - padT - padB;
  const allVals = series.flatMap((s) => s.values);
  const maxV = Math.max(...allVals) * 1.08;
  const minV = Math.min(...allVals) * 0.96;
  const n = labels.length;
  const colors = ["#ff6b1a", "#2563eb", "#059669"];

  const xFor = (i) => padL + (innerW * i) / Math.max(n - 1, 1);
  const yFor = (v) => padT + innerH - ((v - minV) / (maxV - minV || 1)) * innerH;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: 220 }}>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line key={t} x1={padL} x2={width - padR} y1={padT + innerH * t} y2={padT + innerH * t} stroke="#e2e8f0" strokeWidth="1" />
      ))}
      {series.map((s, si) => (
        <polyline
          key={s.name}
          fill="none"
          stroke={colors[si % colors.length]}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={s.values.map((v, i) => `${xFor(i)},${yFor(v)}`).join(" ")}
        />
      ))}
      {series.map((s, si) =>
        s.values.map((v, i) => (
          <circle key={`${si}-${i}`} cx={xFor(i)} cy={yFor(v)} r="3" fill={colors[si % colors.length]} />
        ))
      )}
      {labels.map((l, i) => (
        <text key={l} x={xFor(i)} y={height - 6} fontSize="9" textAnchor="middle" fill="#64748b">{l}</text>
      ))}
      <foreignObject x={padL} y={0} width={innerW} height={padT}>
        <div style={{ display: "flex", gap: 12, fontSize: 10, color: "#334155" }}>
          {series.map((s, si) => (
            <span key={s.name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: colors[si % colors.length], display: "inline-block" }} />
              {s.name}
            </span>
          ))}
        </div>
      </foreignObject>
    </svg>
  );
}

function ChartMiniBar({ activities }) {
  const width = 520, height = 220, padL = 8, padR = 8, padT = 10, padB = 60;
  const innerW = width - padL - padR, innerH = height - padT - padB;
  const n = activities.length;
  const gap = 10;
  const barW = (innerW - gap * (n - 1)) / n;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: 240 }}>
      {activities.map((a, i) => {
        const p = Math.min(a.cumulative / a.target, 1);
        const barH = innerH * p;
        const x = padL + i * (barW + gap);
        const y = padT + innerH - barH;
        const trackY = padT;
        return (
          <g key={a.id}>
            <rect x={x} y={trackY} width={barW} height={innerH} fill="#f1f5f9" rx="3" />
            <rect x={x} y={y} width={barW} height={barH} fill={p >= 1 ? "#059669" : "#ff6b1a"} rx="3" />
            <text x={x + barW / 2} y={padT + innerH + 12} fontSize="8.5" textAnchor="middle" fill="#475569">
              {a.name.length > 12 ? a.name.slice(0, 11) + "…" : a.name}
            </text>
            <text x={x + barW / 2} y={padT + innerH + 24} fontSize="8" textAnchor="middle" fill="#94a3b8">
              {(p * 100).toFixed(0)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function RadialStat({ pct: value, size = 132, stroke = 12, color = "#ff6b1a", track = "#f1f5f9", textColor = "#0f172a", subColor = "#64748b" }) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(value, 100) / 100);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-semibold tabular-nums" style={{ fontFamily: "'Space Grotesk', sans-serif", color: textColor }}>{value.toFixed(0)}<span className="text-lg" style={{ color: subColor }}>%</span></p>
        <p className="text-[11px] font-medium" style={{ color: subColor }}>complete</p>
      </div>
    </div>
  );
}

// ---------- LMC Daily Update (quick daily plan, matches field WhatsApp format) ----------

function LMCDailyUpdate() {
  const [updates, setUpdates] = useState(LMC_DAILY_UPDATES_SEED);
  const [addingOpen, setAddingOpen] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    location: "", contractor: "Medhaan Engineering",
    activitiesText: "", giTeam: "", ngTeam: "", mdpeTeam: "",
  });
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows = await readSheetTab("LMCDailyUpdates", null);
      if (!cancelled && rows && rows.length > 0) {
        setUpdates(rows.map((r) => ({
          id: r.id, date: r.date, location: r.location, contractor: r.contractor,
          activities: (r.activities || "").split("|").filter(Boolean),
          giTeam: parseFloat(r.giTeam) || 0, ngTeam: parseFloat(r.ngTeam) || 0, mdpeTeam: parseFloat(r.mdpeTeam) || 0,
          attachments: (r.attachments || "").split("|").filter(Boolean).map((url) => ({ url, fileName: url.split("/").pop() || "attachment" })),
        })));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleExport = () => {
    exportToExcel({
      filename: `Medhaan_LMC_Daily_Update_${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheets: [{
        name: "Daily Updates",
        rows: updates.map((u) => ({
          Date: u.date, Location: u.location, Contractor: u.contractor,
          Activities: u.activities.join(" | "),
          "GI Team": u.giTeam, "NG Team": u.ngTeam, "MDPE Team": u.mdpeTeam,
        })),
      }],
    });
  };

  const addUpdate = () => {
    if (!form.location.trim() || !form.date) return;
    const id = `ldu-${Date.now()}`;
    const activities = form.activitiesText.split("\n").map((l) => l.trim()).filter(Boolean);
    const row = {
      id, date: form.date, location: form.location, contractor: form.contractor,
      activities, giTeam: parseFloat(form.giTeam) || 0, ngTeam: parseFloat(form.ngTeam) || 0, mdpeTeam: parseFloat(form.mdpeTeam) || 0,
      attachments,
    };
    setUpdates((prev) => [row, ...prev]);
    setForm({ date: new Date().toISOString().slice(0, 10), location: "", contractor: "Medhaan Engineering", activitiesText: "", giTeam: "", ngTeam: "", mdpeTeam: "" });
    setAttachments([]);
    setAddingOpen(false);
    writeSheetRow("LMCDailyUpdates", {
      ...row, activities: activities.join("|"),
      attachments: attachments.map((a) => a.url).join("|"),
    }, "id");
  };

  return (
    <div>
      <SectionHeader
        title="LMC daily update"
        description="Quick daily plan per location — matches the field team's WhatsApp update format"
        action={
          <div className="flex gap-2">
            <ExportButton onClick={handleExport} />
            <button onClick={() => setAddingOpen(true)} className="flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-orange-400">
              <Plus size={15} /> Add today's update
            </button>
          </div>
        }
      />

      {addingOpen && (
        <div className="mb-4 rounded-lg border border-orange-300 bg-orange-50/40 p-4">
          <p className="mb-2.5 text-sm font-semibold text-slate-800">New daily update</p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-500/50 focus:outline-none" />
            <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Location (e.g. Pandey Mahal)" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none" />
            <input value={form.contractor} onChange={(e) => setForm((f) => ({ ...f, contractor: e.target.value }))} placeholder="Contractor name" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none" />
          </div>
          <textarea
            value={form.activitiesText}
            onChange={(e) => setForm((f) => ({ ...f, activitiesText: e.target.value }))}
            placeholder={"One activity per line, e.g.\nGI work in progress — Pandey Mahal\nGC work in progress\nGI pipeline testing work in progress"}
            rows={4}
            className="mt-2.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none"
          />
          <div className="mt-2.5 grid grid-cols-3 gap-2.5">
            <div>
              <label className="mb-1 block text-xs text-slate-500">GI team</label>
              <input type="number" value={form.giTeam} onChange={(e) => setForm((f) => ({ ...f, giTeam: e.target.value }))} placeholder="0" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-800 placeholder:text-slate-400 focus:border-orange-500/50 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">NG team</label>
              <input type="number" value={form.ngTeam} onChange={(e) => setForm((f) => ({ ...f, ngTeam: e.target.value }))} placeholder="0" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-800 placeholder:text-slate-400 focus:border-orange-500/50 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">MDPE team</label>
              <input type="number" value={form.mdpeTeam} onChange={(e) => setForm((f) => ({ ...f, mdpeTeam: e.target.value }))} placeholder="0" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-800 placeholder:text-slate-400 focus:border-orange-500/50 focus:outline-none" />
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-xs text-slate-500">Site photos (optional)</label>
            <FileUploader tab="LMCDailyUpdates" recordId={form.date} attachments={attachments} onChange={setAttachments} accept="image/*" label="Attach photos" />
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={addUpdate} className="rounded-md bg-orange-500 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-orange-400">Save update</button>
            <button onClick={() => setAddingOpen(false)} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-slate-300">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {updates.map((u) => (
          <div key={u.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-sm font-semibold text-slate-800"><CalendarDays size={14} className="text-slate-500" /> {u.date}</span>
                <span className="flex items-center gap-1 text-sm text-slate-600"><MapPin size={14} className="text-slate-500" /> {u.location}</span>
              </div>
              <span className="text-xs text-slate-500">Contractor: <span className="font-medium text-slate-700">{u.contractor}</span></span>
            </div>
            <div className="p-4">
              <ul className="space-y-1.5 text-sm text-slate-700">
                {u.activities.map((a, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                    {a}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-4 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <span>GI Team: <span className="font-semibold text-slate-800">{u.giTeam}</span></span>
                <span>NG Team: <span className="font-semibold text-slate-800">{u.ngTeam}</span></span>
                <span>MDPE Team: <span className="font-semibold text-slate-800">{u.mdpeTeam}</span></span>
              </div>
              {u.attachments && u.attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  {u.attachments.map((a, i) => (
                    <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600 hover:border-slate-300">
                      <FileImage size={12} /> {a.fileName}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- LMC DPR (detailed Today/Total/Scope tracker) ----------

function TTSCell({ block }) {
  if (!block) return <span className="text-slate-400">—</span>;
  return (
    <span className="tabular-nums">
      <span className="font-semibold text-slate-800">{block.today}</span>
      <span className="text-slate-400">/{block.total}</span>
      {block.scope != null && <span className="text-slate-400">/{block.scope}</span>}
    </span>
  );
}

const LMC_DPR_METRICS = [
  { key: "connection", label: "Connection" },
  { key: "meterInstallation", label: "Meter installation" },
  { key: "conversion", label: "Conversion" },
  { key: "jmrTd", label: "JMR TD" },
  { key: "giHalfInch", label: 'Total GI 1/2"' },
  { key: "giThreeQuarterInch", label: 'Total GI 3/4"' },
  { key: "retesting", label: "Retesting" },
];

const LMC_MDPE_METRICS = [
  { key: "mdpe20mm", label: "20mm" },
  { key: "mdpe32mm", label: "32mm" },
  { key: "mainlineTF", label: "Mainline TF" },
  { key: "upto1_5mtr", label: "Upto 1.5mtr" },
  { key: "mt1_5mtr", label: "M/T 1.5mtr" },
  { key: "rccMarker", label: "RCC marker" },
  { key: "poleMark", label: "Pole mark" },
  { key: "platMark", label: "Plat mark" },
  { key: "valveChamber", label: "Valve chamber" },
];

function LMCDPR() {
  const [entries, setEntries] = useState(LMC_DPR_SEED);
  const [openId, setOpenId] = useState(LMC_DPR_SEED[0]?.id || null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows = await readSheetTab("LMCDpr", null);
      if (!cancelled && rows && rows.length > 0) {
        // Sheet rows are stored flattened (see writeSheetRow calls below);
        // reconstruct the nested {today,total,scope} shape for display.
        setEntries(rows.map((r) => {
          const metric = (prefix) => ({
            today: parseFloat(r[`${prefix}Today`]) || 0,
            total: parseFloat(r[`${prefix}Total`]) || 0,
            scope: r[`${prefix}Scope`] !== undefined ? parseFloat(r[`${prefix}Scope`]) || 0 : undefined,
          });
          return {
            id: r.id, date: r.date, foaNo: r.foaNo,
            connection: metric("connection"), meterInstallation: metric("meterInstallation"),
            conversion: metric("conversion"), jmrTd: metric("jmrTd"),
            giHalfInch: metric("giHalfInch"), giThreeQuarterInch: metric("giThreeQuarterInch"),
            retesting: metric("retesting"), mdpe20mm: metric("mdpe20mm"), mdpe32mm: metric("mdpe32mm"),
            mainlineTF: metric("mainlineTF"), upto1_5mtr: metric("upto1_5mtr"), mt1_5mtr: metric("mt1_5mtr"),
            rccMarker: metric("rccMarker"), poleMark: metric("poleMark"), platMark: metric("platMark"),
            valveChamber: metric("valveChamber"),
            commissioning32mm: { today: parseFloat(r.commissioning32mmToday) || 0, total: parseFloat(r.commissioning32mmTotal) || 0 },
            commissioning20mm: { today: parseFloat(r.commissioning20mmToday) || 0, total: parseFloat(r.commissioning20mmTotal) || 0 },
            giTeamCount: parseFloat(r.giTeamCount) || 0, labourCount: parseFloat(r.labourCount) || 0,
            locations: [],
          };
        }));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleExport = () => {
    exportToExcel({
      filename: `Medhaan_LMC_DPR_${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheets: [{
        name: "LMC DPR",
        rows: entries.map((e) => {
          const flat = { Date: e.date, "FOA No": e.foaNo };
          [...LMC_DPR_METRICS, ...LMC_MDPE_METRICS].forEach((m) => {
            const b = e[m.key];
            if (b) flat[`${m.label} (T/Tot/Scope)`] = `${b.today}/${b.total}${b.scope != null ? "/" + b.scope : ""}`;
          });
          flat["GI Team"] = e.giTeamCount;
          flat["Labour"] = e.labourCount;
          return flat;
        }),
      }],
    });
  };

  return (
    <div>
      <SectionHeader
        title="LMC DPR"
        description="Last mile connectivity — daily progress report, Today / Total / Scope per metric"
        action={<ExportButton onClick={handleExport} />}
      />

      <div className="space-y-3">
        {entries.map((e) => {
          const isOpen = openId === e.id;
          return (
            <div key={e.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <button onClick={() => setOpenId(isOpen ? null : e.id)} className="flex w-full items-center justify-between px-4 py-3.5 text-left">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-sm font-semibold text-slate-800"><CalendarDays size={14} className="text-slate-500" /> {e.date}</span>
                  <StatusPill tone="neutral">FOA {e.foaNo}</StatusPill>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Connections today: <span className="font-semibold text-slate-800">{e.connection.today}</span></span>
                  <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Scope metrics (Today / Total / Scope)</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 md:grid-cols-4">
                    {LMC_DPR_METRICS.map((m) => (
                      <div key={m.key} className="rounded-md bg-slate-50 px-3 py-2">
                        <p className="text-[11px] text-slate-500">{m.label}</p>
                        <p className="mt-0.5"><TTSCell block={e[m.key]} /></p>
                      </div>
                    ))}
                  </div>

                  <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">MDPE laying (Today / Total / Scope)</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 md:grid-cols-4">
                    {LMC_MDPE_METRICS.map((m) => (
                      <div key={m.key} className="rounded-md bg-slate-50 px-3 py-2">
                        <p className="text-[11px] text-slate-500">{m.label}</p>
                        <p className="mt-0.5"><TTSCell block={e[m.key]} /></p>
                      </div>
                    ))}
                  </div>

                  <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Commissioning &amp; crew</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
                    <div className="rounded-md bg-slate-50 px-3 py-2">
                      <p className="text-[11px] text-slate-500">Commissioning 32mm</p>
                      <p className="mt-0.5 tabular-nums"><span className="font-semibold text-slate-800">{e.commissioning32mm.today}</span><span className="text-slate-400">/{e.commissioning32mm.total}</span></p>
                    </div>
                    <div className="rounded-md bg-slate-50 px-3 py-2">
                      <p className="text-[11px] text-slate-500">Commissioning 20mm</p>
                      <p className="mt-0.5 tabular-nums"><span className="font-semibold text-slate-800">{e.commissioning20mm.today}</span><span className="text-slate-400">/{e.commissioning20mm.total}</span></p>
                    </div>
                    <div className="rounded-md bg-slate-50 px-3 py-2">
                      <p className="text-[11px] text-slate-500">GI team</p>
                      <p className="mt-0.5 font-semibold tabular-nums text-slate-800">{e.giTeamCount}</p>
                    </div>
                    <div className="rounded-md bg-slate-50 px-3 py-2">
                      <p className="text-[11px] text-slate-500">Labour</p>
                      <p className="mt-0.5 font-semibold tabular-nums text-slate-800">{e.labourCount}</p>
                    </div>
                  </div>

                  {e.locations && e.locations.length > 0 && (
                    <>
                      <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Location-wise (Today / Total)</p>
                      <div className="overflow-x-auto rounded-md border border-slate-200">
                        <table className="w-full min-w-[600px] text-left text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                              <th className="px-3 py-2 font-medium">Location</th>
                              <th className="px-3 py-2 font-medium">Connection</th>
                              <th className="px-3 py-2 font-medium">Meter install</th>
                              <th className="px-3 py-2 font-medium">GI 1/2"</th>
                              <th className="px-3 py-2 font-medium">Conversion</th>
                              <th className="px-3 py-2 font-medium">TD</th>
                            </tr>
                          </thead>
                          <tbody>
                            {e.locations.map((loc, i) => (
                              <tr key={i} className="border-b border-slate-100 last:border-0">
                                <td className="px-3 py-2 text-slate-700">{loc.name}</td>
                                <td className="px-3 py-2"><TTSCell block={loc.connection} /></td>
                                <td className="px-3 py-2"><TTSCell block={loc.meterInstallation} /></td>
                                <td className="px-3 py-2"><TTSCell block={loc.giHalfInch} /></td>
                                <td className="px-3 py-2"><TTSCell block={loc.conversion} /></td>
                                <td className="px-3 py-2"><TTSCell block={loc.td} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-slate-500">To log a new day's DPR, add a row to the LMCDpr tab in your connected Google Sheet — it will appear here automatically.</p>
    </div>
  );
}

function ProjectOverview({ activeProjectId, onOpenDPR }) {
  const stageMix = useMemo(() => computeStageMix(SPREADS), []);
  const overallPct = useMemo(() => {
    const idx = STAGE_ORDER.indexOf("commissioned");
    return stageMix.reduce((s, m) => s + (STAGE_ORDER.indexOf(m.stage) <= idx ? m.pct : 0), 0);
  }, [stageMix]);

  const sanctioned = 607000000;
  const disbursed = 388900000;
  const unbilled = 96400000;

  const handleExport = () => {
    exportToExcel({
      filename: `Medhaan_Project_Overview_${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheets: [
        {
          name: "KPI Summary",
          rows: [
            { Metric: "Total spread length", Value: "25.4 km" },
            { Metric: "Overall completion", Value: pct(overallPct) },
            { Metric: "Sanctioned budget (INR)", Value: sanctioned },
            { Metric: "Disbursed to date (INR)", Value: disbursed },
            { Metric: "Unbilled WIP value (INR)", Value: unbilled },
            { Metric: "Today's field headcount", Value: 286 },
          ],
        },
        {
          name: "Spread Progress",
          rows: SPREADS.map((sp) => ({
            Spread: sp.name, Range: sp.range, "Length (km)": sp.length,
            "Current stage": SEGMENT_STATES[sp.stage].label, "Stage %": sp.stagePct,
            Gang: sp.gang, Inspector: sp.inspector,
          })),
        },
        {
          name: "Cost Head Burn",
          rows: COST_HEADS.map((c) => ({
            "Cost head": c.head, "Allocated (INR)": c.budget, "Committed (INR)": c.committed,
            "Incurred (INR)": c.incurred, "Variance %": (((c.budget - c.incurred) / c.budget) * 100).toFixed(1),
          })),
        },
      ],
    });
  };

  return (
    <div>
      <SectionHeader
        title="Project overview"
        description="25.4 km spread · EPC contract MED/GAS/2026-014"
        action={
          <div className="flex gap-2">
            <ExportButton onClick={handleExport} />
            <button onClick={onOpenDPR} className="flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-orange-400">
              <Plus size={15} /> New DPR entry
            </button>
          </div>
        }
      />

      {/* Hero band: the one bold moment on this page — deep steel-blue surface, radial stat, hazard-stripe corner accent */}
      <div className="relative overflow-hidden rounded-xl shadow-lg" style={{ background: "linear-gradient(135deg, #0f2942, #14395c 55%, #1d5a8a)" }}>
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 opacity-[0.07]"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0 10px, transparent 10px 20px)" }}
        />
        <div className="relative grid grid-cols-1 gap-6 p-6 lg:grid-cols-[auto_1fr]">
          <div className="relative flex items-center">
            <RadialStat pct={overallPct} color="#ff6b1a" track="rgba(255,255,255,0.12)" textColor="#ffffff" subColor="rgba(255,255,255,0.6)" />
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-white/60">Total spread length</p>
              <p className="mt-1 text-xl font-semibold text-white tabular-nums" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>25.4 km</p>
              <p className="mt-0.5 text-[11px] text-white/50">6 spreads · 2 HDD crossings</p>
            </div>
            <div>
              <p className="text-xs font-medium text-white/60">Sanctioned vs disbursed</p>
              <p className="mt-1 text-xl font-semibold text-white tabular-nums" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{inrCr(disbursed)}</p>
              <p className="mt-0.5 text-[11px] text-white/50">of {inrCr(sanctioned)} sanctioned</p>
            </div>
            <div>
              <p className="text-xs font-medium text-white/60">Unbilled WIP value</p>
              <p className="mt-1 text-xl font-semibold text-white tabular-nums" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{inrCr(unbilled)}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium" style={{ color: "#ff9d5c" }}><TrendingUp size={11} /> +8.4 Cr this month</p>
            </div>
            <div>
              <p className="text-xs font-medium text-white/60">Today's field headcount</p>
              <p className="mt-1 text-xl font-semibold text-white tabular-nums" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>286</p>
              <p className="mt-0.5 text-[11px] text-white/50">214 direct · 72 subcontractor</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <SpreadProgress spreads={SPREADS} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-4 shadow-sm lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Activity by cost head — committed vs incurred</h3>
          <div className="space-y-3">
            {COST_HEADS.map((c) => {
              const incurredPct = (c.incurred / c.budget) * 100;
              const committedPct = (c.committed / c.budget) * 100;
              const over = c.incurred > c.budget;
              return (
                <div key={c.head}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-600">{c.head}</span>
                    <span className="tabular-nums text-slate-600">{inrCr(c.incurred)} / {inrCr(c.budget)}</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-slate-300" style={{ width: `${Math.min(committedPct, 100)}%` }} />
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full ${over ? "bg-rose-500" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min(incurredPct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Open field alerts</h3>
          <ul className="space-y-2.5 text-sm">
            <li className="flex gap-2">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-rose-600" />
              <span className="text-slate-600">Joint J-1045 cut-out pending re-weld, Spread 3</span>
            </li>
            <li className="flex gap-2">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-orange-600" />
              <span className="text-slate-600">Holiday test failed, coating repair due Spread 3</span>
            </li>
            <li className="flex gap-2">
              <Clock size={15} className="mt-0.5 shrink-0 text-slate-500" />
              <span className="text-slate-600">RoW compensation pending — Spread 4, 3 days open</span>
            </li>
            <li className="flex gap-2">
              <Clock size={15} className="mt-0.5 shrink-0 text-slate-500" />
              <span className="text-slate-600">Toolbox talk log missing for Spread 2, 3 days</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ---------- Task Manager (Kanban + List) ----------

const TASK_COLUMNS = [
  { id: "todo", label: "To do", color: "#94a3b8" },
  { id: "inprogress", label: "In progress", color: "#1d5a8a" },
  { id: "review", label: "In review", color: "#eab308" },
  { id: "done", label: "Done", color: "#059669" },
];

function priorityTone(p) {
  return p === "High" ? "danger" : p === "Medium" ? "warning" : "neutral";
}

function TaskCard({ task, onAdvance }) {
  const overdue = new Date(task.due) < new Date("2026-09-04") && task.status !== "done";
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-[11px] font-medium text-slate-600 tabular-nums">{task.id}</span>
        <StatusPill tone={priorityTone(task.priority)}>{task.priority}</StatusPill>
      </div>
      <p className="text-sm leading-snug text-slate-800">{task.title}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-medium text-slate-500">
            {task.assignee.split(" ").map((s) => s[0]).join("")}
          </div>
          <span className="text-[11px] text-slate-600">{task.tag}</span>
        </div>
        <span className={`flex items-center gap-1 text-[11px] tabular-nums ${overdue ? "text-rose-600" : "text-slate-600"}`}>
          <CalendarDays size={12} /> {task.due.slice(5)}
        </span>
      </div>
      {task.status !== "done" && (
        <button
          onClick={() => onAdvance(task.id)}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded border border-slate-200 py-1.5 text-[11px] text-slate-600 hover:border-slate-300 hover:text-slate-800"
        >
          Move to {TASK_COLUMNS[TASK_COLUMNS.findIndex((c) => c.id === task.status) + 1]?.label} <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

function TaskManager() {
  const [tasks, setTasks] = useState(TASKS_SEED);
  const [view, setView] = useState("board");
  const [personaFilter, setPersonaFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows = await readSheetTab("Tasks", null);
      if (!cancelled && rows && rows.length > 0) setTasks(rows);
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchesPersona = personaFilter === "All" || t.persona === personaFilter;
      const matchesQuery = t.title.toLowerCase().includes(query.toLowerCase()) || t.id.toLowerCase().includes(query.toLowerCase());
      return matchesPersona && matchesQuery;
    });
  }, [tasks, personaFilter, query]);

  const advance = (id) => {
    setTasks((prev) => {
      const next = prev.map((t) => {
        if (t.id !== id) return t;
        const idx = TASK_COLUMNS.findIndex((c) => c.id === t.status);
        const nextCol = TASK_COLUMNS[Math.min(idx + 1, TASK_COLUMNS.length - 1)];
        return { ...t, status: nextCol.id };
      });
      const updated = next.find((t) => t.id === id);
      if (updated) writeSheetRow("Tasks", updated, "id");
      return next;
    });
  };

  const counts = useMemo(() => {
    const c = { todo: 0, inprogress: 0, review: 0, done: 0 };
    filtered.forEach((t) => (c[t.status] += 1));
    return c;
  }, [filtered]);

  return (
    <div>
      <SectionHeader
        title="Task manager"
        description="Cross-functional tasks for site engineering, project management, and billing"
        action={
          <button className="flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-orange-400">
            <Plus size={15} /> New task
          </button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="To do" value={counts.todo} icon={Circle} />
        <MetricCard label="In progress" value={counts.inprogress} icon={CircleDot} />
        <MetricCard label="In review" value={counts.review} icon={FileCheck2} />
        <MetricCard label="Done this week" value={counts.done} icon={CheckCircle2} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks by title or ID"
            className="w-full rounded-md border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none"
          />
        </div>
        <select
          value={personaFilter}
          onChange={(e) => setPersonaFilter(e.target.value)}
          className="rounded-md border border-slate-200 bg-white py-2 px-3 text-sm text-slate-700 focus:border-orange-500/50 focus:outline-none"
        >
          <option>All</option>
          <option>Site Engineer</option>
          <option>Project Manager</option>
          <option>Billing Lead</option>
        </select>
        <div className="flex rounded-md border border-slate-200 p-0.5">
          <button
            onClick={() => setView("board")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs ${view === "board" ? "bg-slate-100 text-slate-900" : "text-slate-600"}`}
          >
            <Kanban size={14} /> Board
          </button>
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs ${view === "list" ? "bg-slate-100 text-slate-900" : "text-slate-600"}`}
          >
            <ListTodo size={14} /> List
          </button>
        </div>
      </div>

      {view === "board" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {TASK_COLUMNS.map((col) => (
            <div key={col.id} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <div className="h-1" style={{ backgroundColor: col.color }} />
              <div className="p-2.5">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-slate-700">{col.label}</span>
                  <span className="rounded-full bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-600 shadow-sm">{filtered.filter((t) => t.status === col.id).length}</span>
                </div>
                <div className="space-y-2">
                  {filtered.filter((t) => t.status === col.id).map((t) => (
                    <TaskCard key={t.id} task={t} onAdvance={advance} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-[11px] uppercase tracking-wide text-slate-600">
                <th className="px-3 py-2.5 font-medium">Task</th>
                <th className="px-3 py-2.5 font-medium">Persona</th>
                <th className="px-3 py-2.5 font-medium">Priority</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Assignee</th>
                <th className="px-3 py-2.5 font-medium">Due</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-slate-200/60 last:border-0 hover:bg-slate-50">
                  <td className="px-3 py-2.5">
                    <p className="text-slate-800">{t.title}</p>
                    <p className="text-[11px] text-slate-600">{t.id} · {t.tag}</p>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">{t.persona}</td>
                  <td className="px-3 py-2.5"><StatusPill tone={priorityTone(t.priority)}>{t.priority}</StatusPill></td>
                  <td className="px-3 py-2.5 text-slate-600">{TASK_COLUMNS.find((c) => c.id === t.status)?.label}</td>
                  <td className="px-3 py-2.5 text-slate-600">{t.assignee}</td>
                  <td className="px-3 py-2.5 tabular-nums text-slate-600">{t.due.slice(5)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------- DPR Form Modal ----------

function DPRFormModal({ open, onClose }) {
  const [hdd, setHdd] = useState(false);
  const [form, setForm] = useState({
    trenching: "", stringing: "", welding: "", ndt: "", coating: "",
    lowering: "", backfilling: "", warningMat: "",
    pilot: "", reaming: "", pullthrough: "",
    safetyTopic: "", attendees: "", hazard: "",
  });
  const [attachments, setAttachments] = useState([]);

  if (!open) return null;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const numField = (label, key, unit) => (
    <div>
      <label className="mb-1 block text-xs text-slate-600">{label} <span className="text-slate-600">({unit})</span></label>
      <input
        type="number"
        value={form[key]}
        onChange={set(key)}
        placeholder="0"
        className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 tabular-nums placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Daily progress report</h2>
            <p className="text-xs text-slate-600">Field entry · optimized for tablet</p>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-800"><X size={18} /></button>
        </div>

        <div className="space-y-6 p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-slate-600">Date</label>
              <input type="date" defaultValue="2026-09-04" className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-800 focus:border-orange-500/50 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-600">Spread / section</label>
              <select className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-800 focus:border-orange-500/50 focus:outline-none">
                <option>Spread 3 (Ch 12+000–18+000)</option>
                <option>Spread 1 (Ch 0+000–6+000)</option>
                <option>Spread 2 (Ch 6+000–12+000)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-600">Weather</label>
              <select className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-800 focus:border-orange-500/50 focus:outline-none">
                <option>Clear</option><option>Overcast</option><option>Rain — stopped work</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-600">Shift</label>
              <select className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-800 focus:border-orange-500/50 focus:outline-none">
                <option>Day (06:00–18:00)</option><option>Night (18:00–06:00)</option>
              </select>
            </div>
          </div>

          <div>
            <h3 className="mb-2.5 text-sm font-semibold text-slate-800">Linear meters completed today</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {numField("Trenching", "trenching", "m")}
              {numField("Stringing", "stringing", "m")}
              {numField("Joint welding", "welding", "qty")}
              {numField("NDT cleared", "ndt", "qty")}
              {numField("Joint coating", "coating", "qty")}
              {numField("Lowering", "lowering", "m")}
              {numField("Backfilling", "backfilling", "m")}
              {numField("Warning mat laid", "warningMat", "m")}
            </div>
          </div>

          <div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={hdd} onChange={() => setHdd(!hdd)} className="h-4 w-4 rounded border-slate-300 bg-slate-50 accent-orange-500" />
              HDD activity today
            </label>
            {hdd && (
              <div className="mt-2.5 grid grid-cols-3 gap-3 rounded-md border border-slate-200 bg-slate-50/50 p-3">
                {numField("Pilot hole", "pilot", "m")}
                {numField("Reaming", "reaming", "m")}
                {numField("Pipe pull-through", "pullthrough", "m")}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-2.5 text-sm font-semibold text-slate-800">Toolbox talk / daily meetup</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-slate-600">Safety briefing topic</label>
                <input value={form.safetyTopic} onChange={set("safetyTopic")} placeholder="e.g. Trench collapse prevention" className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-600">Attendees</label>
                  <input type="number" value={form.attendees} onChange={set("attendees")} placeholder="0" className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 tabular-nums placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-600">Safety hazard / near-miss</label>
                  <input value={form.hazard} onChange={set("hazard")} placeholder="None reported" className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2.5 text-sm font-semibold text-slate-800">Site photos</h3>
            <FileUploader
              tab="DPR"
              recordId={`dpr-${new Date().toISOString().slice(0, 10)}`}
              attachments={attachments}
              onChange={setAttachments}
              accept="image/*"
              label="Attach site photos"
            />
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white px-5 py-3.5">
          <button onClick={onClose} className="rounded-md border border-slate-200 px-3.5 py-2 text-sm text-slate-600 hover:border-slate-300">Cancel</button>
          <button onClick={onClose} className="rounded-md bg-orange-500 px-3.5 py-2 text-sm font-medium text-slate-950 hover:bg-orange-400">Submit DPR</button>
        </div>
      </div>
    </div>
  );
}

function DPRSection({ onOpen }) {
  return (
    <div>
      <SectionHeader
        title="Linear progress & DPR"
        description="Daily progress reports across all active spreads"
        action={
          <button onClick={onOpen} className="flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-orange-400">
            <Plus size={15} /> Log today's DPR
          </button>
        }
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Trenching today" value="640 m" sub="vs 600 m planned" trend="+6.7%" trendTone="success" />
        <MetricCard label="Welding today" value="38 joints" sub="vs 42 planned" trend="-9.5%" trendTone="danger" />
        <MetricCard label="Lowering today" value="410 m" sub="vs 400 m planned" trend="+2.5%" trendTone="success" />
        <MetricCard label="Backfilling today" value="385 m" sub="on Spread 3" />
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-white text-[11px] uppercase tracking-wide text-slate-600">
              <th className="px-3 py-2.5 font-medium">Date</th>
              <th className="px-3 py-2.5 font-medium">Spread</th>
              <th className="px-3 py-2.5 font-medium">Weather</th>
              <th className="px-3 py-2.5 font-medium">Supervisor</th>
              <th className="px-3 py-2.5 font-medium">Trench (m)</th>
              <th className="px-3 py-2.5 font-medium">Weld (qty)</th>
              <th className="px-3 py-2.5 font-medium">Lower (m)</th>
              <th className="px-3 py-2.5 font-medium">Photos</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["2026-09-04", "Spread 3", "Clear", "V. Nair", 640, 38, 410, 6],
              ["2026-09-03", "Spread 3", "Clear", "V. Nair", 590, 44, 380, 4],
              ["2026-09-03", "Spread 2", "Overcast", "R. Meshram", 420, 29, 300, 5],
              ["2026-09-02", "Spread 1", "Clear", "S. Bhoir", 610, 41, 420, 3],
            ].map((r, i) => (
              <tr key={i} className="border-b border-slate-200/60 last:border-0 hover:bg-slate-50">
                <td className="px-3 py-2.5 tabular-nums text-slate-600">{r[0]}</td>
                <td className="px-3 py-2.5 text-slate-600">{r[1]}</td>
                <td className="px-3 py-2.5 text-slate-600"><span className="flex items-center gap-1"><Cloud size={13} />{r[2]}</span></td>
                <td className="px-3 py-2.5 text-slate-600">{r[3]}</td>
                <td className="px-3 py-2.5 tabular-nums text-slate-600">{r[4]}</td>
                <td className="px-3 py-2.5 tabular-nums text-slate-600">{r[5]}</td>
                <td className="px-3 py-2.5 tabular-nums text-slate-600">{r[6]}</td>
                <td className="px-3 py-2.5 text-slate-600"><span className="flex items-center gap-1"><Camera size={13} />{r[7]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Pipe Book Table ----------

function resultTone(r) {
  return r === "Pass" ? "success" : r === "Repair" ? "warning" : r === "Cut-Out" ? "danger" : "neutral";
}

function PipeBookTable() {
  const [query, setQuery] = useState("");
  const [onlyRepairs, setOnlyRepairs] = useState(false);

  const rows = useMemo(() => {
    return PIPE_JOINTS.filter((j) => {
      if (onlyRepairs && !["Repair", "Cut-Out"].includes(j.result)) return false;
      if (query && !j.joint.toLowerCase().includes(query.toLowerCase()) && !j.chainage.includes(query)) return false;
      return true;
    });
  }, [query, onlyRepairs]);

  const handleExport = () => {
    exportToExcel({
      filename: `Medhaan_PipeBook_WeldTracker_${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheets: [
        {
          name: "Weld Register",
          rows: rows.map((j) => ({
            "Joint #": j.joint, Chainage: j.chainage, "Upstream heat #": j.up, "Downstream heat #": j.down,
            "Welder (root/cap)": j.welder, "Weld date": j.date, "NDT method": j.method, "NDT result": j.result,
            "Coating date": j.coating, "Holiday test": j.holiday,
          })),
        },
      ],
    });
  };

  return (
    <div>
      <SectionHeader
        title="Digital pipe book & weld tracker"
        description="Joint-level QA/QC register — weld logs, NDT status, heat number traceability"
        action={
          <div className="flex gap-2">
            <ExportButton onClick={handleExport} label="Export to Excel" />
            <button className="flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-orange-400">
              <Plus size={15} /> Log inspection result
            </button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search joint # or chainage"
            className="w-full rounded-md border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none"
          />
        </div>
        <select className="rounded-md border border-slate-200 bg-white py-2 px-3 text-sm text-slate-700 focus:border-orange-500/50 focus:outline-none">
          <option>All welders</option><option>W-07 / W-11</option><option>W-03 / W-09</option><option>W-05 / W-02</option>
        </select>
        <select className="rounded-md border border-slate-200 bg-white py-2 px-3 text-sm text-slate-700 focus:border-orange-500/50 focus:outline-none">
          <option>All NDT agencies</option><option>NDT-1</option><option>NDT-2</option>
        </select>
        <label className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          <input type="checkbox" checked={onlyRepairs} onChange={() => setOnlyRepairs(!onlyRepairs)} className="h-3.5 w-3.5 accent-orange-500" />
          Pending repairs only
        </label>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-white text-[11px] uppercase tracking-wide text-slate-600">
              <th className="px-3 py-2.5 font-medium">Joint #</th>
              <th className="px-3 py-2.5 font-medium">Chainage</th>
              <th className="px-3 py-2.5 font-medium">Up heat #</th>
              <th className="px-3 py-2.5 font-medium">Down heat #</th>
              <th className="px-3 py-2.5 font-medium">Welder (root/cap)</th>
              <th className="px-3 py-2.5 font-medium">Weld date</th>
              <th className="px-3 py-2.5 font-medium">NDT method</th>
              <th className="px-3 py-2.5 font-medium">NDT result</th>
              <th className="px-3 py-2.5 font-medium">Coating date</th>
              <th className="px-3 py-2.5 font-medium">Holiday test</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((j) => (
              <tr key={j.joint} className="border-b border-slate-200/60 font-mono text-[13px] last:border-0 hover:bg-slate-50">
                <td className="px-3 py-2.5 text-slate-800">{j.joint}</td>
                <td className="px-3 py-2.5 text-slate-600">{j.chainage}</td>
                <td className="px-3 py-2.5 text-slate-600">{j.up}</td>
                <td className="px-3 py-2.5 text-slate-600">{j.down}</td>
                <td className="px-3 py-2.5 text-slate-600">{j.welder}</td>
                <td className="px-3 py-2.5 text-slate-600">{j.date}</td>
                <td className="px-3 py-2.5 text-slate-600">{j.method}</td>
                <td className="px-3 py-2.5"><StatusPill tone={resultTone(j.result)}>{j.result}</StatusPill></td>
                <td className="px-3 py-2.5 text-slate-600">{j.coating}</td>
                <td className="px-3 py-2.5">
                  {j.holiday === "-" ? <span className="text-slate-500">—</span> : <StatusPill tone={j.holiday === "Pass" ? "success" : "danger"}>{j.holiday}</StatusPill>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Pre-Commissioning ----------

function PreCommissioning() {
  const tieins = [
    { name: "CGS-1 (Ch 0+000)", type: "CGS", status: "Commissioned" },
    { name: "DRS-2 (Ch 8+200)", type: "DRS", status: "Hydrotest complete" },
    { name: "MRS-3 (Ch 14+600)", type: "MRS", status: "Flushing in progress" },
    { name: "DRS-4 (Ch 21+100)", type: "DRS", status: "Pending tie-in" },
  ];
  const toneFor = (s) =>
    s === "Commissioned" ? "success" : s === "Hydrotest complete" ? "active" : s === "Flushing in progress" ? "warning" : "neutral";

  return (
    <div>
      <SectionHeader title="Pre-commissioning & hookups" description="Hydrotesting, flushing, and CGS / DRS / MRS tie-in matrix" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Hydrotest packages passed" value="9 / 14" sub="64% complete" icon={CheckCircle2} />
        <MetricCard label="Flushing complete" value="6 / 14" sub="43% complete" icon={Gauge} />
        <MetricCard label="Tie-ins commissioned" value="1 / 4" icon={Wrench} />
        <MetricCard label="Pending punch items" value="18" trend="-4 wk" trendTone="success" icon={FileCheck2} />
      </div>

      <div className="mt-4 rounded-lg border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">CGS / DRS / MRS tie-in matrix</h3>
        <div className="space-y-2">
          {tieins.map((t) => (
            <div key={t.name} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3.5 py-2.5">
              <div className="flex items-center gap-3">
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">{t.type}</span>
                <span className="text-sm text-slate-800">{t.name}</span>
              </div>
              <StatusPill tone={toneFor(t.status)}>{t.status}</StatusPill>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Financial Overview (Budget) ----------

function FinancialOverview() {
  const sanctioned = COST_HEADS.reduce((s, c) => s + c.budget, 0);
  const committed = COST_HEADS.reduce((s, c) => s + c.committed, 0);
  const incurred = COST_HEADS.reduce((s, c) => s + c.incurred, 0);
  const certified = 388900000;
  const cashReceived = 342100000;

  const handleExport = () => {
    exportToExcel({
      filename: `Medhaan_Financials_${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheets: [
        {
          name: "Summary",
          rows: [
            { Metric: "Sanctioned budget (INR)", Value: sanctioned },
            { Metric: "Committed - POs (INR)", Value: committed },
            { Metric: "Incurred site expense (INR)", Value: incurred },
            { Metric: "Certified billed (INR)", Value: certified },
            { Metric: "Cash received (INR)", Value: cashReceived },
          ],
        },
        {
          name: "Cost Head Breakdown",
          rows: COST_HEADS.map((c) => ({
            "Cost head": c.head, "Allocated (INR)": c.budget, "Committed (INR)": c.committed,
            "Incurred (INR)": c.incurred, "Variance %": (((c.budget - c.incurred) / c.budget) * 100).toFixed(1),
            "CPI": (c.budget / (c.incurred || 1)).toFixed(2),
          })),
        },
        {
          name: "RA Billing Pipeline",
          rows: RA_BILLS.map((b) => ({ "RA Bill": b.id, "Value (INR)": b.value, Stage: RA_STAGES[b.stage] })),
        },
      ],
    });
  };

  return (
    <div>
      <SectionHeader
        title="Budget, cost code & cashflow controller"
        description="Sanctioned budget, commitments, actuals, and RA billing pipeline"
        action={<ExportButton onClick={handleExport} />}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <MetricCard label="Sanctioned budget" value={inrCr(sanctioned)} />
        <MetricCard label="Committed (POs)" value={inrCr(committed)} sub={pct((committed / sanctioned) * 100) + " of budget"} />
        <MetricCard label="Incurred site expense" value={inrCr(incurred)} sub={pct((incurred / sanctioned) * 100) + " of budget"} />
        <MetricCard label="Certified billed" value={inrCr(certified)} icon={FileCheck2} />
        <MetricCard label="Cash received" value={inrCr(cashReceived)} trend={pct((cashReceived / certified) * 100) + " realized"} trendTone="success" />
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-white text-[11px] uppercase tracking-wide text-slate-600">
              <th className="px-3 py-2.5 font-medium">Cost head</th>
              <th className="px-3 py-2.5 font-medium text-right">Allocated</th>
              <th className="px-3 py-2.5 font-medium text-right">Committed</th>
              <th className="px-3 py-2.5 font-medium text-right">Incurred</th>
              <th className="px-3 py-2.5 font-medium text-right">Variance</th>
              <th className="px-3 py-2.5 font-medium text-right">CPI</th>
            </tr>
          </thead>
          <tbody>
            {COST_HEADS.map((c) => {
              const variance = ((c.budget - c.incurred) / c.budget) * 100;
              const cpi = c.budget / (c.incurred || 1);
              const over = variance < 0;
              return (
                <tr key={c.head} className="border-b border-slate-200/60 last:border-0 hover:bg-slate-50">
                  <td className="px-3 py-2.5 text-slate-800">{c.head}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-600">{inrCr(c.budget)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-600">{inrCr(c.committed)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-600">{inrCr(c.incurred)}</td>
                  <td className={`px-3 py-2.5 text-right tabular-nums font-medium ${over ? "text-rose-600" : "text-emerald-600"}`}>
                    {variance >= 0 ? "+" : ""}{variance.toFixed(1)}%
                  </td>
                  <td className={`px-3 py-2.5 text-right tabular-nums font-medium ${cpi < 1 ? "text-rose-600" : "text-emerald-600"}`}>{cpi.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-4">
        <h3 className="mb-3.5 text-sm font-semibold text-slate-800">RA billing pipeline</h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {RA_STAGES.map((stage, i) => (
            <div key={stage} className="min-w-[170px] flex-1 rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-[11px] font-medium text-slate-600">{stage}</p>
              <div className="space-y-1.5">
                {RA_BILLS.filter((b) => b.stage === i).map((b) => (
                  <div key={b.id} className="rounded border border-slate-200 bg-white px-2 py-1.5">
                    <p className="text-xs font-medium text-slate-800">{b.id}</p>
                    <p className="text-[11px] tabular-nums text-slate-600">{inrCr(b.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- BOQ Item Tracker (RFQ item -> milestone step ledger) ----------
// Mirrors the client's CGD projection sheet: each BOQ/RFQ line item
// (pipe size/method) breaks into weighted milestone steps with a
// per-unit rate; progress is entered as completed quantity per step.

function BOQItemTracker() {
  const [items, setItems] = useState(BOQ_ITEMS_SEED);
  const [openItem, setOpenItem] = useState("boq-1");
  const [editingStep, setEditingStep] = useState(null);
  const [draftQty, setDraftQty] = useState("");
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({ desc: "", uom: "M", qty: "", rate: "" });

  // BOQItems + BOQSteps are two tabs in the sheet; merge them into the
  // nested { ...item, steps: [...] } shape the UI expects.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [itemRows, stepRows] = await Promise.all([
        readSheetTab("BOQItems", null),
        readSheetTab("BOQSteps", null),
      ]);
      if (cancelled || !itemRows || itemRows.length === 0) return;
      const merged = itemRows.map((it) => ({
        ...it,
        qty: parseFloat(it.qty) || 0,
        rate: parseFloat(it.rate) || 0,
        steps: (stepRows || [])
          .filter((st) => st.itemId === it.id)
          .map((st) => ({
            id: `${it.id}-${st.label}`,
            label: st.label, desc: st.desc,
            pct: parseFloat(st.pct) || 0, rate: parseFloat(st.rate) || 0, doneQty: parseFloat(st.doneQty) || 0,
          })),
      }));
      setItems(merged);
    })();
    return () => { cancelled = true; };
  }, []);

  const itemAmount = (it) => it.qty * it.rate;
  const itemDoneAmount = (it) => it.steps.reduce((s, st) => s + st.doneQty * st.rate, 0);
  const itemDonePct = (it) => {
    const totalWeighted = it.steps.reduce((s, st) => s + st.pct, 0) || 1;
    const doneWeighted = it.steps.reduce((s, st) => s + (it.qty ? (st.doneQty / it.qty) * st.pct : 0), 0);
    return (doneWeighted / totalWeighted) * 100;
  };

  const totals = useMemo(() => {
    const totalValue = items.reduce((s, it) => s + itemAmount(it), 0);
    const totalDone = items.reduce((s, it) => s + itemDoneAmount(it), 0);
    return { totalValue, totalDone };
  }, [items]);

  const overheadMonthly = OVERHEADS_SEED.reduce((s, o) => s + o.monthly, 0);

  const startEditStep = (itemId, step) => {
    setEditingStep(`${itemId}::${step.id}`);
    setDraftQty(String(step.doneQty));
  };

  const saveStepQty = (itemId, stepId) => {
    const val = parseFloat(draftQty);
    if (isNaN(val) || val < 0) return;
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        const updatedSteps = it.steps.map((st) => (st.id === stepId ? { ...st, doneQty: Math.min(val, it.qty) } : st));
        const changedStep = updatedSteps.find((st) => st.id === stepId);
        if (changedStep) {
          writeSheetRow("BOQSteps", { itemId, label: changedStep.label, desc: changedStep.desc, pct: changedStep.pct, rate: changedStep.rate, doneQty: changedStep.doneQty }, "itemId");
        }
        return { ...it, steps: updatedSteps };
      })
    );
    setEditingStep(null);
  };

  const addBoqItem = () => {
    if (!newItem.desc.trim() || !newItem.qty || !newItem.rate) return;
    const id = `boq-custom-${Date.now()}`;
    const row = {
      id, sr: items.length + 1, rfqNo: "manual", serviceCode: "—",
      desc: newItem.desc, uom: newItem.uom || "M", qty: parseFloat(newItem.qty), rate: parseFloat(newItem.rate),
      steps: [{ id: `${id}-s1`, label: "a", desc: "Completion of all work", pct: 1, rate: parseFloat(newItem.rate), doneQty: 0 }],
    };
    setItems((prev) => [...prev, row]);
    setNewItem({ desc: "", uom: "M", qty: "", rate: "" });
    setAddingItem(false);
    setOpenItem(id);
    writeSheetRow("BOQItems", { id: row.id, sr: row.sr, rfqNo: row.rfqNo, desc: row.desc, uom: row.uom, qty: row.qty, rate: row.rate }, "id");
    writeSheetRow("BOQSteps", { itemId: id, label: "a", desc: "Completion of all work", pct: 1, rate: row.rate, doneQty: 0 }, "itemId");
  };

  const handleExport = () => {
    exportToExcel({
      filename: `Medhaan_BOQ_Tracker_${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheets: [
        {
          name: "BOQ Summary",
          rows: items.map((it) => ({
            "Sr": it.sr, "RFQ No": it.rfqNo, "Description": it.desc, "UOM": it.uom,
            "Quantity": it.qty, "Rate": it.rate, "Total value (INR)": itemAmount(it),
            "Value completed (INR)": Math.round(itemDoneAmount(it)), "% complete": itemDonePct(it).toFixed(1),
          })),
        },
        {
          name: "Milestone Steps",
          rows: items.flatMap((it) =>
            it.steps.map((st) => ({
              "BOQ Sr": it.sr, "Item": it.desc, "Step": st.label, "Milestone": st.desc,
              "Weight %": (st.pct * 100).toFixed(0), "Rate per unit": st.rate,
              "Qty done": st.doneQty, "Qty target": it.qty, "Amount (INR)": Math.round(st.doneQty * st.rate),
            }))
          ),
        },
        {
          name: "Monthly Overheads",
          rows: OVERHEADS_SEED.map((o) => ({ Head: o.head, "Monthly (INR)": o.monthly })),
        },
      ],
    });
  };

  return (
    <div>
      <SectionHeader
        title="BOQ item tracker"
        description="RFQ / BOQ line items broken into milestone steps with per-unit rate — same structure as the client projection sheet"
        action={
          <div className="flex gap-2">
            <ExportButton onClick={handleExport} />
            <button onClick={() => setAddingItem(true)} className="flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-orange-400">
              <Plus size={15} /> Add BOQ item
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Total BOQ value" value={inr(totals.totalValue)} icon={Wallet} />
        <MetricCard label="Value completed" value={inr(totals.totalDone)} trend={pct((totals.totalDone / totals.totalValue) * 100) + " billed-eligible"} trendTone="success" icon={Gauge} />
        <MetricCard label="BOQ line items" value={items.length} icon={FileCheck2} />
        <MetricCard label="Monthly overheads" value={inr(overheadMonthly)} sub="salary, imprest, deptt, GH+vehicle, interest" icon={PackageSearch} />
      </div>

      {addingItem && (
        <div className="mt-4 rounded-lg border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-4">
          <p className="mb-2.5 text-sm font-semibold text-slate-800">New BOQ line item</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <input value={newItem.desc} onChange={(e) => setNewItem((d) => ({ ...d, desc: e.target.value }))} placeholder="Item description" className="col-span-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none" />
            <input value={newItem.uom} onChange={(e) => setNewItem((d) => ({ ...d, uom: e.target.value }))} placeholder="UOM (M, KM, LS...)" className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none" />
            <input type="number" value={newItem.qty} onChange={(e) => setNewItem((d) => ({ ...d, qty: e.target.value }))} placeholder="Quantity" className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm tabular-nums text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none" />
            <input type="number" value={newItem.rate} onChange={(e) => setNewItem((d) => ({ ...d, rate: e.target.value }))} placeholder="Rate / unit" className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm tabular-nums text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none" />
          </div>
          <div className="mt-2.5 flex gap-2">
            <button onClick={addBoqItem} className="rounded-md bg-orange-500 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-orange-400">Add item</button>
            <button onClick={() => setAddingItem(false)} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-slate-300">Cancel</button>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {items.map((it) => {
          const isOpen = openItem === it.id;
          const donePct = itemDonePct(it);
          const doneAmt = itemDoneAmount(it);
          const totalAmt = itemAmount(it);
          return (
            <div key={it.id} className="overflow-hidden rounded-lg border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60">
              <div className="h-1" style={{ backgroundColor: donePct >= 100 ? "#059669" : donePct > 0 ? "#ff6b1a" : "#94a3b8" }} />
              <button onClick={() => setOpenItem(isOpen ? null : it.id)} className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-slate-600 tabular-nums">Sr {it.sr}</span>
                    <p className="truncate text-sm font-semibold text-slate-900">{it.desc}</p>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    {it.uom} · Qty {it.qty.toLocaleString("en-IN")} · Rate {inr(it.rate)}/{it.uom} · RFQ {it.rfqNo}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <div className="hidden text-right sm:block">
                    <p className="text-xs tabular-nums text-slate-600">{inr(doneAmt)} / {inr(totalAmt)}</p>
                    <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(donePct, 100)}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-medium tabular-nums text-slate-600">{donePct.toFixed(0)}%</span>
                  <ChevronDown size={16} className={`text-slate-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-slate-200 px-4 pb-4 pt-1">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wide text-slate-600">
                          <th className="py-2 pr-3 font-medium">Step</th>
                          <th className="py-2 pr-3 font-medium">Milestone</th>
                          <th className="py-2 pr-3 text-right font-medium">Weight</th>
                          <th className="py-2 pr-3 text-right font-medium">Rate / {it.uom}</th>
                          <th className="py-2 pr-3 text-right font-medium">Qty done</th>
                          <th className="py-2 pr-3 text-right font-medium">Amount</th>
                          <th className="py-2 pl-1 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {it.steps.map((st) => {
                          const key = `${it.id}::${st.id}`;
                          const isEditing = editingStep === key;
                          const complete = st.doneQty >= it.qty && it.qty > 0;
                          return (
                            <tr key={st.id} className="border-t border-slate-200/60">
                              <td className="py-2 pr-3 font-mono text-xs text-slate-600">{st.label})</td>
                              <td className="py-2 pr-3 text-slate-800">{st.desc}</td>
                              <td className="py-2 pr-3 text-right tabular-nums text-slate-600">{(st.pct * 100).toFixed(0)}%</td>
                              <td className="py-2 pr-3 text-right tabular-nums text-slate-600">{inr(st.rate)}</td>
                              <td className="py-2 pr-3 text-right">
                                {isEditing ? (
                                  <div className="flex items-center justify-end gap-1">
                                    <input
                                      autoFocus
                                      type="number"
                                      value={draftQty}
                                      onChange={(e) => setDraftQty(e.target.value)}
                                      onKeyDown={(e) => e.key === "Enter" && saveStepQty(it.id, st.id)}
                                      className="w-24 rounded border border-slate-300 bg-slate-50 px-2 py-1 text-right text-xs tabular-nums text-slate-800 focus:border-orange-500/50 focus:outline-none"
                                    />
                                    <button onClick={() => saveStepQty(it.id, st.id)} className="text-emerald-600 hover:text-emerald-700"><Check size={14} /></button>
                                  </div>
                                ) : (
                                  <button onClick={() => startEditStep(it.id, st)} className="tabular-nums text-slate-600 hover:text-orange-600">
                                    {st.doneQty.toLocaleString("en-IN")} / {it.qty.toLocaleString("en-IN")}
                                  </button>
                                )}
                              </td>
                              <td className="py-2 pr-3 text-right tabular-nums text-slate-600">{inr(st.doneQty * st.rate)}</td>
                              <td className="py-2 pl-1 text-right">
                                {complete ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Circle size={14} className="text-slate-500" />}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-600">Click a "Qty done" cell to log progress against that milestone step.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Monthly overheads</h3>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          {OVERHEADS_SEED.map((o) => (
            <div key={o.id} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <p className="text-[11px] text-slate-600">{o.head}</p>
              <p className="mt-0.5 text-sm font-medium tabular-nums text-slate-800">{inr(o.monthly)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Resource Rate Tracker ----------

// NOTE: built lazily inside the component (not at module load time). In
// this no-build setup, icon components are attached to `window` by
// icon-shim.js; referencing them as bare identifiers at module-evaluation
// time risks capturing `undefined` if anything runs out of order, and that
// `undefined` would be baked into this object permanently. Building it
// inside the component guarantees icon-shim.js has already run first.
function getResourceIcons() {
  return { flame: Flame, radio: Radio, fuel: Fuel, hammer: Hammer, wallet: Wallet, shield: Shield };
}
const RESOURCE_COLORS = {
  welding: "#ff6b1a", radiography: "#1d5a8a", diesel: "#b45309",
  consumables: "#7c3aed", imprest: "#059669", restorations: "#0f2942",
};

function ResourceRateTracker() {
  const [categories, setCategories] = useState(RESOURCE_CATEGORIES_SEED);
  const [openCat, setOpenCat] = useState("welding");
  const [addingFor, setAddingFor] = useState(null);
  const [draft, setDraft] = useState({ item: "", unit: "", rate: "", qty: "", budgeted: "", actual: "" });

  // The Resources sheet tab is a flat list keyed by category name; group
  // rows back into each category's items[] to match the UI shape.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows = await readSheetTab("Resources", null);
      if (cancelled || !rows || rows.length === 0) return;
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          items: rows
            .filter((r) => r.category === cat.name)
            .map((r, idx) => ({
              id: `${cat.id}-sheet-${idx}`,
              item: r.item, unit: r.unit,
              rate: parseFloat(r.rate) || 0, qty: parseFloat(r.qty) || 0,
              budgeted: parseFloat(r.budgeted) || 0, actual: parseFloat(r.actual) || 0,
            })),
        }))
      );
    })();
    return () => { cancelled = true; };
  }, []);

  const totals = useMemo(() => {
    let budgeted = 0, actual = 0;
    categories.forEach((c) => c.items.forEach((i) => { budgeted += i.budgeted; actual += i.actual; }));
    return { budgeted, actual };
  }, [categories]);

  const catTotals = (cat) => {
    const budgeted = cat.items.reduce((s, i) => s + i.budgeted, 0);
    const actual = cat.items.reduce((s, i) => s + i.actual, 0);
    return { budgeted, actual };
  };

  const startAdd = (catId) => {
    setAddingFor(catId);
    setDraft({ item: "", unit: "", rate: "", qty: "", budgeted: "", actual: "" });
  };

  const saveDraft = (catId) => {
    if (!draft.item.trim() || !draft.rate || !draft.qty) return;
    const rate = parseFloat(draft.rate) || 0;
    const qty = parseFloat(draft.qty) || 0;
    const budgeted = draft.budgeted ? parseFloat(draft.budgeted) : rate * qty;
    const actual = draft.actual ? parseFloat(draft.actual) : 0;
    const cat = categories.find((c) => c.id === catId);
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? { ...c, items: [...c.items, { id: `${catId}-${Date.now()}`, item: draft.item, unit: draft.unit || "unit", rate, qty, budgeted, actual }] }
          : c
      )
    );
    setAddingFor(null);
    if (cat) {
      writeSheetRow("Resources", { category: cat.name, item: draft.item, unit: draft.unit || "unit", rate, qty, budgeted, actual }, "item");
    }
  };

  const removeItem = (catId, itemId) => {
    setCategories((prev) => prev.map((c) => (c.id === catId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c)));
  };

  return (
    <div>
      <SectionHeader
        title="Resource rate tracker"
        description="Rate-wise tracking of welding, radiography, diesel, consumables, imprest and restoration for project completion"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Total budgeted" value={inrCr(totals.budgeted)} icon={Wallet} />
        <MetricCard label="Total actual spend" value={inrCr(totals.actual)} icon={Gauge} />
        <MetricCard
          label="Overall variance"
          value={pct(((totals.budgeted - totals.actual) / totals.budgeted) * 100)}
          trend={totals.actual <= totals.budgeted ? "Within budget" : "Over budget"}
          trendTone={totals.actual <= totals.budgeted ? "success" : "danger"}
        />
        <MetricCard label="Resource categories" value={categories.length} icon={PackageSearch} />
      </div>

      <div className="mt-4 space-y-3">
        {categories.map((cat) => {
          const Icon = getResourceIcons()[cat.icon] || PackageSearch;
          const catColor = RESOURCE_COLORS[cat.id] || "#ff6b1a";
          const ct = catTotals(cat);
          const over = ct.actual > ct.budgeted;
          const isOpen = openCat === cat.id;
          return (
            <div key={cat.id} className="overflow-hidden rounded-lg border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60">
              <button
                onClick={() => setOpenCat(isOpen ? null : cat.id)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${catColor}18`, color: catColor }}
                  >
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{cat.name}</p>
                    <p className="text-[11px] text-slate-600">{cat.items.length} rate items</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden text-right text-xs tabular-nums sm:block">
                    <p className="text-slate-600">{inrCr(ct.actual)} / {inrCr(ct.budgeted)}</p>
                    <p className={over ? "text-rose-600" : "text-emerald-600"}>{over ? "over" : "under"} budget</p>
                  </div>
                  <ChevronDown size={16} className={`text-slate-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-slate-200 px-4 pb-4 pt-1">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left text-sm">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wide text-slate-600">
                          <th className="py-2 pr-3 font-medium">Item</th>
                          <th className="py-2 pr-3 font-medium">Unit</th>
                          <th className="py-2 pr-3 text-right font-medium">Rate</th>
                          <th className="py-2 pr-3 text-right font-medium">Qty</th>
                          <th className="py-2 pr-3 text-right font-medium">Budgeted</th>
                          <th className="py-2 pr-3 text-right font-medium">Actual</th>
                          <th className="py-2 pr-3 text-right font-medium">Variance</th>
                          <th className="py-2 pl-1 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cat.items.map((i) => {
                          const variance = ((i.budgeted - i.actual) / i.budgeted) * 100;
                          return (
                            <tr key={i.id} className="border-t border-slate-200/60">
                              <td className="py-2 pr-3 text-slate-800">{i.item}</td>
                              <td className="py-2 pr-3 text-slate-600">{i.unit}</td>
                              <td className="py-2 pr-3 text-right tabular-nums text-slate-600">{inr(i.rate)}</td>
                              <td className="py-2 pr-3 text-right tabular-nums text-slate-600">{i.qty.toLocaleString("en-IN")}</td>
                              <td className="py-2 pr-3 text-right tabular-nums text-slate-600">{inr(i.budgeted)}</td>
                              <td className="py-2 pr-3 text-right tabular-nums text-slate-600">{inr(i.actual)}</td>
                              <td className={`py-2 pr-3 text-right tabular-nums font-medium ${variance < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                {variance >= 0 ? "+" : ""}{variance.toFixed(1)}%
                              </td>
                              <td className="py-2 pl-1 text-right">
                                <button onClick={() => removeItem(cat.id, i.id)} className="text-slate-500 hover:text-rose-600">
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {addingFor === cat.id ? (
                    <div className="mt-3 grid grid-cols-2 gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-6">
                      <input value={draft.item} onChange={(e) => setDraft((d) => ({ ...d, item: e.target.value }))} placeholder="Item description" className="col-span-2 rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none sm:col-span-1" />
                      <input value={draft.unit} onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))} placeholder="Unit" className="rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none" />
                      <input type="number" value={draft.rate} onChange={(e) => setDraft((d) => ({ ...d, rate: e.target.value }))} placeholder="Rate" className="rounded border border-slate-200 bg-white px-2 py-1.5 text-xs tabular-nums text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none" />
                      <input type="number" value={draft.qty} onChange={(e) => setDraft((d) => ({ ...d, qty: e.target.value }))} placeholder="Qty" className="rounded border border-slate-200 bg-white px-2 py-1.5 text-xs tabular-nums text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none" />
                      <input type="number" value={draft.actual} onChange={(e) => setDraft((d) => ({ ...d, actual: e.target.value }))} placeholder="Actual (optional)" className="rounded border border-slate-200 bg-white px-2 py-1.5 text-xs tabular-nums text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none" />
                      <div className="col-span-2 flex gap-2 sm:col-span-6">
                        <button onClick={() => saveDraft(cat.id)} className="flex items-center gap-1 rounded bg-orange-500 px-2.5 py-1.5 text-xs font-medium text-slate-950 hover:bg-orange-400">
                          <Check size={12} /> Add item
                        </button>
                        <button onClick={() => setAddingFor(null)} className="rounded border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:border-slate-300">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => startAdd(cat.id)} className="mt-3 flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-600">
                      <Plus size={13} /> Add rate item
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Checklists (manual item lists) ----------

function ChecklistCard({ list, onToggle, onAdd, onRemove }) {
  const [draft, setDraft] = useState("");
  const doneCount = list.items.filter((i) => i.done).length;
  const donePct = list.items.length ? (doneCount / list.items.length) * 100 : 0;
  const barColor = donePct === 100 ? "#059669" : donePct > 0 ? "#ff6b1a" : "#94a3b8";

  const submit = () => {
    if (!draft.trim()) return;
    onAdd(list.id, draft.trim());
    setDraft("");
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60">
      <div className="h-1" style={{ backgroundColor: barColor }} />
      <div className="p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{list.title}</p>
          <p className="text-[11px] text-slate-600">{list.context} · {doneCount} / {list.items.length} complete</p>
        </div>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full transition-all" style={{ width: `${donePct}%`, backgroundColor: barColor }} />
      </div>

      <ul className="mt-3 space-y-1.5">
        {list.items.map((item) => (
          <li key={item.id} className="group flex items-center gap-2 rounded-md px-1.5 py-1.5 hover:bg-slate-50">
            <button onClick={() => onToggle(list.id, item.id)} className="shrink-0 text-slate-600">
              {item.done ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Circle size={16} />}
            </button>
            <span className={`flex-1 text-sm ${item.done ? "text-slate-600 line-through" : "text-slate-800"}`}>{item.label}</span>
            <button onClick={() => onRemove(list.id, item.id)} className="shrink-0 text-slate-500 opacity-0 hover:text-rose-600 group-hover:opacity-100">
              <Trash2 size={13} />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Add a list item"
          className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none"
        />
        <button onClick={submit} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:border-slate-300">
          <Plus size={13} />
        </button>
      </div>
      </div>
    </div>
  );
}

function Checklists() {
  const [lists, setLists] = useState(CHECKLISTS_SEED);
  const [newListOpen, setNewListOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContext, setNewContext] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows = await readSheetTab("Checklists", null);
      if (cancelled || !rows || rows.length === 0) return;
      const byList = {};
      rows.forEach((r) => {
        if (!byList[r.listId]) byList[r.listId] = { id: r.listId, title: r.title, context: r.context, items: [] };
        byList[r.listId].items.push({
          id: `${r.listId}-${byList[r.listId].items.length}`,
          label: r.itemLabel,
          done: r.done === true || r.done === "TRUE" || r.done === "true",
        });
      });
      setLists(Object.values(byList));
    })();
    return () => { cancelled = true; };
  }, []);

  const toggle = (listId, itemId) =>
    setLists((prev) => {
      const next = prev.map((l) => (l.id === listId ? { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)) } : l));
      const list = next.find((l) => l.id === listId);
      const item = list?.items.find((i) => i.id === itemId);
      if (list && item) {
        writeSheetRow("Checklists", { listId, title: list.title, context: list.context, itemLabel: item.label, done: item.done }, "listId");
      }
      return next;
    });

  const addItem = (listId, label) =>
    setLists((prev) => {
      const next = prev.map((l) => (l.id === listId ? { ...l, items: [...l.items, { id: `${listId}-${Date.now()}`, label, done: false }] } : l));
      const list = next.find((l) => l.id === listId);
      if (list) writeSheetRow("Checklists", { listId, title: list.title, context: list.context, itemLabel: label, done: false }, "listId");
      return next;
    });

  const removeItem = (listId, itemId) =>
    setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, items: l.items.filter((i) => i.id !== itemId) } : l)));

  const createList = () => {
    if (!newTitle.trim()) return;
    const id = `cl-${Date.now()}`;
    setLists((prev) => [...prev, { id, title: newTitle.trim(), context: newContext.trim() || "Custom list", items: [] }]);
    setNewTitle("");
    setNewContext("");
    setNewListOpen(false);
  };

  return (
    <div>
      <SectionHeader
        title="Checklists"
        description="Manually build and track item lists for anything — materials, mobilization, punch lists, approvals"
        action={
          <button onClick={() => setNewListOpen(true)} className="flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-orange-400">
            <Plus size={15} /> New checklist
          </button>
        }
      />

      {newListOpen && (
        <div className="mb-4 rounded-lg border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Checklist title" className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none sm:col-span-2" />
            <input value={newContext} onChange={(e) => setNewContext(e.target.value)} placeholder="Context (e.g. Material list)" className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none" />
          </div>
          <div className="mt-2.5 flex gap-2">
            <button onClick={createList} className="rounded-md bg-orange-500 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-orange-400">Create</button>
            <button onClick={() => setNewListOpen(false)} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-slate-300">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {lists.map((list) => (
          <ChecklistCard key={list.id} list={list} onToggle={toggle} onAdd={addItem} onRemove={removeItem} />
        ))}
      </div>
    </div>
  );
}

// ---------- Projects (client / location switcher) ----------

function statusTone(s) {
  return s === "Active" ? "success" : s === "On hold" ? "warning" : s === "Completed" ? "active" : "neutral";
}

const EMPTY_PROJECT_FORM = { name: "", client: "", location: "", length: "", status: "Active", contract: "", startDate: "", finishDate: "", value: "" };

// ---------- Google Sheets connection card ----------

function GoogleSheetsConnectCard({ onConnected }) {
  const [url, setUrl] = useState(getSheetsConfig().webAppUrl || "");
  const [status, setStatus] = useState(getSheetsConfig().connected ? "connected" : "idle"); // idle | testing | connected | error
  const [errorMsg, setErrorMsg] = useState("");
  const [expanded, setExpanded] = useState(!getSheetsConfig().connected);

  const testConnection = async () => {
    if (!url.trim()) return;
    setStatus("testing");
    setErrorMsg("");
    try {
      const res = await fetch(`${url.trim()}?action=ping`);
      if (!res.ok) throw new Error(`Responded with ${res.status}`);
      const data = await res.json();
      if (data.ok) {
        setSheetsConfig({ webAppUrl: url.trim(), connected: true });
        setStatus("connected");
        if (onConnected) onConnected();
      } else {
        throw new Error("Unexpected response from script");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Could not reach the script URL");
    }
  };

  const disconnect = () => {
    setSheetsConfig({ webAppUrl: "", connected: false });
    setUrl("");
    setStatus("idle");
    setExpanded(true);
  };

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 shadow-sm">
      <button onClick={() => setExpanded(!expanded)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: status === "connected" ? "#ecfdf5" : "#f0f9ff" }}
          >
            <FileSpreadsheet size={17} style={{ color: status === "connected" ? "#059669" : "#1d5a8a" }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Google Sheets connection</p>
            <p className="text-xs text-slate-600">
              {status === "connected"
                ? "Connected — this app reads and writes live to your sheet"
                : "Not connected — showing local sample data"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === "connected" && <StatusPill tone="success"><Check size={11} /> Live</StatusPill>}
          <ChevronDown size={16} className={`text-slate-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4">
          {status === "connected" ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-600">Connected script URL</p>
                <p className="mt-0.5 max-w-md truncate text-xs text-slate-600">{url}</p>
              </div>
              <button onClick={disconnect} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-rose-300 hover:text-rose-600">
                Disconnect
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-600">
                Paste your Google Apps Script Web App URL to connect this app to your shared spreadsheet.
                This works once the app is hosted somewhere with internet access — see the setup guide included
                with this build (<code className="rounded bg-slate-100 px-1 py-0.5">sheets-apps-script.gs</code>).
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="min-w-[280px] flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                />
                <button
                  onClick={testConnection}
                  disabled={status === "testing" || !url.trim()}
                  className="flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium text-white disabled:opacity-50"
                  style={{ backgroundColor: "#1d5a8a" }}
                >
                  {status === "testing" ? "Testing…" : "Connect"}
                </button>
              </div>
              {status === "error" && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-600">
                  <AlertTriangle size={12} /> {errorMsg}. Check the deployment is set to "Anyone with the link" and try again.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectFormFields({ form, setForm }) {
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      <input value={form.name} onChange={set("name")} placeholder="Project name" className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none sm:col-span-2" />
      <input value={form.client} onChange={set("client")} placeholder="Client (e.g. GAIL, BPCL, BGCL)" className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none" />
      <input value={form.location} onChange={set("location")} placeholder="Location" className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none" />
      <input value={form.length} onChange={set("length")} placeholder="Spread length (e.g. 12.5 km)" className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none" />
      <select value={form.status} onChange={set("status")} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-orange-500/50 focus:outline-none">
        <option>Active</option>
        <option>On hold</option>
        <option>Completed</option>
      </select>
      <input value={form.contract} onChange={set("contract")} placeholder="Contract ref / PMC" className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none sm:col-span-2" />
      <div>
        <label className="mb-1 block text-xs text-slate-500">Start date</label>
        <input type="date" value={form.startDate} onChange={set("startDate")} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-orange-500/50 focus:outline-none" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-500">Finish date</label>
        <input type="date" value={form.finishDate} onChange={set("finishDate")} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-orange-500/50 focus:outline-none" />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-slate-500">Project value (INR)</label>
        <input value={form.value} onChange={set("value")} placeholder="e.g. 4,50,00,000" className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none" />
      </div>
    </div>
  );
}

function ProjectsPage({ projects, setProjects, activeProject, onSelect, onSheetsConnected }) {
  const [query, setQuery] = useState("");
  const [clientFilter, setClientFilter] = useState("All");
  const [addingOpen, setAddingOpen] = useState(false);
  const [newProject, setNewProject] = useState(EMPTY_PROJECT_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_PROJECT_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesClient = clientFilter === "All" || p.client === clientFilter;
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) || p.location.toLowerCase().includes(query.toLowerCase());
      return matchesClient && matchesQuery;
    });
  }, [projects, query, clientFilter]);

  const clients = ["All", ...Array.from(new Set(projects.map((p) => p.client)))];

  const addProject = async () => {
    if (!newProject.name.trim() || !newProject.client.trim()) return;
    const id = `proj-${Date.now()}`;
    const row = { id, ...newProject };
    setProjects((prev) => [...prev, row]);
    setNewProject(EMPTY_PROJECT_FORM);
    setAddingOpen(false);
    setSyncing(true);
    await writeSheetRow("Projects", row, "id");
    setSyncing(false);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({ name: p.name, client: p.client, location: p.location, length: p.length, status: p.status, contract: p.contract, startDate: p.startDate || "", finishDate: p.finishDate || "", value: p.value || "" });
  };

  const saveEdit = async (id) => {
    if (!editForm.name.trim() || !editForm.client.trim()) return;
    const row = { id, ...editForm };
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...editForm } : p)));
    setEditingId(null);
    setSyncing(true);
    await writeSheetRow("Projects", row, "id");
    setSyncing(false);
  };

  const deleteProject = async (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setConfirmDeleteId(null);
    if (activeProject === id) onSelect(null);
    setSyncing(true);
    await deleteSheetRow("Projects", "id", id);
    setSyncing(false);
  };

  return (
    <div>
      <SectionHeader
        title="Projects"
        description="Client and location-wise project switcher — pick a project to filter the whole dashboard"
        action={
          <button onClick={() => { setAddingOpen(true); setEditingId(null); }} className="flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-orange-400">
            <Plus size={15} /> Add project
          </button>
        }
      />

      <GoogleSheetsConnectCard onConnected={onSheetsConnected} />
      {syncing && (
        <p className="mb-3 flex items-center gap-1.5 text-xs text-slate-500">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" /> Syncing with Google Sheets…
        </p>
      )}

      {addingOpen && (
        <div className="mb-4 rounded-lg border border-orange-300 bg-orange-50/40 p-4">
          <p className="mb-2.5 text-sm font-semibold text-slate-800">New project</p>
          <ProjectFormFields form={newProject} setForm={setNewProject} />
          <div className="mt-3 flex gap-2">
            <button onClick={addProject} className="flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-orange-400">
              <Check size={13} /> Add project
            </button>
            <button onClick={() => setAddingOpen(false)} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-slate-300">Cancel</button>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search project name or location"
            className="w-full rounded-md border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm text-slate-800 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {clients.map((c) => (
            <button
              key={c}
              onClick={() => setClientFilter(c)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
                clientFilter === c ? "border-orange-400 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => {
          const isActive = activeProject === p.id;
          const isEditing = editingId === p.id;

          if (isEditing) {
            return (
              <div key={p.id} className="rounded-lg border border-orange-300 bg-orange-50/40 p-4 md:col-span-2 xl:col-span-3">
                <p className="mb-2.5 text-sm font-semibold text-slate-800">Edit project</p>
                <ProjectFormFields form={editForm} setForm={setEditForm} />
                <div className="mt-3 flex gap-2">
                  <button onClick={() => saveEdit(p.id)} className="flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-orange-400">
                    <Save size={13} /> Save changes
                  </button>
                  <button onClick={() => setEditingId(null)} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-slate-300">Cancel</button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={p.id}
              className={`group relative rounded-lg border p-4 text-left transition-colors ${
                isActive ? "border-orange-400 bg-orange-50" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={(e) => { e.stopPropagation(); startEdit(p); setAddingOpen(false); }}
                  className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800"
                  title="Edit project"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(p.id); }}
                  className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:text-rose-600"
                  title="Delete project"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              <button onClick={() => onSelect(p.id)} className="block w-full text-left">
                <div className="mb-2.5 flex items-start justify-between pr-14">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-600">
                      {p.client}
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-600">{p.contract}</p>
                    </div>
                  </div>
                </div>
                <div className="mb-1">
                  <StatusPill tone={statusTone(p.status)}>{p.status}</StatusPill>
                </div>
                <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                  <MapPin size={12} /> {p.location}
                </p>
                {(p.startDate || p.finishDate || p.value) && (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                    {p.startDate && <span>Start: <span className="font-medium text-slate-700">{p.startDate}</span></span>}
                    {p.finishDate && <span>Finish: <span className="font-medium text-slate-700">{p.finishDate}</span></span>}
                    {p.value && <span>Value: <span className="font-medium text-slate-700">₹{p.value}</span></span>}
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2.5">
                  <span className="text-xs text-slate-600">{p.length}</span>
                  {isActive ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-orange-600"><Check size={13} /> Active project</span>
                  ) : (
                    <span className="text-xs text-slate-600">Select</span>
                  )}
                </div>
              </button>

              {confirmDeleteId === p.id && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-white/95 p-4 text-center">
                  <p className="text-xs font-medium text-slate-800">Delete this project?</p>
                  <p className="text-[11px] text-slate-600">This can't be undone.</p>
                  <div className="mt-1 flex gap-2">
                    <button onClick={() => deleteProject(p.id)} className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700">Delete</button>
                    <button onClick={() => setConfirmDeleteId(null)} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-slate-300">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3">
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
              <FolderKanban size={22} className="mx-auto text-slate-500" />
              <p className="mt-2 text-sm font-medium text-slate-700">No projects match your filters</p>
              <p className="mt-1 text-xs text-slate-600">Try clearing the search or client filter, or add a new project.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Workforce & Equipment ----------

function WorkforceEquipment() {
  const crews = [
    { gang: "Gang A — Trenching", direct: 18, sub: 6, spread: "Spread 3" },
    { gang: "Gang B — Welding", direct: 12, sub: 4, spread: "Spread 3" },
    { gang: "Gang C — Lowering", direct: 14, sub: 8, spread: "Spread 2" },
    { gang: "Gang D — HDD crew", direct: 9, sub: 11, spread: "Crossing 4" },
  ];
  const equipment = [
    { name: "Side boom crane — SB-04", hours: 7.5, fuel: "142 L" },
    { name: "Trenching machine — TM-02", hours: 6.2, fuel: "98 L" },
    { name: "HDD rig — HR-01", hours: 9.1, fuel: "210 L" },
    { name: "Backhoe loader — BH-06", hours: 5.4, fuel: "76 L" },
  ];

  return (
    <div>
      <SectionHeader title="Workforce & equipment" description="Daily crew counts and heavy machinery run hours" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Direct labor today" value="214" icon={HardHat} />
        <MetricCard label="Subcontractor labor" value="72" icon={Users} />
        <MetricCard label="Equipment active" value="11 / 13" icon={Truck} />
        <MetricCard label="Fuel consumed today" value="526 L" icon={Gauge} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Crew counts by gang</h3>
          <div className="space-y-2.5">
            {crews.map((c) => (
              <div key={c.gang} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <div>
                  <p className="text-sm text-slate-800">{c.gang}</p>
                  <p className="text-[11px] text-slate-600">{c.spread}</p>
                </div>
                <div className="text-right text-xs tabular-nums">
                  <p className="text-slate-600">{c.direct} direct</p>
                  <p className="text-slate-600">{c.sub} subcontractor</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Heavy equipment run hours</h3>
          <div className="space-y-2.5">
            {equipment.map((e) => (
              <div key={e.name} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <p className="text-sm text-slate-800">{e.name}</p>
                <div className="text-right text-xs tabular-nums">
                  <p className="text-slate-600">{e.hours} hrs</p>
                  <p className="text-slate-600">{e.fuel} fuel</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- JMS & Client Billing ----------

function ClientBilling() {
  const handleExport = () => {
    exportToExcel({
      filename: `Medhaan_JMS_ClientBilling_${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheets: [
        {
          name: "Billing Summary",
          rows: [
            { Metric: "Cumulative invoiced (INR)", Value: 388900000 },
            { Metric: "Retention withheld (INR)", Value: 19400000 },
            { Metric: "Cash received (INR)", Value: 342100000 },
            { Metric: "Pending certification (INR)", Value: 52000000 },
          ],
        },
        {
          name: "RA Bills",
          rows: RA_BILLS.map((b) => ({
            "RA Bill": b.id, "Value (INR)": b.value, Stage: RA_STAGES[b.stage], "Retention 5% (INR)": Math.round(b.value * 0.05),
          })),
        },
      ],
    });
  };

  return (
    <div>
      <SectionHeader
        title="JMS & client billing"
        description="Joint Measurement Sheet generation and cumulative client invoicing"
        action={
          <div className="flex gap-2">
            <ExportButton onClick={handleExport} />
            <button className="flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-orange-400">
              <Plus size={15} /> Generate JMS
            </button>
          </div>
        }
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Cumulative invoiced" value={inrCr(388900000)} />
        <MetricCard label="Retention withheld" value={inrCr(19400000)} sub="5% of certified value" />
        <MetricCard label="Cash received" value={inrCr(342100000)} trend="88% realized" trendTone="success" />
        <MetricCard label="Pending certification" value={inrCr(52000000)} trend="RA-15 draft" trendTone="warning" />
      </div>

      <div className="mt-4 rounded-lg border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-4">
        <h3 className="mb-3.5 text-sm font-semibold text-slate-800">RA billing pipeline stage</h3>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {RA_STAGES.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex min-w-[130px] flex-1 flex-col items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-center">
                <span className="mb-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] font-medium text-slate-600">{i + 1}</span>
                <span className="text-xs text-slate-600">{s}</span>
              </div>
              {i < RA_STAGES.length - 1 && <ChevronRight size={16} className="shrink-0 text-slate-500" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-white text-[11px] uppercase tracking-wide text-slate-600">
              <th className="px-3 py-2.5 font-medium">RA bill</th>
              <th className="px-3 py-2.5 font-medium">Value</th>
              <th className="px-3 py-2.5 font-medium">Stage</th>
              <th className="px-3 py-2.5 font-medium">Retention (5%)</th>
            </tr>
          </thead>
          <tbody>
            {RA_BILLS.map((b) => (
              <tr key={b.id} className="border-b border-slate-200/60 last:border-0 hover:bg-slate-50">
                <td className="px-3 py-2.5 font-medium text-slate-800">{b.id}</td>
                <td className="px-3 py-2.5 tabular-nums text-slate-600">{inrCr(b.value)}</td>
                <td className="px-3 py-2.5"><StatusPill tone={b.stage === 4 ? "success" : b.stage >= 2 ? "active" : "neutral"}>{RA_STAGES[b.stage]}</StatusPill></td>
                <td className="px-3 py-2.5 tabular-nums text-slate-600">{inrCr(b.value * 0.05)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- App Shell ----------

function MedhaanTracker() {
  const [active, setActive] = useState("projects");
  const [collapsed, setCollapsed] = useState(false);
  const [dprOpen, setDprOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [projects, setProjects] = useState(PROJECTS_SEED);
  const [activeProject, setActiveProject] = useState("bpcl-erode-01");
  const [sheetsReady, setSheetsReady] = useState(getSheetsConfig().connected);

  // Load Projects from the connected Google Sheet on mount / on connect.
  // Falls back silently to the seed list if no sheet is connected yet.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows = await readSheetTab("Projects", null);
      if (!cancelled && rows && rows.length > 0) {
        setProjects(rows);
      }
    })();
    return () => { cancelled = true; };
  }, [sheetsReady]);

  const currentProject = projects.find((p) => p.id === activeProject);

  const selectProject = (id) => {
    setActiveProject(id);
    if (id) setActive("overview");
  };

  const view = () => {
    switch (active) {
      case "projects": return <ProjectsPage projects={projects} setProjects={setProjects} activeProject={activeProject} onSelect={selectProject} onSheetsConnected={() => setSheetsReady((v) => !v)} />;
      case "overview": return <ProjectOverview activeProjectId={activeProject} onOpenDPR={() => setDprOpen(true)} />;
      case "lmcdaily": return <LMCDailyUpdate />;
      case "lmcdpr": return <LMCDPR />;
      case "dailyprogress": return <DailyWorkProgress activeProjectId={activeProject} />;
      case "tasks": return <TaskManager />;
      case "dpr": return <DPRSection onOpen={() => setDprOpen(true)} />;
      case "pipebook": return <PipeBookTable />;
      case "precomm": return <PreCommissioning />;
      case "budget": return <FinancialOverview />;
      case "boq": return <BOQItemTracker />;
      case "resources": return <ResourceRateTracker />;
      case "checklists": return <Checklists />;
      case "workforce": return <WorkforceEquipment />;
      case "billing": return <ClientBilling />;
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600&display=swap');
      `}</style>

      <div className="hidden md:block">
        <Sidebar active={active} onSelect={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute inset-y-0 left-0">
            <Sidebar active={active} onSelect={(id) => { setActive(id); setMobileNavOpen(false); }} collapsed={false} setCollapsed={() => {}} />
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header
          className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 shadow-sm"
          style={{ background: "linear-gradient(90deg, #f0f6fb, #f8fafc)", borderBottom: "1px solid #dbe7f2" }}
        >
          <button onClick={() => setMobileNavOpen(true)} className="text-slate-700 md:hidden"><Menu size={20} /></button>
          <div className="hidden items-center gap-2 text-sm text-slate-700 md:flex">
            <button onClick={() => setActive("projects")} className="flex items-center gap-1.5 font-medium hover:text-slate-900">
              <Building2 size={13} style={{ color: "#ff6b1a" }} />
              {currentProject ? `${currentProject.client} — ${currentProject.location}` : "Select project"}
            </button>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="font-semibold text-slate-900">{NAV.find((n) => n.id === active)?.label}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border border-rose-300 bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-800 sm:flex">
              <AlertTriangle size={11} /> 3 alerts
            </span>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm"
              style={{ background: "linear-gradient(135deg, #ff8a3d, #ff6b1a)" }}
            >
              SR
            </div>
          </div>
        </header>

        <main className="flex-1 bg-slate-100 p-4 md:p-6">{view()}</main>
      </div>

      <DPRFormModal open={dprOpen} onClose={() => setDprOpen(false)} />
    </div>
  );
}

// ---------- Mount ----------
const rootEl = document.getElementById("medhaan-tracker-root");
const root = ReactDOM.createRoot(rootEl);
root.render(<MedhaanTracker />);
