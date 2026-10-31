import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable";

import Footer from "@/components/layout/footer";
import EditorPanel from "../../components/editor-panel";
import InsightPanel from "../../components/insight-panel";
import PreviewPanelReactPdf from "../../components/preview-panel-react-pdf";
import styles from "./resume-builder-layout.module.css";

export default function ResumeBuilderLayout() {
  const panelClass = `min-w-0 ${styles.panel}`;

  return (
    <main className="flex h-dvh w-full min-w-0 flex-col overflow-hidden">
      <ResizablePanelGroup
        orientation="horizontal"
        className={`${styles.panelGroup} min-h-0 min-w-0 flex-1 print:hidden`}
      >
        <ResizablePanel
          defaultSize="25%"
          minSize="25%"
          maxSize="33.33%"
          className={`${panelClass} ${styles.editorPanel}`}
        >
          <EditorPanel />
        </ResizablePanel>

        <ResizableHandle withHandle className={styles.handle} />

        <ResizablePanel
          defaultSize="50%"
          minSize="30%"
          className={`${panelClass} ${styles.previewPanel}`}
        >
          <PreviewPanelReactPdf />
        </ResizablePanel>

        <ResizableHandle withHandle className={styles.handle} />

        <ResizablePanel
          defaultSize="25%"
          minSize="25%"
          maxSize="33.33%"
          className={`${panelClass} ${styles.insightPanel}`}
        >
          <InsightPanel />
        </ResizablePanel>
      </ResizablePanelGroup>

      <Footer />
    </main>
  );
}
