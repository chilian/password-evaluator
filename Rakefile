require 'rake'
require 'coffee-script'
require 'uglifier'


namespace :js do
  desc "Generate the JavaScript-file from CoffeeScript from ./src to ./"
  task :compile do
    source = "#{File.dirname(__FILE__)}/src/"
    javascripts = "#{File.dirname(__FILE__)}/"

    Dir.foreach(source) do |cf|
      if not cf == '.' and not cf == '..' 
        js = CoffeeScript.compile File.read("#{source}#{cf}") 
        open "#{javascripts}#{cf.gsub('.coffee', '')}", 'w' do |f|
          f.puts js
        end
        open "#{javascripts}#{cf.gsub('.js', '.min').gsub('.coffee', '.js')}", 'w' do |f|
          f.puts Uglifier.new.compile(js)
        end   
      end 
    end
  end
end
