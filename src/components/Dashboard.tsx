import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { DashboardStats } from '../lib/types';
import { api } from '../lib/api';
import { getTodayDate } from '../lib/utils';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    todayPresent: 0,
    todayAbsent: 0,
    todayTotal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await api.dashboard.getStats();
      
      setStats({
        totalStudents: data.totalStudents || 0,
        todayPresent: data.presentToday || 0,
        todayAbsent: data.absentToday || 0,
        todayTotal: (data.presentToday || 0) + (data.absentToday || 0),
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: "Today's Present",
      value: stats.todayPresent,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: "Today's Absent",
      value: stats.todayAbsent,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Attendance Marked',
      value: stats.todayTotal,
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">{stat.title}</CardTitle>
            <div className={`${stat.bgColor} p-2 rounded-lg`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}