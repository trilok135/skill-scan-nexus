import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  File, 
  FileText, 
  FileImage, 
  X,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
}

interface FileUploadZoneProps {
  onFilesChange?: (files: UploadedFile[]) => void;
}

const acceptedTypes = {
  'application/pdf': { icon: FileText, label: 'PDF', color: 'text-danger' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: File, label: 'DOCX', color: 'text-primary' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: FileImage, label: 'PPT', color: 'text-warning' },
  'text/plain': { icon: FileText, label: 'TXT', color: 'text-muted-foreground' },
};

export function FileUploadZone({ onFilesChange }: FileUploadZoneProps = {}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const processFiles = useCallback((files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidType = Object.keys(acceptedTypes).includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Please upload PDF, DOCX, PPT, or TXT files.`,
          variant: "destructive",
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large", 
          description: `${file.name} is larger than 10MB. Please upload a smaller file.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    validFiles.forEach(file => {
      const fileId = Math.random().toString(36).substr(2, 9);
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
      };

      setUploadedFiles(prev => {
        const updated = [...prev, newFile];
        onFilesChange?.(updated);
        return updated;
      });

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadedFiles(prev => {
          const updated = prev.map(f => {
            if (f.id === fileId) {
              const newProgress = (f.progress || 0) + Math.random() * 20;
              if (newProgress >= 100) {
                clearInterval(interval);
                return { ...f, status: 'success' as const, progress: 100 };
              }
              return { ...f, progress: newProgress };
            }
            return f;
          });
          onFilesChange?.(updated);
          return updated;
        });
      }, 200);

      // Complete upload after 2-3 seconds
      setTimeout(() => {
        clearInterval(interval);
        setUploadedFiles(prev => {
          const updated = prev.map(f => 
            f.id === fileId ? { ...f, status: 'success' as const, progress: 100 } : f
          );
          onFilesChange?.(updated);
          return updated;
        });
        
        toast({
          title: "File uploaded successfully",
          description: `${file.name} has been processed and is ready for analysis.`,
        });
      }, 2000 + Math.random() * 1000);
    });
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    processFiles(files);
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(files);
    }
  }, [processFiles]);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      onFilesChange?.(updated);
      return updated;
    });
  }, [onFilesChange]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <Card 
        className={cn(
          "border-2 border-dashed transition-all duration-200",
          isDragOver 
            ? "border-primary bg-primary/5 shadow-primary" 
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className={cn(
            "rounded-full p-4 mb-4 transition-colors",
            isDragOver ? "bg-primary/10" : "bg-muted/50"
          )}>
            <Upload className={cn(
              "h-8 w-8",
              isDragOver ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          
          <h3 className="text-lg font-semibold mb-2">
            {isDragOver ? "Drop files here" : "Upload Resume or Documents"}
          </h3>
          
          <p className="text-muted-foreground mb-4 max-w-sm">
            Drag and drop your files here, or click to browse. 
            Supports PDF, DOCX, PPT, and TXT files up to 10MB each.
          </p>
          
          <div className="flex items-center gap-4 mb-4">
            {Object.entries(acceptedTypes).map(([type, config]) => (
              <div key={type} className="flex items-center gap-1 text-xs text-muted-foreground">
                <config.icon className={cn("h-3 w-3", config.color)} />
                {config.label}
              </div>
            ))}
          </div>
          
          <Button asChild>
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.ppt,.pptx,.txt"
                onChange={handleFileSelect}
                className="sr-only"
              />
              Choose Files
            </label>
          </Button>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">Uploaded Files</h4>
            <div className="space-y-3">
              {uploadedFiles.map(file => {
                const fileConfig = acceptedTypes[file.type as keyof typeof acceptedTypes];
                const FileIcon = fileConfig?.icon || File;
                
                return (
                  <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className={cn("p-1 rounded", fileConfig?.color)}>
                      <FileIcon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                      
                      {file.status === 'uploading' && (
                        <div className="mt-1">
                          <div className="h-1 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${file.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {file.status === 'success' && (
                        <CheckCircle className="h-4 w-4 text-success" />
                      )}
                      {file.status === 'error' && (
                        <AlertTriangle className="h-4 w-4 text-danger" />
                      )}
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}