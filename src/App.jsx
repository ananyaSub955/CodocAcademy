import React from 'react'

import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'
import RootLayout from './layout/RootLayout';
import Login from './pages/Login'
import Error from './components/Error.jsx';
import NotFound from './components/NotFound.jsx';
import Landing from './pages/Landing.jsx';
import SignUpPlans from './pages/SignUpPlans.jsx';
import CreateJoinGroup from './pages/CreateJoinGroup.jsx';
import IndividualSignUp from './pages/IndividualSignUp.jsx';
import CreateGroup from './pages/CreateGroup.jsx';

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<RootLayout />}>
        <Route index element={<Landing />} /> {/* Landing page as default */}
        <Route path = 'login' element={<Login />} />
        <Route path='signUpPlans' element={<SignUpPlans />}/>
        <Route path='groupSignUpChoice' element = {<CreateJoinGroup/>}/>
        <Route path='individualSignUp' element = {<IndividualSignUp/>}/>
        <Route path='createGroup' element = {<CreateGroup/>}/>
        
        {/* <Route path='logentry' element={<LogInEntry />} />
        <Route path='history' element={<StudentHistoryLayout />}>
          <Route path='date' element={<HistoryDate />} />
          <Route path='form' element={<HistoryForm />} />
        </Route>
        <Route path='jobs' element={<JobsLayout />} errorElement = {<Error/>}>
          <Route index element={<Jobs />} loader={jobsLoader} />
          <Route path=':id' element={<JobDetails />} loader = {JobDetailsLoader} />
        </Route> */}
        <Route path='*' element={<NotFound />} />
      </Route>
    )
  )

  return (
    <RouterProvider router={router} />
  )
}

export default App