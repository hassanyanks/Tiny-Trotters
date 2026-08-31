require 'yaml'
require 'rspec/expectations'
require 'selenium-webdriver'
require 'capybara'
require_relative '../support/tiny_trotters_support.rb'
include RSpec::Matchers

support_files_dir = File.expand_path( './features/support' )
$yaml_file = "#{support_files_dir}/yaml/tiny_trotters.yml"
$yaml_data = YAML.load_file($yaml_file, aliases: true)
home = 'http://localhost:3000'

my_selectors = {}
my_selectors['bolded paragraph'] = 'p > strong'
my_selectors['link'] = 'a'
my_selectors['level 1 heading'] = 'h1'

def fill_in_fields_from_table( table )
	@fields_and_values = table.hashes.flatten
	@fields_and_values[0].each do |key,value|
		field = key.gsub(' ','_').downcase
		puts "field #{field}, value #{value}"
		begin
		  puts "checking if text field..."
		  page.fill_in field, with: value
		rescue
		  begin
		    puts "checking if selection field..."
		    page.find('select', id: field).select value
		  rescue
		    puts "checking if checkbox field..."
		    page.check value #"input[name='#{field}']", option: value
		  end
		end
	end
end

When('I {string} the {string} {string}') do |action_type, node_name, node_type|

=begin
	method = 'find'
	target_node_str = ''
	actions = nil
	
	if node_type.include? 'link'
		target_node_str = node_name
		actions = {
			"click" => ->(locator) { page.click_link( locator ) }			
		}
	elsif node_type.include? 'button' 
		page.click_button node_name
	elsif node_type.include? 'icon'
		page.find("img[alt='#{node_name}']").click
	elsif node_type.include? 'checkbox'
		target_node_str = "input[id='#{node_name}-#{node_type}']"
		actions = {
			"click" => ->(locator) { page.find( locator ).click },
			"unclick" => ->(locator) { page.find( locator ).click }
		}
	end
=end

	puts 'yaml data ' + $yaml_data[node_name]['type']
	actions[action_type].call( target_node_str )
	
end

Given('I start to {string}') do |action|
	capybara_method = $yaml_data['actions'][action]['method']
	locator = $yaml_data['actions'][action]['locator']
	page.public_send( capybara_method, locator )
end

Given('I click pony {string}') do |pony_name|
	locator = "#{$yaml_data['actions']['Select Pony']['locator']['id']}#{pony_name}"
	$yaml_data['actions']['Select Pony']['method'].each do |capybara_method|
		puts "method:  #{capybara_method}, locator: #{locator}"
		return_value = page.public_send( capybara_method, locator )
	end
end


















When('I enter {string} into the {string} field for {string}') do |value, field_id_str, field_id_str_appendage|
	field_id = "#{field_id_str}-#{field_id_str_appendage}"
	page.find_field( id: field_id ).fill_in with: value
end

Then('the {string} field for {string} will have a value of {string}') do |field_id_str, field_id_str_appendage, value|
	field_id = "#{field_id_str}-#{field_id_str_appendage}"
	expect(page).to have_field( id: field_id, with: value)
end

When('I deselect {string} in the {string} field') do |value, fieldname|
	page.find_field( fieldname ).unselect value	
end

When('I select {string} in the {string} field') do |value, fieldname|
	page.find_field( fieldname ).select value
	sleep 5
end

When('I click the {string}') do |node_id_map_key|
	puts "incoming param:  #{node_id_map_key}, key mappings:  #{$id_mappings.to_s}, mapped key:  #{$id_mappings[node_id_map_key]}"
	page.find_by_id( $id_mappings[node_id_map_key] ).click
end

Then('I {string} see a {string} field for {string}') do |should_should_not, field_id_str, field_id_str_appendage|

=begin
	descriptorArray = field_descriptors.split ' '
	field_type = field_tag = ''
	element_css = ''
	if descriptorArray.length == 2 
		field_type = descriptorArray[0] #this will always be our element type attribute
		field_tag = descriptorArray[1]  # div, input, checkbox, select etc.
	else
		field_tag = descriptorArray[0]
	end
