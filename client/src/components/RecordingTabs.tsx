import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Edit, Share2 } from 'lucide-react';

interface RecordingTabsProps {
  transcription: string;
  summary: string;
}

const RecordingTabs: React.FC<RecordingTabsProps> = ({ transcription, summary }) => {
  const [activeTab, setActiveTab] = useState('transcription');

  const handleDownload = () => {
    const content = activeTab === 'transcription' ? transcription : summary;
    const filename = `${activeTab === 'transcription' ? 'trascrizione' : 'riassunto'}.txt`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="transcription" className="w-1/2">
            Trascrizione
          </TabsTrigger>
          <TabsTrigger value="summary" className="w-1/2">
            Riassunto
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="transcription" className="p-5">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-gray-700 dark:text-gray-300 font-mono text-sm leading-relaxed">
              {transcription}
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="summary" className="p-5">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-gray-700 dark:text-gray-300">
              {summary}
            </p>
          </div>
        </TabsContent>
        
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Scarica
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default RecordingTabs;
