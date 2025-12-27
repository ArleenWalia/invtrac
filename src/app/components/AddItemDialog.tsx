import { useState } from "react";
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

interface Category {
  id: string;
  name: string;
}

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  selectedCategory: string;
  onAdd: (name: string, initialQuantity: number, categoryId: string) => void;
}

export function AddItemDialog({
  open,
  onOpenChange,
  categories,
  selectedCategory,
  onAdd,
}: AddItemDialogProps) {
  const [itemName, setItemName] = useState("");
  const [initialQuantity, setInitialQuantity] = useState("0");
  const [categoryId, setCategoryId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemName.trim() && categories && categories.length > 0) {
      const finalCategoryId =
        categoryId ||
        (selectedCategory === "all" ? categories[0]?.id || "" : selectedCategory);
      onAdd(itemName.trim(), parseInt(initialQuantity) || 0, finalCategoryId);
      setItemName("");
      setInitialQuantity("0");
      setCategoryId("");
      onOpenChange(false);
    }
  };

  // Set default category when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open && categories && categories.length > 0) {
      setCategoryId(
        selectedCategory === "all" ? categories[0]?.id || "" : selectedCategory
      );
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Item</DialogTitle>
          <DialogDescription>
            Add a new item to your inventory with a starting quantity.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="item-name" className="text-gray-700">
                Item Name
              </Label>
              <Input
                id="item-name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g., Apples"
                className="mt-2 h-12"
                autoFocus
              />
            </div>
            {categories && categories.length > 0 && (
              <div>
                <Label htmlFor="category" className="text-gray-700">
                  Category
                </Label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="mt-2 h-12 w-full rounded-lg border border-gray-200 px-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <Label htmlFor="initial-quantity" className="text-gray-700">
                Initial Quantity
              </Label>
              <Input
                id="initial-quantity"
                type="number"
                value={initialQuantity}
                onChange={(e) => setInitialQuantity(e.target.value)}
                min="0"
                className="mt-2 h-12"
              />
            </div>
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
              Add Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}