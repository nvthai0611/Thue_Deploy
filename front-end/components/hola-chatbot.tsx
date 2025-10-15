"use client";

import { useState, useRef, useEffect, useCallback} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchWithoutAuth } from "@/utils/api/fetch";

const processMessageContent = (content: string) => {
  let processedContent = content.replace(
    /<Image\s+src="([^"]+)"\s+alt="([^"]+)"\s*\/>/g, 
    '<img src="$1" alt="$2" class="rounded-lg my-2 w-full h-auto" />'
  );
  
  processedContent = processedContent.replace(
    /<a\s+href="([^"]+)"\s+style="([^"]+)">([^<]+)<\/a>/g,
    '<a href="$1" style="$2" class="block mt-1 mb-2">$3</a>'
  );
  
  processedContent = processedContent.replace(
    /Xem chi tiết khu trọ(?!<\/a>)/g, 
    '<a href="/user/housing-area/123" style="color: #b91c1c; font-weight: bold; text-decoration: underline;" class="block mt-1 mb-2">Xem chi tiết khu trọ</a>'
  );
  
  processedContent = processedContent.replace(
    /Liên hệ chủ trọ(?!<\/a>)/g, 
    '<a href="/chat/123" style="color: #b91c1c; font-weight: bold; text-decoration: underline;" class="block mt-1 mb-2">Liên hệ chủ trọ</a>'
  );
  
  return processedContent;
};

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

const MAX_HISTORY_LENGTH = 10;

