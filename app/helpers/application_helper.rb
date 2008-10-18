module ApplicationHelper
  def javascript_include_token
    "<script type='text/javascript'> window.token = '#{form_authenticity_token}' </script>" if protect_against_forgery?
  end
end
