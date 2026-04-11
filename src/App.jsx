import { useState, useEffect, useRef } from "react";
import { getOrCreateUser, startSession, saveInteraction } from "./db.js";

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = "https://temper-lyart.vercel.app/callback";
const SCOPES = ["user-read-currently-playing","user-read-playback-state","user-modify-playback-state"].join(" ");

const TRACKS = [
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
  { id: 27, title: "Within", artist: "Daft Punk", bpm: 88, key: 0, mode: 1, energy: 0.28, dance: 0.32, intensity: 0.22, genre: "ambient" },
  { id: 28, title: "Strings of Life", artist: "Rhythim Is Rhythim", bpm: 130, key: 0, mode: 0, energy: 0.91, dance: 0.88, intensity: 0.90, genre: "techno" },
  { id: 29, title: "Energy Flash", artist: "Joey Beltram", bpm: 135, key: 5, mode: 0, energy: 0.95, dance: 0.85, intensity: 0.96, genre: "techno" },
  { id: 30, title: "Clear", artist: "Cybotron", bpm: 125, key: 7, mode: 0, energy: 0.84, dance: 0.83, intensity: 0.82, genre: "techno" },
  { id: 31, title: "Spastik", artist: "Plastikman", bpm: 132, key: 0, mode: 0, energy: 0.90, dance: 0.84, intensity: 0.92, genre: "techno" },
  { id: 32, title: "Mentasm", artist: "Second Phase", bpm: 138, key: 5, mode: 0, energy: 0.97, dance: 0.82, intensity: 0.97, genre: "techno" },
  { id: 33, title: "Freefall", artist: "Juan Atkins", bpm: 127, key: 9, mode: 0, energy: 0.83, dance: 0.87, intensity: 0.80, genre: "techno" },
  { id: 34, title: "Nude Photo", artist: "Rhythm Is Rhythm", bpm: 128, key: 2, mode: 0, energy: 0.88, dance: 0.86, intensity: 0.87, genre: "techno" },
  { id: 35, title: "No UFOs", artist: "Model 500", bpm: 124, key: 4, mode: 0, energy: 0.80, dance: 0.84, intensity: 0.78, genre: "techno" },
  { id: 36, title: "Innovator", artist: "Derrick May", bpm: 130, key: 9, mode: 0, energy: 0.86, dance: 0.85, intensity: 0.84, genre: "techno" },
  { id: 37, title: "The Vision", artist: "Underground Resistance", bpm: 136, key: 5, mode: 0, energy: 0.94, dance: 0.82, intensity: 0.93, genre: "techno" },
  { id: 38, title: "Reese", artist: "Kevin Saunderson", bpm: 131, key: 7, mode: 0, energy: 0.90, dance: 0.85, intensity: 0.89, genre: "techno" },
  { id: 39, title: "Stars", artist: "Model 500", bpm: 114, key: 7, mode: 0, energy: 0.55, dance: 0.68, intensity: 0.48, genre: "deep-house" },
  { id: 40, title: "Washing Machine", artist: "Mystic Jungle", bpm: 108, key: 9, mode: 0, energy: 0.40, dance: 0.55, intensity: 0.35, genre: "deep-house" },
  { id: 41, title: "Aftermath", artist: "Nightmares on Wax", bpm: 104, key: 9, mode: 0, energy: 0.48, dance: 0.62, intensity: 0.42, genre: "deep-house" },
  { id: 42, title: "Smokers Delight", artist: "Nightmares on Wax", bpm: 98, key: 5, mode: 0, energy: 0.42, dance: 0.58, intensity: 0.38, genre: "deep-house" },
  { id: 43, title: "Spellbound", artist: "Leftfield", bpm: 120, key: 2, mode: 0, energy: 0.72, dance: 0.78, intensity: 0.68, genre: "deep-house" },
  { id: 44, title: "Release The Pressure", artist: "Leftfield", bpm: 112, key: 4, mode: 0, energy: 0.60, dance: 0.70, intensity: 0.56, genre: "deep-house" },
  { id: 45, title: "Le Freak", artist: "Chic", bpm: 120, key: 9, mode: 0, energy: 0.76, dance: 0.90, intensity: 0.70, genre: "disco" },
  { id: 46, title: "Good Times", artist: "Chic", bpm: 111, key: 4, mode: 1, energy: 0.70, dance: 0.88, intensity: 0.65, genre: "disco" },
  { id: 47, title: "I Will Survive", artist: "Gloria Gaynor", bpm: 117, key: 9, mode: 0, energy: 0.80, dance: 0.88, intensity: 0.75, genre: "disco" },
  { id: 48, title: "I Feel Love", artist: "Donna Summer", bpm: 122, key: 6, mode: 0, energy: 0.79, dance: 0.88, intensity: 0.72, genre: "electronic-soul" },
  { id: 49, title: "Ring My Bell", artist: "Anita Ward", bpm: 117, key: 0, mode: 1, energy: 0.74, dance: 0.85, intensity: 0.68, genre: "disco" },
  { id: 50, title: "Boogie Wonderland", artist: "Earth Wind & Fire", bpm: 124, key: 2, mode: 0, energy: 0.85, dance: 0.90, intensity: 0.80, genre: "disco" },
  { id: 51, title: "September", artist: "Earth Wind & Fire", bpm: 125, key: 9, mode: 1, energy: 0.86, dance: 0.91, intensity: 0.82, genre: "disco" },
  { id: 52, title: "You Make Me Feel", artist: "Sylvester", bpm: 124, key: 9, mode: 1, energy: 0.84, dance: 0.90, intensity: 0.78, genre: "disco" },
  { id: 53, title: "He's the Greatest Dancer", artist: "Sister Sledge", bpm: 116, key: 2, mode: 1, energy: 0.78, dance: 0.88, intensity: 0.72, genre: "disco" },
  { id: 54, title: "Never Can Say Goodbye", artist: "Gloria Gaynor", bpm: 118, key: 4, mode: 0, energy: 0.78, dance: 0.86, intensity: 0.72, genre: "disco" },
  { id: 55, title: "Got to Be Real", artist: "Cheryl Lynn", bpm: 115, key: 7, mode: 1, energy: 0.76, dance: 0.87, intensity: 0.70, genre: "disco" },
  { id: 56, title: "Ain't Nobody", artist: "Chaka Khan", bpm: 100, key: 2, mode: 0, energy: 0.72, dance: 0.85, intensity: 0.66, genre: "disco" },
  { id: 57, title: "Give Up the Funk", artist: "Parliament", bpm: 107, key: 10, mode: 1, energy: 0.85, dance: 0.90, intensity: 0.82, genre: "funk" },
  { id: 58, title: "Flash Light", artist: "Parliament", bpm: 104, key: 5, mode: 0, energy: 0.82, dance: 0.88, intensity: 0.78, genre: "funk" },
  { id: 59, title: "Superstition", artist: "Stevie Wonder", bpm: 100, key: 3, mode: 0, energy: 0.83, dance: 0.86, intensity: 0.80, genre: "funk" },
  { id: 60, title: "Higher Ground", artist: "Stevie Wonder", bpm: 138, key: 5, mode: 0, energy: 0.88, dance: 0.85, intensity: 0.84, genre: "funk" },
  { id: 61, title: "Got to Give It Up", artist: "Marvin Gaye", bpm: 119, key: 9, mode: 1, energy: 0.73, dance: 0.87, intensity: 0.67, genre: "soul" },
  { id: 62, title: "Jungle Boogie", artist: "Kool & The Gang", bpm: 108, key: 2, mode: 0, energy: 0.84, dance: 0.88, intensity: 0.80, genre: "funk" },
  { id: 63, title: "Funky Drummer", artist: "James Brown", bpm: 98, key: 7, mode: 0, energy: 0.82, dance: 0.85, intensity: 0.78, genre: "funk" },
  { id: 64, title: "Sex Machine", artist: "James Brown", bpm: 112, key: 2, mode: 0, energy: 0.88, dance: 0.88, intensity: 0.84, genre: "funk" },
  { id: 65, title: "Cold Sweat", artist: "James Brown", bpm: 118, key: 4, mode: 0, energy: 0.86, dance: 0.86, intensity: 0.82, genre: "funk" },
  { id: 66, title: "Impeach the President", artist: "The Honey Drippers", bpm: 102, key: 7, mode: 1, energy: 0.75, dance: 0.80, intensity: 0.70, genre: "breaks" },
  { id: 67, title: "Think (About It)", artist: "Lyn Collins", bpm: 109, key: 0, mode: 1, energy: 0.80, dance: 0.82, intensity: 0.75, genre: "breaks" },
  { id: 68, title: "Let's Groove", artist: "Earth Wind & Fire", bpm: 109, key: 4, mode: 0, energy: 0.80, dance: 0.89, intensity: 0.75, genre: "funk" },
  { id: 69, title: "Brown Sugar", artist: "D'Angelo", bpm: 90, key: 2, mode: 1, energy: 0.60, dance: 0.75, intensity: 0.55, genre: "neo-soul" },
  { id: 70, title: "Bag Lady", artist: "Erykah Badu", bpm: 78, key: 7, mode: 0, energy: 0.45, dance: 0.55, intensity: 0.42, genre: "neo-soul" },
  { id: 71, title: "On & On", artist: "Erykah Badu", bpm: 94, key: 2, mode: 0, energy: 0.55, dance: 0.65, intensity: 0.50, genre: "neo-soul" },
  { id: 72, title: "A Long Walk", artist: "Jill Scott", bpm: 86, key: 5, mode: 1, energy: 0.50, dance: 0.60, intensity: 0.45, genre: "neo-soul" },
  { id: 73, title: "Are You That Somebody", artist: "Aaliyah", bpm: 93, key: 1, mode: 0, energy: 0.65, dance: 0.82, intensity: 0.60, genre: "rnb" },
  { id: 74, title: "Try Again", artist: "Aaliyah", bpm: 97, key: 9, mode: 0, energy: 0.68, dance: 0.84, intensity: 0.62, genre: "rnb" },
  { id: 75, title: "No Scrubs", artist: "TLC", bpm: 96, key: 3, mode: 0, energy: 0.68, dance: 0.80, intensity: 0.62, genre: "rnb" },
  { id: 76, title: "Mercy Mercy Me", artist: "Marvin Gaye", bpm: 82, key: 5, mode: 1, energy: 0.52, dance: 0.64, intensity: 0.46, genre: "soul" },
  { id: 77, title: "So What", artist: "Miles Davis", bpm: 138, key: 2, mode: 0, energy: 0.55, dance: 0.45, intensity: 0.60, genre: "jazz" },
  { id: 78, title: "Chameleon", artist: "Herbie Hancock", bpm: 98, key: 10, mode: 0, energy: 0.72, dance: 0.78, intensity: 0.68, genre: "jazz-funk" },
  { id: 79, title: "Watermelon Man", artist: "Herbie Hancock", bpm: 160, key: 5, mode: 1, energy: 0.75, dance: 0.72, intensity: 0.70, genre: "jazz" },
  { id: 80, title: "Maiden Voyage", artist: "Herbie Hancock", bpm: 88, key: 2, mode: 1, energy: 0.40, dance: 0.38, intensity: 0.35, genre: "jazz" },
  { id: 81, title: "Cantaloupe Island", artist: "Herbie Hancock", bpm: 116, key: 5, mode: 0, energy: 0.58, dance: 0.62, intensity: 0.54, genre: "jazz" },
  { id: 82, title: "Birdland", artist: "Weather Report", bpm: 140, key: 10, mode: 1, energy: 0.82, dance: 0.70, intensity: 0.78, genre: "jazz-fusion" },
  { id: 83, title: "Everybody Loves the Sunshine", artist: "Roy Ayers", bpm: 88, key: 2, mode: 1, energy: 0.55, dance: 0.65, intensity: 0.50, genre: "jazz-funk" },
  { id: 84, title: "Searchin", artist: "Roy Ayers", bpm: 104, key: 9, mode: 0, energy: 0.65, dance: 0.74, intensity: 0.60, genre: "jazz-funk" },
  { id: 85, title: "Lady", artist: "Fela Kuti", bpm: 104, key: 7, mode: 0, energy: 0.75, dance: 0.82, intensity: 0.70, genre: "afrobeat" },
  { id: 86, title: "Zombie", artist: "Fela Kuti", bpm: 110, key: 2, mode: 0, energy: 0.80, dance: 0.84, intensity: 0.76, genre: "afrobeat" },
  { id: 87, title: "Water No Get Enemy", artist: "Fela Kuti", bpm: 108, key: 5, mode: 0, energy: 0.78, dance: 0.82, intensity: 0.74, genre: "afrobeat" },
  { id: 88, title: "Soul Makossa", artist: "Manu Dibango", bpm: 118, key: 4, mode: 0, energy: 0.74, dance: 0.86, intensity: 0.68, genre: "afro" },
  { id: 89, title: "Pata Pata", artist: "Miriam Makeba", bpm: 118, key: 7, mode: 1, energy: 0.72, dance: 0.88, intensity: 0.65, genre: "afro" },
  { id: 90, title: "Oye Como Va", artist: "Santana", bpm: 122, key: 9, mode: 0, energy: 0.75, dance: 0.85, intensity: 0.70, genre: "latin" },
  { id: 91, title: "Conga", artist: "Miami Sound Machine", bpm: 120, key: 0, mode: 1, energy: 0.80, dance: 0.92, intensity: 0.75, genre: "latin" },
  { id: 92, title: "Windowlicker", artist: "Aphex Twin", bpm: 136, key: 9, mode: 0, energy: 0.82, dance: 0.75, intensity: 0.80, genre: "electronic" },
  { id: 93, title: "Porcelain", artist: "Moby", bpm: 98, key: 7, mode: 0, energy: 0.48, dance: 0.55, intensity: 0.42, genre: "ambient" },
  { id: 94, title: "Natural Blues", artist: "Moby", bpm: 122, key: 9, mode: 0, energy: 0.72, dance: 0.80, intensity: 0.66, genre: "electronic" },
  { id: 95, title: "Go", artist: "Moby", bpm: 130, key: 4, mode: 0, energy: 0.86, dance: 0.84, intensity: 0.82, genre: "techno" },
  { id: 96, title: "Trans-Europe Express", artist: "Kraftwerk", bpm: 118, key: 7, mode: 0, energy: 0.62, dance: 0.70, intensity: 0.56, genre: "electronic" },
  { id: 97, title: "Computer Love", artist: "Kraftwerk", bpm: 116, key: 9, mode: 0, energy: 0.60, dance: 0.68, intensity: 0.55, genre: "electronic" },
  { id: 98, title: "Planet Rock", artist: "Afrika Bambaataa", bpm: 127, key: 2, mode: 0, energy: 0.85, dance: 0.86, intensity: 0.82, genre: "electro" },
  { id: 99, title: "Looking for the Perfect Beat", artist: "Afrika Bambaataa", bpm: 124, key: 7, mode: 0, energy: 0.82, dance: 0.84, intensity: 0.78, genre: "electro" },
  { id: 100, title: "Al Naafiysh", artist: "Hashim", bpm: 122, key: 9, mode: 0, energy: 0.80, dance: 0.85, intensity: 0.76, genre: "electro" },
  { id: 101, title: "I.O.U.", artist: "Freeez", bpm: 118, key: 7, mode: 0, energy: 0.76, dance: 0.84, intensity: 0.70, genre: "boogie" },
  { id: 102, title: "Children", artist: "Robert Miles", bpm: 136, key: 4, mode: 0, energy: 0.80, dance: 0.80, intensity: 0.76, genre: "trance" },
  { id: 103, title: "Sandstorm", artist: "Darude", bpm: 136, key: 2, mode: 0, energy: 0.90, dance: 0.85, intensity: 0.88, genre: "trance" },
  { id: 104, title: "Age of Love", artist: "Age of Love", bpm: 134, key: 5, mode: 0, energy: 0.86, dance: 0.82, intensity: 0.84, genre: "trance" },
  { id: 105, title: "Sueno Latino", artist: "Sueno Latino", bpm: 118, key: 9, mode: 0, energy: 0.65, dance: 0.74, intensity: 0.58, genre: "balearic" },
  { id: 106, title: "Pacific State", artist: "808 State", bpm: 118, key: 4, mode: 0, energy: 0.62, dance: 0.70, intensity: 0.55, genre: "balearic" },
  { id: 107, title: "Cafe Del Mar", artist: "Jose Padilla", bpm: 76, key: 2, mode: 1, energy: 0.28, dance: 0.38, intensity: 0.22, genre: "balearic" },
  { id: 108, title: "N.Y. State of Mind", artist: "Nas", bpm: 94, key: 2, mode: 0, energy: 0.72, dance: 0.72, intensity: 0.68, genre: "hip-hop" },
  { id: 109, title: "C.R.E.A.M.", artist: "Wu-Tang Clan", bpm: 90, key: 7, mode: 0, energy: 0.68, dance: 0.70, intensity: 0.64, genre: "hip-hop" },
  { id: 110, title: "Electric Relaxation", artist: "A Tribe Called Quest", bpm: 93, key: 9, mode: 0, energy: 0.62, dance: 0.75, intensity: 0.56, genre: "hip-hop" },
  { id: 111, title: "Can I Kick It", artist: "A Tribe Called Quest", bpm: 97, key: 5, mode: 0, energy: 0.64, dance: 0.76, intensity: 0.58, genre: "hip-hop" },
  { id: 112, title: "Passin Me By", artist: "The Pharcyde", bpm: 88, key: 7, mode: 0, energy: 0.58, dance: 0.70, intensity: 0.52, genre: "hip-hop" },
  { id: 113, title: "Inner City Life", artist: "Goldie", bpm: 170, key: 5, mode: 0, energy: 0.85, dance: 0.75, intensity: 0.84, genre: "drum-and-bass" },
  { id: 114, title: "Brown Paper Bag", artist: "Roni Size", bpm: 172, key: 7, mode: 0, energy: 0.88, dance: 0.78, intensity: 0.86, genre: "drum-and-bass" },
  { id: 115, title: "Re-Rewind", artist: "Artful Dodger ft. Craig David", bpm: 130, key: 2, mode: 0, energy: 0.80, dance: 0.88, intensity: 0.74, genre: "uk-garage" },
  { id: 116, title: "Fill Me In", artist: "Craig David", bpm: 128, key: 7, mode: 0, energy: 0.76, dance: 0.86, intensity: 0.70, genre: "uk-garage" },
  { id: 117, title: "Flowers", artist: "Sweet Female Attitude", bpm: 128, key: 9, mode: 0, energy: 0.78, dance: 0.87, intensity: 0.72, genre: "uk-garage" },
  { id: 118, title: "Fizheuer Zieheuer", artist: "Ricardo Villalobos", bpm: 130, key: 7, mode: 0, energy: 0.74, dance: 0.78, intensity: 0.70, genre: "minimal" },
  { id: 119, title: "Actual Proof", artist: "Herbie Hancock", bpm: 132, key: 2, mode: 0, energy: 0.78, dance: 0.70, intensity: 0.75, genre: "jazz-funk" },
  { id: 120, title: "Electric Avenue", artist: "Eddy Grant", bpm: 116, key: 7, mode: 0, energy: 0.74, dance: 0.82, intensity: 0.68, genre: "reggae" },
  { id: 121, title: "Pass The Dutchie", artist: "Musical Youth", bpm: 120, key: 2, mode: 0, energy: 0.76, dance: 0.84, intensity: 0.70, genre: "reggae" },
  { id: 122, title: "One Blood", artist: "Junior Reid", bpm: 90, key: 5, mode: 0, energy: 0.65, dance: 0.75, intensity: 0.60, genre: "reggae" },
];

