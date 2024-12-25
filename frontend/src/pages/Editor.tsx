import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  Bold,
  ClassicEditor,
  Dialog,
  Essentials,
  Italic,
  Paragraph,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import "@thesis/ckeditor5-ghost-text/index.css";
import { GhostText } from "@thesis/ckeditor5-ghost-text";
import { LLMConnector } from "@thesis/ckeditor5-llm-connector";
import { LlmConnectorData } from "@thesis/ckeditor5-llm-connector/interfaces/llm-connector-data.js";
import { ContentFetcherProps } from "@thesis/ckeditor5-ghost-text/interfaces/content-fetcher.js";
import { gptService, llamaService } from "@/lib/services";

export const EditorPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const autocompleteConfigRef = useRef<LlmConnectorData>({
    frequency: "onWordComplete",
    temperature: 80,
    model: "gpt",
    debounce: 500,
  });
  const [, setAutocompleteConfig] = useReducer(
    (state: LlmConnectorData, newState: LlmConnectorData) => {
      autocompleteConfigRef.current = {
        ...state,
        ...newState,
      };
      return autocompleteConfigRef.current;
    },
    autocompleteConfigRef.current
  );

  const getDebounceDelay = () => {
    return autocompleteConfigRef.current.debounce;
  };

  const contentFetcher = useCallback((props: ContentFetcherProps) => {
    if (autocompleteConfigRef.current.model === "gpt") {
      return gptService(autocompleteConfigRef.current)(props);
    } else {
      return llamaService(autocompleteConfigRef.current)(props);
    }
  }, []);

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
          <p className="text-sm text-gray-600 mb-4">
            <strong>Usage Tips:</strong>
            <ul className="list-disc pl-5">
              <li>
                Press <kbd>Tab</kbd> to accept a suggestion or{" "}
                <kbd>Shift + Tab</kbd> to change it.
              </li>
              <li>
                Configure suggestions by clicking the AI Text button in the
                toolbar.
              </li>
              <li>
                Suggestions appear automatically based on your typing frequency.
              </li>
              <li>
                Temperature controls the randomness of suggestions. Lower values
                make suggestions more predictable, while higher values make them
                more creative.
              </li>
            </ul>
          </p>
          <CKEditor
            editor={ClassicEditor}
            config={{
              licenseKey: "GPL",
              toolbar: [
                "undo",
                "redo",
                "|",
                "bold",
                "italic",
                "parameterConfig",
              ],
              plugins: [
                Essentials,
                Paragraph,
                Bold,
                Italic,
                Dialog,
                GhostText,
                LLMConnector,
              ],
              llmConnector: {
                onParameterSubmit: (data: LlmConnectorData) => {
                  setAutocompleteConfig(data);
                },
              },
              ghostText: {
                debounceDelay: getDebounceDelay,
                contentFetcher,
                keystrokes: {
                  insertGhostText: "Shift + Tab",
                },
              },
              placeholder: "Start writing your content here...",
            }}
          />
        </div>
      </main>
    </div>
  );
};
