import React, { useEffect, useState } from 'react'

const RenderVoiceMessage = ({file, user, currentUser, onLoad}) => {
  const [voiceUrl, setVoiceUrl] = useState('')
  useEffect(() => {
    if(file) {
        const arrayBuffer = new Uint8Array(file).buffer;
        const blob = new Blob([arrayBuffer], { type: 'audio/webm' });
        setVoiceUrl(URL.createObjectURL(blob))
    }
  }, [file])
 
     return (
      <div style={{display: 'flex', alignItems:'center', gap:'5px'}} className={`${user=== currentUser ? 'your-message' : 'message'}`}>
        {user === currentUser ? 'You': user}:
        { voiceUrl && <audio style={{maxWidth: '200px'}} src={voiceUrl} controls onLoadedData={onLoad}/> }
      </div>
     )
}

export default RenderVoiceMessage