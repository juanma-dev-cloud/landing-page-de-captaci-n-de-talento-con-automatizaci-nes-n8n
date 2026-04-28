const letrasDni = "TRWAGMYFPDXBNJZSQVHLCKE";
export const soloLetras = /^[a-záéíóúüñÁÉÍÓÚÜÑ\s]+$/i;
export const cpOk = /^\d{5}$/;
export const cvOk = /\.(pdf|docx|odt)$/i;

/** Solo 8 numeros y 1 letra al final (mayuscula). */
export function filtrarDni(raw) {
  const u = String(raw).toUpperCase().replace(/[^0-9A-Z]/g, "");
  let s = "";
  for (const c of u) {
    if (s.length < 8) {
      if (/\d/.test(c)) s += c;
    } else if (s.length === 8 && /[A-Z]/.test(c)) {
      s += c;
      break;
    }
  }
  return s.slice(0, 9);
}

export function dniValido(dni) {
  if (!dni || dni.length !== 9) return false;
  if (!/^\d{8}[A-Z]$/.test(dni)) return false;
  const n = dni.slice(0, 8);
  if (n[0] === "0" && n === "00000000") return false;
  return letrasDni[parseInt(n, 10) % 23] === dni[8];
}
