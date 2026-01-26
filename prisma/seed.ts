import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  await prisma.flashcard.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();

  await prisma.course.create({
    data: {
      title: "ML Systems Foundations",
      slug: "ml-systems-foundations",
      description: "Core concepts for training, serving, and operating ML systems.",
      modules: {
        create: [
          {
            title: "Intro to ML Systems",
            slug: "intro-to-ml-systems",
            description: "How ML systems differ from traditional software systems.",
            position: 1,
            lessons: {
              create: [
                {
                  title: "Training vs Serving",
                  slug: "training-vs-serving",
                  summary:
                    "Understand how offline training differs from online inference.",
                  position: 1,
                  contentMd: `# Training vs Serving

Training optimizes model parameters using historical data.
Serving runs the trained model to generate predictions on new inputs.

Key differences:
- Training is batch oriented and throughput focused.
- Serving is latency sensitive and reliability focused.`,
                  flashcards: {
                    create: [
                      {
                        frontMd:
                          "What is the main difference between training and serving?",
                        backMd:
                          "Training optimizes model parameters with historical data, while serving produces predictions on new inputs with low latency.",
                        position: 1,
                      },
                      {
                        frontMd: "What is training-serving skew?",
                        backMd:
                          "It is a mismatch between training data pipelines and serving data pipelines that causes prediction quality to drop in production.",
                        position: 2,
                      },
                    ],
                  },
                },
                {
                  title: "Data and Feature Pipelines",
                  slug: "data-and-feature-pipelines",
                  summary:
                    "Learn why feature pipelines are the backbone of ML systems.",
                  position: 2,
                  contentMd: `# Data and Feature Pipelines

Feature pipelines define how raw data becomes model-ready inputs.
Consistent pipelines reduce drift and ensure reproducible training.

Operational tips:
- Version features and datasets.
- Monitor data quality over time.`,
                  flashcards: {
                    create: [
                      {
                        frontMd: "Why are feature pipelines important?",
                        backMd:
                          "They standardize transformations, reduce data inconsistencies, and make training and serving pipelines reproducible.",
                        position: 1,
                      },
                      {
                        frontMd: "What is a feature version?",
                        backMd:
                          "A tracked definition of a feature that includes its transformations, source data, and processing logic.",
                        position: 2,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: "Deployment Basics",
            slug: "deployment-basics",
            description: "Shipping models safely to production.",
            position: 2,
            lessons: {
              create: [
                {
                  title: "Model Packaging and Inference",
                  slug: "model-packaging-and-inference",
                  summary:
                    "Package models for reliable inference in production.",
                  position: 1,
                  contentMd: `# Model Packaging and Inference

Packaging captures the model artifact, runtime dependencies, and configuration.
Inference services should balance latency, cost, and availability.

Start simple:
- Containerize the model server.
- Add health checks and basic monitoring.`,
                  flashcards: {
                    create: [
                      {
                        frontMd: "What is a model artifact?",
                        backMd:
                          "A serialized representation of the trained model used for deployment and inference.",
                        position: 1,
                      },
                      {
                        frontMd:
                          "Why are health checks useful in model serving?",
                        backMd:
                          "They confirm the service is ready to accept traffic and help automate recovery during failures.",
                        position: 2,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seeded course, module, lesson, and flashcard data.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
