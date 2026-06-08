"""
Publish Service — Real browser automation via Playwright.
Launches a visible browser to allow user login and automatic content injection.
"""
import asyncio
from playwright.async_api import async_playwright

async def publish_to_social(platform: str, content: str, images: list = None):
    """
    Launches a real browser, waits for user login, and posts content.
    """
    async with async_playwright() as p:
        # Launch headed browser so user can see and interact
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()
        
        if platform.lower() == "linkedin":
            print("[publish] Navigating to LinkedIn...")
            await page.goto("https://www.linkedin.com/feed/")
            
            # Wait for user to log in manually if they aren't already
            print("[publish] Waiting for user to log in...")
            try:
                # Wait for the 'Start a post' button to appear (indicates login success)
                await page.wait_for_selector(".share-box-feed-entry__trigger", timeout=120000)
            except:
                print("[publish] Timeout waiting for login.")
                await browser.close()
                return False
            
            print("[publish] Login detected. Injecting content...")
            await page.click(".share-box-feed-entry__trigger")
            await page.wait_for_selector(".ql-editor")
            await page.fill(".ql-editor", content)
            
            # Note: Image upload via Playwright requires more complex interaction
            # We'll stick to text for now or provide instructions
            print("[publish] Content injected. User can now review and click Post.")
            
        elif platform.lower() == "twitter":
            print("[publish] Navigating to Twitter...")
            await page.goto("https://twitter.com/home")
            
            print("[publish] Waiting for user to log in...")
            try:
                await page.wait_for_selector('[data-testid="SideNav_NewTweet_Button"]', timeout=120000)
            except:
                print("[publish] Timeout waiting for login.")
                await browser.close()
                return False
                
            await page.click('[data-testid="SideNav_NewTweet_Button"]')
            await page.wait_for_selector(".public-DraftEditor-content")
            await page.fill(".public-DraftEditor-content", content)
            
        # Keep the browser open for the user to finalize
        print("[publish] Posting ready. Please review in the opened browser window.")
        
        # Keep alive for a bit so they can finish
        await asyncio.sleep(60)
        await browser.close()
        return True
