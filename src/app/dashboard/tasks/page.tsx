"use client";

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, Edit3, Calendar, Flag, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/auth-provider";
import { Database } from "@/lib/supabase/database.types";

type Task = Database['public']['Tables']['tasks']['Row'];

type TaskFormData = {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  due_date: string;
};

function TaskItem({ 
  task, 
  onToggle, 
  onEdit, 
  onDelete, 
  isLoading 
}: { 
  task: Task; 
  onToggle: (task: Task) => void; 
  onEdit: (task: Task) => void; 
  onDelete: (task: Task) => void;
  isLoading: boolean;
}) {
  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <Card className={`p-4 transition-all hover:shadow-sm ${
      task.status === 'completed' ? 'opacity-75' : ''
    } ${
      isOverdue ? 'border-destructive' : ''
    }`}>
      <div className="flex items-start space-x-3">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.status === 'completed'}
          onCheckedChange={() => onToggle(task)}
          disabled={isLoading}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium text-sm ${
              task.status === 'completed' ? 'line-through text-muted-foreground' : ''
            }`}>
              {task.title}
            </h4>
            <div className="flex items-center space-x-2">
              {task.priority && (
                <Badge variant={getPriorityColor(task.priority)} className="h-5 text-xs">
                  <Flag className="w-3 h-3 mr-1" />
                  {task.priority}
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={() => onEdit(task)} disabled={isLoading}>
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(task)} disabled={isLoading}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
          )}
          {task.due_date && (
            <div className={`flex items-center mt-2 text-xs ${
              isOverdue ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(task.due_date).toLocaleDateString('id-ID')}
              {isOverdue && ' (Terlambat)'}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function TasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, pending: 0, in_progress: 0 });
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    due_date: ''
  });

  const loadTasks = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to load tasks');
      }
      const tasksData = await response.json();
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal Memuat Tugas',
        description: 'Tidak dapat memuat daftar tugas.',
      });
    }
  }, [user?.id, toast]);

  const loadTaskStats = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch('/api/tasks?type=stats');
      if (response.ok) {
        const stats = await response.json();
        setTaskStats(stats);
      }
    } catch (error) {
      console.error('Error loading task stats:', error);
    }
  }, [user?.id]);

  // Load tasks and stats on component mount
  React.useEffect(() => {
    if (user?.id) {
      loadTasks();
      loadTaskStats();
    }
  }, [user?.id, loadTasks, loadTaskStats]);

  const handleCreateTask = async () => {
    if (!user?.id || !formData.title.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          priority: formData.priority,
          due_date: formData.due_date || null,
          status: 'pending'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      toast({
        title: 'Tugas Dibuat',
        description: 'Tugas baru berhasil ditambahkan.',
      });

      setFormData({ title: '', description: '', priority: 'medium', due_date: '' });
      setIsDialogOpen(false);
      await loadTasks();
      await loadTaskStats();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat Tugas',
        description: 'Tidak dapat membuat tugas baru.',
      });
      console.error(error);
    }
    setIsLoading(false);
  };

  const handleUpdateTask = async () => {
    if (!user?.id || !editingTask || !formData.title.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: editingTask.id,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          priority: formData.priority,
          due_date: formData.due_date || null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      toast({
        title: 'Tugas Diperbarui',
        description: 'Tugas berhasil diperbarui.',
      });

      setEditingTask(null);
      setFormData({ title: '', description: '', priority: 'medium', due_date: '' });
      setIsDialogOpen(false);
      await loadTasks();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal Memperbarui Tugas',
        description: 'Tidak dapat memperbarui tugas.',
      });
      console.error(error);
    }
    setIsLoading(false);
  };

  const handleToggleTask = async (task: Task) => {
    if (!user?.id) return;

    try {
      const action = task.status === 'completed' ? 'incomplete' : 'complete';
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: task.id,
          action: action
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle task status');
      }

      await loadTasks();
      await loadTaskStats();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal Mengubah Status',
        description: 'Tidak dapat mengubah status tugas.',
      });
      console.error(error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: (task.priority as 'low' | 'medium' | 'high') || 'medium',
      due_date: task.due_date ? task.due_date.split('T')[0] : ''
    });
    setIsDialogOpen(true);
  };

  const handleDeleteTask = async (task: Task) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/tasks?id=${task.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      toast({
        title: 'Tugas Dihapus',
        description: 'Tugas berhasil dihapus.',
      });
      await loadTasks();
      await loadTaskStats();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menghapus Tugas',
        description: 'Tidak dapat menghapus tugas.',
      });
      console.error(error);
    }
  };

  const openCreateDialog = () => {
    setEditingTask(null);
    setFormData({ title: '', description: '', priority: 'medium', due_date: '' });
    setIsDialogOpen(true);
  };

  const progress = taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">Manajemen Tugas</h1>
        <p className="text-muted-foreground">
          Kelola dan lacak semua tugas penting untuk bisnis Anda.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{taskStats.total}</div>
            <p className="text-sm text-muted-foreground">Total Tugas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
            <p className="text-sm text-muted-foreground">Selesai</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{taskStats.in_progress}</div>
            <p className="text-sm text-muted-foreground">Sedang Dikerjakan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{taskStats.pending}</div>
            <p className="text-sm text-muted-foreground">Menunggu</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Task List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Tugas</CardTitle>
            <CardDescription>
              {taskStats.completed} dari {taskStats.total} tugas selesai ({progress.toFixed(0)}%)
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tugas Baru
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTask ? 'Edit Tugas' : 'Tambah Tugas Baru'}
                </DialogTitle>
                <DialogDescription>
                  {editingTask ? 'Perbarui informasi tugas.' : 'Buat tugas baru untuk bisnis Anda.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Judul</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Masukkan judul tugas..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Deskripsi (opsional)</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Deskripsi tugas..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Prioritas</label>
                    <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Rendah</SelectItem>
                        <SelectItem value="medium">Sedang</SelectItem>
                        <SelectItem value="high">Tinggi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tanggal Jatuh Tempo (opsional)</label>
                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button 
                  onClick={editingTask ? handleUpdateTask : handleCreateTask} 
                  disabled={isLoading || !formData.title.trim()}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingTask ? 'Perbarui' : 'Buat Tugas'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Belum ada tugas. Buat tugas pertama Anda!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  isLoading={isLoading}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
