/* =========================
   기본 유틸 함수
========================= */

/** selector에 해당하는 모든 요소의 텍스트를 변경 */
function setTextAll(selector, value) {
  const safe = (value ?? "").trim() === "" ? " " : value;
  document.querySelectorAll(selector).forEach(el => {
    el.textContent = safe;
  });
}

/** 모든 카드(.card)에 스타일을 적용 */
function setCardStyle(callback) {
  document.querySelectorAll(".card").forEach(callback);
}

/* =========================
   입력 요소
========================= */
const CONFIG = {
  showTagControl: false,   // true로 바꾸면 태그 입력 UI가 다시 살아납니다
  fixedTagText: "FEARLESS" // showTagControl이 false일 때 카드에 표시될 태그
};

const tagInput = document.getElementById("tagInput");
const tagField = document.getElementById("tagField");

if (!CONFIG.showTagControl) {
  if (tagField) tagField.style.display = "none";
  if (tagInput) tagInput.value = CONFIG.fixedTagText; // 내부값도 고정
}
const nameInput = document.getElementById("nameInput");
const quoteInput = document.getElementById("quoteInput");
const rankTextInput = document.getElementById("rankTextInput");
const abilityInput = document.getElementById("abilityInput");
const affiliationTextInput = document.getElementById("affiliationTextInput");

const bgColorInput = document.getElementById("bgColorInput");
const bgImageInput = document.getElementById("bgImageInput");
const exportBtn = document.getElementById("exportBtn");
const resolutionSelect = document.getElementById("resolutionSelect");

/* =========================
   텍스트 동기화 (미리보기 + exportLayer 동시 반영)
========================= */

function fitName(el) {
  let fontSize = 110;
  el.style.fontSize = fontSize + "px";

  // 가로가 넘칠 때만 폰트 축소
  while (el.scrollWidth > el.clientWidth && fontSize > 10) {
    fontSize--;
    el.style.fontSize = fontSize + "px";
  }
}

function syncAllText() {
  setTextAll(".js-tag", CONFIG.showTagControl ? tagInput.value : CONFIG.fixedTagText);
  setTextAll(".js-name", nameInput.value);
  setTextAll(".js-quote", quoteInput.value);
  setTextAll(".js-rank", rankTextInput.value);
  setTextAll(".js-ability", abilityInput.value);
  setTextAll(".js-affiliation", affiliationTextInput.value);

  document.querySelectorAll(".js-name").forEach(fitName);

  // const h1 = document.getElementById("dialogue");

  // let fontSize = 110;
  // h1.style.fontSize = fontSize + "px";

  // // 가로가 넘칠 때만 폰트 축소
  // while (h1.scrollWidth > h1.clientWidth && fontSize > 10) {
  //   fontSize--;
  //   h1.style.fontSize = fontSize + "px";
  // }
}
/* 최초 1회 반영 */
syncAllText();

/* 입력 시 실시간 반영 */
if (CONFIG.showTagControl) {
  tagInput.addEventListener("input", syncAllText);
}
nameInput.addEventListener("input", syncAllText);
quoteInput.addEventListener("input", syncAllText);
rankTextInput.addEventListener("input", syncAllText);
abilityInput.addEventListener("input", syncAllText);
affiliationTextInput.addEventListener("input", syncAllText);

/* =========================
   타입 버튼 (센티넬 / 가이드 / 없음)
========================= */
const typeButtons = document.querySelectorAll("#typeButtons button");
let currentType = "sentinel"; // 초기값

typeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentType = btn.dataset.type;

    typeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    updateRankSymbol();
  });
});

/* =========================
   소속 버튼 (피어리스 / 빌런 / 기타)
========================= */
let currentAffiliation = "af-fearless";
const affiliationButtons = document.querySelectorAll("#affiliationButtons button");

affiliationButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentAffiliation = btn.dataset.affiliation;

    affiliationButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    updateAffiliationIcon();
  });
});

