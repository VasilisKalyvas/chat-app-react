import React, { useEffect, useState } from 'react';
import './App.css';
import { socket } from './socket';


function App() {

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [onlineUsers, setOnlineUsers] = useState([])
 
  const handleSendMessage = () => {
    if(!message?.length) return
    socket.emit('send-message', {message, user: username})
    setMessage('')
  } 

  useEffect(() => {
    if(username){
      socket.emit('username', username)
    }
  }, [username])

  useEffect(() =>{
    socket.on('online', (onlineUsers) => {
      setOnlineUsers(onlineUsers)
    })

    socket.on('messages', (messages) => {
      setMessages(messages)
    })
  }, [socket])
  
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
           <div style={{marginTop: '2rem'}} >Online Users:</div>
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
          </>
        : <div>There are no online users connected</div>
      }
      {
        username
        ?
          <>
            <div style={{marginTop: '2rem'}}>
                <input value={message} onChange={(e) => setMessage(e.target.value)}/>
                <button onClick={handleSendMessage}>Send</button>
            </div>
            <div style={{marginTop: '5rem'}}>
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
