"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Upload, 
  Search, 
  FileImage, 
  File as FileIcon,
  Plus,
  X,
  ExternalLink,
  Pencil,
  Trash2
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const DOC_TYPES = [
  { id: "ULTRA", label: "Ultrassom" },
  { id: "EXAME", label: "Exame de Sangue" },
  { id: "RECEITA", label: "Receita Médica" },
  { id: "OUTRO", label: "Outros" },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [noPregnancy, setNoPregnancy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<{ id: string; name: string } | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [type, setType] = useState("ULTRA");
  const [file, setFile] = useState<File | null>(null);

  const fetchDocuments = async () => {
    try {
      const res = await apiFetch("/api/documents");
      if (res.status === 404 || res.status === 401) {
        setNoPregnancy(true);
        return;
      }
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setIsUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", title);
    formData.append("category", type);

    try {
      const res = await apiFetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        await fetchDocuments();
        setShowUploadModal(false);
        setTitle("");
        setFile(null);
      } else {
        const data = await res.json();
        if (res.status === 404) {
          setUploadError("Você precisa cadastrar sua gestação antes de enviar documentos.");
        } else {
          setUploadError(data.error || "Erro ao salvar documento. Tente novamente.");
        }
      }
    } catch (error) {
      console.error(error);
      setUploadError("Erro inesperado. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc || !editName.trim()) return;
    setIsSavingEdit(true);
    try {
      const res = await apiFetch(`/api/documents/${editingDoc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      if (res.ok) {
        await fetchDocuments();
        setEditingDoc(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/api/documents/${deleteConfirmId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchDocuments();
        setDeleteConfirmId(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <FileText className="text-primary w-8 h-8" />
              Central de Documentos
            </h1>
            <p className="text-muted-foreground">Armazene e organize seus exames e laudos.</p>
          </div>
          <Button 
            onClick={() => setShowUploadModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 rounded-2xl h-12 px-8 font-bold flex gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Documento
          </Button>
        </div>

        {/* No pregnancy warning */}
        {noPregnancy && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 flex items-start md:items-center gap-4 flex-col md:flex-row">
            <div className="bg-amber-100 p-3 rounded-xl flex-shrink-0">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-amber-800">Gestação não configurada</p>
              <p className="text-amber-700 text-sm mt-1">Para enviar documentos, primeiro cadastre sua gestação com a data da última menstruação.</p>
            </div>
            <a href="/modules/pregnancy" className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-xl transition-colors flex-shrink-0 text-sm">
              Configurar agora →
            </a>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex gap-4 items-center bg-white p-2 rounded-2xl shadow-sm border">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome..." 
                className="border-none bg-transparent focus-visible:ring-0 pl-12 h-12 text-lg"
              />
           </div>
        </div>

        {/* Documents List */}
        {loading ? (
          <div className="text-center py-20 text-primary font-medium animate-pulse">Carregando seus arquivos...</div>
        ) : documents.length > 0 ? (
          <div className="bg-white rounded-[1.5rem] border shadow-sm overflow-hidden">
            {documents.map((doc, index) => {
              const isImage = doc.type?.startsWith("image/");
              const isPdf = doc.type === "application/pdf";
              return (
                <div
                  key={doc.id}
                  className={`flex items-center gap-4 px-6 py-4 group hover:bg-slate-50 transition-colors ${index !== 0 ? "border-t" : ""}`}
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden bg-slate-100">
                    {isImage ? (
                      <img src={doc.url} alt={doc.name} className="w-full h-full object-cover" />
                    ) : isPdf ? (
                      <div className="bg-red-50 w-full h-full flex items-center justify-center rounded-xl">
                        <FileIcon className="w-6 h-6 text-red-400" />
                      </div>
                    ) : (
                      <FileIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  {/* Name + date */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(doc.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  </div>

                  {/* Category badge */}
                  <Badge variant="outline" className="hidden sm:flex text-[10px] uppercase tracking-widest font-bold border-primary/20 text-primary rounded-full flex-shrink-0">
                    {DOC_TYPES.find(t => t.id === doc.category)?.label || doc.category}
                  </Badge>

                  {/* Type pill */}
                  {isPdf && (
                    <span className="hidden md:inline-flex text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-50 px-2.5 py-1 rounded-full flex-shrink-0">PDF</span>
                  )}
                  {isImage && (
                    <span className="hidden md:inline-flex text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full flex-shrink-0">Imagem</span>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" title="Abrir" className="w-9 h-9 rounded-xl" onClick={() => window.open(doc.url, "_blank")}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Renomear" className="w-9 h-9 rounded-xl" onClick={() => { setEditingDoc({ id: doc.id, name: doc.name }); setEditName(doc.name); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Excluir" className="w-9 h-9 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteConfirmId(doc.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
             <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-slate-300" />
             </div>
             <h3 className="text-xl font-bold text-slate-700">Nenhum documento encontrado</h3>
             <p className="text-muted-foreground mt-2">Comece fazendo o upload do seu primeiro exame.</p>
          </div>
        )}
      </div>

      {/* Upload Modal (Simple absolute positioned div for now) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
           <Card className="w-full max-w-lg border-none shadow-2xl bg-white rounded-[2rem] overflow-hidden">
              <div className="p-6 border-b flex items-center justify-between">
                 <CardTitle className="text-xl font-black">Upload de Documento</CardTitle>
                 <Button variant="ghost" size="icon" onClick={() => setShowUploadModal(false)}>
                    <X className="w-6 h-6" />
                 </Button>
              </div>
              <form onSubmit={handleUpload} className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">Título do Documento</label>
                    <Input 
                      placeholder="Ex: Morfológica 1º Trimestre" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="h-12 rounded-xl"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">Tipo</label>
                    <div className="grid grid-cols-2 gap-2">
                       {DOC_TYPES.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setType(t.id)}
                            className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border-2 ${
                              type === t.id 
                                ? "border-primary bg-primary/5 text-primary" 
                                : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                            }`}
                          >
                             {t.label}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">Arquivo (PDF, JPG, PNG)</label>
                    <label className="relative group block cursor-pointer">
                       <Input 
                         type="file" 
                         onChange={(e) => setFile(e.target.files?.[0] || null)}
                         required
                         className="sr-only"
                       />
                       <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                          {file ? (
                             <div className="flex flex-col items-center justify-center gap-3 text-primary font-bold">
                                <div className="bg-primary/10 p-3 rounded-full">
                                   <FileImage className="w-8 h-8" />
                                </div>
                                <span className="text-sm truncate max-w-xs">{file.name}</span>
                                <Button variant="link" size="sm" className="text-xs h-auto p-0" onClick={(e) => { e.preventDefault(); setFile(null); }}>Trocar arquivo</Button>
                             </div>
                          ) : (
                             <div className="flex flex-col items-center gap-3">
                                <div className="bg-slate-50 p-4 rounded-full group-hover:bg-primary/10 transition-colors">
                                   <Upload className="w-8 h-8 text-slate-300 group-hover:text-primary transition-colors" />
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-slate-700">Clique para selecionar</p>
                                   <p className="text-xs text-slate-400 mt-1">Ou arraste o arquivo aqui</p>
                                </div>
                             </div>
                          )}
                       </div>
                    </label>
                 </div>

                 {uploadError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium">
                       ⚠️ {uploadError}
                    </div>
                 )}

                 <Button 
                   type="submit" 
                   disabled={isUploading || !file}
                   className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-bold shadow-xl shadow-primary/20"
                 >
                    {isUploading ? "Fazendo upload..." : "Salvar Documento"}
                 </Button>
              </form>
           </Card>
        </div>
      )}
    </MainLayout>

      {/* Edit Name Modal */}
      {editingDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <Card className="w-full max-w-md border-none shadow-2xl bg-white rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-black">Renomear Documento</h2>
              <Button variant="ghost" size="icon" onClick={() => setEditingDoc(null)}><X className="w-5 h-5" /></Button>
            </div>
            <form onSubmit={handleRename} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Novo nome</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="h-12 rounded-xl"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" className="flex-1 h-12 rounded-2xl" onClick={() => setEditingDoc(null)}>Cancelar</Button>
                <Button type="submit" disabled={isSavingEdit} className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/90 font-bold">
                  {isSavingEdit ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <Card className="w-full max-w-md border-none shadow-2xl bg-white rounded-[2rem] overflow-hidden">
            <div className="p-8 text-center space-y-4">
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-black">Excluir documento?</h2>
              <p className="text-muted-foreground text-sm">Esta ação não pode ser desfeita. O arquivo será removido permanentemente.</p>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1 h-12 rounded-2xl" onClick={() => setDeleteConfirmId(null)}>Cancelar</Button>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 h-12 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold"
                >
                  {isDeleting ? "Excluindo..." : "Excluir"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
