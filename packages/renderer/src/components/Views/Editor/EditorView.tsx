import "./styles.scss";
import { Container, Paper } from "@mantine/core";
import { Page } from "common/Save";
import { useContext, useEffect, useMemo } from "react";
import { AppContext } from "types/AppStore";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import Toolbar from "./Toolbar/Toolbar";
import { extensions } from "./EditorExtensions";
import { TableOfContents } from "./TableOfContents";
import { EditorStyles } from "./EditorStyles";

type Props = {
    page: Page;
    setEditorRef: (e: Editor | null) => void;
};

export function EditorView({ page, setEditorRef }: Props) {
    const appContext = useContext(AppContext);

    const _extensions = useMemo(
        () =>
            extensions({
                useTypography: appContext.prefs.editor.useTypographyExtension,
                tabSize: appContext.prefs.editor.tabSize
            }),
        [appContext.prefs.editor.tabSize, appContext.prefs.editor.useTypographyExtension]
    );

    const content = useMemo(() => JSON.parse(window.api.loadPage(page.fileName)), [page.fileName]);

    const editor = useEditor(
        {
            extensions: _extensions,
            autofocus: true,
            content: content
        },
        [page.id]
    );

    // useEffect(() => {
    //     setTimeout(() => {
    //         if (editor == undefined) return;

    //         editor.commands.setContent(JSON.parse(window.api.loadPage(page.fileName)));
    //         editor.view.updateState(
    //             EditorState.create({
    //                 doc: editor.state.doc,
    //                 plugins: editor.state.plugins,
    //                 schema: editor.state.schema
    //             })
    //         );
    //     });
    // }, [editor, page]);

    setEditorRef(editor);

    useEffect(() => {
        window.api.onEditorZoomIn(() =>
            appContext.modifyPrefs((p) => {
                if (p.editor.zoom <= 5.0) p.editor.zoom += 0.1;
            })
        );
        window.api.onEditorZoomOut(() =>
            appContext.modifyPrefs((p) => {
                if (p.editor.zoom >= 0.2) p.editor.zoom -= 0.1;
            })
        );
        window.api.onEditorResetZoom(() =>
            appContext.modifyPrefs((p) => {
                p.editor.zoom = 1.0;
            })
        );
    }, [appContext]);

    if (editor != null) {
        return (
            <EditorStyles>
                <Toolbar editor={editor} />

                <TableOfContents editor={editor} />

                <Container
                    size={appContext.prefs.editor.width}
                    py="xl"
                    style={{ zoom: appContext.prefs.editor.zoom }}
                >
                    <Paper
                        withBorder={appContext.prefs.editor.border}
                        shadow={appContext.prefs.editor.border ? "sm" : undefined}
                        px="xl"
                        py="md"
                    >
                        <EditorContent
                            id="tiptap-editor"
                            editor={editor}
                            // Preact spellCheck workaround, must be a string not a boolean
                            spellCheck={
                                appContext.prefs.editor.spellcheck.toString() as "true" | "false"
                            }
                        />
                    </Paper>
                </Container>
            </EditorStyles>
        );
    } else return <></>;
}
