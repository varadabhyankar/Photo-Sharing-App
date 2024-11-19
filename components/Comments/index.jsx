import React, { useState } from "react";
import { Typography, TextField, Button } from "@mui/material";

function Comments(props) {

  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [comments, setComments] = useState(props.comments);

  const handleAddComment = () => {
    fetch(`/commentsOfPhoto/${props.photoId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment: newComment }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add comment");
        }
        return response.json();
      })
      .then((data) => {
        setComments((prevComments) => [...(prevComments || []), data]);
        setNewComment("");
        setError("");
      })
      .catch((error) => setError("Error adding comment: " + error.message));
      return;
  };

  return (
    <div className="commentsContainer">
      {comments.map((comment, index) => (
        <Typography key={index} variant="body2" className="comment">
          <strong>{comment.user.first_name}: </strong>
          {comment.comment}
        </Typography>
      ))}
      <div className="addComment">
        <TextField
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          variant="outlined"
          size="small"
          placeholder="Add a comment"
          style={{ marginTop: "5px" }}
          error={!!error}
          helperText={error}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddComment}
          style={{ marginTop: "5px" }}
        >
          Post
        </Button>
      </div>
    </div>
  );
}

export default Comments;
