import React, { useEffect, useRef, useState } from 'react'
import { BiSend } from 'react-icons/bi'
import './main.css'

const Main = ({username, socket, messages, usersTyping,}) => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false);

  
  const messagesContainerRef = useRef(null);

  const typingTimeoutRef = useRef(null); 
  
  const handleSendMessage = () => {
    if(!message?.length) return
    clearTimeout(typingTimeoutRef.current);
    socket.emit('send-message', {message, user: username})
    setMessage('')
  }

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const scrollDown = () => {
    if( messagesContainerRef?.current){
      messagesContainerRef?.current?.scrollIntoView({behavior: 'smooth'});
    }
  };

  useEffect(() => {
    scrollDown();
  }, [messages, isTyping])

  useEffect(() => {

    const handleTyping = () => {
      if(message?.length > 0){
        setIsTyping(true);
        socket.emit('typing', { isTyping: true, username, socketId: socket.id });
      }

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit('typing', { isTyping: false, username, socketId: socket.id });
      }, 3000);
    };

    const inputElement = document.getElementById('message-input');
    if (inputElement) {
      inputElement.addEventListener('input', handleTyping);
      inputElement.addEventListener('blur', () => {
        clearTimeout(typingTimeoutRef.current);
        setIsTyping(false);
        socket.emit('typing', { isTyping: false, username, socketId: socket.id });
      });
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener('input', handleTyping);
        inputElement.removeEventListener('blur', () => {
          clearTimeout(typingTimeoutRef.current);
          setIsTyping(false);
          socket.emit('typing', { isTyping: false, username, socketId: socket.id });
        });
      }
    };
  }, [username, message, socket]);

  return (
    <div className='main'>
        <div className='main-header'>
            Welcome {username}
        </div>
        <div className='main-container'>
          <div className='messages-container'> 
            <div className='messages-box'>
              {
                 messages?.map((item, index) => ( 
                  <div key={index}>
                    {
                      item.socketId === socket.id && item?.isAdmin
                      ? ''
                      : 
                        <div className={`${item?.user === 'Admin' ? 'admin-message' : item.user === username ? 'your-message' : 'message'}`}>
                          {item.user === username ? 'You': item.user}: {item.message}
                        </div>
                    }
                  </div>
                 ))
              } 
               <div ref={messagesContainerRef}/>
            </div>
          </div>
          <div className='events'> 
            {
              usersTyping?.length
              ?
                <div>{`${usersTyping[0].username} is typing ${usersTyping?.length > 1 ? `+ ${usersTyping?.length - 1}` : ''}...`}</div>
              : null
            }
          </div>
          <div className='messages-input-container'>
            <input className='messages-input' 
                   placeholder='messsage...' 
                   id='message-input' 
                   value={message}  
                   onKeyPress={handleInputKeyPress} 
                   onChange={(e) => setMessage(e.target.value)}
                   style={{padding: '9px'}}
            />
            <BiSend size={'24px'} 
                    style={{cursor: 'pointer', color: 'black'}}
                    onClick={handleSendMessage}
            />
          </div>
        </div>
    </div>
  )
}

export default Main