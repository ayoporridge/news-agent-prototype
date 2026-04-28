const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

let toastTimer = null;

const progressMap = {
  home: '1 / 5',
  article: '1 / 5',
  short: '2 / 5',
  map: '3 / 5',
  trust: '4 / 5',
  next: '5 / 5'
};

const drawerContent = {
  short: {
    title: '变短 · 这篇先看 3 点',
    html: `
      <div class="summary-card">
        <div class="num">1</div>
        <div>
          <div class="sc-title">GPT-Image-2 的关键变化不是“更会画”</div>
          <div class="sc-text">它能高度复刻社交媒体 UI、文字排版和产品信息图，让“截图”和“配图”的可信度大幅下降。</div>
        </div>
      </div>
      <div class="summary-card">
        <div class="num">2</div>
        <div>
          <div class="sc-title">逼真不等于真实</div>
          <div class="sc-text">文章实测中，AI 生成的 iPhone 拆解图看似专业，但颜色、材质和结构信息存在明显错误。</div>
        </div>
      </div>
      <div class="summary-card">
        <div class="num">3</div>
        <div>
          <div class="sc-title">真正危险的是证件和隐私</div>
          <div class="sc-text">身份证照片被上传后，模型可修改人脸、姓名、出生日期和证件号码，暴露合规与诈骗风险。</div>
        </div>
      </div>
      <button class="primary-btn" onclick="openTool('map')">下一步：画成风险链路 →</button>
    `
  },
  map: {
    title: '画图 · 影响链路',
    html: `
      <div class="map-wrap">
        <div class="timeline">
          <div class="tl-item">
            <div class="tl-time">模型</div>
            <div class="tl-box">OpenAI 发布 GPT-Image-2，Arena 评测综合表现第一，支持联网搜索和输出自检。</div>
          </div>
          <div class="tl-item">
            <div class="tl-time">平台</div>
            <div class="tl-box">模型可复刻微博、抖音等 UI 细节，假官宣图、假截图更容易被转发。</div>
          </div>
          <div class="tl-item">
            <div class="tl-time">用户</div>
            <div class="tl-box">产品拆解图、证件图等“看起来很真”的内容，仍可能包含事实错误或被恶意篡改。</div>
          </div>
          <div class="tl-item">
            <div class="tl-time">品牌</div>
            <div class="tl-box">新闻平台需要把核查、来源、争议点做成默认能力，帮助用户判断“图从哪来”。</div>
          </div>
        </div>
      </div>
      <div style="height:12px"></div>
      <div class="impact">
        <div class="impact-card"><strong>对社交平台</strong><span>高仿截图和假官宣更难治理。</span></div>
        <div class="impact-card"><strong>对新闻平台</strong><span>核查链路变成内容入口。</span></div>
        <div class="impact-card"><strong>对个人隐私</strong><span>证件、头像、人脸伪造风险上升。</span></div>
        <div class="impact-card"><strong>对用户</strong><span>看到图片后先问来源。</span></div>
      </div>
      <div style="height:12px"></div>
      <button class="primary-btn" onclick="openTool('trust')">下一步：看看可信度 →</button>
    `
  },
  trust: {
    title: '验真 · 来源和可信等级',
    html: `
      <div class="trust-score">
        <div class="score-ring">88</div>
        <div>
          <div class="trust-title">可信等级：较高</div>
          <div class="trust-sub">文章来自澎湃新闻实测报道，包含发布时间、测试样例、外部资料来源和明确争议点。</div>
        </div>
      </div>
      <div class="trust-card">
        <div class="source-row">
          <div><strong>原始报道</strong><span>NEWS转载澎湃新闻，发布于 2026 年 4 月 23 日 11:56。</span></div>
          <span class="badge">已核对</span>
        </div>
        <div class="source-row">
          <div><strong>实测来源</strong><span>澎湃新闻对齐 Lab 对 GPT-Image-2 生成产品图、社交图和证件图进行测试。</span></div>
          <span class="badge">有记录</span>
        </div>
        <div class="source-row">
          <div><strong>第三方资料</strong><span>文章列出 X-Arena.ai、21 世纪经济报道小米辟谣、WaytoAGI 等资料。</span></div>
          <span class="badge">可追溯</span>
        </div>
        <div class="source-row">
          <div><strong>争议点</strong><span>“有图有真相彻底结束”是趋势判断，具体风险仍取决于平台水印、审核和模型防护策略。</span></div>
          <span class="badge">已标注</span>
        </div>
      </div>
      <button class="primary-btn" onclick="openTool('next')">下一步：继续看相关解读 →</button>
    `
  },
  next: {
    title: '继续看 · 三个方向',
    html: `
      <div class="next-card">
        <div class="next-icon">📌</div>
        <div>
          <div class="next-title">看背景：GPT-Image-2 强在哪里？</div>
          <div class="next-desc">解释推理能力、联网搜索、文字渲染、UI 复刻和高分辨率输出。</div>
        </div>
      </div>
      <div class="next-card">
        <div class="next-icon">🧭</div>
        <div>
          <div class="next-title">看影响：假图会怎样进入传播链？</div>
          <div class="next-desc">从社交截图、产品图、证件图到诈骗场景，拆开风险链路。</div>
        </div>
      </div>
      <div class="ad-card">
        <div class="ad-label">合作专题 · 标注广告</div>
        <div class="ad-title">AI 图片与证件安全专题</div>
        <div class="ad-desc">由腾讯安全支持。专题会介绍如何识别 AI 生成图、保护身份证照片、避免人脸伪造和社交截图诈骗。内容经NEWS科技编辑审核。</div>
        <div class="ad-actions">
          <button class="mini-btn" onclick="showToast('打开合作专题')">查看专题</button>
          <button class="mini-btn" onclick="showToast('为什么推荐：与本文主题相关')">为什么出现</button>
        </div>
      </div>
      <div class="next-card">
        <div class="next-icon">💬</div>
        <div>
          <div class="next-title">看应对：普通人怎么判断一张图？</div>
          <div class="next-desc">给出截图、证件照、商品图和新闻现场图的核查清单。</div>
        </div>
      </div>
    `
  }
};

