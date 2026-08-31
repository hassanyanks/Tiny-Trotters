require 'yaml'
require 'capybara/dsl'
require 'fileutils'

class DynamicTestRunner
  include Capybara::DSL

  def execute_steps_from_file(file_path)
    steps = YAML.load_file(file_path)

    steps.each_with_index do |step, index|
      action = step['action'].to_sym
      puts "Processing step #{index + 1}: #{action}"

      begin
        # 1. Execute the step and capture the return value
        result = execute_step(action, step)

        # 2. Check if this is an assertion method (ends with ?)
        if action.to_s.end_with?('?') && result == false
          raise "Assertion Failed: Expected #{action} '#{step['locator']}' to be true, but got false."
        end

      rescue StandardError => e
        handle_failure(index + 1, action, step, e)
      end
    end
  end

  private

  def execute_step(action, step)
    case action
		
	when :fill_in_time
		datetime = step['value'].split ' ' #"09/01/2026 09:00 AM"
		day = datetime[0].split('/')[0] #.gsub('/', '')
		mon = datetime[0].split('/')[1] #.gsub('/', '')
		yr = datetime[0].split('/')[2] #.gsub('/', '')
		hr = datetime[1].split(':')[0] #.sub(':', '')
		min = datetime[1].split(':')[1] #.sub(':', '')
		meridiem = datetime[2]
		#time_24 = Time.parse("#{datetime[1]} #{datetime[2]}").strftime("%H:%M")
		#datetime_value = "#{datetime[0]}T#{time_24}"
		#puts "date: #{datetime[0]}, time: #{datetime[1]}, am/pm: #{datetime[2]}, datetime value:  #{datetime_value}"
		#page.find("input##{step['locator']}").set(datetime_value)
		page.find("input##{step['locator']}").send_keys("#{day}", "#{mon}", "#{yr}", :tab, "#{hr}", "#{min}", "#{meridiem}")
	
		#page.find("input[id='#{step['locator']}']").send_keys("#{date}", :tab "#{time}", :tab "#{am_pm}")
=begin
		inputs = [day, :tab, mon, :tab, yr, :tab, hr, :tab, min, :tab, meridiem]

		element = page.find("input##{step['locator']}")

		inputs.each do |key|
			puts "filling in #{key}..."
			element.send_keys(key)
			sleep 2.0
		end
=end
	
	when :has_field?, :has_css?, :has_no_field?, :has_select?, :has_checked_field?, :has_no_checked_field?
		if !step['options'].nil?
			options = step['options'].transform_keys(&:to_sym)
			options[:exact] = true
			page.public_send(action, step['locator'], **options)
		else
			ret_val = page.public_send(action, step['locator'])
			if ret_val == true and action == :has_checked_field?
				puts 'checking checkbox'
				page.public_send('check', step['locator'])
			end
		end
		
    when :maximize_window
      # Accesses the current window and maximizes it natively
      page.driver.browser.manage.window.maximize

    when :fill_in
      page.public_send(action, step['locator'], with: step['value'])

    when :select_multiple
      # Extract options hash and convert keys to symbols (e.g., :from)
      options = step['options'] ? step['options'].transform_keys(&:to_sym) : {}
      
      # Force exact matching to prevent ambiguous errors across your Node.js layout
      options[:exact] = true

      # Extract the array of choices from the YAML file
      choices = step['values'] # This holds ["United States", "Canada", ...]

      # Loop through each item and execute Capybara's selection natively
      choices.each do |option_text|
        page.select(option_text, **options)
      end

    when :select, :unselect
      options = step['options'].transform_keys(&:to_sym)
	  options[:exact] = true
      page.public_send(action, step['locator'], **options)

    when :check, :uncheck, :click_button, :click_link
      page.public_send(action, step['locator'])

    when :save_screenshot
      page.public_send(action, step['filename'])

    else
      execute_generic_step(action, step)
    end
  end

  def execute_generic_step(action, step)
    if step['value'] && step['locator']
      page.public_send(action, step['locator'], step['value'])
    elsif step['locator']
      page.public_send(action, step['locator'])
    else
      page.public_send(action)
    end
  end

  def handle_failure(step_number, action, step, error)
    # Ensure a dedicated screenshots folder exists
    FileUtils.mkdir_p('tmp/screenshots')
    
    # Create a unique timestamped file name
    timestamp = Time.now.strftime('%Y%m%d_%H%M%S')
    screenshot_path = "tmp/screenshots/failure_step_#{step_number}_#{timestamp}.png"
    
    # Save the screenshot
    page.save_screenshot(screenshot_path)
    
    # Log details to stdout before raising
    puts "\n❌ TEST FAILED AT STEP #{step_number}!"
    puts "Action: #{action}"
    puts "Locator: #{step['locator']}"
    puts "Screenshot saved to: #{screenshot_path}"
    puts "Error Message: #{error.message}\n\n"
    
    # Bubble up the original exception so your test framework runner catches it
    raise error
  end
end
