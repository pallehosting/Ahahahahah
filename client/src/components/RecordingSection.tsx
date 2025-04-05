import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AudioVisualizer from '@/components/ui/visualizer';
import { createRecording } from '@/lib/recording';
import { formatDuration } from '@/lib/recording';
import { Mic, Pause, Square, Play } from 'lucide-react';

interface RecordingSectionProps {
  courseId: number | null;
}

const RecordingSection: React.FC<RecordingSectionProps> = ({ courseId }) => {
  const [title, setTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      chunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setAudioBlob(blob);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      
      // Start timer
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile accedere al microfono. Verifica le tue impostazioni.',
        variant: 'destructive',
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    } else if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resetRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    
    setTitle('');
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setAudioURL(null);
    setAudioBlob(null);
    
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
  };

  const handleProcessRecording = async () => {
    if (!audioBlob) {
      toast({
        title: 'Errore',
        description: 'Nessuna registrazione disponibile da processare.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!title.trim()) {
      toast({
        title: 'Errore',
        description: 'Inserisci un titolo per la registrazione.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      await createRecording(title, audioBlob, courseId, duration);
      
      toast({
        title: 'Registrazione caricata',
        description: 'La tua registrazione è in elaborazione. Riceverai una notifica quando sarà pronta.',
      });
      
      resetRecording();
    } catch (error) {
      console.error('Error processing recording:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile processare la registrazione. Riprova più tardi.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Nuova registrazione</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Label htmlFor="recording-title" className="mb-1">Titolo della lezione</Label>
          <Input
            id="recording-title"
            placeholder="Es. Lezione 5: Equazioni di Maxwell"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isRecording || isProcessing}
          />
        </div>
        
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative mb-6 h-32 w-full max-w-md">
            <AudioVisualizer 
              audioStream={streamRef.current}
              isRecording={isRecording && !isPaused}
            />
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <Button
              size="lg"
              className={`w-16 h-16 rounded-full ${
                isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
              }`}
              disabled={isProcessing}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
            
            <Button
              size="icon"
              variant="outline"
              className="w-12 h-12 rounded-full"
              disabled={!isRecording || isProcessing}
              onClick={pauseRecording}
            >
              {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            </Button>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            {isRecording 
              ? (isPaused ? 'Registrazione in pausa' : 'Registrazione in corso...') 
              : (audioBlob ? 'Registrazione completata' : 'Premi il pulsante rosso per iniziare la registrazione')}
          </div>
          
          {(isRecording || audioBlob) && (
            <div className="mt-4 text-sm">
              {isRecording && (
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse mr-2"></div>
                  {formatDuration(duration)}
                </div>
              )}
              {!isRecording && audioBlob && (
                <div>Durata: {formatDuration(duration)}</div>
              )}
            </div>
          )}
          
          {audioURL && (
            <div className="mt-6 w-full max-w-md">
              <audio src={audioURL} controls className="w-full" />
            </div>
          )}
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            onClick={resetRecording}
            disabled={(!audioBlob && !isRecording) || isProcessing}
          >
            Cancella
          </Button>
          <Button
            onClick={handleProcessRecording}
            disabled={!audioBlob || isProcessing || isRecording}
          >
            {isProcessing ? 'Elaborazione in corso...' : 'Processa registrazione'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordingSection;
