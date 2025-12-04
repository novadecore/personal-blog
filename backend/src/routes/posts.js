// src/api/posts.js
import express from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * 1. /posts/ping
 */
router.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});


/**
 * 2. GET /posts 
 *    fetch all posts with author info and images
 */
router.get('/', async (req, res) => {
  try {
    const posts = await prisma.posts.findMany({
      orderBy: { create_time: 'desc' },
      include: {
        user: {
          select: {
            user_id: true,
            email: true,
            profile: { select: { display_name: true } }
          }
        },
        images: true
      }
    });

    // BigInt → string
    const mapped = posts.map(p => ({
      post_id: p.post_id.toString(),
      user_id: p.user_id.toString(),
      title: p.title,
      content: p.content,
      status: p.status,
      image_mode: p.image_mode,
      published_at: p.published_at,
      create_time: p.create_time,
      update_time: p.update_time,
      author: {
        id: p.user.user_id.toString(),
        email: p.user.email,
        display_name: p.user.profile?.display_name || null
      },
      images: p.images.map(img => ({
        image_id: img.image_id.toString(),
        image_url: img.image_url,
        position: img.position
      }))
    }));

    res.json(mapped);

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed to fetch posts' });
  }
});


/**
 * 3. GET /posts/:id
 * fetch a single post by id with author info and images
 */
router.get('/:id', async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await prisma.posts.findUnique({
      where: { post_id: BigInt(postId) },
      include: {
        images: true,
        user: {
          select: {
            user_id: true,
            email: true,
            profile: { select: { display_name: true } },
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'post not found' });
    }
    const mapped = {
      post_id: post.post_id.toString(),
      user_id: post.user_id.toString(),
      title: post.title,
      content: post.content,
      status: post.status,
      image_mode: post.image_mode,
      published_at: post.published_at,
      create_time: post.create_time,
      update_time: post.update_time,
      author: {
        id: post.user.user_id.toString(),
        email: post.user.email,
        display_name: post.user.profile?.display_name || null,
      },
      images: post.images.map((img) => ({
        image_id: img.image_id.toString(),
        image_url: img.image_url,
        position: img.position,
      })),
    };

    res.json(mapped);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed to fetch post' });
  }
});


/**
 * 4. POST /posts/new
 *    needs authentication to create a new post
 */
router.post('/new', requireAuth, async (req, res) => {
  try {
    const { title, content, image_mode, status, image_urls = [] } = req.body || {};

    if (!title || !content) {
      return res.status(400).json({ error: 'title and content are required' });
    }

    const post = await prisma.posts.create({
      data: {
        title,
        content,
        image_mode: image_mode || null,
        status: status || 'draft',
        user_id: BigInt(req.user.id),  // from requireAuth middleware
        images: {
          create: image_urls.map((url, index) => ({
            image_url: url,
            position: index,
          })),
        },
      },
      include: {
        images: true,   // include images if needed
      },
    });

    res.status(201).json({
      post_id: post.post_id.toString(),
      user_id: post.user_id.toString(),
      title: post.title,
      content: post.content,
      status: post.status,
      create_time: post.create_time,
      update_time: post.update_time,
      images: post.images,
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed to create post' });
  }
});


/**
 * 5. POST /posts/delete/:id
 *    needs authentication to delete a post
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    const existing = await prisma.posts.findUnique({
      where: { post_id: BigInt(postId) },
    });
    if (!existing) {
      return res.status(404).json({ error: 'post not found' });
    }
    if (existing.user_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'forbidden: not the owner' });
    }
    // delete associated images first
    await prisma.post_images.deleteMany({
      where: { post_id: BigInt(postId) },
    });
    await prisma.posts.delete({
      where: { post_id: BigInt(postId) },
    });
    res.json({ message: 'post deleted successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed to delete post' });
  }
});



/** 6. PUT /posts/:id
 *    needs authentication to update a post
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, content, image_mode, status, image_urls } = req.body || {};

    if (
      title === undefined &&
      content === undefined &&
      image_mode === undefined &&
      status === undefined &&
      image_urls === undefined
    ) {
      return res.status(400).json({ error: 'nothing to update' });
    }

    // check if post exists
    const existing = await prisma.posts.findUnique({
      where: { post_id: BigInt(postId) },
    });

    if (!existing) {
      return res.status(404).json({ error: 'post not found' });
    }

    // only allow the author to modify
    if (existing.user_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'forbidden: not the owner' });
    }

    const updated = await prisma.posts.update({
      where: { post_id: BigInt(postId) },
      data: {
        // only update provided fields
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(image_mode !== undefined ? { image_mode } : {}),
        ...(status !== undefined ? { status } : {}),
      }
    });

    if (image_urls !== undefined) {
      // delete existing images first
      await prisma.post_images.deleteMany({
        where: { post_id: BigInt(postId) },
      });

      // recreate based on new array
      if (Array.isArray(image_urls) && image_urls.length > 0) {
        await prisma.post_images.createMany({
          data: image_urls.map((url, index) => ({
            post_id: BigInt(postId),
            image_url: url,
            position: index,
          })),
        });
      }
    }

    const postWithImages = await prisma.posts.findUnique({
      where: { post_id: BigInt(postId) },
      include: { images: true },
    });

    res.json({
      post_id: postWithImages.post_id.toString(),
      user_id: postWithImages.user_id.toString(),
      title: postWithImages.title,
      content: postWithImages.content,
      status: postWithImages.status,
      image_mode: postWithImages.image_mode,
      create_time: postWithImages.create_time,
      update_time: postWithImages.update_time,
      images: postWithImages.images,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed to update post' });
  }
});



export default router;
