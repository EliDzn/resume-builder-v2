import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable";

import Header from "@/components/layout/header";
import EditorPanel from "../components/editor-panel";
import PreviewPanel from "../components/preview-panel";

export default function ResumeBuilderLayout() {
  return (
    <main className="flex min-h-screen w-full flex-col overflow-hidden">
      <Header />

      <ResizablePanelGroup
        orientation="horizontal"
        className="min-h-0 w-full flex-1"
      >
        <ResizablePanel defaultSize="25%" minSize="25%" maxSize="33.33%">
          <EditorPanel />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize="50%" minSize="30%">
          <PreviewPanel />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize="25%" minSize="25%" maxSize="33.33%">
          <section className="h-full w-full overflow-auto">
            Resume Insights GO Here
          </section>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
