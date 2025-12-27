import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>How to Use InvTrac</DialogTitle>
          <DialogDescription>
            A quick guide to help you manage your inventory efficiently.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 text-sm text-gray-700">
          <div>
            <h3 className="font-semibold mb-2">Managing Categories</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Tap "+ Category" to create a new category</li>
              <li>Tap "All" to view items from all categories</li>
              <li>Tap any category pill to filter items</li>
              <li>Active category is highlighted in yellow</li>
              <li>Press and hold a category to delete it</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Adding Items</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Tap the blue "+ Item" button</li>
              <li>Enter item name and initial quantity</li>
              <li>Items are added to the selected category</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Adjusting Quantities</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Tap "+" to increase quantity by 1</li>
              <li>Tap "-" to decrease quantity by 1</li>
              <li>Press and hold "+" to add a custom amount</li>
              <li>Press and hold "-" to subtract a custom amount</li>
              <li>Quantity cannot go below 0</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Pricing Information</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Tap the blue info icon next to any item</li>
              <li>Enter original price and sales price per piece</li>
              <li>View total prices based on current inventory</li>
              <li>See profit margins calculated automatically</li>
              <li>Totals update as quantities change</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Deleting Items</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Press and hold an item name to delete it</li>
              <li>Confirm deletion in the popup dialog</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Searching Items</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Use the search bar to find items quickly</li>
              <li>Search works across all visible items</li>
              <li>Search is case-insensitive</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Tips</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Keep category names short and clear</li>
              <li>Use descriptive item names for easy searching</li>
              <li>Regularly update quantities for accuracy</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}