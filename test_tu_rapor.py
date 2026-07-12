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
    print(f"Logged in as TU. URL: {page.url}")

    page.goto("http://localhost:3000/tu/laporan-pendidikan/daftar-rapor", wait_until="networkidle", timeout=15000)
    time.sleep(1)
    page.screenshot(path="test_screenshots_guru/tu_daftar_rapor.png", full_page=True)
    print("Screenshot taken: tu_daftar_rapor.png")

    page.select_option("select", index=1)
    time.sleep(1)
    page.screenshot(path="test_screenshots_guru/tu_daftar_rapor_with_kelas.png", full_page=True)
    print("Screenshot taken: tu_daftar_rapor_with_kelas.png")

    browser.close()
