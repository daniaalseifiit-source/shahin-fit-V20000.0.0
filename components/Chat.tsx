
import React, { useState, useRef, useEffect } from 'react';
import { Message, UserRole } from '../types';
import { Send, User, ShieldCheck, CheckCheck } from 'lucide-react';

interface ChatProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  currentUserRole: UserRole;
  recipientName: string;
}

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, currentUserRole, recipientName }) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="flex flex-col h-[500px] glass rounded-[40px] border-white/10 overflow-hidden shadow-2xl">
      <div className="p-6 bg-white/5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            {currentUserRole === UserRole.TRAINER ? <User size={20} /> : <ShieldCheck size={20} />}
          </div>
          <div>
            <div className="font-black text-sm text-white">گفتگو با {recipientName}</div>
            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest italic">Encrypted Channel</div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isMe = (currentUserRole === UserRole.TRAINER && msg.senderId === 'ADMIN') || 
                       (currentUserRole === UserRole.STUDENT && msg.senderId !== 'ADMIN');
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-[25px] text-sm font-bold ${
                isMe ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-white/10 text-gray-300 rounded-bl-none'
              }`}>
                {msg.text}
                <div className="text-[8px] mt-2 opacity-50 flex items-center gap-1">
                  {new Date(msg.timestamp).toLocaleTimeString('fa-IR')}
                  {isMe && <CheckCheck size={10} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-white/5 border-t border-white/5 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="پیام خود را بنویسید..."
          className="flex-1 bg-white/5 rounded-2xl px-6 py-3 border border-white/10 outline-none focus:border-cyan-500/50"
        />
        <button onClick={handleSend} className="w-12 h-12 rounded-full bg-cyan-600 text-white flex items-center justify-center shadow-xl">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default Chat;
