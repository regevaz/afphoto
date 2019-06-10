import React from 'react'
import upload from './upload.png'

export default props => 
  <div className='buttons fadein'>
    <div className='button'>
      <label htmlFor='multi'>
        <img src={upload} className='upload-image' />
      </label>
      <input type='file' id='multi' onChange={props.onChange} multiple />
    </div>
  </div>
