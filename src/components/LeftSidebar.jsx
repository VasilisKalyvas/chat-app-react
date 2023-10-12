import React from 'react'
import { FaPowerOff } from 'react-icons/fa'
import './left-sidebar.css'

const LeftSidebar = ({onlineUsers, handleLogout}) => {

  return (
    <div className='left-sidebar'>
      <div className='left-sidebar-logout'>
        <FaPowerOff size={'40px'} onClick={handleLogout}/>
      </div>
      <div className='left-sidebar-online-users'>
        <div className='left-sidebar-online-count-dot'></div>
        <div className='left-sidebar-online-count'>{onlineUsers?.length}</div>
      </div>
        <div className='left-sidebar-online'>
          {
            onlineUsers?.map((user, index) =>(
              <div key={index} className='online-user'>
                {
                  user?.username[0].toUpperCase()
                }
              </div>
            ))
          }
        </div>
    </div>
  )
}

export default LeftSidebar