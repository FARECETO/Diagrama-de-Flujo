let selectedElement = null;

const contextMenu =
document.getElementById("contextMenu");

const fillPicker =
document.getElementById("fillColorPicker");

const strokePicker =
document.getElementById("strokeColorPicker");

document
.getElementById("themeToggle")
.addEventListener("click", ()=>{

  document.body.classList.toggle("dark");

  updateSVGTheme();
});

document
.getElementById("fontSelector")
.addEventListener("change",(e)=>{

  document.body.style.fontFamily =
  e.target.value;
});

const svg = document.getElementById("diagramSVG");

document.getElementById("renderBtn")
.addEventListener("click", renderDiagram);

document.getElementById("exportPNG")
.addEventListener("click", exportPNG);

document.getElementById("exportPDF")
.addEventListener("click", exportPDF);

renderDiagram();

function renderDiagram(){

  svg.innerHTML = "";

  const input = document.getElementById("jsonInput").value;

  let data;

  try{
    data = JSON.parse(input);
  }catch(error){
    alert("JSON inválido");
    return;
  }

  const width = 1200;
  
  // Forzamos un ancho simétrico y estético para el carril de flujo principal
  const stageWidth = 260; 

  const centerX = width / 2;
  let currentY = 120;

  svg.setAttribute("width", width);
  // Ajuste dinámico de la altura total del canvas para que no se corte al final
  svg.setAttribute("height", data.stages.length * 190 + 100);

  /* ==========================================
     TÍTULO PRINCIPAL
     ========================================== */
  addText(
    centerX,
    50,
    data.process_name,
    "title-text",
    "middle"
  );

  /* ==========================================
     RENDERIZADO DE ETAPAS
     ========================================== */
  data.stages.forEach((stage, index)=>{

    // 1. Dibujamos la caja central y obtenemos sus medidas reales
    let box = addCenteredBox(
      centerX,
      currentY + 35,
      stage.title,
      "stage-box",
      "stage-text"
    );

    // Separación constante que quieres entre la caja central y los parámetros (en píxeles)
    const gap = 40; 
    // Ancho fijo que tienen tus cajitas de parámetros
    const paramWidth = 200; 

    // 2. CÁLCULO DINÁMICO DE PARAM_X (Se adapta al ancho de la caja central)
    const paramX =
      stage.notes_position === "left"
        ? centerX - (box.rectWidth / 2) - gap - paramWidth // Se mueve a la izquierda según el ancho de la caja
        : centerX + (box.rectWidth / 2) + gap;             // Se mueve a la derecha según el ancho de la caja

    // 3. Dibujar cada uno de los parámetros
    stage.parameters.forEach((param, pIndex) => {

      const spacing = 50;
      const totalHeight = (stage.parameters.length - 1) * spacing;
      const centerBoxY = currentY + 35;
      const startY = centerBoxY - (totalHeight / 2);
      const boxY = startY + (pIndex * spacing);

      const typeClass =
        param.type === "ingredient"
          ? "ingredient"
          : "physical";

      // Dibujar Rectángulo del Parámetro
      addRect(
        paramX,
        boxY,
        paramWidth,
        35,
        `parameter-box ${typeClass}`
      );

      // Dibujar Texto del Parámetro
      addText(
        paramX + 100,
        boxY + 17.5,
        `${param.label}: ${param.value}`,
        "parameter-text",
        "middle"
      );

      /* ==========================================
         LÍNEAS DIAGONALES (CONEXIÓN PERFECTA)
         ========================================== */
   /* ==========================================
         RAMIFICACIONES INTELIGENTES CON FLECHAS HORIZONTALES
         ========================================== */
      const stageBoxEdgeX = stage.notes_position === "left" 
        ? centerX - (box.rectWidth / 2) 
        : centerX + (box.rectWidth / 2);

      const paramEdgeX = stage.notes_position === "left" ? paramX + paramWidth : paramX;

      // CASO A: SI SÓLO HAY 1 PARÁMETRO (Línea directa y nivelada)
      if (stage.parameters.length === 1) {
        // Coloca el puntito a la altura exacta de la cajita del parámetro
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", stageBoxEdgeX);
        circle.setAttribute("cy", boxY + 17.5);
        circle.setAttribute("r", "4");
circle.setAttribute("class", "connector-arrow"); // Añadido para el modo oscuro
circle.setAttribute("fill", "#1e293b"); 
svg.appendChild(circle);

        addHorizontalArrow(stageBoxEdgeX, boxY + 17.5, paramEdgeX, boxY + 17.5, stage.notes_position);
      } 
      // CASO B: SI HAY MÁS DE 1 PARÁMETRO (Estructura de gusano con flechas en las puntas)
      else {
        // El puntito negro se queda en el centro de la etapa para el tronco principal
        if (pIndex === 0) {
          const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          circle.setAttribute("cx", stageBoxEdgeX);
          circle.setAttribute("cy", currentY + 35);
          circle.setAttribute("r", "4");
          circle.setAttribute("fill", "#1e293b"); 
          svg.appendChild(circle);
        }

        const trunkLineX = stage.notes_position === "left" ? stageBoxEdgeX - 20 : stageBoxEdgeX + 20;

        if (pIndex === 0) {
          addLine(stageBoxEdgeX, currentY + 35, trunkLineX, currentY + 35);

          const firstParamY = centerBoxY - (((stage.parameters.length - 1) * spacing) / 2) + 17.5;
          const lastParamY = firstParamY + ((stage.parameters.length - 1) * spacing);
          addLine(trunkLineX, firstParamY, trunkLineX, lastParamY);
        }

        addHorizontalArrow(trunkLineX, boxY + 17.5, paramEdgeX, boxY + 17.5, stage.notes_position);
      }
    });
function addHorizontalArrow(x1, y1, x2, y2, side) {
  // Dibuja la línea recta conectora
  addLine(x1, y1, x2, y2);

  // Dibuja la punta de la flecha orientada lateralmente
  const arrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  
  if (side === "left") {
    // Apunta hacia la izquierda (Para parámetros en el lado izquierdo)
    arrow.setAttribute("points", `${x2+10},${y2-5} ${x2+10},${y2+5} ${x2},${y2}`);
  } else {
    // Apunta hacia la derecha (Para parámetros en el lado derecho)
    arrow.setAttribute("points", `${x2-10},${y2-5} ${x2-10},${y2+5} ${x2},${y2}`);
  }

  arrow.setAttribute("class", "connector-arrow");
arrow.setAttribute("fill", "#1e293b");
svg.appendChild(arrow);
}
  /* ==========================================
   CONECTOR INTER-ETAPAS COMPACTO
   ========================================== */
if (index < data.stages.length - 1) {
  // La siguiente caja comenzará exactamente en: currentY + 110 + 35 (menos la mitad de su altura aproximada)
  // Para que la flecha muera justo en el borde superior de la siguiente caja sin dejar aire:
  const nextBoxTopY = currentY + 110 + 35 - (box.rectHeight / 2);

  addArrow(
    centerX,
    currentY + 35 + (box.rectHeight / 2), // Sale del borde inferior de la caja actual
    centerX,
    nextBoxTopY                           // Toca exactamente el inicio de la siguiente caja
  );
}

// Juntamos los rectángulos centrales reduciendo el paso vertical de 140 a 110
currentY += 110;
  });

  updateSVGTheme();
}


