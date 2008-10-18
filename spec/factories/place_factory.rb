Factory.define :place do |place|
  place.association :user
  place.association :room
end
