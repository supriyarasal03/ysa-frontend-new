import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

// Dashboards
import AdminDashboar from "./Pages/dashboard/AdminDashboar";


import ParentDashboard from "./Pages/dashboard/ParentDashboard";

// Public
import HomePage from "./Pages/public/HomePage";

import AllSports from "./Pages/public/AllSports";

import PlayerEnquiry from "./Pages/public/PlayerEnquiry";


// Auth
import Login from "./Pages/auth/Login";
import ForgotPassword from "./Pages/auth/ForgotPassword";
import VerifyOtp from "./Pages/auth/VerifyOtp";
import ResetPassword from "./Pages/auth/ResetPassword";

// Layouts
import AdminLayout from "./components/layout/AdminLayout";
import ReceptionistLayout from "./components/layout/ReceptionistLayout";

// Staff
import StaffManagement from "./Pages/staff/StaffManagement";
import StaffForm from "./Pages/staff/StaffForm";

// Sport
import SportManagmnet from "./sport/SportManagmnet";
import SportForm from "./sport/SportForm";

// Coach
import CoachManagement from "./Pages/coach/CoachManagement";
import CoachForm from "./Pages/coach/CoachForm";

// Batch
import BatchManagment from "./Pages/batch/BatchManagment";
import BatchForm from "./Pages/batch/BatchForm";

// Other dashboards
import InnventoryManagerDashboard from "./Pages/dashboard/InnventoryManagerDashboard";
import CleaningStaffDashboard from "./Pages/dashboard/CleaningStaffDashboard";
import ReceptionistDashboard from "./Pages/dashboard/ReceptionistDashboard";

// Player
import PlayerManagement from "./Pages/player/PlayerManagement";
import PlayerForm from "./Pages/player/PlayerForm";



// Fees

import FeeDetails from "./Pages/fees/FeeDetails";

// Payment
import PaymentManagement from "./Pages/payment/PaymentManagement";
import PaymentForm from "./Pages/payment/PaymentForm";


import InventoryManagerLayout from "./components/layout/InvetoryManagerLayout";
import InventoryManagement from "./Pages/inventory/InventoryManagement";
import AddInventory from "./Pages/inventory/AddInventory";

import ReceiveStock from "./Pages/inventory/ReceiveStock";
import InventoryTransactionHistory from "./Pages/inventory/InventoryTransactionHistory";
import CoachLayout from "./components/layout/CoachLayout";

import ReceptionistAttendanceManagmnet from "./Pages/receptionist/ReceptionistAttendanceManagmnet";


