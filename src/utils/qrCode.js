/**
 * Lightweight pure JavaScript QR Code Generator (SVG & Data URL)
 * Implements standard QR Code (ISO/IEC 18004) matrix generation with Error Correction Level M/L
 */

// QR Code Table & Galois Field Polynomials
const GF256_EXP = new Uint8Array(512);
const GF256_LOG = new Uint8Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_EXP[i + 255] = x;
    GF256_LOG[x] = i;
    x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
  }
})();

function gfMul(x, y) {
  if (x === 0 || y === 0) return 0;
  return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
}

function gfPolyMul(p, q) {
  const r = new Uint8Array(p.length + q.length - 1);
  for (let i = 0; i < p.length; i++) {
    for (let j = 0; j < q.length; j++) {
      r[i + j] ^= gfMul(p[i], q[j]);
    }
  }
  return r;
}

function getGeneratorPoly(degree) {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    poly = gfPolyMul(poly, new Uint8Array([1, GF256_EXP[i]]));
  }
  return poly;
}

function getErrorCorrection(data, ecCount) {
  const gen = getGeneratorPoly(ecCount);
  const result = new Uint8Array(ecCount);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ result[0];
    result.copyWithin(0, 1);
    result[ecCount - 1] = 0;
    for (let j = 0; j < ecCount; j++) {
      result[j] ^= gfMul(gen[j + 1], factor);
    }
  }
  return result;
}

// Simple Byte-mode QR encoder supporting URLs up to 80-120 chars (Version 3/4)
export function generateQRMatrix(text) {
  const utf8 = new TextEncoder().encode(text);
  const length = utf8.length;
  
  // Select Version (Version 3 = 29x29 for <= 34 bytes, Version 4 = 33x33 for <= 48 bytes, Version 5 = 37x37 for <= 62 bytes, Version 6 = 41x41)
  let version = 3;
  let totalDataBytes = 34;
  let ecBytes = 26;
  if (length > 34) {
    version = 4;
    totalDataBytes = 48;
    ecBytes = 36;
  }
  if (length > 48) {
    version = 5;
    totalDataBytes = 62;
    ecBytes = 44;
  }
  if (length > 62) {
    version = 6;
    totalDataBytes = 76;
    ecBytes = 56;
  }

  const size = 17 + version * 4;
  const matrix = Array.from({ length: size }, () => Array(size).fill(null));
  const isReserved = Array.from({ length: size }, () => Array(size).fill(false));

  // Finder pattern helper
  function drawFinderPattern(row, col) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const tr = row + r;
        const tc = col + c;
        if (tr >= 0 && tr < size && tc >= 0 && tc < size) {
          isReserved[tr][tc] = true;
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            matrix[tr][tc] = (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
          } else {
            matrix[tr][tc] = false;
          }
        }
      }
    }
  }

  // Draw 3 Finders
  drawFinderPattern(0, 0);
  drawFinderPattern(0, size - 7);
  drawFinderPattern(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    isReserved[6][i] = true;
    matrix[6][i] = i % 2 === 0;
    isReserved[i][6] = true;
    matrix[i][6] = i % 2 === 0;
  }

  // Alignment pattern for version >= 2
  if (version >= 2) {
    const alignPos = version === 3 ? [6, 22] : version === 4 ? [6, 26] : version === 5 ? [6, 30] : [6, 34];
    for (const r of alignPos) {
      for (const c of alignPos) {
        if (!isReserved[r][c]) {
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              isReserved[r + dr][c + dc] = true;
              matrix[r + dr][c + dc] = (Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
            }
          }
        }
      }
    }
  }

  // Format info area reservation
  for (let i = 0; i < 9; i++) {
    if (i < size) {
      isReserved[8][i] = true;
      isReserved[i][8] = true;
      isReserved[8][size - 1 - i] = true;
      isReserved[size - 1 - i][8] = true;
    }
  }
  isReserved[size - 8][8] = true;
  matrix[size - 8][8] = true; // Dark module

  // Encode Data Bits (Mode: Byte = 0100)
  const bitStream = [];
  function pushBits(val, len) {
    for (let i = len - 1; i >= 0; i--) {
      bitStream.push((val >> i) & 1);
    }
  }

  pushBits(0b0100, 4); // Byte mode indicator
  pushBits(length, 8); // Character count indicator
  for (let i = 0; i < length; i++) {
    pushBits(utf8[i], 8);
  }

  // Terminator & Padding
  while (bitStream.length % 8 !== 0) bitStream.push(0);
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bitStream.length < totalDataBytes * 8) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bitstream to data bytes
  const dataBytes = new Uint8Array(totalDataBytes);
  for (let i = 0; i < totalDataBytes; i++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | (bitStream[i * 8 + b] || 0);
    }
    dataBytes[i] = byteVal;
  }

  // Error correction
  const ec = getErrorCorrection(dataBytes, ecBytes);
  const allCodewords = new Uint8Array(totalDataBytes + ecBytes);
  allCodewords.set(dataBytes);
  allCodewords.set(ec, totalDataBytes);

  const finalBits = [];
  for (let i = 0; i < allCodewords.length; i++) {
    for (let b = 7; b >= 0; b--) {
      finalBits.push((allCodewords[i] >> b) & 1);
    }
  }

  // Populate data into matrix in zigzag pattern
  let bitIdx = 0;
  let dir = -1; // Going up
  let row = size - 1;
  let col = size - 1;

  while (col > 0) {
    if (col === 6) col--; // Skip vertical timing column
    for (let i = 0; i < size; i++) {
      const r = dir === -1 ? row - i : i;
      for (let c = 0; c < 2; c++) {
        const tc = col - c;
        if (!isReserved[r][tc]) {
          const bit = bitIdx < finalBits.length ? finalBits[bitIdx++] : 0;
          // Apply standard mask pattern 0: (row + col) % 2 === 0
          const mask = (r + tc) % 2 === 0;
          matrix[r][tc] = (bit === 1) ^ mask;
        }
      }
    }
    dir = -dir;
    col -= 2;
  }

  // Draw Format Information (Mask 0 + Error Level M: 101010000010010)
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  for (let i = 0; i < 6; i++) matrix[8][i] = Boolean(formatBits[i]);
  matrix[8][7] = Boolean(formatBits[6]);
  matrix[8][8] = Boolean(formatBits[7]);
  matrix[7][8] = Boolean(formatBits[8]);
  for (let i = 9; i < 15; i++) matrix[14 - i][8] = Boolean(formatBits[i]);

  for (let i = 0; i < 8; i++) matrix[size - 1 - i][8] = Boolean(formatBits[i]);
  for (let i = 8; i < 15; i++) matrix[8][size - 15 + i] = Boolean(formatBits[i]);

  return matrix;
}

export function generateQRCodeSVG(text, size = 120) {
  const matrix = generateQRMatrix(text);
  const matrixSize = matrix.length;
  const cellSize = size / matrixSize;

  let rects = '';
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        rects += `<rect x="${(c * cellSize).toFixed(2)}" y="${(r * cellSize).toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" fill="#0F172A" />`;
      }
    }
  }

  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="#FFFFFF" rx="8" />${rects}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}
