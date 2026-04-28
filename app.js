/* ===================================================
   腾讯新闻 Agent 版 · 原型交互
   =================================================== */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ---------- 场景切换 ----------
function switchScene(sceneName, scrollTop = true) {
  $$('.scene').forEach(s => s.classList.remove('active'));
  $$('.scene-btn').forEach(b => b.classList.remove('active'));
  $$('.tab-v2').forEach(t => t.classList.remove('active'));

  const target = document.querySelector(`.scene[data-scene="${sceneName}"]`);
  const btn = document.querySelector(`.scene-btn[data-scene="${sceneName}"]`);
  if (target) target.classList.add('active');
  if (btn) btn.classList.add('active');

  // 底部 tab 高亮
  const tabMap = { home: 'home', agent: 'agent' };
  if (tabMap[sceneName]) {
    const tab = document.querySelector(`.tab-v2[data-tab="${tabMap[sceneName]}"]`);
    if (tab) tab.classList.add('active');
  }

  if (scrollTop) {
    $$('.scroll-area, .sandbox-stage, .remix-stage, .scene-agent').forEach(el => {
      if (el.scrollTo) el.scrollTo(0, 0);
    });
  }

  // 场景特殊初始化
  if (sceneName === 'sandbox') {
    setTimeout(() => initSandbox(), 50);
  }
  if (sceneName === 'factcheck') {
    setTimeout(() => initFactCheck(), 50);
  }
  if (sceneName === 'remix') {
    setTimeout(() => switchRemixStyle('orig'), 50);
  }
  if (sceneName === 'typhoon') {
    setTimeout(() => initTyphoon(), 50);
  }
  if (sceneName === 'manga') {
    setTimeout(() => {
      const hint = $('#manga-hint');
      if (hint) hint.textContent = '↑ 试试点沙漏、压力锅、三条路';
    }, 50);
  }
  if (sceneName === 'home') {
    setTimeout(() => {
      const hint = $('#swipe-hint');
      if (hint) {
        hint.style.display = 'flex';
        setTimeout(() => { hint.style.display = 'none'; }, 4000);
      }
    }, 300);
  }
  if (sceneName === 'chat') {
    const msgs = $('#chat-messages');
    if (msgs) msgs.scrollTop = 0;
  }

  // 外层通知
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'scene-changed', scene: sceneName }, '*');
  }
}

// 场景切换按钮
$$('.scene-btn').forEach(b => {
  b.addEventListener('click', () => switchScene(b.dataset.scene));
});

// 新闻卡片 / Playable 卡片 / Agent 卡片点击跳转
document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-goto]');
  if (go) {
    e.stopPropagation();
    switchScene(go.dataset.goto);
    return;
  }
  const back = e.target.closest('[data-back]');
  if (back) {
    e.stopPropagation();
    switchScene(back.dataset.back);
  }
});

