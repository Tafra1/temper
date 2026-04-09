import { useState, useEffect, useCallback, useRef } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = "https://temper-lyart.vercel.app/callback";const SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-library-read",
  "streaming",
].join(" ");

// ─── MUSIC DATABASE ───────────────────────────────────────────────────────────
const TRACKS = [
  // ── HOUSE / CHICAGO
  { id: 1, title: "Your Love", artist: "Frankie Knuckles", bpm: 120, key: 9, mode: 0, energy: 0.72, dance: 0.82, intensity: 0.65, genre: "house" },
  { id: 2, title: "Move Your Body", artist: "Marshall Jefferson", bpm: 125, key: 4, mode: 0, energy: 0.78, dance: 0.86, intensity: 0.70, genre: "house" },
  { id: 3, title: "Can You Feel It", artist: "Larry Heard", bpm: 116, key: 5, mode: 0, energy: 0.62, dance: 0.75, intensity: 0.55, genre: "house" },
  { id: 4, title: "Mystery of Love", artist: "Larry Heard", bpm: 110, key: 5, mode: 0, energy: 0.45, dance: 0.60, intensity: 0.40, genre: "deep-house" },
  { id: 5, title: "What About This Love", artist: "Mr. Fingers", bpm: 112, key: 0, mode: 0, energy: 0.50, dance: 0.63, intensity: 0.42, genre: "deep-house" },
  { id: 6, title: "French Kiss", artist: "Lil Louis", bpm: 118, key: 2, mode: 0, energy: 0.68, dance: 0.80, intensity: 0.60, genre: "house" },
  { id: 7, title: "Show Me Love", artist: "Robin S", bpm: 129, key: 7, mode: 0, energy: 0.87, dance: 0.92, intensity: 0.84, genre: "house" },
  { id: 8, title: "Finally", artist: "CeCe Peniston", bpm: 128, key: 0, mode: 1, energy: 0.86, dance: 0.90, intensity: 0.81, genre: "house" },
  { id: 9, title: "Promised Land", artist: "Joe Smooth", bpm: 122, key: 5, mode: 1, energy: 0.74, dance: 0.84, intensity: 0.68, genre: "house" },
  { id: 10, title: "The Whistle Song", artist: "Frankie Knuckles", bpm: 124, key: 9, mode: 0, energy: 0.76, dance: 0.86, intensity: 0.70, genre: "house" },
  { id: 11, title: "Do You Believe", artist: "Crystal Waters", bpm: 130, key: 2, mode: 0, energy: 0.85, dance: 0.91, intensity: 0.80, genre: "house" },
  { id: 12, title: "Gypsy Woman", artist: "Crystal Waters", bpm: 127, key: 9, mode: 0, energy: 0.83, dance: 0.90, intensity: 0.78, genre: "house" },
  { id: 13, title: "Deep Inside", artist: "Hardrive", bpm: 124, key: 7, mode: 0, energy: 0.78, dance: 0.87, intensity: 0.72, genre: "house" },
  { id: 14, title: "Where Love Lives", artist: "Alison Limerick", bpm: 126, key: 2, mode: 1, energy: 0.80, dance: 0.88, intensity: 0.74, genre: "house" },

  // ── DAFT PUNK / FRENCH HOUSE
  { id: 15, title: "Around The World", artist: "Daft Punk", bpm: 121, key: 9, mode: 0, energy: 0.82, dance: 0.88, intensity: 0.75, genre: "french-house" },
  { id: 16, title: "One More Time", artist: "Daft Punk", bpm: 123, key: 6, mode: 0, energy: 0.85, dance: 0.91, intensity: 0.80, genre: "french-house" },
  { id: 17, title: "Harder Better Faster", artist: "Daft Punk", bpm: 123, key: 2, mode: 0, energy: 0.88, dance: 0.89, intensity: 0.82, genre: "french-house" },
  { id: 18, title: "Music Sounds Better With You", artist: "Stardust", bpm: 122, key: 9, mode: 0, energy: 0.80, dance: 0.87, intensity: 0.72, genre: "french-house" },
  { id: 19, title: "Burnin", artist: "Daft Punk", bpm: 125, key: 5, mode: 0, energy: 0.84, dance: 0.88, intensity: 0.78, genre: "french-house" },
  { id: 20, title: "Da Funk", artist: "Daft Punk", bpm: 92, key: 2, mode: 0, energy: 0.80, dance: 0.84, intensity: 0.76, genre: "french-house" },
  { id: 21, title: "Voyager", artist: "Daft Punk", bpm: 122, key: 6, mode: 1, energy: 0.75, dance: 0.86, intensity: 0.70, genre: "french-house" },
  { id: 22, title: "Get Lucky", artist: "Daft Punk ft. Pharrell", bpm: 116, key: 11, mode: 0, energy: 0.78, dance: 0.91, intensity: 0.71, genre: "nu-disco" },
  { id: 23, title: "Instant Crush", artist: "Daft Punk ft. Julian Casablancas", bpm: 115, key: 9, mode: 0, energy: 0.62, dance: 0.72, intensity: 0.58, genre: "nu-disco" },
  { id: 24, title: "Contact", artist: "Daft Punk", bpm: 134, key: 0, mode: 0, energy: 0.96, dance: 0.80, intensity: 0.95, genre: "electronic" },
  { id: 25, title: "Give Life Back to Music", artist: "Daft Punk", bpm: 97, key: 2, mode: 1, energy: 0.72, dance: 0.86, intensity: 0.66, genre: "nu-disco" },
  { id: 26, title: "Lose Yourself to Dance", artist: "Daft Punk ft. Pharrell", bpm: 100, key: 9, mode: 0, energy: 0.68, dance: 0.88, intensity: 0.62, genre: "nu-disco" },

  // ── TECHNO / DETROIT
  { id: 27, title: "Strings of Life", artist: "Rhythim Is Rhythim", bpm: 130, key: 0, mode: 0, energy: 0.91, dance: 0.88, intensity: 0.90, genre: "techno" },
  { id: 28, title: "Energy Flash", artist: "Joey Beltram", bpm: 135, key: 5, mode: 0, energy: 0.95, dance: 0.85, intensity: 0.96, genre: "techno" },
  { id: 29, title: "Clear", artist: "Cybotron", bpm: 125, key: 7, mode: 0, energy: 0.84, dance: 0.83, intensity: 0.82, genre: "techno" },
  { id: 30, title: "Spastik", artist: "Plastikman", bpm: 132, key: 0, mode: 0, energy: 0.90, dance: 0.84, intensity: 0.92, genre: "techno" },
  { id: 31, title: "Mentasm", artist: "Second Phase", bpm: 138, key: 5, mode: 0, energy: 0.97, dance: 0.82, intensity: 0.97, genre: "techno" },
  { id: 32, title: "Freefall", artist: "Juan Atkins", bpm: 127, key: 9, mode: 0, energy: 0.83, dance: 0.87, intensity: 0.80, genre: "techno" },
  { id: 33, title: "Nude Photo", artist: "Rhythm Is Rhythm", bpm: 128, key: 2, mode: 0, energy: 0.88, dance: 0.86, intensity: 0.87, genre: "techno" },
  { id: 34, title: "No UFOs", artist: "Model 500", bpm: 124, key: 4, mode: 0, energy: 0.80, dance: 0.84, intensity: 0.78, genre: "techno" },
  { id: 35, title: "Innovator", artist: "Derrick May", bpm: 130, key: 9, mode: 0, energy: 0.86, dance: 0.85, intensity: 0.84, genre: "techno" },
  { id: 36, title: "The Vision", artist: "Underground Resistance", bpm: 136, key: 5, mode: 0, energy: 0.94, dance: 0.82, intensity: 0.93, genre: "techno" },
  { id: 37, title: "Reese", artist: "Kevin Saunderson", bpm: 131, key: 7, mode: 0, energy: 0.90, dance: 0.85, intensity: 0.89, genre: "techno" },

  // ── DEEP HOUSE
  { id: 38, title: "Stars", artist: "Model 500", bpm: 114, key: 7, mode: 0, energy: 0.55, dance: 0.68, intensity: 0.48, genre: "deep-house" },
  { id: 39, title: "Washing Machine", artist: "Mystic Jungle", bpm: 108, key: 9, mode: 0, energy: 0.40, dance: 0.55, intensity: 0.35, genre: "deep-house" },
  { id: 40, title: "Aftermath", artist: "Nightmares on Wax", bpm: 104, key: 9, mode: 0, energy: 0.48, dance: 0.62, intensity: 0.42, genre: "deep-house" },
  { id: 41, title: "Smokers Delight", artist: "Nightmares on Wax", bpm: 98, key: 5, mode: 0, energy: 0.42, dance: 0.58, intensity: 0.38, genre: "deep-house" },
  { id: 42, title: "Spellbound", artist: "Leftfield", bpm: 120, key: 2, mode: 0, energy: 0.72, dance: 0.78, intensity: 0.68, genre: "deep-house" },
  { id: 43, title: "Release The Pressure", artist: "Leftfield", bpm: 112, key: 4, mode: 0, energy: 0.60, dance: 0.70, intensity: 0.56, genre: "deep-house" },

  // ── DISCO
  { id: 44, title: "Le Freak", artist: "Chic", bpm: 120, key: 9, mode: 0, energy: 0.76, dance: 0.90, intensity: 0.70, genre: "disco" },
  { id: 45, title: "Good Times", artist: "Chic", bpm: 111, key: 4, mode: 1, energy: 0.70, dance: 0.88, intensity: 0.65, genre: "disco" },
  { id: 46, title: "I Will Survive", artist: "Gloria Gaynor", bpm: 117, key: 9, mode: 0, energy: 0.80, dance: 0.88, intensity: 0.75, genre: "disco" },
  { id: 47, title: "I Feel Love", artist: "Donna Summer", bpm: 122, key: 6, mode: 0, energy: 0.79, dance: 0.88, intensity: 0.72, genre: "electronic-soul" },
  { id: 48, title: "Ring My Bell", artist: "Anita Ward", bpm: 117, key: 0, mode: 1, energy: 0.74, dance: 0.85, intensity: 0.68, genre: "disco" },
  { id: 49, title: "Got to Be Real", artist: "Cheryl Lynn", bpm: 115, key: 7, mode: 1, energy: 0.76, dance: 0.87, intensity: 0.70, genre: "disco" },
  { id: 50, title: "Ain't Nobody", artist: "Chaka Khan", bpm: 100, key: 2, mode: 0, energy: 0.72, dance: 0.85, intensity: 0.66, genre: "disco" },
  { id: 51, title: "Boogie Wonderland", artist: "Earth Wind & Fire", bpm: 124, key: 2, mode: 0, energy: 0.85, dance: 0.90, intensity: 0.80, genre: "disco" },
  { id: 52, title: "September", artist: "Earth Wind & Fire", bpm: 125, key: 9, mode: 1, energy: 0.86, dance: 0.91, intensity: 0.82, genre: "disco" },
  { id: 53, title: "You Make Me Feel", artist: "Sylvester", bpm: 124, key: 9, mode: 1, energy: 0.84, dance: 0.90, intensity: 0.78, genre: "disco" },
  { id: 54, title: "He's the Greatest Dancer", artist: "Sister Sledge", bpm: 116, key: 2, mode: 1, energy: 0.78, dance: 0.88, intensity: 0.72, genre: "disco" },
  { id: 55, title: "Never Can Say Goodbye", artist: "Gloria Gaynor", bpm: 118, key: 4, mode: 0, energy: 0.78, dance: 0.86, intensity: 0.72, genre: "disco" },

  // ── FUNK
  { id: 56, title: "Give Up the Funk", artist: "Parliament", bpm: 107, key: 10, mode: 1, energy: 0.85, dance: 0.90, intensity: 0.82, genre: "funk" },
  { id: 57, title: "Flash Light", artist: "Parliament", bpm: 104, key: 5, mode: 0, energy: 0.82, dance: 0.88, intensity: 0.78, genre: "funk" },
  { id: 58, title: "Superstition", artist: "Stevie Wonder", bpm: 100, key: 3, mode: 0, energy: 0.83, dance: 0.86, intensity: 0.80, genre: "funk" },
  { id: 59, title: "Higher Ground", artist: "Stevie Wonder", bpm: 138, key: 5, mode: 0, energy: 0.88, dance: 0.85, intensity: 0.84, genre: "funk" },
  { id: 60, title: "Got to Give It Up", artist: "Marvin Gaye", bpm: 119, key: 9, mode: 1, energy: 0.73, dance: 0.87, intensity: 0.67, genre: "soul" },
  { id: 61, title: "Jungle Boogie", artist: "Kool & The Gang", bpm: 108, key: 2, mode: 0, energy: 0.84, dance: 0.88, intensity: 0.80, genre: "funk" },
  { id: 62, title: "Funky Drummer", artist: "James Brown", bpm: 98, key: 7, mode: 0, energy: 0.82, dance: 0.85, intensity: 0.78, genre: "funk" },
  { id: 63, title: "Sex Machine", artist: "James Brown", bpm: 112, key: 2, mode: 0, energy: 0.88, dance: 0.88, intensity: 0.84, genre: "funk" },
  { id: 64, title: "Cold Sweat", artist: "James Brown", bpm: 118, key: 4, mode: 0, energy: 0.86, dance: 0.86, intensity: 0.82, genre: "funk" },
  { id: 65, title: "Impeach the President", artist: "The Honey Drippers", bpm: 102, key: 7, mode: 1, energy: 0.75, dance: 0.80, intensity: 0.70, genre: "breaks" },
  { id: 66, title: "Think (About It)", artist: "Lyn Collins", bpm: 109, key: 0, mode: 1, energy: 0.80, dance: 0.82, intensity: 0.75, genre: "breaks" },
  { id: 67, title: "Let's Groove", artist: "Earth Wind & Fire", bpm: 109, key: 4, mode: 0, energy: 0.80, dance: 0.89, intensity: 0.75, genre: "funk" },

  // ── SOUL / NEO-SOUL
  { id: 68, title: "Brown Sugar", artist: "D'Angelo", bpm: 90, key: 2, mode: 1, energy: 0.60, dance: 0.75, intensity: 0.55, genre: "neo-soul" },
  { id: 69, title: "Bag Lady", artist: "Erykah Badu", bpm: 78, key: 7, mode: 0, energy: 0.45, dance: 0.55, intensity: 0.42, genre: "neo-soul" },
  { id: 70, title: "On & On", artist: "Erykah Badu", bpm: 94, key: 2, mode: 0, energy: 0.55, dance: 0.65, intensity: 0.50, genre: "neo-soul" },
  { id: 71, title: "A Long Walk", artist: "Jill Scott", bpm: 86, key: 5, mode: 1, energy: 0.50, dance: 0.60, intensity: 0.45, genre: "neo-soul" },
  { id: 72, title: "Are You That Somebody", artist: "Aaliyah", bpm: 93, key: 1, mode: 0, energy: 0.65, dance: 0.82, intensity: 0.60, genre: "rnb" },
  { id: 73, title: "Try Again", artist: "Aaliyah", bpm: 97, key: 9, mode: 0, energy: 0.68, dance: 0.84, intensity: 0.62, genre: "rnb" },
  { id: 74, title: "No Scrubs", artist: "TLC", bpm: 96, key: 3, mode: 0, energy: 0.68, dance: 0.80, intensity: 0.62, genre: "rnb" },
  { id: 75, title: "Mercy Mercy Me", artist: "Marvin Gaye", bpm: 82, key: 5, mode: 1, energy: 0.52, dance: 0.64, intensity: 0.46, genre: "soul" },
  { id: 76, title: "Electric Relaxation", artist: "A Tribe Called Quest", bpm: 93, key: 9, mode: 0, energy: 0.62, dance: 0.75, intensity: 0.56, genre: "hip-hop" },
  { id: 77, title: "Can I Kick It", artist: "A Tribe Called Quest", bpm: 97, key: 5, mode: 0, energy: 0.64, dance: 0.76, intensity: 0.58, genre: "hip-hop" },

  // ── JAZZ / JAZZ-FUNK
  { id: 78, title: "So What", artist: "Miles Davis", bpm: 138, key: 2, mode: 0, energy: 0.55, dance: 0.45, intensity: 0.60, genre: "jazz" },
  { id: 79, title: "Chameleon", artist: "Herbie Hancock", bpm: 98, key: 10, mode: 0, energy: 0.72, dance: 0.78, intensity: 0.68, genre: "jazz-funk" },
  { id: 80, title: "Watermelon Man", artist: "Herbie Hancock", bpm: 160, key: 5, mode: 1, energy: 0.75, dance: 0.72, intensity: 0.70, genre: "jazz" },
  { id: 81, title: "Maiden Voyage", artist: "Herbie Hancock", bpm: 88, key: 2, mode: 1, energy: 0.40, dance: 0.38, intensity: 0.35, genre: "jazz" },
  { id: 82, title: "Cantaloupe Island", artist: "Herbie Hancock", bpm: 116, key: 5, mode: 0, energy: 0.58, dance: 0.62, intensity: 0.54, genre: "jazz" },
  { id: 83, title: "Birdland", artist: "Weather Report", bpm: 140, key: 10, mode: 1, energy: 0.82, dance: 0.70, intensity: 0.78, genre: "jazz-fusion" },
  { id: 84, title: "Everybody Loves the Sunshine", artist: "Roy Ayers", bpm: 88, key: 2, mode: 1, energy: 0.55, dance: 0.65, intensity: 0.50, genre: "jazz-funk" },
  { id: 85, title: "People Make the World Go Round", artist: "Roy Ayers", bpm: 96, key: 7, mode: 0, energy: 0.62, dance: 0.72, intensity: 0.58, genre: "jazz-funk" },
  { id: 86, title: "Searchin", artist: "Roy Ayers", bpm: 104, key: 9, mode: 0, energy: 0.65, dance: 0.74, intensity: 0.60, genre: "jazz-funk" },
  { id: 87, title: "Actual Proof", artist: "Herbie Hancock", bpm: 132, key: 2, mode: 0, energy: 0.78, dance: 0.70, intensity: 0.75, genre: "jazz-funk" },

  // ── AFROBEAT
  { id: 88, title: "Lady", artist: "Fela Kuti", bpm: 104, key: 7, mode: 0, energy: 0.75, dance: 0.82, intensity: 0.70, genre: "afrobeat" },
  { id: 89, title: "Zombie", artist: "Fela Kuti", bpm: 110, key: 2, mode: 0, energy: 0.80, dance: 0.84, intensity: 0.76, genre: "afrobeat" },
  { id: 90, title: "Water No Get Enemy", artist: "Fela Kuti", bpm: 108, key: 5, mode: 0, energy: 0.78, dance: 0.82, intensity: 0.74, genre: "afrobeat" },
  { id: 91, title: "Soul Makossa", artist: "Manu Dibango", bpm: 118, key: 4, mode: 0, energy: 0.74, dance: 0.86, intensity: 0.68, genre: "afro" },
  { id: 92, title: "Pata Pata", artist: "Miriam Makeba", bpm: 118, key: 7, mode: 1, energy: 0.72, dance: 0.88, intensity: 0.65, genre: "afro" },
  { id: 93, title: "Oye Como Va", artist: "Santana", bpm: 122, key: 9, mode: 0, energy: 0.75, dance: 0.85, intensity: 0.70, genre: "latin" },
  { id: 94, title: "Conga", artist: "Miami Sound Machine", bpm: 120, key: 0, mode: 1, energy: 0.80, dance: 0.92, intensity: 0.75, genre: "latin" },

  // ── ELECTRONIC
  { id: 95, title: "Windowlicker", artist: "Aphex Twin", bpm: 136, key: 9, mode: 0, energy: 0.82, dance: 0.75, intensity: 0.80, genre: "electronic" },
  { id: 96, title: "Porcelain", artist: "Moby", bpm: 98, key: 7, mode: 0, energy: 0.48, dance: 0.55, intensity: 0.42, genre: "ambient" },
  { id: 97, title: "Natural Blues", artist: "Moby", bpm: 122, key: 9, mode: 0, energy: 0.72, dance: 0.80, intensity: 0.66, genre: "electronic" },
  { id: 98, title: "Go", artist: "Moby", bpm: 130, key: 4, mode: 0, energy: 0.86, dance: 0.84, intensity: 0.82, genre: "techno" },
  { id: 99, title: "Trans-Europe Express", artist: "Kraftwerk", bpm: 118, key: 7, mode: 0, energy: 0.62, dance: 0.70, intensity: 0.56, genre: "electronic" },
  { id: 100, title: "Computer Love", artist: "Kraftwerk", bpm: 116, key: 9, mode: 0, energy: 0.60, dance: 0.68, intensity: 0.55, genre: "electronic" },

  // ── ELECTRO / BOOGIE
  { id: 101, title: "Planet Rock", artist: "Afrika Bambaataa", bpm: 127, key: 2, mode: 0, energy: 0.85, dance: 0.86, intensity: 0.82, genre: "electro" },
  { id: 102, title: "Looking for the Perfect Beat", artist: "Afrika Bambaataa", bpm: 124, key: 7, mode: 0, energy: 0.82, dance: 0.84, intensity: 0.78, genre: "electro" },
  { id: 103, title: "Al Naafiysh (The Soul)", artist: "Hashim", bpm: 122, key: 9, mode: 0, energy: 0.80, dance: 0.85, intensity: 0.76, genre: "electro" },
  { id: 104, title: "I.O.U.", artist: "Freeez", bpm: 118, key: 7, mode: 0, energy: 0.76, dance: 0.84, intensity: 0.70, genre: "boogie" },

  // ── TRANCE / BALEARIC
  { id: 105, title: "Children", artist: "Robert Miles", bpm: 136, key: 4, mode: 0, energy: 0.80, dance: 0.80, intensity: 0.76, genre: "trance" },
  { id: 106, title: "Sandstorm", artist: "Darude", bpm: 136, key: 2, mode: 0, energy: 0.90, dance: 0.85, intensity: 0.88, genre: "trance" },
  { id: 107, title: "Age of Love", artist: "Age of Love", bpm: 134, key: 5, mode: 0, energy: 0.86, dance: 0.82, intensity: 0.84, genre: "trance" },
  { id: 108, title: "Sueno Latino", artist: "Sueno Latino", bpm: 118, key: 9, mode: 0, energy: 0.65, dance: 0.74, intensity: 0.58, genre: "balearic" },
  { id: 109, title: "Pacific State", artist: "808 State", bpm: 118, key: 4, mode: 0, energy: 0.62, dance: 0.70, intensity: 0.55, genre: "balearic" },
  { id: 110, title: "Cafe Del Mar", artist: "Jose Padilla", bpm: 76, key: 2, mode: 1, energy: 0.30, dance: 0.40, intensity: 0.25, genre: "balearic" },

  // ── HIP-HOP
  { id: 111, title: "N.Y. State of Mind", artist: "Nas", bpm: 94, key: 2, mode: 0, energy: 0.72, dance: 0.72, intensity: 0.68, genre: "hip-hop" },
  { id: 112, title: "C.R.E.A.M.", artist: "Wu-Tang Clan", bpm: 90, key: 7, mode: 0, energy: 0.68, dance: 0.70, intensity: 0.64, genre: "hip-hop" },
  { id: 113, title: "The World Is Yours", artist: "Nas", bpm: 88, key: 4, mode: 0, energy: 0.65, dance: 0.68, intensity: 0.60, genre: "hip-hop" },
  { id: 114, title: "Award Tour", artist: "A Tribe Called Quest", bpm: 100, key: 2, mode: 0, energy: 0.66, dance: 0.78, intensity: 0.60, genre: "hip-hop" },
  { id: 115, title: "Passin Me By", artist: "The Pharcyde", bpm: 88, key: 7, mode: 0, energy: 0.58, dance: 0.70, intensity: 0.52, genre: "hip-hop" },

  // ── DRUM & BASS
  { id: 116, title: "Inner City Life", artist: "Goldie", bpm: 170, key: 5, mode: 0, energy: 0.85, dance: 0.75, intensity: 0.84, genre: "drum-and-bass" },
  { id: 117, title: "Brown Paper Bag", artist: "Roni Size", bpm: 172, key: 7, mode: 0, energy: 0.88, dance: 0.78, intensity: 0.86, genre: "drum-and-bass" },

  // ── UK GARAGE
  { id: 118, title: "Re-Rewind", artist: "Artful Dodger ft. Craig David", bpm: 130, key: 2, mode: 0, energy: 0.80, dance: 0.88, intensity: 0.74, genre: "uk-garage" },
  { id: 119, title: "Fill Me In", artist: "Craig David", bpm: 128, key: 7, mode: 0, energy: 0.76, dance: 0.86, intensity: 0.70, genre: "uk-garage" },
  { id: 120, title: "Flowers", artist: "Sweet Female Attitude", bpm: 128, key: 9, mode: 0, energy: 0.78, dance: 0.87, intensity: 0.72, genre: "uk-garage" },

  // ── MINIMAL
  { id: 121, title: "Fizheuer Zieheuer", artist: "Ricardo Villalobos", bpm: 130, key: 7, mode: 0, energy: 0.74, dance: 0.78, intensity: 0.70, genre: "minimal" },
  { id: 122, title: "Dexter", artist: "Surgeon", bpm: 135, key: 4, mode: 0, energy: 0.88, dance: 0.82, intensity: 0.86, genre: "techno" },
];

