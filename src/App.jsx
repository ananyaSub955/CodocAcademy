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
import JoinGroup from './pages/JoinGroup.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';
import SubscriptionPage from './pages/SubscriptionPage.jsx';
import Cancel from './pages/Cancel.jsx';

import UserLayout from './User/layout/UserLayout.jsx';
import UserDashboard from './User/UserDashboard.jsx';
import SpecialtyInfo from './User/SpecialtyInfo.jsx';

import GroupAdminLayout from './GroupAdmin/layout/GroupAdminLayout.jsx'
import GroupAdminDashboard from './GroupAdmin/GroupAdminDashboard.jsx';

import SuperAdminLayout from './SuperAdmin/layout/SuperAdminLayout.jsx';
import SuperAdminDashboard from './SuperAdmin/SuperAdminDashboard.jsx';
import GroupMembers from './SuperAdmin/components/GroupMembers.jsx';
import ContactUs from './pages/ContactUs.jsx';

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* Main App Layout */}
        <Route path='/' element={<RootLayout />}>
          <Route index element={<Landing />} /> {/* Landing page as default */}
          <Route path='login' element={<Login />} />
          <Route path='signUpPlans' element={<SignUpPlans />} />
          <Route path='groupSignUpChoice' element={<CreateJoinGroup />} />
          <Route path='individualSignUp' element={<IndividualSignUp />} />
          <Route path='createGroup' element={<CreateGroup />} />
          <Route path='joinGroup' element={<JoinGroup />} />
          <Route path='success' element={<PaymentSuccess />} />
          <Route path='subscription' element={<SubscriptionPage />} />
          <Route path='cancel' element={<Cancel />} />
          <Route path ='contact' element={<ContactUs/>} />
          
          < Route path='*' element={<NotFound />} />
        </Route>

        {/* User Layout */}
        <Route path='user' element={<UserLayout />}>
          <Route path='dashboard' element={<UserDashboard />} />
          {/* <Route path='profile' element={<UserProfile />} /> */}
          <Route path ='contact' element={<ContactUs/>} />
          <Route path=":specialty/info" element={<SpecialtyInfo />} />

        </Route>
          < Route path='*' element={<NotFound />} />

        {/* Group Admin Layout */}
        <Route path='group' element={<GroupAdminLayout />} >
          <Route path='dashboard' element={<GroupAdminDashboard />} />
          <Route path ='contact' element={<ContactUs/>} />

          < Route path='*' element={<NotFound />} />
        </Route>


        {/* Super Admin Layout */}
        <Route path='superAdmin' element={<SuperAdminLayout />} >
          <Route path='dashboard' element={<SuperAdminDashboard />} />
          <Route path ='contact' element={<ContactUs/>} />

          <Route path="group/:groupId" element={<GroupMembers />} />
          < Route path='*' element={<NotFound />} />
        </Route>
      </>

    )
  )

  return (
    <RouterProvider router={router} />
  )
}

export default App