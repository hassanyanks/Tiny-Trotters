require_relative "features/support/AuthorTestAgent"
require_relative "features/support/GenreTestAgent"
require_relative "features/support/BookTestAgent"
require_relative "features/support/BookInstanceTestAgent"

$yaml_string = nil #"---
#links: {home:  http://localhost:3000 }
#actions:
#  create:
#    author: 
#      display name: Twain, Mark
#      fields: 
#        text: 
#          step: 'When I fill in the below fields with the indicated values:'
#          data: { first_name: Mark, family_name:  Twain, date_of_birth: '1835-11-30', date_of_death: '1910-04-21' } 
#...
#"

if ARGV.empty? or ($yaml_string.nil? and ARGV.length != 4) or (!$yaml_string.nil? and ARGV.length != 3)
  puts "Usage:  ruby #{$0} <entity being tested> <action(create|update|delete)> [<erb template name> <yaml file name>]"
  exit(1)
end

def fetch_yaml_data()
  yaml_data = ''
  if !$yaml_string.nil?
    yaml_data = YAML.load($yaml_string, permitted_classes:  [Date, Time], aliases: true)
  else
    yaml_data = YAML.load_file($yaml_file, permitted_classes:  [Date, Time], aliases: true)
  end
  yaml_data
end

################################################################################################
####################                    MAIN                       #############################
################################################################################################ 

support_files_dir = File.expand_path( './features/support' )
entity_type = ARGV[0]
action = ARGV[1]
erb_template = "#{support_files_dir}/#{ARGV[2]}"
$yaml_file = "#{support_files_dir}/yaml/#{ARGV[3]}" if !ARGV[3].nil?
yaml_data = fetch_yaml_data()

if entity_type == 'author' 
  $builder = AuthorTestAgent.new action, erb_template, yaml_data
elsif entity_type == 'genre'
  $builder = GenreTestAgent.new action, erb_template, yaml_data
elsif entity_type == 'book'
  $builder = BookTestAgent.new action, erb_template, yaml_data
elsif entity_type == 'book instance'
  $builder = BookInstanceTestAgent.new action, erb_template, yaml_data
end

$builder.entities.each_index do |index|
  $builder.init_entity_data $builder.entities[index]
  feature_file_path = "./features/library_#{$builder.sanitized_entity_type}#{index}_#{$builder.action}.feature"
  $builder.build_feature_file feature_file_path
end

$builder.run_test

