import React, { useState } from 'react';
import axios from 'axios';
// Assuming loginUser and createPost functions are imported
const WORDPRESS_BASE_URL = 'https://ratemytone.com'; // Replace with your domain


const PostCreator = () => {
  const createPost = async (title, content, status = 'draft') => {
    const token = localStorage.getItem('rmt_token');

    if (!token) {
      console.error('No JWT token found. User not authenticated.');
      return;
    }

    try {
      const response = await axios.post(
        `${WORDPRESS_BASE_URL}/wp/v2/posts`,
        // Data payload
        {
          title: title,
          content: content,
          status: status, // 'publish', 'draft', etc.
        },
        // Configuration object for headers
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Attach the JWT
          },
        }
      );

      console.log('Post created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error.response.data.message);
      throw new Error(error.response.data.message);
    }
  };

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Creating post...');
    try {
      // Ensure the user is logged in first (handle login logic elsewhere, or ensure token exists)
      await createPost(title, content, 'publish');
      setMessage('Post published successfully!');
      setTitle('');
      setContent('');
    } catch (error) {
      setMessage(`Failed to create post: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create New Post</h2>
      <input
        type='text'
        placeholder='Post Title'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder='Post Content'
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <button type='submit'>Create Post</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default PostCreator;
