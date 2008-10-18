module FactoryGirlOnRails
  require 'factory_girl'

  dir = (File.exist?('spec') && File.directory?('spec')) ? 'spec' : 'test'

  # requires factories.rb if it exists
  factories = File.join(RAILS_ROOT, dir, 'factories.rb')
  require factories if File.exists?(factories)

  # requires all files in factories directory
  Dir[File.join(RAILS_ROOT, dir, 'factories', '*.rb')].each do |file|
    require file
  end
end
