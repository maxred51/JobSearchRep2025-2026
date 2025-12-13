import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import PrivateRoute from "../components/PrivateRoute";

import Home from "../pages/public/Home";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import ForgotPassword from "../pages/public/ForgotPassword";

// candidate
import CandidateDashboard from "../pages/candidate/CandidateDashboard";
import CandidateApplications from "../pages/candidate/CandidateApplications";
import ObservedOffers from "../pages/candidate/ObservedOffers";
import CommunicationHistory from "../pages/candidate/CommunicationHistory";
import MyCV from "../pages/candidate/myCV";
import MyOpinions from "../pages/candidate/myOpinions";
import JobApplication from "../pages/candidate/JobApplication";
import JobOfferPreview from "../pages/candidate/JobOfferPreview";

// employer
import EmployeeDashboard from "../pages/employer/EmployeeDashboard";
import AddOffer from "../pages/employer/AddOffer";
import EditOffer from "../pages/employer/EditOffer";
import CandidatesPage from "../pages/employer/CandidatesPage";
import ApplicationDetails from "../pages/employer/ApplicationDetails";
import Categories from "../pages/employer/Categories";
import CandidateCV from "../pages/employer/CandidateCV";
import CandidateChat from "../pages/employer/CandidateChat";
import ApplicationsOverview from "../pages/employer/ApplicationsOverview";

// admin
import AdminDashboard from "../pages/admin/AdminDashboard";
import JobOffers from "../pages/admin/JobOffers";
import UserManagement from "../pages/admin/UserManagement";
import CommunicationView from "../pages/admin/CommunicationView";
import JobOfferEdit from "../pages/admin/JobOfferEdit";
import JobOfferManage from "../pages/admin/JobOfferManage";
import StatsView from "../pages/admin/StatsView";
import NotificationsView from "../pages/admin/NotificationsView";

import AccountSettings from "../pages/private/AccountSettings";


function AppRouter() {
  return (
    <Router>
      <Routes>

        {/* PUBLIC */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* KANDYDAT */}
        <Route
          path="/"
          element={<PrivateRoute element={CandidateDashboard} roles={["kandydat"]} />}
        />

        <Route
          path="/offers"
          element={<PrivateRoute element={ObservedOffers} roles={["kandydat"]} />}
        />

        <Route
          path="/applications"
          element={<PrivateRoute element={CandidateApplications} roles={["kandydat"]} />}
        />

        <Route
          path="/cv"
          element={<PrivateRoute element={MyCV} roles={["kandydat"]} />}
        />

        <Route
          path="/opinions"
          element={<PrivateRoute element={MyOpinions} roles={["kandydat"]} />}
        />

        <Route
          path="/communication"
          element={<PrivateRoute element={CommunicationHistory} roles={["kandydat"]} />}
        />

        <Route
          path="/apply/:id"
          element={<PrivateRoute element={JobApplication} roles={["kandydat"]} />}
        />

        <Route
          path="/offerpreview/:id"
          element={<PrivateRoute element={JobOfferPreview} roles={["kandydat"]} />}
        />

        {/* PRACOWNIK HR */}
        <Route
          path="/employee"
          element={<PrivateRoute element={EmployeeDashboard} roles={["pracownikHR"]} />}
        />

        <Route
          path="/add"
          element={<PrivateRoute element={AddOffer} roles={["pracownikHR"]} />}
        />

        <Route
          path="/edit/:id"
          element={<PrivateRoute element={EditOffer} roles={["pracownikHR"]} />}
        />

        <Route
          path="/candidates"
          element={<PrivateRoute element={CandidatesPage} roles={["pracownikHR"]} />}
        />

        <Route
          path="/applicationdetails/:Kandydatid/:Ofertaid"
          element={<PrivateRoute element={ApplicationDetails} roles={["pracownikHR"]} />}
        />

        <Route
          path="/applicationoverview"
          element={<PrivateRoute element={ApplicationsOverview} roles={["pracownikHR"]} />}
        />

        <Route
          path="/categories"
          element={<PrivateRoute element={Categories} roles={["pracownikHR"]} />}
        />

        <Route
          path="/candidatecv/:id"
          element={<PrivateRoute element={CandidateCV} roles={["pracownikHR"]} />}
        />

        <Route
          path="/candidatechat/:candidateId"
          element={<PrivateRoute element={CandidateChat} roles={["pracownikHR"]} />}
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={<PrivateRoute element={AdminDashboard} roles={["administrator"]} />}
        />

        <Route
          path="/offersadmin"
          element={<PrivateRoute element={JobOffers} roles={["administrator"]} />}
        />

        <Route
          path="/admin/uzytkownicy/:id"
          element={<PrivateRoute element={UserManagement} roles={["administrator"]} />}
        />

        <Route
          path="/communicationview/:role/:userId"
          element={<PrivateRoute element={CommunicationView} roles={["administrator"]} />}
        />

        <Route
          path="/offeredit/:id"
          element={<PrivateRoute element={JobOfferEdit} roles={["administrator"]} />}
        />

        <Route
          path="/offermanage/:id"
          element={<PrivateRoute element={JobOfferManage} roles={["administrator"]} />}
        />

        <Route
          path="/stats"
          element={<PrivateRoute element={StatsView} roles={["administrator"]} />}
        />

        <Route
          path="/notifications"
          element={<PrivateRoute element={NotificationsView} roles={["administrator"]} />}
        />

        <Route
          path="/settings"
          element={<PrivateRoute element={AccountSettings} roles={["kandydat","pracownikHR","administrator"]} />}
        />

      </Routes>
    </Router>
  );
}

export default AppRouter;
