import 'App.css';
import './styles/fieldset.css'
import 'styles/colors.css'
import 'styles/section.css'
import 'styles/button.css'
import 'styles/legend.css'
import { Route } from 'react-router-dom'
import MainMenu from 'components/menu/main/MainMenu'
import Home from 'Pages/Home/Home'
import Join from 'Pages/Join/Join'
import Login from 'Pages/Login/Login'
import Register from 'Pages/Register/Register'
import TabMenu from 'components/menu/side/TabMenu'
import Forgot from 'Pages/Forgot/Forgot'
import Reset from 'Pages/Reset/Reset';
import Location from 'Pages/Location/Location'
import Profile from 'Pages/Profile/Profile'
import Notifications from 'components/notification/Notifications'
import { NotificationProvider } from 'components/notification/useNotificationState'
import { UserProvider } from 'utils/useUser'
import { ProtectedRoute } from 'router/ProtectedRoute'
import { CustomRoutes } from 'router/CustomRoutes';
import NotFound from 'Pages/Home/NotFound/NotFound';
import { Manager } from 'Pages/Manager/Manager';
import { FinanceManager } from 'Pages/Finances/FinancesManager';
import { Permissions } from 'Pages/Permissions/Permissions';
import { Practices } from 'Pages/Practices/Practices';
import { Team } from 'Pages/Team/Team';
import { PageSettings } from 'Pages/PageSettings/PageSettings';


function App() {

  return (
    <div className="App">
        <NotificationProvider>
          <UserProvider>
            <CustomRoutes>
              <Route path="/" element={ <Home/> } />
              <Route path="/join" element={ <Join/> } />
              <Route path="/login" element={ <Login/> } />
              <Route path="/signup" element={ <Register/> } />
              <Route path="/forgot" element={ <Forgot/> } />
              <Route path="/reset" element={ <Reset/> } />
              <Route path="/locations" element={ <Location/> } />
              <Route path="/team/:teamName" element={ <Team/> } />
              <Route path="/profile" element={ 
                <ProtectedRoute role="user">
                  <Profile/>
                </ProtectedRoute>
              } />
              <Route path="/practice" element={ 
                <ProtectedRoute role="user">
                  <Practices/>
                </ProtectedRoute>
              } />
              <Route path="/moderator" element={ 
                <ProtectedRoute role="moderator">
                  <Manager/>
                </ProtectedRoute>
              } />
              <Route path="/finances" element={ 
                <ProtectedRoute role="moderator">
                  <FinanceManager/>
                </ProtectedRoute>
              } />
              <Route path="/permissions" element={ 
                <ProtectedRoute role="admin">
                  <Permissions/>
                </ProtectedRoute>
              } />
              <Route path="/pageSettings" element={ <PageSettings/> } />
              <Route path="*" element={ <NotFound/> } />
            </CustomRoutes>
            <Notifications/>
            <TabMenu/>
            <MainMenu/>
          </UserProvider>
        </NotificationProvider>
    </div>
  );
}

export default App;