// ─── CAMELOT ──────────────────────────────────────────────────────────────────
const CAMELOT = { 0:{major:"8B",minor:"5A"},1:{major:"3B",minor:"12A"},2:{major:"10B",minor:"7A"},3:{major:"5B",minor:"2A"},4:{major:"12B",minor:"9A"},5:{major:"7B",minor:"4A"},6:{major:"2B",minor:"11A"},7:{major:"9B",minor:"6A"},8:{major:"4B",minor:"1A"},9:{major:"11B",minor:"8A"},10:{major:"6B",minor:"3A"},11:{major:"1B",minor:"10A"} };
const KEY_NAMES = ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
function getCamelot(key,mode){ return CAMELOT[key]?.[mode===0?"minor":"major"]||"?"; }
function camelotDistance(k1,m1,k2,m2){ const c1=getCamelot(k1,m1),c2=getCamelot(k2,m2); if(c1==="?"||c2==="?") return 3; const n1=parseInt(c1),n2=parseInt(c2),t1=c1.slice(-1),t2=c2.slice(-1); if(t1!==t2) return Math.min(Math.abs(n1-n2),12-Math.abs(n1-n2))+1; return Math.min(Math.abs(n1-n2),12-Math.abs(n1-n2)); }

// ─── SCORING ──────────────────────────────────────────────────────────────────
function scoreTrack(current, candidate, intention, tolerance) {
  const isSafe = tolerance === "safe";
  const bpmDiff = Math.abs(candidate.bpm - current.bpm);
  const keyDist = camelotDistance(current.key, current.mode, candidate.key, candidate.mode);
  if (isSafe && bpmDiff > 6) return null;
  if (isSafe && keyDist > 2) return null;
  let score = 100;
  score -= Math.min(Math.pow(bpmDiff / (isSafe ? 4 : 10), 1.2) * 30, isSafe ? 60 : 40);
  score -= keyDist * (isSafe ? 14 : 8);
  if (candidate.mode === current.mode) score += 4;
  const eD = candidate.energy - current.energy;
  const dD = candidate.dance - current.dance;
  const iD = candidate.intensity - current.intensity;
  if (intention === "stable") {
    score -= Math.abs(eD)*45; score -= Math.abs(iD)*35; score -= Math.abs(dD)*20;
    if (bpmDiff<=2) score+=18; if (keyDist===0) score+=12;
  } else if (intention === "up") {
    score += eD>0?eD*48:eD*38; score += iD>0?iD*32:iD*26; score += dD>0?dD*14:dD*6;
    if (candidate.bpm>current.bpm&&bpmDiff<=8) score+=10;
    if (candidate.bpm<current.bpm) score-=bpmDiff*1.5;
    if (candidate.energy<current.energy-0.08) score-=25;
  } else if (intention === "down") {
    score += eD<0?Math.abs(eD)*48:-eD*38; score += iD<0?Math.abs(iD)*32:-iD*26; score += dD<0?Math.abs(dD)*10:-dD*8;
    if (candidate.bpm<current.bpm&&bpmDiff<=8) score+=10;
    if (candidate.bpm>current.bpm) score-=bpmDiff*1.5;
    if (candidate.energy>current.energy+0.08) score-=25;
  }
  if (!isSafe&&keyDist>=3) score+=12;
  const totalD=(eD+iD)/2;
  let label;
  if (keyDist===0&&bpmDiff<=2) label="transition parfaite";
  else if (keyDist<=1&&intention==="stable") label="continuité stable";
  else if (intention==="up"&&totalD>0.12) label="monte bien";
  else if (intention==="up"&&totalD>0.04) label="monte légèrement";
  else if (intention==="down"&&totalD<-0.12) label="redescente propre";
  else if (intention==="down"&&totalD<-0.04) label="redescend légèrement";
  else if (keyDist>=3) label="bifurcation assumée";
  else if (keyDist<=1) label="très compatible";
  else label="compatible";
  return { ...candidate, score:Math.max(0,score), label, bpmDiff, keyDist, eD, iD };
}

