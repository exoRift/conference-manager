import React from 'react'

import {
  getConfStatus
} from './'

function ConferenceCard ({ conference, showDesc }) {
  const startDate = new Date(conference.starttime)

  return (
    <div className='conferenceCard' id={getConfStatus(conference)} key={conference.id}>
      <div className='head'>
        <h3 className='title'>{conference.title}</h3>
      </div>

      <div className='body'>
        <div className='roomNumberContainer'>
          <h5>Conference Room: </h5>
          <h5 className='roomNumber'>{conference.room}</h5>
        </div>

        <div className='chronals'>
          <h6 className='time'>{startDate.toLocaleTimeString('en-US', { timeStyle: 'short' })}
            - {new Date(conference.endtime).toLocaleTimeString('en-US', { timeStyle: 'short' })}</h6>
          <h6 className='date'>{startDate.toDateString().slice(0, -(String(startDate.getFullYear()).length + 1))}</h6>
        </div>

        <div id='divider'/>

        {showDesc ? (
          <h4 className='description'>{conference.desc}</h4>
        ) : undefined}

        <h6>Attendees:</h6>

        <div className='attendeesContainer'>
          {conference.attendees.reduce((ac, a, i) => ac.concat([(
            <div className='attendee' key={i}>
              <h5 className='name'>{a}</h5>
              {i === conference.attendees.length - 1 ? undefined : (<h5 className='separator'>,</h5>)}
            </div>
          )]), [])}
        </div>
      </div>
    </div>
  )
}

ConferenceCard.propTypes = {
  conference: () => {},
  showDesc: () => false
}

export default ConferenceCard
