async function fetchLoggedInUser() {
    try {
      const response = await fetch("/check-session", {
        method: "GET",
        credentials: "include",
      });
  
      if (response.ok) {
        const data = await response.json();
        return data.first_name;
      } else {
        console.error("User not authenticated");
        return null;
      }
    } catch (error) {
      console.error("Error fetching logged-in user:", error);
      return null;
    }
  }


  export default fetchLoggedInUser;
  