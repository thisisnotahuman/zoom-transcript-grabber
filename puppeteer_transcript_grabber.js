const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const os = require('os');
// const { dialog } = require('electron');

const [, , zoomUrl] = process.argv;
if (!zoomUrl) {
  console.error('❌ A Zoom link is required.');
  process.exit(1);
}

(async () => {
  console.log('🔗 Opening the Zoom page...');
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: path.join(os.homedir(), '.zoom_transcript_profile')
  });
  
  const pages = await browser.pages();
  const page = pages[0];

  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  );
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://nyu.zoom.us/'
  });
  await page.setJavaScriptEnabled(true);
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  const cookiesPath = path.join(os.homedir(), '.zoom_grabber_cookies.json');
  if (fs.existsSync(cookiesPath)) {
    const cookies = JSON.parse(fs.readFileSync(cookiesPath));
    await page.setCookie(...cookies);
    console.log('🍪 The cookies from the last login have been loaded.');
  }

  await page.goto(zoomUrl, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(res => setTimeout(res, 4000));

  try {
    const cookies = await page.cookies();
    fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
    console.log('✅ Cookie saved.');
  } catch (e) {
    console.warn('⚠️ Failed to save cookies:', e.message);
  }

  console.log('📢 Attempting to detect whether the captions have loaded...');
  let transcriptLoaded = false;

  try {
    await page.waitForFunction(() => {
      return !!document.querySelector('[id^="transcript-list-item"]');
    }, { timeout: 30000 });
    transcriptLoaded = true;
    console.log('🟢 Captions have been loaded.');
  } catch (err) {
    console.warn('⚠️ Failed to detect the captions panel in the end:', err.message);

    // await dialog.showMessageBox({
    //   type: 'warning',
    //   title: 'Captions not loaded.',
    //   message: 'The captions panel could not be detected. Please close the opened video window and click "Start Listening" again.'
    // });

    await browser.close();
    return;
  }

  if (!transcriptLoaded) {
    console.warn('⚠️ No captions panel found on the page; caption extraction may not be possible.');
  }

  console.log('✅ Start listening to captions...');
  await page.evaluate(() => {
    window.__captions__ = [];
    const seen = new Set();

    const cleanText = (text) => text.replace(/\s*\n\s*/g, ' ').trim();

    const scan = () => {
      const items = document.querySelectorAll('[id^="transcript-list-item"]');
      for (const el of items) {
        const rawText = cleanText(el.innerText || "");
        const key = rawText.replace(/\s+/g, " ");
        if (!key || seen.has(key)) continue;
        seen.add(key);
        const rect = el.getBoundingClientRect();
        window.__captions__.push({
          text: rawText,
          time: Date.now(),
          top: rect.top
        });
        console.log('[🎯]', rawText);
      }
    };

    setInterval(scan, 1000);
  });

  process.on('message', async (msg) => {
    if (msg.type === 'EXPORT_TRANSCRIPT') {
      const result = await page.evaluate(() => window.__captions__ || []);
      const sorted = result.sort((a, b) => a.time !== b.time ? a.time - b.time : a.top - b.top);
      const lines = sorted.map(item => item.text);

      // const { filePath } = await dialog.showSaveDialog({
      //   title: 'Save captions file.',
      //   defaultPath: 'transcript_live_final.txt',
      //   filters: [{ name: 'Text Files', extensions: ['txt'] }]
      // });

      const filePath = path.join(os.homedir(), 'Desktop', 'transcript_live_final.txt');
      console.log('📄 Default export path:', filePath);


      if (filePath) {
        fs.writeFileSync(filePath, lines.join('\n\n'));
        console.log('📄 Captions have been exported to:', filePath);
      } else {
        console.log('⚠️ The user canceled the export operation.');
      }
    }
  });

  console.log('⌛ Waiting for export. Please click the button in the GUI to export captions.');
  await new Promise(() => {});
})();
