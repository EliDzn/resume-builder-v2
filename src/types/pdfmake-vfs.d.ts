declare module "pdfmake/build/vfs_fonts" {
  const virtualFileSystem: import("pdfmake/interfaces").TVirtualFileSystem;
  export default virtualFileSystem;
}

declare module "pdfmake/build/standard-fonts/Times" {
  const fontContainer: import("pdfmake/interfaces").TFontContainer;
  export default fontContainer;
}
