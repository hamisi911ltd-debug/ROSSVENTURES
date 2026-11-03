// First-team squads for the Talanta Stadium opening match (Bayern Munich vs Ajax, 5 Jan 2027).
// Source: Wikipedia season pages (CC BY-SA). Bayern squad as of 13 Oct 2026, Ajax as of 16 Sep 2026.
// These are the clubs' registered first teams — the travelling squads will be announced closer to the match.

export type Position = "GK" | "DF" | "MF" | "FW";
export type Player = { no: number; name: string; pos: Position; note?: string };
export type Squad = { club: string; coach: string; asOf: string; players: Player[] };

export const BAYERN: Squad = {
  club: "Bayern Munich",
  coach: "Vincent Kompany",
  asOf: "13 Oct 2026",
  players: [
    { no: 1, name: "Manuel Neuer", pos: "GK", note: "Captain" },
    { no: 26, name: "Sven Ulreich", pos: "GK" },
    { no: 40, name: "Jonas Urbig", pos: "GK" },
    { no: 2, name: "Dayot Upamecano", pos: "DF" },
    { no: 3, name: "Kim Min-jae", pos: "DF" },
    { no: 4, name: "Jonathan Tah", pos: "DF" },
    { no: 11, name: "Nathaniel Brown", pos: "DF" },
    { no: 19, name: "Alphonso Davies", pos: "DF" },
    { no: 21, name: "Hiroki Itō", pos: "DF" },
    { no: 23, name: "Sacha Boey", pos: "DF" },
    { no: 44, name: "Josip Stanišić", pos: "DF" },
    { no: 6, name: "Joshua Kimmich", pos: "MF", note: "Vice-captain" },
    { no: 8, name: "Tom Bischof", pos: "MF" },
    { no: 10, name: "Jamal Musiala", pos: "MF" },
    { no: 27, name: "Konrad Laimer", pos: "MF" },
    { no: 34, name: "Ismael Saibari", pos: "MF" },
    { no: 42, name: "Lennart Karl", pos: "MF" },
    { no: 45, name: "Aleksandar Pavlović", pos: "MF" },
    { no: 7, name: "Serge Gnabry", pos: "FW" },
    { no: 9, name: "Harry Kane", pos: "FW", note: "Captain" },
    { no: 14, name: "Luis Díaz", pos: "FW" },
    { no: 17, name: "Michael Olise", pos: "FW" },
  ],
};

export const AJAX: Squad = {
  club: "Ajax",
  coach: "Míchel",
  asOf: "16 Sep 2026",
  players: [
    { no: 1, name: "Marc-André ter Stegen", pos: "GK" },
    { no: 22, name: "Joeri Heerkens", pos: "GK" },
    { no: 26, name: "Maarten Paes", pos: "GK" },
    { no: 2, name: "Lucas Rosa", pos: "DF" },
    { no: 3, name: "Anton Gaaei", pos: "DF" },
    { no: 5, name: "Owen Wijndal", pos: "DF" },
    { no: 6, name: "Thilo Kehrer", pos: "DF" },
    { no: 12, name: "Caio Henrique", pos: "DF" },
    { no: 15, name: "Youri Baas", pos: "DF" },
    { no: 17, name: "Daley Blind", pos: "DF" },
    { no: 21, name: "Jofre Torrents", pos: "DF" },
    { no: 30, name: "Aaron Bouwman", pos: "DF" },
    { no: 36, name: "Dies Janse", pos: "DF" },
    { no: 4, name: "Sofyan Amrabat", pos: "MF" },
    { no: 8, name: "Julian Brandt", pos: "MF" },
    { no: 10, name: "Oscar Gloukh", pos: "MF" },
    { no: 18, name: "Davy Klaassen", pos: "MF", note: "Captain" },
    { no: 24, name: "Jorthy Mokio", pos: "MF" },
    { no: 28, name: "Yves Bissouma", pos: "MF" },
    { no: 7, name: "Simon Adingra", pos: "FW" },
    { no: 9, name: "Kasper Dolberg", pos: "FW" },
    { no: 11, name: "Viktor Tsyhankov", pos: "FW" },
    { no: 20, name: "Oliver Edvardsen", pos: "FW" },
    { no: 23, name: "Steven Berghuis", pos: "FW", note: "Vice-captain" },
    { no: 38, name: "Marcos Leonardo", pos: "FW" },
    { no: 43, name: "Rayane Bounida", pos: "FW" },
    { no: 68, name: "Abdellah Ouazane", pos: "FW" },
    { no: 99, name: "Tolu Arokodare", pos: "FW" },
  ],
};

export const POSITION_LABEL: Record<Position, string> = {
  GK: "Goalkeepers",
  DF: "Defenders",
  MF: "Midfielders",
  FW: "Forwards",
};
