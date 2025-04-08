import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, Loader2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/integrations/supabase/client'

interface DocumentUploadProps {
  onUploadComplete?: (documentId: string) => void
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0)

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      try {
        // First upload file to Supabase storage
        const fileName = `${Date.now()}-${file.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file, {
            onUploadProgress: (progress) => {
              setUploadProgress((progress.loaded / progress.total) * 100)
            },
          })

        if (uploadError) throw uploadError

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName)

        // Process document through our Edge Function
        const response = await fetch('/api/document-processor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            document: {
              content: await file.text(),
              metadata: {
                title: file.name,
                file_url: publicUrl,
                file_type: file.type,
                source: 'upload'
              }
            }
          })
        })

        if (!response.ok) {
          throw new Error('Failed to process document')
        }

        const { documentId } = await response.json()
        return documentId
      } catch (error) {
        console.error('Upload error:', error)
        throw error
      }
    },
    onSuccess: (documentId) => {
      toast.success('Document uploaded successfully')
      onUploadComplete?.(documentId)
      setUploadProgress(0)
    },
    onError: (error) => {
      toast.error('Failed to upload document')
      setUploadProgress(0)
    }
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadMutation.mutate(acceptedFiles[0])
    }
  }, [uploadMutation])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}
          ${uploadMutation.isLoading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {uploadMutation.isLoading ? (
            <>
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Processing document...</p>
              <Progress value={uploadProgress} className="w-full max-w-xs" />
            </>
          ) : (
            <>
              {isDragActive ? (
                <>
                  <File className="h-10 w-10 text-primary" />
                  <p className="text-sm text-muted-foreground">Drop the file here</p>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop a file here, or click to select
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports PDF, DOC, DOCX, and TXT files
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {uploadMutation.isError && (
        <p className="mt-2 text-sm text-destructive">
          Failed to upload document. Please try again.
        </p>
      )}
    </div>
  )
} 