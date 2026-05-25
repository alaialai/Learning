<!-- src/components/StreamingWidget.vue -->
<template>
  <div class="streaming-widget" :class="{ 'is-streaming': isStreaming }">
    <iframe
      ref="iframeRef"
      class="widget-iframe"
      :title="title || 'widget-preview'"
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
    ></iframe>
    <!-- 流式加载遮罩 -->
    <div v-if="showOverlay" class="widget-overlay">
      <div class="overlay-content">
        <span class="spinner"></span>
        <span>{{ overlayText }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getSafeHTML, hasUnclosedScript } from '../utils/streamingParser';

export default {
  name: 'StreamingWidget',
  props: {
    // 原始 widget_code（可能不完整）
    widgetCode: {
      type: String,
      default: ''
    },
    // 是否正在流式传输
    isStreaming: {
      type: Boolean,
      default: false
    },
    // 可选标题
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      lastRenderedCode: ''
    };
  },
  computed: {
    // 安全截断后的 HTML
    safeCode() {
      return getSafeHTML(this.widgetCode);
    },
    // 是否显示覆盖层（流式且脚本未闭合）
    showOverlay() {
      return this.isStreaming && hasUnclosedScript(this.safeCode);
    },
    overlayText() {
      return this.isStreaming ? '🎨 正在添加交互效果...' : '';
    }
  },
  watch: {
    safeCode: {
      handler(newCode) {
        if (newCode && newCode !== this.lastRenderedCode) {
          this.updateIframe(newCode);
          this.lastRenderedCode = newCode;
        }
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 直接操作 iframe DOM 更新内容（无闪烁）
     */
    updateIframe(html) {
      const iframe = this.$refs.iframeRef;
      if (!iframe) return;
      
      // 包装完整 HTML
      const fullHtml = `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 16px;
            background: transparent;
          }
          @keyframes fadeSlide {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .fade-slide { animation: fadeSlide 0.2s ease-out; }
        </style>
      </head>
      <body class="fade-slide">
        ${html}
      </body>
      </html>`;
      
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(fullHtml);
        doc.close();
      } catch (e) {
        console.warn('[StreamingWidget] iframe 写入失败:', e);
      }
    }
  }
};
</script>

<style scoped>
.streaming-widget {
  position: relative;
  margin: 12px 0;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.streaming-widget.is-streaming {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.widget-iframe {
  width: 100%;
  min-height: 200px;
  border: none;
  display: block;
  background: white;
}

.widget-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 12px;
}

.overlay-content {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 40px;
  font-size: 13px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
