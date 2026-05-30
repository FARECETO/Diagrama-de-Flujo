// ==========================================
// ESTADO GLOBAL DE LA BARRA DE HERRAMIENTAS INTERACTIVA
// ==========================================
let currentSelectedBox = null;
let currentSelectedText = null;

// Inicialización segura cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  const diagramToolbar = document.getElementById("diagramToolbar");
  const toolbarBold = document.getElementById("toolbarBold");
  const toolbarTextColor = document.getElementById("toolbarTextColor");
  const toolbarBgColor = document.getElementById("toolbarBgColor");
  const toolbarBorderColor = document.getElementById("toolbarBorderColor");
  const toolbarClose = document.getElementById("toolbarClose");

  if (toolbarBgColor) {
    toolbarBgColor.addEventListener("input", function() {
      if (currentSelectedBox) {
        currentSelectedBox.style.fill = toolbarBgColor.value;
        currentSelectedBox.setAttribute("fill", toolbarBgColor.value);
      }
    });
  }
  if (toolbarBorderColor) {
    toolbarBorderColor.addEventListener("input", function() {
      if (currentSelectedBox) {
        currentSelectedBox.style.stroke = toolbarBorderColor.value;
        currentSelectedBox.setAttribute("stroke", toolbarBorderColor.value);
      }
    });
  }
  if (toolbarTextColor) {
    toolbarTextColor.addEventListener("input", function() {
      if (currentSelectedText) {
        currentSelectedText.style.fill = toolbarTextColor.value;
        currentSelectedText.setAttribute("fill", toolbarTextColor.value);
      }
    });
  }
  if (toolbarBold) {
    toolbarBold.addEventListener("click", function() {
      if (currentSelectedText) {
        const currentWeight = currentSelectedText.style.fontWeight || currentSelectedText.getAttribute("font-weight");
        const isBold = currentWeight === "bold" || currentWeight === "700" || currentWeight === "800";
        currentSelectedText.style.fontWeight = isBold ? "normal" : "bold";
        toolbarBold.classList.toggle("active", !isBold);
      }
    });
  }
  if (toolbarClose) {
    toolbarClose.addEventListener("click", closeToolbar);
  }
  
  document.addEventListener("click", function(e) {
    if (diagramToolbar && !diagramToolbar.contains(e.target)) {
      closeToolbar();
    }
  });
});

function closeToolbar() {
  const diagramToolbar = document.getElementById("diagramToolbar");
  if (diagramToolbar) diagramToolbar.style.display = "none";
  currentSelectedBox = null;
  currentSelectedText = null;
}

function rgbToHex(rgb) {
  if (!rgb) return "#ffffff";
  if (rgb.startsWith("#")) return rgb;
  const rgbValues = rgb.match(/\d+/g);
  if (!rgbValues) return "#ffffff";
  const r = parseInt(rgbValues[0]).toString(16).padStart(2, '0');
  const g = parseInt(rgbValues[1]).toString(16).padStart(2, '0');
  const b = parseInt(rgbValues[2]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

// Función global que será llamada desde el renderizador
window.openFloatingToolbar = function(boxElement, textElement, mouseX, mouseY, hasBackground = true) {
  currentSelectedBox = boxElement;
  currentSelectedText = textElement;
  
  const diagramToolbar = document.getElementById("diagramToolbar");
  const toolbarBold = document.getElementById("toolbarBold");
  const toolbarTextColor = document.getElementById("toolbarTextColor");
  const toolbarBgColor = document.getElementById("toolbarBgColor");
  const toolbarBorderColor = document.getElementById("toolbarBorderColor");

  if (!diagramToolbar) return;

  // Si es el título (hasBackground = false), ocultamos los selectores RGB de fondo y borde
  if (!hasBackground) {
    if (toolbarBgColor) toolbarBgColor.parentElement.style.display = "none";
    if (toolbarBorderColor) toolbarBorderColor.parentElement.style.display = "none";
    
    // Cargar solo el color del texto del título
    const currentTextColor = window.getComputedStyle(boxElement).fill || boxElement.getAttribute("fill") || "#111827";
    if (toolbarTextColor) toolbarTextColor.value = rgbToHex(currentTextColor);
  } else {
    // Si es una caja normal, mostramos todo
    if (toolbarBgColor) toolbarBgColor.parentElement.style.display = "flex";
    if (toolbarBorderColor) toolbarBorderColor.parentElement.style.display = "flex";

    const currentFill = window.getComputedStyle(boxElement).fill || boxElement.getAttribute("fill") || "#ffffff";
    const currentStroke = window.getComputedStyle(boxElement).stroke || boxElement.getAttribute("stroke") || "#d1d5db";
    
    if (toolbarBgColor) toolbarBgColor.value = rgbToHex(currentFill);
    if (toolbarBorderColor) toolbarBorderColor.value = rgbToHex(currentStroke);

    if (currentSelectedText) {
      const currentTextColor = window.getComputedStyle(textElement).fill || textElement.getAttribute("fill") || "#111827";
      if (toolbarTextColor) toolbarTextColor.value = rgbToHex(currentTextColor);
    }
  }

  // Verificar la negrita
  if (currentSelectedText) {
    const currentWeight = window.getComputedStyle(textElement).fontWeight || textElement.getAttribute("font-weight");
    if (toolbarBold) {
      if (currentWeight === "bold" || currentWeight === "700" || currentWeight === "800") {
        toolbarBold.classList.add("active");
      } else {
        toolbarBold.classList.remove("active");
      }
    }
  }

  diagramToolbar.style.left = `${mouseX}px`;
  diagramToolbar.style.top = `${mouseY - 15}px`;
  diagramToolbar.style.display = "flex";
};



let selectedElement = null;

const contextMenu =
document.getElementById("contextMenu");

const fillPicker =
document.getElementById("fillColorPicker");

const strokePicker = document.getElementById("strokeColorPicker");
const textPicker = document.getElementById("textColorPicker"); // NUEVO: Para cambiar color de texto
const boldToggle = document.getElementById("boldToggle"); // NUEVO: Para activar/desactivar negrita

document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  updateSVGTheme();
});

