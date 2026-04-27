const letrasDni = "TRWAGMYFPDXBNJZSQVHLCKE";
export const soloLetras = /^[a-záéíóúüñÁÉÍÓÚÜÑ\s]+$/i;
export const dniFormato = /^\d{8}[A-Za-z]$/;
export const cpOk = /^\d{5}$/;
export const cvOk = /\.(pdf|docx|odt)$/i;
export function dniLetraBien(dni) {
  const n = dni.slice(0, 8), l = dni.slice(8).toUpperCase();
  return letrasDni[parseInt(n, 10) % 23] === l;
}
