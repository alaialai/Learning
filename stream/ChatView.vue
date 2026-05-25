<!-- src/views/ChatView.vue -->
<template>
  <div class="chat-container">
    <!-- 消息列表 -->
    <div class="messages-list" ref="messagesList">
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="message"
        :class="msg.role"
      >
        <div class="message-avatar">
          {{ msg.role === 'user' ? '👤' : '🤖' }}
        </div>
        <div class="message-content">
          <!-- 流式渲染分段内容 -->
          <template v-for="(seg, segIdx) in getMessageSegments(msg)">
            <!-- 普通文本 -->
            <div
              v-if="seg.type === 'text'"
              :key="`t-${segIdx}`"
              class="text-content"
              v-html="renderMarkdown(seg.content)"
            ></div>
            <!-- Widget 组件 -->
            <StreamingWidget
              v-else-if="seg.type === 'widget'"
              :key="`w-${segIdx}`"
              :widgetCode="seg.data.widget_code"
              :isStreaming="msg.isStreaming || false"
              :title="seg.data.title"
            />
          </template>
          
          <!-- 流式加载指示器 -->
          <div v-if="msg.isStreaming && !msg.content" class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <textarea
        v-model="inputText"
        @keydown.enter.prevent="sendMessage"
        placeholder="输入消息... (Enter 发送)"
        rows="3"
      ></textarea>
      <button @click="sendMessage" :disabled="isLoading || !inputText.trim()">
        {{ isLoading ? '发送中...' : '发送' }}
      </button>
    </div>
  </div>
</template>

<script>
import StreamingWidget from '../components/StreamingWidget.vue';
import { parseMessageContent } from '../utils/streamingParser';

// 简单的 Markdown 渲染（可替换为更完善的库如 marked）
function simpleMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

export default {
  name: 'ChatView',
  components: {
    StreamingWidget
  },
  data() {
    return {
      messages: [],      // 消息列表
      inputText: '',     // 输入框内容
      isLoading: false,  // 加载状态
      abortController: null  // 用于中断请求
    };
  },
  methods: {
    /**
     * 获取消息的分段内容（文本 + widget）
     */
    getMessageSegments(msg) {
      // 缓存解析结果，避免重复计算
      if (!msg._segments || msg._contentVersion !== msg.content) {
        msg._segments = parseMessageContent(msg.content, msg.isStreaming);
        msg._contentVersion = msg.content;
      }
      return msg._segments;
    },
    
    /**
     * 渲染 Markdown
     */
    renderMarkdown(text) {
      return simpleMarkdown(text);
    },
    
    /**
     * 发送消息
     */
    async sendMessage() {
      const text = this.inputText.trim();
      if (!text || this.isLoading) return;
      
      // 添加用户消息
      this.messages.push({
        role: 'user',
        content: text,
        isStreaming: false
      });
      
      // 添加空的助手消息（准备流式接收）
      const assistantMsg = {
        role: 'assistant',
        content: '',
        isStreaming: true
      };
      this.messages.push(assistantMsg);
      
      this.inputText = '';
      this.isLoading = true;
      
      // 滚动到底部
      this.$nextTick(() => this.scrollToBottom());
      
      // 发起流式请求
      this.abortController = new AbortController();
      
      try {
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
          signal: this.abortController.signal
        });
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          
          // 更新助手消息内容
          assistantMsg.content = fullContent;
          
          // 清除缓存的分段，下次重新计算
          delete assistantMsg._segments;
          delete assistantMsg._contentVersion;
          
          // 滚动到底部
          this.$nextTick(() => this.scrollToBottom());
        }
        
        assistantMsg.isStreaming = false;
        delete assistantMsg._segments;
        
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('流式请求失败:', error);
          assistantMsg.content = '抱歉，发生了一些错误，请稍后重试。';
          assistantMsg.isStreaming = false;
        }
      } finally {
        this.isLoading = false;
        this.abortController = null;
      }
    },
    
    /**
     * 滚动到消息列表底部
     */
    scrollToBottom() {
      const el = this.$refs.messagesList;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }
  },
  beforeDestroy() {
    // 中断进行中的请求
    if (this.abortController) {
      this.abortController.abort();
    }
  }
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 900px;
  margin: 0 auto;
  background: #f9fafb;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  animation: fadeIn 0.2s ease-out;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #3b82f6;
}

.message-content {
  max-width: 70%;
  background: white;
  padding: 12px 16px;
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.message.user .message-content {
  background: #3b82f6;
  color: white;
}

.text-content {
  line-height: 1.5;
  word-break: break-word;
}

.text-content :deep(code) {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 0.9em;
}

.text-content :deep(pre) {
  background: #1e293b;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #9ca3af;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.input-area {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.input-area textarea {
  flex: 1;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  resize: none;
  font-family: inherit;
  font-size: 14px;
}

.input-area textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.input-area button {
  padding: 0 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.input-area button:hover:not(:disabled) {
  background: #2563eb;
}

.input-area button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