const CAMELOT = {0:{major:"8B",minor:"5A"},1:{major:"3B",minor:"12A"},2:{major:"10B",minor:"7A"},3:{major:"5B",minor:"2A"},4:{major:"12B",minor:"9A"},5:{major:"7B",minor:"4A"},6:{major:"2B",minor:"11A"},7:{major:"9B",minor:"6A"},8:{major:"4B",minor:"1A"},9:{major:"11B",minor:"8A"},10:{major:"6B",minor:"3A"},11:{major:"1B",minor:"10A"}};
const KEY_NAMES = ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
const KEY_MAP = {"C":0,"C#":1,"Db":1,"D":2,"D#":3,"Eb":3,"E":4,"F":5,"F#":6,"Gb":6,"G":7,"G#":8,"Ab":8,"A":9,"A#":10,"Bb":10,"B":11};

function getCamelot(key,mode){ return CAMELOT[key]?.[mode===0?"minor":"major"]||"?"; }
function camelotDistance(k1,m1,k2,m2){ const c1=getCamelot(k1,m1),c2=getCamelot(k2,m2); if(c1==="?"||c2==="?") return 3; const n1=parseInt(c1),n2=parseInt(c2),t1=c1.slice(-1),t2=c2.slice(-1); if(t1!==t2) return Math.min(Math.abs(n1-n2),12-Math.abs(n1-n2))+1; return Math.min(Math.abs(n1-n2),12-Math.abs(n1-n2)); }

