# Product Direction

**Status:** These are product requirements and design direction. The current Expo screen is still the generated starter.

## Identity and experience

Tinta means "ink." Its tagline is **Your days, remembered.** It is a private digital diary for daily thoughts, moods, meaningful memories, and revisiting moments over time. Writing and the diary itself remain the center of the product.

The experience should feel personal, calm, private, modern, minimal, reflective, and thoughtful. It should not resemble a corporate dashboard, a generic notes app, a task manager, a social network, or an AI-first product.

## MVP scope

The intended first release includes Clerk authentication, local user synchronization, a protected API, diary entries, moods, favorites, tags, search, filters, pagination, calendar browsing, and a basic profile. Build these as small verified slices. The agreed first entry slice and date rule are in [ARCHITECTURE.md](ARCHITECTURE.md); the full MVP is not implemented yet.

Entry and tag data are private to their owner. No public sharing behavior follows merely from the planned `isPrivate` field; its exact meaning remains open.

## Visual direction

Use a modern, understated palette drawn from clean off-white, soft neutral gray, light stone, desaturated paper beige, deep ink, charcoal, soft black, muted burgundy, dusty rose, muted olive, soft brown, and desaturated plum. Keep writing legible and the interface quiet.

Avoid warm ivory, yellow-heavy cream or paper colors, generic purple SaaS themes, neon-heavy gradients, and excessive glass effects.

## Later phases

Media, notifications, writing streaks, mood statistics, On This Day, Memory Capsules, biometrics, offline SQLite support, export, and optional AI reflection are future possibilities. They are outside the initial MVP and need their own design, privacy review, and tests before implementation. Any AI feature must be optional and disclose external transmission of diary content; see [SECURITY.md](SECURITY.md).
