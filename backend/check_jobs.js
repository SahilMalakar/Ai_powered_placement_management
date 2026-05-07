
import { PrismaClient } from './dist/prisma/generated/prisma/client.js';

const prisma = new PrismaClient();

async function checkJobs() {
  try {
    const jobs = await prisma.job.findMany({
      select: {
        id: true,
        title: true,
        allowedBranches: true
      }
    });
    console.log('Jobs and their allowed branches:');
    jobs.forEach(job => {
      console.log(`ID: ${job.id}, Title: ${job.title}, Branches: ${JSON.stringify(job.allowedBranches)}`);
    });
  } catch (error) {
    console.error('Error checking jobs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJobs();