async function bpmSearch(query) {
  try {
    const res = await fetch(`/api/bpm?endpoint=search&lookup=${encodeURIComponent(query)}`);
    const data = await res.json();
    return Array.isArray(data?.search) ? data.search : [];
  } catch(e) { return []; }
}

async function bpmSong(id) {
  try {
    const res = await fetch(`/api/bpm?endpoint=song&id=${id}`);
    const data = await res.json();
    return data?.song || null;
  } catch(e) { return null; }
}

function parseSongMeta(song) {
  if (!song) return null;
  const bpm = parseFloat(song.tempo);
  const keyStr = song.key_of || "";
  const isMinor = keyStr.toLowerCase().includes("m") && !keyStr.toLowerCase().includes("maj");
  const keyLetter = keyStr.replace(/m$/i,"").replace(/\s*(major|minor|maj|min)\s*/gi,"").trim();
  const key = KEY_MAP[keyLetter] ?? -1;
  if (!bpm || key === -1) return null;
  return { bpm, key, mode: isMinor ? 0 : 1, genre: song.genre || "unknown" };
}

function scoreTrack(current, candidate, intention, tolerance) {
  const isSafe = tolerance === "safe";
  const bpmDiff = Math.abs(candidate.bpm - current.bpm);
  const keyDist = camelotDistance(current.key, current.mode, candidate.key, candidate.mode);
  if (isSafe && bpmDiff > 5) return null;
  if (isSafe && keyDist > 1) return null;
  let score = 100;
  score -= isSafe ? bpmDiff*8 : Math.min(bpmDiff*2,40);
  score -= isSafe ? keyDist*20 : keyDist*5;
  if (!isSafe && keyDist>=3) score+=15;
  if (!isSafe && keyDist>=5) score+=10;
  if (candidate.mode===current.mode) score+=5; else if(isSafe) score-=10;
  const eD=candidate.energy-current.energy, iD=candidate.intensity-current.intensity, dD=candidate.dance-current.dance;
  if (intention==="stable") {
    score-=Math.abs(eD)*60; score-=Math.abs(iD)*45; score-=Math.abs(dD)*25;
    if(bpmDiff<=2)score+=20; if(keyDist===0)score+=15; if(Math.abs(eD)<0.05)score+=15;
  } else if (intention==="up") {
    score+=eD>0?eD*70:eD*55; score+=iD>0?iD*50:iD*40; score+=dD>0?dD*20:0;
    if(candidate.bpm>current.bpm&&bpmDiff<=10)score+=12; if(candidate.bpm<current.bpm)score-=bpmDiff*2;
    if(candidate.energy<current.energy-0.10)return null; if(candidate.intensity<current.intensity-0.10)return null;
  } else if (intention==="down") {
    score+=eD<0?Math.abs(eD)*70:-eD*55; score+=iD<0?Math.abs(iD)*50:-iD*40; score+=dD<0?Math.abs(dD)*15:0;
    if(candidate.bpm<current.bpm&&bpmDiff<=10)score+=12; if(candidate.bpm>current.bpm)score-=bpmDiff*2;
    if(candidate.energy>current.energy+0.10)return null; if(candidate.intensity>current.intensity+0.10)return null;
  }
  const totalD=(eD+iD)/2;
  let label;
  if(keyDist===0&&bpmDiff<=2)label="transition parfaite";
  else if(intention==="stable"&&Math.abs(totalD)<0.05&&keyDist<=1)label="continuité stable";
  else if(intention==="up"&&totalD>0.15)label="monte bien";
  else if(intention==="up"&&totalD>0.05)label="monte légèrement";
  else if(intention==="down"&&totalD<-0.15)label="redescente propre";
  else if(intention==="down"&&totalD<-0.05)label="redescend légèrement";
  else if(keyDist>=3)label="bifurcation assumée";
  else if(keyDist<=1)label="très compatible";
  else label="compatible";
  return {...candidate,score:Math.max(0,score),label,bpmDiff,keyDist,eD,iD};
}

