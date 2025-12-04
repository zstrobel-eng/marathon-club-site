// This is our puppeteer testing file

const puppeteer = require("puppeteer");

const argv = require("process").argv.slice(2);
function parseArg(name) {
  const prefix = `--${name}=`;
  const found = argv.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : undefined;
}

const baseURL =
  process.env.BASE_URL ||
  parseArg("url") ||
  "https://marathon-club-site.web.app/";
const headlessArg = parseArg("headless");
const headless =
  headlessArg === undefined
    ? true
    : headlessArg !== "false" && headlessArg !== "0";
const navTimeout = parseInt(
  parseArg("timeout") || process.env.PUPPETEER_TIMEOUT || "30000",
  10
);

const defaultPages = [
  "/",
  "/index.html",
  "/about.html",
  "/calendar.html",
  "/training.html",
  "/leadership.html",
  "/resources.html",
  "/routes.html",
  "/admin.html",
];

const pagesArg = parseArg("pages");
const pages = pagesArg
  ? pagesArg.split(",").map((p) => p.trim())
  : defaultPages;

async function runCheck(browser, path) {
  const page = await browser.newPage();
  const result = {
    path,
    url: null,
    status: null,
    ok: true,
    errors: [],
    warnings: [],
    loadTime: null,
  };
  try {
    const url = new URL(path, baseURL).href;
    result.url = url;

    page.on("console", (msg) => {
      try {
        if (msg.type && msg.type() === "error") result.errors.push(msg.text());
      } catch (e) {}
    });

    const start = Date.now();
    const resp = await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: navTimeout,
    });
    result.loadTime = Date.now() - start;
    if (resp) result.status = resp.status();
    if (!resp || (result.status && result.status >= 400)) {
      result.ok = false;
      result.errors.push(`HTTP status ${result.status}`);
    }

    const hasMain = !!(await page.$("main"));
    if (!hasMain) result.warnings.push("missing <main> element");

    const hasStyles = !!(await page.$('link[rel="stylesheet"]'));
    if (!hasStyles) result.warnings.push("no stylesheet found");

    const hasScript = !!(await page.$("script"));
    if (!hasScript) result.warnings.push("no script tag found");
  } catch (err) {
    result.ok = false;
    result.errors.push(String(err));
  } finally {
    try {
      await page.close();
    } catch (e) {}
  }
  return result;
}

function printLine(...parts) {
  console.log(parts.filter(Boolean).join(" "));
}

(async function main() {
  printLine("Puppeteer baseline runner ->", baseURL);
  printLine(
    "Options:",
    `headless=${headless}`,
    `timeout=${navTimeout}ms`,
    `pages=${pages.length}`
  );

  const browser = await puppeteer.launch({
    headless,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const results = [];

  for (const p of pages) {
    process.stdout.write(`Checking ${p} ... `);
    const r = await runCheck(browser, p);
    results.push(r);
    if (r.ok && r.errors.length === 0) {
      console.log(`OK (${r.loadTime}ms)`);
    } else {
      console.log("FAIL");
    }
  }

  await browser.close();

  const failed = results.filter((r) => !r.ok || r.errors.length > 0);
  console.log("\n--- Summary ---");
  for (const r of results) {
    const state = r.ok && r.errors.length === 0 ? "PASS" : "FAIL";
    printLine(
      state,
      r.path,
      r.status || "",
      r.loadTime ? `${r.loadTime}ms` : ""
    );
    if (r.warnings.length) printLine("  Warnings:", r.warnings.join("; "));
    if (r.errors.length) printLine("  Errors:", r.errors.join("; "));
  }

  if (failed.length > 0) {
    console.error(`\n${failed.length} page(s) failed.`);
    process.exit(1);
  }
  console.log("\nAll checks passed");
  process.exit(0);
})().catch((err) => {
  console.error("Error detected", err);
  process.exit(2);
});