=end

	element_id_str = "#{field_id_str}-#{field_id_str_appendage}"
	element_label_css = "label[for='#{element_id_str}']"
	puts "element_css #{element_id_str}, label #{element_label_css}"
	expect(page.has_css?( element_label_css, visible: true )).to eq(should_should_not == 'should')
	puts 'label seen'
	expect(page.has_css?( '#' + element_id_str, visible: true )).to eq(should_should_not == 'should')
	puts 'input seen'
	#expect(page.has_element? element_label_css, visible: true ).to_be_truthy   
end


Given('I visit {string}') do |url|
  visit url
end

Then('the {string} {string} {string} be displayed') do |selector_text, selector_type, should_should_not|
  step "I \"#{should_should_not.strip}\" see the \"#{selector_text.strip}\" \"#{selector_type.strip}\""
end

Given('my logged in status as {string} is {string}') do |user_creds, login_status|
	if login_status == 'logged in'
		creds_array = user_creds.split ','
		step 'I click the "Log in" "button"'
		page.first("input[name='email']").fill_in with: creds_array[0].strip
		page.first("input[name='password']").fill_in with: creds_array[1].strip
		step 'I click the "Submit" "button"'
	end
end

Given('I set {string} to the value of {string}') do |fieldname, value|
	page.fill_in fieldname, with: value
end

When('I upload file {string}') do |filename|
	file_path = File.absolute_path('C:/Users/hassa/JavaScriptApps/test/' + filename)
	#file_path = 'C:/Users/hassa/JavaScriptApps/test/' + filename
	puts 'file is readable equals ' + File.readable?(file_path).to_s
	#e = page.find('input#fileInput')
	page.find('input', id: 'fileInput', visible: false).attach_file( file_path)
	page.find('button.upload-form-item', text: 'Upload').click
	
	#@driver.find_element(:id => "fileInput").send_keys file_path
end

Then('I should be able to see a list of {string}') do |library_assets|
	page.click_link library_assets
end

Then('I should be able to see {string} details') do |book_title|
	page.click_link book_title.slice(0,book_title.length-2)
end

When('I click the Add to cart button') do 
	e = page.driver.find_css('form.cart-quantity-form button')
		puts 'element is ' + e.to_s
		#.click #each do |e|
	#	puts 'element is ' + e.to_s
	#end
		#find('#add-to-cart-button', right_of: find('input.cart-current-quantity') ).click #
end

Then('I {string} see the {string} {string}') do |should_should_not, selector_text, selector|
	expect(page.has_selector?( selector, text: selector_text )).to eq (should_should_not == 'should')
end

When('I check the option indicated for each of the below fields:') do |table|
	@fields_and_values = table.hashes.flatten
	@fields_and_values[0].each do |key,value|
		field = key.gsub(' ','_').downcase
		puts "field #{field}, value #{value}"
		puts "checking if checkbox field..."
		page.check value #"input[name='#{field}']", option: value
	end
end

When('I select the option indicated for each of the below fields:') do |table|
	@fields_and_values = table.hashes.flatten
	@fields_and_values[0].each do |key,value|
		field = key.gsub(' ','_').downcase
		puts "field #{field}, value #{value}"
		puts "checking if selection field..."
		page.find('select', id: field).select value
	end
end

When(/I fill in these fields with the indicated values:/) do |table|
	fields_and_values = table.raw.drop 1
	fields_and_values.each_index { |i|
		field = fields_and_values[i][0]
		value = fields_and_values[i][1]
		page.first("input[name='#{field}']").fill_in with: value
	}
end

When(/I (fill in|update) the below fields with the indicated values:/) do |action, table|
	@fields_and_values = table.hashes.flatten
	@fields_and_values[0].each do |key,value|
		field = key.gsub(' ','_').downcase
		puts "field #{field}, value #{value}"
		puts "checking if text field..."
		page.fill_in field, with: value
	end
end