// NUEVO: Manejador de cambio de fuente extendido
document.getElementById("fontSelector").addEventListener("change", (e) => {
  document.body.style.fontFamily = e.target.value;
  // También actualizamos las propiedades dentro del SVG dinámicamente
  document.querySelectorAll("#diagramSVG text").forEach(txt => {
    txt.style.fontFamily = e.target.value;
  });
});

// NUEVO: Escuchador para cambiar el grosor de letra (Negrita)
if (boldToggle) {
  boldToggle.addEventListener("change", (e) => {
    if (selectedElement) {
      // Si seleccionamos una caja, buscamos su texto asociado o viceversa
      const parent = selectedElement.parentNode;
      const textNode = parent.tagName === "text" ? selectedElement : parent.querySelector("text");
      if (textNode) {
        textNode.style.fontWeight = e.target.checked ? "700" : "400";
      }
    }
  });
}

// NUEVO: Escuchador para cambiar color de texto directamente
if (textPicker) {
  textPicker.addEventListener("input", () => {
    if (selectedElement) {
      const textNode = selectedElement.tagName === "text" ? selectedElement : selectedElement.parentNode.querySelector("text");
      if (textNode) {
        textNode.setAttribute("fill", textPicker.value);
      }
    }
  });
}

const svg = document.getElementById("diagramSVG");

document.getElementById("renderBtn")
.addEventListener("click", renderDiagram);

document.getElementById("exportPNG")
.addEventListener("click", exportPNG);

document.getElementById("exportPDF")
.addEventListener("click", exportPDF);

