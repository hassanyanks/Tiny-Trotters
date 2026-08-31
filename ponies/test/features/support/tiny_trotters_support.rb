require 'yaml'
require 'rspec/expectations'
require 'selenium-webdriver'
require 'capybara'
include RSpec::Matchers

$id_mappings = { 
	'Prince checkbox' => 'pony-checkbox-Prince'
	
}
