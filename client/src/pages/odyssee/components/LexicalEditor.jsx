import { useCallback, useEffect, useRef, useState } from "react";

import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  DecoratorNode,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";

import {
  $createCodeNode,
  CodeHighlightNode,
  CodeNode,
} from "@lexical/code-core";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $patchStyleText, $setBlocksType } from "@lexical/selection";
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

// ─── ImageNode ────────────────────────────────────────────────────────────────

class ImageNode extends DecoratorNode {
  constructor(src, altText, key) {
    super(key);
    this.__src = src;
    this.__altText = altText || "";
  }

  static getType() {
    return "image";
  }

  static clone(node) {
    return new ImageNode(node.__src, node.__altText, node.__key);
  }

  createDOM() {
    const span = document.createElement("span");
    span.className = "lex-image-wrapper";
    return span;
  }

  updateDOM() {
    return false;
  }

  static importJSON(serializedNode) {
    return new ImageNode(serializedNode.src, serializedNode.altText);
  }

  exportJSON() {
    return {
      type: "image",
      version: 1,
      src: this.__src,
      altText: this.__altText,
    };
  }

  decorate() {
    return <img src={this.__src} alt={this.__altText} className="lex-image" />;
  }
}

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
  code: "lex-code-block",
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

const FONT_FAMILIES = [
  { value: "", label: "Police" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "'Courier New', monospace", label: "Courier New" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Impact, sans-serif", label: "Impact" },
  { value: "'Times New Roman', serif", label: "Times New Roman" },
  { value: "Verdana, sans-serif", label: "Verdana" },
];

const FONT_SIZES = [
  { value: "", label: "Taille" },
  { value: "10px", label: "10" },
  { value: "12px", label: "12" },
  { value: "14px", label: "14" },
  { value: "16px", label: "16" },
  { value: "18px", label: "18" },
  { value: "20px", label: "20" },
  { value: "24px", label: "24" },
  { value: "32px", label: "32" },
  { value: "48px", label: "48" },
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
  const [showFormatMarks, setShowFormatMarks] = useState(false);
  const imageInputRef = useRef(null);

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
      } else if (type === "code") {
        setBlockType("code");
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
        $setBlocksType(selection, () => $createParagraphNode());
      } else if (type === "quote") {
        $setBlocksType(selection, () => $createQuoteNode());
      } else if (type.startsWith("h")) {
        $setBlocksType(selection, () => $createHeadingNode(type));
      }
    });
  };

  const formatCodeBlock = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      if (blockType === "code") {
        $setBlocksType(selection, () => $createParagraphNode());
      } else {
        $setBlocksType(selection, () => $createCodeNode());
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

  const applyFontFamily = (family) => {
    if (!family) return;
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { "font-family": family });
      }
    });
  };

  const applyFontSize = (size) => {
    if (!size) return;
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { "font-size": size });
      }
    });
  };

  const toggleList = (type) => {
    if (type === "bullet") {
      editor.dispatchCommand(
        isBulletList ? REMOVE_LIST_COMMAND : INSERT_UNORDERED_LIST_COMMAND,
        undefined,
      );
    } else {
      editor.dispatchCommand(
        isOrderedList ? REMOVE_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND,
        undefined,
      );
    }
  };

  const toggleFormatMarks = () => {
    const root = editor.getRootElement();
    if (root) {
      root.classList.toggle("show-format-marks");
      setShowFormatMarks((prev) => !prev);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      editor.update(() => {
        const imageNode = new ImageNode(ev.target.result, file.name);
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertNodes([imageNode]);
        } else {
          $getRoot().append(imageNode);
        }
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
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
      {/* Police & Taille */}
      <div className="lex-toolbar__group">
        <select
          className="lex-toolbar__select"
          defaultValue=""
          onChange={(e) => applyFontFamily(e.target.value)}
          title="Famille de police"
        >
          {FONT_FAMILIES.map(({ value, label }) => (
            <option key={value} value={value} disabled={value === ""}>
              {label}
            </option>
          ))}
        </select>
        <select
          className="lex-toolbar__select lex-toolbar__select--size"
          defaultValue=""
          onChange={(e) => applyFontSize(e.target.value)}
          title="Taille de police"
        >
          {FONT_SIZES.map(({ value, label }) => (
            <option key={value} value={value} disabled={value === ""}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Type de bloc */}
      <div className="lex-toolbar__group">
        <select
          className="lex-toolbar__select"
          value={
            blockType === "list" || blockType === "code"
              ? "paragraph"
              : blockType
          }
          onChange={(e) => formatBlock(e.target.value)}
          title="Type de bloc"
        >
          {BLOCK_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Formatage texte */}
      <div className="lex-toolbar__group">
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
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
          }
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
          title="Couleur de paragraphe"
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

      {/* Listes & indentation */}
      <div className="lex-toolbar__group">
        <Btn
          active={isOrderedList}
          onClick={() => toggleList("ordered")}
          title="Liste numérotée"
        >
          1. —
        </Btn>
        <Btn
          active={isBulletList}
          onClick={() => toggleList("bullet")}
          title="Liste à puces"
        >
          • —
        </Btn>
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
      </div>

      {/* Exposant / Indice / Code / ¶ */}
      <div className="lex-toolbar__group">
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
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript")
          }
          title="Indice"
        >
          x₂
        </Btn>
        <Btn
          active={blockType === "code"}
          onClick={formatCodeBlock}
          title="Bloc de code"
        >
          &lt;/&gt;
        </Btn>
        <Btn
          active={showFormatMarks}
          onClick={toggleFormatMarks}
          title="Afficher les marques de formatage"
        >
          ¶
        </Btn>
      </div>

      {/* Alignement */}
      <div className="lex-toolbar__group">
        <Btn
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
          title="Gauche"
        >
          ⬅
        </Btn>
        <Btn
          onClick={() =>
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")
          }
          title="Centré"
        >
          ↔
        </Btn>
        <Btn
          onClick={() =>
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")
          }
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
      </div>

      {/* Image */}
      <div className="lex-toolbar__group">
        <Btn
          onClick={() => imageInputRef.current?.click()}
          title="Insérer une image"
        >
          🖼
        </Btn>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="lex-toolbar__file-input"
          onChange={handleImageChange}
        />
      </div>

      {/* Undo / Redo */}
      <div className="lex-toolbar__group">
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
      </div>
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
    nodes: [
      ListNode,
      ListItemNode,
      HeadingNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      ImageNode,
    ],
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
