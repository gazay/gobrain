require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe RoomsController do
  before(:each) do
    @room = mock_model(Room)
    @user = mock_model(User)
  end
  
  it "/permalink route" do
    Room.should_receive(:find_or_create_by_permalink).with('room777').and_return(@room)
    User.should_receive(:find_or_create_by_id).and_return(@user)
    @room.should_receive(:permalink).and_return('room777')
    @user.should_receive(:name).and_return('John')
    @user.should_receive(:id).and_return('4')
    Juggernaut.should_receive(:send_to_channel)
    
    get 'show', :id => 'room777'
    
    assigns[:room].should == @room
    assigns[:user].should == @user
    cookies[:user].should == [@user.id.to_s]
  end
end
