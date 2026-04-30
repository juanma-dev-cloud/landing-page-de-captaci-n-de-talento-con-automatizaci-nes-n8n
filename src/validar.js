export const soloLetras = /^[a-záéíóúüñÁÉÍÓÚÜÑ\s]+$/i;
export const cpOk = /^\d{5}$/;
export const cvOk = /\.(pdf|docx|odt)$/i;
export const dniPrueba = /^\d{8}[A-Z]$/;

/** 8 numeros y 1 letra al final (para practicar; no comprueba letra oficial). */
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
  return dniPrueba.test(String(dni || "").toUpperCase().trim());
}