// ---------- Toast ----------
let toastTimer = null;
function triggerToast(msg) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// ---------- 场景 3：关系图谱 ----------
const graphNodeData = {
  center: {
    title: '25-35 万中型 SUV 市场',
    sub: '共 3 款热门车型',
    body: `
      <div class="nd-stat"><span>价格区间</span><span><strong>28.5 - 32.8 万</strong></span></div>
      <div class="nd-stat"><span>共同标签</span><span>智驾 · 新能源 · 中型</span></div>
      <div class="nd-stat"><span>推荐指数</span><span><strong>★★★★☆</strong></span></div>
      <div style="margin-top:10px;font-size:12px;color:#8892a6">点击周围任意节点，看具体对比 →</div>
    `
  },
  nio: {
    title: '蔚来 ET5T',
    sub: '落地价 32.8 万',
    body: `
      <div class="nd-stat"><span>核心优势</span><span><strong>换电网络</strong></span></div>
      <div class="nd-stat"><span>城市智驾</span><span>7/10 成功率</span></div>
      <div class="nd-stat"><span>后排空间</span><span>柔软舒适</span></div>
      <div class="nd-badges">
        <span class="nd-badge">换电</span>
        <span class="nd-badge">跨城便利</span>
        <span class="nd-badge">豪华感</span>
      </div>
    `
  },
  jiyue: {
    title: '极越 07（固态电池版）',
    sub: '落地价 31.2 万 · 本文主推',
    body: `
      <div class="nd-stat"><span>核心优势</span><span><strong>城市智驾</strong></span></div>
      <div class="nd-stat"><span>OTA 4.3.0 后</span><span>9/10 零接管</span></div>
      <div class="nd-stat"><span>续航</span><span><strong>800+ km</strong></span></div>
      <div class="nd-badges">
        <span class="nd-badge">🤖 智驾最优</span>
        <span class="nd-badge">🔋 固态电池</span>
        <span class="nd-badge">纯视觉方案</span>
      </div>
    `
  },
  lixiang: {
    title: '理想 L6',
    sub: '落地价 29.8 万',
    body: `
      <div class="nd-stat"><span>核心优势</span><span><strong>奶爸场景</strong></span></div>
      <div class="nd-stat"><span>车长</span><span>5.1 米（最大空间）</span></div>
      <div class="nd-stat"><span>二胎家庭首选</span><span>✓</span></div>
      <div class="nd-badges">
        <span class="nd-badge">空间王</span>
        <span class="nd-badge">长途自驾</span>
        <span class="nd-badge">实用主义</span>
      </div>
    `
  },
  zhijia: {
    title: '城市智驾维度',
    sub: '本次横评的核心对比点',
    body: `
      <div class="nd-stat"><span>极越 07</span><span><strong>9/10</strong> 成功率</span></div>
      <div class="nd-stat"><span>蔚来 ET5T</span><span>7/10</span></div>
      <div class="nd-stat"><span>理想 L6</span><span>5/10</span></div>
      <div style="margin-top:8px;font-size:12px;color:#8892a6">深圳 CBD → 南山科技园实测数据</div>
    `
  },
  battery: {
    title: '电池技术对比',
    sub: '决定续航与空间',
    body: `
      <div class="nd-stat"><span>极越 07</span><span><strong>固态电池</strong></span></div>
      <div class="nd-stat"><span>蔚来 ET5T</span><span>三元锂 + 换电</span></div>
      <div class="nd-stat"><span>理想 L6</span><span>磷酸铁锂 + 增程</span></div>
    `
  }
};

function selectGraphNode(nodeId) {
  const data = graphNodeData[nodeId];
  if (!data) return;
  $('#nd-title').textContent = data.title;
  $('#nd-sub').textContent = data.sub;
  $('#nd-body').innerHTML = data.body;

  // 节点视觉反馈
  $$('.g-node').forEach(n => n.setAttribute('opacity', '0.55'));
  const node = document.querySelector(`.g-node[data-node="${nodeId}"]`);
  if (node) node.setAttribute('opacity', '1');
}

// ---------- 场景 4：数据沙盘 ----------
function initSandbox() {
  const slider = $('#sb-slider');
  if (!slider) return;
  slider.value = 50;
  updateSandbox(50);
  slider.oninput = (e) => updateSandbox(e.target.value);
}