/* ==========================================
   FUNCIONES DE CONSTRUCCIÓN SVG
   ========================================== */

function addRect(x,y,w,h,className){
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", x);
  rect.setAttribute("y", y);
  rect.setAttribute("width", w);
  rect.setAttribute("height", h);
  rect.setAttribute("class", className);

  // Evento de doble click
  rect.addEventListener("dblclick",(e)=>{
    selectedElement = rect;
    contextMenu.style.display = "flex";
    contextMenu.style.left = e.pageX + "px";
    contextMenu.style.top = e.pageY + "px";
  });

  svg.appendChild(rect);
}

function addText(x,y,text,className,anchor){
  const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
  txt.setAttribute("x", x);
  txt.setAttribute("y", y);
  txt.setAttribute("class", className);
  txt.setAttribute("text-anchor", anchor);
  
  // Centrado vertical real y tipografía sólida
  txt.setAttribute("dominant-baseline", "middle");
  txt.setAttribute("alignment-baseline", "middle");
  txt.setAttribute("font-weight", "700");
  txt.textContent = text;

  svg.appendChild(txt);
}

function addCenteredBox(xCenter, y, text, classRect, classText) {
  // 1. Crear el nodo de texto primero para poder medirlo
  const tempText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  tempText.setAttribute("x", xCenter);
  tempText.setAttribute("y", y);
  tempText.setAttribute("class", classText);
  tempText.setAttribute("text-anchor", "middle");
  tempText.setAttribute("dominant-baseline", "middle");
  tempText.setAttribute("alignment-baseline", "middle");
  tempText.setAttribute("font-weight", "700");
  tempText.textContent = text;

  svg.appendChild(tempText);

  // 2. Calcular las dimensiones basadas en el texto real
  const bbox = tempText.getBBox();
  const paddingX = 35;
  const paddingY = 15;

  // Forzamos un ancho mínimo de 260px para que las etapas tengan uniformidad visual
  const rectWidth = Math.max(240, bbox.width + paddingX * 2);
  const rectHeight = bbox.height + paddingY * 2;

  const rectX = xCenter - rectWidth / 2;
  const rectY = y - rectHeight / 2;

  // 3. Crear el fondo contenedor
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", rectX);
  rect.setAttribute("y", rectY);
  rect.setAttribute("width", rectWidth);
  rect.setAttribute("height", rectHeight);
  rect.setAttribute("class", classRect);
  
  // Pequeño radio en las esquinas para suavizar las cajas principales
  rect.setAttribute("rx", "4"); 
  rect.setAttribute("ry", "4");

  // 4. Reordenar en el árbol SVG: Colocar el rectángulo justo detrás de su texto correspondiente
  svg.insertBefore(rect, tempText);

  return { rectWidth, rectHeight };
}

