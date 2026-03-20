"use client";

import { useState } from "react";
import {
  useMultiplayer,
  MarketListing,
  Order,
} from "@/app/lib/MultiplayerContext";
import {
  Star,
  Package,
  CheckCircle,
  XCircle,
  Store as StoreIcon,
  ArrowLeft,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { StarWallet } from "../components/StarWallet";

export default function StorePage() {
  const {
    currentUser,
    activeListings,
    myOrders,
    createListing,
    buyItem,
    completeHandover,
    cancelAndRefundOrder,
  } = useMultiplayer();
  const [activeTab, setActiveTab] = useState<"market" | "sell" | "handovers">(
    "market",
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  // New Listing Form State
  const [newItem, setNewItem] = useState({
    name: "",
    desc: "",
    instructions: "",
    price: 10,
  });

  // NEW: Custom Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: "alert" | "confirm";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: "alert", title: "", message: "" });

  const showAlert = (title: string, message: string) =>
    setModal({ isOpen: true, type: "alert", title, message });
  const showConfirm = (title: string, message: string, onConfirm: () => void) =>
    setModal({ isOpen: true, type: "confirm", title, message, onConfirm });
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  if (!currentUser)
    return (
      <div className="p-8 text-center mt-20">
        Please log in to view the store.
      </div>
    );

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    await createListing(
      newItem.name,
      newItem.desc,
      newItem.instructions,
      newItem.price,
    );
    setNewItem({ name: "", desc: "", instructions: "", price: 10 });
    setActiveTab("market");
    showAlert("Success!", "Item listed successfully on the market!");
  };

  const handleBuy = (listing: MarketListing) => {
    showConfirm(
      "Confirm Purchase",
      `Are you sure you want to spend ${listing.price} stars to buy ${listing.itemName}?`,
      async () => {
        try {
          closeModal(); // Close confirm modal immediately
          await buyItem(listing);
          showAlert(
            "Purchase successful!",
            "Check your Handovers tab to coordinate the pickup.",
          );
          setActiveTab("handovers");
        } catch (e: any) {
          showAlert("Error", e.message);
        }
      },
    );
  };

  const handleHandover = (order: any) => {
    showConfirm(
      "Complete Handover",
      "Did you give the item to the buyer? This cannot be undone.",
      () => {
        completeHandover(order);
        closeModal();
      },
    );
  };

  const handleCancel = (order: any) => {
    showConfirm(
      "Cancel Order",
      "Are you sure you want to cancel? The buyer will be refunded.",
      () => {
        cancelAndRefundOrder(order);
        closeModal();
      },
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24 text-stone-900 pt-20 px-4">
      {/* --- CUSTOM MODAL UI --- */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold font-serif mb-2">{modal.title}</h3>
            <p className="text-stone-600 mb-6 leading-relaxed">
              {modal.message}
            </p>
            <div className="flex gap-3 justify-end">
              {modal.type === "confirm" && (
                <button
                  onClick={closeModal}
                  className="px-4 py-2 font-bold text-stone-500 hover:bg-stone-100 rounded-lg transition"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={
                  modal.type === "confirm" ? modal.onConfirm : closeModal
                }
                className="px-6 py-2 font-bold bg-amber-500 text-black hover:bg-amber-400 rounded-lg transition"
              >
                {modal.type === "confirm" ? "Confirm" : "Okay"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => {
              if (returnTo) {
                router.push(decodeURIComponent(returnTo));
              } else {
                router.push("/");
              }
            }}
            className="p-2 bg-white border border-stone-200 rounded-full text-stone-600 hover:bg-stone-100 transition-colors shadow-sm"
          >
            <ArrowLeft size={24} />
          </button>
          <StoreIcon size={32} className="text-amber-500" />
          <h1 className="text-xl font-serif font-bold">Rewards Market</h1>
          <div className="ml-auto">
            <StarWallet />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-stone-200 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab("market")}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition ${activeTab === "market" ? "bg-white shadow" : "text-stone-500"}`}
          >
            Market
          </button>
          <button
            onClick={() => setActiveTab("handovers")}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition ${activeTab === "handovers" ? "bg-white shadow" : "text-stone-500"}`}
          >
            Handovers
          </button>
          <button
            onClick={() => setActiveTab("sell")}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition ${activeTab === "sell" ? "bg-white shadow" : "text-stone-500"}`}
          >
            Sell Item
          </button>
        </div>

        {/* TAB 1: THE MARKET */}
        {activeTab === "market" && (
          <div className="space-y-4">
            {activeListings.filter((l: MarketListing) => l.status === "active")
              .length === 0 && (
              <p className="text-center text-stone-500 py-10 border-2 border-dashed border-stone-300 rounded-xl">
                The market is empty. Be the first to list a reward!
              </p>
            )}
            {activeListings
              .filter((l: MarketListing) => l.status === "active")
              .map((listing: MarketListing) => (
                <div
                  key={listing.id}
                  className="bg-white p-5 rounded-xl shadow-sm border border-stone-200 flex flex-col gap-3 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start z-10">
                    <div>
                      <h3 className="font-bold text-lg">{listing.itemName}</h3>
                      <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider font-bold">
                        Sold by {listing.sellerName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-100 px-3 py-1 rounded-full text-amber-700 font-bold shrink-0">
                      <Star
                        size={16}
                        className="fill-amber-500 text-amber-500"
                      />
                      {listing.price}
                    </div>
                  </div>
                  <p className="text-stone-700 text-sm bg-stone-50 p-3 rounded-lg border border-stone-100 z-10">
                    {listing.description}
                  </p>

                  {currentUser.id !== listing.sellerId ? (
                    <button
                      onClick={() => handleBuy(listing)}
                      disabled={currentUser.stars < listing.price}
                      className="mt-2 w-full bg-stone-900 text-white font-bold py-3 rounded-lg disabled:opacity-50 hover:bg-stone-800 transition z-10"
                    >
                      {currentUser.stars < listing.price
                        ? "Not Enough Stars"
                        : "Buy with Stars"}
                    </button>
                  ) : (
                    <div className="mt-2 text-center text-xs font-bold text-amber-600 uppercase tracking-widest py-3 border-t border-amber-100 z-10">
                      This is your listing
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* TAB 2: HANDOVERS */}
        {activeTab === "handovers" && (
          <div className="space-y-4">
            {myOrders.filter((o: Order) => o.status === "pending_handover")
              .length === 0 && (
              <p className="text-center text-stone-500 py-10">
                You have no pending handovers.
              </p>
            )}
            {myOrders
              .filter((o: Order) => o.status === "pending_handover")
              .map((order: Order) => {
                const amSeller = order.sellerId === currentUser.id;
                const listing = activeListings.find(
                  (l: MarketListing) => l.id === order.listingId,
                );

                return (
                  <div
                    key={order.id}
                    className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden"
                  >
                    <div
                      className={`absolute top-0 left-0 w-1.5 h-full ${amSeller ? "bg-amber-400" : "bg-blue-400"}`}
                    ></div>
                    <div
                      className={`flex items-center gap-2 font-bold mb-3 text-sm uppercase tracking-wider ${amSeller ? "text-amber-600" : "text-blue-600"}`}
                    >
                      <Package size={18} />
                      {amSeller
                        ? "You must hand this over"
                        : "Waiting for pickup"}
                    </div>

                    <h3 className="font-bold text-xl">{order.itemName}</h3>
                    <p className="text-sm text-stone-600 mb-4">
                      {amSeller ? `Bought by: ` : `Seller: `}
                      <span className="font-bold text-stone-900">
                        {amSeller
                          ? order.buyerName
                          : listing?.sellerName || "Unknown"}
                      </span>
                    </p>

                    <div className="bg-stone-50 p-4 rounded-lg text-sm border border-stone-100 mb-4">
                      <span className="font-bold text-stone-400 uppercase tracking-wider text-xs block mb-2">
                        Instructions
                      </span>
                      <p className="text-stone-700">
                        {listing?.redemptionInstructions ||
                          "Check with the seller!"}
                      </p>
                    </div>

                    {amSeller && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleHandover(order)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
                        >
                          <CheckCircle size={18} /> Given to Buyer
                        </button>
                        <button
                          onClick={() => handleCancel(order)}
                          className="px-5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg transition"
                          title="Cancel and Refund"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* TAB 3: SELL ITEM */}
        {activeTab === "sell" && (
          <form
            onSubmit={handleCreateListing}
            className="space-y-4 bg-white p-6 rounded-xl border border-stone-200 shadow-sm"
          >
            {/* ... (Keep your existing sell form inputs the exact same) ... */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">
                What are you offering?
              </label>
              <input
                required
                type="text"
                placeholder="e.g., Free Coffee, High-Five"
                className="w-full border border-stone-300 rounded-lg p-3"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">
                Price (Stars to Burn)
              </label>
              <input
                required
                type="number"
                min="1"
                className="w-full border border-stone-300 rounded-lg p-3 font-mono text-lg"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">
                Description
              </label>
              <textarea
                required
                placeholder="Details about the item..."
                className="w-full border border-stone-300 rounded-lg p-3 h-24"
                value={newItem.desc}
                onChange={(e) =>
                  setNewItem({ ...newItem, desc: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">
                How will they get it?
              </label>
              <textarea
                required
                placeholder="e.g., I will bring it to church on Sunday."
                className="w-full border border-stone-300 rounded-lg p-3 h-20"
                value={newItem.instructions}
                onChange={(e) =>
                  setNewItem({ ...newItem, instructions: e.target.value })
                }
              />
            </div>
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 rounded-xl text-lg transition"
            >
              List on Market
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