function updateSandbox(val) {
  val = +val;
  // 0 → 1.0%, 50 → 2.0%, 100 → 3.0%
  const rate = (1.0 + val / 100 * 2.0).toFixed(2);
  $('#sb-rate').innerHTML = `${rate}<span>%</span>`;

  // 以 2.0% 为基准，100 万贷款 30 年，每增加 0.1% 约多 58 元月供
  const baseRate = 2.0;
  const delta = Math.round((rate - baseRate) * 580);
  const paymentEl = $('#sb-payment');
  paymentEl.className = 'sb-val-num';
  if (delta > 0) {
    paymentEl.innerHTML = `+${delta}<span>元</span>`;
    paymentEl.classList.add('up');
  } else if (delta < 0) {
    paymentEl.innerHTML = `${delta}<span>元</span>`;
    paymentEl.classList.add('down');
  } else {
    paymentEl.innerHTML = `0<span>元</span>`;
    paymentEl.classList.add('neutral');
  }

  // 更新折线图
  const path = $('#sb-path');
  const area = $('#sb-area');
  const shift = (rate - baseRate) * 40; // 基准 y=75
  const points = [
    [0, 75],
    [70, 75 + shift * 0.3],
    [140, 75 + shift * 0.6],
    [210, 75 + shift * 0.85],
    [280, 75 + shift * 1.0],
    [350, 75 + shift * 1.15]
  ];
  const d = points.map((p, i) => (i === 0 ? 'M' : 'L') + ` ${p[0]} ${Math.max(10, Math.min(140, p[1]))}`).join(' ');
  path.setAttribute('d', d);
  area.setAttribute('d', d + ' L 350 150 L 0 150 Z');

  // 趋势提示 + Agent 解读
  const trend = $('#sb-trend');
  const insight = $('#sb-insight-text');
  const insightTitle = $('#sb-insight-title');
  if (rate < 1.8) {
    trend.innerHTML = '↗ <strong style="color:#ef4444">上行压力</strong>';
    insightTitle.textContent = 'Agent 解读：宽松周期信号';
    insight.innerHTML = `利率降到 <strong>${rate}%</strong>，意味着月供每月能少 ${Math.abs(delta)} 元。<br>历史上类似降息阶段，房价通常在 3-6 个月内缓慢回升。如果你正在看房，这是相对友好的窗口。`;
  } else if (rate > 2.2) {
    trend.innerHTML = '↘ <strong style="color:#10b981">下行压力</strong>';
    insightTitle.textContent = 'Agent 解读：紧缩周期信号';
    insight.innerHTML = `利率升到 <strong>${rate}%</strong>，月供每月多 ${delta} 元。<br>紧缩信号下，改善型需求会延迟入场，房价承压。<strong>持币观望</strong>可能是更优解。`;
  } else {
    trend.innerHTML = '→ 基本持平';
    insightTitle.textContent = 'Agent 解读：维稳信号';
    insight.innerHTML = `利率维持在 <strong>${rate}%</strong>，央行今天的 MLF 操作确认了这一判断。<br>短期内房贷成本不会有明显变化，按自住需求决策即可。`;
  }
}

// ---------- 场景 5：真假快判 ----------
let fcCountdownTimer = null;
let fcCountdown = 3;

function initFactCheck() {
  $('#fc-card').style.display = 'block';
  $('#fc-result').style.display = 'none';
  fcCountdown = 3;
  $('#fc-countdown').textContent = fcCountdown;
  const ring = $('#fc-timer-ring');
  ring.setAttribute('stroke-dashoffset', '0');

  clearInterval(fcCountdownTimer);
  let step = 0;
  fcCountdownTimer = setInterval(() => {
    step++;
    fcCountdown--;
    $('#fc-countdown').textContent = Math.max(0, fcCountdown);
    ring.setAttribute('stroke-dashoffset', (226 * step / 3).toString());
    if (fcCountdown <= 0) {
      clearInterval(fcCountdownTimer);
    }
  }, 1000);
}

function fcAnswer(answer) {
  clearInterval(fcCountdownTimer);
  $('#fc-card').style.display = 'none';
  $('#fc-result').style.display = 'block';
  if (answer === 'fake') {
    triggerToast('✅ 答对了！');
  } else {
    triggerToast('哎，这条是假的哦');
  }
}

function fcNext() {
  triggerToast('下一题加载中... · 本 Demo 只内置一题');
}

