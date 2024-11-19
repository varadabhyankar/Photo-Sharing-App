import React, { useState, useEffect } from "react";
import { Button, Typography, Box } from "@mui/material";
import { Link } from "react-router-dom";
import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

function UserDetail({ userId }) {
  const [user, setUser] = useState([]);
  useEffect(() => {
    fetchModel(`/user/${userId}`)
      .then(result => setUser(result.data));
  }, [userId]);


  return (
    <Box className="mainContainer">
      <Typography variant="h3" className="name">
        {user.first_name} {user.last_name}
      </Typography>
      <Typography variant="h4" className="information">
        Location: {user.location}
      </Typography>
      <Typography variant="h4" className="information">
        Occupation: {user.occupation}
      </Typography>
      <Typography variant="body1" className="description">
        {user.description}
      </Typography>
      <Box className="buttonContainer">
        <Button
          LinkComponent={Link}
          to={`/photos/${user._id}`}
          style={{backgroundColor: "#0d3818", padding: "10px", border:"2px solid black", color: "#ffffff"}}
        >
          View Photos
        </Button>
      </Box>
    </Box>
  );
}

export default UserDetail;
