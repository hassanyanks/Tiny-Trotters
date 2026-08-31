require 'erb'
require 'psych'
require 'yaml'

class CucumberTestAgent

  attr_reader :entities, :entity, :yaml_file, :erb_template, :action, :yaml_data, :entity_display_name, :text_fields, :validation_data
  attr_reader :text_fields, :select_fields, :checkbox_fields, :selector_name_delimiter, :entity_type, :updated_data
  
  def initialize( entity_type, action, erb_template, yaml_data )
	@selector_name_delimiter = '_'
    @entity_type = entity_type
	@action = action
	@erb_template = erb_template
	@yaml_data = yaml_data
	@entities = @yaml_data['actions'][@action][@entity_type] #Array
	@entity = nil 
	@entity_display_name = nil #@entity['display name'].instance_of?(Array) ? @entity['display name'].join(' ') : @entity['display name']
	@text_fields = nil
	@select_fields = nil
	@checkbox_fields = nil
	@updated_data = nil
  end

  def run_test()
    exec("cucumber -f pretty -t @#{@action}_#{self.sanitized_entity_type}")
  end
  
  def init_entity_data( entity )
    @entity = entity
	@entity_display_name = @entity['display name'].instance_of?(Array) ? @entity['display name'].join(' ') : @entity['display name']
	self.init_fields_data if !@entity['fields'].nil?
    @updated_data = !@entity['validation'].nil? ? {}.merge(*@entity['validation']['data']) : nil #Hash
  end
  
  def init_fields_data()
	@text_fields = !@entity['fields']['text'].nil? ? @entity['fields']['text'] : nil
	@select_fields = !@entity['fields']['select'].nil? ? @entity['fields']['select'] : nil
	@checkbox_fields = !@entity['fields']['checkbox'].nil? ? @entity['fields']['checkbox'] : nil
  end
  
  def build_feature_file( feature_file_path )
    template = File.read(@erb_template)
    feature_file_contents = ERB.new(template, trim_mode: "%<>").result binding
	puts feature_file_contents
    File.write( feature_file_path, feature_file_contents)
  end
  
  def sanitized_entity_type()
    @entity_type.gsub(' ', @selector_name_delimiter)
  end
  
  def site_home()
    @yaml_data['links']['home']
  end
  
  def display_file_contents( file_path )
    f = File.open( file_path );
    content = f.read
    puts content
  end

end


