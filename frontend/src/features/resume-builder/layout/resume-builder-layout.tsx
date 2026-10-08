import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import EditorPanel from "../components/editor-panel";
import PreviewPanel from "../components/preview-panel";
import InsightPanel from "../components/insight-panel";

export default function ResumeBuilderLayout() {
  return (
    <main className="flex h-screen w-full min-w-0  flex-col overflow">
      <Header />
      <ResizablePanelGroup
        orientation="horizontal"
        className="min-h-0 min-w-0 flex-1"
      >
        <ResizablePanel
          defaultSize="25%"
          minSize="25%"
          maxSize="33.33%"
          className="min-w-0"
        >
          <EditorPanel />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize="50%" minSize="30%" className="min-w-0">
          <PreviewPanel />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel
          defaultSize="25%"
          minSize="25%"
          maxSize="33.33%"
          className="min-w-0"
        >
          <InsightPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
      <Footer />
    </main>
  );
}
