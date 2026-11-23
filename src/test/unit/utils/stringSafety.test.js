import { describe, expect, it } from 'vitest';
import { stringUtils } from '../../../utils/stringUtils';

describe('string safety helpers', () => {
  it('escapes HTML metacharacters before rendering untrusted text', () => {
    expect(stringUtils.escapeHtml(`<img src="x" onerror='run()'>&`)).toBe(
      '&lt;img src=&quot;x&quot; onerror=&#039;run()&#039;&gt;&amp;'
    );
  });
  it('truncates only when the string exceeds the requested limit', () => {
    expect(stringUtils.truncate('short', 5)).toBe('short');
    expect(stringUtils.truncate('long value', 4, '…')).toBe('long…');
    expect(stringUtils.truncate('', 4)).toBe('');
  });
});
