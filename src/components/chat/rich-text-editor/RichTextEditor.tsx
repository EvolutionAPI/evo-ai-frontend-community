import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser as ProseDOMParser, DOMSerializer } from 'prosemirror-model';
import { keymap } from 'prosemirror-keymap';
import { history, undo, redo } from 'prosemirror-history';
import { baseKeymap } from 'prosemirror-commands';
import { toggleMark } from 'prosemirror-commands';
import { wrapInList } from 'prosemirror-schema-list';
import { messageSchema } from './schema';
import { EditorToolbar } from './EditorToolbar';

export interface RichTextEditorRef {
  focus: () => void;
  getContent: () => string;
  setContent: (content: string) => void;
  insertText: (text: string) => void;
  clear: () => void;
}

interface RichTextEditorProps {
  placeholder?: string;
  value?: string;
  onChange?: (content: string) => void;
  onKeyDown?: (event: KeyboardEvent) => boolean | void;
  disabled?: boolean;
  className?: string;
  showToolbar?: boolean;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  (
    {
      placeholder = 'Digite sua nota privada...',
      value = '',
      onChange,
      onKeyDown,
      disabled = false,
      className = '',
      showToolbar = true,
    },
    ref,
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const [editorState, setEditorState] = useState<EditorState | null>(null);

    const onKeyDownRef = useRef(onKeyDown);
    const onChangeRef = useRef(onChange);
    useEffect(() => { onKeyDownRef.current = onKeyDown; }, [onKeyDown]);
    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

    useImperativeHandle(ref, () => ({
      focus: () => {
        viewRef.current?.focus();
      },
      getContent: () => {
        if (!viewRef.current) return '';
        const doc = viewRef.current.state.doc;
        const serializer = DOMSerializer.fromSchema(messageSchema);
        const fragment = serializer.serializeFragment(doc.content);
        const div = document.createElement('div');
        div.appendChild(fragment);
        return div.innerHTML;
      },
      setContent: (content: string) => {
        if (!viewRef.current) return;
        const isHtml = /<[a-z][\s\S]*>/i.test(content);
        let doc;
        if (isHtml) {
          const wrapper = document.createElement('div');
          wrapper.innerHTML = content;
          doc = ProseDOMParser.fromSchema(messageSchema).parse(wrapper);
        } else {
          doc = messageSchema.nodeFromJSON({
            type: 'doc',
            content: content
              ? [{ type: 'paragraph', content: [{ type: 'text', text: content }] }]
              : [],
          });
        }
        const newState = EditorState.create({
          doc,
          plugins: viewRef.current.state.plugins,
        });
        viewRef.current.updateState(newState);
        setEditorState(newState);
      },
      insertText: (text: string) => {
        if (!viewRef.current) return;
        const { state, dispatch } = viewRef.current;
        const tr = state.tr.insertText(text);
        dispatch(tr);
        viewRef.current.focus();
      },
      clear: () => {
        if (!viewRef.current) return;
        const emptyDoc = messageSchema.nodeFromJSON({
          type: 'doc',
          content: [],
        });
        const newState = EditorState.create({
          doc: emptyDoc,
          plugins: viewRef.current.state.plugins,
        });
        viewRef.current.updateState(newState);
        setEditorState(newState);
        onChangeRef.current?.('');
      },
    }));

    useEffect(() => {
      if (!editorRef.current) return;

      const initialDoc = value
        ? messageSchema.nodeFromJSON({
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: value }] }],
          })
        : messageSchema.nodeFromJSON({
            type: 'doc',
            content: [],
          });

      const state = EditorState.create({
        doc: initialDoc,
        plugins: [
          history(),
          keymap({
            'Mod-z': undo,
            'Mod-y': redo,
            'Mod-Shift-z': redo,
            'Mod-b': toggleMark(messageSchema.marks.strong),
            'Mod-i': toggleMark(messageSchema.marks.em),
            'Mod-`': toggleMark(messageSchema.marks.code),
            'Shift-Ctrl-8': wrapInList(messageSchema.nodes.bullet_list),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            Enter: (_state, _dispatch) => {
              if (onKeyDownRef.current) {
                const handled = onKeyDownRef.current(new KeyboardEvent('keydown', { key: 'Enter' }));
                if (handled) return true;
              }
              return false;
            },
          }),
          keymap(baseKeymap),
        ],
      });

      const view = new EditorView(editorRef.current, {
        state,
        dispatchTransaction: transaction => {
          const newState = view.state.apply(transaction);
          view.updateState(newState);
          setEditorState(newState);

          if (transaction.docChanged) {
            const doc = newState.doc;
            const content = doc.textContent;
            onChangeRef.current?.(content);
          }
        },
        handleDOMEvents: {
          keydown: (_view, event) => {
            if (onKeyDownRef.current) {
              const handled = onKeyDownRef.current(event);
              if (handled) return true;
            }
            return false;
          },
        },
        editable: () => !disabled,
        attributes: {
          class:
            'prosemirror-editor p-3 min-h-[100px] max-h-[200px] overflow-y-auto focus:outline-none resize-none text-sm leading-relaxed text-foreground',
          'data-placeholder': placeholder,
        },
      });

      viewRef.current = view;
      setEditorState(state);

      return () => {
        view.destroy();
        viewRef.current = null;
      };
    }, []);

    useEffect(() => {
      if (viewRef.current) {
        viewRef.current.setProps({
          editable: () => !disabled,
        });
      }
    }, [disabled]);

    const handleToolbarAction = (action: string) => {
      if (!viewRef.current || !editorState) return;

      const { state, dispatch } = viewRef.current;

      switch (action) {
        case 'bold':
          toggleMark(messageSchema.marks.strong)(state, dispatch);
          break;
        case 'italic':
          toggleMark(messageSchema.marks.em)(state, dispatch);
          break;
        case 'code':
          toggleMark(messageSchema.marks.code)(state, dispatch);
          break;
        case 'bulletList':
          wrapInList(messageSchema.nodes.bullet_list)(state, dispatch);
          break;
        case 'undo':
          undo(state, dispatch);
          break;
        case 'redo':
          redo(state, dispatch);
          break;
      }

      viewRef.current.focus();
    };

    return (
      <div className={`border border-border rounded-lg overflow-hidden bg-background ${className}`}>
        {showToolbar && (
          <EditorToolbar
            editorState={editorState}
            onAction={handleToolbarAction}
            disabled={disabled}
          />
        )}
        <div ref={editorRef} className={`relative ${disabled ? 'opacity-50' : ''}`} />
      </div>
    );
  },
);

RichTextEditor.displayName = 'RichTextEditor';
