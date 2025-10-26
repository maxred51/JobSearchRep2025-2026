import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "../pages/public/Home";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import AccountSettings from "../pages/private/AccountSettings";
import CandidateDashboard from "../pages/candidate/CandidateDashboard";
import CandidateApplications from "../pages/candidate/CandidateApplications";
import ObservedOffers from "../pages/candidate/ObservedOffers";
import CommunicationHistory from "../pages/candidate/CommunicationHistory";
import MyCV from "../pages/candidate/myCV";
import MyOpinions from "../pages/candidate/myOpinions";
import EmployeeDashboard from "../pages/employer/EmployeeDashboard";
import AddOffer from "../pages/employer/AddOffer";
import EditOffer from "../pages/employer/EditOffer";
import CandidatesPage from "../pages/employer/CandidatesPage";
import ApplicationDetails from "../pages/employer/ApplicationDetails";
import Categories from "../pages/employer/Categories";
import CandidateCV from "../pages/employer/CandidateCV";
import CandidateChat from "../pages/employer/CandidateChat";
import ApplicationsOverview from "../pages/employer/ApplicationsOverview";
import JobApplication from "../pages/candidate/JobApplication";
import JobOfferPreview from "../pages/candidate/JobOfferPreview";
import AdminDashboard from "../pages/admin/AdminDashboard";
import JobOffers from "../pages/admin/JobOffers";
import UserManagement from "../pages/admin/UserManagement";
import CommunicationView from "../pages/admin/CommunicationView";
import JobOfferEdit from "../pages/admin/JobOfferEdit";
import JobOfferManage from "../pages/admin/JobOfferManage";
import StatsView from "../pages/admin/StatsView";
import NotificationsView from "../pages/admin/NotificationsView";


  function AppRouter() {
    return (
      <Router>
        <Routes>
          <Route path="/register" element={<Register/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/settings" element={<AccountSettings />} />
          <Route path="/" element={<CandidateDashboard />} />
          <Route path="/offers" element={<ObservedOffers />} />
          <Route path="/applications" element={<CandidateApplications />} />
          <Route path="/cv" element={<MyCV />} />
          <Route path="/opinions" element={<MyOpinions />} />
          <Route path="/communication" element={<CommunicationHistory />} />
          <Route path="/apply/:id" element={<JobApplication />} />
          <Route path="/offerpreview/:id" element={<JobOfferPreview />} />
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/add" element={<AddOffer />} />
          <Route path="/edit/:id" element={<EditOffer />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/applicationdetails" element={<ApplicationDetails />} />
          <Route path="/applicationoverview" element={<ApplicationsOverview />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/candidatecv" element={<CandidateCV />} />
          <Route path="/candidatechat" element={<CandidateChat />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/offersadmin" element={<JobOffers />} />
          <Route path="/admin/uzytkownicy/:id" element={<UserManagement />} />
          <Route path="/communicationview" element={<CommunicationView />} />
          <Route path="/offeredit/:id" element={< JobOfferEdit/>} />
          <Route path="/offermanage/:id" element={<JobOfferManage/>} />
          <Route path="/stats" element={<StatsView/>} />
          <Route path="/notifications" element={<NotificationsView/>} />
        </Routes>
      </Router>
    );
  }

export default AppRouter;
