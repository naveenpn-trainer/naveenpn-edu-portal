import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import TopicDetails from "./pages/TopicDetails";
import ProtectedLayout from "./components/ProtectedLayout";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "./pages/NotFound";

import Summary from "./pages/summary/Studentdetails"
import Admin from "./pages/admin/RegisterStudent";
import Curriculum from "./pages/Curriculum";
import Welcome from "./pages/Welcome";
import Planner from "./pages/Planner";
import Evaluation from "./pages/admin/Evaluation";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import MyNotes from "./pages/MyNotes";
import QNA from "./pages/QNA";
import Verify from "./pages/Verify";
import MyProgress from "./pages/MyProgress";

import UpdateAttendance from "../src/pages/admin/UpdateAttendance";
import Feedback from "../src/pages/admin/Feedback";
import AddModule from "./pages/admin/AddModule";
import UpdateStudentMarks from "./pages/admin/UpdateMarks";
import SharePage from "./pages/admin/SharePage";

import QuizPage from "./components/QuizPage";
import ResultPage from "./components/ResultPage";

import './styles/markdown.css';

function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Router>
        <Routes>
        {/* <Route path="/report/:orgCode" element={<Report />} /> */}
          <Route path="/summary_report/:orgCode" element={<Summary />} />
          <Route path="/app/admin_panel/:orgCode" element={<Admin />} />
          <Route path="/app/update-attendance" element={<UpdateAttendance/>}/>
          <Route path="/app/add-module" element={<AddModule/>}/>
          <Route path="/app/update-marks" element={<UpdateStudentMarks/>}/>
          <Route path="/app/share_app" element={<SharePage/>}/>
		  <Route path="/app/feedback" element={<Feedback />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/" element={<ProtectedLayout />}>
            <Route index element={<Home />} />
			
			
            <Route path="profile" element={<Profile />} />
            <Route path="planner" element={<Planner />} />
            <Route path="evaluation" element={<Evaluation />} />
            <Route path="notes" element={<MyNotes />} />
            <Route path="progress" element={<MyProgress />} />
            <Route path="qna" element={<QNA />} />
            <Route path="curriculum" element={<Curriculum />}>
              <Route index element={<Welcome />} />
              <Route
                path=":topicId/:subtopicId/:linkId?"
                element={<TopicDetails />}
              />
            </Route>
            <Route element={<ProtectedRoute />}>
              
			  <Route path="/summary" element={<Summary />} />
              <Route path="/admin" element={<Admin />} />
              
              <Route path="/update-attendance" element={<UpdateAttendance/>}/>
              <Route path="/add-module" element={<AddModule/>}/>
              <Route path="/update-marks" element={<UpdateStudentMarks/>}/>
              <Route path="/share" element={<SharePage/>}/>
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
		  <Route path="practice_mcqs/:subject/quiz/:id" element={<QuizPage />} />
		  <Route path='/result' element={<ResultPage/>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