function getLabelStyle(label) {
  if(label==="transition parfaite")return["#1a3825","#4caf74"];
  if(label==="très compatible")return["#1a2e10","#7bc34a"];
  if(label==="continuité stable")return["#1a1a10","#a0a060"];
  if(label==="monte bien")return["#2a1800","#e08830"];
  if(label==="monte légèrement")return["#201800","#c9a84c"];
  if(label==="redescente propre")return["#0d1a22","#4a9cc0"];
  if(label==="redescend légèrement")return["#0a1520","#3a7a9a"];
  if(label==="bifurcation assumée")return["#2a1510","#e0673a"];
  return["#1a1a1a","#666"];
}

async function generateCodeVerifier(){const a=new Uint32Array(56);crypto.getRandomValues(a);return Array.from(a,d=>d.toString(36)).join("").slice(0,128);}
async function generateCodeChallenge(v){const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v));return btoa(String.fromCharCode(...new Uint8Array(d))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");}
async function redirectToSpotify(){const v=await generateCodeVerifier(),c=await generateCodeChallenge(v);localStorage.setItem("pkce_verifier",v);window.location=`https://accounts.spotify.com/authorize?${new URLSearchParams({client_id:CLIENT_ID,response_type:"code",redirect_uri:REDIRECT_URI,scope:SCOPES,code_challenge_method:"S256",code_challenge:c})}`;}
async function exchangeToken(code){const v=localStorage.getItem("pkce_verifier");const r=await fetch("https://accounts.spotify.com/api/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:CLIENT_ID,grant_type:"authorization_code",code,redirect_uri:REDIRECT_URI,code_verifier:v})});const d=await r.json();if(d.access_token){localStorage.setItem("spotify_token",d.access_token);localStorage.setItem("spotify_refresh",d.refresh_token);localStorage.setItem("spotify_expires",Date.now()+d.expires_in*1000);}return d.access_token;}
async function refreshAccessToken(){const rf=localStorage.getItem("spotify_refresh");if(!rf)return null;const r=await fetch("https://accounts.spotify.com/api/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:CLIENT_ID,grant_type:"refresh_token",refresh_token:rf})});const d=await r.json();if(d.access_token){localStorage.setItem("spotify_token",d.access_token);localStorage.setItem("spotify_expires",Date.now()+d.expires_in*1000);return d.access_token;}return null;}
async function getToken(){const e=parseInt(localStorage.getItem("spotify_expires")||"0");if(Date.now()>e-60000)return await refreshAccessToken();return localStorage.getItem("spotify_token");}

function EnergyDot({value}){const f=Math.round((value||0)*5);return <span style={{letterSpacing:2}}>{Array.from({length:5},(_,i)=><span key={i} style={{color:i<f?"#c9a84c":"#2a2a2a",fontSize:8}}>●</span>)}</span>;}

export default function Temper() {
  const [token,setToken]=useState(null);
  const [spotifyTrack,setSpotifyTrack]=useState(null);
  const [currentTrack,setCurrentTrack]=useState(null);
  const [fetchingMeta,setFetchingMeta]=useState(false);
  const [intention,setIntention]=useState("stable");
  const [tolerance,setTolerance]=useState("safe");
  const [suggestions,setSuggestions]=useState([]);
  const [searchQuery,setSearchQuery]=useState("");
  const [searchResults,setSearchResults]=useState([]);
  const [searching,setSearching]=useState(false);
  const [animKey,setAnimKey]=useState(0);
  const [addedId,setAddedId]=useState(null);
  const [transitionNotif,setTransitionNotif]=useState(null);
  const searchTimeout=useRef(null);
  const lastSpotifyId=useRef(null);
  const transitionShownFor=useRef(null);
  const [userId, setUserId]=useState(null);
  const [sessionId, setSessionId]=useState(null);
  const positionInSession=useRef(0);

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const code=params.get("code");
    if(code){exchangeToken(code).then(async t=>{setToken(t);window.history.replaceState({},"","/");const me=await fetch("https://api.spotify.com/v1/me",{headers:{Authorization:`Bearer ${t}`}});const meData=await me.json();const uid=await getOrCreateUser(meData.id,meData.display_name);const sid=await startSession(uid);setUserId(uid);setSessionId(sid);});}
    else{const t=localStorage.getItem("spotify_token");if(t){setToken(t);(async()=>{try{const me=await fetch("https://api.spotify.com/v1/me",{headers:{Authorization:`Bearer ${t}`}});if(me&&me.ok){const meData=await me.json();const uid=await getOrCreateUser(meData.id,meData.display_name);const sid=await startSession(uid);setUserId(uid);setSessionId(sid);}}catch(e){}})();}}
  },[]);

  useEffect(()=>{
    if(!token)return;
    const poll=async()=>{
      const t=await getToken();if(!t)return;
      try{
        const r=await fetch("https://api.spotify.com/v1/me/player/currently-playing",{headers:{Authorization:`Bearer ${t}`}});
        if(r.status===200){
          const d=await r.json();
          if(!d?.item)return;

          // ── Nouveau morceau détecté
          if(d.item.id!==lastSpotifyId.current){
            lastSpotifyId.current=d.item.id;
            transitionShownFor.current=null;
            setTransitionNotif(null);
            setSpotifyTrack(d.item);
            setFetchingMeta(true);
            const results=await bpmSearch(d.item.name);
            if(results.length>0){
              const song=await bpmSong(results[0].id);
              const meta=parseSongMeta(song);
              if(meta){
                setCurrentTrack({
                  id:`spotify_${d.item.id}`,
                  title:d.item.name,
                  artist:d.item.artists?.map(a=>a.name).join(", "),
                  bpm:meta.bpm,key:meta.key,mode:meta.mode,
                  energy:0.70,dance:0.75,intensity:0.65,
                  genre:meta.genre,fromSpotify:true,
                });
              }
            }
            setFetchingMeta(false);
          }

          // ── Notification de transition (≤20s restantes)
          const remaining=(d.item.duration_ms-d.progress_ms)/1000;
          if(remaining<=20&&remaining>0&&transitionShownFor.current!==d.item.id){
            transitionShownFor.current=d.item.id;
            try{
              const qr=await fetch("https://api.spotify.com/v1/me/player/queue",{headers:{Authorization:`Bearer ${t}`}});
              if(qr.ok){
                const qd=await qr.json();
                const next=qd?.queue?.[0];
                if(next){
                  setTransitionNotif({
                    title:next.name,
                    artist:next.artists?.map(a=>a.name).join(", "),
                    secondsLeft:Math.round(remaining),
                  });
                }
              }
            }catch(e){}
          }
        }
      }catch(e){}
    };
    poll();
    const iv=setInterval(poll,5000);
    return()=>clearInterval(iv);
  },[token]);

  useEffect(()=>{
    clearTimeout(searchTimeout.current);
    if(!searchQuery||searchQuery.length<2){setSearchResults([]);return;}
    searchTimeout.current=setTimeout(async()=>{
      setSearching(true);
      const results=await bpmSearch(searchQuery);
      setSearchResults(results.slice(0,8));
      setSearching(false);
    },400);
  },[searchQuery]);

  useEffect(()=>{
    if(!currentTrack)return;
    const scored=TRACKS.filter(t=>t.id!==currentTrack.id).map(t=>scoreTrack(currentTrack,t,intention,tolerance)).filter(Boolean).sort((a,b)=>b.score-a.score).slice(0,8);
    setSuggestions(scored);
    setAnimKey(k=>k+1);
  },[currentTrack,intention,tolerance]);

  const selectFromSearch=async(result)=>{
    setSearchQuery("");setSearchResults([]);setFetchingMeta(true);
    const song=await bpmSong(result.id);
    const meta=parseSongMeta(song);
    if(meta){
      setCurrentTrack({
        id:`bpm_${result.id}`,
        title:result.song_title||result.title||"",
        artist:result.artist?.artist_name||"",
        bpm:meta.bpm,key:meta.key,mode:meta.mode,
        energy:0.70,dance:0.75,intensity:0.65,
        genre:meta.genre,
      });
    }
    setFetchingMeta(false);
  };

  const addToQueue=async(track)=>{
    const t=await getToken();if(!t)return;
    try{
      const r=await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(track.title+" "+track.artist)}&type=track&limit=1`,{headers:{Authorization:`Bearer ${t}`}});
      const d=await r.json();
      const uri=d?.tracks?.items?.[0]?.uri;
      if(uri){await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(uri)}`,{method:"POST",headers:{Authorization:`Bearer ${t}`}});setAddedId(track.id);setTimeout(()=>setAddedId(null),2000);positionInSession.current+=1;if(userId&&sessionId)saveInteraction(userId,sessionId,track,"added",positionInSession.current);}
    }catch(e){}
  };

  return(
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
        .tc{background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:12px 14px;transition:all .2s;}
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
        @keyframes spin{to{transform:rotate(360deg)}}.spin{display:inline-block;animation:spin 1s linear infinite;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}.pulse{animation:pulse 1.5s ease infinite;}
        @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .tn{animation:slideUp .3s ease both;}
      `}</style>

      {/* ── Notification de transition ── */}
      {transitionNotif&&(
        <div className="tn" style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:100,background:"#0f1a0f",border:"1px solid #2e5a2e",borderRadius:6,padding:"12px 18px",maxWidth:400,width:"calc(100% - 40px)",display:"flex",alignItems:"center",gap:12,boxShadow:"0 4px 24px rgba(0,0,0,0.6)"}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:9,color:"#4caf74",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>
              ⟶ Transition dans {transitionNotif.secondsLeft}s
            </div>
            <div style={{fontSize:13,color:"#e8e4dc",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{transitionNotif.title}</div>
            <div style={{fontSize:10,color:"var(--dim)"}}>{transitionNotif.artist}</div>
          </div>
        </div>
      )}

      <div style={{width:"100%",maxWidth:460,padding:"28px 20px 0"}}>
        <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:2}}>
          <span style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:26,color:"var(--gold)"}}>Temper</span>
          <span style={{fontSize:10,color:"var(--dim)",letterSpacing:"0.15em",textTransform:"uppercase"}}>DJ Navigator</span>
        </div>
        <div style={{height:1,background:"linear-gradient(to right,var(--gold-dim),transparent)",marginBottom:24}}/>

        {!token&&(
          <div style={{textAlign:"center",padding:"60px 20px"}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:"#e8e4dc",marginBottom:8}}>Connecte-toi à Spotify</div>
            <div style={{fontSize:11,color:"var(--dim)",marginBottom:28,lineHeight:1.6}}>Temper détecte le morceau en cours<br/>et navigue dans le catalogue pour toi.</div>
            <button className="lb-btn" onClick={redirectToSpotify}>CONNEXION SPOTIFY</button>
          </div>
        )}

        {token&&(<>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:9,letterSpacing:"0.18em",color:"var(--dim)",textTransform:"uppercase",marginBottom:8}}>Spotify</div>
            {spotifyTrack?(
              <div style={{background:"#0d1a0d",border:"1px solid #1a3020",borderRadius:4,padding:"12px 14px",display:"flex",gap:10,alignItems:"center"}}>
                {spotifyTrack.album?.images?.[2]?.url&&<img src={spotifyTrack.album.images[2].url} alt="" style={{width:40,height:40,borderRadius:2,flexShrink:0}}/>}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:10,color:"#4caf74",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>
                    <span className="pulse">●</span> En lecture
                    {fetchingMeta&&<span style={{color:"var(--gold)",marginLeft:8}}><span className="spin">◌</span> analyse BPM…</span>}
                  </div>
                  <div style={{fontSize:13,color:"#e8e4dc",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{spotifyTrack.name}</div>
                  <div style={{fontSize:10,color:"var(--dim)"}}>{spotifyTrack.artists?.map(a=>a.name).join(", ")}</div>
                </div>
              </div>
            ):(
              <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:4,padding:"14px 16px",color:"var(--dim)",fontSize:11}}>
                Lance un morceau sur Spotify — Temper le détecte automatiquement.
              </div>
            )}
          </div>

          <div style={{marginBottom:16}}>
            <div style={{fontSize:9,letterSpacing:"0.18em",color:"var(--dim)",textTransform:"uppercase",marginBottom:8}}>Ou chercher un morceau de départ</div>
            <input className="si-inp" placeholder="Titre, artiste… (catalogue GetSongBPM)" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
            {searching&&<div style={{fontSize:10,color:"var(--dim)",marginTop:6}}><span className="spin">◌</span> Recherche…</div>}
            {searchResults.length>0&&(
              <div style={{marginTop:6,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:4,overflow:"hidden"}}>
                {searchResults.map((r,i)=>(
                  <div key={i} className="sri" onClick={()=>selectFromSearch(r)}>
                    <div>
                      <div style={{color:"#e8e4dc"}}>{r.song_title||r.title}</div>
                      <div style={{color:"var(--dim)",fontSize:10}}>{r.artist?.artist_name||""}</div>
                    </div>
                    <div style={{fontSize:10,color:"var(--dim)"}}>{r.tempo&&`${Math.round(r.tempo)} bpm`}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {fetchingMeta&&!currentTrack&&(
            <div style={{textAlign:"center",padding:"20px 0",color:"var(--dim)",fontSize:11}}>
              <span className="spin">◌</span> Récupération des données musicales…
            </div>
          )}

          {currentTrack&&(
            <div style={{marginBottom:18}}>
              <div style={{fontSize:9,letterSpacing:"0.18em",color:"var(--dim)",textTransform:"uppercase",marginBottom:8}}>Point de départ</div>
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

          <div style={{marginBottom:22}}>
            <div style={{display:"flex",gap:6}}>
              <button className={`bt safe ${tolerance==="safe"?"on":""}`} onClick={()=>setTolerance("safe")}>⬡ Safe</button>
              <button className={`bt aud ${tolerance==="audacious"?"on":""}`} onClick={()=>setTolerance("audacious")}>◈ Audacieux</button>
            </div>
          </div>

          <div style={{height:1,background:"linear-gradient(to right,transparent,var(--border),transparent)",marginBottom:18}}/>

          {!currentTrack?(
            <div style={{textAlign:"center",padding:"30px 0",color:"var(--dim)",fontSize:11,lineHeight:1.8}}>
              Lance un morceau sur Spotify<br/>ou cherche un titre ci-dessus.
            </div>
          ):(
            <div>
              <div style={{fontSize:9,letterSpacing:"0.18em",color:"var(--dim)",textTransform:"uppercase",marginBottom:12}}>
                Suggestions — {suggestions.length}
                {suggestions.length===0&&<span style={{color:"#c0392b",marginLeft:8}}>— essaie le mode Audacieux</span>}
              </div>
              {suggestions.length===0&&(
                <div style={{background:"#1a0d0a",border:"1px solid #3a1a10",borderRadius:4,padding:"14px 16px",fontSize:11,color:"#e0673a",lineHeight:1.6}}>
                  Aucun résultat en mode Safe. Passe en mode <strong>Audacieux</strong>.
                </div>
              )}
              <div style={{display:"flex",flexDirection:"column",gap:7}} key={animKey}>
                {suggestions.map((t,i)=>{
                  const [bg,fg]=getLabelStyle(t.label);
                  const bs=t.bpm>currentTrack.bpm?"+":(t.bpm<currentTrack.bpm?"−":"=");
                  const bd=t.bpmDiff===0?"=":`${bs}${Math.round(t.bpmDiff)}`;
                  const ea=t.eD>0.02?"↑":t.eD<-0.02?"↓":"→";
                  const done=addedId===t.id;
                  return(
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
                        <span style={{color:t.eD>0.02?"#e08830":t.eD<-0.02?"#4a9cc0":"var(--dim)"}}>énergie {ea}</span>
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
            Temper · v0.1 · <a href="https://getsongbpm.com" style={{color:"#2a2a2a",textDecoration:"none"}}>BPM data by GetSongBPM</a>
          </div>
        </>)}
      </div>
    </div>
  );
}
