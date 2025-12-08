// 正しい順番
const SEQ_DONNING = ["alcohol", "gown", "mask", "goggles", "gloves"];

// 脱衣時：手袋 → アルコール → ゴーグル → ガウン → マスク → 最後のアルコール
const SEQ_DOFFING = [
  "gloves-off",
  "alcohol-mid",
  "gown-off",
  "goggles-off",
  "mask-off",
  "alcohol-end",
];

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

  // ラベル（テキスト）
  els.labelAlcohol = document.getElementById("label-alcohol");
  els.labelGown = document.getElementById("label-gown");
  els.labelMask = document.getElementById("label-mask");
  els.labelGoggle = document.getElementById("label-goggle");
  els.labelGloves = document.getElementById("label-gloves");

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
  // ALCOHOL はフェーズとステップによって意味を変える
  els.panelAlcohol.addEventListener("click", () => {
    if (phase === "donning") {
      // 着用フェーズ
      handleDonningAction("alcohol");
    } else if (phase === "doffing") {
      const total = SEQ_DOFFING.length;

      // すでに全ステップ完了している場合
      if (stepIndex >= total) {
        setMessage(
          "すべての手順が完了しています。リセットボタンで最初からやり直せます。",
          "ok"
        );
        return;
      }

      const expected = SEQ_DOFFING[stepIndex];

      // 期待されるステップがアルコールのときだけ、正しく扱う
      if (expected === "alcohol-mid" || expected === "alcohol-end") {
        handleDoffingAction(expected);
      } else {
        // タイミングが違うアルコールは誤答扱い
        handleDoffingAction("alcohol-wrong");
      }
    }
  });

  // それ以外の PPE パネルは「着用」用
  els.panelGown.addEventListener("click", () =>
    handleDonningAction("gown")
  );
  els.panelMask.addEventListener("click", () =>
    handleDonningAction("mask")
  );
  els.panelGoggle.addEventListener("click", () =>
    handleDonningAction("goggles")
  );
  els.panelGloves.addEventListener("click", () =>
    handleDonningAction("gloves")
  );
}

function bindPPEClicks() {
  // 脱衣時に使う
  els.ppeGown.addEventListener("click", () =>
    handleDoffingAction("gown-off")
  );
  els.ppeMask.addEventListener("click", () =>
    handleDoffingAction("mask-off")
  );
  els.ppeGoggle.addEventListener("click", () =>
    handleDoffingAction("goggles-off")
  );
  els.ppeGloveL.addEventListener("click", () =>
    handleDoffingAction("gloves-off")
  );
  els.ppeGloveR.addEventListener("click", () =>
    handleDoffingAction("gloves-off")
  );
}

/* ------------- パネルのランダム配置 ------------- */

function randomizePanelOrder() {
  if (
    !els.panelGown ||
    !els.panelMask ||
    !els.panelGoggle ||
    !els.panelGloves
  )
    return;

  // 元のY座標候補
  const ySlots = [0.45, 0, -0.45, -0.9];

  // Fisher–Yates シャッフル
  for (let i = ySlots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ySlots[i], ySlots[j]] = [ySlots[j], ySlots[i]];
  }

  const panels = [els.panelGown, els.panelMask, els.panelGoggle, els.panelGloves];
  const labels = [els.labelGown, els.labelMask, els.labelGoggle, els.labelGloves];

  panels.forEach((panel, idx) => {
    const y = ySlots[idx];
    if (!panel) return;
    // パネル本体
    panel.setAttribute("position", { x: 0, y, z: 0 });
    // 対応するラベルも同じYに（少し手前のZ）
    const label = labels[idx];
    if (label) {
      label.setAttribute("position", { x: 0, y, z: 0.01 });
    }
  });

  // ALCOHOL とそのラベルは固定位置
  if (els.panelAlcohol)
    els.panelAlcohol.setAttribute("position", { x: 0, y: 0.9, z: 0 });
  if (els.labelAlcohol)
    els.labelAlcohol.setAttribute("position", { x: 0, y: 0.9, z: 0.01 });
}

/* ------------- 共通UI更新 ------------- */

function updateStatus() {
  const total = phase === "donning" ? SEQ_DONNING.length : SEQ_DOFFING.length;
  els.phaseLabel.textContent =
    phase === "donning" ? "Donning（着用）" : "Doffing（脱衣）";
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

  // パネルの順番を毎回ランダムにする
  randomizePanelOrder();

  updateStatus();
  setMessage(
    'パネルの並びは毎回入れ替わります。<br>まずは <strong>ALCOHOL</strong> パネルをタップして、手指消毒をしてください。'
  );
}

/* ------------- Donning（着用） ------------- */

function handleDonningAction(actionKey) {
  if (phase !== "donning") {
    // すでにすべて完了しているケース
    if (phase === "doffing" && stepIndex >= SEQ_DOFFING.length) {
      setMessage(
        "すべての手順が完了しています。リセットボタンで最初からやり直せます。",
        "ok"
      );
    } else {
      setMessage(
        "現在は脱衣フェーズです。マネキンの PPE をタップして外してください。",
        "warn"
      );
    }
    return;
  }

  const total = SEQ_DONNING.length;
  if (stepIndex >= total) {
    setMessage(
      "着用フェーズはすでに完了しています。マネキンの PPE をタップして脱衣してください。",
      "warn"
    );
    return;
  }

  const expected = SEQ_DONNING[stepIndex];
  if (actionKey === expected) {
    // 見た目の更新
    applyDonningVisual(actionKey);

    appendLog(`Donning: ${labelFromKey(actionKey)}`);
    stepIndex++;

    if (stepIndex >= SEQ_DONNING.length) {
      // 着用完了
      setMessage(
        "着用フェーズは OK です。次はマネキンの PPE を正しい順番で外してください。",
        "ok"
      );
      enterDoffingPhase();
    } else {
      setMessage(
        "Good! 正しい順番です。次のステップを選んでください。",
        "ok"
      );
      updateStatus();
    }
  } else {
    setMessage(
      "順番が違います。もう一度よく考えて選んでみてください。",
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
    setMessage(
      "まだ着用中です。右側のパネルから PPE を選んで着用を完了させてください。",
      "warn"
    );
    return;
  }

  const total = SEQ_DOFFING.length;
  if (stepIndex >= total) {
    setMessage(
      "脱衣フェーズはすでに完了しています。リセットボタンで最初からやり直せます。",
      "warn"
    );
    return;
  }

  const expected = SEQ_DOFFING[stepIndex];

  // アルコール誤タイミング
  if (actionKey === "alcohol-wrong") {
    setMessage(
      "このタイミングでの手指消毒は正しい順番ではありません。もう一度考えてみてください。",
      "warn"
    );
    return;
  }

  if (actionKey === expected) {
    applyDoffingVisual(actionKey);
    appendLog(`Doffing: ${labelFromKey(actionKey)}`);
    stepIndex++;

    if (stepIndex >= SEQ_DOFFING.length) {
      setMessage(
        "Perfect! 着用・脱衣の順番が最後まで正しくできました。",
        "perfect"
      );
      updateStatus();
    } else {
      setMessage(
        "Good! 正しい順番です。次のステップを選んでください。",
        "ok"
      );
      updateStatus();
    }
  } else {
    setMessage(
      "順番が違います。もう一度よく考えて選んでみてください。",
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
    case "alcohol-mid":
    case "alcohol-end":
    default:
      // アルコールは視覚的変化なし
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
    case "alcohol-mid":
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
