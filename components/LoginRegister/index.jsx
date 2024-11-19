import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Box } from "@mui/material";
import './styles.css';

function Login() {
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [registerData, setRegisterData] = useState({
    login_name: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [displayRegistration, setDisplayRegistration] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login_name: loginName, password }),
        credentials: "include",
      });
      if (response.ok) {
        setErrorMessage("");
        navigate("/");
        window.location.reload();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.msg || "Login failed");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const { login_name, password, confirmPassword, first_name, last_name } = registerData;
    if (!login_name || !password || !first_name || !last_name) {
      setRegisterError("Please fill in all required fields.");
      setRegisterSuccess("");
      return;
    }
    if (password !== confirmPassword) {
      setRegisterError("Passwords do not match.");
      setRegisterSuccess("");
      return;
    }
    try {
      const response = await fetch("/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });
      if (response.ok) {
        setRegisterError("");
        setRegisterSuccess("Registration successful!");
        setRegisterData({
          login_name: "",
          password: "",
          confirmPassword: "",
          first_name: "",
          last_name: "",
          location: "",
          description: "",
          occupation: "",
        });
      } else {
        const errorData = await response.json();
        setRegisterError(errorData.error || "Registration failed.");
        setRegisterSuccess("");
      }
    } catch {
      setRegisterError("An error occurred. Please try again.");
      setRegisterSuccess("");
    }
  };

  const showRegistration = function(event){
    event.preventDefault();
    setLoginName("");
    setPassword("");
    setDisplayRegistration(true);
  }

  const hideRegistration = function(event){
    event.preventDefault();
    setRegisterData({
      login_name: "",
      password: "",
      confirmPassword: "",
      first_name: "",
      last_name: "",
      location: "",
      description: "",
      occupation: "",
    });
    setRegisterError("");
    setRegisterSuccess("");
    setDisplayRegistration(false);
  }

  return (
    <Box className="login-register-container">
      {!displayRegistration && <Box component="form" onSubmit={handleLogin} className="login-form">
        <Typography variant="h4" className="form-title">Login</Typography>
        <TextField
          label="Username"
          value={loginName}
          onChange={(e) => setLoginName(e.target.value)}
          variant="outlined"
          fullWidth
          className="form-input"
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant="outlined"
          fullWidth
          className="form-input"
          required
        />
        {errorMessage && <Typography variant="body2" className="error">{errorMessage}</Typography>}
        <Button type="submit" variant="contained" className="form-button" style={{backgroundColor: "darkgreen", marginTop: "5px"}}>
          Login
        </Button>
        <Button variant="text" onClick={showRegistration} style={{marginTop: "10px", color: "green"}}>Don't have an account? Register here.</Button>
      </Box>}

      {displayRegistration && <Box component="form" onSubmit={handleRegister} className="register-form">
        <Typography variant="h4" className="form-title">Register</Typography>
        <TextField
          label="Username"
          value={registerData.login_name}
          onChange={(e) => setRegisterData({ ...registerData, login_name: e.target.value })}
          variant="outlined"
          fullWidth
          className="form-input"
          required
        />
        <TextField
          label="Password"
          type="password"
          value={registerData.password}
          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
          variant="outlined"
          fullWidth
          className="form-input"
          required
        />
        <TextField
          label="Confirm Password"
          type="password"
          value={registerData.confirmPassword}
          onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
          variant="outlined"
          fullWidth
          className="form-input"
          required
        />
        <TextField
          label="First Name"
          value={registerData.first_name}
          onChange={(e) => setRegisterData({ ...registerData, first_name: e.target.value })}
          variant="outlined"
          fullWidth
          className="form-input"
          required
        />
        <TextField
          label="Last Name"
          value={registerData.last_name}
          onChange={(e) => setRegisterData({ ...registerData, last_name: e.target.value })}
          variant="outlined"
          fullWidth
          className="form-input"
          required
        />
        <TextField
          label="Location"
          value={registerData.location}
          onChange={(e) => setRegisterData({ ...registerData, location: e.target.value })}
          variant="outlined"
          fullWidth
          className="form-input"
        />
        <TextField
          label="Description"
          value={registerData.description}
          onChange={(e) => setRegisterData({ ...registerData, description: e.target.value })}
          variant="outlined"
          fullWidth
          className="form-input"
        />
        <TextField
          label="Occupation"
          value={registerData.occupation}
          onChange={(e) => setRegisterData({ ...registerData, occupation: e.target.value })}
          variant="outlined"
          fullWidth
          className="form-input"
        />
        {registerError && <Typography variant="body2" className="error">{registerError}</Typography>}
        {registerSuccess && <Typography variant="body2" className="success">{registerSuccess}</Typography>}
        <Button type="submit" variant="contained" className="form-button" style={{backgroundColor: "darkgreen", marginTop: "5px"}}>
          Register Me
        </Button>
        <Button variant="text" onClick={hideRegistration} style={{marginTop: "10px", color: "green"}}>Already have an account? Login here.</Button>
      </Box>}
    </Box>
  );
}

export default Login;
