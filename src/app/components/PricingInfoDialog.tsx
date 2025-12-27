import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

interface PricingInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  quantity: number;
  originalPrice: number;
  salesPrice: number;
  onSave: (originalPrice: number, salesPrice: number) => void;
}

export function PricingInfoDialog({
  open,
  onOpenChange,
  itemName,
  quantity,
  originalPrice,
  salesPrice,
  onSave,
}: PricingInfoDialogProps) {
  const [originalPriceInput, setOriginalPriceInput] = useState(
    originalPrice.toString()
  );
  const [salesPriceInput, setSalesPriceInput] = useState(salesPrice.toString());

  // Update local state when props change
  useEffect(() => {
    setOriginalPriceInput(originalPrice.toString());
    setSalesPriceInput(salesPrice.toString());
  }, [originalPrice, salesPrice, open]);

  const originalPriceValue = parseFloat(originalPriceInput) || 0;
  const salesPriceValue = parseFloat(salesPriceInput) || 0;
  const totalOriginalPrice = originalPriceValue * quantity;
  const totalSalesPrice = salesPriceValue * quantity;

  const handleSave = () => {
    onSave(originalPriceValue, salesPriceValue);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pricing Information - {itemName}</DialogTitle>
          <DialogDescription>
            Update the pricing details for {itemName}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Original Price Per Piece */}
          <div className="space-y-2">
            <Label htmlFor="original-price">Original Price per Piece</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                id="original-price"
                type="number"
                step="0.01"
                min="0"
                value={originalPriceInput}
                onChange={(e) => setOriginalPriceInput(e.target.value)}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Sales Price Per Piece */}
          <div className="space-y-2">
            <Label htmlFor="sales-price">Sales Price per Piece</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                id="sales-price"
                type="number"
                step="0.01"
                min="0"
                value={salesPriceInput}
                onChange={(e) => setSalesPriceInput(e.target.value)}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200" />

          {/* Calculated Totals */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Current Quantity:</span>
              <span className="font-semibold text-gray-900">{quantity}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Original Price:</span>
              <span className="font-semibold text-gray-900">
                ${totalOriginalPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Sales Price:</span>
              <span className="font-semibold text-blue-600">
                ${totalSalesPrice.toFixed(2)}
              </span>
            </div>
            {totalOriginalPrice > 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Profit Margin:</span>
                <span
                  className={`font-semibold ${
                    totalSalesPrice >= totalOriginalPrice
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ${(totalSalesPrice - totalOriginalPrice).toFixed(2)} (
                  {totalOriginalPrice > 0
                    ? (
                        ((totalSalesPrice - totalOriginalPrice) /
                          totalOriginalPrice) *
                        100
                      ).toFixed(1)
                    : "0"}
                  %)
                </span>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Prices
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}