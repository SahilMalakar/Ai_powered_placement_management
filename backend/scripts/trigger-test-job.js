import { Queue } from 'bullmq';

const RESUME_QUEUE_NAME = 'resumeQueue';
const connection = {
  host: '127.0.0.1',
  port: 6379,
  password: 'strongpassword'
};

const resumeQueue = new Queue(RESUME_QUEUE_NAME, { connection });

async function addJob() {
  const payload = {
    type: 'GENERATE_RESUME',
    userId: 13,
    resumeId: 1,
    branch: 'ETE',
    profileData: {
      name: "Sahil Malakar",
      contact: {
        email: "sahilmalakar150@gmail.com",
        phone: "+91 98648 848124",
        linkedin: "https://linkedin.com/in/sahil-malakar"
      },
      education: [
        {
          institution: "Assam Engineering College",
          degree: "B.Tech in Electronics and Telecommunication Engineering",
          dateRange: "2022 - 2026",
          cgpa: "7.8"
        }
      ],
      projects: [
        {
          title: "GenAI Notion Clone",
          description: "Created a productivity web application inspired by Notion, enhanced with Generative AI features."
        }
      ]
    }
  };

  console.log(`Adding ${payload.type} job for user ${payload.userId}...`);
  const job = await resumeQueue.add(payload.type, payload);
  console.log(`Job added with ID: ${job.id}`);
  process.exit(0);
}

addJob().catch(err => {
  console.error(err);
  process.exit(1);
});
