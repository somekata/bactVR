// =========================
// VR ホットスポットの解説 ＋ 進捗管理
// =========================

const hotspotMessages = {
  "hotspot-door": {
    title: "入室前・退出後の手指衛生",
    body:
      "病室に入る前は、患者環境に入る前のタイミングとして手指衛生が必要です。" +
      "退出するときも、病室にある物品や環境表面に触れた可能性があるため、" +
      "最後に手指衛生を行ってから病室の外に出ます。",
    moment: "Moment 1 / 4：患者周囲の環境に触れる前後"
  },
  "hotspot-bed": {
    title: "患者接触前後の手指衛生",
    body:
      "患者さんに触れる前（バイタル測定、診察、処置などの前）には、" +
      "患者保護のために手指衛生を行います。" +
      "また、患者や体液・体液が付着している可能性のある物品に触れた後は、" +
      "自分と次の患者を守るために必ず手指衛生を行います。",
    moment: "Moment 1 / 4：患者接触の前後"
  },
  "hotspot-sink": {
    title: "目に見える汚染がある場合の手洗い",
    body:
      "血液・体液・分泌物など、目に見える汚染がある場合は、" +
      "アルコール手指消毒だけでなく流水と石けんによる手洗いが必要です。" +
      "そのうえで、必要に応じてさらにアルコール手指消毒を追加します。",
    moment: "Moment 3：体液曝露後"
  }
};

const HOTSPOT_IDS = Object.keys(hotspotMessages);
let foundHotspots = new Set();

function updateVRProgress() {
  const progressEl = document.getElementById("vr-progress");
  const completeEl = document.getElementById("vr-complete");
  const total = HOTSPOT_IDS.length;
  const found = foundHotspots.size;

  if (progressEl) {
    progressEl.textContent = `発見したポイント: ${found} / ${total}`;
  }

  if (!completeEl) return;

  if (found === total) {
    completeEl.textContent =
      "コンプリート！ WHOの5 momentsを思い出しながら復習しましょう。";
  } else if (found > 0) {
    completeEl.textContent =
      "あと少し！ 残りのポイントも探してみましょう。";
  } else {
    completeEl.textContent = "";
  }
}

function handleVRHotspotClick(el) {
  const id = el.getAttribute("id");
  const msg = hotspotMessages[id];
  if (!msg) return;

  const infoTitle = document.getElementById("vr-info-title");
  const infoBody = document.getElementById("vr-info-body");

  if (infoTitle) {
    infoTitle.textContent = msg.title;
  }
  if (infoBody) {
    infoBody.innerHTML = `${msg.body}<br><br><strong>${msg.moment}</strong>`;
  }

  // 初めて見つけた場合のみカウントアップ
  if (!foundHotspots.has(id)) {
    foundHotspots.add(id);
    // 見つけた印として色を変える
    el.setAttribute("color", "#66bb6a");
    el.classList.add("hotspot-found");
    updateVRProgress();
  }
}

function resetVRHotspots() {
  foundHotspots.clear();
  HOTSPOT_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.setAttribute("color", "#ffca28");
      el.classList.remove("hotspot-found");
    }
  });

  const infoTitle = document.getElementById("vr-info-title");
  const infoBody = document.getElementById("vr-info-body");
  if (infoTitle) {
    infoTitle.textContent =
      "ポイントをクリックすると、ここに説明が表示されます。";
  }
  if (infoBody) {
    infoBody.innerHTML =
      "例：<br />・入室前・退出後<br />・患者接触前・後<br />・体液暴露後<br />など、<a class='button' href='https://www.who.int/publications/m/item/five-moments-for-hand-hygiene' target='_blank' rel='noopener noreferrer'>WHO「5 moments」</a > を意識させることができます。";
  }

  updateVRProgress();
}

function setupVRHotspots() {
  document.querySelectorAll(".hotspot").forEach((el) => {
    el.addEventListener("click", () => handleVRHotspotClick(el));
  });

  const resetBtn = document.getElementById("vr-reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetVRHotspots);
  }

  // 初期表示
  updateVRProgress();
}

// =========================
// PPE 着用手順クイズ
// =========================

// 例：PPE着用の一例（施設に合わせて自由に書き換えてください）
const PPE_STEPS = [
  "手指衛生を行う",
  "ガウンを着用する",
  "マスク（または呼吸用防護具）を装着する",
  "ゴーグルやフェイスシールドを装着する",
  "手袋を装着する"
];

// 正解の順番（上の配列のインデックス順）
const CORRECT_ORDER = [0, 1, 2, 3, 4];

let selectedOrder = []; // ユーザーが選んだインデックスの順番

function renderPPEStepButtons() {
  const container = document.getElementById("ppe-options");
  if (!container) return;
  container.innerHTML = "";

  PPE_STEPS.forEach((label, index) => {
    const btn = document.createElement("button");
    btn.className = "ppe-option-btn";
    btn.textContent = label;
    btn.dataset.index = String(index);
    btn.addEventListener("click", onPPEStepClick);
    container.appendChild(btn);
  });
}

function onPPEStepClick(e) {
  const btn = e.currentTarget;
  if (btn.classList.contains("used")) {
    return;
  }
  const index = Number(btn.dataset.index);
  selectedOrder.push(index);
  btn.classList.add("used");
  updateSelectedSequence();
}

function updateSelectedSequence() {
  const list = document.getElementById("ppe-sequence");
  if (!list) return;
  list.innerHTML = "";
  selectedOrder.forEach((idx) => {
    const li = document.createElement("li");
    li.textContent = `${PPE_STEPS[idx]}`;
    list.appendChild(li);
  });
}

function checkPPEOrder() {
  const resultEl = document.getElementById("ppe-result");
  if (!resultEl) return;

  resultEl.classList.remove("ok", "ng");

  if (selectedOrder.length !== CORRECT_ORDER.length) {
    resultEl.textContent =
      "すべての手順を選択してから採点してください。";
    resultEl.classList.add("ng");
    return;
  }

  const isCorrect = selectedOrder.every(
    (val, i) => val === CORRECT_ORDER[i]
  );

  if (isCorrect) {
    resultEl.textContent =
      "正解です！ この順番は一例ですが、各施設のマニュアルに沿って手順を確認してください。";
    resultEl.classList.add("ok");
  } else {
    resultEl.innerHTML =
      "一部の手順の順番が異なっています。<br>" +
      "一般的には、<strong>手指衛生 → ガウン → マスク／呼吸用防護具 → 眼の防護具 → 手袋</strong> " +
      "といった流れが推奨されますが、必ず施設のマニュアルを確認してください。";
    resultEl.classList.add("ng");
  }
}

function resetPPEQuiz() {
  selectedOrder = [];
  const list = document.getElementById("ppe-sequence");
  if (list) list.innerHTML = "";
  document
    .querySelectorAll(".ppe-option-btn")
    .forEach((btn) => btn.classList.remove("used"));
  const resultEl = document.getElementById("ppe-result");
  if (resultEl) {
    resultEl.textContent = "";
    resultEl.classList.remove("ok", "ng");
  }
}

// =========================
// 初期化
// =========================

document.addEventListener("DOMContentLoaded", () => {
  setupVRHotspots();
  renderPPEStepButtons();

  const checkBtn = document.getElementById("ppe-check-btn");
  const resetBtn = document.getElementById("ppe-reset-btn");

  if (checkBtn) {
    checkBtn.addEventListener("click", checkPPEOrder);
  }
  if (resetBtn) {
    resetBtn.addEventListener("click", resetPPEQuiz);
  }
});
