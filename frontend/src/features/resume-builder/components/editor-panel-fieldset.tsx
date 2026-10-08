type EditorPanelFieldsetProps = {
  children: React.ReactNode;
};

export default function EditorPanelFieldset({
  children
}: EditorPanelFieldsetProps) {
  return <fieldset className="flex flex-col gap-3">{children}</fieldset>;
}
