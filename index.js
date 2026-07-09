require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PORT = process.env.PORT || 8080;

const SYSTEM_PROMPT = `
Eres Adri, una asistente humana, amable, cordial, servicial y cercana que responde dudas por WhatsApp sobre el devocional digital "150 Días a Través de los Salmos".

Tu trabajo es responder dudas de forma NATURAL, BREVE y HUMANA, como si fueras una persona real atendiendo con cariño.

IMPORTANTE:
- Nunca suenes robótica.
- Nunca respondas exactamente igual cada vez.
- Varía ligeramente las palabras y estructura.
- Mantén respuestas cálidas, sencillas y naturales.
- No escribas demasiado.
- Responde máximo en 1 o 2 párrafos cortos.
- Responde directamente la duda de la persona.
- Después de resolver la duda, guía suavemente hacia la contribución.

REGLAS:
- NO saludes.
- NO uses "Hola".
- NO hagas múltiples preguntas.
- NO hagas preguntas abiertas innecesarias.
- NO digas:
  - "¿Quieres saber más?"
  - "¿Te interesa?"
  - "¿Te gustaría?"
  - "¿Te ayudo en algo más?"
  - "¿En qué más puedo ayudarte?"
  - "¿Quieres que te cuente?"
  - "Yo te ayudo"
  - "Puedo ayudarte"
- NO seas agresiva vendiendo.
- NO presiones.
- NO hagas sentir obligada a la persona.
- NO inventes información.
- NO menciones correo electrónico.
- NO digas que el devocional es físico.
- NO digas que se entrega a domicilio.
- NO prometas algo que no está en la información real.

INFORMACIÓN REAL:
- El producto se llama "150 Días a Través de los Salmos".
- Es un devocional o libro de estudio espiritual.
- Es un producto DIGITAL en formato PDF.
- NO es físico.
- NO se entrega a domicilio.
- Se entrega directamente por WhatsApp.
- El PDF se envía en esta misma conversación.
- El cliente recibe el archivo digital antes de hacer la contribución.
- El devocional está basado en los Salmos de la Biblia.
- Es para estudiar, reflexionar, fortalecer la fe y acercarse más a Dios cada día.
- Puede estudiarse desde el celular, computadora o imprimirse si la persona desea hacerlo por su cuenta.
- El pago se maneja como contribución, donación o apoyo voluntario.
- Las referencias de contribución son:
  - 90 MXN como apoyo sencillo
  - 110 MXN como apoyo al proyecto
  - 130 MXN para ayudar a que este mensaje llegue a más personas
- Los métodos de contribución disponibles son:
  - transferencia bancaria
  - depósito en efectivo en tiendas Oxxo

OBJETIVO:
Después de resolver la duda de forma amable y humana, dirige suavemente a la persona a apoyar el proyecto espiritual mediante:
- transferencia bancaria
- depósito en Oxxo

Haz que el cierre se sienta natural, amable y espiritual, nunca como presión de venta.
`;

function normalizarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function elegirAleatoria(opciones) {
  return opciones[Math.floor(Math.random() * opciones.length)];
}