function updateAffiliationIcon() {
  document.querySelectorAll(".affiliation-icon").forEach(icon => {
    icon.src = `./src/affiliation/${currentAffiliation}.svg`;
    icon.style.width = "50px";
    icon.style.height = "50px";
  });
}

/* 초기 버튼 활성화 */
document
  .querySelector(`#affiliationButtons button[data-affiliation="${currentAffiliation}"]`)
  ?.classList.add("active");

updateAffiliationIcon();

/* =========================
   랭크 심볼
========================= */
const SYMBOL_SCALE_MAP = {
  none: 1,
  sentinel: 1,
  guide: 0.8
};
const SYMBOL_OFFSET_Y_MAP = {
  none: 0,
  sentinel: -5,
  guide: 20
};

function updateRankSymbol() {
  const value = currentType; // sentinel / guide / none

  const scale = SYMBOL_SCALE_MAP[value] ?? 1;
  const offsetY = SYMBOL_OFFSET_Y_MAP[value] ?? 0;

  document.querySelectorAll(".rank-symbol").forEach(img => {
    img.src = `./src/sort/${value}.svg`;
    img.style.setProperty("--symbol-scale", scale);
    img.style.setProperty("--symbol-offset-y", `${offsetY}px`);
  });
}

/* 초기 활성 버튼 표시 */
document
  .querySelector(`#typeButtons button[data-type="${currentType}"]`)
  ?.classList.add("active");

updateRankSymbol();

/* =========================
   배경 색상
========================= */
bgColorInput.addEventListener("input", () => {
  setCardStyle(card => {
    card.style.backgroundColor = bgColorInput.value;
  });
});

/* =========================
   배경 이미지
========================= */
bgImageInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    setCardStyle(card => {
      card.style.backgroundImage = `url(${reader.result})`;
      card.style.backgroundSize = "cover";
      card.style.backgroundPosition = "top";
    });
  };
  reader.readAsDataURL(file);
});

/* =========================
   프리뷰 스케일
========================= */
const preview = document.querySelector(".preview");
const previewScale = document.getElementById("previewScale");

function updatePreviewScale() {
  const baseWidth = 600;
  const baseHeight = 1100;

  const scale = Math.min(
    preview.clientWidth / baseWidth,
    preview.clientHeight / baseHeight,
    1
  );

  previewScale.style.transform = `scale(${scale})`;
}

window.addEventListener("resize", updatePreviewScale);
updatePreviewScale();

/* =========================
   이미지 로딩 대기 (export)
========================= */
function getRectInContainer(el, container) {
  const r = el.getBoundingClientRect();
  const c = container.getBoundingClientRect();
  return { x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height };
}

async function waitForImagesOnce(container) {
  const imgs = Array.from(container.querySelectorAll("img"))
    .filter(img => img.getAttribute("src"));

  await Promise.all(
    imgs.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(res => (img.onload = img.onerror = res));
    })
  );
}

