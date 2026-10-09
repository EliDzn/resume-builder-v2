import SidePanel from "./side-panel";
import Button from "@/components/ui/button";
import TextareaField from "@/components/ui/textarea-field";

export default function InsightPanel() {
  return (
    <SidePanel variant="right">
      <div className="flex flex-row px-4 py-2 gap-2">
        <Button variant="Secondary" className="flex-1">
          Generate Insights
        </Button>
        <Button variant="Primary" className="flex-1">
          Export Resume
        </Button>
      </div>
      <div className="flex flex-col gap-2 px-4">
        <h2 className="text-h2 font-semibold">Job Details</h2>
        <TextareaField
          label="Job Description"
          placeholder="Copy and paste the job description here to tailor your resume to the job requirements"
        />
      </div>
    </SidePanel>
  );
}
