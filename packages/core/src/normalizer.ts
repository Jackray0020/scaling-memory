import { PageContent, NormalizedContent, ContentChunk } from './types';

/**
 * ContentNormalizer: Handles page content capture and boilerplate removal
 */
export class ContentNormalizer {
  private static readonly BOILERPLATE_SELECTORS = [
    'script',
    'style',
    'meta',
    'link',
    'noscript',
    'iframe',
    'nav',
    '.advertisement',
    '.ads',
    '.social-share',
    '.newsletter-signup',
    '[role="complementary"]',
    'aside.sidebar',
  ];

  private static readonly MIN_TEXT_LENGTH = 50;

  /**
   * Normalize page content by removing boilerplate
   */
  static normalize(content: PageContent): NormalizedContent {
    const cleanedText = this.removeBoilerplate(content.html, content.text);
    const normalizedText = this.normalizeWhitespace(cleanedText);

    return {
      url: content.url,
      title: content.title,
      content: normalizedText,
      metadata: content.metadata,
    };
  }

  /**
   * Remove boilerplate elements from HTML
   */
  private static removeBoilerplate(html: string, text: string): string {
    let processed = html;

    for (const selector of this.BOILERPLATE_SELECTORS) {
      const regex = this.selectorToRegex(selector);
      processed = processed.replace(regex, '');
    }

    // Extract text content from remaining HTML
    const textContent = this.extractText(processed);
    return textContent || text;
  }

  /**
   * Convert CSS selector to regex for simple removal
   */
  private static selectorToRegex(selector: string): RegExp {
    if (selector.startsWith('[')) {
      return new RegExp(`<[^>]*${selector}[^>]*>.*?</[^>]*>`, 'gi');
    }
    if (selector.startsWith('.')) {
      const className = selector.substring(1);
      return new RegExp(`<[^>]*class="[^"]*${className}[^"]*"[^>]*>.*?</[^>]*>`, 'gi');
    }
    if (selector.startsWith('#')) {
      const id = selector.substring(1);
      return new RegExp(`<[^>]*id="${id}"[^>]*>.*?</[^>]*>`, 'gi');
    }
    return new RegExp(`<${selector}[^>]*>.*?</${selector}>`, 'gi');
  }

  /**
   * Extract plain text from HTML
   */
  private static extractText(html: string): string {
    return html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Normalize whitespace and clean up text
   */
  private static normalizeWhitespace(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[\r\n]+/g, '\n')
      .trim();
  }

  /**
   * Validate content quality
   */
  static isValidContent(content: NormalizedContent): boolean {
    return content.content.length >= this.MIN_TEXT_LENGTH &&
           content.url.length > 0 &&
           content.title.length > 0;
  }

  /**
   * Calculate hash for content deduplication
   */
  static getContentHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

/**
 * ContentChunker: Handles chunking of long documents
 */
export class ContentChunker {
  private static readonly DEFAULT_CHUNK_SIZE = 4000; // characters
  private static readonly DEFAULT_OVERLAP = 200; // characters

  /**
   * Split content into chunks
   */
  static chunkContent(
    content: string,
    maxChunkSize: number = this.DEFAULT_CHUNK_SIZE,
    overlap: number = this.DEFAULT_OVERLAP
  ): ContentChunk[] {
    if (content.length <= maxChunkSize) {
      return [{
        index: 0,
        content,
        startOffset: 0,
        endOffset: content.length,
      }];
    }

    const chunks: ContentChunk[] = [];
    let offset = 0;
    let index = 0;

    while (offset < content.length) {
      const endOffset = Math.min(offset + maxChunkSize, content.length);
      const chunkContent = content.substring(offset, endOffset);

      chunks.push({
        index,
        content: chunkContent,
        startOffset: offset,
        endOffset,
      });

      offset = endOffset - overlap;
      if (offset >= content.length) break;
      index++;
    }

    return chunks;
  }

  /**
   * Get recommended chunk parameters based on content
   */
  static getRecommendedChunkSize(contentLength: number): number {
    if (contentLength < 10000) return 4000;
    if (contentLength < 50000) return 6000;
    return 8000;
  }
}
