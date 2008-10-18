ActionController::Routing::Routes.draw do |map|
  map.root :controller => 'rooms'
  map.connect ':id', :controller => 'rooms', :action => 'show',    :conditions => { :method => :get }
  map.connect ':id', :controller => 'rooms', :action => 'update',  :conditions => { :method => :put }
  map.connect ':id', :controller => 'rooms', :action => 'destroy', :conditions => { :method => :delete }
  map.resources 'rooms'
end
