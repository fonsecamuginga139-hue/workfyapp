# Project decisions

- Public biosite data must be served through sanitized Supabase RPCs, never by exposing owner-only commercial columns. Why: public pages and landing mockups must not leak private tenant data.
- Landing showcase only displays published biosites with explicit owner opt-in. Why: the first or any user biosite must appear publicly only by user choice.
- User-generated media uploads must be restricted to safe image/video types and private user folders. Why: uploads are public-facing content but storage is private and tenant-scoped.
