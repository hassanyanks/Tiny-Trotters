require 'erb'
require 'psych'
require 'yaml'
require_relative "CucumberTestAgent"

class AuthorTestAgent < CucumberTestAgent

  attr_reader :updated_data, :delete_dependency
  
  def initialize( action, erb_template, yaml_data = nil )
    super('author', action, erb_template, yaml_data)
    @delete_dependency = 'books'
  end

  def updated_display_name()
    "#{@updated_data['family_name']}, #{@updated_data['first_name']}"	
  end
  
end

