import * as vscode from "vscode";
import * as path from "path";
import {
  parseDesignMd,
  lintDesignMd,
  type LintFinding,
} from "@driftguard/linter";

const SEVERITY_MAP: Record<LintFinding["severity"], vscode.DiagnosticSeverity> = {
  error: vscode.DiagnosticSeverity.Error,
  warning: vscode.DiagnosticSeverity.Warning,
  info: vscode.DiagnosticSeverity.Information,
};

let diagnostics: vscode.DiagnosticCollection;
const debounceTimers = new Map<string, NodeJS.Timeout>();

function getConfig() {
  const c = vscode.workspace.getConfiguration("driftguard");
  return {
    filenamePattern: c.get<string>("filenamePattern", "DESIGN.md"),
    runOnType: c.get<boolean>("runOnType", true),
    debounceMs: c.get<number>("debounceMs", 300),
  };
}

function isDesignMd(doc: vscode.TextDocument): boolean {
  if (doc.languageId !== "markdown") return false;
  const { filenamePattern } = getConfig();
  return path.basename(doc.uri.fsPath).toLowerCase() === filenamePattern.toLowerCase();
}

function toDiagnostic(doc: vscode.TextDocument, f: LintFinding): vscode.Diagnostic {
  const lineIdx = Math.max(0, (f.line ?? 1) - 1);
  const safeLine = Math.min(lineIdx, Math.max(0, doc.lineCount - 1));
  const lineText = doc.lineAt(safeLine).text;
  const range = new vscode.Range(safeLine, 0, safeLine, Math.max(lineText.length, 1));
  const d = new vscode.Diagnostic(range, f.message, SEVERITY_MAP[f.severity]);
  d.source = "driftguard";
  d.code = f.rule;
  return d;
}

function runLint(doc: vscode.TextDocument) {
  if (!isDesignMd(doc)) return;
  const text = doc.getText();
  const parsed = parseDesignMd(text);

  if (!parsed) {
    const range = new vscode.Range(0, 0, 0, Math.max(doc.lineAt(0).text.length, 1));
    const d = new vscode.Diagnostic(
      range,
      "DESIGN.md is missing a YAML front-matter block (--- ... ---) or the YAML is invalid.",
      vscode.DiagnosticSeverity.Error
    );
    d.source = "driftguard";
    d.code = "parse-error";
    diagnostics.set(doc.uri, [d]);
    return;
  }

  const report = lintDesignMd(parsed);
  diagnostics.set(doc.uri, report.findings.map((f) => toDiagnostic(doc, f)));
}

function scheduleLint(doc: vscode.TextDocument) {
  if (!isDesignMd(doc)) return;
  const { runOnType, debounceMs } = getConfig();
  if (!runOnType) return;
  const key = doc.uri.toString();
  const existing = debounceTimers.get(key);
  if (existing) clearTimeout(existing);
  debounceTimers.set(
    key,
    setTimeout(() => {
      debounceTimers.delete(key);
      runLint(doc);
    }, debounceMs)
  );
}

export function activate(ctx: vscode.ExtensionContext) {
  diagnostics = vscode.languages.createDiagnosticCollection("driftguard");
  ctx.subscriptions.push(diagnostics);

  vscode.workspace.textDocuments.forEach(runLint);

  ctx.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(runLint),
    vscode.workspace.onDidSaveTextDocument(runLint),
    vscode.workspace.onDidChangeTextDocument((e) => scheduleLint(e.document)),
    vscode.workspace.onDidCloseTextDocument((doc) => diagnostics.delete(doc.uri)),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("driftguard")) {
        vscode.workspace.textDocuments.forEach(runLint);
      }
    })
  );

  ctx.subscriptions.push(
    vscode.commands.registerCommand("driftguard.lintNow", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("DriftGuard: no active editor.");
        return;
      }
      if (!isDesignMd(editor.document)) {
        vscode.window.showInformationMessage(
          `DriftGuard: active file is not a ${getConfig().filenamePattern}.`
        );
        return;
      }
      runLint(editor.document);
      vscode.window.showInformationMessage("DriftGuard: lint complete.");
    })
  );
}

export function deactivate() {
  for (const t of debounceTimers.values()) clearTimeout(t);
  debounceTimers.clear();
}