export function HolaChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Xin chào! Tôi là holaBot - trợ lý AI của HolaRental 🏠✨\n\nTôi có thể giúp bạn:\n• 🔍 Tìm kiếm nhà trọ theo địa điểm\n• 💰 Tư vấn về giá cả và tiện nghi\n• 📍 Gợi ý khu vực phù hợp\n• ❓ Giải đáp thắc mắc về dịch vụ\n\nBạn đang tìm kiếm gì hôm nay?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [responseCache, setResponseCache] = useState<Map<string, string>>(new Map());
  
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('holabot_messages');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, []);

  useEffect(() => {
    try {
      if (messages.length > 1) { 
        localStorage.setItem('holabot_messages', JSON.stringify(messages));
      }
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const simulateTyping = (message: string, delay: number = 50) => {
    setIsTyping(true);
    // Giảm thời gian typing xuống còn 50ms thay vì tính theo độ dài message
    setTimeout(() => {
      setIsTyping(false);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: message,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, delay);
  };

  const prepareConversationHistory = useCallback(() => {
    const recentMessages = messages.slice(1).slice(-MAX_HISTORY_LENGTH);
    
    return recentMessages.map((msg, index) => {
      const role = msg.isBot ? 'holaBot' : 'Người dùng';
      const timestamp = msg.timestamp.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      return `[${index + 1}] ${role} (${timestamp}): ${msg.content}`;
    }).join('\n\n');
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    // Check cache first
    const cacheKey = currentInput.toLowerCase().trim();
    const cachedResponse = responseCache.get(cacheKey);
    
    if (cachedResponse) {
      simulateTyping(cachedResponse, 10);
      return;
    }

    try {
      const conversationHistory = prepareConversationHistory();
      
      const response = await fetchWithoutAuth('/api/chat/message', {
        method: 'POST',
        body: JSON.stringify({ 
          message: currentInput,
          userId: 'anonymous',
          conversation_history: conversationHistory 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Cache the response with size limit
        setResponseCache(prev => {
          const newCache = new Map(prev);
          if (newCache.size >= 50) { // Limit cache to 50 entries
            const firstKey = newCache.keys().next().value;
            if (firstKey) {
              newCache.delete(firstKey);
            }
          }
          newCache.set(cacheKey, data.data.response);
          return newCache;
        });
        simulateTyping(data.data.response, 30);
      } else {
        throw new Error(data.message || 'API call failed');
      }
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Fallback to mock response if API fails
      let fallbackResponse = "";
      const lowerInput = currentInput.toLowerCase();
      
      // Enhanced fallback responses with more specific patterns
      if (lowerInput.includes("tìm") && (lowerInput.includes("trọ") || lowerInput.includes("nhà"))) {
        fallbackResponse = `🔍 Tôi hiểu bạn đang tìm kiếm nhà trọ!\n\n📍 Để tìm được kết quả tốt nhất, bạn có thể cho tôi biết:\n• Khu vực mong muốn (quận, phường, gần trường học...)\n• Mức giá dự kiến\n• Loại phòng (đơn/đôi)\n• Tiện nghi cần thiết\n\nVí dụ: "Tìm trọ quận 7 dưới 3 triệu" 💡`;
      } else if (lowerInput.includes("giá") || lowerInput.includes("tiền") || lowerInput.includes("bao nhiêu")) {
        fallbackResponse = `💰 Thông tin về giá cho thuê:\n\n📊 Mức giá trung bình tại HolaRental:\n• Phòng đơn: 2-4 triệu/tháng\n• Phòng đôi: 3-6 triệu/tháng\n• Phòng cao cấp: 5-10 triệu/tháng\n\n📍 Giá có thể thay đổi tùy theo:\n• Vị trí địa lý\n• Tiện nghi đi kèm\n• Diện tích phòng\n\nBạn có ngân sách cụ thể nào không? 🤔`;
      } else if (lowerInput.includes("chào") || lowerInput.includes("xin chào") || lowerInput.includes("hello")) {
        fallbackResponse = `👋 Xin chào! Tôi là holaBot - trợ lý AI của HolaRental!\n\nTôi có thể giúp bạn:\n• 🔍 Tìm kiếm nhà trọ theo địa điểm\n• 💰 Tư vấn về giá cả và tiện nghi\n• 📍 Gợi ý khu vực phù hợp\n• ❓ Giải đáp thắc mắc về dịch vụ\n\nBạn đang tìm kiếm gì hôm nay? 😊`;
      } else if (lowerInput.includes("cảm ơn") || lowerInput.includes("thanks")) {
        fallbackResponse = `😊 Không có gì! Tôi rất vui được giúp đỡ bạn.\n\nNếu bạn cần thêm thông tin gì, đừng ngại hỏi nhé! Tôi luôn sẵn sàng hỗ trợ bạn tìm kiếm nhà trọ phù hợp nhất. 🏠✨`;
      } else {
        fallbackResponse = `🔧 Xin lỗi, tôi đang gặp sự cố kết nối với AI. Vui lòng thử lại sau!\n\nTrong lúc chờ đợi, bạn có thể:\n• Khám phá các khu vực có sẵn\n• Xem thông tin giá cả\n• Liên hệ trực tiếp với chúng tôi 📞`;
      }
      
      // Cache fallback response too with size limit
      setResponseCache(prev => {
        const newCache = new Map(prev);
        if (newCache.size >= 50) { // Limit cache to 50 entries
          const firstKey = newCache.keys().next().value;
          if (firstKey) {
            newCache.delete(firstKey);
          }
        }
        newCache.set(cacheKey, fallbackResponse);
        return newCache;
      });
      simulateTyping(fallbackResponse, 20);
    }
  }, [inputValue, isLoading, prepareConversationHistory, responseCache]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Xóa lịch sử hội thoại
  const clearChatHistory = () => {
    const welcomeMessage = messages[0];
    setMessages([welcomeMessage]);
    localStorage.removeItem('holabot_messages');
    // Clear cache when clearing history
    setResponseCache(new Map());
  };

  return (
    <>
      {/* Floating chat button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-16 w-16 rounded-full shadow-2xl bg-red-700 hover:bg-red-800 border-2 border-white group transition-all duration-300 hover:scale-110"
            size="icon"
          >
            <MessageCircle className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
          </Button>
          {/* Floating tooltip */}
          <div className="absolute bottom-20 right-0 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Chat với holaBot 💬
          </div>
        </div>
      )}

      {/* Chat window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] flex flex-col shadow-2xl z-50 bg-background border-2 overflow-hidden rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-red-700 text-white">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarImage src="/api/placeholder/40/40" />
                <AvatarFallback className="bg-white text-red-700 font-bold">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">holaBot</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-xs text-white">Online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChatHistory}
                title="Xóa lịch sử trò chuyện"
                className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-in slide-in-from-bottom-2",
                  message.isBot ? "justify-start" : "justify-end"
                )}
              >
                {message.isBot && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-red-700 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className="flex flex-col max-w-[75%]">
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                      message.isBot
                        ? "bg-gray-100 text-gray-800 border border-gray-200"
                        : "bg-red-700 text-white"
                    )}
                  >
                    <div 
  className="whitespace-pre-wrap"
  dangerouslySetInnerHTML={{ __html: processMessageContent(message.content) }}
/>
                  </div>
                  <div className={cn(
                    "text-xs text-gray-500 mt-1 px-2",
                    message.isBot ? "text-left" : "text-right"
                  )}>
                    {message.timestamp.toLocaleTimeString('vi-VN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>

                {!message.isBot && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-gray-400 text-white">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {/* Typing indicator */}
            {(isLoading || isTyping) && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-red-700 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-2xl px-4 py-3 border border-gray-200 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                disabled={isLoading}
                className="flex-1 rounded-full border-2 border-gray-200 focus:border-red-500 transition-colors"
              />
              <Button 
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                size="icon"
                className="shrink-0 rounded-full bg-red-700 hover:bg-red-800 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to start, HolaBot is always ready to help 24/7 🤖
            </p>
          </div>
        </Card>
      )}
    </>
  );
} 