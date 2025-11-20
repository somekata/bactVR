// 正しい順番
const SEQ_DONNING = ["alcohol", "gown", "mask", "goggles", "gloves"];
const SEQ_DOFFING = ["gloves-off", "goggles-off", "gown-off", "mask-off", "alcohol-end"];

let phase = "donning"; // "donning" or "doffing"
let stepIndex = 0;

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheEls();
  bindPanelClicks();
  bindPPEClicks();
  bindButtons();
  resetAll(); // 初期化
});

function cacheEls() {
  els.phaseLabel = document.getElementById("phase-label");
  els.stepLabel = document.getElementById("step-label");
  els.messageBox = document.getElementById("message-box");
  els.logList = document.getElementById("log-list");
  els.btnReset = document.getElementById("btn-reset");

  // パネル
  els.panelAlcohol = document.getElementById("panel-alcohol");
  els.panelGown = document.getElementById("panel-gown");
  els.panelMask = document.getElementById("panel-mask");
  els.panelGoggle = document.getElementById("panel-goggle");
  els.panelGloves = document.getElementById("panel-gloves");

  // PPE（マネキン上）
  els.ppeGown = document.getElementById("ppe-gown");
  els.ppeMask = document.getElementById("ppe-mask");
  els.ppeGoggle = document.getElementById("ppe-goggle");
  els.ppeGloveL = document.getElementById("ppe-gloveL");
  els.ppeGloveR = document.getElementById("ppe-gloveR");
}

function bindButtons() {
  els.btnReset.addEventListener("click", resetAll);
}

function bindPanelClicks() {
  els.panelAlcohol.addEventListener("click", () => handleDonningAction("alcohol"));
  els.panelGown.addEventListener("click", () => handleDonningAction("gown"));
  els.panelMask.addEventListener("click", () => handleDonningAction("mask"));
  els.panelGoggle.addEventListener("click", () => handleDonningAction("goggles"));
  els.panelGloves.addEventListener("click", () => handleDonningAction("gloves"));
}

function bindPPEClicks() {
  // 脱衣時に使う
  els.ppeGown.addEventListener("click", () => handleDoffingAction("gown-off"));
  els.ppeMask.addEventListener("click", () => handleDoffingAction("mask-off"));
  els.ppeGoggle.addEventListener("click", () => handleDoffingAction("goggles-off"));
  els.ppeGloveL.addEventListener("click", () => handleDoffingAction("gloves-off"));
  els.ppeGloveR.addEventListener("click", () => handleDoffingAction("gloves-off"));
}

/* ------------- 共通UI更新 ------------- */

function updateStatus() {
  const total = phase === "donning" ? SEQ_DONNING.length : SEQ_DOFFING.length;
  els.phaseLabel.textContent = phase === "donning" ? "Donning（着用）" : "Doffing（脱衣）";
  els.stepLabel.textContent = `${stepIndex + 1} / ${total}`;
}

function setMessage(text, mode = "normal") {
  els.messageBox.classList.remove("ok", "warn", "perfect");
  if (mode === "ok") els.messageBox.classList.add("ok");
  if (mode === "warn") els.messageBox.classList.add("warn");
  if (mode === "perfect") els.messageBox.classList.add("perfect");
  els.messageBox.innerHTML = text;
}

function appendLog(text) {
  const li = document.createElement("li");
  li.textContent = text;
  els.logList.appendChild(li);
  els.logList.scrollTop = els.logList.scrollHeight;
}

/* ------------- リセット ------------- */

function resetAll() {
  phase = "donning";
  stepIndex = 0;
  els.logList.innerHTML = "";

  // PPE を全て外す
  setVisible(els.ppeGown, false);
  setVisible(els.ppeMask, false);
  setVisible(els.ppeGoggle, false);
  setVisible(els.ppeGloveL, false);
  setVisible(els.ppeGloveR, false);

  updateStatus();
  setMessage(
    'まずは <strong>ALCOHOL</strong> パネルをタップして、手指消毒をしてください。'
  );
}

