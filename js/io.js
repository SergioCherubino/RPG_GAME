// io.js
import { exportMap } from "./mapIO.js";
import { loadMap } from "./mapIO.js";
import { renderBoard } from "./render.js";

export function initIO(board) {
  const exportBtn = document.getElementById("exportBtn");
  const openBtn = document.getElementById("openMapBtn");
  const openInput = document.getElementById("openMapInput");

  exportBtn.onclick = () => {
    const data = exportMap();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "map.json";
    a.click();
  };

  openBtn.onclick = () => {
    openInput.value = "";
    openInput.click();
  };

  openInput.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const data = JSON.parse(reader.result);
      loadMap(data);
      renderBoard(board); // 👈 SÓ ISSO
    };

    reader.readAsText(file);
  };
}
