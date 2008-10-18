require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe Room do
  
  describe "(instance methods)" do
    before(:each) do
      @room = Factory(:room)
    end
    
    it "should return a permalink when converted to a param" do
      @room.to_param.should == @room.permalink
    end
  end
  
  describe "should be valid" do
    it "with valid attributes" do
      Factory.build(:room).should be_valid
    end
  end

  describe "should be invalid" do
    it "without permalink" do
      Factory.build(:room, :without => :permalink).should_not be_valid
    end

    it "with blank permalink" do
      Factory.build(:room, :permalink => '').should_not be_valid
    end
    
    it "if there is a room with the same permalink" do
      @room = Factory(:room)
      Factory.build(:room, :permalink => @room.permalink).should_not be_valid
    end
  end
end
