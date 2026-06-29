'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface NewFileModalProps {
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function NewFileModal({ onClose, onCreate }: NewFileModalProps) {
  const [name, setName] = useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">New file</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="File name"
            placeholder="page.html"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
            required
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