function renderDiagram(){

  svg.innerHTML = "";

  const input = document.getElementById("jsonInput").value;

  let data;

  try {
    const rawData = JSON.parse(input);
    
    if (rawData.nodes && Array.isArray(rawData.nodes)) {
      data = {
        process_name: rawData.title || "Diagrama de Flujo",
        stages: []
      };

      // 1. Filtrar procesos del eje central (excluyendo ramas secundarias del JSON de red)
      const mainProcesses = rawData.nodes.filter(n => n.type === "process" && 
        !n.id.startsWith("p4_g") && !n.id.startsWith("p5_g") && !n.id.startsWith("p6_g") && 
        !n.id.startsWith("p4_c") && !n.id.startsWith("p5_c") && !n.id.startsWith("p6_c") && !n.id.startsWith("p7_c")
      );

      // Agregar nodo inicial como primer bloque central
      const inicioNode = rawData.nodes.find(n => n.id === "inicio");
      if (inicioNode) {
        data.stages.push({
          title: inicioNode.label,
          notes_position: "right",
          parameters: []
        });
      }

      // 2. Construir la secuencia central inyectando las notas dinámicas de las ramas
      mainProcesses.forEach(proc => {
        const connectedEdges = rawData.edges.filter(e => e.from === proc.id || e.to === proc.id);
        const parameters = [];

        if (proc.params) {
          parameters.push({ label: "", value: proc.params, type: "physical" });
        }

        connectedEdges.forEach(edge => {
          if (edge.from === proc.id && edge.direction === "right") {
            const wasteNode = rawData.nodes.find(n => n.id === edge.to);
            if (wasteNode) {
              parameters.push({ label: "", value: wasteNode.label, type: "physical" });
            }
          }
          if (edge.to === proc.id && edge.direction === "right") {
            const resourceNode = rawData.nodes.find(n => n.id === edge.from);
            if (resourceNode) {
              parameters.push({ label: "", value: resourceNode.label, type: "ingredient" });
            }
          }
        });

        // Inyección simétrica de la Bifurcación en Paralelo (Idéntico a la segunda imagen de referencia)
        if (proc.id === "p3_desgranado") {
          data.stages.push({
            title: proc.label,
            notes_position: "right",
            parameters: parameters
          });

          data.stages.push({
            title: "Bifurcación Ramas",
            isTwoColumns: true,
            columns: [
              {
                steps: [
                  { title: "Lavado", note: "Agua potable" },
                  { title: "Secado", note: "60°C / 8 h" },
                  { title: "Molienda", note: "Malla 4 mm" }
                ]
              },
              {
                steps: [
                  { title: "Lavado", note: "Agua potable" },
                  { title: "Triturado", note: "Mecánico" },
                  { title: "Secado", note: "60°C / 9 h" },
                  { title: "Molienda", note: "Malla 4 mm" }
                ]
              }
            ]
          });
          return; 
        }

        data.stages.push({
          title: proc.label,
          notes_position: "right",
          parameters: parameters
        });
      });

      // Último nodo
      const finNode = rawData.nodes.find(n => n.id === "fin");
      if (finNode && !data.stages.some(s => s.title === finNode.label)) {
        data.stages.push({
          title: finNode.label,
          notes_position: "right",
          parameters: []
        });
      }

    } else {
      data = rawData;
    }

  } catch (error) {
    alert("Error en estructura: " + error.message);
    return;
  }


  // ==========================================
  // AJUSTE DINÁMICO Y CENTRADO DE LIENZO
  // ==========================================
  const width = 1000;       
  const stageWidth = 280; 

  const centerX = width / 2;
  let currentY = 85;

  // Renderizado dinámico del alto de la escena
  svg.setAttribute("viewBox", `0 0 ${width} ${data.stages.length * 190 + 200}`);
  svg.removeAttribute("width");
  svg.removeAttribute("height");

// ==========================================
  // CONFIGURACIÓN DE MARCADOR DE FLECHA (APA 7)
  // ==========================================
  let defs = svg.querySelector("defs");
  if (!defs) {
    defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.insertBefore(defs, svg.firstChild);
  }
  // Marcador universal dinámico que se auto-orienta según la dirección de la línea
  defs.innerHTML = `
    <marker id="arrow-academic" viewBox="0 0 10 10" refX="6" refY="5" 
            markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--connector)" />
    </marker>
  `;

  // ==========================================
  // DIBUJAR TÍTULO DEL PROCESO (ESTILO APA 7 - JUNTO AL FLUJO)
  // ==========================================
  // Bajado a Y=120 para estar muy cerca del primer rectángulo
// CORRECCIÓN APA 7: Bajamos el título de la coordenada 120 a la 95 para acortar el espacio vacío
  const mainTitleEl = addText(width / 2, 95, data.process_name, "process-title", "middle");
  mainTitleEl.setAttribute("font-size", "22px");
  mainTitleEl.setAttribute("font-weight", "bold");
  mainTitleEl.style.fontSize = "22px";
  mainTitleEl.style.fontWeight = "bold";
  
  mainTitleEl.setAttribute("fill", "var(--text)");

  mainTitleEl.addEventListener("click", function(e) {
    e.stopPropagation();
    if (typeof window.openFloatingToolbar === "function") {
      window.openFloatingToolbar(mainTitleEl, mainTitleEl, e.pageX, e.pageY, false);
    }
  });

  // CORRECCIÓN DE LA FLECHA: Nace pegada al título en 110 y baja limpiamente hasta 
  // la coordenada 150 donde el primer bloque inicia de forma exacta (Y = currentY + 65)
  addArrow(width / 2, 110, width / 2, 150);

  // El flujo de las etapas arranca en 85 para que la primera caja se dibuje exactamente en Y = 150
  currentY = 85;
  /* ==========================================
      RENDERIZADO DE ETAPAS CON MARGEN DE DESPEJE APA 7
      ========================================== */
  data.stages.forEach((stage, index) => {

    const isThreeColumns = stage.parameters && stage.parameters.length === 3 && 
                           (stage.title.toLowerCase().includes("evaluación") || 
                            stage.title.toLowerCase().includes("tratamiento") || 
                            stage.title.toLowerCase().includes("condición"));

    let boxHeight = 45; 

    if (isThreeColumns) {
      /* ==========================================================
         BIFURCACIÓN DE 3 RAMAS (ESTILO EN "T" INVERTIDA PERFECTA APA 7)
         ========================================================== */
      const colWidth = 190; 
      const gapBetween = 35; 
      
      const paramTexts = stage.parameters.map(param => param.value ? param.value : param.label);
      const calculatedWidths = paramTexts.map(text => Math.max(colWidth, text.length * 9.5 + 30));

      const totalParallelWidth = calculatedWidths[0] + calculatedWidths[1] + calculatedWidths[2] + (gapBetween * 2);
      const startX = centerX - (totalParallelWidth / 2);
      
      const xPositions = [
        startX,                                                               
        startX + calculatedWidths[0] + gapBetween,                            
        startX + calculatedWidths[0] + calculatedWidths[1] + (gapBetween * 2) 
      ];

      const boxY = currentY + 65; // Altura donde inician las cajas de parámetros

      const firstBoxCenter = xPositions[0] + (calculatedWidths[0] / 2);
      const lastBoxCenter = xPositions[2] + (calculatedWidths[2] / 2);
      
      // 1. Flecha central vertical que baja del bloque anterior directo hasta el eje de distribución
      addArrow(centerX, currentY, centerX, currentY + 30);

      // 2. Línea horizontal de distribución perfectamente centrada y limpia (sin puntas extras en medio)
      addLine(firstBoxCenter, currentY + 30, lastBoxCenter, currentY + 30);

      stage.parameters.forEach((param, pIndex) => {
        const currentBoxX = xPositions[pIndex];
        const currentBoxWidth = calculatedWidths[pIndex];
        const targetColumnCenterX = currentBoxX + (currentBoxWidth / 2);
        const typeClass = param.type === "ingredient" ? "ingredient" : "physical";

        // 3. Tres flechas verticales independientes que nacen desde el eje horizontal común
        // Con despeje de -6px para que la punta de la flecha flote elegantemente sobre la caja
        addArrow(targetColumnCenterX, currentY + 30, targetColumnCenterX, boxY - 6);

        const rect = addRect(currentBoxX, boxY, currentBoxWidth, 42, `stage-box ${typeClass}`);
        rect.setAttribute("rx", "8");
        rect.setAttribute("ry", "8");
        
        addText(targetColumnCenterX, boxY + 24, paramTexts[pIndex], "stage-text", "middle");
      });

      // 4. Cierre y acoplamiento inferior simétrico
      const bottomLineY = boxY + 42 + 35; 
      
      // Línea colectora horizontal inferior
      addLine(firstBoxCenter, bottomLineY, lastBoxCenter, bottomLineY);
      
      stage.parameters.forEach((param, pIndex) => {
        const currentBoxX = xPositions[pIndex];
        const currentBoxWidth = calculatedWidths[pIndex];
        // Líneas verticales que bajan de cada una de las 3 cajas a la barra inferior
        addLine(currentBoxX + (currentBoxWidth / 2), boxY + 42, currentBoxX + (currentBoxWidth / 2), bottomLineY);
      });

      if (index < data.stages.length - 1) {
        // Flecha final que sale del centro de la barra colectora hacia la siguiente etapa del proceso
        addArrow(centerX, bottomLineY, centerX, bottomLineY + 35 - 6);
      }

      currentY = bottomLineY - 30; // Sincroniza el espacio para la siguiente etapa central

   
} else if (stage.isTwoColumns) {
      /* ==========================================================
         BIFURCACIÓN DE 2 RAMAS (SISTEMA ADAPTATIVO SIN LÍNEAS FANTASMAS)
         ========================================================== */
      const colWidth = 200;
      const colGap = 120;
      const xPositions = [centerX - colWidth - colGap/2, centerX + colGap/2];
      
      // Ajustamos la altura de inicio de las cajas para dar un aire visual armónico
      const startBoxY = currentY + 65; 

      // 1. Flecha central vertical que baja levemente del bloque anterior hasta el punto de quiebre
      // CORRECCIÓN: Se detiene exactamente en "currentY + 30" para que no se extienda hacia abajo por el centro vacío
      addArrow(centerX, currentY, centerX, currentY + 30);
      
      // 2. Línea horizontal de distribución limpia que une los ejes de ambas columnas
      const leftTargetX = xPositions[0] + colWidth / 2;
      const rightTargetX = xPositions[1] + colWidth / 2;
      addLine(leftTargetX, currentY + 30, rightTargetX, currentY + 30);

      let maxColumnHeight = 0;

      stage.columns.forEach((col, cIndex) => {
        const colX = xPositions[cIndex];
        const targetColumnCenterX = colX + colWidth / 2;
        let localY = startBoxY;

        // 3. AQUÍ SE GENERAN LAS DOS FLECHAS INDEPENDIENTES AL PRINCIPIO
        // Nacen del eje horizontal (currentY + 30) y caen directamente sobre cada columna (localY - 6)
        addArrow(targetColumnCenterX, currentY + 30, targetColumnCenterX, localY - 6);

        col.steps.forEach((step, sIndex) => {
          const rect = addRect(colX, localY, colWidth, 40, "stage-box");
          rect.setAttribute("rx", "5"); 

          addText(targetColumnCenterX, localY + 23, step.title, "stage-text", "middle");

          if(step.note) {
            const noteX = cIndex === 0 ? colX - 15 : colX + colWidth + 15;
            const anchor = cIndex === 0 ? "end" : "start";
            addText(noteX, localY + 23, step.note, "parameter-text", anchor);
            
            if(cIndex === 0) {
              addArrow(colX, localY + 20, noteX + 9, localY + 20);
            } else {
              addArrow(colX + colWidth, localY + 20, noteX - 9, localY + 20);
            }
          }

          if (sIndex < col.steps.length - 1) {
            localY += 75; 
            // Flechas internas de la columna con despeje de seguridad
            addArrow(targetColumnCenterX, localY - 35, targetColumnCenterX, localY - 6);
          } else {
            localY += 40;
          }
        });

        if (localY > maxColumnHeight) {
          maxColumnHeight = localY;
        }
      });

      // 4. Cierre y acoplamiento inferior en "T" hacia el flujo central
      const mergeY_TwoCol = maxColumnHeight + 35;
      
      // Línea colectora horizontal inferior
      addLine(leftTargetX, mergeY_TwoCol, rightTargetX, mergeY_TwoCol);
      
      stage.columns.forEach((col, cIndex) => {
        const colX = xPositions[cIndex];
        const endColY = startBoxY + ((col.steps.length - 1) * 75) + 40;
        // Líneas verticales que bajan de las columnas a la barra inferior
        addLine(colX + colWidth/2, endColY, colX + colWidth/2, mergeY_TwoCol);
      });

      if (index < data.stages.length - 1) {
        // Flecha final que sale del centro de la barra colectora hacia el siguiente bloque estándar
        addArrow(centerX, mergeY_TwoCol, centerX, mergeY_TwoCol + 35 - 6);
      }

      currentY = mergeY_TwoCol - 30; // Sincroniza el espacio para la siguiente etapa central

        } else {
      /* ==========================================
         DISEÑO ESTÁNDAR CENTRAL CON DESPEJE (AZUL)
         ========================================== */
      const boxY = currentY + 65; 
      let box = addCenteredBox(centerX, boxY, stage.title, "stage-box", "stage-text");

      boxHeight = box.rectHeight;
      const gap = 40; 

if (stage.parameters && stage.parameters.length > 0) {
        let leftIndex = 0;
        let rightIndex = 0;

        const leftCount = stage.parameters.filter(p => (p.position || stage.notes_position || "right") === "left").length;
        const rightCount = stage.parameters.filter(p => (p.position || stage.notes_position || "right") === "right").length;

        stage.parameters.forEach((param, pIndex) => {
          const spacing = 52; 
          const currentPos = param.position || stage.notes_position || "right";
          
          const sideIndex = currentPos === "left" ? leftIndex : rightIndex;
          const sideCount = currentPos === "left" ? leftCount : rightCount;

          const totalHeight = (sideCount - 1) * spacing;
          const startY = boxY - (totalHeight / 2);
          const paramBoxY = startY + (sideIndex * spacing) + (boxHeight / 2) - 16;

          if (currentPos === "left") leftIndex++; else rightIndex++;

          const typeClass = param.type === "ingredient" ? "ingredient" : "physical";
          const fullText = param.label ? `${param.label}: ${param.value}` : param.value;

          const paramWidth = Math.max(170, fullText.length * 8 + 25); 
          const paramX = currentPos === "left"
            ? centerX - (box.rectWidth / 2) - gap - paramWidth 
            : centerX + (box.shadowWidth || box.rectWidth / 2) + gap; 

          // MEJORA: Forzamos el fondo y borde blanco directamente en la creación del SVG
          // Esto permite que el menú de herramientas flotante funcione si deseas cambiar el color después.
          const rectEl = addRect(paramX, paramBoxY, paramWidth, 32, `parameter-box ${typeClass}`);
          if (rectEl) {
            rectEl.setAttribute("fill", "#ffffff");
            rectEl.setAttribute("stroke", "#ffffff");
            rectEl.style.fill = "#ffffff";
            rectEl.style.stroke = "#ffffff";
          }

          // Forzamos el color de texto inicial a gris oscuro elegante para que sea visible
          const textEl = addText(paramX + (paramWidth / 2), paramBoxY + 19, fullText, "parameter-text", "middle");
          if (textEl) {
            textEl.setAttribute("fill", "#111827");
            textEl.style.fill = "#111827";
          }

          const stageBoxEdgeX = currentPos === "left" ? centerX - (box.rectWidth / 2) : centerX + (box.rectWidth / 2);
          const paramEdgeX = currentPos === "left" ? paramX + paramWidth : paramX;

          if (sideCount === 1) {
            let startArrowX = currentPos === "left" ? stageBoxEdgeX - 5 : stageBoxEdgeX + 5;
            let targetX = currentPos === "left" ? paramEdgeX + 6 : paramEdgeX - 6;
            addArrow(startArrowX, paramBoxY + 16, targetX, paramBoxY + 16);
          } else {
            const trunkLineX = currentPos === "left" ? stageBoxEdgeX - 15 : stageBoxEdgeX + 15;

            if (sideIndex === 0) {
              let startTrunkLineX = currentPos === "left" ? stageBoxEdgeX - 5 : stageBoxEdgeX + 5;
              addLine(startTrunkLineX, boxY + (boxHeight / 2), trunkLineX, boxY + (boxHeight / 2));
              
              const startTrunkY = boxY + (boxHeight / 2) - (totalHeight / 2);
              const endTrunkY = startTrunkY + totalHeight;
              addLine(trunkLineX, startTrunkY, trunkLineX, endTrunkY);
            }
            
            let targetX = currentPos === "left" ? paramEdgeX + 6 : paramEdgeX - 6;
            addArrow(trunkLineX, paramBoxY + 16, targetX, paramBoxY + 16);
          }
        });
      }

      if (index < data.stages.length - 1) {
        // Obtenemos una referencia limpia de la siguiente etapa para saber cómo se va a dibujar
        const nextStage = data.stages[index + 1];
        
        if (nextStage.isTwoColumns) {
          // Si el siguiente bloque es una bifurcación de 2 columnas, la línea se dibuja entera hasta el eje horizontal
          addArrow(centerX, boxY + boxHeight, centerX, boxY + boxHeight + 65);
        } else {
          // Si el siguiente bloque es un rectángulo normal estándar, frenamos la punta 6px antes 
          // para que no choque contra la caja, pero manteniendo la distancia compacta original del flujo.
          addArrow(centerX, boxY + boxHeight, centerX, (boxY + boxHeight + 65) - 6);
        }
      }


      currentY = boxY + boxHeight;
    }
  });


  updateSVGTheme();
}

