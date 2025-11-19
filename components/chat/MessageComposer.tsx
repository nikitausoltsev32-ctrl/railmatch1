'use client';

import { useState, useRef, useCallback } from 'react';
import { copy } from '@/lib/i18n/ru';

interface MessageComposerProps {
  onSendMessage: (content: string, files: File[]) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageComposer({ 
  onSendMessage, 
  disabled = false, 
  placeholder 
}: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const chatCopy = (copy as any).chat;

  const handleSend = useCallback(async () => {
    if (!message.trim() && files.length === 0) return;
    if (disabled || uploading) return;

    const content = message.trim();
    setMessage('');
    setFiles([]);
    setUploading(true);

    try {
      await onSendMessage(content, files);
    } finally {
      setUploading(false);
      // Focus back to textarea
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [message, files, disabled, uploading, onSendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles).filter(file => {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name}: ${chatCopy.messages.fileTooBig}`);
        return false;
      }

      // Check file type (basic validation)
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'text/plain',
        'text/csv',
      ];

      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name}: ${chatCopy.messages.unsupportedType}`);
        return false;
      }

      return true;
    });

    setFiles(prev => [...prev, ...newFiles]);
  }, [chatCopy.messages.fileTooBig, chatCopy.messages.unsupportedType]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="border-t border-neutral-200 p-4 bg-white">
      {/* File Attachments */}
      {files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center bg-neutral-100 rounded-lg px-3 py-2 text-sm"
            >
              <span className="mr-2">📎</span>
              <div className="min-w-0">
                <p className="font-medium truncate max-w-xs">{file.name}</p>
                <p className="text-xs text-neutral-600">{formatFileSize(file.size)}</p>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="ml-2 text-neutral-500 hover:text-red-600 transition-colors"
                title={chatCopy.composer.removeFile}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Message Input */}
      <div
        className={`
          relative border rounded-lg transition-colors
          ${dragOver ? 'border-primary-400 bg-primary-50' : 'border-neutral-300'}
          ${disabled ? 'bg-neutral-50 opacity-50' : 'bg-white'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || chatCopy.composer.placeholder}
          disabled={disabled || uploading}
          className="w-full px-4 py-3 pr-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent rounded-lg disabled:cursor-not-allowed"
          rows={1}
          style={{ minHeight: '44px', maxHeight: '120px' }}
        />

        {/* Action Buttons */}
        <div className="absolute right-2 bottom-2 flex items-center space-x-2">
          {/* Attach File Button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.7z,.txt,.csv"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={chatCopy.composer.attachFile}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || uploading || (!message.trim() && files.length === 0)}
            className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {uploading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {chatCopy.messages.sending}
              </div>
            ) : (
              chatCopy.messages.send
            )}
          </button>
        </div>
      </div>

      {/* Drag & Drop Overlay */}
      {dragOver && (
        <div className="absolute inset-0 bg-primary-50 border-2 border-dashed border-primary-400 rounded-lg flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-primary-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <p className="text-sm font-medium text-primary-700">
              {chatCopy.composer.dragDrop}
            </p>
            <p className="text-xs text-primary-600 mt-1">
              {chatCopy.composer.maxFileSize}
            </p>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-2 text-xs text-neutral-500">
        {chatCopy.composer.supportedFormats} • {chatCopy.composer.maxFileSize}
      </div>
    </div>
  );
}