import React, { useEffect, useState } from 'react';
import './App.css';
import { socket } from './socket';
import LeftSidebar from './components/LeftSidebar'
import Main from './components/Main'
import Login from './components/Login'

function App() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [usersTyping, setUsersTyping] = useState([])

  const handleLogin = () => {
    if(name === 'You' || onlineUsers?.find(user => user.username === name) || !name?.length){
      window.alert('Name is not available')
      return
    } else {
      setUsername(name)
      socket.emit('username', name)
    }
  } 

  const handleLogout = () => {
    socket.emit('logout', username)
    setUsername('')
  }

  useEffect(() => {
    
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
    socket.on('heartbeat', () => {
    });

    const disconnectTimeout = setTimeout(() => {
      console.log('Disconnected from the server');
    }, 25000); 
  
    return () => {
      clearTimeout(disconnectTimeout);
    };
  }, []);

  return (
    <div className="App">
      {
        !username?.length
        ? 
          <Login setName={setName} handleLogin={handleLogin}/>
        :   
          <>    
            <LeftSidebar 
                  handleLogout={handleLogout}
                  onlineUsers={onlineUsers} 
            />
            <Main username={username} 
                  socket={socket}
                  setMessages={setMessages}
                  messages={messages}
                  usersTyping={usersTyping}
                  setUsersTyping={setUsersTyping}
            />
          </>
      }
    </div>
  );
}

export default App;
