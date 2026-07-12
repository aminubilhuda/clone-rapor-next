from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1400, "height": 900})

    page.goto("http://localhost:3000/login")
    page.wait_for_load_state("networkidle")
    page.fill("#username", "abdira")
    page.fill("#password", "abdira")
    page.click("button[type='submit']")
    page.wait_for_url("**/tu*", timeout=10000)
    page.wait_for_load_state("networkidle")
    time.sleep(1)
    print(f"Logged in. URL: {page.url}")

    page.goto("http://localhost:3000/tu/laporan-pendidikan/daftar-rapor", wait_until="networkidle", timeout=15000)
    time.sleep(2)
    page.screenshot(path="test_screenshots_guru/check_01.png", full_page=True)
    print("Screenshot 1 taken (no kelas)")

    selects = page.locator("select").all()
    print(f"Found {len(selects)} selects on page")
    for i, s in enumerate(selects):
        opts = s.locator("option").all()
        labels = [o.text_content() for o in opts]
        print(f"  Select {i}: {labels}")

    kelas_select = None
    for s in selects:
        opts = s.locator("option").all()
        for o in opts:
            txt = o.text_content() or ""
            if "Pilih Kelas" in txt:
                kelas_select = s
                break
        if kelas_select:
            break

    if kelas_select:
        opts = kelas_select.locator("option").all()
        if len(opts) > 1:
            kelas_select.select_option(index=1)
            time.sleep(2)
            page.wait_for_load_state("networkidle")
            page.screenshot(path="test_screenshots_guru/check_02.png", full_page=True)
            print("Screenshot 2 taken (with kelas)")
        else:
            print("No kelas options available (only 'Pilih Kelas')")
    else:
        print("Could not find kelas select")

    browser.close()
    print("Done")
