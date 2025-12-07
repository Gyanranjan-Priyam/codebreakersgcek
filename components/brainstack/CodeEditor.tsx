"use client";

import { useEffect, useState, useRef } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LANGUAGE_MAP: Record<string, { monacoLang: string; display: string }> = {
  cpp: { monacoLang: "cpp", display: "C++" },
  java: { monacoLang: "java", display: "Java" },
  python: { monacoLang: "python", display: "Python 2" },
  python3: { monacoLang: "python", display: "Python 3" },
  c: { monacoLang: "c", display: "C" },
  csharp: { monacoLang: "csharp", display: "C#" },
  javascript: { monacoLang: "javascript", display: "JavaScript" },
  typescript: { monacoLang: "typescript", display: "TypeScript" },
};

interface CodeEditorProps {
  starterCode: Record<string, string | undefined>;
  onRun: (code: string, language: string) => void;
  onSubmit: (code: string, language: string) => void;
  isRunning?: boolean;
}

export function CodeEditor({ starterCode, onRun, onSubmit, isRunning }: CodeEditorProps) {
  const availableLanguages = Object.keys(starterCode).filter(
    (lang) => starterCode[lang] !== undefined
  );
  const [selectedLanguage, setSelectedLanguage] = useState(availableLanguages[0] || "javascript");
  const [code, setCode] = useState(starterCode[selectedLanguage] || "");
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    setCode(starterCode[selectedLanguage] || "");
  }, [selectedLanguage, starterCode]);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;

    // Format document on Ctrl+Shift+F
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      editor.getAction("editor.action.formatDocument")?.run();
    });
  };

  const handleReset = () => {
    const originalCode = starterCode[selectedLanguage] || "";
    setCode(originalCode);
    if (editorRef.current) {
      editorRef.current.setValue(originalCode);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor Controls */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/50">
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableLanguages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {LANGUAGE_MAP[lang]?.display || lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isRunning}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRun(code, selectedLanguage)}
            disabled={isRunning}
          >
            <Play className="w-4 h-4 mr-2" />
            Run
          </Button>
          <Button
            size="sm"
            onClick={() => onSubmit(code, selectedLanguage)}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit
          </Button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={LANGUAGE_MAP[selectedLanguage]?.monacoLang || "javascript"}
          value={code}
          onChange={(value) => setCode(value || "")}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: "on",
            padding: { top: 16, bottom: 16 },
            autoIndent: "full",
            formatOnPaste: true,
            formatOnType: true,
            matchBrackets: "always",
            autoClosingBrackets: "languageDefined",
            autoClosingQuotes: "languageDefined",
            guides: {
              indentation: true,
              highlightActiveIndentation: true,
            },
            folding: true,
            showFoldingControls: "always",
          }}
        />
      </div>
    </div>
  );
}