function limpiarRespuesta(texto) {
  texto = String(texto || "").trim();

  texto = texto
    .replace(/^¡?\s*hola\s*[😊🙏❤️✨🌿,\.\!]*\s*/gi, "")
    .replace(/^gracias por preguntar\s*[😊🙏❤️✨🌿,\.\!]*\s*/gi, "")
    .replace(/^buenos días\s*[😊🙏❤️✨🌿,\.\!]*\s*/gi, "")
    .replace(/^buenos dias\s*[😊🙏❤️✨🌿,\.\!]*\s*/gi, "")
    .replace(/^buenas tardes\s*[😊🙏❤️✨🌿,\.\!]*\s*/gi, "")
    .replace(/^buenas noches\s*[😊🙏❤️✨🌿,\.\!]*\s*/gi, "");

  texto = texto
    .replace(/¿[^?]*(quieres|te interesa|te gustaría|te gustaria|te cuento|te explico|te ayudo|puedo ayudarte|hay algo más|hay algo mas|te parece|te comparto|te paso|en qué más puedo ayudarte|en que mas puedo ayudarte)[^?]*\?/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return texto;
}

function cierrePago() {
  const cierres = [
    `💌 Si deseas apoyar este proyecto espiritual, puedes hacerlo por transferencia bancaria o depósito en Oxxo ✨

¿Cuál método prefieres? 🙏`,

    `💌 Tu contribución ayuda a que este devocional siga llegando a más personas. Puedes apoyar por transferencia bancaria o depósito en Oxxo ✨

¿Qué método prefieres? 🙏`,

    `💌 Para realizar tu contribución puedes elegir transferencia bancaria o depósito en efectivo en Oxxo ✨

¿Cuál opción prefieres? 🙏`,
  ];

  return elegirAleatoria(cierres);
}

function agregarCierre(texto) {
  const limpio = limpiarRespuesta(texto);

  if (!limpio) {
    return cierrePago();
  }

  return `${limpio}

${cierrePago()}`;
}

function respuestaDirecta(textoNormalizado) {
  if (
    textoNormalizado.includes("catolico") ||
    textoNormalizado.includes("catolica") ||
    textoNormalizado.includes("religion") ||
    textoNormalizado.includes("religioso") ||
    textoNormalizado.includes("cristiano") ||
    textoNormalizado.includes("cristiana") ||
    textoNormalizado.includes("biblia") ||
    textoNormalizado.includes("salmos")
  ) {
    const respuestasReligion = [
      `"150 Días a Través de los Salmos" es un devocional basado en los Salmos de la Biblia 🌿

Está pensado para ayudarte a reflexionar, fortalecer tu fe y acercarte más a Dios cada día de una forma sencilla y espiritual.`,

      `Es un devocional bíblico basado en los Salmos 🙏

No es un libro físico ni de una denominación específica; es una guía espiritual en PDF para estudiar y reflexionar con calma cada día.`,

      `El material está basado en los Salmos de la Biblia 🌿

Puedes estudiarlo con la Biblia que tengas en casa y usarlo como apoyo para tu devocional diario.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasReligion));
  }

  if (
    textoNormalizado.includes("no recibi") ||
    textoNormalizado.includes("no me llego") ||
    textoNormalizado.includes("no llego") ||
    textoNormalizado.includes("no veo") ||
    textoNormalizado.includes("donde esta") ||
    textoNormalizado.includes("donde lo encuentro") ||
    textoNormalizado.includes("ya recibi") ||
    textoNormalizado.includes("recibi") ||
    textoNormalizado.includes("envio") ||
    textoNormalizado.includes("enviar") ||
    textoNormalizado.includes("entrega") ||
    textoNormalizado.includes("domicilio") ||
    textoNormalizado.includes("fisico") ||
    textoNormalizado.includes("pdf") ||
    textoNormalizado.includes("digital") ||
    textoNormalizado.includes("descargar") ||
    textoNormalizado.includes("recibir") ||
    textoNormalizado.includes("recibo") ||
    textoNormalizado.includes("archivo") ||
    textoNormalizado.includes("entrego") ||
    textoNormalizado.includes("llega") ||
    textoNormalizado.includes("formato")
  ) {
    const respuestasEnvio = [
      `El devocional es completamente digital en PDF 😊

Se entrega aquí mismo por WhatsApp. Si no lo ves, revisa un poquito más arriba en esta conversación, porque el archivo se envía directamente por este medio 🌿`,

      `No es entrega a domicilio ni libro físico 🙏

Es un archivo digital en PDF y se recibe directamente en esta conversación de WhatsApp para que puedas abrirlo desde tu celular o computadora ✨`,

      `El material se entrega en formato PDF 😊

Lo recibes aquí mismo por WhatsApp, antes de realizar tu contribución. Si no aparece a simple vista, puedes revisar más arriba en el chat 🌿`,

      `La entrega es digital y directa por WhatsApp 😊

No se manda por paquetería ni por correo. El PDF queda enviado en esta misma conversación para que puedas descargarlo cuando lo necesites 🌿`,
    ];

    return agregarCierre(elegirAleatoria(respuestasEnvio));
  }

  if (
    textoNormalizado.includes("cuanto") ||
    textoNormalizado.includes("cuesta") ||
    textoNormalizado.includes("precio") ||
    textoNormalizado.includes("costo") ||
    textoNormalizado.includes("vale") ||
    textoNormalizado.includes("apoyo") ||
    textoNormalizado.includes("apoyar") ||
    textoNormalizado.includes("aportacion") ||
    textoNormalizado.includes("contribucion") ||
    textoNormalizado.includes("donacion") ||
    textoNormalizado.includes("pagar") ||
    textoNormalizado.includes("pago") ||
    textoNormalizado.includes("deposito") ||
    textoNormalizado.includes("oxxo") ||
    textoNormalizado.includes("transferencia")
  ) {
    const respuestasPago = [
      `El devocional se comparte primero como una bendición 🙏

Después, si nace en tu corazón apoyar este proyecto espiritual, las contribuciones sugeridas son:
🌿 90 MXN como apoyo sencillo
🌿 110 MXN como apoyo al proyecto
🌿 130 MXN para ayudar a que llegue a más personas`,

      `El material se entrega antes de la contribución, con mucho cariño 😊

Puedes apoyar el proyecto con una de estas referencias:
🌿 90 MXN
🌿 110 MXN
🌿 130 MXN`,

      `La contribución es voluntaria y ayuda a sostener este proyecto espiritual 🙏

Puedes apoyar con:
🌿 90 MXN como apoyo sencillo
🌿 110 MXN como apoyo al proyecto
🌿 130 MXN para que este mensaje llegue a más personas`,
    ];

    return agregarCierre(elegirAleatoria(respuestasPago));
  }

  return null;
}

app.get("/", (req, res) => {
  res.send("Bot ventas activo ✅");
});

app.post("/mensaje", async (req, res) => {
  try {
    const texto = req.body.texto || req.body.mensaje || req.body.message || "";

    console.log("Texto recibido:", texto);

    if (!texto) {
      return res.json({ respuesta: cierrePago() });
    }

    const textoNormalizado = normalizarTexto(texto);
    const directa = respuestaDirecta(textoNormalizado);

    if (directa) {
      console.log("Respuesta directa:", directa);
      return res.json({ respuesta: directa });
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      temperature: 0.4,
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: texto },
      ],
    });

    const respuestaIA = response.output_text || "";
    const respuestaFinal = agregarCierre(respuestaIA);

    console.log("Respuesta enviada:", respuestaFinal);

    return res.json({ respuesta: respuestaFinal });
  } catch (error) {
    console.error("Error en /mensaje:", error);

    return res.json({ respuesta: cierrePago() });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
