import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { socket } from './socket';


function App() {

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [onlineUsers, setOnlineUsers] = useState([])
  const messagesContainerRef = useRef(null);

  const handleSendMessage = () => {
    if(!message?.length) return
    socket.emit('send-message', {message, user: username})
    setMessage('')
  } 

  const scrollDown = () => {
    if( messagesContainerRef?.current){
      messagesContainerRef?.current?.scrollIntoView();
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  useEffect(() => {
    if(username){
      socket.emit('username', username)
    }
  }, [socket, username])

  useEffect(() =>{
    socket.on('online', (onlineUsers) => {
      setOnlineUsers(onlineUsers)
    })

    socket.on('messages', (messages) => {
      setMessages(messages)
    })
  }, [socket])

  useEffect(() => {
    scrollDown();
  }, [messages])
  
  return (
    <div className="App">

      {
        username?.length 
        ?
         <h3>Hi {username}</h3> 
        :
          <>
            <span>Username: </span>
            <input onChange={(e) => setName(e.target.value)}/>
            <button onClick={()=> setUsername(name)}>Sumbit</button>
          </>
      }
    
      {
        onlineUsers?.length
        ?
          <>
           <div style={{marginTop: '1rem'}} >Online Users:</div>
           <div className='online'>
            {   
              onlineUsers?.map((user, index) => 
                <ul key={index}>
                  <li>
                    {
                      user.socketId === socket.id
                      ? 'You'
                      : user.username
                    }
                  </li>
                </ul>)
            }
           </div>
          </>
        : <div>There are no online users connected</div>
      }
      {
        username
        ?
          <>
            <div style={{marginTop: '1rem'}}>
                <input value={message}  onKeyPress={handleInputKeyPress} onChange={(e) => setMessage(e.target.value)}/>
                <button onClick={handleSendMessage}>Send</button>
            </div>
            <div style={{marginTop: '3rem'}}>
                Messages:
                <div className='message-container'>
                  {
                    messages?.map((item, index) => (
                      <ul key={index}>
                        <li>
                          {socket?.id === item.socketId ? 'You': item.user}: {item.message}
                        </li>
                      </ul>
                    ))
                  }
                  <div ref={messagesContainerRef}/>
                </div>
                
            </div>
          </>
        :
         null
      }
    </div>
  );
}

export default App;
