import { PrismaClient, PostType, PostStatus } from '.prisma/client-blog';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.postTag.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();

  console.log('✅ Cleaned existing data');

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'javascript' } }),
    prisma.tag.create({ data: { name: 'typescript' } }),
    prisma.tag.create({ data: { name: 'nodejs' } }),
    prisma.tag.create({ data: { name: 'prisma' } }),
    prisma.tag.create({ data: { name: 'travel' } }),
    prisma.tag.create({ data: { name: 'photography' } }),
  ]);

  console.log(`✅ Created ${tags.length} tags`);

  // Create VIDEO post
  const videoPost = await prisma.post.create({
    data: {
      type: PostType.VIDEO,
      status: PostStatus.PUBLISHED,
      authorId: 'user-1',
      publishedAt: new Date(),
      title: 'Learn Prisma in 10 Minutes',
      videoUrl: 'https://youtube.com/watch?v=example',
      tags: {
        create: [
          { tagId: tags[0].id }, // javascript
          { tagId: tags[3].id }, // prisma
        ],
      },
    },
  });

  console.log('✅ Created VIDEO post');

  // Create TEXT post
  const textPost = await prisma.post.create({
    data: {
      type: PostType.TEXT,
      status: PostStatus.PUBLISHED,
      authorId: 'user-1',
      publishedAt: new Date(),
      title: 'Getting Started with NestJS and Prisma',
      announcement: 'Learn how to integrate Prisma ORM with NestJS framework',
      text: 'In this tutorial, we will explore how to set up Prisma with NestJS. Prisma is a modern ORM that makes database access easy and type-safe...',
      tags: {
        create: [
          { tagId: tags[1].id }, // typescript
          { tagId: tags[2].id }, // nodejs
          { tagId: tags[3].id }, // prisma
        ],
      },
    },
  });

  console.log('✅ Created TEXT post');

  // Create QUOTE post
  const quotePost = await prisma.post.create({
    data: {
      type: PostType.QUOTE,
      status: PostStatus.PUBLISHED,
      authorId: 'user-2',
      publishedAt: new Date(),
      quoteText: 'Code is like humor. When you have to explain it, it\'s bad.',
      quoteAuthor: 'Cory House',
      tags: {
        create: [{ tagId: tags[0].id }], // javascript
      },
    },
  });

  console.log('✅ Created QUOTE post');

  // Create PHOTO post
  const photoPost = await prisma.post.create({
    data: {
      type: PostType.PHOTO,
      status: PostStatus.PUBLISHED,
      authorId: 'user-2',
      publishedAt: new Date(),
      photoUrl: 'https://example.com/photos/mountain.jpg',
      tags: {
        create: [
          { tagId: tags[4].id }, // travel
          { tagId: tags[5].id }, // photography
        ],
      },
    },
  });

  console.log('✅ Created PHOTO post');

  // Create LINK post
  await prisma.post.create({
    data: {
      type: PostType.LINK,
      status: PostStatus.DRAFT,
      authorId: 'user-1',
      url: 'https://www.prisma.io/docs',
      description: 'Official Prisma documentation with guides and API reference',
      tags: {
        create: [{ tagId: tags[3].id }], // prisma
      },
    },
  });

  console.log('✅ Created LINK post (draft)');

  // Create comments
  await prisma.comment.createMany({
    data: [
      {
        postId: videoPost.id,
        userId: 'user-2',
        text: 'Great tutorial! Very helpful.',
      },
      {
        postId: videoPost.id,
        userId: 'user-3',
        text: 'Thanks for sharing this!',
      },
      {
        postId: textPost.id,
        userId: 'user-3',
        text: 'Exactly what I was looking for.',
      },
    ],
  });

  console.log('✅ Created 3 comments');

  // Create likes
  await prisma.like.createMany({
    data: [
      { postId: videoPost.id, userId: 'user-2' },
      { postId: videoPost.id, userId: 'user-3' },
      { postId: textPost.id, userId: 'user-2' },
      { postId: quotePost.id, userId: 'user-1' },
      { postId: photoPost.id, userId: 'user-1' },
      { postId: photoPost.id, userId: 'user-3' },
    ],
  });

  console.log('✅ Created 6 likes');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
