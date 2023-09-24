import React ,{Suspense} from 'react';
import './App.css';
import { BrowserRouter as Router ,Route,Switch,Redirect} from 'react-router-dom/cjs/react-router-dom.min';
// import User from './users/pages/User';
// import NewPlace from './places/components/pages/NewPlace';
import MainNavigation from './shared/components/Navigation/MainNavigation';

// import UserPlace from './places/components/pages/UserPlace';

// import UpdatePlace from './places/components/pages/UpdatePlace';
// import Auth from './users/pages/Auth';

import { AuthContext } from './shared/context/auth-context';
import { useState,useEffect } from 'react';
import { useCallback } from 'react';

import LoadingSpinner from './shared/components/UIElements/LoadingSpinner';

import { useAuth } from './shared/hooks/auth-hook';

const User=React.lazy(()=>import('./users/pages/User'))
const NewPlace=React.lazy(()=>import('./places/components/pages/NewPlace'))


const UpdatePlace=React.lazy(()=>import('./places/components/pages/UpdatePlace'))

const Auth=React.lazy(()=>import('./users/pages/Auth'))

const UserPlace=React.lazy(()=>import('./places/components/pages/UserPlace'))








function App() {
  const {token,login,logout,userId}=useAuth()
  
  let routes;

  if (token) {
    routes = (
      <Switch>
        <Route path="/" exact>
          <User/>
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlace/>
        </Route>
        <Route path="/places/new" exact>
          <NewPlace />
        </Route>
        <Route path="/places/:placeId">
          <UpdatePlace/>
        </Route>
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          <User/>
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlace />
        </Route>
        <Route path="/auth">
          <Auth />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token:token,
        userId: userId,
        login: login,
        logout: logout
      }}
    >
      <Router>
        <MainNavigation />
        <main>
        <Suspense fallback={
          <div className='center'>
            <LoadingSpinner/>

          </div>
        }>
        {routes}
        </Suspense>
        </main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
