// src/utils/streamingParser.js

/**
 * 检查 JSON 是否完整（括号匹配）
 * 不依赖 JSON.parse，通过遍历字符统计括号深度
 */
export function isJSONComplete(str) {
  if (!str) return false;
  let depth = 0;
  let inString = false;
  let escaped = false;
  
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0 && ch === '}') return true;
    }
  }
  return false;
}

/**
 * 标签栈解析：安全截断 HTML
 * 返回最后一个完整标签结束位置之前的内容
 */
export function getSafeHTML(htmlBuffer) {
  if (!htmlBuffer) return '';
  
  const tagStack = [];
  let lastSafeIndex = 0;
  const tagRegex = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g;
  let match;
  
  const voidElements = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);
  
  while ((match = tagRegex.exec(htmlBuffer)) !== null) {
    const isClosing = match[1] === '/';
    const tagName = match[2].toLowerCase();
    const fullTag = match[0];
    const tagEnd = match.index + fullTag.length;
    const isSelfClosing = fullTag.endsWith('/>') || voidElements.has(tagName);
    
    if (isClosing) {
      if (tagStack.length > 0 && tagStack[tagStack.length - 1] === tagName) {
        tagStack.pop();
        lastSafeIndex = tagEnd;
      }
    } else if (!isSelfClosing) {
      tagStack.push(tagName);
      lastSafeIndex = tagEnd;
    } else {
      lastSafeIndex = tagEnd;
    }
  }
  
  return htmlBuffer.substring(0, lastSafeIndex);
}

/**
 * 从流式缓冲区中提取部分 widget_code（手动解析，避免 JSON.parse 报错）
 */
export function extractWidgetCode(buffer) {
  if (!buffer) return null;
  
  // 找到最后一个 show-widget 围栏
  const matches = [...buffer.matchAll(/`{1,3}show-widget/g)];
  if (matches.length === 0) return null;
  
  const lastMatch = matches[matches.length - 1];
  const afterMarker = buffer.slice(lastMatch.index);
  
  const jsonStart = afterMarker.indexOf('{');
  if (jsonStart === -1) return null;
  
  const jsonPart = afterMarker.slice(jsonStart);
  const keyIdx = jsonPart.indexOf('"widget_code"');
  if (keyIdx === -1) return null;
  
  const colonIdx = jsonPart.indexOf(':', keyIdx + 13);
  if (colonIdx === -1) return null;
  
  const quoteIdx = jsonPart.indexOf('"', colonIdx + 1);
  if (quoteIdx === -1) return null;
  
  let raw = jsonPart.slice(quoteIdx + 1);
  raw = raw.replace(/"\s*\}\s*$/, '');
  if (raw.endsWith('\\')) raw = raw.slice(0, -1);
  
  // 处理转义字符
  try {
    return raw
      .replace(/\\\\/g, '\x00BACKSLASH\x00')
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r')
      .replace(/\\"/g, '"')
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/\x00BACKSLASH\x00/g, '\\');
  } catch (e) {
    return null;
  }
}

/**
 * 检测是否有未闭合的 script 标签
 */
export function hasUnclosedScript(htmlCode) {
  if (!htmlCode) return false;
  const lastScript = htmlCode.lastIndexOf('<script');
  if (lastScript === -1) return false;
  const afterScript = htmlCode.slice(lastScript);
  return !/<\/script>/i.test(afterScript);
}

/**
 * 解析消息内容，分离普通文本和 widget
 * @param {string} content - 原始消息内容
 * @param {boolean} isStreaming - 是否正在流式传输
 * @returns {Array} 分段数组 [{ type: 'text', content }, { type: 'widget', data }]
 */
export function parseMessageContent(content, isStreaming) {
  const segments = [];
  if (!content) return segments;
  
  const hasWidgetFence = /`{1,3}show-widget/.test(content);
  
  if (!hasWidgetFence) {
    // 普通文本
    segments.push({ type: 'text', content });
    return segments;
  }
  
  if (isStreaming) {
    // 流式状态：只处理已完整的 widget
    const matches = [...content.matchAll(/`{1,3}show-widget/g)];
    const lastMatch = matches[matches.length - 1];
    const beforePart = content.slice(0, lastMatch.index);
    const afterLastFence = content.slice(lastMatch.index);
    
    // 检查最后一个围栏的 JSON 是否完整
    const jsonStart = afterLastFence.indexOf('{');
    let isJSONClosed = false;
    if (jsonStart !== -1) {
      let depth = 0, inString = false, escaped = false;
      for (let i = jsonStart; i < afterLastFence.length; i++) {
        const ch = afterLastFence[i];
        if (escaped) { escaped = false; continue; }
        if (ch === '\\' && inString) { escaped = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (ch === '{') depth++;
        if (ch === '}') { depth--; if (depth === 0) { isJSONClosed = true; break; } }
      }
    }
    
    if (isJSONClosed) {
      // 完整 widget：正常解析
      const fullWidget = extractWidgetCode(content);
      if (fullWidget) {
        // 前面的文本
        if (beforePart.trim()) {
          segments.push({ type: 'text', content: beforePart });
        }
        segments.push({ type: 'widget', data: { widget_code: fullWidget, title: '' } });
      } else {
        segments.push({ type: 'text', content });
      }
    } else {
      // JSON 不完整：只显示前面的文本
      const textWithoutFence = beforePart.replace(/`{1,3}show-widget[\s\S]*$/, '');
      if (textWithoutFence.trim()) {
        segments.push({ type: 'text', content: textWithoutFence });
      }
    }
  } else {
    // 非流式：解析所有完整 widget
    const widgetMatches = [...content.matchAll(/```show-widget\s*\n({[\s\S]*?})\n```/g)];
    let lastIndex = 0;
    
    for (const match of widgetMatches) {
      const beforeText = content.slice(lastIndex, match.index);
      if (beforeText.trim()) {
        segments.push({ type: 'text', content: beforeText });
      }
      try {
        const data = JSON.parse(match[1]);
        segments.push({ type: 'widget', data });
      } catch (e) {
        segments.push({ type: 'text', content: match[0] });
      }
      lastIndex = match.index + match[0].length;
    }
    
    const remaining = content.slice(lastIndex);
    if (remaining.trim()) {
      segments.push({ type: 'text', content: remaining });
    }
  }
  
  return segments;
}
