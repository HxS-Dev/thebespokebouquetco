import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "./config"; // Import the config file

const InstagramCollage = () => {
  const [posts, setPosts] = useState([]);
  const [usedIndices, setUsedIndices] = useState([]);

  useEffect(() => {
    const accessToken = config.accessToken; // Get the access token from the config file
    const apiUrl = `https://graph.instagram.com/me/media?fields=id,caption,media_url,media_type&access_token=${accessToken}`;

    const fetchAllPosts = async (url, allPosts = []) => {
      try {
        const response = await axios.get(url);
        const newPosts = response.data.data.filter(post => post.media_url && (!post.caption || !post.caption.includes('#nowebsite')));
        allPosts = [...allPosts, ...newPosts];

        if (response.data.paging && response.data.paging.next) {
          await fetchAllPosts(response.data.paging.next, allPosts);
        } else {
          console.log(`Fetched ${allPosts.length} posts`); // Log the number of posts fetched
          setPosts(allPosts);
        }
      } catch (error) {
        console.error("Error fetching Instagram posts:", error);
      }
    };

    fetchAllPosts(apiUrl);
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      // Initialize the collage with the first 9 posts that have images or videos
      const initialIndices = posts.slice(0, 9).map((_, i) => i);
      setUsedIndices(initialIndices);
    }
  }, [posts]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (posts.length > 0) {
        let randomIndex = null;
        while (randomIndex === null || usedIndices.includes(randomIndex)) {
          randomIndex = Math.floor(Math.random() * posts.length);
        }
        const randomPost = posts[randomIndex];
        const randomMedia = randomPost.media_url;
        const randomCollageIndex = Math.floor(Math.random() * 9);

        const collageItems = document.querySelectorAll('.collage-item');
        const collageItem = collageItems[randomCollageIndex];

        if (randomPost.media_type === 'IMAGE') {
          collageItem.innerHTML = `<img src="${randomMedia}" class="collage-image" />`;
        } else if (randomPost.media_type === 'VIDEO') {
          collageItem.innerHTML = `<video src="${randomMedia}" class="collage-video" autoplay muted loop></video>`;
        }

        setUsedIndices(prev => {
          const newUsedIndices = [...prev];
          newUsedIndices[randomCollageIndex] = randomIndex;
          return newUsedIndices;
        });
      }
    }, 1000); // Change media every 3 seconds

    return () => clearInterval(interval);
  }, [posts, usedIndices]);

  return (
    <div className="instagram-collage">
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className="collage-item">
          {posts[index] && posts[index].media_type === 'IMAGE' ? (
            <img src={posts[index].media_url} className="collage-image" />
          ) : posts[index] && posts[index].media_type === 'VIDEO' ? (
            <video src={posts[index].media_url} className="collage-video" autoPlay muted loop></video>
          ) : (
            <div className="collage-placeholder"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default InstagramCollage;