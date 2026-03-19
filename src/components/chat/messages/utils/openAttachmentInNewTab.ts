export type AttachmentOpenResult = 'opened-new-tab' | 'download-fallback' | 'skipped';

interface OpenAttachmentInNewTabInput {
  url?: string | null;
  filename?: string;
}

export const openAttachmentInNewTab = ({
  url,
  filename,
}: OpenAttachmentInNewTabInput): AttachmentOpenResult => {
  const attachmentUrl = url?.trim();
  if (!attachmentUrl) return 'skipped';

  const openedWindow = window.open(attachmentUrl, '_blank', 'noopener,noreferrer');
  if (openedWindow) return 'opened-new-tab';

  const link = document.createElement('a');
  link.href = attachmentUrl;
  if (filename) {
    link.download = filename;
  }
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.dispatchEvent(
    new CustomEvent('chat:attachment-open-fallback', {
      detail: { url: attachmentUrl },
    })
  );

  return 'download-fallback';
};