/** SVG 파일을 fetch해서 data URL로 바꾼 뒤 Image로 로드 */
async function loadSvgAsImage(svgPath) {
  const res = await fetch(svgPath);
  const text = await res.text();
  const encoded = encodeURIComponent(text)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encoded}`;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}


async function svgToPngDataUrl(svgUrl, w, h) {
  // svg 텍스트 가져오기
  const res = await fetch(svgUrl);
  const svgText = await res.text();

  // Blob URL로 이미지 로드
  const blob = new Blob([svgText], { type: "image/svg+xml" });
  const blobUrl = URL.createObjectURL(blob);

  try {
    const img = await new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = blobUrl;
    });

    // 정해진 크기로 라스터라이즈
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

function swapImgSrc(img, newSrc) {
  if (!img) return () => {};
  const prev = img.getAttribute("src") || "";
  img.setAttribute("src", newSrc);
  return () => img.setAttribute("src", prev);
}

function waitImg(img) {
  if (!img) return Promise.resolve();
  if (img.complete && img.naturalWidth > 0) return Promise.resolve();
  return new Promise(res => {
    img.onload = img.onerror = () => res();
  });
}


/* =========================
   이미지 저장 (export)
========================= */
exportBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  //콘솔 로그 볼라고 
  console.log("[export click] href=", location.href, "outScale=", resolutionSelect?.value);

  try {
    const outScale = Number(resolutionSelect?.value || 1);

    const exportWrap = document.querySelector("#exportLayer .card-wrap");
    if (!exportWrap) return;

    await waitForImagesOnce(exportWrap);
    if (document.fonts?.ready) await document.fonts.ready;
    // 폰트 로딩 완료 후, exportLayer의 NAME을 다시 fit
    exportWrap.querySelectorAll(".js-name").forEach(fitName);
    // 레이아웃 반영 1프레임 대기(안정성)
    await new Promise(requestAnimationFrame);



    // 여기서 SVG들을 PNG로 “정해진 크기”로 라스터라이즈 후 임시 교체
    const rankEl = exportWrap.querySelector(".rank-symbol");
    const affEl = exportWrap.querySelector(".affiliation-icon");

    // 현재 상태값으로 src 경로 확정(당신 코드 로직과 동일)
    const rankSvg = `./src/sort/${currentType}.svg`;
    const affSvg  = `./src/affiliation/${currentAffiliation}.svg`;

    const [rankPng, affPng] = await Promise.all([
      svgToPngDataUrl(rankSvg, 180, 180),
      svgToPngDataUrl(affSvg, 50, 50)
    ]);

    const restores = [];
    restores.push(swapImgSrc(rankEl, rankPng));
    restores.push(swapImgSrc(affEl, affPng));
    
    await Promise.all([waitImg(rankEl), waitImg(affEl)]);

    console.log("after swap natural", rankEl?.naturalWidth, rankEl?.naturalHeight, affEl?.naturalWidth, affEl?.naturalHeight);


    // 캡처는 scale=1 고정
    const baseCanvas = await html2canvas(exportWrap, {
      scale: 1,
      backgroundColor: null,
      useCORS: true,
      scrollX: 0,
      scrollY: 0
    });

    // 원복
    restores.reverse().forEach(fn => fn());

    // 저장 해상도만 후처리 업스케일
    let finalCanvas = baseCanvas;
    if (outScale > 1) {
      const up = document.createElement("canvas");
      up.width = baseCanvas.width * outScale;
      up.height = baseCanvas.height * outScale;
      up.getContext("2d").drawImage(baseCanvas, 0, 0, up.width, up.height);
      finalCanvas = up;
    }

    finalCanvas.toBlob((blob) => {
      if (!blob) return;
    
      const url = URL.createObjectURL(blob);
    
      const link = document.createElement("a");
      link.href = url;
      link.download = `fearless_card_${outScale}x.png`;
    
      // ✅ 추가: 현재 탭이 blob로 이동하는 걸 피함
      link.target = "_blank";
      link.rel = "noopener";
    
      document.body.appendChild(link);
      link.click();
      console.log("[download] about to click link", { href: link.href, download: link.download, target: link.target });
setTimeout(() => console.log("[download] after click location=", location.href), 0);

      link.remove();
    
      // ✅ 수정: revoke는 조금 늦게
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, "image/png");    
    
    // const link = document.createElement("a");
    // link.download = `fearless_card_${outScale}x.png`;
    // link.href = finalCanvas.toDataURL("image/png");
    // link.click();
  } catch (e) {
    console.error(e);
    alert("익스포트 중 오류가 발생했습니다. 콘솔(F12)을 확인해주세요.");
  }
});

window.addEventListener("beforeunload", (e) => {
  console.warn("[beforeunload] 페이지가 떠나려 합니다. (리로드/이동 발생)");
});
