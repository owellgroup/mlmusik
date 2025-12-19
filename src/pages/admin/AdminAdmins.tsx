import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Shield } from 'lucide-react';
import { api, Admin } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AdminAdmins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({ email: '', password: '' });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const data = await api.getAdmins();
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.email || !formData.password) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    try {
      const newAdmin = await api.createAdmin(formData.email, formData.password);
      setAdmins([...admins, newAdmin]);
      setIsCreateOpen(false);
      setFormData({ email: '', password: '' });
      toast({ title: "Admin created successfully" });
    } catch (error) {
      toast({ title: "Error creating admin", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (admins.length <= 1) {
      toast({ title: "Cannot delete the last admin", variant: "destructive" });
      return;
    }
    try {
      await api.deleteAdmin(id);
      setAdmins(admins.filter(a => a.id !== id));
      toast({ title: "Admin deleted successfully" });
    } catch (error) {
      toast({ title: "Error deleting admin", variant: "destructive" });
    }
  };

  const handleEdit = (admin: Admin) => {
    setSelectedAdmin(admin);
    setFormData({ email: admin.email, password: '' });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedAdmin) return;
    try {
      await api.updateAdmin(selectedAdmin.id, formData.email, formData.password);
      setAdmins(admins.map(a => a.id === selectedAdmin.id ? { ...a, email: formData.email } : a));
      setIsEditOpen(false);
      toast({ title: "Admin updated successfully" });
    } catch (error) {
      toast({ title: "Error updating admin", variant: "destructive" });
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Admins</h1>
          <p className="text-muted-foreground">{admins.length} administrators</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="gold" className="gap-2">
              <Plus className="w-5 h-5" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Admin</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-card"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-card"
                />
              </div>
              <Button variant="gold" className="w-full" onClick={handleCreate}>
                Create Admin
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search admins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card"
        />
      </div>

      {/* Admins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdmins.map((admin, index) => (
          <Card 
            key={admin.id}
            className={cn(
              "glass border-border/50 overflow-hidden",
              "opacity-0 animate-fade-in"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                    <Shield className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold truncate">{admin.email}</h3>
                    <p className="text-sm text-muted-foreground">
                      Added {new Date(admin.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(admin)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Admin</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove {admin.email}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(admin.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAdmins.length === 0 && (
        <div className="text-center py-16">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl font-medium">No admins found</p>
          <p className="text-muted-foreground">Add your first admin to get started</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-card"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password (leave empty to keep current)</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-card"
              />
            </div>
            <Button variant="gold" className="w-full" onClick={handleUpdate}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