import StudentsAttendance from "./Pages/studentAttendance/StudentsAttendance";
import PlayerAttendanceHistory from "./Pages/studentAttendance/PlayerAttendanceHistory";
import StaffAttendance from "./Pages/admin/StaffAttendance";
import LeaveRequest from "./Pages/leaveRequest/LeaveRequest";
import LeaveRequests from "./Pages/admin/LeaveRequests";
import HistoryBatches from "./Pages/coach/HistoryBatches";
import PlayerInventoryPurchase from "./Pages/innventoty-manager/PlayerInventoryPurchase";
import ParentLayout from "./components/layout/ParentLayout";
import ParentManagement from "./Pages/parent/ParentManagement";
import PlayerLayout from "./components/layout/PlayerLayout";
import PlayerSelfAttendance from "./Pages/player-dashboard/playerSelfAttendance";
import LandingPageSportsForm from "./Pages/adminLandingP.Managment/LandingPageSportsForm";
import LandingPageSports from "./Pages/adminLandingP.Managment/LandingPageSports";
import PlayerEnquiries from "./Pages/receptionist/PlayerEnquiries";
import LandingPageGallery from "./Pages/adminLandingP.Managment/LandingPageGallery";
import ContactEnquiries from "./Pages/receptionist/ContactEnquiries";
import ReceptionistChangeBatch from "./Pages/receptionist/ReceptionistChangeBatch";
import PerformanceCards
  from "./Pages/performanceCard/PerformanceCards";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />

        <Route path="/sports" element={<AllSports />} />
        
        
        
  <Route path="/player-enquiry" element={<PlayerEnquiry />} />;
     

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* OTHER DASHBOARDS */}
       
       
        <Route path="/parent-dashboard" element={<ParentDashboard />} />

        {/* ADMIN */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboar />} />

          <Route path="/admin/staff-attendance" element={<StaffAttendance />} />

          <Route path="/admin/manage-gallery" element={<LandingPageGallery/>}/>

         

          <Route path="/admin/leave-requests" element={<LeaveRequests />} />



          <Route path="/admin/staff-management" element={<StaffManagement />} />
          <Route path="/staff-form" element={<StaffForm />} />
          <Route path="/staff-form/:id" element={<StaffForm />} />
          <Route path="/admin/receptionist-attendance" element={<ReceptionistAttendanceManagmnet />} />

          <Route path="/admin/sport-management" element={<SportManagmnet />} />
          <Route path="/sport-form" element={<SportForm />} />
          <Route path="/sport-form/:id" element={<SportForm />} />

          <Route path="/admin/coach-managmnet" element={<CoachManagement />} />
          <Route path="/coach-form" element={<CoachForm />} />
          <Route path="/coach-form/:id" element={<CoachForm />} />



          <Route path="/admin/batch-managmnet" element={<BatchManagment />} />
          <Route path="/batch-form" element={<BatchForm />} />
          <Route path="/batch-form/:id" element={<BatchForm />} />


           
           <Route path="/admin/add-sports" element={<LandingPageSportsForm/>} />
           <Route path="/admin/landingPage-Sports" element={<LandingPageSports/>} />


        </Route>

        {/* OTHER STAFF DASHBOARDS */}

        <Route path="/cleaningStaff" element={<CleaningStaffDashboard />} />







        {/* InventoryManager  */}


        {/* Inventory Manager */}

        <Route element={<InventoryManagerLayout />}>


        <Route path="innventory/player-inventoty-purcahse" element={<PlayerInventoryPurchase/>} />


         <Route path="/inventoty/leave" element={<LeaveRequest />} />

          <Route
            path="/innventory-manager"
            element={<InnventoryManagerDashboard />}
          />



          <Route
            path="/inventory"
            element={<InventoryManagement />}
          />

          <Route
            path="/inventory/add"
            element={<AddInventory />}
          />

          <Route
            path="/inventory/receive-stock"
            element={<ReceiveStock />}
          />


          <Route path="/innventory/history" element={<InventoryTransactionHistory />} />

        </Route>


           

           {/* Parent Dashboard */}

           <Route element={<ParentLayout/>}>
           <Route path="/parent"  element={<ParentDashboard/>} />
           <Route path="/parent/students" element={<ParentManagement/>} />
           
           
           </Route>










        {/* RECEPTIONIST */}
        <Route element={<ReceptionistLayout />}>
          <Route path="/receptionist" element={<ReceptionistDashboard />} />
          <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />

          <Route path="/receptionist/leave" element={<LeaveRequest />} />

          <Route path="/receptionist/player-enquiries" element={<PlayerEnquiries/>} />


          <Route path="/receptionist/batch-change" element={<ReceptionistChangeBatch/>} />


           <Route path="/receptionist/ContactEnquiries" element={<ContactEnquiries/>}  /> 



          {/* Players */}
          <Route path="/receptionist/players" element={<PlayerManagement />} />
          <Route path="/receptionist/player-form" element={<PlayerForm />} />
          <Route path="/receptionist/player-form/:id" element={<PlayerForm />} />

          {/* FIRST PAGE: player fee overview */}
          <Route path="/receptionist/fees" element={<FeeDetails />} />

          {/* PAYMENT HISTORY: separate from fee collection */}
          <Route path="/receptionist/payment-management" element={<PaymentManagement />} />

          {/* PAYMENT COLLECTION FORM */}
          <Route path="/receptionist/payment-form" element={<PaymentForm />} />
        </Route>





<Route element={<PlayerLayout/>} >
<Route path="/player/attendance" element={<PlayerSelfAttendance/>}  />
</Route>

          



        <Route element={<CoachLayout />} >
        
          <Route path="/coach/history-batches" element={<HistoryBatches />} />
          <Route path="/coach/leave-requests" element={<LeaveRequest />} />
          <Route path="/coach/player-attendance" element={<StudentsAttendance />} />
          <Route path="/coach/Playee-attendance-history" element={<PlayerAttendanceHistory />} />

        <Route
  path="/coach/performance-card"
  element={<PerformanceCards />}
/>





        </Route>






      </Routes>
    </BrowserRouter>
  );
}

export default App;
