import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export default function TestButton() {
  const handleClick = () => {
    console.log('Button clicked!');
    alert('Button clicked!');
  };

  return (
    <div className="p-8 flex flex-col gap-4 items-center">
      <h1 className="text-2xl font-bold mb-4">Button Test</h1>
      
      <Button onClick={handleClick}>
        Normal Button
      </Button>
      
      <Button onClick={handleClick} variant="destructive">
        <Trash2 className="w-4 h-4" />
        Delete Button with Icon
      </Button>
      
      <Button onClick={handleClick} variant="destructive">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}