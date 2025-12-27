import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface QuantityInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  currentQuantity: number;
  mode: "add" | "subtract"; // New prop
  onUpdate: (newQuantity: number) => void;
}

export function QuantityInputDialog({
  open,
  onOpenChange,
  itemName,
  currentQuantity,
  mode, // New prop
  onUpdate,
}: QuantityInputDialogProps) {
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    if (open) {
      setQuantity(""); // Start with empty input for relative changes
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(quantity) || 0;
    if (amount > 0) {
      if (mode === "add") {
        onUpdate(currentQuantity + amount);
      } else {
        onUpdate(Math.max(0, currentQuantity - amount));
      }
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Quantity" : "Subtract Quantity"}
          </DialogTitle>
          <DialogDescription>
            Enter the amount to {mode === "add" ? "add to" : "subtract from"}{" "}
            {itemName} (current: {currentQuantity}).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Label className="text-gray-700 mb-2 block">{itemName}</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
              placeholder="Enter amount"
              className="h-12 text-center"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
              {mode === "add" ? "Add" : "Subtract"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}