// src/pages/Display/DisplayPage.jsx
import React, { useEffect, useState } from 'react';
import instance from '@/utils/request';
import PostCard from '@/components/PostCard';
import './index.scss';

const DisplayPage = () => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // load profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await instance.get('/profile/me');
        setProfile(res);
      } catch (e) {
        console.error('Failed to load profile', e);
      } finally {
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, []);

  // load posts
  useEffect(() => {
    if (!profile) {
      return;
    }
    async function loadPosts() {
      try {
        const all = await instance.get('/posts');
        const currentUserId = profile?.user_id;
        const mine = (all || []).filter((p) => {
          return (
            (p.status || '').toLowerCase() === 'published' &&
            p.user_id === currentUserId
          );
        });

        setPosts(mine);
      } catch (e) {
        console.error('Failed to load posts', e);
      } finally {
        setLoadingPosts(false);
      }
    }
    if (profile) {
      loadPosts();
    }else {
      setLoadingPosts(false);
    }
  }, [profile]);

  return (
    <div className="display-page">

      {/* ---------------- Profile Section ---------------- */}
      <section>

        {loadingProfile ? (
          <p>Loading profile...</p>
        ) : !profile ? (
          <p>No profile found.</p>
        ) : (
          <div>
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt="avatar"
                width="150"
                height="150"
                style={{ borderRadius: '50%', objectFit: "cover" }}
              />
            )}
            {profile.display_name && <h2>{profile.display_name}</h2>}
            {profile.role && (
              <p><strong>Role:</strong> {profile.role}</p>
            )}
            {profile.bio && (
              <p><strong>Bio:</strong> {profile.bio}</p>
            )}
          </div>
        )}
      </section>

      {/* ---------------- Posts Section ---------------- */}
      <section style={{ marginTop: '24px' }}>

        {loadingPosts ? (
          <p>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p>No posts found.</p>
        ) : (
          <div className="masonry">
            {posts.map((post) => (
              <div className="masonry-item" key={post.post_id}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DisplayPage;

