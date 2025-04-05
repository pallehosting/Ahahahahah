import React from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BellIcon, LogOut, User, Settings } from 'lucide-react';
import { getCurrentUser, logoutUser } from '@/lib/auth';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const user = getCurrentUser();

  const getInitials = () => {
    if (!user) return 'U';
    
    if (user.name) {
      const nameParts = user.name.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
      }
      return user.name[0].toUpperCase();
    }
    
    return user.username[0].toUpperCase();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <i className="fas fa-microphone-alt text-primary text-2xl mr-2"></i>
                <span className="font-semibold text-xl">VoiceNotes</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/dashboard">
                  <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location === '/dashboard' 
                      ? 'border-primary text-gray-900 dark:text-white' 
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}>
                    Dashboard
                  </a>
                </Link>
                <Link href="/recordings">
                  <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location === '/recordings' 
                      ? 'border-primary text-gray-900 dark:text-white' 
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}>
                    Le mie registrazioni
                  </a>
                </Link>
                <Link href="/courses">
                  <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location === '/courses' 
                      ? 'border-primary text-gray-900 dark:text-white' 
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}>
                    Corsi
                  </a>
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2 rounded-full"
              >
                <BellIcon className="h-5 w-5" />
                <span className="sr-only">Notifiche</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block">{user?.name || user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    <span>Profilo</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Impostazioni</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logoutUser}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Esci</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} VoiceNotes. Tutti i diritti riservati.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
