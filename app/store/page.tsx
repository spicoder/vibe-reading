"use client";

import { useState } from "react";
import {
  useMultiplayer,
  MarketListing,
  Order,
} from "@/app/lib/MultiplayerContext";
import { Store as StoreIcon, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { StarWallet } from "../components/StarWallet";
import { StoreModal } from "./components/StoreModal";
import { MarketTab } from "./components/MarketTab";
import { HandoversTab } from "./components/HandoversTab";
import { SellTab } from "./components/SellTab";

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
  const returnTo = useSearchParams().get("returnTo");

  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: "alert" | "confirm";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: "alert", title: "", message: "" });
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  if (!currentUser)
    return (
      <div className="p-8 text-center mt-20">
        Please log in to view the store.
      </div>
    );

  const handleBuy = (listing: MarketListing) => {
    setModal({
      isOpen: true,
      type: "confirm",
      title: "Confirm Purchase",
      message: `Spend ${listing.price} stars for ${listing.itemName}?`,
      onConfirm: async () => {
        closeModal();
        try {
          await buyItem(listing);
          setActiveTab("handovers");
          setModal({
            isOpen: true,
            type: "alert",
            title: "Success!",
            message: "Check Handovers to coordinate pickup.",
          });
        } catch (e: any) {
          setModal({
            isOpen: true,
            type: "alert",
            title: "Error",
            message: e.message,
          });
        }
      },
    });
  };

  const handleHandover = (order: Order) =>
    setModal({
      isOpen: true,
      type: "confirm",
      title: "Complete Handover",
      message: "Did you give the item to the buyer?",
      onConfirm: () => {
        completeHandover(order);
        closeModal();
      },
    });

  const handleCancel = (order: Order) =>
    setModal({
      isOpen: true,
      type: "confirm",
      title: "Cancel Order",
      message: "Cancel and refund the buyer?",
      onConfirm: () => {
        cancelAndRefundOrder(order);
        closeModal();
      },
    });

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24 text-stone-900 pt-20 px-4">
      <StoreModal modal={modal} closeModal={closeModal} />

      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() =>
              router.push(returnTo ? decodeURIComponent(returnTo) : "/")
            }
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

        <div className="flex bg-stone-200 rounded-lg p-1 mb-6">
          {["market", "handovers", "sell"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition capitalize ${activeTab === tab ? "bg-white shadow" : "text-stone-500"}`}
            >
              {tab === "sell" ? "Sell Item" : tab}
            </button>
          ))}
        </div>

        {activeTab === "market" && (
          <MarketTab
            listings={activeListings}
            currentUser={currentUser}
            onBuy={handleBuy}
          />
        )}
        {activeTab === "handovers" && (
          <HandoversTab
            orders={myOrders}
            listings={activeListings}
            currentUser={currentUser}
            onHandover={handleHandover}
            onCancel={handleCancel}
          />
        )}
        {activeTab === "sell" && (
          <SellTab
            onSubmit={(item) => {
              createListing(
                item.name,
                item.desc,
                item.instructions,
                item.price,
              );
              setActiveTab("market");
              setModal({
                isOpen: true,
                type: "alert",
                title: "Success!",
                message: "Item listed successfully!",
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
