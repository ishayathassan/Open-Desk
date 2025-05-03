from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Specify the path to your Chrome binary if needed
chrome_options = Options()
chrome_options.binary_location = r"C:\Program Files\Google\Chrome\Application\chrome.exe"  # Adjust this path if necessary

# Set the path to chromedriver.exe
service = Service(r"D:\chromedriver-win64\chromedriver-win64\chromedriver.exe")

driver = webdriver.Chrome(service=service, options=chrome_options)

driver.get("http://localhost:3000/login")

# Use WebDriverWait to wait for the element to be present
wait = WebDriverWait(driver, 30)  # Increased wait time to 30 seconds

# Wait for the email and password fields to be present in the DOM
def get_elements():
    email_field = wait.until(EC.presence_of_element_located((By.ID, "email")))
    password_field = wait.until(EC.presence_of_element_located((By.ID, "password")))
    login_button = wait.until(EC.element_to_be_clickable((By.ID, "login_button")))
    return email_field, password_field, login_button

# Allow some time for the page to load initially
time.sleep(3)

# Test for invalid email
def test_invalid_email():
    email_field, password_field, login_button = get_elements()  # Ensure this is called within the test function
    
    email_field.send_keys("invalid_email@example.com")
    password_field.send_keys("any_password")
    login_button.click()
    
    time.sleep(3)  # Allow time for the response to appear
    
    # Replace this with the actual error message selector or assertion you need
    error_message = driver.find_element(By.CLASS_NAME, "error-message")
    assert error_message.is_displayed()
    
    # Refresh the page after the test
    driver.refresh()
    time.sleep(3)  # Wait for the page to load again
    
    # Re-find elements after refresh
    email_field, password_field, login_button = get_elements()

# Test for valid email but wrong password
def test_valid_email_wrong_password():
    email_field, password_field, login_button = get_elements()  # Ensure this is called within the test function
    
    email_field.send_keys("msarker221253@bscse.uiu.ac.bd")
    password_field.send_keys("admin1234?1")
    login_button.click()
    
    time.sleep(3)  # Allow time for the response to appear
    
    # Replace this with the actual error message selector or assertion you need
    error_message = driver.find_element(By.CLASS_NAME, "error-message")
    assert error_message.is_displayed()

    # Refresh the page after the test
    driver.refresh()
    time.sleep(3)  # Wait for the page to load again
    
    # Re-find elements after refresh
    email_field, password_field, login_button = get_elements()

# Test for valid email and password
def test_valid_login():
    email_field, password_field, login_button = get_elements()  # Ensure this is called within the test function
    
    email_field.send_keys("msarker221253@bscse.uiu.ac.bd")
    password_field.send_keys("admin1234?")
    login_button.click()
    
    time.sleep(3)  # Allow time for the page to load after login
    
    # Replace this with the actual page title after login
    assert "Homepage" in driver.title
    
    # Refresh the page after the test
    driver.refresh()
    time.sleep(3)  # Wait for the page to load again
    
    # Re-find elements after refresh
    email_field, password_field, login_button = get_elements()

if __name__ == "__main__":
    test_invalid_email()
    test_valid_email_wrong_password()
    test_valid_login()
    driver.quit()