// ---------- 场景 6：读懂（原文 / 太长不看）----------
const remixStyles = {
  orig: {
    emoji: '📰',
    title: 'GPT-image 2 实测 3 小时：AI 生成图像真的能以假乱真了',
    body: `
      2026 年 4 月 24 日凌晨，OpenAI 悄悄上线了 GPT-image 2。官方博客只有三段话，没有发布会，没有 Sam 推特预热——但在之后的三个小时里，这个模型已经让整个内容圈集体失眠。<br><br>
      我们用 500 个测试 prompt 跑了一晚上，结论是：这是第一个能在细节层面骗过人眼的公开模型。它能做到跨 20 张图的人物一致性，能 15 分钟生成一套完整品牌视觉，甚至能"编造"逼真的新闻现场图。<br><br>
      发布 3 小时，推特上已经有人拿它生成的产品图骗过了 eBay 商家。ProductHunt 上基于 image2 API 的新产品，过去 7 天已经上了 14 个——早于模型正式发布。<br><br>
      <em>（全文约 1800 字，完整阅读请返回详情页）</em>
    `
  },
  tldr: {
    emoji: '⚡',
    title: '太长不看 · 3 个关键点 + 与你有什么关系',
    body: `
      <div class="tldr-point">
        <div class="tldr-num">01</div>
        <div class="tldr-body">
          <strong>它终于跨过了"以假乱真"的临界线。</strong><br>
          跨 20 张图的人物一致性、15 分钟完整品牌视觉、能编造逼真新闻图。Simon Willison：「第一次停止寻找 AI 痕迹」。
        </div>
      </div>
      <div class="tldr-point">
        <div class="tldr-num">02</div>
        <div class="tldr-body">
          <strong>API 已开放，$40 / 千张。</strong><br>
          ChatGPT Plus 今晚灰度，国内可通过 OpenRouter / Replicate 间接调用。
        </div>
      </div>
      <div class="tldr-point">
        <div class="tldr-num">03</div>
        <div class="tldr-body">
          <strong>30 天内会有一波新 AI 原生产品爆发。</strong><br>
          过去 7 天 ProductHunt 已有 14 个 image2 API 产品抢跑。
        </div>
      </div>

      <div class="tldr-relate">
        <div class="tldr-relate-head">💭 与你有什么关系</div>
        <div class="tldr-relate-body">
          基于你做<strong>AI × 内容运营</strong>和在搭 <strong>Hermes 知识库系统</strong>的背景，这条新闻直接相关有三点：<br><br>

          <strong>① 对你当下工作流的影响</strong><br>
          你现在的批量图文自动化链路（Claude Code + Obsidian + 飞书），图像一环之前一直是瓶颈。image2 相当于把这个环节从"可用"升级到"可商用"——意味着你的运营团队可以跑更短的 prompt 迭代周期。<br><br>

          <strong>② 对你"出海赚钱"方向的信号</strong><br>
          ProductHunt 上 7 天 14 个新产品 + $40/千张的定价，说明 image2 会是独立开发者接下来的"弹药"。这跟你关注的"下一个窗口期"强相关。<br><br>

          <strong>③ 一个可能的警戒</strong><br>
          "能编造逼真新闻图" 这点，跟你做的"内容真实性 × 事实核查"流程冲突。建议近期在你的工作流里加一道 AI 图像鉴伪的兜底。
        </div>
      </div>
    `
  }
};

