declare module "pagedjs" {
  export type PagedPage = {
    element: HTMLElement;
    blank?: boolean;
  };

  export type PagedFlow = {
    pages: PagedPage[];
    total: number;
  };

  export class Previewer {
    preview(
      content: HTMLElement,
      stylesheets?: Array<string | Record<string, string>>,
      renderTo?: HTMLElement
    ): Promise<PagedFlow>;
  }
}
