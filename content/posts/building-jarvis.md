---
title: Building Jarvis: what I learned wiring an LLM into a real interface
date: 2026-03-15
excerpt: On CORS errors, streaming responses, and why the boring parts of a project teach you the most.
---

I wanted to build something that felt like Jarvis from Iron Man — not the AI itself, but the *feeling* of talking to a real interface instead of a chat box.

## The stack

FastAPI on the backend, calling Claude's API. React on the frontend, styled like a HUD. Nothing exotic, but wiring it together taught me more than any tutorial did.

## What actually went wrong

The first real bug wasn't code — it was billing. My API key worked fine, but I hadn't added credit to my account, so every request failed with a 400 error. A good reminder that "it's broken" is often not a coding problem at all.

CORS was the second lesson. My frontend and backend run on different ports locally, and browsers block that by default unless the backend explicitly allows it. One `CORSMiddleware` line fixed it — but understanding *why* it was needed mattered more than the fix itself.

## What's next

Streaming responses, so replies appear word-by-word instead of all at once. And maybe voice input, since we're already committed to the Iron Man bit.