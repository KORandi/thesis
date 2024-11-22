// src/pages/Editor.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  Bold,
  ClassicEditor,
  Essentials,
  Italic,
  Mention,
  Paragraph,
  Undo,
  Dialog,
} from "ckeditor5";
import { Button } from "@/components/ui/button";

import "ckeditor5/ckeditor5.css";
import "@thesis/ckeditor5-ghost-text/index.css";
// import { LLMConnector } from "@thesis/ckeditor5-llm-connector";
import { GhostText } from "@thesis/ckeditor5-ghost-text";
import { llamaService } from "@/lib/services";

export const EditorPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const editorRef = useRef<CKEditor<ClassicEditor>>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      navigate("/login");
    } else {
      setUsername(storedUsername);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Welcome, {username}</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <CKEditor
            ref={editorRef}
            editor={ClassicEditor}
            data=""
            config={{
              toolbar: {
                items: [
                  "undo",
                  "redo",
                  "|",
                  "bold",
                  "italic",
                  "parameterConfig",
                ],
              },
              plugins: [
                Bold,
                Essentials,
                Italic,
                Mention,
                Paragraph,
                Undo,
                Dialog,
                GhostText,
                // LLMConnector,
              ],
              ghostText: {
                debounceDelay: 300,
                contentFetcher: llamaService(editorRef),
              },
              placeholder: "Start writing your content here...",
            }}
          />
        </div>
      </main>
    </div>
  );
};
