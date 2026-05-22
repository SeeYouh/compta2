import { useCallback, useEffect, useState } from "react";

import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";

import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $patchStyleText } from "@lexical/selection";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

// ─── Theme ───────────────────────────────────────────────────────────────────

const lexicalTheme = {
  text: {
    bold: "lex-bold",
    italic: "lex-italic",
    underline: "lex-underline",
    strikethrough: "lex-strikethrough",
    subscript: "lex-subscript",
    superscript: "lex-superscript",
    code: "lex-code-inline",
  },
  paragraph: "lex-paragraph",
  heading: {
    h1: "lex-h1",
    h2: "lex-h2",
    h3: "lex-h3",
  },
  quote: "lex-quote",
  list: {
    ul: "lex-ul",
    ol: "lex-ol",
    listitem: "lex-listitem",
    nested: { listitem: "lex-nested-listitem" },
  },
};

// ─── Toolbar ─────────────────────────────────────────────────────────────────

const BLOCK_TYPES = [
  { value: "paragraph", label: "Normal" },
  { value: "h1", label: "Titre 1" },
  { value: "h2", label: "Titre 2" },
  { value: "h3", label: "Titre 3" },
  { value: "quote", label: "Citation" },
];

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [blockType, setBlockType] = useState("paragraph");
  const [isBulletList, setIsBulletList] = useState(false);
  const [isOrderedList, setIsOrderedList] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    setIsBold(selection.hasFormat("bold"));
    setIsItalic(selection.hasFormat("italic"));
    setIsUnderline(selection.hasFormat("underline"));
    setIsStrikethrough(selection.hasFormat("strikethrough"));
    setIsSuperscript(selection.hasFormat("superscript"));
    setIsSubscript(selection.hasFormat("subscript"));

    const anchorNode = selection.anchor.getNode();
    const element =
      anchorNode.getKey() === "root"
        ? anchorNode
        : anchorNode.getTopLevelElementOrThrow();
    const elementDOM = editor.getElementByKey(element.getKey());

    if (elementDOM) {
      const type = element.getType();
      if (type === "heading") {
        const tag = element.getTag ? element.getTag() : "h1";
        setBlockType(tag);
        setIsBulletList(false);
        setIsOrderedList(false);
      } else if (type === "quote") {
        setBlockType("quote");
        setIsBulletList(false);
        setIsOrderedList(false);
      } else if (type === "listitem") {
        const parent = element.getParent();
        if (parent) {
          const parentType = parent.getListType
            ? parent.getListType()
            : parent.getType();
          setIsBulletList(parentType === "bullet");
          setIsOrderedList(parentType === "number");
          setBlockType("list");
        }
      } else {
        setBlockType("paragraph");
        setIsBulletList(false);
        setIsOrderedList(false);
      }
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const formatBlock = (type) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      if (type === "paragraph") {
        selection.getNodes().forEach((node) => {
          const parent = node.getTopLevelElementOrThrow?.() || node;
          if ($isHeadingNode(parent) || $isQuoteNode(parent)) {
            parent.replace($createParagraphNode());
          }
        });
      } else if (type === "quote") {
        const anchorNode = selection.anchor.getNode();
        const element = anchorNode.getTopLevelElementOrThrow();
        element.replace($createQuoteNode());
      } else if (type.startsWith("h")) {
        const anchorNode = selection.anchor.getNode();
        const element = anchorNode.getTopLevelElementOrThrow();
        element.replace($createHeadingNode(type));
      }
    });
  };

  const applyTextColor = (color) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { color });
      }
    });
  };

  const applyBgColor = (color) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { "background-color": color });
      }
    });
  };

  const toggleList = (type) => {
    if (type === "bullet") {
      if (isBulletList) {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      } else {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      }
    } else {
      if (isOrderedList) {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      } else {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      }
    }
  };

  const Btn = ({ active, onClick, title, children }) => (
    <button
      type="button"
      className={`lex-toolbar__btn${active ? " lex-toolbar__btn--active" : ""}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="lex-toolbar">
      {/* Undo / Redo */}
      <Btn
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        title="Annuler"
      >
        ↩
      </Btn>
      <Btn
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        title="Rétablir"
      >
        ↪
      </Btn>

      <span className="lex-toolbar__sep" />

      {/* Format texte */}
      <Btn
        active={isBold}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        title="Gras"
      >
        <b>G</b>
      </Btn>
      <Btn
        active={isItalic}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        title="Italique"
      >
        <i>I</i>
      </Btn>
      <Btn
        active={isUnderline}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        title="Souligné"
      >
        <u>S</u>
      </Btn>
      <Btn
        active={isStrikethrough}
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
        }
        title="Barré"
      >
        <s>B</s>
      </Btn>
      <Btn
        active={isSuperscript}
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript")
        }
        title="Exposant"
      >
        x²
      </Btn>
      <Btn
        active={isSubscript}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript")}
        title="Indice"
      >
        x₂
      </Btn>

      <span className="lex-toolbar__sep" />

      {/* Type de bloc */}
      <select
        className="lex-toolbar__select"
        value={blockType === "list" ? "paragraph" : blockType}
        onChange={(e) => formatBlock(e.target.value)}
      >
        {BLOCK_TYPES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <span className="lex-toolbar__sep" />

      {/* Listes */}
      <Btn
        active={isBulletList}
        onClick={() => toggleList("bullet")}
        title="Liste à puces"
      >
        • —
      </Btn>
      <Btn
        active={isOrderedList}
        onClick={() => toggleList("ordered")}
        title="Liste numérotée"
      >
        1. —
      </Btn>

      <span className="lex-toolbar__sep" />

      {/* Alignement */}
      <Btn
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
        title="Gauche"
      >
        ⬅
      </Btn>
      <Btn
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
        title="Centré"
      >
        ↔
      </Btn>
      <Btn
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
        title="Droite"
      >
        ➡
      </Btn>
      <Btn
        onClick={() =>
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")
        }
        title="Justifié"
      >
        ☰
      </Btn>

      <span className="lex-toolbar__sep" />

      {/* Indentation */}
      <Btn
        onClick={() =>
          editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)
        }
        title="Désindenter"
      >
        ⇤
      </Btn>
      <Btn
        onClick={() =>
          editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)
        }
        title="Indenter"
      >
        ⇥
      </Btn>

      <span className="lex-toolbar__sep" />

      {/* Couleurs */}
      <label className="lex-toolbar__color-label" title="Couleur du texte">
        A
        <input
          type="color"
          className="lex-toolbar__color-input"
          defaultValue="#000000"
          onChange={(e) => applyTextColor(e.target.value)}
        />
      </label>
      <label
        className="lex-toolbar__color-label lex-toolbar__color-label--bg"
        title="Couleur de fond"
      >
        ▬
        <input
          type="color"
          className="lex-toolbar__color-input"
          defaultValue="#ffffff"
          onChange={(e) => applyBgColor(e.target.value)}
        />
      </label>
    </div>
  );
}

// ─── Load initial HTML ────────────────────────────────────────────────────────

function LoadInitialContentPlugin({ content }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!content) return;
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(content, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      nodes.forEach((node) => root.append(node));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

// ─── LexicalEditor ───────────────────────────────────────────────────────────

const LexicalEditor = ({ content, onChange }) => {
  const initialConfig = {
    namespace: "LexicalEditor",
    theme: lexicalTheme,
    nodes: [ListNode, ListItemNode, HeadingNode, QuoteNode],
    onError: (error) => console.error("[LexicalEditor]", error),
  };

  const handleChange = useCallback(
    (editorState, editor) => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor, null);
        onChange(html);
      });
    },
    [onChange],
  );

  return (
    <div className="lexical-editor">
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="lexical-editor__body">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="lexical-editor__content" />
            }
            placeholder={
              <div className="lexical-editor__placeholder">Écrivez ici…</div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <AutoFocusPlugin />
          <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
          <LoadInitialContentPlugin content={content} />
        </div>
      </LexicalComposer>
    </div>
  );
};

export default LexicalEditor;
