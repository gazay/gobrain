%w{juggernaut juggernaut_helper}.each do |file|
  require File.join File.dirname(__FILE__), 'lib', file
end

# ActionView::Helpers::AssetTagHelper::register_javascript_include_default('juggernaut')
# ActionView::Helpers::AssetTagHelper::register_javascript_include_default('swfobject')

ActionView::Base.send(:include, Juggernaut::JuggernautHelper)

ActionController::Base.class_eval do
  alias_method :render_without_juggernaut, :render
  include Juggernaut::RenderExtension
  alias_method :render, :render_with_juggernaut
end

ActionView::Base.class_eval do
  alias_method :render_without_juggernaut, :render
  include Juggernaut::RenderExtension
  alias_method :render, :render_with_juggernaut
end