function addLine(x1,y1,x2,y2){
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("class", "connector");

  svg.appendChild(line);
}

function addArrow(x1,y1,x2,y2){
  // Dibuja la línea del cuerpo de la flecha
  addLine(x1,y1,x2,y2);

  // Dibuja la punta de la flecha (Triángulo equilátero estilizado hacia abajo)
  const arrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  arrow.setAttribute(
    "points",
    `
      ${x2-6},${y2-10}
      ${x2+6},${y2-10}
      ${x2},${y2}
    `
  );

  arrow.setAttribute("fill","#334155"); // Cambiado a #334155 para consistencia
  svg.appendChild(arrow);
}

function serializeSvgWithStyles(svg) {
  const clone = svg.cloneNode(true);
  const styleSheets = document.styleSheets;
  let cssText = "";

  for (const sheet of styleSheets) {
    try {
      const rules = sheet.cssRules;
      if (!rules) continue;

      for (const rule of rules) {
        cssText += rule.cssText;
      }
    } catch (e) {}
  }

  const style = document.createElement("style");
  style.textContent = cssText;
  clone.insertBefore(style, clone.firstChild);

  const serializer = new XMLSerializer();
  return serializer.serializeToString(clone);
}


/* =========================
   EXPORTAR PNG
========================= */

function getSvgSize(svg) {
  const rect = svg.getBoundingClientRect();

  return {
    width: rect.width,
    height: rect.height
  };
}

