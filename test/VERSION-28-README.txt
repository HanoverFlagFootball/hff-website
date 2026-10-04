Hanover Flag Football Website - Version 28
Built from the corrected Version 27 that was itself rebuilt from Kyle's uploaded good 26.zip.

NEW IN VERSION 28
- My HFF: Find My Players access-request flow.
- Existing guardian can approve a request from an unlinked parent/guardian.
- Connected guardian can proactively invite another guardian from a player's card.
- Guardian approval page.
- Requests use random one-time 48-hour tokens; only token hashes are stored.
- No player names/details are revealed to an unapproved requester.
- Both guardians link to the same existing hff_players record.

DATABASE
Run VERSION-28-GUARDIAN-ACCESS.sql once in Supabase SQL Editor.

EMAIL/BACKEND
The existing Render backend sends guardian emails through the existing HFF Microsoft/GoDaddy mailbox.
Render needs HFF_SMTP_USER and HFF_SMTP_PASSWORD environment variables.
Defaults: smtp.office365.com port 587.
