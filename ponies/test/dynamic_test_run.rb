require_relative 'DynamicTestRunner' 
require 'capybara'
require 'selenium-webdriver'

Capybara.register_driver :selenium_chrome do |app|
  options = Selenium::WebDriver::Chrome::Options.new
  options.add_argument('--start-maximized')
  Capybara::Selenium::Driver.new(app, browser: :chrome, options: options)
end

# 1. Turn off local Rack server spawning (since your Node app handles this)
Capybara.run_server = false

# 2. Set the default driver to Selenium (Chrome) or Selenium Headless
Capybara.default_driver = :selenium_chrome 

# 3. Target your running Node.js application server URL
Capybara.app_host = 'https://localhost:443' # Swap out with your Node port/URL

runner = DynamicTestRunner.new
runner.execute_steps_from_file(ARGV[0])
