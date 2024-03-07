export default function nextInvalidImportErrorLoader() {
    const { message } = this.getOptions();
    throw new Error(message);
}
