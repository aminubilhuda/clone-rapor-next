from playwright.sync_api import sync_playwright
import json
import os
import time

BASE = "http://localhost:3000"
SCREENSHOTS_DIR = "test_screenshots_guru"
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

results = []

def log_result(page_name, url, status, console_errors=None, screenshot=None):
    results.append({
        "page": page_name,
        "url": url,
        "status": status,
        "console_errors": console_errors or [],
        "screenshot": screenshot,
    })
    icon = "PASS" if status == "PASS" else "FAIL"
    print(f"[{icon}] {page_name} ({url})")
    if console_errors:
        for e in console_errors:
            print(f"  CONSOLE ERROR: {e}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1400, "height": 900})
    page = context.new_page()

    console_errors_all = {}
    page_console = []

    def on_console(msg):
        if msg.type in ("error",):
            page_console.append(msg.text)

    page.on("console", on_console)

    # 1. LOGIN
    print("=== LOGIN ===")
    page.goto(f"{BASE}/login")
    page.wait_for_load_state("networkidle")
    page.screenshot(path=f"{SCREENSHOTS_DIR}/00_login.png", full_page=True)

    page.fill("#username", "dasa")
    page.fill("#password", "12345678")
    page.click("button[type='submit']")
    page.wait_for_url("**/guru*", timeout=10000)
    page.wait_for_load_state("networkidle")
    time.sleep(1)

    print(f"Logged in. Current URL: {page.url}")
    page.screenshot(path=f"{SCREENSHOTS_DIR}/01_dashboard.png", full_page=True)

    if "/guru" not in page.url:
        print("FAILED: Login did not redirect to /guru")
        browser.close()
        exit(1)

    # 2. GURU PAGES - Static pages
    static_pages = [
        ("Dashboard Guru", "/guru"),
        ("Kelas-Ku", "/guru/kelas-ku"),
        ("Tujuan Pembelajaran", "/guru/tujuan-pembelajaran"),
        ("Profil", "/guru/profil"),
        ("Rekap Presensi", "/guru/rekap-presensi"),
        ("Catatan Rapor", "/guru/catatan-rapor"),
        ("Buku Induk", "/guru/buku-induk"),
        ("Piket Harian", "/guru/piket-harian"),
        ("Prakerin", "/guru/prakerin"),
        ("P5BK", "/guru/p5bk"),
        ("Kokurikuler", "/guru/kokurikuler"),
        ("Organisasi", "/guru/organisasi"),
        ("Anggota Kelas", "/guru/anggota-kelas"),
        ("Lager Nilai Kelas", "/guru/lager-nilai-kelas"),
        ("Ekstra", "/guru/ekstra"),
    ]

    idx = 2
    id_mapel_kelas_list = []

    for name, path in static_pages:
        console_errors = []
        url = f"{BASE}{path}"
        try:
            page_console.clear()
            page.goto(url, wait_until="networkidle", timeout=15000)
            time.sleep(1)
            fname = f"{idx:02d}_{name.lower().replace(' ', '_').replace('-', '_')}.png"
            screenshot_path = f"{SCREENSHOTS_DIR}/{fname}"
            page.screenshot(path=screenshot_path, full_page=True)

            if name == "Kelas-Ku":
                links = page.locator("a[href*='/guru/penilaian/']").all()
                for link in links:
                    href = link.get_attribute("href")
                    if href and "/guru/penilaian/" in href:
                        mk_id = href.split("/guru/penilaian/")[-1].split("?")[0]
                        if mk_id and mk_id not in id_mapel_kelas_list:
                            id_mapel_kelas_list.append(mk_id)

            errors = [e for e in page_console if "error" in e.lower() or "Error" in e or "uncaught" in e.lower()]
            status = "PASS"
            if errors:
                status = "WARN"
            log_result(name, path, status, errors, screenshot_path)
        except Exception as ex:
            page.screenshot(path=f"{SCREENSHOTS_DIR}/{idx:02d}_error.png", full_page=True)
            log_result(name, path, "FAIL", [str(ex)], f"{SCREENSHOTS_DIR}/{idx:02d}_error.png")
        idx += 1

    # 3. PENILAIAN PAGES (dynamic route)
    print("\n=== PENILAIAN PAGES ===")
    if id_mapel_kelas_list:
        mk_id = id_mapel_kelas_list[0]
        print(f"Using id_mapel_kelas: {mk_id}")

        detail_tabs = [
            ("formatif", "Penilaian - Formatif"),
            ("sumatif-harian", "Penilaian - Sumatif Harian"),
            ("sumatif-ts", "Penilaian - Sumatif Tengah Semester"),
            ("sumatif-as", "Penilaian - Sumatif Akhir Semester"),
        ]

        for detail, tab_name in detail_tabs:
            console_errors = []
            url = f"/guru/penilaian/{mk_id}?detail={detail}"
            full_url = f"{BASE}{url}"
            try:
                page_console.clear()
                page.goto(full_url, wait_until="networkidle", timeout=15000)
                time.sleep(1.5)
                fname = f"{idx:02d}_{tab_name.lower().replace(' ', '_').replace('-', '_')}.png"
                screenshot_path = f"{SCREENSHOTS_DIR}/{fname}"
                page.screenshot(path=screenshot_path, full_page=True)

                errors = [e for e in page_console if "error" in e.lower() or "Error" in e or "uncaught" in e.lower()]
                status = "PASS"
                if errors:
                    status = "WARN"
                log_result(tab_name, url, status, errors, screenshot_path)
            except Exception as ex:
                page.screenshot(path=f"{SCREENSHOTS_DIR}/{idx:02d}_error.png", full_page=True)
                log_result(tab_name, url, "FAIL", [str(ex)], f"{SCREENSHOTS_DIR}/{idx:02d}_error.png")
            idx += 1

        if len(id_mapel_kelas_list) > 1:
            mk_id2 = id_mapel_kelas_list[1]
            url = f"/guru/penilaian/{mk_id2}?detail=formatif"
            full_url = f"{BASE}{url}"
            try:
                page_console.clear()
                page.goto(full_url, wait_until="networkidle", timeout=15000)
                time.sleep(1.5)
                fname = f"{idx:02d}_penilaian_kelas_2.png"
                screenshot_path = f"{SCREENSHOTS_DIR}/{fname}"
                page.screenshot(path=screenshot_path, full_page=True)

                errors = [e for e in page_console if "error" in e.lower() or "Error" in e or "uncaught" in e.lower()]
                log_result(f"Penilaian - Kelas 2 (id={mk_id2})", url, "PASS" if not errors else "WARN", errors, screenshot_path)
            except Exception as ex:
                log_result(f"Penilaian - Kelas 2", url, "FAIL", [str(ex)])
            idx += 1
    else:
        print("WARNING: No id_mapel_kelas found from kelas-ku page!")
        log_result("Penilaian (all tabs)", "/guru/penilaian/*", "SKIP", ["No id_mapel_kelas available"])

    # 4. SUMMARY
    print("\n=== TEST SUMMARY ===")
    total = len(results)
    passed = sum(1 for r in results if r["status"] == "PASS")
    warned = sum(1 for r in results if r["status"] == "WARN")
    failed = sum(1 for r in results if r["status"] == "FAIL")
    skipped = sum(1 for r in results if r["status"] == "SKIP")

    print(f"Total: {total} | PASS: {passed} | WARN: {warned} | FAIL: {failed} | SKIP: {skipped}")

    if failed > 0:
        print("\nFAILED PAGES:")
        for r in results:
            if r["status"] == "FAIL":
                print(f"  - {r['page']}: {r['console_errors']}")

    if warned > 0:
        print("\nWARNED PAGES (console errors):")
        for r in results:
            if r["status"] == "WARN":
                print(f"  - {r['page']}: {r['console_errors']}")

    with open(f"{SCREENSHOTS_DIR}/results.json", "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nResults saved to {SCREENSHOTS_DIR}/results.json")
    print(f"Screenshots in {SCREENSHOTS_DIR}/")

    browser.close()
