Column,Type,Description
id,uuid,PK. Linked to Supabase Auth.
name,text,Display name for the dashboard.
twin_data,jsonb,"The Soul File. Contains bio, voice_samples, and goals."
twin_status,text,"active, paused, or suspended. Controls visibility."

Column,Type,Description
id,uuid,PK. Unique simulation ID.
participant1,uuid,FK. The user who requested the intro.
participant2,uuid,FK. The target user.
score,int,0-100 compatibility rating.
transcript,jsonb,The raw chat logs between the two agents.