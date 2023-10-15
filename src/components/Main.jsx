import React, { useEffect, useRef, useState } from 'react'
import RenderFileMessage from './RenderFileMessage';
import { BiSend } from 'react-icons/bi'
import { BsEmojiSmile } from 'react-icons/bs'
import { AiFillPicture } from 'react-icons/ai'
import EmojiPicker from 'emoji-picker-react';
import './main.css'

const Main = ({username, socket, messages, usersTyping,}) => {
  const [message, setMessage] = useState({content:'', type:''})
  const [isPickerVisible, setPickerVisible] = useState(false);

  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null); 
  const emojiPickerRef = useRef(null);

  const handleEmojiClick = (emoji) => {

    message.content = message.content + (emoji.isCustom ? emoji.unified : emoji.emoji);
        setMessage(message);
  };

  const handeOnPictureClick = () => {
    document.getElementById('file_upload_id').click();
  }

  const selectFile = (e) => {
    socket.emit('send-message', { 
      message: {content: e.target.files[0], type: e.target.files[0].type, user: username}, user: username
    })
  }
  
  const handleSendMessage = () => {
    if(!message?.content?.length) return

    clearTimeout(typingTimeoutRef.current);
    socket.emit('send-message', {message, user: username})
    setMessage({content:'', type:''})
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
  }, [messages])

  useEffect(() => {
    const handleTyping = () => {

      if(message?.content?.length > 0){
        socket.emit('typing', { isTyping: true, username, socketId: socket.id });
      }

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { isTyping: false, username, socketId: socket.id });
      }, 3000);
    };

    const inputElement = document.getElementById('message-input');
    if (inputElement) {
      inputElement.addEventListener('input', handleTyping);
      inputElement.addEventListener('blur', () => {
        clearTimeout(typingTimeoutRef.current);
        socket.emit('typing', { isTyping: false, username, socketId: socket.id });
      });
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener('input', handleTyping);
        inputElement.removeEventListener('blur', () => {
          clearTimeout(typingTimeoutRef.current);
          socket.emit('typing', { isTyping: false, username, socketId: socket.id });
        });
      }
    };
  }, [username, message, socket]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setPickerVisible(false);
      }
    }

    if (isPickerVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPickerVisible]);

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
                      item.message.type !== 'message'
                      ? 
                      <RenderFileMessage
                        user={item.user}
                        currentUser={username} 
                        file={item.message.content}
                        type={item.message.type}
                        onLoad={scrollDown}
                      />
                      :  
                        <>
                         {
                            item.socketId === socket.id && item?.isAdmin
                            ? ''
                            : 
                              <div className={`${item?.user === 'Admin' ? 'admin-message' : item.user === username ? 'your-message' : 'message'}`}>
                                {item.user === username ? 'You': item.user}: {item.message.content}
                              </div>
                          }
                        </>
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
                   value={message.content}  
                   onKeyPress={handleInputKeyPress} 
                   onChange={(e) => setMessage({content: e.target.value, type:'message'})}
                   style={{padding: '9px'}}
            />
            <input id='file_upload_id' 
                   type='file' 
                   onChange={(e) => selectFile(e)} 
                   style={{display:'none'}}
            />

            <AiFillPicture  
              size={'24px'} 
              style={{cursor: 'pointer', color: 'black'}}
              onClick={handeOnPictureClick}
            />

            <BsEmojiSmile 
              size={'24px'} 
              style={{cursor: 'pointer', color: 'black'}}
              onClick={() => setPickerVisible(!isPickerVisible)}
            />
            
            <BiSend size={'24px'} 
                    style={{cursor: 'pointer', color: 'black'}}
                    onClick={handleSendMessage}
            />
            {isPickerVisible && (
              <div className='emoji-container'  ref={emojiPickerRef}>
                 <EmojiPicker
                  autoFocusSearch={false}
                  onEmojiClick={handleEmojiClick}
                  theme='dark'
                />
              </div>
             
            )}
          </div>
        </div>
    </div>
  )
}

export default Main