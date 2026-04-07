import puppeteer, { Browser } from 'puppeteer';
import chromium from '@sparticuz/chromium-min';

let browserInstance: Browser | null = null;

/**
 * Get or create a Puppeteer browser instance.
 * Reuses existing instance across invocations (serverless optimization).
 * This singleton pattern is critical for Vercel Functions where each
 * invocation shares the same Lambda runtime across requests.
 *
 * On first call: Launches browser (~10-15 seconds cold start)
 * On subsequent calls: Reuses existing instance (<100ms)
 */
export async function getBrowserInstance(): Promise<Browser> {
  if (browserInstance) {
    return browserInstance;
  }

  const isProduction = process.env.NODE_ENV === 'production';

  let executablePath: string | undefined;
  if (isProduction) {
    executablePath = await chromium.executablePath();
  }

  browserInstance = await puppeteer.launch({
    args: isProduction
      ? chromium.args
      : [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
    executablePath,
    headless: true,
  });

  return browserInstance;
}

/**
 * Close the browser instance (called on shutdown or error).
 * Gracefully closes all pages and connections.
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Reset the singleton (for testing).
 * Clears the browser instance reference without closing it.
 * Useful for unit tests that need to mock the browser.
 */
export function resetBrowser(): void {
  browserInstance = null;
}
