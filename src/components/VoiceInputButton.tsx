import { Mic, MicOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceInputButton({ onTranscript, disabled, className }: VoiceInputButtonProps) {
  const { t } = useLanguage();
  const [isListening, setIsListening] = useState(false);

  const handleClick = () => {
    if (isListening) {
      setIsListening(false);
      // Stop listening logic would go here with Web Speech API
    } else {
      setIsListening(true);
      
      // Check if browser supports speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN'; // Indian English, can switch based on language context
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onTranscript(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } else {
        // Fallback for browsers without speech recognition
        setTimeout(() => {
          setIsListening(false);
        }, 2000);
      }
    }
  };

  return (
    <Button
      type="button"
      variant="voice"
      size="icon-sm"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'relative transition-all',
        isListening && 'bg-accent text-accent-foreground',
        className
      )}
      title={t('tapToSpeak')}
    >
      {isListening ? (
        <>
          <MicOff className="h-4 w-4" />
          <span className="absolute inset-0 rounded-full bg-accent/30 animate-ping" />
        </>
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}
