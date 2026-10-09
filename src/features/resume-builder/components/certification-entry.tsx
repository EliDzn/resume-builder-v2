import InputField from "@/components/ui/input-field";
import EditorPanelFieldset from "./editor-panel-fieldset";
import EditorPanelLegend from "./editor-panel-legend";
import { useResumeStore } from "../state/resume-store";
import type { Certification } from "../model/resume-type";

type CertificationEntryProps = {
  certification: Certification;
};

export default function CertificationEntry({
  certification
}: CertificationEntryProps) {
  const updateCertification = useResumeStore(
    (state) => state.updateCertification
  );
  const removeCertification = useResumeStore(
    (state) => state.removeCertification
  );

  const clearCertification = () => {
    updateCertification(certification.id, {
      provider: "",
      title: "",
      completedDate: ""
    });
  };

  return (
    <EditorPanelFieldset>
      <EditorPanelLegend
        onClear={clearCertification}
        onDelete={() => removeCertification(certification.id)}
      >
        {certification.title || "Certification"}
      </EditorPanelLegend>

      <InputField
        id={`${certification.id}-provider`}
        name={`${certification.id}-provider`}
        label="Provider"
        placeholder="Provider"
        value={certification.provider}
        onChange={(event) =>
          updateCertification(certification.id, {
            provider: event.target.value
          })
        }
      />

      <InputField
        id={`${certification.id}-title`}
        name={`${certification.id}-title`}
        label="Certification Title"
        placeholder="Certification Title"
        value={certification.title}
        onChange={(event) =>
          updateCertification(certification.id, {
            title: event.target.value
          })
        }
      />

      <InputField
        id={`${certification.id}-completed-date`}
        name={`${certification.id}-completed-date`}
        label="Date Completed"
        type="month"
        value={certification.completedDate}
        onChange={(event) =>
          updateCertification(certification.id, {
            completedDate: event.target.value
          })
        }
      />
    </EditorPanelFieldset>
  );
}
