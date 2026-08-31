require 'capybara/cucumber'

Capybara.register_driver :selenium_chrome do |app|
  options = Selenium::WebDriver::Chrome::Options.new
  options.add_argument('--start-maximized')
  Capybara::Selenium::Driver.new(app, browser: :chrome, options: options)
end

Capybara.default_driver = :selenium_chrome #and :selenium_chrome_headless are also registered

before(:each) do
  page.driver.browser.manage.window.maximize
end

