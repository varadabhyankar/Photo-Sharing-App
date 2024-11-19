import React, { useEffect, useState } from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

function UserList() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetchModel('/user/list')
      .then(result => setUsers(result.data))
      .catch(error => console.error("Error:", error));
  }, []);

  const userList = users.map(element => (
    <React.Fragment key={element._id}>
      <ListItemButton component={Link} to={`/users/${element._id}`} className="userItem">
        <ListItem>
          <Typography variant="h6" className="userName">{element.first_name}</Typography>
        </ListItem>
      </ListItemButton>
      <Divider />
    </React.Fragment>
  ));

  return (
    <div className="userContainer">
      <Typography variant="h4" className="userTitle">Users</Typography>
      <List component="nav">{userList}</List>
    </div>
  );
}

export default UserList;