function switchScene(sceneName) {
  const target = document.querySelector(`.scene[data-scene="${sceneName}"]`);
  if (!target) {
    showToast('这个页面还没有接入');
    return;
  }

  $$('.scene').forEach((scene) => scene.classList.remove('active'));
  target.classList.add('active');
  closeDrawer();
  setProgress(sceneName);
  notifyParent(sceneName);
}

function openTool(tool) {
  const item = drawerContent[tool];
  if (!item) {
    showToast('这个功能还没有接入');
    return;
  }
  const article = document.querySelector('.scene[data-scene="article"]');
  if (article && !article.classList.contains('active')) {
    $$('.scene').forEach((scene) => scene.classList.remove('active'));
    article.classList.add('active');
  }
  $$('.tool').forEach((button) => button.classList.toggle('active', button.dataset.tool === tool));
  const title = $('#drawer-title');
  const body = $('#drawer-body');
  const drawer = $('#drawer');
  if (!title || !body || !drawer) {
    console.error('Drawer elements are missing');
    return;
  }
  title.textContent = item.title;
  body.innerHTML = item.html;
  drawer.classList.add('open');
  setProgress(tool);
  notifyParent(tool);
}

function closeDrawer(clearActive = true) {
  const drawer = $('#drawer');
  if (drawer) drawer.classList.remove('open');
  if (clearActive) {
    $$('.tool').forEach((button) => button.classList.remove('active'));
    setProgress('article');
  }
}

function setProgress(key) {
  const progress = $('#progress');
  if (progress) progress.textContent = progressMap[key] || '1 / 5';
}

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function notifyParent(scene) {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'scene-changed', scene }, '*');
  }
}

window.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'switch-scene') {
    switchScene(event.data.scene);
  }
  if (event.data.type === 'open-tool') {
    openTool(event.data.tool);
  }
});

window.switchScene = switchScene;
window.openTool = openTool;
window.closeDrawer = closeDrawer;
window.showToast = showToast;
