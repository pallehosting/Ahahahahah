import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Course } from '@shared/schema';
import { PlusIcon } from 'lucide-react';

interface CourseSelectorProps {
  selectedCourseId: number | null;
  onSelectCourse: (courseId: number | null) => void;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({ selectedCourseId, onSelectCourse }) => {
  const [isNewCourseDialogOpen, setIsNewCourseDialogOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch courses
  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest('POST', '/api/courses', { name });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate courses query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      setNewCourseName('');
      setIsNewCourseDialogOpen(false);
      toast({
        title: 'Corso creato',
        description: 'Il nuovo corso è stato creato con successo',
      });
    },
    onError: (error) => {
      toast({
        title: 'Errore',
        description: `Impossibile creare il corso: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        variant: 'destructive',
      });
    },
  });

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCourseName.trim()) {
      createCourseMutation.mutate(newCourseName);
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8 animate-pulse">
        <h2 className="text-lg font-medium mb-4">Seleziona corso</h2>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Seleziona corso</h2>
        <div className="text-red-500">
          Errore nel caricamento dei corsi. Riprova più tardi.
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium mb-4">Seleziona corso</h2>
      <div className="flex flex-wrap gap-2">
        {courses?.map((course) => (
          <Button
            key={course.id}
            variant={selectedCourseId === course.id ? 'default' : 'outline'}
            onClick={() => onSelectCourse(course.id)}
          >
            {course.name}
          </Button>
        ))}

        <Button 
          variant="outline" 
          className="border-dashed" 
          onClick={() => setIsNewCourseDialogOpen(true)}
        >
          <PlusIcon className="h-4 w-4 mr-1" /> Nuovo corso
        </Button>
      </div>

      {/* New Course Dialog */}
      <Dialog open={isNewCourseDialogOpen} onOpenChange={setIsNewCourseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi nuovo corso</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCourse}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="course-name">Nome del corso</Label>
                <Input
                  id="course-name"
                  placeholder="Es. Fisica Quantistica"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsNewCourseDialogOpen(false)}
              >
                Annulla
              </Button>
              <Button 
                type="submit"
                disabled={!newCourseName.trim() || createCourseMutation.isPending}
              >
                {createCourseMutation.isPending ? 'Creazione...' : 'Crea corso'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseSelector;
