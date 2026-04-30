import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { soloLetras, dniValido, filtrarDni, cpOk, cvOk } from "./validar.js";

const estudiosTxt = {
  "Sin estudios": "Sin titulo; buscamos actitud y curiosidad por el codigo web.",
  Primaria: "Etapa basica; el puesto incluye formacion interna.",
  ESO: "Educacion secundaria obligatoria.",
  Bachillerato: "Preparacion para ciclos o universidad.",
  FPGM: "Formacion profesional grado medio.",
  FPGS: "Formacion profesional grado superior (muy valorado en desarrollo web).",
  "Carrera Universitaria": "Grado universitario.",
  Máster: "Postgrado especializado.",
  Doctorado: "Doctorado; investigacion y rigor.",
};
const carnets = ["Ninguno", "AM", "A1", "A2", "A", "B", "B96", "B+E", "BE", "C1", "C1+E", "C", "C+E", "D1", "D1+E", "D", "D+E"];
const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || "";

export default function App() {
  const capRef = useRef(null);
  const recapHid = useRef(null);
  const [fileKey, setFileKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [cap, setCap] = useState(null);
  const [e, setE] = useState({});
  const [f, setF] = useState({
    nombre: "", apellidos: "", nac: "", dni: "", dir: "", ciudad: "", cp: "",
    est: "", estTxt: "", exp: "", carnet: "", cv: null,
  });

  function ch(k, v) {
    setF((p) => {
      const n = { ...p, [k]: v };
      if (k === "est" && (v === "Sin estudios" || !v)) n.estTxt = "";
      return n;
    });
    setE((p) => ({ ...p, [k]: "", ...(k === "est" ? { estTxt: "" } : {}) }));
  }

  function enviar(ev) {
    ev.preventDefault();
    if (busy) return;
    const er = {};
    if (!f.nombre.trim()) er.nombre = "Obligatorio";
    else if (!soloLetras.test(f.nombre.trim())) er.nombre = "Solo letras";
    if (!f.apellidos.trim()) er.apellidos = "Obligatorio";
    else if (!soloLetras.test(f.apellidos.trim())) er.apellidos = "Solo letras";
    if (!f.nac) er.nac = "Obligatorio";
    else if (f.nac > new Date().toISOString().slice(0, 10)) er.nac = "Fecha no valida";
    if (!dniValido(f.dni)) er.dni = "8 numeros y 1 letra (prueba, sin comprobar letra real)";
    if (!f.dir.trim()) er.dir = "Obligatorio";
    if (!f.ciudad.trim()) er.ciudad = "Obligatorio";
    else if (!soloLetras.test(f.ciudad.trim())) er.ciudad = "Solo letras";
    if (!cpOk.test(f.cp)) er.cp = "5 digitos";
    if (!f.est) er.est = "Elige un nivel";
    if (f.est && f.est !== "Sin estudios" && !f.estTxt.trim()) er.estTxt = "Explica que estudios has cursado";
    if (!f.carnet) er.carnet = "Elige carnet";
    if (!f.exp.trim()) er.exp = "Obligatorio";
    if (!f.cv) er.cv = "Sube tu CV";
    else if (!cvOk.test(f.cv.name)) er.cv = "Solo pdf, docx u odt";
    if (!cap) er.cap = "Marca el captcha";
    setE(er);
    if (Object.keys(er).length) {
      return;
    }
    if (!webhookUrl) {
      alert("Falta VITE_N8N_WEBHOOK_URL (revisa .env o secret en GitHub Actions)");
      return;
    }
    setBusy(true);
    const form = ev.currentTarget;
    if (recapHid.current) recapHid.current.value = cap || "";
    const ts = form.querySelector('input[name="enviado_en"]');
    if (ts) ts.value = new Date().toISOString();
    form.action = webhookUrl;
    form.target = "n8n_sink";
    form.method = "post";
    form.enctype = "multipart/form-data";
    requestAnimationFrame(() => {
      form.submit();
      setTimeout(() => {
        alert("Candidatura enviada.");
        setF({ nombre: "", apellidos: "", nac: "", dni: "", dir: "", ciudad: "", cp: "", est: "", estTxt: "", exp: "", carnet: "", cv: null });
        setCap(null);
        capRef.current?.reset();
        if (recapHid.current) recapHid.current.value = "";
        if (ts) ts.value = "";
        setFileKey((k) => k + 1);
        setBusy(false);
      }, 500);
    });
  }

  const inp = "mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm";
  const err = (k) => (e[k] ? <p className="text-xs text-red-600">{e[k]}</p> : null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-indigo-700 px-4 py-8 text-white">
        <h1 className="text-2xl font-bold">Programando el Futuro</h1>
        <p className="mt-2 max-w-2xl text-sm opacity-90">
          Somos una empresa de programacion web: hacemos paginas y aplicaciones con tecnologias modernas.
          Buscamos gente con ganas de aprender, trabajo en equipo y interes por el desarrollo front y back.
        </p>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <iframe title="envio n8n" name="n8n_sink" className="pointer-events-none absolute h-0 w-0 border-0 opacity-0" />
        <h2 className="mb-4 text-lg font-semibold">Candidatura</h2>
        <form onSubmit={enviar} method="post" encType="multipart/form-data" className="space-y-3 text-left text-sm">
          <input ref={recapHid} type="hidden" name="g_recaptcha_response" defaultValue="" />
          <input type="hidden" name="enviado_en" defaultValue="" />
          <div>
            <label>Nombre</label>
            <input name="nombre" className={inp} value={f.nombre} onChange={(x) => ch("nombre", x.target.value.replace(/[0-9]/g, ""))} />
            {err("nombre")}
          </div>
          <div>
            <label>Apellidos</label>
            <input name="apellidos" className={inp} value={f.apellidos} onChange={(x) => ch("apellidos", x.target.value.replace(/[0-9]/g, ""))} />
            {err("apellidos")}
          </div>
          <div>
            <label>Fecha nacimiento</label>
            <input name="fecha_nacimiento" type="date" className={inp} value={f.nac} onChange={(x) => ch("nac", x.target.value)} />
            {err("nac")}
          </div>
          <div>
            <label>DNI</label>
            <input name="dni" className={inp} placeholder="12345678Z" value={f.dni} onChange={(x) => ch("dni", filtrarDni(x.target.value))} />
            {err("dni")}
          </div>
          <div>
            <label>Direccion</label>
            <input name="direccion" className={inp} value={f.dir} onChange={(x) => ch("dir", x.target.value)} />
            {err("dir")}
          </div>
          <div>
            <label>Ciudad</label>
            <input name="ciudad" className={inp} value={f.ciudad} onChange={(x) => ch("ciudad", x.target.value.replace(/[0-9]/g, ""))} />
            {err("ciudad")}
          </div>
          <div>
            <label>Codigo postal</label>
            <input name="codigo_postal" className={inp} maxLength={5} value={f.cp} onChange={(x) => ch("cp", x.target.value.replace(/\D/g, "").slice(0, 5))} />
            {err("cp")}
          </div>
          <div>
            <label>Nivel estudios</label>
            <select name="nivel_estudios" className={inp} value={f.est} onChange={(x) => ch("est", x.target.value)}>
              <option value="">-- elige --</option>
              {Object.keys(estudiosTxt).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            {f.est && <p className="mt-1 rounded bg-indigo-50 p-2 text-xs text-indigo-900">{estudiosTxt[f.est]}</p>}
            {err("est")}
            {f.est && f.est !== "Sin estudios" && (
              <div className="mt-2">
                <label>Que estudios has cursado</label>
                <textarea name="estudios_detalle" className={inp} rows={2} value={f.estTxt} placeholder="Ej: CFGS DAW en el IES..." onChange={(x) => ch("estTxt", x.target.value)} />
                {err("estTxt")}
              </div>
            )}
          </div>
          <div>
            <label>Experiencia laboral</label>
            <textarea name="experiencia" className={inp} rows={3} value={f.exp} onChange={(x) => ch("exp", x.target.value)} />
            {err("exp")}
          </div>
          <div>
            <label>Carnet</label>
            <select name="carnet" className={inp} value={f.carnet} onChange={(x) => ch("carnet", x.target.value)}>
              <option value="">-- elige --</option>
              {carnets.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {err("carnet")}
          </div>
          <div>
            <label>CV (pdf, docx, odt)</label>
            <input key={fileKey} name="cv" type="file" accept=".pdf,.docx,.odt,application/pdf" className={inp} onChange={(x) => ch("cv", x.target.files?.[0] || null)} />
            {err("cv")}
          </div>
          <div className="flex justify-center py-2">
            <ReCAPTCHA ref={capRef} sitekey={siteKey} onChange={setCap} />
          </div>
          {err("cap")}
          <button type="submit" disabled={busy} className="w-full rounded bg-indigo-600 py-2 font-medium text-white disabled:opacity-50">
            {busy ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </main>
    </div>
  );
}
