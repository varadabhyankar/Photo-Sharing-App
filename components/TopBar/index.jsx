import React, { useState, useEffect, useRef } from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import fetchLoggedInUser from "../../lib/fetchLoggedInUser";
import axios from 'axios';

import "./styles.css";

function TopBar() {

  const [user, setUser] = useState([]);
  const [version, setVersion] = useState([]);
  const locationData = useLocation();
  const navigate = useNavigate(); 
  const page = locationData.pathname.split('/')[1];
  const userId = locationData.pathname.split('/')[2];
  const [loggedUser, setLoggedUser] = useState("Not Logged In");
  const fileSelector = useRef(null);

  useEffect(() => {
    if (userId) {
      fetchModel(`/user/${userId}`)
        .then(result => setUser(result.data));
    }

    fetchModel('/test/info')
      .then(result => setVersion(result.data.__v));

  }, [userId]);

  useEffect(() => {
    fetchLoggedInUser().
    then(result => {
      if(result){
        setLoggedUser(result);
      }
      else{
        setLoggedUser("Not Logged In");
      }
    })
    .catch(error => console.log("Error getting logged in user name"));
  }, []);

  function handleImageSelect(event){
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = 'image/';
      if (!file.type.toString().startsWith(allowedTypes)) {
          fileSelector.current.value = null;
          alert('Only image files are allowed');
          return;
      }
      if (file.size > 30 * 1024 * 1024) {
          fileSelector.current.value = null;
          alert('File size exceeds 30MB limit');
          return;
      }
    }
    console.log("File satisfies the requirements");
    return;
  }

  function handleUploadButtonClicked(event) {
    event.preventDefault();
    if (fileSelector.current.files.length > 0) {
      // Create a DOM form and add the file to it under the name uploadedphoto
      const domForm = new FormData();
      domForm.append('uploadedphoto', fileSelector.current.files[0]);
      axios.post('/photos/new', domForm)
        .then((res) => {
          console.log(res);
          alert('Photo uploaded.');
          return;
        })
        .catch(err => {
          alert("Error uploading the file.")
        });
    }
    else{
      alert('No file selected.');
      return;
    }
  }

  // Logout function
  const handleLogout = async () => {
    try {
      const response = await fetch("/admin/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        console.log("Logout successful");
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AppBar className="topbar-appBar" position="relative">
      <Toolbar>
        <Box className="title">
          <Typography variant="h5" className="MuiTypography-h5">
            {loggedUser}
          </Typography>
          <Typography variant="subtitle1" className="context">
          {page==="photos" && "Photos of " + user.first_name}
          {page==="users" && "Details of " + user.first_name}
          {page!=="photos" && page!=="users" && "Home"}
        </Typography>
          <Typography variant="body2" className="version">
            Version: {version}
          </Typography>
        </Box>
        <Box style={{marginRight: "20px"}}>
          <input id ="fileSelect" type="file" accept="image/*" name = "inputFile" onChange={handleImageSelect} style={{maxWidth: "200px"}} ref={fileSelector} />
          <Button
          variant="contained"
          onClick={handleUploadButtonClicked}
          style={{backgroundColor: "lightgray", color: "black"}}
         >
          Add Photo
        </Button>
        </Box>
        <Button
          variant="contained"
          onClick={handleLogout}
          style={{backgroundColor: "lightgray", color: "black"}}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
