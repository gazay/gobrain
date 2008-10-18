class ApplicationController < ActionController::Base
  helper :all 
  protect_from_forgery
  
  def help
    Helper.instance
  end

  class Helper
    include Singleton
    include ActionView::Helpers::JavaScriptHelper
  end
end
