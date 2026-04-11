import { db } from "./firebase.js";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function getOrCreateUser(spotifyId, displayName) {
  console.log("getOrCreateUser appelé", spotifyId);
  const ref = doc(db, "users", spotifyId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    console.log("Création utilisateur...");
    await setDoc(ref, {
      spotify_id: spotifyId,
      display_name: displayName,
      created_at: serverTimestamp(),
      last_seen_at: serverTimestamp(),
    });
    console.log("Utilisateur créé ✓");
  } else {
    console.log("Utilisateur existant, mise à jour last_seen...");
    await updateDoc(ref, { last_seen_at: serverTimestamp() });
  }
  return spotifyId;
}

// ── Démarrer une session
export async function startSession(userId) {
  const now = new Date();
  const hour = now.getHours();
  let timeOfDay = "soiree";
  if (hour >= 17 && hour < 21) timeOfDay = "apero";
  else if (hour >= 2 && hour < 6) timeOfDay = "late_night";

  const sessionRef = doc(db, "sessions", `${userId}_${Date.now()}`);
  await setDoc(sessionRef, {
    user_id: userId,
    started_at: serverTimestamp(),
    ended_at: null,
    day_of_week: now.toLocaleDateString("fr-FR", { weekday: "long" }),
    time_of_day: timeOfDay,
    dominant_genre: null,
    track_count: 0,
    notification_count: 0,
    last_notification_at: null,
    status: "active",
    auto_closed_reason: null,
    mode_history: [],
    total_pause_duration: 0,
    pause_count: 0,
  });
  return sessionRef.id;
}

// ── Enregistrer une interaction
export async function saveInteraction(userId, sessionId, track, action, positionInSession) {
  const ref = doc(db, "interactions", `${userId}_${Date.now()}`);
  await setDoc(ref, {
    user_id: userId,
    session_id: sessionId,
    track_spotify_id: track.id || null,
    track_title: track.title,
    track_artist: track.artist,
    track_artist_id: track.artist_id || null,
    track_genre: track.genre || null,
    track_bpm: track.bpm || null,
    track_key: track.key ?? null,
    track_energy: track.energy || null,
    action,
    timestamp: serverTimestamp(),
    position_in_session: positionInSession,
    triggered_mode_change: false,
    new_mode: null,
    ambient_volume_at_moment: null,
    spotify_volume_at_moment: null,
  });
}
