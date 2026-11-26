const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) => HTML_ESCAPES[character] ?? character,
  );
}

export function stripHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, '');
}

export type EnquiryEmailContent = {
  productTitle: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
};

export function renderEnquiryEmail(content: EnquiryEmailContent): {
  html: string;
  text: string;
} {
  const title = escapeHtml(content.productTitle);
  const name = escapeHtml(content.name);
  const email = escapeHtml(content.email);
  const phone =
    content.phone === undefined ? undefined : escapeHtml(content.phone);
  const message = escapeHtml(content.message).replace(/\r\n|\r|\n/g, '<br>');

  const htmlLines = [
    '<p>New product enquiry</p>',
    `<p>Product: ${title}</p>`,
    `<p>Name: ${name}</p>`,
    `<p>Email: ${email}</p>`,
    ...(phone === undefined ? [] : [`<p>Phone: ${phone}</p>`]),
    `<p>Message:<br>${message}</p>`,
  ];

  const textLines = [
    'New product enquiry',
    `Product: ${content.productTitle}`,
    `Name: ${content.name}`,
    `Email: ${content.email}`,
    ...(content.phone === undefined ? [] : [`Phone: ${content.phone}`]),
    'Message:',
    content.message,
  ];

  return {
    html: htmlLines.join('\n'),
    text: textLines.join('\n'),
  };
}
