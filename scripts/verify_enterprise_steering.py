from pathlib import Path
from playwright.sync_api import sync_playwright
import hashlib
import http.server
import json
import subprocess
import threading

root = Path(__file__).resolve().parents[1]
deck = root / "presentation/enterprise-steering-ai-era/index.html"
out = Path("/tmp/enterprise-steering-ai-era-review")
out.mkdir(parents=True, exist_ok=True)
results = []


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


server = http.server.ThreadingHTTPServer(
    ("127.0.0.1", 0),
    lambda *args, **kwargs: QuietHandler(*args, directory=str(root), **kwargs),
)
thread = threading.Thread(target=server.serve_forever, daemon=True)
thread.start()
url = f"http://127.0.0.1:{server.server_port}/presentation/enterprise-steering-ai-era/index.html"

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
    page = browser.new_page(viewport={"width": 1920, "height": 1080})
    errors = []
    requests = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("request", lambda request: requests.append(request.url))
    page.goto(url)
    page.wait_for_selector('#slide-1[aria-hidden="false"]')

    assert page.locator(".slide").count() == 5
    assert page.locator(".slide[aria-hidden=false]").count() == 1
    assert page.locator("text=55%").count() == 1
    assert page.locator("text=20%").count() == 1
    assert page.locator(".model-label").count() == 1
    assert page.locator(".eyebrow").all_inner_texts()[1:] == [
        "Decision model · Proposed management synthesis",
        "Operating model · Proposed model",
        "Funding cadence · Proposed model",
        "Investment evidence · Proposed framework",
    ]
    results.append("PASS: exactly five slides, exact evidence values and proposed-model labels")

    overflow = []
    for number in range(1, 6):
        page.goto(f"{url}#slide-{number}")
        page.wait_for_selector(f'#slide-{number}[aria-hidden="false"]')
        geometry = page.locator(f"#slide-{number}").evaluate(
            """slide => {
              const source = slide.querySelector('.source').getBoundingClientRect();
              const content = slide.querySelector('.content').getBoundingClientRect();
              const takeaway = slide.querySelector('.takeaway')?.getBoundingClientRect();
              const contentChildrenBottom = Math.max(...Array.from(slide.querySelector('.content').children).map(element => element.getBoundingClientRect().bottom));
              return {
                scrollWidth: slide.scrollWidth,
                clientWidth: slide.clientWidth,
                scrollHeight: slide.scrollHeight,
                clientHeight: slide.clientHeight,
                contentBottom: contentChildrenBottom,
                boundaryTop: takeaway ? takeaway.top : source.top,
                sourceBottom: source.bottom,
                slideBottom: slide.getBoundingClientRect().bottom
              };
            }"""
        )
        if (
            geometry["scrollWidth"] > geometry["clientWidth"]
            or geometry["scrollHeight"] > geometry["clientHeight"]
            or geometry["contentBottom"] > geometry["boundaryTop"] + 1
            or geometry["sourceBottom"] > geometry["slideBottom"] + 1
        ):
            overflow.append([number, geometry])
        page.screenshot(path=str(out / f"slide-{number}.png"), full_page=True)
    assert not overflow, overflow
    results.append("PASS: all slides reviewed at 1920×1080 with no detected clipping or region overlap")

    page.goto(url)
    page.keyboard.press("ArrowRight")
    assert page.url.endswith("#slide-2")
    page.keyboard.press("PageDown")
    assert page.url.endswith("#slide-3")
    page.keyboard.press("End")
    assert page.url.endswith("#slide-5") and page.locator("#next").is_disabled()
    page.reload()
    assert page.locator('#slide-5[aria-hidden="false"]').count() == 1
    page.keyboard.press("Home")
    assert page.url.endswith("#slide-1") and page.locator("#previous").is_disabled()
    page.keyboard.press("n")
    assert page.locator("#notes").is_visible()
    assert "Can your organisation change its investment decisions" in page.locator("#notes-body").inner_text()
    page.keyboard.press("Escape")
    assert page.locator("#notes").is_hidden()
    page.evaluate("void (document.documentElement.requestFullscreen = () => Promise.reject(new Error('blocked')))")
    page.keyboard.press("f")
    page.wait_for_function("document.querySelector('#status').textContent.includes('not available')")
    results.append("PASS: keyboard navigation, hash reload, notes, Escape and fullscreen fallback")

    page.set_viewport_size({"width": 1366, "height": 768})
    page.goto(f"{url}#slide-4")
    scale = float(page.locator("#stage").evaluate("element => getComputedStyle(element).getPropertyValue('--scale')"))
    box = page.locator("#stage").bounding_box()
    assert 0 < scale < 1 and box and box["width"] <= 1366.5 and box["height"] <= 700.5
    assert page.locator("#fullscreen").is_visible() and page.locator("#toggle-notes").is_visible()
    page.screenshot(path=str(out / "scaled-1366x768.png"), full_page=True)
    results.append("PASS: proportional scaling and accessible controls at 1366×768")

    page.emulate_media(media="print")
    assert page.locator(".slide:visible").count() == 5
    pdf = out / "print-review.pdf"
    page.pdf(path=str(pdf), prefer_css_page_size=True, print_background=True)
    info = subprocess.run(["pdfinfo", str(pdf)], check=True, capture_output=True, text=True).stdout
    assert "Pages:           5" in info, info
    results.append("PASS: print mode contains five ordered slides and PDF contains five pages")

    runtime_requests = [request_url for request_url in requests if request_url.split("#")[0] != url and not request_url.startswith("data:")]
    assert not runtime_requests, runtime_requests
    assert not errors, errors
    offline = browser.new_page(viewport={"width": 1366, "height": 768})
    offline_requests = []
    offline.on("request", lambda request: offline_requests.append(request.url))
    offline.set_content(deck.read_text(), wait_until="load")
    assert offline.locator(".slide").count() == 5
    assert not offline_requests, offline_requests
    results.append("PASS: self-contained HTML renders without runtime network dependencies or JavaScript errors")
    offline.close()
    browser.close()

server.shutdown()

report = {
    "results": results,
    "errors": errors,
    "runtime_requests": runtime_requests,
    "html_sha256": hashlib.sha256(deck.read_bytes()).hexdigest(),
    "temporary_review_directory": str(out),
}
print(json.dumps(report, indent=2))