/* ==========================================
   FUNCIONES DE CONSTRUCCIÓN SVG
   ========================================== */

function addRect(x, y, width, height, className) {
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", x);
  rect.setAttribute("y", y);
  rect.setAttribute("width", width);
  rect.setAttribute("height", height);
  rect.setAttribute("class", className);

  // Obtener los colores base según el tema activo (Modo claro/oscuro)
  const isDark = document.body.classList.contains("dark");
  let defaultFill = isDark ? "#1f2937" : "#ffffff";
  let defaultStroke = isDark ? "#374151" : "#d1d5db";

  // Si es un parámetro especial, asignamos color inicial pero modificable
  if (className.includes("ingredient")) {
    defaultFill = isDark ? "#064e3b" : "#ecfdf5";
    defaultStroke = isDark ? "#34d399" : "#10b981";
  } else if (className.includes("physical")) {
    defaultFill = isDark ? "#431407" : "#fff7ed";
    defaultStroke = isDark ? "#fb923c" : "#f97316";
  }

  // Seteamos atributos inline en lugar de depender al 100% del CSS duro
  rect.setAttribute("fill", defaultFill);
  rect.setAttribute("stroke", defaultStroke);
  rect.setAttribute("stroke-width", "1.5");

  // Añadir interactividad de clic para abrir la barra flotante al instante
  rect.addEventListener("click", function(e) {
    e.stopPropagation();
    // Encontrar el elemento de texto hermano correspondiente
    let textElement = rect.nextElementSibling;
    while (textElement && textElement.tagName !== "text") {
      textElement = textElement.nextElementSibling;
    }
    if (typeof window.openFloatingToolbar === "function") {
      window.openFloatingToolbar(rect, textElement, e.pageX, e.pageY, true);
    }
  });

  svg.appendChild(rect);
  return rect;



  // Cambiado de dblclick a un sistema de selección por un solo clic interactivo
  rect.addEventListener("click", (e) => {
    e.stopPropagation(); // Evita que se cierre inmediatamente con el evento window
    
    // Quitar borde de selección previo si existía
    if (selectedElement) {
      selectedElement.style.outline = "none";
    }
    
    selectedElement = rect;
    // Añadimos un pequeño borde de selección brillante para indicar qué elemento se está editando
    rect.style.outline = "2px dashed #3b82f6";
    rect.style.outlineOffset = "2px";

    if (contextMenu) {
      contextMenu.style.display = "flex";
      contextMenu.style.left = e.pageX + "px";
      contextMenu.style.top = e.pageY + "px";
    }
  });

  svg.appendChild(rect);
  // --- INICIALIZACIÓN DE INTERACTIVIDAD DE UN SOLO CLIC ---
 // --- ASIGNACIÓN DE UN SOLO CLIC SIN ERRORES DE ÁMBITO ---
 // --- ASIGNACIÓN DE UN SOLO CLIC (CAJAS Y TÍTULO) ---
  setTimeout(() => {
    // 1. Escuchar clics en los rectángulos
    const allBoxes = document.querySelectorAll(".stage-box, .parameter-box");
    allBoxes.forEach((box) => {
      box.addEventListener("click", function(e) {
        e.stopPropagation();
        let textElement = box.nextElementSibling;
        while (textElement && textElement.tagName !== "text") {
          textElement = textElement.nextElementSibling;
        }
        if (typeof window.openFloatingToolbar === "function") {
          // Mostramos todos los controles (true) ya que tiene fondo y borde
          window.openFloatingToolbar(box, textElement, e.pageX, e.pageY, true);
        }
      });
    });

    // 2. Escuchar clics en el título principal
    const mainTitle = document.getElementById("diagramTitleText");
    if (mainTitle) {
      mainTitle.addEventListener("click", function(e) {
        e.stopPropagation();
        if (typeof window.openFloatingToolbar === "function") {
          // Pasamos 'false' al final porque el título NO tiene caja de fondo
          window.openFloatingToolbar(mainTitle, mainTitle, e.pageX, e.pageY, false);
        }
      });
    }
  }, 150);
}

