import React from 'react'
import { useNavigate, useRouteError } from 'react-router-dom'

const Error = () => {
    
    const error = useRouteError()
    const navigate = useNavigate()

  return (
    <div> 
        <h3> an error occured</h3>
        <p>{error.message}</p>
        <button onClick={()=> navigate('/')}> go to homepage</button>
    </div>
  )
}

export default Error

//use rafce 