import React, { useEffect, useState } from 'react'
import Modal from 'react-bootstrap/Modal';

const RenderFileMessage = ({file, user, currentUser, type, onLoad}) => {
  const [imageUlr, setImageUrl] = useState('')
  const [showModal, setShowModal]= useState(false)

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  useEffect(() => {
    if(file) {
      const arrayBuffer = new Uint8Array(file).buffer;
      const blob = new Blob([arrayBuffer], { type: type });
      setImageUrl(URL.createObjectURL(blob))

    }
  }, [file, type])
 
     return (
      <div className={`image-message-row ${user=== currentUser ? 'your-message' : 'message'}`}>
        {user === currentUser ? 'You': user}:
       { imageUlr && <img className='image-message' alt='' src={imageUlr} onLoad={onLoad} onClick={handleShow}/> }

      <Modal show={showModal} onHide={handleClose} centered size='lg'>
        <Modal.Body>
          <img style={{width:'100%', height:'100%'}} alt='' src={imageUlr}/>
        </Modal.Body>
      </Modal>
      </div>
     )
}

export default RenderFileMessage