function addText(x, y, textContent, className, anchor = "start") {
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", x);
  text.setAttribute("y", y);
  text.setAttribute("class", className);
  text.setAttribute("text-anchor", anchor);
  
  // CORRECCIÓN MODO OSCURO: Usa únicamente la variable dinámica de CSS.
  // Se eliminaron las líneas de código inferiores que sobreescribían este valor con un color fijo.
  text.setAttribute("fill", "var(--text)");
  text.textContent = textContent;

  // Configuración de la fuente global seleccionada en el menú superior
  const globalFont = document.getElementById("fontSelector")?.value || "Arial";
  text.style.fontFamily = globalFont;

  // Hacer que el texto también responda al clic y abra la barra flotante vinculada
  text.addEventListener("click", function(e) {
    e.stopPropagation();
    let boxElement = text.previousElementSibling;
    while (boxElement && boxElement.tagName !== "rect") {
      boxElement = boxElement.previousElementSibling;
    }
    if (typeof window.openFloatingToolbar === "function") {
      window.openFloatingToolbar(boxElement || text, text, e.pageX, e.pageY, boxElement ? true : false);
    }
  });

  svg.appendChild(text);
  return text;
}

function addCenteredBox(centerX, y, text, boxClass, textClass) {
  // 1. Calcular dimensiones estimadas según la longitud del texto provisto
  const estimatedWidth = text.length * 9 + 40;
  const rectWidth = Math.max(180, estimatedWidth);
  const rectHeight = 45;
  const rectX = centerX - rectWidth / 2;

  // 2. Crear el rectángulo base utilizando el generador dinámico interactivo
  const rect = addRect(rectX, y, rectWidth, rectHeight, boxClass);
  rect.setAttribute("rx", "6");
  rect.setAttribute("ry", "6");

  // 3. Insertar el texto centrado de forma precisa en el eje horizontal y vertical
  const textElement = addText(centerX, y + rectHeight / 2 + 5, text, textClass, "middle");

  // 4. Vincular los escuchadores de eventos para habilitar la edición interactiva de fondo, bordes y tipografía
  rect.addEventListener("click", function(e) {
    e.stopPropagation();
    if (typeof openFloatingToolbar === "function") {
      openFloatingToolbar(rect, textElement, e.pageX, e.pageY, true);
    }
  });

  textElement.addEventListener("click", function(e) {
    e.stopPropagation();
    if (typeof openFloatingToolbar === "function") {
      openFloatingToolbar(rect, textElement, e.pageX, e.pageY, true);
    }
  });

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

function addArrow(x1, y1, x2, y2) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2); // Vuelve a su comportamiento nativo
  line.setAttribute("stroke", "var(--connector)");
  line.setAttribute("stroke-width", "2");
  
  // Utiliza el marcador académico auto-orientable
  line.setAttribute("marker-end", "url(#arrow-academic)");
  
  svg.appendChild(line);
  return line;
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
   EXPORTAR PNG DE ALTA RESOLUCIÓN (4K INTELIGENTE - DETECCIÓN MODO OSCURO)
