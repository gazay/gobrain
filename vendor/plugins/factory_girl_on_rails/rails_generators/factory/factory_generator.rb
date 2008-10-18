class FactoryGenerator < Rails::Generator::NamedBase
  def manifest
    record do |m|
      if has_rspec?
        m.directory File.join('spec/factories', class_path)
        m.template 'factory.rb',  File.join('spec/factories', class_path, "#{file_name}_factory.rb")
      else
        m.directory File.join('test/factories', class_path)
        m.template 'factory.rb',  File.join('test/factories', class_path, "#{file_name}_factory.rb")
      end
    end
  end

  def factory_line(attribute)
    "#{file_name}.#{attribute.name} '#{attribute.default}'"
  end

  def has_rspec?
    options[:rspec] || (File.exist?('spec') && File.directory?('spec'))
  end

  protected
    def add_options!(opt)
      opt.separator ''
      opt.separator 'Options:'
      opt.on("--spec", "Place factory in the RAILS_ROOT/spec/factories directory.(Check for RAILS_ROOT/spec by default)") { |v| options[:rspec] = v }
    end

    def banner
      "Usage: #{$0} #{spec.name} FactoryName [field:type, field:type]"
    end
end