/* ------------- Donning（着用） ------------- */

function handleDonningAction(actionKey) {
  if (phase !== "donning") {
    setMessage("現在は脱衣フェーズです。マネキンの PPE をタップして外してください。", "warn");
    return;
  }

  const expected = SEQ_DONNING[stepIndex];
  if (actionKey === expected) {
    // 見た目の更新
    applyDonningVisual(actionKey);

    appendLog(`Donning: ${actionKey}`);
    stepIndex++;

    if (stepIndex >= SEQ_DONNING.length) {
      // 着用完了
      setMessage("着用フェーズは OK です。次は正しい順番で脱衣してください。", "ok");
      enterDoffingPhase();
    } else {
      const nextLabel = SEQ_DONNING[stepIndex];
      setMessage(`Good! 次は <strong>${labelFromKey(nextLabel)}</strong> を選んでください。`, "ok");
      updateStatus();
    }
  } else {
    setMessage(
      `順番が違います。今は <strong>${labelFromKey(expected)}</strong> を行うタイミングです。`,
      "warn"
    );
  }
}

function applyDonningVisual(actionKey) {
  switch (actionKey) {
    case "gown":
      setVisible(els.ppeGown, true);
      break;
    case "mask":
      setVisible(els.ppeMask, true);
      break;
    case "goggles":
      setVisible(els.ppeGoggle, true);
      break;
    case "gloves":
      setVisible(els.ppeGloveL, true);
      setVisible(els.ppeGloveR, true);
      break;
    case "alcohol":
    default:
      // 手指消毒は視覚的変化なし（後で演出を足してもよい）
      break;
  }
}

/* ------------- Doffing（脱衣） ------------- */

function enterDoffingPhase() {
  phase = "doffing";
  stepIndex = 0;
  updateStatus();
}

function handleDoffingAction(actionKey) {
  if (phase !== "doffing") {
    setMessage("まだ着用中です。右側のパネルから PPE を選んでください。", "warn");
    return;
  }

  const expected = SEQ_DOFFING[stepIndex];
  if (actionKey === expected) {
    applyDoffingVisual(actionKey);
    appendLog(`Doffing: ${actionKey}`);
    stepIndex++;

    if (stepIndex >= SEQ_DOFFING.length) {
      setMessage("Perfect! 着用・脱衣の順番が最後まで正しくできました。", "perfect");
      updateStatus();
    } else {
      const nextLabel = SEQ_DOFFING[stepIndex];
      setMessage(
        `Good! 次は <strong>${labelFromKey(nextLabel)}</strong> を行ってください。`,
        "ok"
      );
      updateStatus();
    }
  } else {
    setMessage(
      `順番が違います。今は <strong>${labelFromKey(expected)}</strong> を行うタイミングです。`,
      "warn"
    );
  }
}

function applyDoffingVisual(actionKey) {
  switch (actionKey) {
    case "gown-off":
      setVisible(els.ppeGown, false);
      break;
    case "mask-off":
      setVisible(els.ppeMask, false);
      break;
    case "goggles-off":
      setVisible(els.ppeGoggle, false);
      break;
    case "gloves-off":
      // 両手袋をまとめて扱う
      setVisible(els.ppeGloveL, false);
      setVisible(els.ppeGloveR, false);
      break;
    case "alcohol-end":
    default:
      // 最後の手指消毒は視覚的変化なし
      break;
  }
}

/* ------------- ユーティリティ ------------- */

function setVisible(el, visible) {
  if (!el) return;
  el.setAttribute("visible", visible);
}

function labelFromKey(key) {
  switch (key) {
    case "alcohol":
    case "alcohol-end":
      return "ALCOHOL（手指消毒）";
    case "gown":
    case "gown-off":
      return "GOWN（ガウン）";
    case "mask":
    case "mask-off":
      return "MASK（マスク）";
    case "goggles":
    case "goggles-off":
      return "GOGGLES（ゴーグル）";
    case "gloves":
    case "gloves-off":
      return "GLOVES（手袋）";
    default:
      return key;
  }
}
