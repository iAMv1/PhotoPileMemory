// Photo sources for the image stack
export const PHOTOS = [
  "https://images.unsplash.com/photo-1519682577862-22b62b24e493?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
  "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
  "https://images.unsplash.com/photo-1587301669187-732ea66e7617?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
  "https://images.unsplash.com/photo-1519671482486-5ca6759623b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
  "https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
  "https://images.unsplash.com/photo-1578922846525-863a0f48811f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
  "https://images.unsplash.com/photo-1532117182044-9755a5ca5d55?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
  "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80"
];

// Default time capsule messages
export const DEFAULT_TIME_CAPSULE_MESSAGES = [
  { hour: 8, message: "Congrats on waking up! That's harder at your age, isn't it? 💀" },
  { hour: 12, message: "Lunch time! Try not to choke on your cake, old timer! 🍰" },
  { hour: 15, message: "Afternoon check - still alive? Your back hurting yet? 👴" },
  { hour: 18, message: "Evening! Don't party too hard, you'll need your meds soon! 💊" },
  { hour: 21, message: "Nearly bedtime, grandpa! Remember when you could stay up late? 🌙" }
];

// Konami code sequence
export const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a"
];

// Wish style options
export const WISH_STYLES = [
  { id: "comic", label: "Comic Style", fontFamily: "'Comic Sans MS', cursive", color: "#FFA500" },
  { id: "impact", label: "MEME STYLE", fontFamily: "Impact, sans-serif", color: "#FFFFFF", textShadow: "2px 2px 0 #000" },
  { id: "retro", label: "Retro Style", fontFamily: "'VT323', monospace", color: "#00FF00" },
  { id: "rainbow", label: "Rainbow Style", fontFamily: "'Comic Sans MS', cursive", isRainbow: true }
];

// App theme modes
export const THEME_MODES = [
  { id: "vaporwave", label: "Vaporwave", icon: "mountain", bgClass: "vaporwave", textColor: "text-white", buttonColor: "bg-pink-500" },
  { id: "matrix", label: "Matrix", icon: "terminal", bgClass: "matrix", textColor: "text-green-400", buttonColor: "bg-green-500" },
  { id: "nineties", label: "90s Web", icon: "disc", bgClass: "nineties", textColor: "text-yellow-300", buttonColor: "bg-orange-500" },
  { id: "normal", label: "Normal", icon: "undo", bgClass: "bg-dark", textColor: "text-light", buttonColor: "bg-cyan-400" }
];

// Photo effects
export const PHOTO_EFFECTS = [
  { id: "deep-fried", label: "Deep Fry", icon: "flame", color: "bg-fuchsia-500" },
  { id: "glitch", label: "Glitch", icon: "bug", color: "bg-cyan-400" },
  { id: "shake", label: "Shake!", icon: "dizzy", color: "bg-lime-400" },
  { id: "spin", label: "Spin!", icon: "rotate-cw", color: "bg-orange-500" },
  { id: "confetti", label: "Confetti!", icon: "cake", color: "bg-yellow-400" }
];