function getLabelStyle(label) {
  if (label==="transition parfaite") return ["#1a3825","#4caf74"];
  if (label==="très compatible") return ["#1a2e10","#7bc34a"];
  if (label==="continuité stable") return ["#1a1a10","#a0a060"];
  if (label==="monte bien") return ["#2a1800","#e08830"];
  if (label==="monte légèrement") return ["#201800","#c9a84c"];
  if (label==="redescente propre") return ["#0d1a22","#4a9cc0"];
  if (label==="redescend légèrement") return ["#0a1520","#3a7a9a"];
  if (label==="bifurcation assumée") return ["#2a1510","#e0673a"];
  return ["#1a1a1a","#666"];
}

// ─── PKCE AUTH ────────────────────────────────────────────────────────────────
async function generateCodeVerifier(){ const a=new Uint32Array(56); crypto.getRandomValues(a); return Array.from(a,d=>d.toString(36)).join("").slice(0,128); }
async function generateCodeChallenge(v){ const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v)); return btoa(String.fromCharCode(...new Uint8Array(d))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,""); }
async function redirectToSpotify(){ const v=await generateCodeVerifier(),c=await generateCodeChallenge(v); localStorage.setItem("pkce_verifier",v); window.location=`https://accounts.spotify.com/authorize?${new URLSearchParams({client_id:CLIENT_ID,response_type:"code",redirect_uri:REDIRECT_URI,scope:SCOPES,code_challenge_method:"S256",code_challenge:c})}`; }
async function exchangeToken(code){ const v=localStorage.getItem("pkce_verifier"); const r=await fetch("https://accounts.spotify.com/api/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:CLIENT_ID,grant_type:"authorization_code",code,redirect_uri:REDIRECT_URI,code_verifier:v})}); const d=await r.json(); if(d.access_token){localStorage.setItem("spotify_token",d.access_token);localStorage.setItem("spotify_refresh",d.refresh_token);localStorage.setItem("spotify_expires",Date.now()+d.expires_in*1000);} return d.access_token; }
async function refreshAccessToken(){ const rf=localStorage.getItem("spotify_refresh"); if(!rf) return null; const r=await fetch("https://accounts.spotify.com/api/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:CLIENT_ID,grant_type:"refresh_token",refresh_token:rf})}); const d=await r.json(); if(d.access_token){localStorage.setItem("spotify_token",d.access_token);localStorage.setItem("spotify_expires",Date.now()+d.expires_in*1000);return d.access_token;} return null; }
async function getToken(){ const e=parseInt(localStorage.getItem("spotify_expires")||"0"); if(Date.now()>e-60000) return await refreshAccessToken(); return localStorage.getItem("spotify_token"); }

function EnergyDot({value}){ const f=Math.round((value||0)*5); return <span style={{letterSpacing:2}}>{Array.from({length:5},(_,i)=><span key={i} style={{color:i<f?"#c9a84c":"#2a2a2a",fontSize:8}}>●</span>)}</span>; }

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function Temper() {
  const [token, setToken] = useState(null);
  const [spotifyTrack, setSpotifyTrack] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [intention, setIntention] = useState("stable");
  const [tolerance, setTolerance] = useState("safe");
  const [suggestions, setSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [animKey, setAnimKey] = useState(0);
  const [addedId, setAddedId] = useState(null);
  const searchTimeout = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) { exchangeToken(code).then(t => { setToken(t); window.history.replaceState({}, "", "/"); }); }
    else { const t = localStorage.getItem("spotify_token"); if (t) setToken(t); }
  }, []);

  useEffect(() => {
    if (!token) return;
    const poll = async () => {
      const t = await getToken(); if (!t) return;
      try {
        const r = await fetch("https://api.spotify.com/v1/me/player/currently-playing", { headers: { Authorization: `Bearer ${t}` } });
        if (r.status === 200) { const d = await r.json(); if (d?.item) setSpotifyTrack(d.item); }
      } catch(e) {}
    };
    poll();
    const iv = setInterval(poll, 5000);
    return () => clearInterval(iv);
  }, [token]);

  useEffect(() => {
    clearTimeout(searchTimeout.current);
    if (!searchQuery || searchQuery.length < 2) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(() => {
      const q = searchQuery.toLowerCase();
      setSearchResults(TRACKS.filter(t => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)).slice(0, 7));
    }, 200);
  }, [searchQuery]);

  useEffect(() => {
    if (!currentTrack) return;
    const scored = TRACKS.filter(t => t.id !== currentTrack.id).map(t => scoreTrack(currentTrack, t, intention, tolerance)).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 8);
    setSuggestions(scored);
    setAnimKey(k => k + 1);
  }, [currentTrack, intention, tolerance]);

  const selectTrack = (track) => { setCurrentTrack(track); setSearchQuery(""); setSearchResults([]); };

  const addToQueue = async (track) => {
    const t = await getToken(); if (!t) return;
    try {
      const r = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(track.title+" "+track.artist)}&type=track&limit=1`, { headers: { Authorization: `Bearer ${t}` } });
      const d = await r.json();
      const uri = d?.tracks?.items?.[0]?.uri;
      if (uri) {
        await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(uri)}`, { method: "POST", headers: { Authorization: `Bearer ${t}` } });
        setAddedId(track.id); setTimeout(() => setAddedId(null), 2000);
      }
    } catch(e) {}
  };

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"#e8e4dc",fontFamily:"'DM Mono','Courier New',monospace",display:"flex",flexDirection:"column",alignItems:"center",padding:"0 0 60px"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;1,400&display=swap');
        :root{--gold:#c9a84c;--gold-dim:#6b5a2a;--surface:#111;--surface2:#161616;--border:#222;--dim:#555;}
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:var(--gold-dim);border-radius:2px;}
        .bi{flex:1;padding:10px 6px;background:var(--surface);border:1px solid var(--border);border-radius:3px;color:var(--dim);cursor:pointer;font-family:inherit;font-size:11px;letter-spacing:.08em;transition:all .15s;text-align:center;}
        .bi:hover{border-color:var(--gold-dim);color:#e8e4dc;}.bi.on{border-color:var(--gold);color:var(--gold);background:#161200;}
        .bt{flex:1;padding:9px 6px;background:var(--surface);border:1px solid var(--border);border-radius:3px;color:var(--dim);cursor:pointer;font-family:inherit;font-size:10px;letter-spacing:.1em;transition:all .15s;text-align:center;}
        .bt.safe.on{border-color:#2e7d50;color:#4caf74;background:#0a1a10;}.bt.aud.on{border-color:#8b3a2a;color:#e0673a;background:#1a0d0a;}
        .tc{background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:12px 14px;cursor:pointer;transition:all .2s;}
        .tc:hover{border-color:var(--gold-dim);background:#141414;}
        @keyframes fs{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .si{animation:fs .3s ease both;}
        .lb{font-size:9px;letter-spacing:.12em;text-transform:uppercase;padding:2px 7px;border-radius:2px;border:1px solid;white-space:nowrap;}
        .si-inp{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:3px;color:#e8e4dc;font-family:inherit;font-size:13px;padding:10px 14px;outline:none;transition:border-color .2s;}
        .si-inp:focus{border-color:var(--gold-dim);}.si-inp::placeholder{color:var(--dim);}
        .qb{background:none;border:1px solid var(--border);color:var(--dim);border-radius:3px;font-family:inherit;font-size:9px;letter-spacing:.1em;padding:3px 8px;cursor:pointer;transition:all .15s;white-space:nowrap;}
        .qb:hover{border-color:var(--gold-dim);color:var(--gold);}.qb.done{border-color:#4caf74;color:#4caf74;}
        .lb-btn{background:none;border:1px solid var(--gold-dim);color:var(--gold);border-radius:3px;font-family:inherit;font-size:12px;letter-spacing:.12em;padding:12px 28px;cursor:pointer;transition:all .2s;}
        .lb-btn:hover{background:#161200;border-color:var(--gold);}
        .sri{padding:9px 14px;cursor:pointer;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;font-size:12px;transition:background .15s;}
        .sri:hover{background:#161616;}.sri:last-child{border-bottom:none;}
      `}</style>

      <div style={{width:"100%",maxWidth:460,padding:"28px 20px 0"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:2}}>
          <span style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:26,color:"var(--gold)"}}>Temper</span>
          <span style={{fontSize:10,color:"var(--dim)",letterSpacing:"0.15em",textTransform:"uppercase"}}>DJ Navigator</span>
        </div>
        <div style={{height:1,background:"linear-gradient(to right,var(--gold-dim),transparent)",marginBottom:24}}/>

        {!token && (
          <div style={{textAlign:"center",padding:"60px 20px"}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:"#e8e4dc",marginBottom:8}}>Connecte-toi à Spotify</div>
            <div style={{fontSize:11,color:"var(--dim)",marginBottom:28,lineHeight:1.6}}>Temper détecte le morceau en cours<br/>et t'aide à naviguer dans ta soirée.</div>
            <button className="lb-btn" onClick={redirectToSpotify}>CONNEXION SPOTIFY</button>
          </div>
        )}

        {token && (<>
          {/* Spotify banner */}
          {spotifyTrack && (
            <div style={{background:"#0d1a0d",border:"1px solid #1a3020",borderRadius:4,padding:"10px 14px",marginBottom:14,display:"flex",gap:10,alignItems:"center"}}>
              {spotifyTrack.album?.images?.[2]?.url && <img src={spotifyTrack.album.images[2].url} alt="" style={{width:36,height:36,borderRadius:2}}/>}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:10,color:"#4caf74",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:2}}>● Spotify en cours</div>
                <div style={{fontSize:12,color:"#e8e4dc",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{spotifyTrack.name} — {spotifyTrack.artists?.map(a=>a.name).join(", ")}</div>
              </div>
            </div>
          )}

          {/* Search */}
          <div style={{marginBottom:18}}>
            <div style={{fontSize:9,letterSpacing:"0.18em",color:"var(--dim)",textTransform:"uppercase",marginBottom:8}}>Morceau de départ</div>
            <input className="si-inp" placeholder="Chercher dans la base — titre, artiste..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
            {searchResults.length>0 && (
              <div style={{marginTop:6,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:4,overflow:"hidden"}}>
                {searchResults.map(t=>(
                  <div key={t.id} className="sri" onClick={()=>selectTrack(t)}>
                    <div><div style={{color:"#e8e4dc"}}>{t.title}</div><div style={{color:"var(--dim)",fontSize:10}}>{t.artist} · {t.genre}</div></div>
                    <div style={{fontSize:10,color:"var(--dim)",textAlign:"right"}}><div>{Math.round(t.bpm)} bpm</div><div>{KEY_NAMES[t.key]} {t.mode===0?"min":"maj"}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current track */}
          {currentTrack && (
            <div style={{marginBottom:20}}>
              <div style={{fontSize:9,letterSpacing:"0.18em",color:"var(--dim)",textTransform:"uppercase",marginBottom:8}}>En cours</div>
              <div style={{background:"var(--surface)",border:"1px solid var(--gold-dim)",borderRadius:4,padding:"14px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div>
                    <div style={{fontSize:15,fontFamily:"'Playfair Display',serif",color:"#f0ece0",marginBottom:2}}>{currentTrack.title}</div>
                    <div style={{fontSize:11,color:"var(--dim)"}}>{currentTrack.artist}</div>
                    <div style={{fontSize:10,color:"var(--gold-dim)",marginTop:2}}>{currentTrack.genre}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:20,color:"var(--gold)",fontWeight:500}}>{Math.round(currentTrack.bpm)}</div>
                    <div style={{fontSize:9,color:"var(--dim)"}}>BPM</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:14,fontSize:10,flexWrap:"wrap"}}>
                  <span style={{color:"var(--dim)"}}>
                    <span style={{color:"#e8e4dc",background:"#1a1a1a",padding:"1px 6px",borderRadius:2,border:"1px solid #2a2a2a",marginRight:6}}>{KEY_NAMES[currentTrack.key]} {currentTrack.mode===0?"min":"maj"}</span>
                    <span style={{color:"var(--gold-dim)"}}>{getCamelot(currentTrack.key,currentTrack.mode)}</span>
                  </span>
                  <span style={{color:"var(--dim)"}}>Énergie <EnergyDot value={currentTrack.energy}/></span>
                </div>
              </div>
            </div>
          )}

          {/* Direction */}
          <div style={{marginBottom:10}}>
            <div style={{fontSize:9,letterSpacing:"0.18em",color:"var(--dim)",textTransform:"uppercase",marginBottom:8}}>Direction</div>
            <div style={{display:"flex",gap:6}}>
              {[{k:"stable",i:"▬",l:"Stable"},{k:"up",i:"▲",l:"Monter"},{k:"down",i:"▼",l:"Descendre"}].map(c=>(
                <button key={c.k} className={`bi ${intention===c.k?"on":""}`} onClick={()=>setIntention(c.k)}>
                  <div style={{fontSize:14,marginBottom:2}}>{c.i}</div><div>{c.l}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tolerance */}
          <div style={{marginBottom:22}}>
            <div style={{display:"flex",gap:6}}>
              <button className={`bt safe ${tolerance==="safe"?"on":""}`} onClick={()=>setTolerance("safe")}>⬡ Safe</button>
              <button className={`bt aud ${tolerance==="audacious"?"on":""}`} onClick={()=>setTolerance("audacious")}>◈ Audacieux</button>
            </div>
          </div>

          <div style={{height:1,background:"linear-gradient(to right,transparent,var(--border),transparent)",marginBottom:18}}/>

          {/* Suggestions */}
          {!currentTrack && <div style={{textAlign:"center",padding:"30px 0",color:"var(--dim)",fontSize:11}}>Cherche un morceau de départ ci-dessus.</div>}

          {currentTrack && (
            <div>
              <div style={{fontSize:9,letterSpacing:"0.18em",color:"var(--dim)",textTransform:"uppercase",marginBottom:12}}>Suggestions — {suggestions.length}</div>
              <div style={{display:"flex",flexDirection:"column",gap:7}} key={animKey}>
                {suggestions.map((t,i)=>{
                  const [bg,fg]=getLabelStyle(t.label);
                  const bs=t.bpm>currentTrack.bpm?"+":(t.bpm<currentTrack.bpm?"−":"=");
                  const bd=t.bpmDiff===0?"=":`${bs}${Math.round(t.bpmDiff)}`;
                  const ea=t.eD>0.02?"↑":t.eD<-0.02?"↓":"→";
                  const done=addedId===t.id;
                  return (
                    <div key={t.id} className="tc si" style={{animationDelay:`${i*0.04}s`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,color:"#e8e4dc",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.title}</div>
                          <div style={{fontSize:10,color:"var(--dim)"}}>{t.artist} · <span style={{color:"var(--gold-dim)"}}>{t.genre}</span></div>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5,marginLeft:10,flexShrink:0}}>
                          <span className="lb" style={{borderColor:fg+"55",color:fg,background:bg}}>{t.label}</span>
                          <button className={`qb ${done?"done":""}`} onClick={()=>addToQueue(t)}>{done?"✓ AJOUTÉ":"+ FILE"}</button>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:14,fontSize:10,flexWrap:"wrap"}}>
                        <span style={{color:"var(--dim)"}}><span style={{color:"#e8e4dc"}}>{Math.round(t.bpm)}</span> bpm <span style={{color:t.bpmDiff<2?"var(--dim)":"var(--gold)",marginLeft:2}}>({bd})</span></span>
                        <span style={{color:"var(--dim)"}}>{KEY_NAMES[t.key]} {t.mode===0?"min":"maj"} <span style={{color:"var(--gold-dim)",marginLeft:4}}>{getCamelot(t.key,t.mode)}</span></span>
                        <span style={{color:t.eD>0.02?"#e0673a":t.eD<-0.02?"#4a9cc0":"var(--dim)"}}>énergie {ea}</span>
                      </div>
                      <div style={{marginTop:8,background:"#0f0f0f",borderRadius:2,overflow:"hidden",height:2}}>
                        <div style={{height:"100%",width:`${Math.min(100,Math.max(5,t.score))}%`,background:"var(--gold)",borderRadius:2,transition:"width .4s ease"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{marginTop:30,textAlign:"center",fontSize:9,color:"#2a2a2a",letterSpacing:"0.15em",textTransform:"uppercase"}}>
            Temper · {TRACKS.length} morceaux · Spotify Auth
          </div>
        </>)}
      </div>
    </div>
  );
}
