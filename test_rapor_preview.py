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

    page.goto("http://localhost:3000/tu/laporan-pendidikan/daftar-rapor", wait_until="networkidle", timeout=15000)
    time.sleep(2)
    page.screenshot(path="test_screenshots_guru/rapor_01_no_kelas.png", full_page=True)

    selects = page.locator("select").all()
    print(f"Found {len(selects)} selects")
    for i, s in enumerate(selects):
        count = s.locator("option").count()
        print(f"  Select {i}: {count} options")

    kelas_select = page.locator("select").nth(len(selects) - 1)
    option_count = kelas_select.locator("option").count()
    print(f"Kelas select has {option_count} options")
    if option_count > 1:
        kelas_select.select_option(index=1)
        time.sleep(1)
        print(f"Selected option: {kelas_select.input_value()}")

    page.wait_for_load_state("networkidle")
    time.sleep(2)
    page.screenshot(path="test_screenshots_guru/rapor_02_dengan_kelas.png", full_page=True)

    print("Done")
    browser.close()
