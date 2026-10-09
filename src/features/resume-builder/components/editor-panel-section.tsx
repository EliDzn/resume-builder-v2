import { useId, useState, type ReactNode } from "react";
import { ChevronsDown } from "lucide-react";

type EditorPanelSectionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export default function EditorPanelSection({
  title,
  children,
  defaultOpen = false
}: EditorPanelSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section className="w-full">
      <h2 className="m-0 text-h2 font-semibold">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-2 text-left hover:cursor-pointer"
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="font-semibold">{title}</span>

          <ChevronsDown
            aria-hidden="true"
            className={[
              "transition-transform duration-300 ease-out motion-reduce:transition-none",
              isOpen && "rotate-180"
            ]
              .filter(Boolean)
              .join(" ")}
          />
        </button>
      </h2>

      <div
        id={contentId}
        aria-hidden={!isOpen}
        className={[
          "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        ].join(" ")}
      >
        <div
          className={[
            "min-h-0 overflow-hidden px-4 transition-opacity duration-200",
            isOpen ? "opacity-100" : "pointer-events-none opacity-0"
          ].join(" ")}
        >
          <div className="pb-4">{children}</div>
        </div>
      </div>
    </section>
  );
}
