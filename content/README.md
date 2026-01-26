# Content authoring (v1 skeleton)

This folder will store file-based course content that can be synced into the
database. The target structure is documented in `docs/CONTENT_AUTHORING.md`.

Planned structure:

```
content/
  courses/
    ml-systems/
      course.json
      modules/
        intro-to-ml-systems/
          module.json
          lessons/
            training-vs-serving.mdx
            flashcards.json
```

The sync script lives in `scripts/sync-content.ts` and will eventually parse
this directory and upsert content into Postgres.