function switchRemixStyle(style) {
  $$('.rm-style').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.rm-style[data-style="${style}"]`);
  if (btn) btn.classList.add('active');

  const loading = $('#remix-loading');
  const textEl = $('#rl-text');
  loading.classList.add('show');
  textEl.textContent = style === 'tldr' ? 'Agent 正在精简 + 分析与你的关系…' : '加载原文…';

  setTimeout(() => {
    loading.classList.remove('show');
    const data = remixStyles[style];
    const output = $('#remix-output');
    output.className = `remix-output style-${style}`;
    output.innerHTML = `
      <div class="rm-style-emoji">${data.emoji}</div>
      <div class="rm-style-title">${data.title}</div>
      <div class="rm-style-body">${data.body}</div>
    `;
  }, style === 'tldr' ? 1000 : 400);
}

function triggerRemix() {
  switchScene('remix');
}

// ---------- 场景 7：Chatbot（image2 追问）----------
const chatResponses = {
  '这个模型会影响到我做的内容运营工作吗？': {
    text: `直接影响，而且是正向的。<br><br>
你现在的 <strong>Claude Code + Obsidian + 飞书</strong> 批量图文工作流，图像一直是瓶颈——以前得额外调 Midjourney 手修。<br><br>
image2 补齐之后：<br>
• 一个 prompt 能稳定产出可商用图<br>
• 跨 20 张一致性意味着系列文章首图可以成套<br>
• $40/千张的定价，在你的体量下几乎可以忽略成本<br><br>
<strong>短期动作建议</strong>：先用 1 周小量接入，跑 3 个 case 验证。`,
    suggest: ['怎么快速接入到我的 Claude Code 工作流？', '对想做 AI 独立开发者的人意味着什么？']
  },
  '对想做 AI 独立开发者的人意味着什么？': {
    text: `意味着 <strong>窗口期开始了</strong>，但可能不长。<br><br>
过去 7 天 ProductHunt 有 14 个基于 image2 API 的新产品——这批开发者可能提前一周拿到了内测。等大规模开放后，会有一波工具型产品集中爆发。<br><br>
<strong>可切入方向</strong>：<br>
• 垂直场景（电商产品图、品牌视觉）<br>
• 工作流封装（prompt 模板化 + 批量产出）<br>
• 质量保证工具（AI 图鉴伪）<br><br>
跟你订阅的 IndieHackers 观察一致：<strong>做工作流，别做模型</strong>。`,
    suggest: ['怎么快速接入到我的 Claude Code 工作流？']
  },
  '怎么快速接入到我的 Claude Code 工作流？': {
    text: `步骤大致是：<br><br>
<strong>1. API 层</strong>：OpenAI image2 API 或 OpenRouter 转发（国内建议后者）<br>
<strong>2. Claude Code 侧</strong>：写一个 image_gen skill，输入 prompt + ref_image_url，输出 cos URL<br>
<strong>3. 对接 Obsidian</strong>：图片保存到 vault 的 assets/ 下，frontmatter 记录 prompt 和版本<br>
<strong>4. 兜底</strong>：加一层本地哈希 + 人工核对，区分 AI 生成图和原图<br><br>
如果你想，我可以帮你直接起草这个 skill 的 SPEC。`,
    suggest: ['起草 skill SPEC']
  }
};

function chatAsk(question) {
  const msgs = $('#chat-messages');
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble chat-user';
  userBubble.textContent = question;
  msgs.appendChild(userBubble);
  msgs.scrollTop = msgs.scrollHeight;

  setTimeout(() => {
    const typing = document.createElement('div');
    typing.className = 'chat-bubble chat-bot';
    typing.textContent = '正在思考…';
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;

    setTimeout(() => {
      typing.remove();
      const resp = chatResponses[question] || {
        text: '这是一个好问题。本 Demo 只内置了 3 条预设对话，真实场景下 Agent 会基于全文 RAG 和你的工作流上下文来回答。',
        suggest: []
      };
      const bot = document.createElement('div');
      bot.className = 'chat-bubble chat-bot';
      let html = resp.text;
      if (resp.suggest && resp.suggest.length) {
        html += '<div class="chat-suggest">';
        resp.suggest.forEach(s => {
          html += `<button class="cs-btn" onclick="chatAsk('${s}')">${s}</button>`;
        });
        html += '</div>';
      }
      bot.innerHTML = html;
      msgs.appendChild(bot);
      msgs.scrollTop = msgs.scrollHeight;
    }, 800);
  }, 300);
}

function chatSend() {
  const input = $('#chat-input');
  const val = input.value.trim();
  if (!val) return;
  chatAsk(val);
  input.value = '';
}

// ---------- 文章详情页：Agent 辅助阅读 ----------
const articleAgentResponses = {
  summary: {
    title: '📝 30 秒速览',
    body: `
      <div class="aad-section"><strong>核心结论：</strong>GPT-image 2 是第一个在细节层面跨过以假乱真线的公开模型。</div>
      <div class="aad-section">
        <strong>3 个关键能力：</strong>
        <ul class="aad-list">
          <li>跨 20 张人物一致性（首次）</li>
          <li>15 分钟完整品牌视觉</li>
          <li>能编造逼真的新闻现场图</li>
        </ul>
      </div>
      <div class="aad-section"><strong>落地信息：</strong>API $40/千张 · 今晚 ChatGPT Plus 灰度 · OpenRouter 可间接调用</div>
      <div class="aad-tip">💭 想看「对我有什么用」吗？</div>
      <div class="aad-quick">
        <button class="aad-chip" onclick="openArticleAgent('relate')">💭 对我有什么用</button>
        <button class="aad-chip" onclick="openArticleAgent('ask')">💬 我想追问</button>
      </div>
    `
  },
  relate: {
    title: '💭 这篇跟你有什么关系',
    body: `
      <div class="aad-intro">基于你在做 <strong>AI × 内容运营</strong>、搭 Hermes 知识库、关注出海机会——</div>
      <div class="aad-relate-card primary">
        <div class="aad-relate-head">🎯 对你当下工作流的直接影响</div>
        <div class="aad-relate-body">Claude Code + Obsidian 批量图文链路里，图像一直是瓶颈。image2 把这一环从"可用"升到"可商用"。<br><strong>下一步</strong>：先用 1 周小量接入，跑 3 个 case 验证。</div>
      </div>
      <div class="aad-relate-card">
        <div class="aad-relate-head">💼 对"出海赚钱"方向的信号</div>
        <div class="aad-relate-body">7 天 14 个 ProductHunt 新品 + $40/千张的定价，image2 会是独立开发者接下来的"弹药"。</div>
      </div>
      <div class="aad-relate-card warn">
        <div class="aad-relate-head">⚠️ 需要注意的风险</div>
        <div class="aad-relate-body">"能编造逼真新闻图" 和你做的事实核查流程冲突——近期给工作流加一道 AI 图鉴伪的兜底。</div>
      </div>
      <div class="aad-quick"><button class="aad-chip" onclick="openArticleAgent('ask')">💬 我想追问</button></div>
    `
  },
  ask: {
    title: '💬 围绕这篇你想问什么？',
    body: `
      <div class="aad-intro">Agent 已经完整读过这篇，随便问。</div>
      <div class="aad-quick-col">
        <button class="aad-chip-full" onclick="goToChat('这个模型会影响到我做的内容运营工作吗？')">这个模型会影响到我做的内容运营工作吗？</button>
        <button class="aad-chip-full" onclick="goToChat('怎么快速接入到我的 Claude Code 工作流？')">怎么接入 Claude Code 工作流？</button>
        <button class="aad-chip-full" onclick="goToChat('对想做 AI 独立开发者的人意味着什么？')">对想独立开发的人意味着什么？</button>
      </div>
      <div class="aad-or">或者直接问</div>
      <div class="aad-input-wrap">
        <input type="text" class="aad-input" placeholder="比如：能帮我起草接入 skill 的 SPEC 吗？" readonly onclick="goToChat(null)">
        <button class="aad-input-send" onclick="goToChat(null)">→</button>
      </div>
    `
  },
  float: {
    title: '💬 读完了，来聊聊？',
    body: `
      <div class="aad-intro">你刚读完这篇报道。Agent 帮你准备了两个切入角度：</div>
      <div class="aad-quick-col">
        <button class="aad-chip-full" onclick="openArticleAgent('relate')">💭 看看这篇和我有什么关系</button>
        <button class="aad-chip-full" onclick="openArticleAgent('ask')">💬 我有问题想问</button>
      </div>
    `
  },
  'inline-1': {
    title: '💡 关于"15 分钟生成品牌视觉"',
    body: `
      <div class="aad-intro">这段讲的能力，对你的工作流直接可落地：</div>
      <div class="aad-relate-card primary">
        <div class="aad-relate-head">可以做什么</div>
        <div class="aad-relate-body">• 把"玩主笔迹"公众号头图自动化（同款笔 × 不同场景）<br>• 热点拆解 prompt 加图像模块，产出即可用的图文<br>• 运营团队的产品发布图，从 1 天压到 30 分钟</div>
      </div>
      <div class="aad-quick"><button class="aad-chip" onclick="openArticleAgent('ask')">💬 接入细节我想问</button></div>
    `
  },
  'inline-2': {
    title: '⚠️ 关于"能编造逼真新闻图"',
    body: `
      <div class="aad-intro">这跟你做的事实核查直接冲突，建议这样应对：</div>
      <div class="aad-relate-card warn">
        <div class="aad-relate-head">工作流调整建议</div>
        <div class="aad-relate-body">• 加一层 AI 图鉴伪（如 Optic / Hive AI）<br>• 对"朋友圈疯传的新闻图"做强制反搜确认<br>• 家族群传言类，默认标记"需要人工确认"</div>
      </div>
      <div class="aad-quick"><button class="aad-chip" onclick="openArticleAgent('ask')">💬 我想细聊</button></div>
    `
  }
};

function openArticleAgent(type) {
  const data = articleAgentResponses[type] || articleAgentResponses['float'];
  const body = $('#aad-body');
  body.innerHTML = `<div class="aad-section-title">${data.title}</div>${data.body}`;
  $('#art-agent-drawer').classList.add('open');
}

function closeArticleAgent() {
  $('#art-agent-drawer').classList.remove('open');
}

function goToChat(preset) {
  closeArticleAgent();
  switchScene('chat');
  if (preset) {
    setTimeout(() => chatAsk(preset), 400);
  }
}

// ---------- 初始化 ----------
// ---------- 首页沉浸流：点赞/收藏 ----------
function iFeedLike(el, e) {
  if (e) e.stopPropagation();
  el.classList.toggle('liked');
  const count = el.querySelector('.irr-count');
  if (count && el.classList.contains('liked')) {
    triggerToast('❤️ 已点赞');
  }
}

function iFeedBookmark(el, e) {
  if (e) e.stopPropagation();
  el.classList.toggle('bookmarked');
  if (el.classList.contains('bookmarked')) {
    triggerToast('⭐ 已收藏到"稍后读"');
  }
}

// ---------- 一图读懂漫画：点击元素 ----------
const mangaExplanations = {
  hourglass: '🕰 战争权力法 60 天授权到 5 月 1 日到期。如果特朗普不做出决定，宪法程序将自动触发。',
  countdown: '📜 战争权力法（War Powers Act）：美国总统发起军事行动必须在 60 天内获得国会授权，否则必须撤军。',
  pressure: '💥 国内政治压力：① 油价突破 $135 影响中期选举 ② 共和党内部已有议员公开表达反对',
  politics: '⚖ 特朗普此刻面临的结构性矛盾：强硬派想推政权更迭，现实派怕失掉中期选举。',
  option1: '🛣 寻求授权（受限）：国会批准后才能继续打，但民主党和部分共和党都会设条件。',
  option2: '🛣 30 天延期（仅一次）：法律允许总统以"紧急必要"为由延期一次，但会消耗政治资本。',
  option3: '🛣 无视期限（代价高）：等于与国会公开对抗，可能引发弹劾程序。',
  trump: '👤 特朗普：他的选择决定了 5 月后美以伊战争是停火、降级还是升级。'
};

function mangaTap(key) {
  const text = mangaExplanations[key];
  if (text) {
    const hint = $('#manga-hint');
    if (hint) hint.innerHTML = text;
  }
}

// ---------- 台风路径 ----------
const typhoonFrames = [
  { time: '04-24 14:00（现在）', force: '强台风 · 14 级', speed: '48 m/s', pressure: '935 hPa', dir: '西北 25km/h', insight: '💡 当前在巴士海峡，未来 12 小时内影响台湾南部。', pointIdx: 0 },
  { time: '04-25 02:00（+12h）', force: '强台风 · 14 级', speed: '50 m/s', pressure: '930 hPa', dir: '西北偏北 22km/h', insight: '⚠️ 在台湾高雄附近登陆。高铁南段停运风险极高。', pointIdx: 1 },
  { time: '04-25 14:00（+24h）', force: '台风 · 12 级', speed: '38 m/s', pressure: '960 hPa', dir: '北 20km/h', insight: '💡 穿越台湾后进入东海，可能掠过浙江东部。', pointIdx: 2 },
  { time: '04-26 02:00（+36h）', force: '强热带风暴 · 10 级', speed: '28 m/s', pressure: '975 hPa', dir: '北 18km/h', insight: '⚠️ 预计登陆浙江舟山或宁波一带。上海有大到暴雨。', pointIdx: 3 },
  { time: '04-26 14:00（+48h）', force: '热带风暴 · 8 级', speed: '20 m/s', pressure: '990 hPa', dir: '北 15km/h', insight: '💡 内陆减弱，但江浙沪仍有持续降雨。', pointIdx: 4 },
  { time: '04-27 02:00（+60h）', force: '低压 · 热带减弱', speed: '12 m/s', pressure: '1000 hPa', dir: '减弱消散', insight: '💡 系统减弱为温带低压，影响东北地区局部。', pointIdx: 5 }
];

function initTyphoon() {
  const slider = $('#tt-slider');
  if (!slider) return;
  slider.value = 0;
  updateTyphoon(0);
  slider.oninput = (e) => updateTyphoon(+e.target.value);
}

function updateTyphoon(idx) {
  const f = typhoonFrames[idx];
  if (!f) return;
  $('#tt-time').textContent = f.time;
  $('#tt-force').textContent = f.force;
  $('#ts-speed').textContent = f.speed;
  $('#ts-pressure').textContent = f.pressure;
  $('#ts-direction').textContent = f.dir;
  $('#typhoon-insight').innerHTML = f.insight;

  // 移动台风眼到对应点
  const points = [
    { x: 340, y: 460 }, { x: 320, y: 440 }, { x: 290, y: 410 },
    { x: 250, y: 360 }, { x: 200, y: 300 }, { x: 140, y: 240 }
  ];
  const eye = $('#typhoon-eye');
  if (eye) {
    const p = points[f.pointIdx];
    eye.setAttribute('transform', `translate(${p.x}, ${p.y})`);
  }

  // 高亮对应节点
  $$('.tp-point').forEach((pt, i) => {
    if (i === f.pointIdx) {
      pt.setAttribute('r', '10');
      pt.setAttribute('fill', '#ef4444');
      pt.setAttribute('opacity', '1');
    } else if (i < f.pointIdx) {
      pt.setAttribute('r', '6');
      pt.setAttribute('fill', '#fbbf24');
      pt.setAttribute('opacity', '0.7');
    } else {
      pt.setAttribute('r', '7');
      pt.setAttribute('fill', '#60a5fa');
      pt.setAttribute('opacity', (0.6 - (i - f.pointIdx) * 0.08).toString());
    }
  });

  // 更新路径：已走的实线延伸
  const past = $('#typhoon-path-past');
  if (past) {
    const coords = points.slice(0, f.pointIdx + 1).map((p, i) => (i === 0 ? `M${p.x} ${p.y}` : `L${p.x} ${p.y}`)).join(' ');
    past.setAttribute('d', coords || 'M340 460');
  }
}

console.log('🤖 V4 · 沉浸流 + 4 场景已就绪');

// 接受外层指令
window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'switch-scene' && e.data.scene) {
    switchScene(e.data.scene);
  }
});
