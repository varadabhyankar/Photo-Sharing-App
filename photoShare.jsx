import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Grid, Typography, Paper } from "@mui/material";
import { HashRouter, Route, Routes, Navigate, useParams } from "react-router-dom";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import Login from "./components/LoginRegister";

function UserDetailRoute() {
  const {userId} = useParams();
  console.log("UserDetailRoute: userId is:", userId);
  return <UserDetail userId={userId} />;
}

function UserPhotosRoute() {
  const {userId} = useParams();
  return <UserPhotos userId={userId} />;
}

function MainLayout() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TopBar />
      </Grid>
      <div className="main-topbar-buffer" />
      <Grid item sm={3}>
        <Paper className="main-grid-item">
          <UserList />
        </Paper>
      </Grid>
      <Grid item sm={9}>
        <Paper className="main-grid-item">
          <Routes>
            <Route path="/" element={<Typography variant="body1">Landing Page</Typography>} />
            <Route path="/users/:userId" element={<UserDetailRoute />} />
            <Route path="/photos/:userId" element={<UserPhotosRoute />} />
            <Route path="/users" element={<UserList />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Paper>
      </Grid>
    </Grid>
  );
}

function PhotoShare() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check session status on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/check-session", { credentials: "include" });
        setIsAuthenticated(response.ok);
      } catch (error) {
        console.error("Error checking session:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={isAuthenticated ? (<MainLayout />) : (<Navigate to="/login" replace />)}/>
      </Routes>
    </HashRouter>
  );
}


const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(<PhotoShare />);
