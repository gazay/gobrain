ActionController::Routing::Routes.draw do |map|
  map.root :controller => 'rooms'
  map.connect 'disconnect', :controller => 'rooms', :action => 'destroy'
  map.connect ':id', :controller => 'rooms', :action => 'show',    :conditions => { :method => :get }
  map.connect ':id', :controller => 'rooms', :action => 'update',  :conditions => { :method => :put }
  map.connect ':id', :controller => 'rooms', :action => 'create',  :conditions => { :method => :post }
  map.resources 'rooms'
end