========================= */

async function exportPNG() {
  const svg = document.getElementById("diagramSVG");

  // 1. Obtener los límites reales del contenido del diagrama (Elimina espacios en blanco)
  const bbox = svg.getBBox();
  const margin = 40; 

  const cropX = bbox.x - margin;
  const cropY = bbox.y - margin;
  const cropWidth = bbox.width + (margin * 2);
  const cropHeight = bbox.height + (margin * 2);

  // 2. Clonar temporalmente el SVG para modificar sus dimensiones sin alterar la pantalla
  const svgClone = svg.cloneNode(true);
  svgClone.setAttribute("viewBox", `${cropX} ${cropY} ${cropWidth} ${cropHeight}`);
  svgClone.setAttribute("width", cropWidth);
  svgClone.setAttribute("height", cropHeight);

  // =========================================================
  // DETECCIÓN Y TRADUCCIÓN INTELIGENTE DE COLORES (MODO OSCURO -> IMPRESIÓN)
  // =========================================================
  const originalElements = svg.querySelectorAll('.stage-box, .parameter-box, text, line, path, .connector-line, .arrow-head');
  const clonedElements = svgClone.querySelectorAll('.stage-box, .parameter-box, text, line, path, .connector-line, .arrow-head');

  // Detectar si el sistema entero está actualmente en modo oscuro
  const isDarkMode = document.body.classList.contains('dark');

  originalElements.forEach((origEl, idx) => {
    const cloneEl = clonedElements[idx];
    if (cloneEl) {
      const computedStyle = window.getComputedStyle(origEl);
      
      // CASO 1: TEXTOS
      if (origEl.tagName === 'text') {
        if (origEl.style.fill) {
          // Si el usuario le puso un color propio con la barra, se respeta
          cloneEl.style.fill = origEl.style.fill;
        } else {
          // Si no tiene color personalizado, forzar gris oscuro para que sea legible en papel blanco
          cloneEl.style.fill = '#111827';
        }
      } 
      // CASO 2: LÍNEAS, FLECHAS Y CONECTORES
      else if (origEl.tagName === 'line' || origEl.tagName === 'path' || origEl.classList.contains('connector-line')) {
        // Forzar líneas oscuras para que se vean sobre el papel blanco de la exportación
        cloneEl.style.stroke = '#374151';
        if (cloneEl.classList.contains('arrow-head') || origEl.getAttribute('fill') === 'currentColor') {
          cloneEl.style.fill = '#374151';
        }
      } 
      // CASO 3: RECTÁNGULOS Y CAJAS (STAGES Y PARAMETERS)
      else {
        if (origEl.style.fill) {
          // Si el usuario usó la barra de herramientas, mantenemos su color personalizado intacto
          cloneEl.style.fill = origEl.style.fill;
          cloneEl.style.stroke = origEl.style.stroke || origEl.getAttribute('stroke');
        } else {
          // Si no está personalizado y la app está en modo oscuro, convertimos el fondo a modo claro
          if (isDarkMode) {
            if (origEl.classList.contains('parameter-box')) {
              // Ramificaciones por defecto: Fondo blanco y borde blanco
              cloneEl.style.fill = '#ffffff';
              cloneEl.style.stroke = '#ffffff';
            } else {
              // Cajas de etapas por defecto: Fondo blanco y borde gris suave
              cloneEl.style.fill = '#ffffff';
              cloneEl.style.stroke = '#d1d5db';
            }
          } else {
            // Si ya estaba en modo claro, dejamos los colores computados normales de la pantalla
            cloneEl.style.fill = computedStyle.fill;
            cloneEl.style.stroke = computedStyle.stroke;
          }
        }
      }
    }
  });

  // 3. Serializar el clon corregido
  const source = serializeSvgWithStyles(svgClone);

  // 4. Crear un Blob y una URL para la imagen vectorial
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.crossOrigin = "anonymous";

  img.onload = () => {
    // RESOLUCIÓN 4K FULL HD MÁXIMA GARANTIZADA
    const scale = 4; 

    const canvas = document.createElement("canvas");
    canvas.width = cropWidth * scale;
    canvas.height = cropHeight * scale;

    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);

    // Fondo blanco sólido para el archivo final
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cropWidth, cropHeight);

    // Dibujar el SVG limpio
    ctx.drawImage(img, 0, 0, cropWidth, cropHeight);

    let fileName = "diagrama";
    if (typeof currentData !== "undefined" && currentData.process_name) {
      fileName = currentData.process_name;
    } else if (document.getElementById("processTitle")) {
      fileName = document.getElementById("processTitle").textContent || "diagrama";
    }
    fileName = fileName.replace(/[/\\?%*:|"<>]/g, '-');

    const a = document.createElement("a");
    a.download = `${fileName}.png`;
    a.href = canvas.toDataURL("image/png", 1.0);
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  img.src = url;
}


/* =========================
   EXPORTAR PDF DE ALTA RESOLUCIÓN (4K INTELIGENTE - DETECCIÓN MODO OSCURO)
========================= */

async function exportPDF() {
  const svg = document.getElementById("diagramSVG");

  // 1. Obtener los límites reales del contenido del diagrama
  const bbox = svg.getBBox();
  const margin = 40; 

  const cropX = bbox.x - margin;
  const cropY = bbox.y - margin;
  const cropWidth = bbox.width + (margin * 2);
  const cropHeight = bbox.height + (margin * 2);

  // 2. Clonar el SVG para aplicar el recorte en el PDF
  const svgClone = svg.cloneNode(true);
  svgClone.setAttribute("viewBox", `${cropX} ${cropY} ${cropWidth} ${cropHeight}`);
  svgClone.setAttribute("width", cropWidth);
  svgClone.setAttribute("height", cropHeight);

  // TRANSLACIÓN DE COLORES DINÁMICOS PARA PDF
  const originalElements = svg.querySelectorAll('.stage-box, .parameter-box, text, line, path, .connector-line, .arrow-head');
  const clonedElements = svgClone.querySelectorAll('.stage-box, .parameter-box, text, line, path, .connector-line, .arrow-head');

  const isDarkMode = document.body.classList.contains('dark');

  originalElements.forEach((origEl, idx) => {
    const cloneEl = clonedElements[idx];
    if (cloneEl) {
      const computedStyle = window.getComputedStyle(origEl);
      
      if (origEl.tagName === 'text') {
        if (origEl.style.fill) {
          cloneEl.style.fill = origEl.style.fill;
        } else {
          cloneEl.style.fill = '#111827';
        }
      } else if (origEl.tagName === 'line' || origEl.tagName === 'path' || origEl.classList.contains('connector-line')) {
        cloneEl.style.stroke = '#374151';
        if (cloneEl.classList.contains('arrow-head') || origEl.getAttribute('fill') === 'currentColor') {
          cloneEl.style.fill = '#374151';
        }
      } else {
        if (origEl.style.fill) {
          cloneEl.style.fill = origEl.style.fill;
          cloneEl.style.stroke = origEl.style.stroke || origEl.getAttribute('stroke');
        } else {
          if (isDarkMode) {
            if (origEl.classList.contains('parameter-box')) {
              cloneEl.style.fill = '#ffffff';
              cloneEl.style.stroke = '#ffffff';
            } else {
              cloneEl.style.fill = '#ffffff';
              cloneEl.style.stroke = '#d1d5db';
            }
          } else {
            cloneEl.style.fill = computedStyle.fill;
            cloneEl.style.stroke = computedStyle.stroke;
          }
        }
      }
    }
  });

  const source = serializeSvgWithStyles(svgClone);

  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.crossOrigin = "anonymous";

  img.onload = () => {
    const scale = 4; 

    const canvas = document.createElement("canvas");
    canvas.width = cropWidth * scale;
    canvas.height = cropHeight * scale;

    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, cropWidth, cropHeight);

    ctx.drawImage(img, 0, 0, cropWidth, cropHeight);

    const imgData = canvas.toDataURL("image/png", 1.0);

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4"
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgHeightMM = (cropHeight * pageWidth) / cropWidth;

    let heightLeft = imgHeightMM;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeightMM, undefined, 'FAST');
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeightMM;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeightMM, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    let fileName = "diagrama";
    if (typeof currentData !== "undefined" && currentData.process_name) {
      fileName = currentData.process_name;
    } else if (document.getElementById("processTitle")) {
      fileName = document.getElementById("processTitle").textContent || "diagrama";
    }
    fileName = fileName.replace(/[/\\?%*:|"<>]/g, '-');

    pdf.save(`${fileName}.pdf`);

    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  img.src = url;
}

// Cerrar menús alternativos de forma limpia al hacer clic en el fondo de la pantalla
window.addEventListener("click", () => {
  const oldMenu = document.getElementById("contextMenu");
  if (oldMenu) oldMenu.style.display = "none";
  if (selectedElement) {
    selectedElement.style.outline = "none";
    selectedElement = null;
  }
});

window.addEventListener("click", () => {
  if (contextMenu) contextMenu.style.display = "none";
  if (selectedElement) {
    selectedElement.style.outline = "none";
    selectedElement = null;
  }
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
      isDark ? "#ffffff" : "#0f172a"
    );
    el.style.fontFamily = "system-ui, -apple-system, sans-serif";
    el.style.fontWeight = "600";
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
  convertBtn.innerText = "🤖 IA Analizando Estructura...";
  
  // PROMPT MAESTRO AVANZADO: Sincroniza la arquitectura de datos con el motor visual SVG
  const prompt = `
    Eres un Editor Gráfico Científico e Ingeniero de Datos experto en maquetación de tesis y artículos indexados bajo las normas APA de la 7ma edición.
    
    Analiza minuciosamente el informe técnico o procedimiento de laboratorio provisto al final y transfórmalo a un objeto JSON estructurado que replique con total exactitud la topología del flujo.
    
    REGLAS ESTRICTAS DE CONTENIDO Y REDACCIÓN (ESTÁNDAR APA 7):
    1. TÍTULO GENERAL ("process_name"): Extrae el nombre general del proceso en formato conciso, limpio y formal (Ej: "Línea de procesamiento de pulpa congelada").
    2. OPERACIONES UNITARIAS: Usa verbos en infinitivo o sustantivos técnicos formales (ej: "Recepción", "Estandarización", "Pasteurización"). Elimina viñetas o numeraciones manuales.
    3. PARÁMETROS CRÍTICOS ("parameters"): Máximo 2 o 3 palabras por etiqueta. Usa abreviaturas científicas internacionales correctas (ej: "90 °C", "15 min", "ppm", "Brix").
    4. CLASIFICACIÓN DE TIPO ("type"): 
       - "ingredient": Para insumos químicos, agua, aditivos o materias primas.
       - "physical": Para variables físicas operacionales de control (tiempo, temperatura, pH, presión).
    5. SIMETRÍA VISUAL ("notes_position"): Alterna estrictamente entre "right" y "left" en cada etapa estándar sucesiva para equilibrar el lienzo.

    REGLAS CRÍTICAS DE ARQUITECTURA MULTI-COLUMNA (SINTONÍA CON EL RENDERIZADOR):
    - DETECCIÓN DE RAMAS TRIPLES: Si el texto menciona tres evaluaciones, condiciones o tratamientos simultáneos, agrúpalos como 3 objetos dentro de la lista "parameters" de esa etapa, y asegúrate de que el título de la etapa incluya palabras clave como "Evaluación", "Tratamiento" o "Condición".
    - DETECCIÓN DE BIFURCACIONES PARALELAS (2 CAMINOS): Si el proceso se divide en dos caminos independientes que corren en paralelo (Ej: Columna de Líquidos vs Columna de Sólidos, o dos fases paralelas independientes), debes marcar obligatoriamente la etapa con "isTwoColumns": true, omitir la propiedad "parameters", y crear la estructura exacta de "columns" detallada abajo.

    RESPONDE EXCLUSIVAMENTE CON EL SIGUIENTE FORMATO JSON PURO (Sin bloques de código, sin texto introductorio ni explicaciones):
    {
      "process_name": "Nombre formal de la figura académica",
      "stages": [
        {
          "title": "Etapa Estándar Central",
          "notes_position": "right",
          "parameters": [
            { "label": "Temperatura", "value": "85 °C", "type": "physical" }
          ]
        },
        {
          "title": "Bifurcación en Dos Columnas Paralelas",
          "isTwoColumns": true,
          "columns": [
            {
              "steps": [
                { "title": "Operación de Columna 1", "note": "Nota lateral opcional" }
              ]
            },
            {
              "steps": [
                { "title": "Operación de Columna 2", "note": "Nota lateral opcional" }
              ]
            }
          ]
        }
      ]
    }

    Texto técnico a procesar:
    ${rawText}
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let cleanJsonText = response.text().trim();

    // Filtro de limpieza ultra-resistente contra caracteres markdown
    if (cleanJsonText.startsWith("```")) {
      cleanJsonText = cleanJsonText.replace(/```json|```/g, "").trim();
    }

    const firstBracket = cleanJsonText.indexOf("{");
    const lastBracket = cleanJsonText.lastIndexOf("}");

    if (firstBracket !== -1 && lastBracket !== -1) {
      cleanJsonText = cleanJsonText.substring(firstBracket, lastBracket + 1);
    }

    // Probar validez e inyectar al editor dinámico
    JSON.parse(cleanJsonText); 
    document.getElementById("jsonInput").value = cleanJsonText;
    
    // Renderizado instantáneo
    renderDiagram();

  } catch (error) {
    console.error("Error con Gemini IA:", error);
    alert("Hubo un percance procesando el texto con la IA. Asegúrate de que tu API Key sea correcta.");
  } finally {
    convertBtn.disabled = false;
    convertBtn.innerText = "⚡ Convertir a JSON";
  }
});

