import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'

export default props => 
  props.images.map((image, i) =>
    <div key={i} className='fadein'>
        <div>התמונה עלתה בהצלחה</div>      
      <img 
        src={image} 
        alt='' 
        onError={() => props.onError(image.public_id)}
      />
    </div>
  )
