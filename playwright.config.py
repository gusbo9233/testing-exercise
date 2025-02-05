from playwright.sync_api import Playwright, sync_playwright, expect

def pytest_configure(config):
    config.addinivalue_line(
        "markers", "slow: mark test as slow to run"
    )

def pytest_addoption(parser):
    parser.addoption(
        "--browser",
        action="store",
        default="chromium",
        help="browser to use for testing: chromium, firefox, or webkit",
    )

def pytest_generate_tests(metafunc):
    if "browser_name" in metafunc.fixturenames:
        browsers = metafunc.config.getoption("browser").split(",")
        metafunc.parametrize("browser_name", browsers)

def get_browser_instance(playwright: Playwright, browser_name: str):
    if browser_name == "chromium":
        return playwright.chromium.launch()
    elif browser_name == "firefox":
        return playwright.firefox.launch()
    elif browser_name == "webkit":
        return playwright.webkit.launch()
    else:
        raise ValueError(f"Invalid browser name: {browser_name}")

def pytest_runtest_setup(item):
    if "slow" in item.keywords and not item.config.getoption("--runslow"):
        pytest.skip("need --runslow option to run") 