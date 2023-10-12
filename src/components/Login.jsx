import React from 'react'
import './login.css'
import { FiLogIn }  from 'react-icons/fi'

const Login = ({name, setName, handleLogin}) => {

  const handleInputKeyPressSubmit = (e) => {
    if (e.key === 'Enter') {
      handleLogin(name)
    }
  };

  return (
    <div className='login-page'>
      <div className='login-container'>
        <input className='login-input' 
               placeholder='Username...'
               onKeyPress={handleInputKeyPressSubmit} 
               onChange={(e) => setName(e.target.value)}
          />
        <FiLogIn size={'30px'} style={{cursor: 'pointer', color: 'white'}} onClick={handleLogin}/>
      </div>
    </div>
  )
}

export default Login