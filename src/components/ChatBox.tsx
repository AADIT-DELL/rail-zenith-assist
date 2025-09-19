import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Clock } from 'lucide-react';

interface ChatMessage {
  id: string;
  message: string;
  timestamp: Date;
  sender: 'controller' | 'system';
}

interface ChatBoxProps {
  onInstructionSent: (instruction: string) => void;
}

export const ChatBox = ({ onInstructionSent }: ChatBoxProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: 'Railway Control System initialized. Ready to receive instructions.',
      timestamp: new Date(),
      sender: 'system'
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      message: currentMessage.trim(),
      timestamp: new Date(),
      sender: 'controller'
    };

    setMessages(prev => [...prev, newMessage]);
    onInstructionSent(currentMessage.trim());
    setCurrentMessage('');

    // System acknowledgment
    setTimeout(() => {
      const ackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: 'Instruction received and logged. Use SUGGESTION button to get AI recommendations.',
        timestamp: new Date(),
        sender: 'system'
      };
      setMessages(prev => [...prev, ackMessage]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="control-panel h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Controller Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'controller' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.sender === 'controller'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <div className="text-sm">{msg.message}</div>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3 opacity-60" />
                  <span className="text-xs opacity-60 font-mono">
                    {msg.timestamp.toLocaleTimeString('en-IN')}
                  </span>
                  <Badge 
                    variant="outline" 
                    className="text-xs ml-2 opacity-60"
                  >
                    {msg.sender === 'controller' ? 'CTRL' : 'SYS'}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 p-4 border-t border-border">
          <div className="flex gap-2">
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter operational instructions, observations, or special conditions..."
              className="resize-none min-h-[60px] font-mono text-sm"
              rows={2}
            />
            <Button
              onClick={handleSendMessage}
              size="sm"
              disabled={!currentMessage.trim()}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2 font-mono">
            • Enter instructions for the AI to consider
            • Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </CardContent>
    </Card>
  );
};