Then('the below fields should have the indicated values:') do |table|
	@fields_and_values = table.hashes.flatten
	@fields_and_values[0].each do |key,value|
		field = key.gsub(' ','_').downcase
		puts "field #{field}, value #{value}"
		puts "checking if selection field..."
		page.has_field?(field, with: value) == true
	end
end

When('I {string} the {string} using the below data:') do |action, asset, table|
	page.click_link "#{action.capitalize} #{asset}"
	fill_in_fields_from_table( table )
	step "I click the \"Submit\" button"
end

When('I click the {string} button') do |button_name|
	page.click_button button_name 
end

Then('{string} with text {string} {string} exist') do |selector, selector_text, should_should_not|
	expect(page.has_selector?( selector, text: selector_text )).to eq (should_should_not == 'should')
end

Then('I {string} see a {string} link') do |should_should_not, link_name|
	step "\"#{my_selectors['link']}\" with text \"#{link_name}\" \"#{should_should_not}\" exist"
	#expect(page.has_selector?( 'a', text: link_name )).to eq (should_should_not == 'should')
end

Then('I {string} see {string} on the author detail page') do |should_should_not, author_page_title|
	step "\"#{my_selectors['level 1 heading']}\" with text \"#{author_page_title}\" \"#{should_should_not}\" exist"
	#expect(page.has_selector?( 'h1', text: author_page_title )).to eq (should_should_not == 'should')
end

When('I click the {string} link, then the {string} button') do |link, button|
  step "I click the \"#{link}\" link"
  step "I click the \"#{button}\" button"
end

Then('I {string} see a {string} link on the {string} page') do |should_should_not, asset_title, asset_page_link_title|
	step "I click the \"#{asset_page_link_title}\" link"
	step "\"#{my_selectors['link']}\" with text \"#{asset_page_link_title}\" \"#{should_should_not}\" exist"
	#expect(page.has_selector?( 'a', text: asset_page_link_title )).to eq (should_should_not == 'should')
end

Given('this {string} exists, with the indicated attributes:') do |library_asset, table|
	if library_asset == 'author'
		step "I click the \"All authors\" link"
		step "I click the \"Create new author\" link"
		fill_in_fields_from_table( table )
		step "I click the \"Submit\" button"
	end
end

Then('I {string} see {string} with message {string}') do |should_should_not, selector, selector_text|
	step "\"#{my_selectors[selector]}\" with text \"#{selector_text}\" \"#{should_should_not}\" exist"
	#expect(page.has_selector?( 'a', text: asset_page_link_title )).to eq (should_should_not == 'should')
end

=begin
Then('I {string} see these elements:') do |should_should_not, table|

	nodes_and_attributes = table.raw.drop 1
	
	nodes_and_attributes.each_index { |i|
	
		element_css = nil
		node_type = nodes_and_attributes[i][0]
		node_text = nodes_and_attributes[i][1]
		node_name = nodes_and_attributes[i][2]
		node_id = nodes_and_attributes[i][3]
		
		case element_type
			when 'label'
				element_css = "label[for=#{}]"
			when 'input'
			else  #'select'
		end 
		
		
		attribute = !node_text.strip.empty? ? 'text' : (!node_id.strip.empty? ? 'id' : 'name' )
		attribute_value = !node_text.empty? ? node_text.strip : (!node_id.strip.empty? ? node_id.strip : node_name.strip )
		element_css = "#{node_type.strip}[#{attribute}='#{attribute_value}']"
		puts "\tchecking for element #{element_css}"
		#expect( page.has_element?( element_css, visible: true )).to eq(should_should_not == 'should')
		obj = page.assert_selector element_css, visible: true
		puts "object found is #{obj.to_s}"
	}
end
=end

=begin
When('I click the {string} {string} {string}') do |product_name, node_name, node_type|
	selector_path = "div.products-container div.product-container" #> h2[text='#{product_name}']" # + img + form > #{node_type}[text='#{node_name}']"
	puts 'selector path ' + selector_path
	page.all(selector_path).each do |div|
		h2 = div.find 'h2'
		if h2.text() == product_name
			h2.sibling('form').find('button').click
			break
		end
	end
end
=end


