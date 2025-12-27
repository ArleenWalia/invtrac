import { useState, useRef, useEffect } from "react";
import { Package, Search, Plus, Minus, CircleHelp, LogOut, Info } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { AddCategoryDialog } from "./AddCategoryDialog";
import { AddItemDialog } from "./AddItemDialog";
import { QuantityInputDialog } from "./QuantityInputDialog";
import { HelpDialog } from "./HelpDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { PricingInfoDialog } from "./PricingInfoDialog";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import logoImage from "./assets/8d4f1cc1e3fae072d4cd287922a40a0032818d13.png";

interface Category {
  id: string;
  name: string;
}

interface Item {
  id: string;
  name: string;
  quantity: number;
  categoryId: string;
  originalPrice: number;
  salesPrice: number;
}

interface InventoryScreenProps {
  accessToken: string;
  onLogout: () => void;
  getAccessToken: () => Promise<string | null>;
}

export function InventoryScreen({ accessToken, onLogout, getAccessToken }: InventoryScreenProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quantityDialog, setQuantityDialog] = useState<{
    open: boolean;
    itemId: string;
    itemName: string;
    currentQuantity: number;
    mode: "add" | "subtract";
  }>({ open: false, itemId: "", itemName: "", currentQuantity: 0, mode: "add" });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "category" | "item";
    id: string;
    name: string;
  }>({ open: false, type: "category", id: "", name: "" });
  const [pricingDialog, setPricingDialog] = useState<{
    open: boolean;
    itemId: string;
    itemName: string;
    quantity: number;
    originalPrice: number;
    salesPrice: number;
  }>({ open: false, itemId: "", itemName: "", quantity: 0, originalPrice: 0, salesPrice: 0 });

  const longPressTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Auto-save whenever categories or items change
  useEffect(() => {
    if (!loading) {
      // Debounce saves to avoid too many requests
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveUserData();
      }, 1000);
    }
  }, [categories, items]);

  // Update pricing dialog when item quantity changes
  useEffect(() => {
    if (pricingDialog.open && pricingDialog.itemId) {
      const currentItem = items.find(item => item.id === pricingDialog.itemId);
      if (currentItem && currentItem.quantity !== pricingDialog.quantity) {
        setPricingDialog(prev => ({ ...prev, quantity: currentItem.quantity }));
      }
    }
  }, [items, pricingDialog.open, pricingDialog.itemId, pricingDialog.quantity]);

  const loadUserData = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        console.error("No valid access token available");
        // If we can't get a token, the user should be logged out automatically
        onLogout();
        return;
      }

      console.log("Loading user data with token:", token.substring(0, 30) + "...");

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b468c741/user-data`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Load user data response status:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid or expired - log the user out
          console.error("Authentication token is invalid or expired, logging out");
          onLogout();
          return;
        }
        const errorData = await response.json();
        console.error("Failed to load user data:", errorData);
        throw new Error(errorData.error || "Failed to load user data");
      }

      const data = await response.json();
      console.log("Loaded user data successfully");
      setCategories(data.categories || []);
      setItems(data.items || []);
    } catch (error) {
      console.error("Error loading user data:", error);
      // Initialize with empty data if loading fails (new user with no data yet)
      setCategories([]);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const saveUserData = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        console.error("No valid access token available for saving");
        // If we can't get a token, the user should be logged out automatically
        onLogout();
        return;
      }

      console.log("Saving user data with token:", token.substring(0, 30) + "...");

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b468c741/user-data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ categories, items }),
        }
      );

      console.log("Save user data response status:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid or expired - log the user out
          console.error("Authentication token is invalid or expired during save, logging out");
          onLogout();
          return;
        }
        const errorData = await response.json();
        console.error("Failed to save user data:", errorData);
        throw new Error("Failed to save user data");
      }

      console.log("Saved user data successfully");
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  const handleAddCategory = (name: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
    };
    setCategories([...categories, newCategory]);
  };

  const handleAddItem = (name: string, initialQuantity: number, categoryId: string) => {
    const newItem: Item = {
      id: Date.now().toString(),
      name,
      quantity: initialQuantity,
      categoryId,
      originalPrice: 0,
      salesPrice: 0,
    };
    setItems([...items, newItem]);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setItems(
      items.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
  };

  const setQuantity = (itemId: string, newQuantity: number) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(0, newQuantity) } : item
      )
    );
  };

  const handleLongPressStart = (
    itemId: string,
    itemName: string,
    currentQuantity: number,
    type: "plus" | "minus"
  ) => {
    const timerId = setTimeout(() => {
      setQuantityDialog({
        open: true,
        itemId,
        itemName,
        currentQuantity,
        mode: type === "plus" ? "add" : "subtract", // Set mode based on button
      });
    }, 500); // 500ms long press
    longPressTimers.current[`${itemId}-${type}`] = timerId;
  };

  const handleLongPressEnd = (itemId: string, type: "plus" | "minus") => {
    const timerId = longPressTimers.current[`${itemId}-${type}`];
    if (timerId) {
      clearTimeout(timerId);
      delete longPressTimers.current[`${itemId}-${type}`];
    }
  };

  const handleCategoryLongPressStart = (categoryId: string, categoryName: string) => {
    const timerId = setTimeout(() => {
      setDeleteDialog({
        open: true,
        type: "category",
        id: categoryId,
        name: categoryName,
      });
    }, 500);
    longPressTimers.current[`category-${categoryId}`] = timerId;
  };

  const handleCategoryLongPressEnd = (categoryId: string) => {
    const timerId = longPressTimers.current[`category-${categoryId}`];
    if (timerId) {
      clearTimeout(timerId);
      delete longPressTimers.current[`category-${categoryId}`];
    }
  };

  const handleItemLongPressStart = (itemId: string, itemName: string) => {
    const timerId = setTimeout(() => {
      setDeleteDialog({
        open: true,
        type: "item",
        id: itemId,
        name: itemName,
      });
    }, 500);
    longPressTimers.current[`item-${itemId}`] = timerId;
  };

  const handleItemLongPressEnd = (itemId: string) => {
    const timerId = longPressTimers.current[`item-${itemId}`];
    if (timerId) {
      clearTimeout(timerId);
      delete longPressTimers.current[`item-${itemId}`];
    }
  };

  const handleDelete = () => {
    if (deleteDialog.type === "category") {
      // Delete category and all items in it
      setCategories(categories.filter((c) => c.id !== deleteDialog.id));
      setItems(items.filter((i) => i.categoryId !== deleteDialog.id));
      if (selectedCategory === deleteDialog.id) {
        setSelectedCategory("all");
      }
    } else {
      // Delete item
      setItems(items.filter((i) => i.id !== deleteDialog.id));
    }
  };

  const handlePricingUpdate = (itemId: string, originalPrice: number, salesPrice: number) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, originalPrice, salesPrice } : item
      )
    );
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.categoryId === selectedCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentCategoryName =
    selectedCategory === "all"
      ? "All Items"
      : categories.find((c) => c.id === selectedCategory)?.name || "Items";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <img 
            src={logoImage} 
            alt="InvTrac Logo" 
            className="h-16 w-auto" 
            style={{ mixBlendMode: 'multiply' }}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHelp(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <CircleHelp className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={onLogout}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setShowAddCategory(true)}
            className="flex-shrink-0 px-4 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Category</span>
          </button>
          <button
            onClick={() => setSelectedCategory("all")}
            className={`flex-shrink-0 px-4 h-9 rounded-full transition-colors ${
              selectedCategory === "all"
                ? "bg-yellow-400 text-gray-900"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            <span className="text-sm">All</span>
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              onTouchStart={() =>
                handleCategoryLongPressStart(category.id, category.name)
              }
              onTouchEnd={() => handleCategoryLongPressEnd(category.id)}
              onMouseDown={() =>
                handleCategoryLongPressStart(category.id, category.name)
              }
              onMouseUp={() => handleCategoryLongPressEnd(category.id)}
              onMouseLeave={() => handleCategoryLongPressEnd(category.id)}
              className={`flex-shrink-0 px-4 h-9 rounded-full transition-colors ${
                selectedCategory === category.id
                  ? "bg-yellow-400 text-gray-900"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              <span className="text-sm">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {currentCategoryName}
          </h2>
          <Button
            onClick={() => setShowAddItem(true)}
            className="h-9 bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Item
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-white border-gray-200 rounded-xl"
          />
        </div>

        {/* Items List */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p>No items found</p>
              <p className="text-sm mt-1">Tap "+ Item" to add your first item</p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <div key={item.id}>
                <div className="flex items-center justify-between px-4 py-4">
                  <div className="flex items-center gap-2 flex-1">
                    <span
                      className="text-gray-900"
                      onTouchStart={() =>
                        handleItemLongPressStart(item.id, item.name)
                      }
                      onTouchEnd={() => handleItemLongPressEnd(item.id)}
                      onMouseDown={() =>
                        handleItemLongPressStart(item.id, item.name)
                      }
                      onMouseUp={() => handleItemLongPressEnd(item.id)}
                      onMouseLeave={() => handleItemLongPressEnd(item.id)}
                    >
                      {item.name}
                    </span>
                    <button
                      onClick={() =>
                        setPricingDialog({
                          open: true,
                          itemId: item.id,
                          itemName: item.name,
                          quantity: item.quantity,
                          originalPrice: item.originalPrice || 0,
                          salesPrice: item.salesPrice || 0,
                        })
                      }
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                      title="View pricing information"
                    >
                      <Info className="w-4 h-4 text-blue-500" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      onTouchStart={() =>
                        handleLongPressStart(
                          item.id,
                          item.name,
                          item.quantity,
                          "minus"
                        )
                      }
                      onTouchEnd={() => handleLongPressEnd(item.id, "minus")}
                      onMouseDown={() =>
                        handleLongPressStart(
                          item.id,
                          item.name,
                          item.quantity,
                          "minus"
                        )
                      }
                      onMouseUp={() => handleLongPressEnd(item.id, "minus")}
                      onMouseLeave={() => handleLongPressEnd(item.id, "minus")}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-700" />
                    </button>
                    <span className="w-10 text-center font-semibold text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      onTouchStart={() =>
                        handleLongPressStart(
                          item.id,
                          item.name,
                          item.quantity,
                          "plus"
                        )
                      }
                      onTouchEnd={() => handleLongPressEnd(item.id, "plus")}
                      onMouseDown={() =>
                        handleLongPressStart(
                          item.id,
                          item.name,
                          item.quantity,
                          "plus"
                        )
                      }
                      onMouseUp={() => handleLongPressEnd(item.id, "plus")}
                      onMouseLeave={() => handleLongPressEnd(item.id, "plus")}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                {index < filteredItems.length - 1 && (
                  <div className="h-px bg-gray-100 mx-4" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AddCategoryDialog
        open={showAddCategory}
        onOpenChange={setShowAddCategory}
        onAdd={handleAddCategory}
      />
      <AddItemDialog
        open={showAddItem}
        onOpenChange={setShowAddItem}
        categories={categories}
        selectedCategory={selectedCategory}
        onAdd={handleAddItem}
      />
      <QuantityInputDialog
        open={quantityDialog.open}
        onOpenChange={(open) =>
          setQuantityDialog({ ...quantityDialog, open })
        }
        itemName={quantityDialog.itemName}
        currentQuantity={quantityDialog.currentQuantity}
        mode={quantityDialog.mode}
        onUpdate={(newQuantity) => setQuantity(quantityDialog.itemId, newQuantity)}
      />
      <HelpDialog open={showHelp} onOpenChange={setShowHelp} />
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title={`Delete ${deleteDialog.type === "category" ? "Category" : "Item"}?`}
        description={
          deleteDialog.type === "category"
            ? `Are you sure you want to delete "${deleteDialog.name}" and all its items? This action cannot be undone.`
            : `Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone.`
        }
        onConfirm={handleDelete}
      />
      <PricingInfoDialog
        open={pricingDialog.open}
        onOpenChange={(open) => setPricingDialog({ ...pricingDialog, open })}
        itemName={pricingDialog.itemName}
        quantity={pricingDialog.quantity}
        originalPrice={pricingDialog.originalPrice}
        salesPrice={pricingDialog.salesPrice}
        onSave={(originalPrice, salesPrice) =>
          handlePricingUpdate(pricingDialog.itemId, originalPrice, salesPrice)
        }
      />
    </div>
  );
}