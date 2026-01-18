import React, { useEffect } from 'react'
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductDetails from './components/ProductDetails';
import CategoryProduct from './components/CategoryProduct';
import RegistrationPage from './components/RegistrationPage';
import ProfilePage from './components/ProfilePage';
import EditProfileForm from './components/Admin/EditProfileForm';
import NewHome from './components/NewHome';
import Axios from 'axios';
import { domain, userToken, header } from './env';
import { useGlobalState } from './state/provider'
import Login from './components/Login';
import SignUp from './components/SignUp';
import AdminDashboard from './components/Admin/AdminDashboard';
import MainLayout from "./components/MainLayout";
import AdminLayout from './components/Admin/AdminLayout';
import StudentPage from './components/Admin/StudentPage';
import StudentList from './components/Admin/StudentList';
import PublicRoute from './routes/PublicRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import UpdateStudent from './components/Admin/UpdateStudent';
import StudentAddressPage from './components/Admin/StudentAddressPage';
import UpdateStudentAddressPage from './components/Admin/UpdateStudentAddressPage';
import SettingPage from './components/Admin/Settings/SettingPage';
import DivisionList from './components/Admin/Settings/DivisionList';
import DivisionEdit from './components/Admin/Settings/DivisionEdit';
import DistrictList from './components/Admin/Settings/DistrictList';
import DistrictEdit from './components/Admin/Settings/DistrictEdit';
import UpazillaList from './components/Admin/Settings/UpazillaList';
import UpazillaEdit from './components/Admin/Settings/UpazillaEdit';
import UpdateDivisionPage from './components/Admin/Settings/UpdateDivisionPage';
import StudentEducationPage from './components/Admin/StudentEducationPage';
import StudentEducationUpdate from './components/Admin/StudentEducationUpdate';

const App = () => {
  const [{ profile }, dispatch] = useGlobalState()
  // console.log(profile, "$$$$$ Profile" )
  // console.log("User Tonen is:", userToken);
  useEffect(() => {
    if (userToken !==null){
      const getdata = async () => {
        await Axios({
          method: "get",
          url: `${domain}/api/profile/`,
          headers: header
        
        }).then(response => {
          // console.log(response.data, "$$$ user Profile Data")
          dispatch({
            type: "ADD_PROFILE",
            profile: response.data['data']
          })
        })
      }
      getdata()
    }
  }, [])
  return (
     

<BrowserRouter>
  <Routes>

    {/* ===== PUBLIC ROUTES ===== */}
    <Route element={<PublicRoute />}>
      <Route element={<MainLayout />}>
        <Route path="/" element={<NewHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignUp />} />

        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/category/:id" element={<NewHome />} />
        <Route path="/categories/:id" element={<CategoryProduct />} />
      </Route>
    </Route>

    {/* ===== PROTECTED ADMIN ROUTES ===== */}
    <Route element={<ProtectedRoute />}>
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/dashboard/settings" element={<SettingPage />} />
        <Route path="/dashboard/divisions" element={<DivisionList />} />
        <Route path="/dashboard/divisions/edit/:id" element={<DivisionEdit />} />
        <Route path="/dashboard/districts" element={<DistrictList />} />
        <Route path="/dashboard/districts/edit/:id" element={<DistrictEdit />} />
        <Route path="/dashboard/upazillas" element={<UpazillaList />} />
        <Route path="/dashboard/upazillas/edit/:id" element={<UpazillaEdit />} />
        <Route path="/dashboard/users" element={<ProfilePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/EditProfileForm" element={<EditProfileForm />} />
        <Route path="/StudentPage/:id" element={<StudentPage />} />
        <Route path="/dashboard/student_list" element={<StudentList />} />
        <Route path="/update_student/:id" element={<UpdateStudent />} />
        <Route path="/student_address/:id" element={<StudentAddressPage />} />
        <Route path="/update_student_address/:studentId" element={<UpdateStudentAddressPage />} />
        <Route path="/education/:studentId" element={<StudentEducationPage />} />
        <Route path="/update_student_education/:studentId" element={<StudentEducationUpdate />} />
  
    


      </Route>
    </Route>

    {/* 404 */}
    <Route path="*" element={<NewHome />} />

  </Routes>
</BrowserRouter>

  )
}

export default App
