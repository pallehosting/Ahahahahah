import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { RecordingWithRelations } from '@shared/types';
import RecordingTabs from './RecordingTabs';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { formatDate, formatDuration } from '@/lib/recording';
import { Loader2, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const RecordingsHistory: React.FC = () => {
  const { data: recordings, isLoading, error } = useQuery<RecordingWithRelations[]>({
    queryKey: ['/api/recordings'],
  });

  if (isLoading) {
    return (
      <div>
        <h2 className="text-lg font-medium mb-4">Registrazioni recenti</h2>
        <div className="space-y-4 mb-8">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-lg font-medium mb-4">Registrazioni recenti</h2>
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-red-500">
              Errore nel caricamento delle registrazioni. Riprova più tardi.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">Completato</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">In elaborazione</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Errore</Badge>;
      default:
        return null;
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Registrazioni recenti</h2>

      {recordings && recordings.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nessuna registrazione disponibile. Registra la tua prima lezione!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 mb-8">
          {recordings?.map((recording) => (
            <Card key={recording.id} className="overflow-hidden">
              <CardHeader className="px-4 py-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium truncate">
                    {recording.title}
                  </h3>
                  {getStatusBadge(recording.status)}
                </div>
                <div className="mt-1 text-sm text-muted-foreground flex items-center">
                  <span>{formatDate(recording.createdAt)}</span>
                  <span className="mx-2">•</span>
                  <span>{recording.duration ? formatDuration(recording.duration) : 'N/A'}</span>
                </div>
              </CardHeader>

              {recording.status === 'completed' && recording.transcription && (
                <RecordingTabs 
                  transcription={recording.transcription.text} 
                  summary={recording.summary?.text || 'Riassunto non disponibile'} 
                />
              )}

              {recording.status === 'processing' && (
                <CardContent className="p-6 flex justify-center">
                  <div className="flex flex-col items-center text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p className="text-sm text-muted-foreground">Stiamo elaborando la tua registrazione...</p>
                    <p className="text-xs text-muted-foreground mt-1">Questo potrebbe richiedere alcuni minuti</p>
                  </div>
                </CardContent>
              )}

              {recording.status === 'error' && (
                <CardContent className="p-6 flex justify-center">
                  <div className="flex flex-col items-center text-center text-red-500">
                    <p>Si è verificato un errore durante l'elaborazione della registrazione.</p>
                    <p className="text-sm mt-1">Riprova più tardi o contatta l'assistenza.</p>
                  </div>
                </CardContent>
              )}

              {recording.status === 'completed' && !recording.transcription && (
                <CardContent className="p-6 flex justify-center">
                  <div className="flex flex-col items-center text-center">
                    <p className="text-sm text-muted-foreground">Nessuna trascrizione disponibile.</p>
                  </div>
                </CardContent>
              )}

              {/* Collapsed state for second and third recordings */}
              {recording.id !== recordings?.[0].id && recording.status === 'completed' && (
                <div className="p-5 text-sm text-center text-muted-foreground">
                  <ChevronDown className="inline h-4 w-4" /> Clicca per espandere
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecordingsHistory;
