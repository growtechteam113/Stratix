import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { REGIONS } from "@shared/stratix-types";
import { motion } from "framer-motion";
import {
  Plus,
  FolderOpen,
  ArrowRight,
  Sparkles,
  LogOut,
  BarChart3,
  Clock,
  Globe,
  Loader2,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", url: "", region: "Global", description: "" });
  const [creating, setCreating] = useState(false);

  const projectsQuery = trpc.projects.list.useQuery(undefined, { enabled: !!user });
  const createMutation = trpc.projects.create.useMutation({
    onSuccess: (data) => {
      setShowCreate(false);
      setNewProject({ name: "", url: "", region: "Global", description: "" });
      projectsQuery.refetch();
      if (data?.id) setLocation(`/project/${data.id}`);
    },
    onSettled: () => setCreating(false),
  });
  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => projectsQuery.refetch(),
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center stratix-mesh-bg">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle style={{ fontFamily: "var(--font-display)" }}>Sign in to STRATIX AI</CardTitle>
            <CardDescription>Access your competitive intelligence dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => { window.location.href = getLoginUrl("/dashboard"); }}>
              Sign in to continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const projects = projectsQuery.data ?? [];
  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    analyzing: "bg-primary/10 text-primary",
    ready: "bg-emerald-50 text-emerald-700",
    error: "bg-red-50 text-red-700",
  };
  const stepLabels: Record<string, string> = {
    define: "Define",
    discover: "Discover",
    brief: "Brief",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              STRATIX
            </span>
            <span className="text-xs font-medium text-primary px-1.5 py-0.5 rounded-full bg-primary/10">AI</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{user.name || user.email}</span>
            <Button variant="ghost" size="icon-sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
          {/* Header */}
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                Projects
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Your competitive intelligence analyses
              </p>
            </div>
            <Button onClick={() => setShowCreate(true)} className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </motion.div>

          {/* Projects grid */}
          {projectsQuery.isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : projects.length === 0 ? (
            <motion.div variants={fadeUp}>
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mb-5">
                    <FolderOpen className="w-8 h-8 text-primary/60" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-display)" }}>
                    No projects yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
                    Create your first project to start discovering competitors and mapping your strategic position.
                  </p>
                  <Button onClick={() => setShowCreate(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project: any, i: number) => (
                <motion.div key={project.id} variants={fadeUp}>
                  <Card
                    className="group cursor-pointer hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5"
                    onClick={() => setLocation(`/project/${project.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate" style={{ fontFamily: "var(--font-display)" }}>
                            {project.name}
                          </CardTitle>
                          <CardDescription className="truncate mt-1 text-xs">
                            {project.url}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Delete this project?")) {
                              deleteMutation.mutate({ id: project.id });
                            }
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-3 text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${statusColors[project.status] || statusColors.draft}`}>
                          {project.status}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          Step: {stepLabels[project.step] || "Define"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {project.region || "Global"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Create Project Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-display)" }}>Create New Project</DialogTitle>
            <DialogDescription>
              Enter your company details to start competitive analysis.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newProject.name || !newProject.url) return;
              setCreating(true);
              const raw = newProject.url.trim();
              const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
              createMutation.mutate({
                name: newProject.name,
                url,
                region: newProject.region,
                description: newProject.description || undefined,
              });
            }}
            className="space-y-4 mt-2"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                placeholder="e.g., Acme Corp"
                value={newProject.name}
                onChange={(e) => setNewProject(p => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Company Website</Label>
              <Input
                id="url"
                type="text"
                placeholder="acme.com or www.acme.com"
                value={newProject.url}
                onChange={(e) => setNewProject(p => ({ ...p, url: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Market Region</Label>
              <Select value={newProject.region} onValueChange={(v) => setNewProject(p => ({ ...p, region: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description (optional)</Label>
              <Input
                id="desc"
                placeholder="Brief description of what the company does"
                value={newProject.description}
                onChange={(e) => setNewProject(p => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating || !newProject.name || !newProject.url}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Project
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
