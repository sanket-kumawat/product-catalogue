import { describe, expect, it } from 'vitest';

import { renderEnquiryEmail } from './render-enquiry-email.js';

describe('renderEnquiryEmail', () => {
  it('escapes HTML after the message is written, then turns newlines into breaks', () => {
    const rendered = renderEnquiryEmail({
      productTitle: 'Tom & <Jerry>',
      name: 'Ann "Ada" O\'Brien',
      email: 'ada@example.com',
      phone: '<555>',
      message: 'hello\n<script>',
    });

    expect(rendered.html).toContain('Tom &amp; &lt;Jerry&gt;');
    expect(rendered.html).toContain('Ann &quot;Ada&quot; O&#39;Brien');
    expect(rendered.html).toContain('&lt;555&gt;');
    expect(rendered.html).toContain('hello<br>&lt;script&gt;');
    expect(rendered.html).not.toContain('<script>');
    expect(rendered.text).toContain('<script>');
    expect(rendered.text).toContain('hello\n<script>');
    expect(rendered.text).toContain('Tom & <Jerry>');
  });
});
