import pytest
from playwright.sync_api import Page, expect

def test_calculator_loads(page: Page):
    # Navigate to the calculator page
    page.goto("http://localhost:3001/calculator")
    
    # Check if the calculator display is present and shows initial value
    display = page.locator(".bg-white.p-4")
    expect(display).to_be_visible()
    expect(display).to_have_text("0")

def test_number_input(page: Page):
    page.goto("http://localhost:3001/calculator")
    
    # Test clicking multiple numbers
    page.get_by_text("1").click()
    page.get_by_text("2").click()
    page.get_by_text("3").click()
    
    # Check if display shows the correct number
    expect(page.locator(".bg-white.p-4")).to_have_text("123")

def test_basic_addition(page: Page):
    page.goto("http://localhost:3001/calculator")
    
    # Perform 5 + 3 = 8
    page.get_by_text("5").click()
    page.get_by_text("+").click()
    page.get_by_text("3").click()
    page.get_by_text("=").click()
    
    # Check if display shows the correct result
    expect(page.locator(".bg-white.p-4")).to_have_text("8")

def test_basic_subtraction(page: Page):
    page.goto("http://localhost:3001/calculator")
    
    # Perform 9 - 4 = 5
    page.get_by_text("9").click()
    page.get_by_text("-").click()
    page.get_by_text("4").click()
    page.get_by_text("=").click()
    
    # Check if display shows the correct result
    expect(page.locator(".bg-white.p-4")).to_have_text("5")

def test_basic_multiplication(page: Page):
    page.goto("http://localhost:3001/calculator")
    
    # Perform 6 × 7 = 42
    page.get_by_text("6").click()
    page.get_by_text("×").click()
    page.get_by_text("7").click()
    page.get_by_text("=").click()
    
    # Check if display shows the correct result
    expect(page.locator(".bg-white.p-4")).to_have_text("42")

def test_basic_division(page: Page):
    page.goto("http://localhost:3001/calculator")
    
    # Perform 8 ÷ 2 = 4
    page.get_by_text("8").click()
    page.get_by_text("÷").click()
    page.get_by_text("2").click()
    page.get_by_text("=").click()
    
    # Check if display shows the correct result
    expect(page.locator(".bg-white.p-4")).to_have_text("4")

def test_clear_button(page: Page):
    page.goto("http://localhost:3001/calculator")
    
    # Enter some numbers
    page.get_by_text("1").click()
    page.get_by_text("2").click()
    page.get_by_text("3").click()
    
    # Click clear button
    page.get_by_text("Clear").click()
    
    # Check if display is reset to 0
    expect(page.locator(".bg-white.p-4")).to_have_text("0")

def test_decimal_numbers(page: Page):
    page.goto("http://localhost:3001/calculator")
    
    # Enter 3.14
    page.get_by_text("3").click()
    page.get_by_text(".").click()
    page.get_by_text("1").click()
    page.get_by_text("4").click()
    
    # Check if display shows the decimal number
    expect(page.locator(".bg-white.p-4")).to_have_text("3.14")

def test_multiple_operations(page: Page):
    page.goto("http://localhost:3001/calculator")
    
    # Perform 5 + 3 = 8, then multiply by 2 = 16
    page.get_by_text("5").click()
    page.get_by_text("+").click()
    page.get_by_text("3").click()
    page.get_by_text("=").click()
    page.get_by_text("×").click()
    page.get_by_text("2").click()
    page.get_by_text("=").click()
    
    # Check if display shows the final result
    expect(page.locator(".bg-white.p-4")).to_have_text("16") 