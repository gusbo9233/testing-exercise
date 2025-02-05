import pytest
from playwright.sync_api import Page, expect

def test_medical_page_loads(page: Page):
    # Navigate to the medical page
    page.goto("http://localhost:3001/medical")
    page.wait_for_load_state("networkidle")
    
    # Check if the title is present
    expect(page.locator("h1.text-3xl")).to_contain_text("Medical Journal Documents")
    
    # Check if the main components are visible
    expect(page.get_by_placeholder("Search documents...")).to_be_visible()
    expect(page.locator("select").first).to_be_visible()

def test_search_functionality(page: Page):
    page.goto("http://localhost:3001/medical")
    page.wait_for_load_state("networkidle")
    
    # Test search
    search_input = page.get_by_placeholder("Search documents...")
    search_input.fill("Cardiology")
    
    # Wait for the search results
    page.wait_for_timeout(1000)
    
    # Check if search results contain the search term
    results = page.locator("button.w-full.text-left.border")
    expect(results.first).to_contain_text("Cardiology", ignore_case=True)

def test_filter_functionality(page: Page):
    page.goto("http://localhost:3001/medical")
    page.wait_for_load_state("networkidle")
    
    # Test category filter
    category_select = page.locator("select").first
    category_select.select_option("Cardiology")
    
    # Wait for the filter to apply
    page.wait_for_timeout(1000)
    
    # Check if filtered results match the category
    results = page.locator("button.w-full.text-left.border")
    expect(results.first).to_contain_text("Cardiology")

def test_document_selection(page: Page):
    page.goto("http://localhost:3001/medical")
    page.wait_for_load_state("networkidle")
    
    # Click on the first document
    first_doc = page.locator("button.w-full.text-left.border").first
    first_doc.click()
    
    # Check if document details are displayed
    expect(page.locator(".prose")).to_be_visible()

def test_performance_data(page: Page):
    page.goto("http://localhost:3001/medical")
    page.wait_for_load_state("networkidle")
    
    # Click download performance data button
    download_button = page.get_by_text("Download Performance Data")
    
    # Start waiting for the download before clicking
    with page.expect_download() as download_info:
        download_button.click()
    
    download = download_info.value
    
    # Verify the download started
    assert download.suggested_filename == "performance_data.csv"

def test_navigation(page: Page):
    page.goto("http://localhost:3001/medical")
    page.wait_for_load_state("networkidle")
    
    # Click on dashboard link
    dashboard_link = page.get_by_text("View Performance Dashboard")
    dashboard_link.click()
    
    # Check if we navigated to the dashboard
    expect(page).to_have_url("http://localhost:3001/dashboard")

@pytest.fixture(autouse=True)
def run_around_tests():
    # Setup code (if needed)
    yield
    # Cleanup code (if needed) 