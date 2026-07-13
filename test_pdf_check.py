from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={"width": 800, "height": 1000},
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
        with context.expect_page() as new_page_info:
            semester_btns[0].click()
        new_page = new_page_info.value
        time.sleep(5)

        try:
            new_page.wait_for_load_state("networkidle", timeout=15000)
        except:
            pass
        time.sleep(2)

        print(f"PDF tab URL: {new_page.url}")

        new_page.screenshot(path="test_screenshots_guru/pdf_p1.png", full_page=False)
        print("Screenshot page 1 taken")

        new_page.evaluate("window.scrollBy(0, 900)")
        time.sleep(1)
        new_page.screenshot(path="test_screenshots_guru/pdf_p1b.png", full_page=False)
        print("Screenshot page 1 scrolled taken")

        new_page.evaluate("window.scrollBy(0, 900)")
        time.sleep(1)
        new_page.screenshot(path="test_screenshots_guru/pdf_p2.png", full_page=False)
        print("Screenshot page 2 taken")

        new_page.evaluate("window.scrollBy(0, 900)")
        time.sleep(1)
        new_page.screenshot(path="test_screenshots_guru/pdf_p2b.png", full_page=False)
        print("Screenshot page 2b taken")

    browser.close()
    print("Done")
