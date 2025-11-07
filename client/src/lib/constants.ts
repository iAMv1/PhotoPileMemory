// Photo sources for the image stack
export const PHOTOS: string[] = [
  "/image_1743649972817.png",
  "/image_1743650935031.png",
  "/image_1743651265192.png",
  "/image_1743651795313.png",
  "/image_1743654229354.png",
  "/image_1743659895899.png",
  "/image_1743660338271.png",
  "/image_1743660896765.png",
  "/image_1743663228577.png",
  "/image_1743664398969.png"
];

// Default time capsule messages
export const DEFAULT_TIME_CAPSULE_MESSAGES = [
  { hour: 8, message: "Congrats on waking up! That's harder at your age, isn't it? 💀" },
  { hour: 12, message: "Lunch time! Try not to choke on your cake, old timer! 🍰" },
  { hour: 15, message: "Afternoon check - still alive? Your back hurting yet? 👴" },
  { hour: 18, message: "Evening! Don't party too hard, you'll need your meds soon! 💊" },
  { hour: 20, message: "You are aging! Look at those wrinkles forming as we speak! 👵" },
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
  { id: "comic", label: "Casual Handwriting", fontFamily: "'Indie Flower', cursive", color: "#3B82F6" },
  { id: "impact", label: "ATTENTION GRABBING", fontFamily: "'Permanent Marker', cursive", color: "#EF4444", textShadow: "1px 1px 0 #000" },
  { id: "retro", label: "Neat Handwriting", fontFamily: "'Shadows Into Light', cursive", color: "#059669" },
  { id: "rainbow", label: "Rainbow Gel Pen", fontFamily: "'Indie Flower', cursive", isRainbow: true }
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

// Note shapes for sticky notes
export const NOTE_SHAPES = [
  { id: "square", label: "Square", bgColor: "bg-yellow-200" },
  { id: "rectangle", label: "Rectangle", bgColor: "bg-blue-200" },
  { id: "circle", label: "Circle", bgColor: "bg-green-200" },
  { id: "star", label: "Star", bgColor: "bg-purple-200" },
  { id: "triangle", label: "Triangle", bgColor: "bg-pink-200" },
  { id: "cloud", label: "Cloud", bgColor: "bg-cyan-200" },
  { id: "heart", label: "Heart", bgColor: "bg-red-200" }
];
