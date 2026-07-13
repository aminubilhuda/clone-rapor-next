from playwright.sync_api import sync_playwright
import time
import os

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={"width": 1400, "height": 900},
        accept_downloads=True,
    )
    page = context.new_page()

    page.goto("http://localhost:3000/login")
    page.wait_for_load_state("networkidle")
    page.fill("#username", "abdira")
    page.fill("#password", "abdira")
    page.click("button[type='submit']")
    page.wait_for_url("**/tu*", timeout=10000)
    page.wait_for_load_state("networkidle")
    time.sleep(1)

    filter_select = page.locator("select").first
    filter_select.select_option(value="1_2")
    time.sleep(2)

    page.goto("http://localhost:3000/tu/laporan-pendidikan/daftar-rapor", wait_until="networkidle", timeout=15000)
    time.sleep(2)

    selects = page.locator("select").all()
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
        kelas_select.select_option(index=6)
        time.sleep(2)
        print("Selected kelas XI AK")

    semester_btns = page.locator("button:text-is('Semester')").all()
    print(f"Found {len(semester_btns)} Semester buttons")

    if len(semester_btns) > 0:
        with context.expect_download() as download_info:
            semester_btns[0].click()
        download = download_info.value

        pdf_path = os.path.join("test_screenshots_guru", "rapor_semester_test.pdf")
        download.save_as(pdf_path)
        print(f"PDF downloaded to: {pdf_path}")

        size = os.path.getsize(pdf_path)
        print(f"PDF size: {size} bytes")

    browser.close()
    print("Done")
