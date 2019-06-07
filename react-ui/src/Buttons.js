import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons'

export default props => 
  <div className='buttons fadein'>
    <div className='button'>
      <label htmlFor='multi'>
        <FontAwesomeIcon icon={faCloudUploadAlt} color='#6d84b4' size='10x' />
      </label>
      <input type='file' id='multi' onChange={props.onChange} multiple />
    </div>
  </div>
