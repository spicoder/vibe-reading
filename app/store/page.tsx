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
    alert("Item listed successfully!");
  };

  const handleBuy = async (listing: MarketListing) => {
    if (confirm(`Spend ${listing.price} stars to buy ${listing.itemName}?`)) {
      try {
        await buyItem(listing);
        alert(
          "Purchase successful! Check your Handovers tab to coordinate pickup.",
        );
        setActiveTab("handovers");
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24 text-stone-900 pt-10 px-4">
      <header className="flex items-center gap-3 mb-6">
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
      </header>

      <header className="max-w-md mx-auto">
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
                  className="bg-white p-5 rounded-xl shadow-sm border border-stone-200 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{listing.itemName}</h3>
                      <p className="text-sm text-stone-500">
                        Listed by {listing.sellerName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-100 px-3 py-1 rounded-full text-amber-700 font-bold">
                      <Star
                        size={16}
                        className="fill-amber-500 text-amber-500"
                      />
                      {listing.price}
                    </div>
                  </div>
                  <p className="text-stone-700 text-sm bg-stone-50 p-3 rounded-lg">
                    {listing.description}
                  </p>

                  {currentUser.id !== listing.sellerId ? (
                    <button
                      onClick={() => handleBuy(listing)}
                      disabled={currentUser.stars < listing.price}
                      className="mt-2 w-full bg-stone-900 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-800 transition"
                    >
                      {currentUser.stars < listing.price
                        ? "Not Enough Stars"
                        : "Buy with Stars"}
                    </button>
                  ) : (
                    <div className="mt-2 text-center text-sm font-bold text-amber-600 bg-amber-50 py-2 rounded-lg">
                      This is your item
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* TAB 2: HANDOVERS (PENDING ORDERS) */}
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
                    className="bg-amber-50 p-5 rounded-xl border border-amber-200 shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-amber-400"></div>
                    <div className="flex items-center gap-2 text-amber-800 font-bold mb-2">
                      <Package size={20} />
                      {amSeller
                        ? "You need to hand this over!"
                        : "Waiting for pickup!"}
                    </div>

                    <h3 className="font-bold text-lg">{order.itemName}</h3>
                    <p className="text-sm text-stone-600 mb-4">
                      {amSeller
                        ? `Bought by: ${order.buyerName}`
                        : `Seller: ${listing?.sellerName || "Unknown"}`}
                    </p>

                    <div className="bg-white p-3 rounded-lg text-sm border border-amber-100 mb-4">
                      <span className="font-bold block mb-1">
                        Pickup Instructions:
                      </span>
                      {listing?.redemptionInstructions ||
                        "Check with the seller!"}
                    </div>

                    {amSeller && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => completeHandover(order)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={18} /> Given to Buyer
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Cancel order and refund buyer?"))
                              cancelAndRefundOrder(order);
                          }}
                          className="px-4 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg"
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
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">
                What are you offering?
              </label>
              <input
                required
                type="text"
                placeholder="e.g., Free Coffee, High-Five, Used Book"
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
                placeholder="e.g., I will use grab"
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
      </header>
    </div>
  );
}
