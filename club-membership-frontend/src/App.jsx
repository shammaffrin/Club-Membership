import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminPage from "./components/AdminPage";
import MemberRegister from "./components/MemberRegister";
import UploadPayment from "./components/UpdatePayment";
import Login from "./components/Login";
import MemberDashboard from "./components/MembershipDashboard";
import UserList from "./components/UserList";
import AdminLogin from "./components/AdminLogin";
import MembershipCard from "./pages/MemberCard";
import Footer from "./components/footer";
function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<MemberRegister />} />
            <Route path="/upload-payment" element={<UploadPayment />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/dashboard" element={<MemberDashboard />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/member" element={<MembershipCard />} />
          </Routes>
        </div>

        <Footer/>
      </div>
    </Router>
  );
}

export default App;
