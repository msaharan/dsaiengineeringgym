# Content Authoring (MVP → v1)

## MVP approach
- Seed content via `prisma/seed.ts` (fastest path)
- Each Lesson may reference an `mdxPath` later for file-based authoring

## Target file-based format (v1)
Store content in-repo under `content/`.

Example:
content/
  courses/
    ml-systems/
      course.json
      modules/
        intro-to-ml-systems/
          module.json
          lessons/
            feature-stores.mdx
            online-offline-serving.mdx
            flashcards.json

### flashcards.json example
[
  {
    "frontMd": "What problem does a feature store solve?",
    "backMd": "It prevents training/serving skew by sharing feature definitions and pipelines between offline training and online serving.",
    "tags": ["ml-systems", "feature-store"]
  }
]

## Ingestion (v1)
A script will parse `content/` and upsert into DB.
