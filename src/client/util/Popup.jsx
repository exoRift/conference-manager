import React from 'react'

function Popup (props) {
  return (
    <div className='deletePopupOverlay' id='popup'>
      <div className='popupBox'>
        <div className='messageContainer'>
          <h1>{props.message}</h1>
        </div>

        <div className='choices'>
          <div className='choice' id='yes' onClick={props.yesChoice}>
            <h2>Yes</h2>
          </div>

          <div className='choice' id='no' onClick={props.noChoice}>
            <h2>No</h2>
          </div>
        </div>
      </div>
    </div>
  )
}

Popup.propTypes = {
  message: () => null,
  noChoice: () => null,
  yesChoice: () => null
}

export default Popup
