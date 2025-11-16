import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { StudentList } from './components/StudentList';
import { AttendanceManager } from './components/AttendanceManager';
import { Reports } from './components/Reports';
import { ClassManagement } from './components/ClassManagement';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { Users, ClipboardCheck, FileText, LogOut, Menu, X, GraduationCap } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from './utils/supabase/info';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'attendance' | 'reports' | 'classes'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminInitialized, setAdminInitialized] = useState(false);

  useEffect(() => {
    initializeAdminUser();
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const initializeAdminUser = async () => {
    if (adminInitialized) return;
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3578af81/init-admin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Admin initialization:', result.message);
        setAdminInitialized(true);
      } else {
        console.error('Admin initialization failed:', result.error);
      }
    } catch (error) {
      console.error('Error initializing admin user:', error);
    }
  };

  const checkUser = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout');
    }
  };

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Menu },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'classes', label: 'Classes', icon: GraduationCap },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginForm onLoginSuccess={checkUser} />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <ClipboardCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl">Student Attendance Tracker</h1>
                <p className="text-xs text-gray-500">Admin Portal</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center px-4 py-2 rounded-lg transition ${
                    activeTab === item.id
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleLogout} className="hidden md:flex">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t py-2">
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-2 rounded-lg transition ${
                      activeTab === item.id
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'students' && <StudentList />}
        {activeTab === 'attendance' && <AttendanceManager />}
        {activeTab === 'reports' && <Reports />}
        {activeTab === 'classes' && <ClassManagement />}
      </main>

      <Toaster position="top-right" />
    </div>
  );
}