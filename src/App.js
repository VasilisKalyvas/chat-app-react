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
  const [isTyping, setIsTyping] = useState(false);
  const [usersTyping, setUsersTyping] = useState([])

  let typingTimeout;

  const handleSendMessage = () => {
    if(!message?.length) return
    clearTimeout(typingTimeout);
    socket.emit('send-message', {message, user: username})
    setMessage('')
  } 

  
  useEffect(() => {
    
    const handleTyping = () => {
      setIsTyping(true);
      socket.emit('typing', { isTyping: true, username, socketId: socket.id });

      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        setIsTyping(false);
        socket.emit('typing', { isTyping: false, username, socketId: socket.id });
      }, 3000);
    };

    const inputElement = document.getElementById('message-input');
    if (inputElement) {
      inputElement.addEventListener('input', handleTyping);
      inputElement.addEventListener('blur', () => {
        clearTimeout(typingTimeout);
        setIsTyping(false);
        socket.emit('typing', { isTyping: false, username, socketId: socket.id });
      });
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener('input', handleTyping);
        inputElement.removeEventListener('blur', () => {
          clearTimeout(typingTimeout);
          setIsTyping(false);
          socket.emit('typing', { isTyping: false, username, socketId: socket.id });
        });
      }
    };
  }, [username, message]);

  const scrollDown = () => {
    if( messagesContainerRef?.current){
      messagesContainerRef?.current?.scrollIntoView({behavior: 'smooth'});
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleLogin = () => {
    if(name === 'You' || onlineUsers?.find(user => user.username === name) || !name?.length){
      window.alert('Name is not available')
      return
    } else {
      setUsername(name)
    }
  } 

  const handleInputKeyPressSubmit = (e) => {
    if (e.key === 'Enter') {
      handleLogin(name)
    }
  };

  const handleLogout = () => {
    socket.emit('logout', username)
    setUsername('')
  }

  useEffect(() => {
    if(username){
      socket.emit('username', username)
      messagesContainerRef?.current?.scrollIntoView({behavior: 'smooth'});
    }
  }, [ username])

  useEffect(() =>{
    socket.on('online', (onlineUsers) => {
      setOnlineUsers(onlineUsers)
    })

    socket.on('messages', (messages) => {
      setMessages(messages)
    })

    socket.on('typing', ({ isTyping, typingUsers }) => {
      const updatedTypingUsers = typingUsers?.filter(user => user.socketId !== socket.id);
      setUsersTyping(updatedTypingUsers);
    });

  }, [])

  useEffect(() => {
    scrollDown();
  }, [messages, isTyping])
  
  useEffect(() => {
    socket.on('heartbeat', () => {
    });
  
    // Set a timeout to detect disconnections
    const disconnectTimeout = setTimeout(() => {
      console.log('Disconnected from the server');
      // Handle the disconnection (e.g., update UI)
    }, 25000); // Disconnect if no heartbeat received for 15 seconds
  
    return () => {
      clearTimeout(disconnectTimeout);
    };
  }, []);

  return (
    <div className="App">

      {
        username?.length 
        ?
         <div>Welcome <span>{username}</span><span className='logout' onClick={handleLogout}>Logout</span></div> 
        :
          <>
            <span>Username: </span>
            <input onKeyPress={handleInputKeyPressSubmit} onChange={(e) => setName(e.target.value)}/>
            <button onClick={handleLogin}>Sumbit</button>
          </>
      }
    
      {
        onlineUsers?.length
        ?
          <>
           <div style={{marginTop: '5px'}} >Online Users: {onlineUsers?.length}</div>
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
            <div style={{marginTop: '0.4rem'}}>
                Messages:
                <div>
                  <div className='message-container'>
                    {
                      messages?.map((item, index) => (
                        <ul key={index}>
                          {
                            item.socketId === socket.id && item?.isAdmin
                            ? null
                            :
                            <li className={`${item?.user === 'Admin' ? 'admin-message' : ''}`}>
                              {item.user === username ? 'You': item.user}: {item.message}
                            </li>
                          }
                        </ul>
                      ))
                    }
                    <div ref={messagesContainerRef}/>
                  </div>
                 <div className='typing-container'>
                    {
                      usersTyping?.length
                      ?
                        <div>{`${usersTyping[0].username} is typing ${usersTyping?.length > 1 ? `+ ${usersTyping?.length - 1}` : ''}...`}</div>
                      : null
                    }
                 </div>
                 
                </div>
            </div>
            <div style={{marginTop: '0.5rem'}}>
                <input id='message-input' value={message}  onKeyPress={handleInputKeyPress} onChange={(e) => setMessage(e.target.value)}/>
                <button onClick={handleSendMessage}>Send</button>
            </div>
          </>
        :
         null
      }
    </div>
  );
}

export default App;