async function exportPNG() {
  const svg = document.getElementById("diagramSVG");

  const source = serializeSvgWithStyles(svg);

  const blob = new Blob([source], {
    type: "image/svg+xml;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.crossOrigin = "anonymous";

  img.onload = () => {
    const rect = svg.getBoundingClientRect();

    const scale = 4;

    const canvas = document.createElement("canvas");

    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;

    const ctx = canvas.getContext("2d");

    ctx.scale(scale, scale);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.drawImage(img, 0, 0, rect.width, rect.height);

    const a = document.createElement("a");
    a.download = "diagrama.png";
    a.href = canvas.toDataURL("image/png");
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  img.src = url;
}


/* =========================
   EXPORTAR PDF
========================= */

async function exportPDF() {
  const svg = document.getElementById("diagramSVG");

  const source = serializeSvgWithStyles(svg);

  const blob = new Blob([source], {
    type: "image/svg+xml;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);

  const img = new Image();

  img.onload = () => {
    const rect = svg.getBoundingClientRect();

    const scale = 4;

    const canvas = document.createElement("canvas");

    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;

    const ctx = canvas.getContext("2d");

    ctx.scale(scale, scale);

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.drawImage(img, 0, 0, rect.width, rect.height);

    const imgData = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
      unit: "mm",
      format: "a4"
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgHeightMM = (rect.height * pageWidth) / rect.width;

    let heightLeft = imgHeightMM;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeightMM);

    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeightMM);
      heightLeft -= pageHeight;
    }

    pdf.save("diagrama.pdf");

    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  img.src = url;
}


fillPicker.addEventListener("input",()=>{

  if(selectedElement){

    selectedElement.style.fill =
    fillPicker.value;
  }
});

strokePicker.addEventListener("input",()=>{

  if(selectedElement){

    selectedElement.style.stroke =
    strokePicker.value;
  }
});

window.addEventListener("click",()=>{

  contextMenu.style.display = "none";
});


function updateSVGTheme(){

  const isDark =
  document.body.classList.contains("dark");

  /* =========================
     TEXTOS PRINCIPALES
  ========================= */

  document
  .querySelectorAll(".stage-text")
  .forEach(el=>{

    el.setAttribute(
      "fill",
      isDark ? "#ffffff" : "#111827"
    );
  });

  /* =========================
     TEXTOS PARÁMETROS
  ========================= */

  document
  .querySelectorAll(".parameter-text")
  .forEach(el=>{

    el.setAttribute(
      "fill",
      isDark ? "#f8fafc" : "#111827"
    );
  });

  /* =========================
     TÍTULO
  ========================= */

  document
  .querySelectorAll(".title-text")
  .forEach(el=>{

    el.setAttribute(
      "fill",
      isDark ? "#ffffff" : "#111827"
    );
  });

  /* =========================
     CONECTORES
  ========================= */

  document
  .querySelectorAll(".connector")
  .forEach(el=>{

    el.setAttribute(
      "stroke",
      isDark ? "#e2e8f0" : "#334155"
    );
  });

  /* =========================
     FLECHAS Y PUNTOS DE UNIÓN
  ========================= */

  document
  .querySelectorAll("polygon, .connector-arrow")
  .forEach(el=>{

    el.setAttribute(
      "fill",
      isDark ? "#e2e8f0" : "#334155"
    );
  });


  /* =========================
     BLOQUES PRINCIPALES
  ========================= */

  document
  .querySelectorAll(".stage-box")
  .forEach(el=>{

    el.setAttribute(
      "fill",
      isDark ? "#1e293b" : "#ffffff"
    );

    el.setAttribute(
      "stroke",
      isDark ? "#cbd5e1" : "#334155"
    );
  });
}


// Escuchador para el nuevo botón de conversión de texto plano a JSON
import { GoogleGenerativeAI } from "@google/generative-ai";

// Al cargar la página, se recupera la clave si ya se guardó antes
window.addEventListener("DOMContentLoaded", () => {
  const savedKey = localStorage.getItem("user_gemini_key");
  if (savedKey) {
    document.getElementById("apiKeyInput").value = savedKey;
  }
});

document.getElementById("convertTextBtn").addEventListener("click", async () => {
  const rawText = document.getElementById("rawTextInput").value;
  const convertBtn = document.getElementById("convertTextBtn");

  // Captura la clave directamente desde la pantalla
  const currentApiKey = document.getElementById("apiKeyInput").value.trim();

  if (!rawText.trim()) {
    alert("Por favor, ingresa el texto del proceso primero.");
    return;
  }

  // Validación de seguridad en vivo
  if (!currentApiKey || currentApiKey === "") {
    alert("⚠️ Por favor, introduce tu API Key en el campo de la barra superior de la página.");
    return;
  }

  // Guarda la clave localmente para que no tengas que pegarla cada vez
  localStorage.setItem("user_gemini_key", currentApiKey);

  // Inicializa la IA con la clave dinámica de la pantalla
  const genAI = new GoogleGenerativeAI(currentApiKey);

  convertBtn.disabled = true;
  convertBtn.innerText = "🤖 IA Analizando Texto...";
  
  // El Prompt del sistema: Entrenamos a la IA sobre cómo empaquetar los datos exactos que tu SVG requiere
  const prompt = `
    Eres un Editor Gráfico Científico experto en maquetación de tesis y artículos indexados bajo las normas APA de la 7ma edición.
    
    Analiza minuciosamente el siguiente informe técnico o procedimiento de laboratorio y transfórmalo a un objeto JSON estructurado que sirva para generar una figura académica profesional.
    
    REGLAS ESTRICTAS DE CONTENIDO Y REDACCIÓN (ESTÁNDAR APA 7):
    1. TÍTULO GENERAL ("process_name"): Extrae el nombre general del proceso en formato conciso (Ej: "Línea de procesamiento de pulpa congelada").
    2. ETAPAS ("stages"): Identifica cada operación unitaria o paso cronológico. Limpia cualquier numeración manual o viñetas (ej: cambia "3.2.1 Pesado" a "Pesado"). Usa verbos en infinitivo o sustantivos técnicos formales (ej: "Recepción", "Estandarización", "Pasteurización").
    3. PARÁMETROS CRÍTICOS ("parameters"): Extrae únicamente las variables operacionales indispensables (Temperatura, Tiempo, pH, Concentración, Insumo, Rendimiento).
    4. REGLA DE ORO DE LONGITUD ACADÉMICA: Tanto el 'label' como el 'value' deben ser ultra concisos (máximo 2 o 3 palabras). Usa abreviaturas científicas correctas cuando aplique (ej: "90 °C", "15 min", "ppm", "Brix").
    5. CLASIFICACIÓN DE TIPO ("type"): 
       - Asigna "ingredient" exclusivamente a reactivos químicos, aditivos, agua o materias primas.
       - Asigna "physical" a las variables físicas operacionales de control (tiempo, temperatura, tamiz, pH).
    6. SIMETRÍA VISUAL ("notes_position"): Para lograr una figura balanceada y simétrica, alterna de forma estricta la posición entre "right" y "left" en cada etapa sucesiva (etapa 1: right, etapa 2: left, etapa 3: right, etc.).

    RESPONDE EXCLUSIVAMENTE CON EL SIGUIENTE FORMATO JSON PURO (Sin bloques de código \`\`\`json, sin texto adicional antes o después):
    {
      "process_name": "Nombre de la figura",
      "stages": [
        {
          "title": "Operación Unitaria",
          "notes_position": "right o left alternados",
          "parameters": [
            { "label": "Variable", "value": "Medida", "type": "ingredient o physical" }
          ]
        }
      ]
    }

    Texto técnico a procesar:
    ${rawText}
  `;

  try {
    // Usamos el modelo optimizado Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let cleanJsonText = response.text().trim();

    // Limpieza de seguridad por si la IA introduce formato markdown ```json
    if (cleanJsonText.startsWith("```")) {
      cleanJsonText = cleanJsonText.replace(/```json|```/g, "").trim();
    }

    // Probar si el JSON devuelto es válido y renderizar
    JSON.parse(cleanJsonText); 
    
    document.getElementById("jsonInput").value = cleanJsonText;
    
    // Ejecutar renderizado del SVG instantáneamente
    renderDiagram();

  } catch (error) {
    console.error("Error con Gemini IA:", error);
    alert("Hubo un percance procesando el texto con la IA. Asegúrate de que tu API Key sea correcta.");
  } finally {
    // Restaurar estado del botón
    convertBtn.disabled = false;
    convertBtn.innerText = "⚡ Convertir a JSON";
  }
});