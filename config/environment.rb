RAILS_GEM_VERSION = '2.1.1' unless defined? RAILS_GEM_VERSION

require File.join(File.dirname(__FILE__), 'boot')

Rails::Initializer.run do |config|
  config.gem 'factory_girl'
  config.gem 'juggernaut'
  config.gem 'faker'

  config.time_zone = 'UTC'

  config.action_controller.session = {
    :session_key => '_gobrain_session',
    :secret      => 'c526196eaee46f548ae7af8146f371925ddf5067ef1086edb0aac395ad1499b1df4ea59d93473e277c34a231579d373c8afdb3c1ea33be316fa2cf859e9b54d7'
  }
end
