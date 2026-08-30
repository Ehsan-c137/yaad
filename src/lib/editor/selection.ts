export function getCaretOffset(element: HTMLElement): number {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return 0;

  const range = selection.getRangeAt(0);
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.startContainer, range.startOffset);
  return preCaretRange.toString().length;
}

export function setCaretOffset(element: HTMLElement, offset: number) {
  const selection = window.getSelection();
  if (!selection) return;

  const createRange = (
    node: Node,
    currentOffset: number,
  ): { node: Node; offset: number } | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent && node.textContent.length >= currentOffset) {
        return { node, offset: currentOffset };
      }

      return null;
    }

    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      const text = child.textContent || "";

      if (text.length >= currentOffset) {
        const result = createRange(child, currentOffset);
        if (result) return result;
      }

      currentOffset -= text.length;
    }

    return null;
  };

  const target = createRange(element, offset);

  if (target) {
    const range = document.createRange();
    range.setStart(target.node, target.offset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
