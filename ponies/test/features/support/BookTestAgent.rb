require 'erb'
require 'psych'
require 'yaml'
require_relative "CucumberTestAgent"

class BookTestAgent < CucumberTestAgent

  attr_reader :updated_data, :delete_dependency
  
  def initialize( action, erb_template, yaml_data = nil )
    super('book', action, erb_template, yaml_data)
    @delete_dependency = nil
  end

  def updated_display_name()
    @updated_data['title']	
  end
  
end

