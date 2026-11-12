// Each character in a row is one pixel. A dot leaves the background visible.
const travelerPalette = {
  o: "#292139", r: "#913b3a", R: "#d45645", H: "#ff9b64",
  s: "#ba765c", S: "#ffd4a2", W: "#fff0ce",
  b: "#24425c", B: "#396b86", C: "#6e9fb0", p: "#5b3d45",
};

const front = [
  "................",
  ".....oooooo.....",
  "....oHHRRRro....",
  "...oHRRRRRrro...",
  "..orrrrrrrrrro..",
  "..oHHHHHHRRrro..",
  "...oSoSSoSso....",
  "...oSSWSSSso....",
  "....ossssso.....",
  "....oCRBBBo.....",
  "...oSBRBCBSo....",
  "...osBRBBbso....",
  "....obbrbbo.....",
];

const side = [
  "................",
  ".....oooooo.....",
  "....oHHRRRro....",
  "...oHRRRRRrro...",
  "...orrrrrrrrro..",
  "...oHHRRRRrro...",
  "...opSSSSoSo....",
  "...opSSSSSSSo...",
  "....osSSSsso....",
  "...opCCRRBo.....",
  "..oppBBRBBSo....",
  "..oppbBBBbso....",
  "...oobbbbbbo....",
];

const back = [
  "................",
  ".....oooooo.....",
  "....oHRRRRro....",
  "...oHRRRRRrro...",
  "..orrrrrrrrrro..",
  "..oHRRRRRRrro...",
  "...opppppppo....",
  "...opppppppo....",
  "....opppppo.....",
  "....oCBRBBo.....",
  "...oSBppBSSo....",
  "...osBppBbso....",
  "....obbrbbo.....",
];

function poses(top) {
  return [
    { pal: travelerPalette, map: [...top, "....oppoppo.....", "...oppoopppo....", "...oooo.oooo...."] },
    { pal: travelerPalette, map: [...top, "...oppo..oo.....", "...oooo..oppo...", ".........oooo..."] },
  ];
}

export const traveler = { front: poses(front), side: poses(side), back: poses(back) };

export const mochi = {
  pal: { o: "#583644", G: "#467760", g: "#84ac74", Y: "#ffe78f",
    W: "#fff3bd", y: "#d9a25e", p: "#e99284" },
  map: [
    "................", "................", ".......GGg......", "......GggG......",
    "......GgG.......", ".....oGGooo.....", "....oWWYWWYo....", "...oWWYYYYYYo...",
    "..oWYYoYYoYYyo..", "..oWYYYYYYYYyo..", "..oYpYYooYpYyo..", "..oYYYYYYYYyyo..",
    "...oYYyyyyyyo...", "....oooooooo....", "................", "................",
  ],
};

export function drawSprite(ctx, left, top, def, scale = 2, flip = false) {
  def.map.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const color = def.pal[row[x]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(left + (flip ? row.length - 1 - x : x) * scale, top + y * scale, scale, scale);
    }
  });
}
